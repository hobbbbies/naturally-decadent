import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { preorders } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import { json, readMutation } from "@/lib/http";
import { updateOrderSchema, validationErrors } from "@/lib/order-validation";
import { z } from "zod";

const deleteSchema = z.object({ version: z.number().int().min(1) }).strict();

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return json({ error: "Administrator access required." }, 403);
  const body = await readMutation(request);
  if (body.error) return body.error;
  const parsed = deleteSchema.safeParse(body.data);
  if (!parsed.success) return json({ error: "Reload the order list before deleting this preorder." }, 422);
  const { id } = await context.params;
  try {
    const db = getDb();
    const deleted = await db.delete(preorders)
      .where(and(eq(preorders.id, id), eq(preorders.version, parsed.data.version)))
      .returning({ id: preorders.id }).get();
    if (!deleted) {
      const existing = await db.select({ id: preorders.id }).from(preorders).where(eq(preorders.id, id)).get();
      return json({ error: existing ? "This preorder changed since you loaded it. Refresh the list before deleting it." : "Preorder not found." }, existing ? 409 : 404);
    }
    return json({ ok: true });
  } catch { return json({ error: "The preorder could not be deleted. Please try again." }, 503); }
}

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
