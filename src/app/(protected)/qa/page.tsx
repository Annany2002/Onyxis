"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import useProject from "~/hooks/use-project";
import { api } from "~/trpc/react";
import AskQuesionCard from "../dashboard/ask-question-card";
import { Fragment, useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import CodeReferences from "../dashboard/code-references";

const QAPage = () => {
  const { projectId } = useProject();
  const { data: questions } = api.project.getQuestions.useQuery({ projectId });

  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const question = questions?.[questionIndex];

  return (
    <Sheet>
      <AskQuesionCard />
      <div className="h-4" />
      <h1 className="text-xl font-semibold text-primary">Saved Questions</h1>
      <div className="h-2" />
      <div className="flex flex-col gap-2">
        {questions?.map((question, index) => {
          return (
            <Fragment key={question.id}>
              <SheetTrigger onClick={() => setQuestionIndex(index)}>
                <div className="flex items-center gap-4 rounded-lg border bg-white p-4 shadow">
                  <img
                    className="rounded-full"
                    height={30}
                    width={30}
                    src={question.user.imageUrl ?? ""}
                  />
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-2">
                      <p className="line-clamp-1 text-lg font-medium text-gray-700">
                        {question.question}
                      </p>
                      <span className="whitespace-normal text-xs text-gray-400">
                        {question.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="line-clamp-1 text-sm text-gray-500">
                      {question.answer}
                    </p>
                  </div>
                </div>
              </SheetTrigger>
            </Fragment>
          );
        })}
      </div>

      {question && (
        <SheetContent className="overflow-auto sm:max-w-[80vw]">
          <SheetHeader>
            <SheetTitle>{question.question}</SheetTitle>
            <MDEditor.Markdown
              className="rounded-md p-2"
              source={question.answer}
            />
            <CodeReferences
              fileReferences={(question.fileReferences ?? []) as any}
            />
          </SheetHeader>
        </SheetContent>
      )}
    </Sheet>
  );
};

export default QAPage;
