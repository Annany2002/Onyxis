import { api } from "~/trpc/react";
import { useLocalStorage } from "usehooks-ts";

const useProject = () => {
  const { data: projects } = api.project.getProjects.useQuery();
  const [projectId, setProjectId] = useLocalStorage("onyxis-projectId", "");

  const selectedProject = projects?.find((project) => project.id === projectId);

  return { projects, selectedProject, projectId, setProjectId };
};

export default useProject;
