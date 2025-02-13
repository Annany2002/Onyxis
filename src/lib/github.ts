import { Octokit } from "octokit";
import { db } from "~/server/db";
import { commitSummary } from "./gemini";

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

type Reponse = {
  commitHash: string;
  commitMessage: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
};

export const getCommitHashes = async (
  githubUrl: string,
): Promise<Reponse[]> => {
  const [owner, repo] = githubUrl.split("/").slice(3, 5);
  const { data } = await octokit.request(`GET /repos/${owner}/${repo}/commits`);

  const sortedCommits = data.sort(
    (a: any, b: any) =>
      new Date(b.commit.author.date).getTime() -
      new Date(a.commit.author.date).getTime(),
  ) as any[];

  return sortedCommits.slice(0, 10).map((commit: any) => ({
    commitHash: commit.sha as string,
    commitMessage: commit.commit.message ?? "",
    commitAuthorName: commit.commit?.author?.name ?? "",
    commitAuthorAvatar: commit?.author?.avatar_url ?? "",
    commitDate: commit.commit?.author?.date ?? "",
  }));
};

export const pollCommits = async (projectId: string) => {
  const { githubUrl } = await fetchGithubProjectUrl(projectId);
  const commitHashes = await getCommitHashes(githubUrl!);
  const unprocessedCommits = await filterUnprocessedCommits(
    projectId,
    commitHashes,
  );

  const summaryResponses = await Promise.allSettled(
    unprocessedCommits.map((commit) => {
      return summariseCommit(githubUrl!, commit.commitHash);
    }),
  );

  const summaries = summaryResponses.map((reponse) => {
    if (reponse.status === "fulfilled") {
      return reponse.value;
    }
    return "";
  });

  const commits = await db.commit.createMany({
    data: summaries.map((summary, index) => {
      return {
        projectId: projectId,
        commitHash: unprocessedCommits[index]!.commitHash,
        commitMessage: unprocessedCommits[index]!.commitMessage,
        commitAuthorName: unprocessedCommits[index]!.commitAuthorName,
        commitAuthorAvatar: unprocessedCommits[index]!.commitAuthorAvatar,
        commitDate: unprocessedCommits[index]!.commitDate,
        summary: summary,
      };
    }),
  });

  return commits;
};

async function summariseCommit(githubUrl: string, commitHash: string) {
  try {
    const response = await fetch(`${githubUrl}/commit/${commitHash}.diff`, {
      headers: {
        Accept: "application/vnd.github.v3.diff",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.text();
    return await commitSummary(data);
  } catch (error) {
    console.error("Error fetching or processing commit diff:", error);
    throw error;
  }
}

async function fetchGithubProjectUrl(projectId: string) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: {
      githubUrl: true,
    },
  });

  return { project, githubUrl: project?.githubUrl };
}

async function filterUnprocessedCommits(
  projectId: string,
  commitHashes: Reponse[],
) {
  const processedCommits = await db.commit.findMany({
    where: { projectId },
  });

  const unprocessedCommits = commitHashes.filter(
    (commit) =>
      !processedCommits.some(
        (processedCommit) => processedCommit.commitHash === commit.commitHash,
      ),
  );

  return unprocessedCommits;
}
