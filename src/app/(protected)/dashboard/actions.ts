"use server";

import { db } from "~/server/db";
import { streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createStreamableValue } from "ai/rsc";
import { generateEmbedding } from "~/lib/gemini";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function askQuestion(question: string, projectId: string) {
  const stream = createStreamableValue();

  const queryVector = await generateEmbedding(question);
  const vectorQuery = `[${queryVector.join(",")}]`;

  const result = (await db.$queryRaw`
    SELECT "fileName", "sourceCode", "summary",
    1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
    FROM "SourceCodeEmbedding"
    WHERE 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) > .5  
    AND "projectId" = ${projectId}
    ORDER BY similarity DESC
    LIMIT 10
    `) as { fileName: string; sourceCode: string; summary: string }[];
  console.log("Result for askQuestion", result);
  let context = "";

  for (const doc of result) {
    context += `source ${doc.fileName} \n code content: ${doc.sourceCode} \n summary: ${doc.summary} \n\n`;
  }

  (async () => {
    const { textStream } = await streamText({
      model: google("gemini-1.5-flash"),
      prompt: `
      You are a ai coding assistant who answers questions about the codebase. Your target audience is technical interns who are new to the codebase.
      AI assistant is a brand new, powerful tool that can help you understand the codebase better. It can answer questions about the codebase, provide code snippets, and give you a summary of the code.
      AI is well behaved and always tries to provide the best possible answers to the user.
      AI is always friendly, kind and inspiring, and eager to provide with the best possible answers to the user.
      If th question is asking about code or specific code snippet, AI should provide the detailed answer, giving step by step instructions.
      START CONTEXT BLOCK
      ${context}
      END CONTEXT BLOCK

      START QUESTION
      ${question}
      END QUESTION
      AI assistant will take into account the context provided in the conversation and provide the best possible answer to the user.
      If the context does not provide the answer to the question, the AI assistant will say that it does not have enough information to answer the question.
      AI assistant will not apologize for the previous responses, but instead will indicated new informatioon was gained.
      AI assistant will not invent anything that is not drawn directly from the context.
      Answer in markdown syntax with code snippets if needed. Be as detailed as possible when neccessary, make sure to provide the best possible answer to the user.
      `,
    });

    for await (const text of textStream) {
      stream.update(text);
    }

    stream.done();
  })();

  return {
    output: stream.value,
    fileReferences: result,
  };
}
