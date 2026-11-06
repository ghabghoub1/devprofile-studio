import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";
import type { Profile, Section } from "../../lib/profile";

const labels: Record<string, string> = {
  about: "About me",
  skills: "Skills",
  projects: "Featured projects",
  stats: "GitHub stats",
  socials: "Social links",
  connect: "Connect",
};
type Props = {
  profile: Profile;
  onChange: (key: keyof Profile, value: string) => void;
  onMove: (section: Section, delta: number) => void;
  onToggle: (section: Section) => void;
};

export default function ContentEditor({ profile, onChange, onMove, onToggle }: Props) {
  const field = (label: string, key: keyof Profile, large = false) => (
    <label className="field" key={key}>
      <span>{label}</span>

      {large ? (
        <textarea
          value={profile[key] as string}
          rows={key === "projects" ? 5 : 4}
          onChange={(event) => onChange(key, event.target.value)}
        />
      ) : (
        <input
          value={profile[key] as string}
          onChange={(event) => onChange(key, event.target.value)}
        />
      )}
    </label>
  );

  return (
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
    value={profile.projects}
    rows={5}
    placeholder={
      "DevProfile Studio | GitHub README profile builder\n" +
      "Task Manager API | REST API built with Spring Boot\n" +
      "AI Assistant | AI-powered developer tool"
    }
    onChange={(event) => onChange("projects", event.target.value)}
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

              {profile.sections.map((section) => (
                <div className="sectionrow" key={section}>
                  <GripVertical size={15} className="muted" />

                  <span>{labels[section] ?? section}</span>

                  <button
                    aria-label={`Move ${section} up`}
                    onClick={() => onMove(section, -1)}
                  >
                    <ArrowUp size={14} />
                  </button>

                  <button
                    aria-label={`Move ${section} down`}
                    onClick={() => onMove(section, 1)}
                  >
                    <ArrowDown size={14} />
                  </button>

                  <input
                    type="checkbox"
                    checked={!profile.hidden.includes(section)}
                    onChange={() => onToggle(section)}
                    aria-label={`Show ${section}`}
                  />
                </div>
              ))}
            </div>
  );
}
