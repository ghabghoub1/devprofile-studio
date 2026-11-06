"use client";

import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Copy,
  Download,
  Eye,
  FileCode2,
  Github,
  GripVertical,
  Layers3,
  Palette,
  RotateCcw,
  MoreHorizontal,
  Trash2,
  Sparkles,
  Image as ImageIcon,
  Upload,
  Link2,
  BookOpen,
  ExternalLink,
} from "lucide-react";

import {
  initial,
  labels,
  markdown,
  hasSectionContent,
  parseProjects,
  type Profile,
  type Section,
} from "../lib/profile";

import { templates } from "../lib/templates";
import JSZip from "jszip";
import GitHubConnect from "../components/github/GitHubConnect";
import GitHubProfilePreview from "../components/github/GitHubProfilePreview";
import type { GitHubUser } from "../lib/github";

type EditorTab = "content" | "design" | "templates" | "banner";
type PreviewMode = "preview" | "markdown";
type ProfileView = "readme" | "github";

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
        const parsed = JSON.parse(saved);

        setP({
          ...initial,
          ...parsed,
          banner: {
            ...initial.banner,
            ...parsed.banner,
            enabled:
              parsed.banner?.source === "upload"
                ? false
                : Boolean(parsed.banner?.enabled),
          },
          template: templates.some((t) => t.id === parsed.template)
            ? parsed.template
            : "professional",
        });
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

  const field = (label: string, key: keyof Profile, large = false) => (
    <label className="field" key={key}>
      <span>{label}</span>

      {large ? (
        <textarea
          value={p[key] as string}
          rows={key === "projects" ? 5 : 4}
          onChange={(event) => change(key, event.target.value)}
        />
      ) : (
        <input
          value={p[key] as string}
          onChange={(event) => change(key, event.target.value)}
        />
      )}
    </label>
  );

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

    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setBannerError("Please select a PNG, JPEG or WebP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setBannerError("The maximum image size is 5 MB.");
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

  const isValidBannerUrl = (value: string) => {
    try {
      const url = new URL(value);

      return url.protocol === "https:" && Boolean(url.hostname);
    } catch {
      return false;
    }
  };

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

    if (p.banner.enabled && p.banner.source === "upload" && !uploadedBanner) {
      setBannerError("Please choose a banner image before exporting.");

      setTab("banner");
      return;
    }

    if (
      p.banner.enabled &&
      p.banner.source === "url" &&
      !isValidBannerUrl(p.banner.url)
    ) {
      setBannerError("Please enter a valid public HTTPS image URL.");

      setTab("banner");
      return;
    }

    try {
      if (p.banner.enabled && p.banner.source === "upload" && uploadedBanner) {
        const zip = new JSZip();

        zip.file("README.md", markdown(p));

        const normalizedImage = await normalizeBanner(uploadedBanner);

        zip.file("assets/banner.png", normalizedImage);

        const zipBlob = await zip.generateAsync({
          type: "blob",
        });

        saveBlob(zipBlob, "github-profile.zip");
      } else {
        const blob = new Blob([markdown(p)], {
          type: "text/markdown;charset=utf-8",
        });

        saveBlob(blob, "README.md");
      }
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

        <span className="version">STUDIO / v0.4.3</span>
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

          {/* ============================================
              BANNER EDITOR
          ============================================ */}

          {tab === "banner" ? (
            <div className="sidebody">
              <h3>Profile banner</h3>

              <p className="hint">
                Add a personal banner at the top of your README. GitHub already
                displays your avatar in the profile sidebar.
              </p>

              <label className="bannercheck">
                <input
                  type="checkbox"
                  checked={p.banner.enabled}
                  onChange={(event) =>
                    setP((old) => ({
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
                  className={p.banner.source === "upload" ? "chosen" : ""}
                  onClick={() =>
                    setP((old) => ({
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
                  className={p.banner.source === "url" ? "chosen" : ""}
                  onClick={() =>
                    setP((old) => ({
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

              {p.banner.source === "upload" ? (
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
                    value={p.banner.url}
                    onChange={(event) =>
                      setP((old) => ({
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
                  value={p.banner.alt}
                  onChange={(event) =>
                    setP((old) => ({
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
                  alt={p.banner.alt || "Banner preview"}
                />
              )}

              <button
                className="secondary"
                onClick={() =>
                  setP((old) => ({
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
          ) : tab === "templates" ? (
            /* ============================================
                TEMPLATE EDITOR
            ============================================ */

            <div className="sidebody">
              <h3>Choose a template</h3>

              <p className="hint">
                Switch styles without losing your profile information.
              </p>

              <div className="templategrid">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    className={
                      "templatecard " +
                      (p.template === template.id ? "templateactive" : "")
                    }
                    onClick={() =>
                      setP((old) => ({
                        ...old,
                        template: template.id,
                        accent: template.accent,
                      }))
                    }
                  >
                    <span
                      className="templateswatch"
                      style={{
                        background: template.accent,
                      }}
                    />

                    <strong>{template.name}</strong>

                    <small>{template.description}</small>

                    {p.template === template.id && (
                      <span className="templatecheck">✓ Selected</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : tab === "content" ? (
            /* ============================================
                CONTENT EDITOR
            ============================================ */

            <div className="sidebody">
              <h3>Personal information</h3>

              {field("Full name", "name")}

              {field("GitHub username", "username")}

              {field("Professional headline", "headline")}

              {field("Location", "location")}

              {field("About you", "bio", true)}

              {field("Skills (comma-separated)", "skills", true)}

              <label className="field">
  <span>Projects (one per line)</span>

  <textarea
    value={p.projects}
    rows={5}
    placeholder={
      "DevProfile Studio | GitHub README profile builder\n" +
      "Task Manager API | REST API built with Spring Boot\n" +
      "AI Assistant | AI-powered developer tool"
    }
    onChange={(event) => change("projects", event.target.value)}
  />

  <small className="hint">
    Enter one project per line using:
    <strong> Project Name | Description</strong>
  </small>
</label>

              {field("LinkedIn URL", "linkedin")}

              <div className="sectiontitle">
                <h3>Profile sections</h3>

                <span>ORDER & VISIBILITY</span>
              </div>

              {p.sections.map((section) => (
                <div className="sectionrow" key={section}>
                  <GripVertical size={15} className="muted" />

                  <span>{labels[section]}</span>

                  <button
                    aria-label={`Move ${section} up`}
                    onClick={() => move(section, -1)}
                  >
                    <ArrowUp size={14} />
                  </button>

                  <button
                    aria-label={`Move ${section} down`}
                    onClick={() => move(section, 1)}
                  >
                    <ArrowDown size={14} />
                  </button>

                  <input
                    type="checkbox"
                    checked={!p.hidden.includes(section)}
                    onChange={() => toggle(section)}
                    aria-label={`Show ${section}`}
                  />
                </div>
              ))}
            </div>
          ) : (
            /* ============================================
                APPEARANCE EDITOR
            ============================================ */

            <div className="sidebody">
              <h3>Accent color</h3>

              <p className="hint">
                Choose a color for your editor preview. GitHub Markdown does not
                support custom CSS.
              </p>

              <div className="colors">
                {["#38bdf8", "#a78bfa", "#34d399", "#fb7185", "#fbbf24"].map(
                  (color) => (
                    <button
                      key={color}
                      className={p.accent === color ? "chosen" : ""}
                      style={{
                        background: color,
                      }}
                      onClick={() => change("accent", color)}
                      aria-label={`Choose ${color}`}
                    />
                  ),
                )}
              </div>

              <label className="field">
                <span>Custom accent</span>

                <input
                  type="color"
                  value={p.accent}
                  onChange={(event) => change("accent", event.target.value)}
                />
              </label>

              <div className="tip">
                ✦ Templates are available in the Templates tab. Custom SVG
                statistics are planned.
              </div>
            </div>
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

            <div className="preview-controls">
  {mode === "preview" && (
    <div className="layout-switch">
      <button
        className={profileView === "readme" ? "selected" : ""}
        onClick={() => setProfileView("readme")}
      >
        README only
      </button>

      <button
        className={profileView === "github" ? "selected" : ""}
        onClick={() => setProfileView("github")}
      >
        GitHub layout
      </button>
    </div>
  )}

  <div className="switch">
    <button
      className={mode === "preview" ? "selected" : ""}
      onClick={() => setMode("preview")}
    >
      <Eye size={15} />
      Preview
    </button>

    <button
      className={mode === "markdown" ? "selected" : ""}
      onClick={() => setMode("markdown")}
    >
      <FileCode2 size={15} />
      Markdown
    </button>
  </div>
</div>
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
              <article
                className={`readme theme-${p.template}`}
                style={
                  {
                    "--accent": p.accent,
                  } as React.CSSProperties
                }
              >
                {/* BANNER */}

                {bannerSrc && (
                  <img
                    className="readmebanner"
                    src={bannerSrc}
                    alt={p.banner.alt || "Profile banner"}
                  />
                )}

                {/* PROFILE HERO */}

                <div className="profilehero">
                  <div className="heroeyebrow">
                    {p.template === "minimal"
                      ? "PROFILE"
                      : p.template === "developer"
                        ? "~/developer $ whoami"
                        : p.template === "creative"
                          ? "✨ HELLO WORLD"
                          : "HELLO, I'M"}
                  </div>

                  <h2>{p.name}</h2>

                  <p className="headline">{p.headline}</p>

                  <span className="location">⌖ {p.location}</span>

                  <div className="herolinks">
                    <span>◉ GitHub</span>

                    {p.linkedin && <span>in LinkedIn</span>}
                  </div>
                </div>

                {/* README SECTIONS */}

                {p.sections
                  .filter((section) => !p.hidden.includes(section) && hasSectionContent(p, section))
                  .map((section) => (
                    <section className="profileSection" key={section}>
                      <h3>
                        {section === "about"
                          ? "👋"
                          : section === "skills"
                            ? "🛠️"
                            : section === "projects"
                              ? "🚀"
                              : section === "stats"
                                ? "📊"
                                : "🤝"}{" "}
                        {labels[section]}
                      </h3>

                      {/* ABOUT */}

                      {section === "about" && <p>{p.bio}</p>}

                      {/* SKILLS */}

                      {section === "skills" && (
                        <div className="badges">
                          {p.skills
                            .split(",")
                            .filter((skill) => skill.trim())
                            .map((skill, index) => (
                              <span key={index}>{skill.trim()}</span>
                            ))}
                        </div>
                      )}

                      {/* PROJECTS */}

                      {section === "projects" && (
                        <div className="projects">
                          {parseProjects(p.projects).map((project, index) => (
                            <div className="project" key={index}>
                              <strong>{project.name}</strong>
                              {project.description && <p>{project.description}</p>}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* GITHUB STATS */}

                      {section === "stats" && (
                        <div className="statmock">
                          <div>
                            <strong>GitHub statistics</strong>

                            <small>
                              Dynamic card URL included in exported README
                            </small>
                          </div>

                          <div className="statbars">
                            <i />
                            <i />
                            <i />
                            <i />
                            <i />
                          </div>
                        </div>
                      )}

                      {/* CONNECT */}

                      {section === "connect" && (
                        <p>
                          Find me on GitHub as <strong>@{p.username}</strong>
                          {p.linkedin
                            ? " or connect with me on LinkedIn."
                            : "."}
                        </p>
                      )}
                    </section>
                  ))}
              </article>
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
        <span>DevProfile Studio · v0.4.3</span>
      </footer>
    </main>
  );
}
