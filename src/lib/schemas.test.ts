import { describe, it, expect } from "vitest";
import { CreateInvoiceSchema, CreateBudgetSchema } from "./schemas";

describe("schemas", () => {
  it("rejects invalid invoice", () => {
    const parsed = CreateInvoiceSchema.safeParse({ clientName: "", items: [] });
    expect(parsed.success).toBe(false);
  });
  it("accepts valid budget", () => {
    const parsed = CreateBudgetSchema.safeParse({
      name: "Marketing",
      limit: 5000,
      period: "monthly",
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000),
    });
    expect(parsed.success).toBe(true);
  });
});
