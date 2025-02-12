import { FormEvent, useState } from "react";
import Image from "next/image";
import MDEditor from "@uiw/react-md-editor";
import useProject from "~/hooks/use-project";
import { askQuestion } from "./actions";
import { readStreamableValue } from "ai/rsc";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";
import CodeReferences from "./code-references";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import useRefetch from "~/hooks/use-refetch";
import { LoaderCircle } from "lucide-react";

const AskQuesionCard = () => {
  const { selectedProject } = useProject();
  const refetch = useRefetch();
  const saveAnswer = api.project.saveAnswer.useMutation();
  const [question, setQuestion] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filesReferences, setFilesReferences] = useState<
    { fileName: string; sourceCode: string; summary: string }[]
  >([]);
  const [answer, setAnswer] = useState("");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    setAnswer("");
    setFilesReferences([]);
    e.preventDefault();
    if (!selectedProject?.id) return;
    setLoading(true);

    const { output, fileReferences } = await askQuestion(
      question,
      selectedProject.id,
    );
    setOpen(true);
    setFilesReferences(fileReferences);

    for await (const delta of readStreamableValue(output)) {
      if (delta) {
        setAnswer((ans) => ans + delta);
      }
    }

    setLoading(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="m-1 sm:max-w-[80vw]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <DialogTitle>
                <Image
                  className="rounded-full"
                  src={"/Logo.jpeg"}
                  alt="logo"
                  width={40}
                  height={40}
                />
              </DialogTitle>
              <Button
                disabled={saveAnswer.isPending}
                variant={"outline"}
                onClick={() => {
                  saveAnswer.mutate(
                    {
                      projectId: selectedProject?.id!,
                      question,
                      answer,
                      fileReferences: filesReferences,
                    },
                    {
                      onSuccess: () => {
                        toast.success("Answer saved successfully");
                        (async () => {
                          await refetch();
                        })();
                      },
                      onError: () => {
                        toast.error("Failed to save answer");
                      },
                    },
                  );
                }}
              >
                Save Answer
              </Button>
            </div>
          </DialogHeader>

          <MDEditor.Markdown
            source={answer}
            className="max-h-[25vh] max-w-[70vw] overflow-auto p-2"
          />
          <CodeReferences fileReferences={filesReferences} />
          <div className="h-2" />
          <Button type="button" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogContent>
      </Dialog>

      <Card className="relative col-span-3">
        <CardHeader>
          <CardTitle>Ask a Question</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <Textarea
              placeholder="Which file should I edit to change the home page?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <div className="h-4" />
            <Button type="submit" disabled={loading}>
              Ask Onyxis
              {loading && <LoaderCircle className="ml-1 animate-spin" />}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default AskQuesionCard;
