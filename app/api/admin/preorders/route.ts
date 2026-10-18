import { desc, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { preorders } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import { json } from "@/lib/http";

export async function GET(request:Request) {
  if(!await isAdmin())return json({error:"Administrator access required."},403);
  const pageValue=new URL(request.url).searchParams.get("page") || "1";
  if(!/^\d+$/.test(pageValue)||Number(pageValue)<1||Number(pageValue)>10000)return json({error:"Invalid page."},400);
  const page=Number(pageValue);const pageSize=25;
  try {
    const db=getDb();const count=await db.select({total:sql<number>`count(*)`}).from(preorders).get();
    const rows=await db.select().from(preorders).orderBy(desc(preorders.createdAt),desc(preorders.id)).limit(pageSize).offset((page-1)*pageSize);
    return json({rows:rows.map(({requestKey,...row})=>row),total:count?.total||0,page,pageSize});
  } catch {return json({error:"Could not load mock preorders. Please try again."},503);}
}
