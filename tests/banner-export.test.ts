import { describe, expect, it, vi } from "vitest";
import JSZip from "jszip";
import { initial, markdown, type Profile } from "../lib/profile";
import { buildProfileExport, isValidBannerUrl, MAX_BANNER_BYTES, validateBannerExport, validateBannerFile } from "../lib/banner-export";

const profile = (banner: Profile["banner"]): Profile => ({ ...initial, banner });
const uploaded = profile({ enabled: true, source: "upload", url: "", alt: "My banner" });
const urlBanner = profile({ enabled: true, source: "url", url: "https://example.com/banner.png", alt: "My banner" });
const fakeFile = (type: string, size: number) => ({ type, size }) as File;

describe("banner validation", () => {
  it("accepts PNG, JPEG and WebP at or below 5 MB", () => {
    for (const type of ["image/png", "image/jpeg", "image/webp"]) {
      expect(validateBannerFile(fakeFile(type, MAX_BANNER_BYTES))).toBeNull();
    }
  });
  it("rejects unsupported files and oversized images", () => {
    expect(validateBannerFile(fakeFile("image/svg+xml", 20))).toMatch(/PNG/);
    expect(validateBannerFile(fakeFile("image/png", MAX_BANNER_BYTES + 1))).toMatch(/5 MB/);
  });
  it("rejects invalid or non-HTTPS URLs", () => {
    for (const value of ["http://example.com/x.png", "javascript:alert(1)", "https://example.com/a b.png", ""]) {
      expect(isValidBannerUrl(value)).toBe(false);
      expect(validateBannerExport(profile({ ...urlBanner.banner, url: value }), null)).toMatch(/HTTPS/);
    }
    expect(validateBannerExport(urlBanner, null)).toBeNull();
  });
  it("requires an uploaded image only when an upload banner is enabled", () => {
    expect(validateBannerExport(uploaded, null)).toMatch(/choose a banner/);
    expect(validateBannerExport(profile({ ...uploaded.banner, enabled: false }), null)).toBeNull();
  });
});

describe("profile export", () => {
  it("exports a README with a public HTTPS banner", async () => {
    const convert = vi.fn();
    const result = await buildProfileExport(urlBanner, null, convert);
    expect(result.filename).toBe("README.md");
    expect(await result.blob.text()).toBe(markdown(urlBanner));
    expect(convert).not.toHaveBeenCalled();
  });
  it("exports an uploaded banner as a ZIP with README and PNG asset", async () => {
    const file = fakeFile("image/jpeg", 100);
    const png = new Blob([new Uint8Array([137, 80, 78, 71])], { type: "image/png" });
    const convert = vi.fn(async () => png);
    const result = await buildProfileExport(uploaded, file, convert);
    expect(result.filename).toBe("github-profile.zip");
    const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());
    expect(await zip.file("README.md")!.async("string")).toBe(markdown(uploaded));
    expect(markdown(uploaded)).toContain('src="./assets/banner.png"');
    expect(Array.from(await zip.file("assets/banner.png")!.async("uint8array"))).toEqual([137, 80, 78, 71]);
    expect(convert).toHaveBeenCalledWith(file);
  });
  it("rejects missing uploads without calling the converter", async () => {
    const convert = vi.fn();
    await expect(buildProfileExport(uploaded, null, convert)).rejects.toThrow(/choose a banner/);
    expect(convert).not.toHaveBeenCalled();
  });
  it("exports README without an asset when banner is disabled", async () => {
    const disabled = profile({ ...uploaded.banner, enabled: false });
    const result = await buildProfileExport(disabled, null, vi.fn());
    expect(result.filename).toBe("README.md");
    expect(await result.blob.text()).not.toContain("assets/banner.png");
  });
});
