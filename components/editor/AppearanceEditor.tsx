import type { Profile } from "../../lib/profile";

type Props = {
  profile: Profile;
  onChange: (key: keyof Profile, value: string) => void;
};

const accentColors = ["#38bdf8", "#a78bfa", "#34d399", "#fb7185", "#fbbf24"];

export default function AppearanceEditor({ profile, onChange }: Props) {
  return (
    <div className="sidebody">
      <h3>Accent color</h3>

      <p className="hint">
        Choose a color for your editor preview. GitHub Markdown does not
        support custom CSS.
      </p>

      <div className="colors">
        {accentColors.map((color) => (
          <button
            key={color}
            className={profile.accent === color ? "chosen" : ""}
            style={{ background: color }}
            onClick={() => onChange("accent", color)}
            aria-label={`Choose ${color}`}
          />
        ))}
      </div>

      <label className="field">
        <span>Custom accent</span>
        <input
          type="color"
          value={profile.accent}
          onChange={(event) => onChange("accent", event.target.value)}
        />
      </label>

      <div className="tip">
        ✦ Templates are available in the Templates tab. Custom SVG
        statistics are planned.
      </div>
    </div>
  );
}
