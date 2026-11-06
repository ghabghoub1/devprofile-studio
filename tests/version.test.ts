import { describe, expect, it } from "vitest";
import { appVersion } from "../lib/version";
import pkg from "../package.json";

describe("app version", () => {
  it("matches the package version", () => {
    expect(appVersion).toBe(pkg.version);
  });
});
