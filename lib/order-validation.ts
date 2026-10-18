import { z } from "zod";

const quantity = z.number().int("Use a whole number.").min(0).max(99);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date.").refine((value) => {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value && value >= "2000-01-01" && value <= "2100-12-31";
}, "Enter a valid date.");

export const orderFields = z.object({
  customerName: z.string().trim().min(1, "Enter your name.").max(100, "Use no more than 100 characters.").refine(value => !/[\u0000-\u001f\u007f]/.test(value), "Enter a valid name."),
  orderDate: date,
  chocolate: quantity,
  lemon: quantity,
  mango: quantity,
  raspberry: quantity,
  pickupWindow: z.enum(["09-11", "11-13", "13-15", "15-17"], { message: "Choose a pickup window." }),
  priceFeedback: z.enum(["Good value", "Reasonable", "Too expensive"]).nullable().default(null),
});
const hasSlices = (data: {chocolate:number;lemon:number;mango:number;raspberry:number}) => data.chocolate + data.lemon + data.mango + data.raspberry > 0;
export const createOrderSchema = orderFields.extend({ requestKey: z.string().uuid() }).strict().refine(hasSlices, { message: "Choose at least one cake slice.", path: ["quantities"] });
export const updateOrderSchema = orderFields.extend({ version: z.number().int().min(1) }).strict().refine(hasSlices, { message: "Choose at least one cake slice.", path: ["quantities"] });
export type OrderFields = z.infer<typeof orderFields>;

export function validationErrors(error: z.ZodError): Record<string,string> {
  return Object.fromEntries(error.issues.map(issue => [String(issue.path[0] || "form"), issue.message]));
}
