"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Github, LoaderCircle, ExternalLink } from "lucide-react";
import { fetchGitHubUser, type GitHubUser } from "../../lib/github";

type Props = { initialUsername: string };

export default function GitHubConnect({ initialUsername }: Props) {
  const [username, setUsername] = useState(initialUsername);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
    try {
      const result = await fetchGitHubUser(username, next.signal);
      if (!next.signal.aborted) setUser(result);
    } catch (cause) {
      if (!next.signal.aborted) setError(cause instanceof Error ? cause.message : "Unable to load GitHub profile.");
    } finally {
      if (!next.signal.aborted) setLoading(false);
    }
  }

  return (
    <section className="github-connect" aria-labelledby="github-connect-title">
      <div className="github-connect-heading">
        <div>
          <span className="github-connect-eyebrow"><Github size={14} /> GITHUB CONNECT · v0.4.1</span>
          <h2 id="github-connect-title">Connect your GitHub profile</h2>
          <p>Look up public account information. Your README editor will not be changed.</p>
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
    </section>
  );
}
