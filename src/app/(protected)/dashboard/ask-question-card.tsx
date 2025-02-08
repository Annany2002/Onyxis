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

const AskQuesionCard = () => {
  const { selectedProject } = useProject();
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
        <DialogContent className="sm:max-w-[80vw]">
          <DialogHeader>
            <DialogTitle>
              <Image
                className="rounded-full"
                src={"/Logo.jpeg"}
                alt="logo"
                width={40}
                height={40}
              />
            </DialogTitle>
          </DialogHeader>

          <MDEditor.Markdown
            source={answer}
            className="max-h-[40vh] max-w-[70vw] overflow-scroll bg-transparent"
          />
          <CodeReferences fileReferences={filesReferences} />
          <div className="h4" />
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
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default AskQuesionCard;
