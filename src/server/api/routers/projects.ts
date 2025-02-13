import { z } from "zod";
import { authProcedure, createTRPCRouter } from "../trpc";
import { pollCommits } from "~/lib/github";
import { indexGithubRepo } from "~/lib/github-loader";

export const projectRouter = createTRPCRouter({
  createProject: authProcedure
    .input(
      z.object({
        projectName: z.string(),
        githubUrl: z.string(),
        githubToken: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.create({
        data: {
          name: input.projectName,
          githubUrl: input.githubUrl,
          UserToProject: {
            create: {
              userId: ctx.user.userId!,
            },
          },
        },
      });
      await indexGithubRepo(project.id, input.githubUrl, input.githubToken);
      await pollCommits(project.id);
      return project;
    }),

  getProjects: authProcedure.query(async ({ ctx }) => {
    return await ctx.db.project.findMany({
      where: {
        UserToProject: {
          some: {
            userId: ctx.user.userId!,
          },
        },
        deletedAt: null,
      },
    });
  }),

  getCommits: authProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      pollCommits(input.projectId).then().catch(console.error);
      return await ctx.db.commit.findMany({
        where: { projectId: input.projectId },
      });
    }),

  saveAnswer: authProcedure
    .input(
      z.object({
        projectId: z.string(),
        question: z.string(),
        answer: z.string(),
        fileReferences: z.array(
          z.object({
            fileName: z.string(),
            sourceCode: z.string(),
            summary: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.question.create({
        data: {
          projectId: input.projectId,
          question: input.question,
          answer: input.answer,
          fileReferences: input.fileReferences,
          userId: ctx.user.userId!,
        },
      });
    }),

  getQuestions: authProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.question.findMany({
        where: {
          projectId: input.projectId,
        },
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),

  deleteProject: authProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await Promise.allSettled([
        ctx.db.project.delete({
          where: { id: input.projectId },
        }),
        ctx.db.question.deleteMany({
          where: {
            projectId: input.projectId,
          },
        }),
        ctx.db.commit.deleteMany({
          where: {
            projectId: input.projectId,
          },
        }),
        ctx.db.userToProject.deleteMany({
          where: {
            projectId: input.projectId,
          },
        }),
        ctx.db.sourceCodeEmbedding.deleteMany({
          where: {
            projectId: input.projectId,
          },
        }),
      ]);
    }),
});
