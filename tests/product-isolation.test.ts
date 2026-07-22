import { describe, expect, it } from "vitest";
import { PRODUCT } from "../src/scenario/olivia";

describe("Caretaker Relay app isolation", () => {
  it("product id is caretaker-relay not otzar", () => {
    expect(PRODUCT.id).toBe("caretaker-relay");
    expect(PRODUCT.name).toBe("Caretaker Relay");
    expect(PRODUCT.id).not.toMatch(/otzar/i);
  });
});
