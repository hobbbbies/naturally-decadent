import type { Metadata } from "next";
import OrderForm from "./order-form";

export const metadata: Metadata = { title: "Preorder | Naturally Decadent" };

export default function OrderPage() {
  return <div className="simple-page">
    <header className="simple-header"><a className="simple-brand" href="/">Naturally Decadent</a><a href="/">← Back to cakes</a></header>
    <main className="form-shell" id="main">
      <h1>Preorder</h1>
      <p className="form-intro">Dairy-free recipes · Made without refined sugar<br/><strong>$5.50 CAD per 80 g slice</strong></p>
      <p className="field-help">Please complete all required fields.</p>
      <OrderForm />
    </main>
    <footer className="simple-footer"><span>Naturally Decadent · Guelph, Ontario</span><a href="mailto:stefankvitanov@gmail.com">Questions? Email us</a></footer>
  </div>;
}
