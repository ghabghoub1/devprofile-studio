export type GitHubUser = {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  public_repos: number;
  followers: number;
  following: number;
};

export class GitHubLookupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GitHubLookupError";
  }
}

const USERNAME_PATTERN = /^(?!-)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;

export async function fetchGitHubUser(username: string, signal?: AbortSignal): Promise<GitHubUser> {
  const value = username.trim().replace(/^@/, "");
  if (!USERNAME_PATTERN.test(value)) {
    throw new GitHubLookupError("Enter a valid GitHub username (letters, numbers, and hyphens; maximum 39 characters).");
  }

  let response: Response;
  try {
    response = await fetch(`https://api.github.com/users/${encodeURIComponent(value)}`, {
      headers: { Accept: "application/vnd.github+json" },
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new GitHubLookupError("Could not reach GitHub. Check your connection and try again.");
  }

  if (response.status === 404) throw new GitHubLookupError("GitHub user not found. Check the username and try again.");
  if (response.status === 403 || response.status === 429) throw new GitHubLookupError("GitHub API limit reached or access temporarily restricted. Try again later.");
  if (!response.ok) throw new GitHubLookupError(`GitHub request failed (${response.status}). Please try again.`);

  const data: unknown = await response.json();
  if (!data || typeof data !== "object" || !("login" in data) || typeof data.login !== "string") {
    throw new GitHubLookupError("GitHub returned an unexpected response.");
  }
  return data as GitHubUser;
}
