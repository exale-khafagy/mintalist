import { getAmountCents } from "../lib/paymob";

describe("getAmountCents", () => {
  it("returns correct amount for Gold monthly", () => {
    expect(getAmountCents("PAID_1", "MONTHLY")).toBe(10000);
  });

  it("returns correct amount for Gold annual", () => {
    expect(getAmountCents("PAID_1", "ANNUAL")).toBe(60000);
  });

  it("returns correct amount for Platinum monthly", () => {
    expect(getAmountCents("PAID_2", "MONTHLY")).toBe(15000);
  });

  it("returns correct amount for Platinum annual", () => {
    expect(getAmountCents("PAID_2", "ANNUAL")).toBe(90000);
  });
});