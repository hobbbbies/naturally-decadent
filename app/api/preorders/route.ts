import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { preorders } from "@/db/schema";
import { createOrderSchema, validationErrors } from "@/lib/order-validation";
import { json, readMutation } from "@/lib/http";
import { UNIT_PRICE_CENTS } from "@/lib/catalog";

export async function POST(request: Request) {
  const body = await readMutation(request);
  if(body.error) return body.error;
  const parsed = createOrderSchema.safeParse(body.data);
  if(!parsed.success) return json({error:"Please check the highlighted fields.", fields:validationErrors(parsed.error)},422);
  const {requestKey,...fields}=parsed.data;
  try {
    const db=getDb();const now=new Date().toISOString();const id=crypto.randomUUID();
    const created=await db.insert(preorders).values({id,reference:`ND-${id.replaceAll("-","").slice(0,12).toUpperCase()}`,requestKey,...fields,unitPriceCents:UNIT_PRICE_CENTS,createdAt:now,updatedAt:now}).onConflictDoNothing({target:preorders.requestKey}).returning().get();
    const saved=created || await db.select().from(preorders).where(eq(preorders.requestKey,requestKey)).get();
    if(!saved) throw new Error("Unable to read saved preorder");
    if(!Object.entries(fields).every(([key,value])=>saved[key as keyof typeof saved]===value)) return json({error:"This submission was already saved with different details. Refresh the page to start a new mock preorder."},409);
    const slices=saved.chocolate+saved.lemon+saved.mango+saved.raspberry;
    return json({reference:saved.reference,slices,totalCents:slices*saved.unitPriceCents},created?201:200);
  } catch(error) {
    console.error("Preorder save failed", error instanceof Error ? error.name : "UnknownError");
    return json({error:"We couldn’t confirm your submission. Your form is still here; please try again."},503);
  }
}
