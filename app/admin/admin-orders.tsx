"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import type { Preorder } from "@/db/schema";
import { CAKES, FLAVOURS, PICKUP_WINDOWS, PRICE_FEEDBACK, money } from "@/lib/catalog";

type Row=Omit<Preorder,"requestKey">;
type Listing={rows:Row[];total:number;page:number;pageSize:number};

export default function AdminOrders(){
  const [listing,setListing]=useState<Listing>({rows:[],total:0,page:1,pageSize:25});
  const [page,setPage]=useState(1);const [loading,setLoading]=useState(true);const [error,setError]=useState("");const [notice,setNotice]=useState("");
  const [editing,setEditing]=useState<Row|null>(null);const [saving,setSaving]=useState(false);const [saveError,setSaveError]=useState("");
  const editor=useRef<HTMLElement>(null);
  const load=useCallback(async()=>{setLoading(true);setError("");try{const response=await fetch(`/api/admin/preorders?page=${page}`,{cache:"no-store"});const result=await response.json() as Listing & {error?:string};if(!response.ok)throw new Error(result.error);setListing(result);}catch(error){setError(error instanceof Error?error.message:"Could not load preorders.");}finally{setLoading(false);}},[page]);
  useEffect(()=>{void load();},[load]);
  useEffect(()=>{if(editing){editor.current?.focus();editor.current?.scrollIntoView({block:"start",behavior:"smooth"});}},[editing?.id]);

  async function save(event:FormEvent<HTMLFormElement>){
    event.preventDefault();if(!editing||saving)return;
    const form=new FormData(event.currentTarget);setSaving(true);setSaveError("");
    const payload={customerName:String(form.get("customerName")||""),orderDate:String(form.get("orderDate")||""),...Object.fromEntries(FLAVOURS.map(flavour=>[flavour,Number(form.get(flavour))])),pickupWindow:String(form.get("pickupWindow")||""),priceFeedback:form.get("priceFeedback")||null,version:editing.version};
    try{const response=await fetch(`/api/admin/preorders/${editing.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});const result=await response.json() as {error?:string;fields?:Record<string,string>};if(!response.ok)throw new Error([result.error,...Object.values(result.fields||{})].join(" "));setNotice(`Saved changes to ${editing.reference}.`);setEditing(null);await load();}catch(error){setSaveError(error instanceof Error?error.message:"Could not save changes.");}finally{setSaving(false);}
  }

  return <>
    <div className="admin-toolbar"><p>{listing.total} {listing.total===1?"response":"responses"}</p><div><button type="button" className="secondary-button" disabled={loading} onClick={()=>void load()}>Refresh list</button><a className="primary-button" href="/api/admin/preorders/export">Export CSV</a></div></div>
    <p className="admin-status" role="status">{notice}</p>
    {error&&<p className="form-error" role="alert">{error}</p>}
    {loading?<p role="status">Loading preorders…</p>:listing.rows.length===0?<p className="empty-state">No mock preorders yet. Submissions will appear here.</p>:<div className="table-scroll"><table className="orders-table"><caption className="visually-hidden">Saved mock preorders</caption><thead><tr><th>Reference / submitted</th><th>Customer / date</th><th>Quantities</th><th>Pickup</th><th>Price feedback</th><th>Total</th><th><span className="visually-hidden">Actions</span></th></tr></thead><tbody>{listing.rows.map(row=><tr key={row.id}><td><strong>{row.reference}</strong><small>{new Date(row.createdAt).toLocaleString("en-CA")}</small></td><td>{row.customerName}<small>{row.orderDate}</small></td><td>{CAKES.map(cake=>row[cake.id]>0?<span className="quantity-line" key={cake.id}>{cake.name}: {row[cake.id]}</span>:null)}</td><td>{PICKUP_WINDOWS.find(window=>window.value===row.pickupWindow)?.label}</td><td>{row.priceFeedback||"—"}</td><td>{money(FLAVOURS.reduce((sum,flavour)=>sum+row[flavour],0)*row.unitPriceCents)} CAD</td><td><button className="secondary-button" type="button" onClick={()=>{setSaveError("");setEditing(row);}}>Edit<span className="visually-hidden"> {row.reference}</span></button></td></tr>)}</tbody></table></div>}
    {listing.total>listing.pageSize&&<div className="pagination"><button className="secondary-button" disabled={loading||page<=1} onClick={()=>setPage(page-1)}>Previous</button><span>Page {page} of {Math.ceil(listing.total/listing.pageSize)}</span><button className="secondary-button" disabled={loading||page*listing.pageSize>=listing.total} onClick={()=>setPage(page+1)}>Next</button></div>}
    {editing&&<section key={editing.id} className="editor-panel" ref={editor} tabIndex={-1} aria-labelledby="editor-title"><h2 id="editor-title">Edit {editing.reference}</h2><p className="field-help">Edits update the saved response. The original submission time is preserved.</p>{saveError&&<p className="form-error" role="alert">{saveError}</p>}<form onSubmit={save}><fieldset disabled={saving} className="form-fields"><legend className="visually-hidden">Edit preorder details</legend><div className="customer-fields"><label>Customer name<input name="customerName" defaultValue={editing.customerName} required maxLength={100}/></label><label>Date<input name="orderDate" type="date" defaultValue={editing.orderDate} required min="2000-01-01" max="2100-12-31"/></label></div><div className="admin-quantities">{CAKES.map(cake=><label key={cake.id}>{cake.name}<input name={cake.id} type="number" min="0" max="99" step="1" required defaultValue={editing[cake.id]}/></label>)}</div><div className="customer-fields"><label>Pickup window<select name="pickupWindow" defaultValue={editing.pickupWindow} required>{PICKUP_WINDOWS.map(window=><option key={window.value} value={window.value}>{window.label}</option>)}</select></label><label>Price feedback<select name="priceFeedback" defaultValue={editing.priceFeedback||""}><option value="">No response</option>{PRICE_FEEDBACK.map(value=><option key={value}>{value}</option>)}</select></label></div><div className="editor-actions"><button className="primary-button" type="submit">{saving?"Saving…":"Save changes"}</button><button className="secondary-button" type="button" onClick={()=>setEditing(null)}>Cancel</button></div></fieldset></form></section>}
  </>;
}
