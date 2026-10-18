import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { preorders } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import { json, readMutation } from "@/lib/http";
import { updateOrderSchema, validationErrors } from "@/lib/order-validation";

export async function PATCH(request:Request,context:{params:Promise<{id:string}>}) {
  if(!await isAdmin())return json({error:"Administrator access required."},403);
  const body=await readMutation(request);if(body.error)return body.error;
  const parsed=updateOrderSchema.safeParse(body.data);
  if(!parsed.success)return json({error:"Please check the fields.",fields:validationErrors(parsed.error)},422);
  const {id}=await context.params;const {version,...fields}=parsed.data;
  try {
    const db=getDb();
    const updated=await db.update(preorders).set({...fields,version:version+1,updatedAt:new Date().toISOString()}).where(and(eq(preorders.id,id),eq(preorders.version,version))).returning().get();
    if(!updated){const existing=await db.select({id:preorders.id}).from(preorders).where(eq(preorders.id,id)).get();return json({error:existing?"This preorder changed since you opened it. Reload the list and try again.":"Preorder not found."},existing?409:404);}
    const {requestKey,...row}=updated;return json({row});
  }catch{return json({error:"The changes could not be saved. Please try again."},503);}
}
