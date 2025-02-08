"use client";

import { useState } from "react";
import { Tabs, TabsContent } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vs } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "~/lib/utils";

type Props = {
  fileReferences: { fileName: string; sourceCode: string; summary: string }[];
};

const CodeReferences = ({ fileReferences }: Props) => {
  const [tab, setTab] = useState(fileReferences[0]?.fileName);
  if (!fileReferences.length) return null;

  return (
    <div className="max-w-[70vw]">
      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex gap-2 overflow-scroll rounded-md bg-gray-200 p-2">
          {fileReferences.map((file) => (
            <Button
              onClick={() => setTab(file.fileName)}
              key={file.fileName}
              className={cn(
                "whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                {
                  "text-primary-background bg-primary-foreground":
                    tab === file.fileName,
                },
              )}
            >
              {file.fileName}
            </Button>
          ))}
        </div>
        {fileReferences.map((file) => (
          <TabsContent
            key={file.fileName}
            value={file.fileName}
            className="max-h-[40vh] max-w-7xl overflow-scroll rounded-md"
          >
            <SyntaxHighlighter language="typescript" style={vs}>
              {file.sourceCode}
            </SyntaxHighlighter>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default CodeReferences;
