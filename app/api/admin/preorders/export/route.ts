import { asc } from "drizzle-orm";
import { getDb } from "@/db";
import { preorders } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import { json } from "@/lib/http";
import { csvCell } from "@/lib/csv";
import { PICKUP_WINDOWS } from "@/lib/catalog";

export async function GET() {
  if(!await isAdmin())return json({error:"Administrator access required."},403);
  try {
    const rows=await getDb().select().from(preorders).orderBy(asc(preorders.createdAt),asc(preorders.id));
    const headings=["Reference","Customer name","Date","Chocolate","Lemon","Mango","Raspberry","Pickup window","Price feedback","Price per slice CAD","Total CAD","Submitted at UTC","Updated at UTC"];
    const lines=[headings,...rows.map(row=>[row.reference,row.customerName,row.orderDate,row.chocolate,row.lemon,row.mango,row.raspberry,PICKUP_WINDOWS.find(w=>w.value===row.pickupWindow)?.label||row.pickupWindow,row.priceFeedback,(row.unitPriceCents/100).toFixed(2),((row.chocolate+row.lemon+row.mango+row.raspberry)*row.unitPriceCents/100).toFixed(2),row.createdAt,row.updatedAt])];
    return new Response("\uFEFF"+lines.map(line=>line.map(csvCell).join(",")).join("\r\n"),{headers:{"Content-Type":"text/csv; charset=utf-8","Content-Disposition":"attachment; filename=naturally-decadent-preorders.csv","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
  }catch{return json({error:"The CSV could not be exported. Please try again."},503);}
}
