import { z } from "zod";
import { authProcedure, createTRPCRouter } from "../trpc";

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
      console.log("input ", input);
      return true;
    }),
});
