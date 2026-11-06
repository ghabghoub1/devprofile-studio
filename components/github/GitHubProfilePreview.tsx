import { ExternalLink, Github, MapPin, Users, BookOpen } from "lucide-react";
import type { GitHubUser } from "../../lib/github";

type Props = {
  user: GitHubUser | null;
  editorUsername: string;
};

/** GitHub account chrome only. README content and exports come from the editor. */
export default function GitHubProfilePreview({ user, editorUsername }: Props) {
  const initials = (editorUsername.trim().slice(0, 2) || "GH").toUpperCase();

  return (
    <aside className="github-profile-sidebar" aria-label="GitHub account preview">
      {user ? (
        <>
          <img
            className="github-profile-avatar"
            src={user.avatar_url}
            alt={`${user.login}'s GitHub avatar`}
            width={184}
            height={184}
          />
          <div className="github-profile-identity">
            <strong>{user.name || user.login}</strong>
            <span>{user.login}</span>
          </div>
          {user.bio && <p className="github-profile-bio">{user.bio}</p>}
          {user.location && (
            <p className="github-profile-meta"><MapPin size={15} aria-hidden="true" /> {user.location}</p>
          )}
          <p className="github-profile-meta">
            <Users size={15} aria-hidden="true" />
            <b>{user.followers.toLocaleString("en-US")}</b> followers · <b>{user.following.toLocaleString("en-US")}</b> following
          </p>
          <p className="github-profile-meta">
            <BookOpen size={15} aria-hidden="true" />
            <b>{user.public_repos.toLocaleString("en-US")}</b> public repositories
          </p>
          <a className="github-profile-link" href={user.html_url} target="_blank" rel="noopener noreferrer">
            <Github size={16} aria-hidden="true" /> View on GitHub <ExternalLink size={14} aria-hidden="true" />
          </a>
          <a className="github-profile-repositories" href={`${user.html_url}?tab=repositories`} target="_blank" rel="noopener noreferrer">
            Repositories <ExternalLink size={13} aria-hidden="true" />
          </a>
          <p className="github-profile-note">Account details are from GitHub. The README beside this panel comes from your editor.</p>
        </>
      ) : (
        <>
          <div className="github-profile-avatar github-profile-placeholder" aria-hidden="true">{initials}</div>
          <div className="github-profile-identity"><strong>GitHub account preview</strong><span>Not connected</span></div>
          <p className="github-profile-note">Connect a public GitHub account above to show its real avatar, bio, location and statistics here. Your README remains editable without connecting.</p>
        </>
      )}
    </aside>
  );
}
