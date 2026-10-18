"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CAKES, FLAVOURS, PICKUP_WINDOWS, PRICE_FEEDBACK, STORAGE, UNIT_PRICE_CENTS, money, type Flavour } from "@/lib/catalog";
import { createOrderSchema, validationErrors } from "@/lib/order-validation";

type Receipt = { reference:string; slices:number; totalCents:number };
const emptyQuantities = {chocolate:"0",lemon:"0",mango:"0",raspberry:"0"};

export default function OrderForm() {
  const [quantities,setQuantities]=useState<Record<Flavour,string>>(emptyQuantities);
  const [date,setDate]=useState("");
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const [errors,setErrors]=useState<Record<string,string>>({});
  const [receipt,setReceipt]=useState<Receipt|null>(null);
  const requestKey=useRef("");
  const inFlight=useRef(false);
  const alertRef=useRef<HTMLDivElement>(null);
  const receiptRef=useRef<HTMLElement>(null);
  const total=FLAVOURS.reduce((sum,flavour)=>sum+(Number(quantities[flavour])||0),0);
  useEffect(()=>{const now=new Date();setDate(`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`);},[]);
  useEffect(()=>{if(receipt)receiptRef.current?.focus();},[receipt]);

  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();if(inFlight.current)return;
    const form=event.currentTarget;const data=new FormData(form);
    requestKey.current ||= crypto.randomUUID();
    const payload={customerName:String(data.get("customerName")||""),orderDate:date,...Object.fromEntries(FLAVOURS.map(flavour=>[flavour,quantities[flavour].trim()===""?Number.NaN:Number(quantities[flavour])])),pickupWindow:data.get("pickupWindow"),priceFeedback:data.get("priceFeedback")||null,requestKey:requestKey.current};
    const parsed=createOrderSchema.safeParse(payload);
    if(!parsed.success){setErrors(validationErrors(parsed.error));setMessage("Please check the highlighted fields.");requestAnimationFrame(()=>alertRef.current?.focus());return;}
    inFlight.current=true;setBusy(true);setMessage("");setErrors({});
    try {
      const response=await fetch("/api/preorders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(parsed.data)});
      const result=await response.json() as Receipt & {error?:string;fields?:Record<string,string>};
      if(!response.ok){setErrors(result.fields||{});throw new Error(result.error||"Your submission could not be saved. Please try again.");}
      setReceipt(result);
    } catch(error){setMessage(error instanceof Error?error.message:"Your submission could not be confirmed. Please try again.");requestAnimationFrame(()=>alertRef.current?.focus());}
    finally{inFlight.current=false;setBusy(false);}
  }

  if(receipt)return <section className="receipt" ref={receiptRef} tabIndex={-1} aria-labelledby="receipt-title">
    <span className="receipt-check" aria-hidden="true">✓</span><h2 id="receipt-title">Your mock preorder is saved.</h2>
    <p>Thank you for helping evaluate this proposed product.</p><dl><div><dt>Reference</dt><dd>{receipt.reference}</dd></div><div><dt>Cake slices</dt><dd>{receipt.slices}</dd></div><div><dt>Hypothetical total</dt><dd>{money(receipt.totalCents)} CAD</dd></div></dl>
    <p>No payment is due. No cakes or pickup appointments are reserved.</p><a className="primary-button" href="/">Back to our cakes</a>
  </section>;

  return <form onSubmit={submit} noValidate={false} className="preorder-form">
    <noscript><p className="form-error">Please enable JavaScript to submit this form.</p></noscript>
    {message&&<div className="form-error" role="alert" tabIndex={-1} ref={alertRef}>{message}{Object.keys(errors).length>0&&<ul>{Object.entries(errors).map(([field,error])=><li key={field}><a href={`#${field==="quantities"?"cake-slices":field}`}>{error}</a></li>)}</ul>}</div>}
    <fieldset disabled={busy} className="form-fields">
      <legend className="visually-hidden">Mock preorder details</legend>
      <div className="customer-fields"><label htmlFor="customerName">Customer name <input id="customerName" name="customerName" autoComplete="name" required maxLength={100} aria-invalid={Boolean(errors.customerName)} /></label><label htmlFor="orderDate">Date <input id="orderDate" name="orderDate" type="date" min="2000-01-01" max="2100-12-31" value={date} onChange={event=>setDate(event.target.value)} required aria-invalid={Boolean(errors.orderDate)} /></label></div>
      <section aria-labelledby="cake-slices"><h2 id="cake-slices">1. Choose your cake slices</h2><p className="field-help">Enter a quantity for each flavour, or 0 for none. Choose at least one slice.</p>
        <div className="order-cakes">{CAKES.map(cake=><div className="order-cake" key={cake.id}><div className="order-photo"><img src={`/assets/${cake.id}-placeholder.svg`} alt={`${cake.name} cake photo placeholder`} width={120} height={120}/><span>Photo placeholder</span></div><div className="order-cake-info"><h3>{cake.name}</h3><p>$5.50 CAD · 80 g</p>{cake.id==="lemon"&&<small>Contains honey; not vegan.</small>}</div><label className="quantity-label" htmlFor={cake.id}>Quantity<input id={cake.id} name={cake.id} type="number" min="0" max="99" step="1" inputMode="numeric" required value={quantities[cake.id]} onChange={event=>setQuantities({...quantities,[cake.id]:event.target.value})} aria-label={`${cake.name} quantity`} aria-invalid={Boolean(errors[cake.id]||errors.quantities)}/></label></div>)}</div>
        <p className="order-total" aria-live="polite"><span>{total} {total===1?"slice":"slices"}</span><strong>Hypothetical total: {money(total*UNIT_PRICE_CENTS)} CAD</strong></p>
        <details className="recipe-details"><summary>Ingredients & allergen information</summary><div>{CAKES.map(cake=><div key={cake.id}><h3>{cake.name}</h3><p>{cake.ingredients}</p><p><strong>Contains / key ingredients:</strong> {cake.allergens}</p></div>)}</div></details>
        <p className="storage-note"><strong>Storage:</strong> {STORAGE}</p>
      </section>
      <fieldset className="choice-section" id="pickupWindow"><legend>2. Your preferred pickup time</legend><p className="field-help">Hypothetical pickup: Guelph, Ontario (exact address TBD). If offered Monday–Sunday, choose one window.</p><div className="radio-grid">{PICKUP_WINDOWS.map(window=><label key={window.value}><input type="radio" name="pickupWindow" value={window.value} required aria-invalid={Boolean(errors.pickupWindow)}/><span>{window.label}</span></label>)}</div></fieldset>
      <fieldset className="choice-section" id="priceFeedback"><legend>3. Your thoughts on the price <span className="optional">Optional</span></legend><p className="field-help">How do you feel about the proposed price?</p><div className="feedback-options">{PRICE_FEEDBACK.map(value=><label key={value}><input type="radio" name="priceFeedback" value={value}/><span>{value}</span></label>)}<label><input type="radio" name="priceFeedback" value="" defaultChecked/><span>No response</span></label></div></fieldset>
      <div className="submit-area"><button className="primary-button" type="submit" disabled={busy}>{busy?"Saving your preorder…":"Submit mock preorder"}</button><p>Your response is saved for the venture experiment.<br/>No payment or pickup will take place.</p></div>
    </fieldset>
  </form>;
}
