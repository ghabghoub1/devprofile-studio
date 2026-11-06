import type { Profile } from "../../lib/profile";
import { templates } from "../../lib/templates";

type Template = (typeof templates)[number];

type Props = {
  profile: Profile;
  onSelectTemplate: (template: Template) => void;
};

export default function TemplatesEditor({ profile, onSelectTemplate }: Props) {
  return (
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
              (profile.template === template.id ? "templateactive" : "")
            }
            onClick={() => onSelectTemplate(template)}
          >
            <span
              className="templateswatch"
              style={{ background: template.accent }}
            />

            <strong>{template.name}</strong>

            <small>{template.description}</small>

            {profile.template === template.id && (
              <span className="templatecheck">✓ Selected</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
