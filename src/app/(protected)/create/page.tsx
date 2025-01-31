"use client";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";

type FormInput = {
  githubUrl: string;
  projectName: string;
  githubToken?: string;
};

const CreatePage = () => {
  const { handleSubmit, register, reset } = useForm<FormInput>();
  const createProject = api.project.createProject.useMutation();

  const onSubmit = (data: FormInput) => {
    createProject.mutate(
      {
        projectName: data.projectName,
        githubUrl: data.githubUrl,
        githubToken: data.githubToken,
      },
      {
        onSuccess: () => {
          toast.success("Project created successfully");
        },
        onError: () => {
          toast.error("Failed to create project");
        },
      },
    );
    console.log(data);
  };

  return (
    <div className="flex h-full items-center justify-center gap-12">
      <div>
        <div>
          <h1 className="text-2xl font-semibold">
            Link your Github Repository to Onyxis
          </h1>
          <p className="text-sm text-muted-foreground">Enter your github url</p>
        </div>
        <div className="h-4" />
        <div>
          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <Input
              {...register("projectName", { required: true })}
              placeholder="Project Name"
              required
            />
            <Input
              {...register("githubUrl", { required: true })}
              placeholder="Github Url"
              required
              type="url"
            />
            <Input
              {...register("githubToken")}
              placeholder="Github Token (Optional)"
            />
            <Button>Create Project</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
