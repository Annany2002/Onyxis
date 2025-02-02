"use client";

import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import useProject from "~/hooks/use-project";

const DashboardPage = () => {
  const { selectedProject } = useProject();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-y-4">
        {/* Github Link */}
        <div className="w-fit rounded-md bg-primary px-4 py-3">
          <div className="flex items-center">
            <Github size={20} className="text-white" />
            <div className="ml-2">
              <p className="text-sm font-medium text-white">
                Linked Project :{" "}
                <Link
                  href={selectedProject?.githubUrl ?? ""}
                  target="_blank"
                  className="inline-flex items-center text-white/80 hover:underline"
                >
                  {selectedProject?.githubUrl}
                  <ExternalLink size={20} className="ml-1" />{" "}
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="h-4" />

        <div className="flex items-center gap-4">
          Team Members Invite button Archive button
        </div>
      </div>

      <div className="mt-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
          Ask Question Meeting Card
        </div>
      </div>

      <div className="mt-8">Commit Log</div>
    </div>
  );
};

export default DashboardPage;
