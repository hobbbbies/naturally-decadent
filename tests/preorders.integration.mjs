import assert from 'node:assert/strict';

export async function runIntegration(base='http://127.0.0.1:5173') {
  assert.ok(['127.0.0.1','localhost'].includes(new URL(base).hostname),'Tests may only write to a local database.');
  const checks=[];
  const jsonHeaders={'Content-Type':'application/json',Origin:base};
  async function send(path,body,extra={}) {return fetch(base+path,{method:'POST',headers:jsonHeaders,body:JSON.stringify(body),...extra});}
  const valid={customerName:`QA preorder ${Date.now()}`,orderDate:'2026-10-18',chocolate:2,lemon:0,mango:1,raspberry:0,pickupWindow:'11-13',priceAcknowledged:true,requestKey:crypto.randomUUID()};
  for(const path of ['/api/admin/preorders','/api/admin/preorders/export'])assert.equal((await fetch(base+path)).status,403);
  assert.equal((await send('/api/admin/preorders/missing',{}, {method:'PATCH'})).status,403);
  assert.equal((await send('/api/admin/preorders/missing',{version:1}, {method:'DELETE'})).status,403);
  checks.push('Admin reads, exports, edits and deletion reject anonymous requests');
  assert.equal((await send('/api/preorders',valid,{headers:{...jsonHeaders,Origin:'https://example.invalid'}})).status,403);
  assert.equal((await send('/api/preorders',valid,{headers:{'Content-Type':'application/json'}})).status,403);
  assert.equal((await send('/api/preorders',{...valid,customerName:'x'.repeat(9000)})).status,413);
  const invalid=[{chocolate:-1},{chocolate:1.5},{chocolate:'1'},{chocolate:100},{chocolate:0,mango:0},{customerName:'   '},{orderDate:'2026-02-30'},{pickupWindow:'invalid'},{pickupWindow:''},{pickupWindow:null},{priceAcknowledged:false},{priceAcknowledged:null},{priceFeedback:'bad'},{unitPriceCents:1},{priceAcknowledgement:true}];
  for(const patch of invalid)assert.equal((await send('/api/preorders',{...valid,...patch})).status,422,JSON.stringify(patch));
  checks.push('Reject invalid dates, quantities, empty names, forged prices, missing acknowledgement or pickup, unknown fields and cross-origin/oversized requests');
  const submitted=await send('/api/preorders',valid);assert.equal(submitted.status,201);const receipt=await submitted.json();
  assert.equal(receipt.totalCents,1650);assert.equal(receipt.slices,3);assert.match(receipt.reference,/^ND-[A-F0-9]{12}$/);
  assert.deepEqual(Object.keys(receipt).sort(),['reference','slices','totalCents']);
  const retry=await send('/api/preorders',valid);assert.equal(retry.status,200);assert.equal((await retry.json()).reference,receipt.reference);
  assert.equal((await send('/api/preorders',{...valid,chocolate:4})).status,409);
  checks.push('Save without optional feedback, calculate total on server, and safely retry one submission');
  const racing={...valid,requestKey:crypto.randomUUID(),customerName:'QA simultaneous retry'};
  const duplicates=await Promise.all([send('/api/preorders',racing),send('/api/preorders',racing)]);
  assert.deepEqual(duplicates.map(response=>response.status).sort(),[200,201]);
  const duplicateBodies=await Promise.all(duplicates.map(response=>response.json()));assert.equal(duplicateBodies[0].reference,duplicateBodies[1].reference);
  checks.push('Concurrent retries create one database row');
  assert.equal((await send('/api/admin/login',{password:'incorrect'})).status,401);
  assert.equal((await send('/api/admin/login',{password:'12345'},{headers:{...jsonHeaders,Origin:'https://example.invalid'}})).status,403);
  assert.equal((await fetch(base+'/api/admin/preorders',{headers:{Cookie:'nd_admin_session='+'0'.repeat(64)}})).status,403);
  assert.equal((await fetch(base+'/api/admin/preorders',{headers:{'oai-authenticated-user-id':'forged','oai-authenticated-user-email':'seedy@sites.test'}})).status,403);
  const login=await send('/api/admin/login',{password:process.env.ADMIN_TEST_PASSWORD||'12345'});
  assert.equal(login.status,200);
  const setCookie=login.headers.get('set-cookie');
  assert.ok(setCookie.includes('HttpOnly'));assert.ok(setCookie.includes('SameSite=Strict'));assert.ok(setCookie.includes('Max-Age=28800'));
  const cookie=setCookie.split(';')[0];assert.ok(cookie.startsWith('nd_admin_session='));
  checks.push('Password login rejects wrong passwords and forged sessions, then sets an HTTP-only session cookie');
  const adminHeaders={...jsonHeaders,Cookie:cookie};
  const list=await fetch(base+'/api/admin/preorders',{headers:{Cookie:cookie}});assert.equal(list.status,200);const listing=await list.json();
  const row=listing.rows.find(item=>item.reference===receipt.reference);assert.ok(row);assert.ok(!('requestKey' in row));assert.equal(row.priceFeedback,null);
  const update={...valid,customerName:'=HYPERLINK("https://example.invalid")',chocolate:1,mango:2,priceFeedback:'Reasonable',version:row.version};delete update.requestKey;delete update.priceAcknowledged;
  const edited=await send('/api/admin/preorders/'+row.id,update,{method:'PATCH',headers:adminHeaders});assert.equal(edited.status,200);const saved=(await edited.json()).row;
  assert.equal(saved.version,row.version+1);assert.equal(saved.customerName,update.customerName);assert.equal(saved.createdAt,row.createdAt);
  assert.equal((await send('/api/admin/preorders/'+row.id,update,{method:'PATCH',headers:adminHeaders})).status,409);
  assert.equal((await send('/api/admin/preorders/'+crypto.randomUUID(),update,{method:'PATCH',headers:adminHeaders})).status,404);
  assert.equal((await send('/api/admin/preorders/'+row.id,{...update,version:saved.version,chocolate:0,mango:0},{method:'PATCH',headers:adminHeaders})).status,422);
  checks.push('Authorized edits persist, retain submission time and reject stale overwrites');
  const csv=await fetch(base+'/api/admin/preorders/export',{headers:{Cookie:cookie}});assert.equal(csv.status,200);assert.ok(csv.headers.get('content-type').includes('text/csv'));const text=await csv.text();
  assert.ok(text.includes(receipt.reference));assert.ok(text.includes('"\'=HYPERLINK'));assert.ok(!text.includes(valid.requestKey));
  checks.push('CSV export contains saved records and escapes spreadsheet formulas');
  const reread=await fetch(base+'/api/admin/preorders',{headers:{Cookie:cookie}});const persisted=(await reread.json()).rows.find(item=>item.id===row.id);assert.equal(persisted.customerName,update.customerName);
  const deletePath='/api/admin/preorders/'+row.id;
  assert.equal((await send(deletePath,{version:saved.version},{method:'DELETE',headers:{...adminHeaders,Origin:'https://example.invalid'}})).status,403);
  assert.equal((await send(deletePath,{}, {method:'DELETE',headers:adminHeaders})).status,422);
  assert.equal((await send(deletePath,{version:row.version},{method:'DELETE',headers:adminHeaders})).status,409);
  const afterStale=await fetch(base+'/api/admin/preorders',{headers:{Cookie:cookie}});assert.ok((await afterStale.json()).rows.some(item=>item.id===row.id));
  assert.equal((await send(deletePath,{version:saved.version},{method:'DELETE',headers:adminHeaders})).status,200);
  assert.equal((await send(deletePath,{version:saved.version},{method:'DELETE',headers:adminHeaders})).status,404);
  const afterDelete=await fetch(base+'/api/admin/preorders',{headers:{Cookie:cookie}});assert.ok(!(await afterDelete.json()).rows.some(item=>item.id===row.id));
  const afterDeleteCsv=await fetch(base+'/api/admin/preorders/export',{headers:{Cookie:cookie}});assert.ok(!(await afterDeleteCsv.text()).includes(receipt.reference));
  checks.push('Deletion requires authorization and same-origin requests, rejects stale versions, and removes the record from the list and export');
  for(const blank of ['',null,undefined]) {
    const emptyPickup={...valid,requestKey:crypto.randomUUID(),pickupWindow:blank};
    assert.equal((await send('/api/preorders',emptyPickup)).status,422);
  }
  for(const acknowledgement of [false,null,undefined]) {
    assert.equal((await send('/api/preorders',{...valid,priceAcknowledged:acknowledgement})).status,422);
  }
  checks.push('New mock responses require one pickup window and explicit price acknowledgement');
  const logout=await send('/api/admin/logout',{}, {headers:adminHeaders});assert.equal(logout.status,200);assert.ok(logout.headers.get('set-cookie').includes('Max-Age=0'));
  assert.equal((await fetch(base+'/api/admin/preorders',{headers:{Cookie:cookie}})).status,403);
  assert.equal((await fetch(base+'/api/admin/preorders/export',{headers:{Cookie:cookie}})).status,403);
  checks.push('Logout revokes the session, including replay of the old cookie');
  const rateHeaders={...jsonHeaders,'cf-connecting-ip':`2001:db8::${Math.floor(Math.random()*65535).toString(16)}`};
  for(let i=0;i<10;i++)assert.equal((await send('/api/admin/login',{password:'incorrect'},{headers:rateHeaders})).status,401);
  const blocked=await send('/api/admin/login',{password:'incorrect'},{headers:rateHeaders});assert.equal(blocked.status,429);assert.ok(Number(blocked.headers.get('retry-after'))>0);
  checks.push('Repeated failed password attempts are rate limited');
  return {passed:checks.length,checks,reference:receipt.reference};
}

if(process.argv[1]?.endsWith('preorders.integration.mjs'))console.log(JSON.stringify(await runIntegration(process.env.SITE_TEST_URL),null,2));
