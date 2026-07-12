export interface GitHubProfile {
  login: string;
  name: string;
  avatarUrl: string;
  bio: string;
  company: string;
  location: string;
  profileUrl: string;
  repositories: number;
  followers: number;
  following: number;
}

export interface GitHubRepo {
  name: string;
  description: string;
  url: string;
  homepage: string;
  language: string;
  stars: number;
  forks: number;
  updatedAt: string;
  topics: string[];
  isFork: boolean;
}

export interface GitHubActivity {
  type: string;
  createdAt: string;
  repository: string;
}

interface GitHubUserResponse {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  html_url: string;
  public_repos: number;
  followers: number;
  following: number;
}

interface GitHubRepoResponse {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  topics?: string[];
  fork: boolean;
}

interface GitHubEventResponse {
  type: string;
  created_at: string;
  repo: { name: string };
}

const API_ROOT = "https://api.github.com";

async function githubFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${API_ROOT}${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub request failed (${response.status}) for ${path}`);
  }

  return response.json() as Promise<T>;
}

export async function getGitHubPortfolio(username: string) {
  const [user, repositories, activity] = await Promise.all([
    githubFetch<GitHubUserResponse>(`/users/${username}`),
    githubFetch<GitHubRepoResponse[]>(`/users/${username}/repos?per_page=100&sort=updated`),
    githubFetch<GitHubEventResponse[]>(`/users/${username}/events/public?per_page=100`),
  ]);

  const profile: GitHubProfile = {
    login: user.login,
    name: user.name ?? user.login,
    avatarUrl: user.avatar_url,
    bio: user.bio ?? "Full Stack Engineer from Jordan",
    company: user.company ?? "Independent Software Engineer",
    location: user.location ?? "Jordan",
    profileUrl: user.html_url,
    repositories: user.public_repos,
    followers: user.followers,
    following: user.following,
  };

  const repos: GitHubRepo[] = repositories.map((repo) => ({
    name: repo.name,
    description: repo.description ?? "A software project by Tareq Abu Sharkh.",
    url: repo.html_url,
    homepage: repo.homepage ?? "",
    language: repo.language ?? "Code",
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    updatedAt: repo.updated_at,
    topics: repo.topics ?? [],
    isFork: repo.fork,
  }));

  const events: GitHubActivity[] = activity.map((event) => ({
    type: event.type,
    createdAt: event.created_at,
    repository: event.repo.name,
  }));

  return { profile, repos, events };
}

