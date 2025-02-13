"use client";

import { ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import useProject from "~/hooks/use-project";
import { api } from "~/trpc/react";

const CommitLog = () => {
  const { projectId, selectedProject } = useProject();
  const router = useRouter();

  // Redirect to create page if projectId is not available
  useEffect(() => {
    if (!projectId) {
      router.push("/create");
    }
  }, [projectId, router]);

  const {
    data: commits = [],
    isLoading,
    isError,
  } = api.project.getCommits.useQuery({ projectId }, { enabled: !!projectId });

  if (isLoading) {
    return <p className="text-center text-gray-500">Loading commits...</p>;
  }

  if (isError || !commits.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Commits Found</CardTitle>
          <CardDescription>Your project has no commits yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Start making commits to see them here.</p>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-gray-500">
            Check your repository for updates.
          </p>
        </CardFooter>
      </Card>
    );
  }

  return (
    <ul className="space-y-6">
      {commits.map((commit, idx) => (
        <li key={commit.id} className="relative flex gap-x-4">
          {idx !== commits.length - 1 && (
            <div className="absolute left-0 top-0 flex w-6 justify-center">
              <div className="w-px translate-x-1 bg-gray-200" />
            </div>
          )}
          <Image
            width={32}
            height={32}
            src={commit.commitAuthorAvatar}
            alt={`${commit.commitAuthorName}'s avatar`}
            className="relative mt-4 size-8 flex-none rounded-full bg-gray-50"
          />
          <div className="flex-auto rounded-md bg-white p-3 ring-1 ring-inset ring-gray-200">
            <div className="flex justify-between gap-x-4">
              <Link
                target="_blank"
                href={`${selectedProject?.githubUrl}/commit/${commit.commitHash}`}
                className="py-0.5 text-xs leading-5 text-gray-500 hover:underline"
              >
                <span className="text-md font-semibold text-purple-500">
                  {commit.commitAuthorName}
                </span>{" "}
                <span className="inline-flex items-center">
                  committed
                  <ExternalLink className="ml-1 size-4" />
                </span>
              </Link>
            </div>
            <span className="font-semibold">
              {commit.commitMessage.slice(0, 300)}
            </span>
            <pre className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">
              {commit.summary}
            </pre>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default CommitLog;
