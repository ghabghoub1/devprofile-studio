import JSZip from "jszip";
import { markdown, type Profile } from "./profile";

export const MAX_BANNER_BYTES = 5 * 1024 * 1024;
const ALLOWED_BANNER_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

/** Returns a user-facing error, or null when the selected file is acceptable. */
export function validateBannerFile(file: Pick<File, "type" | "size">): string | null {
  if (!ALLOWED_BANNER_TYPES.has(file.type)) return "Please select a PNG, JPEG or WebP image.";
  if (file.size > MAX_BANNER_BYTES) return "The maximum image size is 5 MB.";
  return null;
}

/** Match the HTTPS image URL policy used by the Markdown renderer. */
export function isValidBannerUrl(value: string): boolean {
  return /^https:\/\/[\w.-]+(?:[/?#][^\s<>]*)?$/.test(value);
}

export function validateBannerExport(profile: Profile, uploadedBanner: File | null): string | null {
  if (!profile.banner.enabled) return null;
  if (profile.banner.source === "upload") {
    if (!uploadedBanner) return "Please choose a banner image before exporting.";
    return validateBannerFile(uploadedBanner);
  }
  if (!isValidBannerUrl(profile.banner.url)) return "Please enter a valid public HTTPS image URL.";
  return null;
}

/** Build the downloadable artifact; image conversion is supplied by the browser caller. */
export async function buildProfileExport(
  profile: Profile,
  uploadedBanner: File | null,
  normalizeImage: (file: File) => Promise<Blob>,
): Promise<{ blob: Blob; filename: string }> {
  const error = validateBannerExport(profile, uploadedBanner);
  if (error) throw new Error(error);

  const readme = markdown(profile);
  if (profile.banner.enabled && profile.banner.source === "upload" && uploadedBanner) {
    const zip = new JSZip();
    zip.file("README.md", readme);
    zip.file("assets/banner.png", await normalizeImage(uploadedBanner));
    return { blob: await zip.generateAsync({ type: "blob" }), filename: "github-profile.zip" };
  }
  return { blob: new Blob([readme], { type: "text/markdown;charset=utf-8" }), filename: "README.md" };
}
