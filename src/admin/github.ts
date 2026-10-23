// Minimal GitHub REST client used by the admin panel to publish content.
// Changes are written as a single commit on `main`, which triggers the Pages deploy workflow.

import { GITHUB_REPO } from "@/i18n";

export const CONTENT_PATH = "src/data/content.json";
const BRANCH = "main";
const API = `https://api.github.com/repos/${GITHUB_REPO}`;

export class GitHubError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

async function gh<T>(token: string, path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const messages: Record<number, string> = {
      401: "Token GitHub tidak valid atau sudah kedaluwarsa.",
      403: "Token tidak punya izin untuk repo ini (butuh Contents: Read and write).",
      404: "Repo atau file tidak ditemukan. Pastikan token punya akses ke " + GITHUB_REPO + ".",
    };
    throw new GitHubError(messages[res.status] ?? body.message ?? `GitHub error ${res.status}`, res.status);
  }
  return res.json() as Promise<T>;
}

export function utf8ToBase64(text: string) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

export function base64ToUtf8(b64: string) {
  const bytes = Uint8Array.from(atob(b64.replace(/\n/g, "")), (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export async function checkAccess(token: string) {
  const repo = await gh<{ full_name: string; permissions?: { push?: boolean } }>(token, "");
  if (repo.permissions && !repo.permissions.push) throw new GitHubError("Token hanya punya akses baca. Butuh izin tulis (Contents: Read and write).", 403);
  return repo.full_name;
}

/** Reads content.json from `main` and returns its parsed value and blob sha. */
export async function fetchContent<T>(token: string): Promise<{ data: T; sha: string }> {
  const file = await gh<{ content: string; sha: string }>(token, `/contents/${CONTENT_PATH}?ref=${BRANCH}`);
  return { data: JSON.parse(base64ToUtf8(file.content)) as T, sha: file.sha };
}

export async function currentContentSha(token: string) {
  const file = await gh<{ sha: string }>(token, `/contents/${CONTENT_PATH}?ref=${BRANCH}`);
  return file.sha;
}

export type FileChange = { path: string; base64: string };

/** Creates one commit on `main` containing every file in `changes`. */
export async function commitFiles(token: string, changes: FileChange[], message: string) {
  const ref = await gh<{ object: { sha: string } }>(token, `/git/ref/heads/${BRANCH}`);
  const parent = await gh<{ tree: { sha: string } }>(token, `/git/commits/${ref.object.sha}`);

  const tree = await Promise.all(
    changes.map(async (c) => {
      const blob = await gh<{ sha: string }>(token, "/git/blobs", {
        method: "POST",
        body: JSON.stringify({ content: c.base64, encoding: "base64" }),
      });
      return { path: c.path, mode: "100644", type: "blob", sha: blob.sha };
    }),
  );

  const newTree = await gh<{ sha: string }>(token, "/git/trees", {
    method: "POST",
    body: JSON.stringify({ base_tree: parent.tree.sha, tree }),
  });
  const commit = await gh<{ sha: string; html_url: string }>(token, "/git/commits", {
    method: "POST",
    body: JSON.stringify({ message, tree: newTree.sha, parents: [ref.object.sha] }),
  });
  await gh(token, `/git/refs/heads/${BRANCH}`, { method: "PATCH", body: JSON.stringify({ sha: commit.sha }) });
  return commit;
}

export type DeployRun = { status: string; conclusion: string | null; html_url: string; head_sha: string; created_at: string };

export async function latestDeploy(token: string): Promise<DeployRun | null> {
  const res = await gh<{ workflow_runs: DeployRun[] }>(token, `/actions/runs?branch=${BRANCH}&per_page=1`);
  return res.workflow_runs[0] ?? null;
}
