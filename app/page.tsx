"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Copy,
  Download,
  Github,
  Layers3,
  Palette,
  RotateCcw,
  MoreHorizontal,
  Trash2,
  Sparkles,
  Image as ImageIcon,
  BookOpen,
  ExternalLink,
} from "lucide-react";

import {
  initial,
  markdown,
  normalizeProfile,
  type Profile,
  type Section,
} from "../lib/profile";

import { templates } from "../lib/templates";
import { appVersion } from "../lib/version";
import { buildProfileExport, isValidBannerUrl, validateBannerExport, validateBannerFile } from "../lib/banner-export";
import GitHubConnect from "../components/github/GitHubConnect";
import GitHubProfilePreview from "../components/github/GitHubProfilePreview";
import ReadmePreview from "../components/preview/ReadmePreview";
import ContentEditor from "../components/editor/ContentEditor";
import AppearanceEditor from "../components/editor/AppearanceEditor";
import TemplatesEditor from "../components/editor/TemplatesEditor";
import BannerEditor from "../components/editor/BannerEditor";
import PreviewControls, { type PreviewMode, type ProfileView } from "../components/preview/PreviewControls";
import type { GitHubUser } from "../lib/github";

type EditorTab = "content" | "design" | "templates" | "banner";
export default function Home() {
  const [p, setP] = useState<Profile>(initial);
  const [connectedGitHubUser, setConnectedGitHubUser] = useState<GitHubUser | null>(null);

  const [tab, setTab] = useState<EditorTab>("content");
  const [mode, setMode] = useState<PreviewMode>("preview");
  const [profileView, setProfileView] = useState<ProfileView>("readme");

  const [uploadedBanner, setUploadedBanner] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState("");
  const [bannerError, setBannerError] = useState("");

  const [copied, setCopied] = useState(false);
  const [ready, setReady] = useState(false);

  // --------------------------------------------------
  // LOCAL STORAGE
  // --------------------------------------------------

  useEffect(() => {
    try {
      const saved = localStorage.getItem("devprofile-v1");

      if (saved) {
        setP(normalizeProfile(JSON.parse(saved)));
      }
    } catch (error) {
      console.error("Failed to load saved profile:", error);
    }

    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;

    try {
      localStorage.setItem(
        "devprofile-v1",
        JSON.stringify({
          ...p,
          banner:
            p.banner.source === "upload"
              ? {
                  ...p.banner,
                  enabled: false,
                }
              : p.banner,
        }),
      );
    } catch (error) {
      console.error("Failed to save profile:", error);
    }
  }, [p, ready]);

  // --------------------------------------------------
  // PROFILE EDITOR HELPERS
  // --------------------------------------------------

  const change = (key: keyof Profile, value: string) => {
    setP((old) => ({
      ...old,
      [key]: value,
    }));
  };

  const move = (section: Section, delta: number) => {
    setP((old) => {
      const updated = [...old.sections];

      const index = updated.indexOf(section);
      const newIndex = index + delta;

      if (newIndex < 0 || newIndex >= updated.length) {
        return old;
      }

      [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];

      return {
        ...old,
        sections: updated,
      };
    });
  };

  const toggle = (section: Section) => {
    setP((old) => ({
      ...old,
      hidden: old.hidden.includes(section)
        ? old.hidden.filter((item) => item !== section)
        : [...old.hidden, section],
    }));
  };

  // --------------------------------------------------
  // CLIPBOARD
  // --------------------------------------------------

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(markdown(p));

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (error) {
      console.error("Unable to copy Markdown:", error);
    }
  };

  // --------------------------------------------------
  // FILE DOWNLOAD
  // --------------------------------------------------

  const saveBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = filename;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  };

  // --------------------------------------------------
  // BANNER IMAGE CONVERSION
  // --------------------------------------------------

  const normalizeBanner = async (file: File): Promise<Blob> => {
    const image = await createImageBitmap(file);

    try {
      const canvas = document.createElement("canvas");

      canvas.width = image.width;
      canvas.height = image.height;

      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Canvas unavailable");
      }

      context.drawImage(image, 0, 0);

      return await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Image conversion failed"));
          }
        }, "image/png");
      });
    } finally {
      image.close();
    }
  };

  // --------------------------------------------------
  // BANNER UPLOAD
  // --------------------------------------------------

  const onBannerFile = (file?: File) => {
    if (!file) return;

    setBannerError("");

    const validationError = validateBannerFile(file);
    if (validationError) {
      setBannerError(validationError);
      return;
    }

    try {
      const url = URL.createObjectURL(file);

      setBannerPreview((old) => {
        if (old) {
          URL.revokeObjectURL(old);
        }

        return url;
      });

      setUploadedBanner(file);

      setP((old) => ({
        ...old,
        banner: {
          ...old.banner,
          enabled: true,
          source: "upload",
        },
      }));
    } catch {
      setBannerError("Unable to load image.");
    }
  };

  // --------------------------------------------------
  // BANNER URL
  // --------------------------------------------------

  const bannerSrc = p.banner.enabled
    ? p.banner.source === "upload"
      ? bannerPreview
      : isValidBannerUrl(p.banner.url)
        ? p.banner.url
        : ""
    : "";

  // --------------------------------------------------
  // EXPORT README / ZIP
  // --------------------------------------------------

  const download = async () => {
    setBannerError("");

    const validationError = validateBannerExport(p, uploadedBanner);
    if (validationError) {
      setBannerError(validationError);
      setTab("banner");
      return;
    }

    try {
      const { blob, filename } = await buildProfileExport(p, uploadedBanner, normalizeBanner);
      saveBlob(blob, filename);
    } catch (error) {
      console.error("Export failed:", error);
      setBannerError("Unable to export the profile. Please try again.");
      setTab("banner");
    }
  };

  // --------------------------------------------------
  // RESET PROFILE
  // --------------------------------------------------

  const applyGitHubImport = (changes: Partial<Pick<Profile, "name" | "username" | "bio" | "location" | "headline">>) => {
    setP((old) => ({ ...old, ...changes }));
    setTab("content");
  };

  const clearProfile = () => {
    if (!window.confirm("Clear all personal information? Your template, appearance, banner, and section settings will be preserved.")) return;

    setP((old) => ({
      ...old,
      name: "",
      username: "",
      headline: "",
      location: "",
      bio: "",
      skills: "",
      projects: "",
      linkedin: "",
    }));
    setTab("content");
  };

  const resetProfile = () => {
    if (window.confirm("Reset your profile to the example?")) {
      setP(initial);
      setUploadedBanner(null);

      setBannerPreview((old) => {
        if (old) {
          URL.revokeObjectURL(old);
        }

        return "";
      });

      setBannerError("");
    }
  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <main>
      {/* ============================================
          HEADER
      ============================================ */}

      <header className="top">
        <div className="brand">
          <div className="brandicon">
            <Layers3 size={21} />
          </div>

          <div>
            DevProfile <b>Studio</b>
            <small>OPEN SOURCE PROFILE BUILDER</small>
          </div>
        </div>

        <div className="topright">
          <span className="status">
            <i />
            Changes are saved locally
          </span>

          <a
            className="gh"
            href="https://github.com/ghabghoub1/devprofile-studio"
            target="_blank"
            rel="noreferrer"
          >
            <Github size={17} />
            GitHub
          </a>

          <button className="primary" onClick={download}>
            <Download size={16} />
            Export README
          </button>
        </div>
      </header>

      {/* ============================================
          INTRO
      ============================================ */}

      <div className="intro">
        <div>
          <span className="eyebrow">
            <Sparkles size={13} />
            YOUR DEVELOPER IDENTITY, REIMAGINED
          </span>

          <h1>
            Build a profile that <em>stands out.</em>
          </h1>

          <p>
            Customize your GitHub README, see changes instantly, and export in
            one click.
          </p>
        </div>

        <span className="version">STUDIO / v{appVersion}</span>
      </div>

      {/* ============================================
          WORKSPACE
      ============================================ */}

      <GitHubConnect
          initialUsername={initial.username}
          editorProfile={p}
          onImport={applyGitHubImport}
          onConnectedUserChange={setConnectedGitHubUser}
        />

      <div className="workspace">
        {/* ============================================
            EDITOR SIDEBAR
        ============================================ */}

        <aside className="sidebar">
          <div className="sidehead">
            <span>PROFILE EDITOR</span>

            <details className="profile-actions">
              <summary aria-label="Profile editor actions" title="Profile editor actions">
                <MoreHorizontal size={19} aria-hidden="true" />
              </summary>
              <div className="profile-actions-menu">
                <button type="button" onClick={(event) => {
                  event.currentTarget.closest("details")?.removeAttribute("open");
                  clearProfile();
                }}>
                  <Trash2 size={15} aria-hidden="true" />
                  Clear profile
                </button>
                <button type="button" onClick={(event) => {
                  event.currentTarget.closest("details")?.removeAttribute("open");
                  resetProfile();
                }}>
                  <RotateCcw size={15} aria-hidden="true" />
                  Reset to example
                </button>
              </div>
            </details>
          </div>

          {/* EDITOR TABS */}

          <div className="tabs">
            <button
              className={tab === "content" ? "active" : ""}
              onClick={() => setTab("content")}
            >
              <Layers3 size={15} />
              Content
            </button>

            <button
              className={tab === "design" ? "active" : ""}
              onClick={() => setTab("design")}
            >
              <Palette size={15} />
              Appearance
            </button>

            <button
              className={tab === "templates" ? "active" : ""}
              onClick={() => setTab("templates")}
            >
              <Sparkles size={15} />
              Templates
            </button>

            <button
              className={tab === "banner" ? "active" : ""}
              onClick={() => setTab("banner")}
            >
              <ImageIcon size={15} />
              Banner
            </button>
          </div>

          {tab === "banner" ? (
            <BannerEditor
              profile={p}
              setProfile={setP}
              onBannerFile={onBannerFile}
              bannerError={bannerError}
              bannerSrc={bannerSrc}
            />
          ) : tab === "templates" ? (
            <TemplatesEditor profile={p} onSelectTemplate={(template) =>
              setP((old) => ({ ...old, template: template.id, accent: template.accent }))
            } />
          ) : tab === "content" ? (
            <ContentEditor
              profile={p}
              onChange={change}
              onMove={move}
              onToggle={toggle}
            />
          ) : (
            <AppearanceEditor profile={p} onChange={change} />
          )}
        </aside>

        {/* ============================================
            PREVIEW AREA
        ============================================ */}

        <section className="previewarea">
          <div className="previewbar">
            <div>
              <span className="live">
                <i />
                LIVE PREVIEW
              </span>

              <span className="previewnote">
                GitHub-inspired preview · Markdown export is authoritative
              </span>
            </div>

            <PreviewControls
              mode={mode}
              profileView={profileView}
              onModeChange={setMode}
              onProfileViewChange={setProfileView}
            />
</div>

          {/* ============================================
              VISUAL PREVIEW
          ============================================ */}

          {mode === "preview" ? (
            <div className={profileView === "github" ? "githublayout" : ""}>
              {profileView === "github" && (
                <GitHubProfilePreview user={connectedGitHubUser} editorUsername={p.username} />
              )}

              {/* README and GitHub-style account navigation */}
              <div className="github-preview-main">
                {profileView === "github" && (
                  <nav className="github-profile-nav" aria-label="GitHub profile navigation">
                    <span className="github-profile-nav-active" aria-current="page">
                      <BookOpen size={16} aria-hidden="true" /> Overview
                    </span>
                    {connectedGitHubUser ? (
                      <a href={`${connectedGitHubUser.html_url}?tab=repositories`} target="_blank" rel="noopener noreferrer" title="Open repositories on GitHub">
                        <Github size={16} aria-hidden="true" /> Repositories
                        <span className="github-profile-nav-count">{connectedGitHubUser.public_repos}</span>
                        <ExternalLink size={12} aria-hidden="true" />
                      </a>
                    ) : (
                      <span className="github-profile-nav-disabled" title="Connect a GitHub account to view repositories">
                        <Github size={16} aria-hidden="true" /> Repositories
                      </span>
                    )}
                  </nav>
                )}
              <ReadmePreview profile={p} bannerSrc={bannerSrc} />
              </div>
            </div>
          ) : (
            /* ============================================
                MARKDOWN VIEW
            ============================================ */

            <div className="codeview">
              <div className="codehead">
                README.md
                <button onClick={copy}>
                  {copied ? <Check size={15} /> : <Copy size={15} />}

                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              <pre>{markdown(p)}</pre>
            </div>
          )}

          {/* ============================================
              PREVIEW FOOTER
          ============================================ */}

          <div className="previewfooter">
            <span>
              ✦ Your profile is stored in this browser. No account required.
            </span>

            <div>
              <button className="secondary" onClick={copy}>
                {copied ? <Check size={16} /> : <Copy size={16} />}

                {copied ? "Copied!" : "Copy Markdown"}
              </button>

              <button className="primary" onClick={download}>
                <Download size={16} />

                {p.banner.enabled && p.banner.source === "upload"
                  ? "Download ZIP"
                  : "Download README.md"}
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ============================================
          PAGE FOOTER
      ============================================ */}

      <footer>
        Made for developers, by developers.
        <span>DevProfile Studio · v{appVersion}</span>
      </footer>
    </main>
  );
}
