"use client";

import { Eye, FileCode2 } from "lucide-react";

export type PreviewMode = "preview" | "markdown";
export type ProfileView = "readme" | "github";

type PreviewControlsProps = {
  mode: PreviewMode;
  profileView: ProfileView;
  onModeChange: (mode: PreviewMode) => void;
  onProfileViewChange: (view: ProfileView) => void;
};

export default function PreviewControls({
  mode,
  profileView,
  onModeChange,
  onProfileViewChange,
}: PreviewControlsProps) {
  return (
    <div className="preview-controls">
      {mode === "preview" && (
        <div className="layout-switch">
          <button
            type="button"
            className={profileView === "readme" ? "selected" : ""}
            onClick={() => onProfileViewChange("readme")}
          >
            README only
          </button>
          <button
            type="button"
            className={profileView === "github" ? "selected" : ""}
            onClick={() => onProfileViewChange("github")}
          >
            GitHub layout
          </button>
        </div>
      )}
      <div className="switch">
        <button
          type="button"
          className={mode === "preview" ? "selected" : ""}
          onClick={() => onModeChange("preview")}
        >
          <Eye size={15} />
          Preview
        </button>
        <button
          type="button"
          className={mode === "markdown" ? "selected" : ""}
          onClick={() => onModeChange("markdown")}
        >
          <FileCode2 size={15} />
          Markdown
        </button>
      </div>
    </div>
  );
}
