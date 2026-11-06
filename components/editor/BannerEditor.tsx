"use client";

import type { Dispatch, SetStateAction } from "react";
import { Upload, Link2 } from "lucide-react";
import type { Profile } from "../../lib/profile";

type BannerEditorProps = {
  profile: Profile;
  setProfile: Dispatch<SetStateAction<Profile>>;
  onBannerFile: (file?: File) => void;
  bannerError: string;
  bannerSrc: string;
};

export default function BannerEditor({
  profile,
  setProfile,
  onBannerFile,
  bannerError,
  bannerSrc,
}: BannerEditorProps) {
  return (
    <div className="sidebody">
      <h3>Profile banner</h3>
    
      <p className="hint">
        Add a personal banner at the top of your README. GitHub already
        displays your avatar in the profile sidebar.
      </p>
    
      <label className="bannercheck">
        <input
          type="checkbox"
          checked={profile.banner.enabled}
          onChange={(event) =>
            setProfile((old) => ({
              ...old,
              banner: {
                ...old.banner,
                enabled: event.target.checked,
              },
            }))
          }
        />
        Show banner
      </label>
    
      <div className="bannerchoices">
        <button
          className={profile.banner.source === "upload" ? "chosen" : ""}
          onClick={() =>
            setProfile((old) => ({
              ...old,
              banner: {
                ...old.banner,
                source: "upload",
              },
            }))
          }
        >
          <Upload size={15} />
          Upload
        </button>
    
        <button
          className={profile.banner.source === "url" ? "chosen" : ""}
          onClick={() =>
            setProfile((old) => ({
              ...old,
              banner: {
                ...old.banner,
                source: "url",
              },
            }))
          }
        >
          <Link2 size={15} />
          Image URL
        </button>
      </div>
    
      {profile.banner.source === "upload" ? (
        <>
          <label className="uploadbox">
            Choose PNG, JPG or WebP (max 5 MB)
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) =>
                onBannerFile(event.target.files?.[0])
              }
            />
          </label>
    
          <p className="hint">
            Uploaded images are stored only for this browser session.
            Export the ZIP before refreshing.
          </p>
        </>
      ) : (
        <label className="field">
          <span>Public HTTPS image URL</span>
    
          <input
            placeholder="https://example.com/banner.png"
            value={profile.banner.url}
            onChange={(event) =>
              setProfile((old) => ({
                ...old,
                banner: {
                  ...old.banner,
                  url: event.target.value,
                  enabled: true,
                },
              }))
            }
          />
        </label>
      )}
    
      <label className="field">
        <span>Accessible description</span>
    
        <input
          value={profile.banner.alt}
          onChange={(event) =>
            setProfile((old) => ({
              ...old,
              banner: {
                ...old.banner,
                alt: event.target.value,
              },
            }))
          }
        />
      </label>
    
      {bannerError && (
        <p role="alert" className="bannererror">
          {bannerError}
        </p>
      )}
    
      {bannerSrc && (
        <img
          className="bannerthumb"
          src={bannerSrc}
          alt={profile.banner.alt || "Banner preview"}
        />
      )}
    
      <button
        className="secondary"
        onClick={() =>
          setProfile((old) => ({
            ...old,
            banner: {
              ...old.banner,
              enabled: false,
            },
          }))
        }
      >
        Remove banner
      </button>
    
      <p className="hint">
        Uploaded banners are exported with README.md inside a ZIP. URL
        banners reference the public image directly.
      </p>
    </div>
  );
}
