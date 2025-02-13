"use client";

import Link from "next/link";
import { ExternalLink, Github, LoaderCircle } from "lucide-react";
import useProject from "~/hooks/use-project";
import useRefetch from "~/hooks/use-refetch";
import CommitLog from "./commit-log";
import AskQuesionCard from "./ask-question-card";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";

const DashboardPage = () => {
  const { selectedProject } = useProject();
  const refetch = useRefetch();
  const deleteProject = api.project.deleteProject.useMutation();

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-y-4">
        {/* Github Link */}
        <div className="flex w-full justify-between rounded-md border bg-white px-3 py-2">
          <div className="flex items-center">
            <Github size={20} />
            <div className="ml-2">
              <p className="text-sm font-medium text-gray-950">
                Linked Project :{" "}
                <Link
                  href={selectedProject?.githubUrl ?? ""}
                  target="_blank"
                  className="inline-flex items-center text-purple-500 hover:underline"
                >
                  {selectedProject?.githubUrl}
                  <ExternalLink size={20} className="ml-1" />{" "}
                </Link>
              </p>
            </div>
          </div>
          <Button
            onClick={() =>
              deleteProject.mutate(
                { projectId: selectedProject?.id! },
                {
                  onSuccess: () => {
                    toast.success("Project deleted successfully");
                    (async () => {
                      await refetch();
                      localStorage.removeItem("onyxis-projectId");
                    })();
                  },
                  onError: () => {
                    toast.error("Failed to delete project");
                  },
                },
              )
            }
            variant="outline"
            className="p-2"
            disabled={deleteProject.isPending}
          >
            Delete Project
            {deleteProject.isPending && (
              <LoaderCircle size={20} className="ml-1 animate-spin" />
            )}
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <div className="w-full p-2">
          <AskQuesionCard />
        </div>
      </div>

      <div className="mt-8">
        <CommitLog />
      </div>
    </>
  );
};

export default DashboardPage;
