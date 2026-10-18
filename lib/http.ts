export function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
}

export async function readMutation(request: Request): Promise<{data: unknown; error?: never} | {error: Response; data?: never}> {
  const origin = request.headers.get("origin");
  if (origin !== new URL(request.url).origin || request.headers.get("sec-fetch-site") === "cross-site") {
    return {error: json({error: "Please submit using the form on this website."},403)};
  }
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return {error:json({error:"Send a JSON request."},415)};
  if (Number(request.headers.get("content-length") || 0) > 8192) return {error:json({error:"The submission is too large."},413)};
  if (!request.body) return {error:json({error:"The submission is empty."},400)};
  const reader=request.body.getReader();const parts:Uint8Array[]=[];let size=0;
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>8192){await reader.cancel();return {error:json({error:"The submission is too large."},413)};}parts.push(value);}
  const bytes=new Uint8Array(size);let offset=0;for(const part of parts){bytes.set(part,offset);offset+=part.length;}
  try{return {data:JSON.parse(new TextDecoder().decode(bytes))};}catch{return {error:json({error:"The submission could not be read."},400)};}
}
