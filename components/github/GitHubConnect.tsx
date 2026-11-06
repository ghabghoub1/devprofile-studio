"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Github, LoaderCircle, ExternalLink } from "lucide-react";
import { fetchGitHubUser, type GitHubUser } from "../../lib/github";

import type { Profile } from "../../lib/profile";

type ImportKey = "name" | "username" | "bio" | "location" | "headline";
type Props = {
  initialUsername: string;
  editorProfile: Profile;
  onImport: (changes: Partial<Pick<Profile, ImportKey>>) => void;
};
const importFields: { key: ImportKey; label: string }[] = [
  { key: "name", label: "Full name" },
  { key: "username", label: "GitHub username" },
  { key: "bio", label: "About you" },
  { key: "location", label: "Location" },
  { key: "headline", label: "Professional headline (from GitHub bio)" },
];
function importValues(user: GitHubUser): Record<ImportKey, string> {
  return {
    name: user.name?.trim() || "",
    username: user.login,
    bio: user.bio?.trim() || "",
    location: user.location?.trim() || "",
    headline: user.bio?.trim() || "",
  };
}

export default function GitHubConnect({ initialUsername, editorProfile, onImport }: Props) {
  const [username, setUsername] = useState(initialUsername);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<ImportKey[]>([]);
  const [imported, setImported] = useState(false);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => () => controller.current?.abort(), []);

  async function connect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    controller.current?.abort();
    const next = new AbortController();
    controller.current = next;
    setLoading(true);
    setError("");
    setUser(null);
    setSelected([]);
    setImported(false);
    try {
      const result = await fetchGitHubUser(username, next.signal);
      if (!next.signal.aborted) {
        setUser(result);
        const incoming = importValues(result);
        setSelected(importFields.filter(({ key }) => incoming[key] && incoming[key] !== editorProfile[key]).map(({ key }) => key));
      }
    } catch (cause) {
      if (!next.signal.aborted) setError(cause instanceof Error ? cause.message : "Unable to load GitHub profile.");
    } finally {
      if (!next.signal.aborted) setLoading(false);
    }
  }

  function applyImport() {
    if (!user || selected.length === 0) return;
    const incoming = importValues(user);
    const changes: Partial<Pick<Profile, ImportKey>> = {};
    for (const key of selected) {
      if (incoming[key]) changes[key] = incoming[key];
    }
    if (Object.keys(changes).length === 0) return;
    onImport(changes);
    setSelected([]);
    setImported(true);
  }

  return (
    <section className="github-connect" aria-labelledby="github-connect-title">
      <div className="github-connect-heading">
        <div>
          <span className="github-connect-eyebrow"><Github size={14} /> GITHUB CONNECT · v0.4.2</span>
          <h2 id="github-connect-title">Connect your GitHub profile</h2>
          <p>Look up public account information, then choose what to import. Connecting alone never edits your README.</p>
        </div>
      </div>
      <form className="github-connect-form" onSubmit={connect}>
        <label htmlFor="github-username">GitHub username</label>
        <div className="github-connect-inputrow">
          <input id="github-username" value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g. octocat" autoComplete="off" spellCheck={false} />
          <button className="primary" type="submit" disabled={loading || !username.trim()}>
            {loading ? <LoaderCircle className="github-connect-spin" size={16} /> : <Github size={16} />}
            {loading ? "Connecting…" : "Connect"}
          </button>
        </div>
      </form>
      {error && <p className="github-connect-error" role="alert">{error}</p>}
      {user && (
        <div className="github-connect-result" role="status">
          <img src={user.avatar_url} alt={`${user.login}'s GitHub avatar`} width={66} height={66} />
          <div className="github-connect-details">
            <strong>{user.name || user.login}</strong>
            <span>@{user.login}{user.location ? ` · ${user.location}` : ""}</span>
            {user.bio && <p>{user.bio}</p>}
            <small>{user.public_repos} public repos · {user.followers} followers · {user.following} following</small>
          </div>
          <a className="github-connect-open" href={user.html_url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${user.login} on GitHub`}>
            <ExternalLink size={17} />
          </a>
        </div>
      )}
      {user && (
        <div className="github-import">
          <h3>Smart Import</h3>
          <p className="github-import-intro">Choose the fields to replace. Compare the current editor values with GitHub before applying. Empty GitHub fields are skipped.</p>
          <div className="github-import-list">
            {importFields.map(({ key, label }) => {
              const incoming = importValues(user)[key];
              const changed = Boolean(incoming) && incoming !== editorProfile[key];
              return (
                <label className="github-import-row" key={key}>
                  <input type="checkbox" checked={selected.includes(key)} disabled={!changed} onChange={(event) => {
                    setImported(false);
                    setSelected((old) => event.target.checked ? [...old, key] : old.filter((item) => item !== key));
                  }} />
                  <div>
                    <strong>{label}{!incoming ? " · Not available on GitHub" : !changed ? " · Already matches" : ""}</strong>
                    <div className="github-import-compare">
                      <div><small>Current editor</small><span>{editorProfile[key] || "(empty)"}</span></div>
                      <div><small>From GitHub</small><span>{incoming || "(empty)"}</span></div>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
          <div className="github-import-actions">
            <button className="primary" type="button" disabled={selected.length === 0} onClick={applyImport}>
              Import {selected.length} selected {selected.length === 1 ? "field" : "fields"}
            </button>
            <button className="secondary" type="button" onClick={() => { setSelected([]); setImported(false); }}>Clear selection</button>
          </div>
          {imported && <p role="status" className="github-import-success">Selected fields imported. Your README preview and locally saved editor are updated.</p>}
        </div>
      )}
    </section>
  );
}
