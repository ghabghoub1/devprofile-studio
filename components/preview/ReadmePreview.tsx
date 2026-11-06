import type { CSSProperties } from "react";
import { hasSectionContent, labels, type Profile } from "../../lib/profile";
import ProjectCards from "./ProjectCards";

type ReadmePreviewProps = {
  profile: Profile;
  bannerSrc: string;
};

/** Visual README preview shared by README-only and GitHub-layout modes. */
export default function ReadmePreview({ profile, bannerSrc }: ReadmePreviewProps) {
  return (
              <article
                className={`readme theme-${profile.template}`}
                style={
                  {
                    "--accent": profile.accent,
                  } as CSSProperties
                }
              >
                {/* BANNER */}

                {bannerSrc && (
                  <img
                    className="readmebanner"
                    src={bannerSrc}
                    alt={profile.banner.alt || "Profile banner"}
                  />
                )}

                {/* PROFILE HERO */}

                <div className="profilehero">
                  <div className="heroeyebrow">
                    {profile.template === "minimal"
                      ? "PROFILE"
                      : profile.template === "developer"
                        ? "~/developer $ whoami"
                        : profile.template === "creative"
                          ? "✨ HELLO WORLD"
                          : "HELLO, I'M"}
                  </div>

                  <h2>{profile.name}</h2>

                  <p className="headline">{profile.headline}</p>

                  <span className="location">⌖ {profile.location}</span>

                  <div className="herolinks">
                    <span>◉ GitHub</span>

                    {profile.linkedin && <span>in LinkedIn</span>}
                  </div>
                </div>

                {/* README SECTIONS */}

                {profile.sections
                  .filter((section) => !profile.hidden.includes(section) && hasSectionContent(profile, section))
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

                      {section === "about" && <p>{profile.bio}</p>}

                      {/* SKILLS */}

                      {section === "skills" && (
                        <div className="badges">
                          {profile.skills
                            .split(",")
                            .filter((skill) => skill.trim())
                            .map((skill, index) => (
                              <span key={index}>{skill.trim()}</span>
                            ))}
                        </div>
                      )}

                      {/* PROJECTS */}

                      {section === "projects" && (
                        <ProjectCards projects={profile.projects} />
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
                          Find me on GitHub as <strong>@{profile.username}</strong>
                          {profile.linkedin
                            ? " or connect with me on LinkedIn."
                            : "."}
                        </p>
                      )}
                    </section>
                  ))}
              </article>
  );
}
