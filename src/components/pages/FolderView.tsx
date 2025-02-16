import { useState, useEffect, lazy, Suspense } from "react";
import Layout from "@/components/layout/editor";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { useFolderContext } from "@/context/FolderContext";
import { Button } from "../ui/button";
import { Edit, Presentation, Expand } from "lucide-react";
import Editor, { useMonaco } from "@monaco-editor/react";
import EditTools from "../molecules/EditTools";
import { SettingsView } from "./settings-view";
import { ModelSelector, Model, AVAILABLE_MODELS } from "../molecules/Selector";

// Lazy load the viewers
const MarkdownViewer = lazy(
  () => import("@/components/molecules/MarkdownViewer")
);
const PresentationViewer = lazy(
  () => import("@/components/molecules/PresentationViewer")
);

export function FolderView() {
  const { selectedFile, showSettings } = useFolderContext();
  const [content, setContent] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState<string>("");
  const [editorRef, setEditorRef] = useState<any>(null);
  const [showDualView, setShowDualView] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPresentation, setIsPresentation] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>("gpt-3.5-turbo");
  const monaco = useMonaco();

  useEffect(() => {
    const loadFileContent = async () => {
      if (selectedFile) {
        try {
          const fileContent = await readTextFile(selectedFile.path);
          setContent(fileContent);
          setEditContent(fileContent);
        } catch (error) {
          console.error("Error reading file:", error);
          setContent("Error loading file content");
        }
      }
    };

    loadFileContent();
  }, [selectedFile]);

  useEffect(() => {
    const handleFullscreenChange = (event: CustomEvent) => {
      setIsFullscreen(event.detail);
    };

    window.addEventListener(
      "fullscreenchange",
      handleFullscreenChange as EventListener
    );

    return () => {
      window.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange as EventListener
      );
    };
  }, []);

  useEffect(() => {
    if (!editorRef || !monaco) return;

    // Register completion provider
    const disposable = monaco.languages.registerCompletionItemProvider(
      "markdown",
      {
        async provideCompletionItems(model, position, context, token) {
          const wordInfo = model.getWordUntilPosition(position);
          const textUntilPosition = model.getValueInRange({
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          });

          // Only trigger completion if we have enough context
          if (textUntilPosition.length < 5) return { suggestions: [] };

          try {
            const apiKeys = JSON.parse(
              localStorage.getItem("mdtw-api-keys") || "{}"
            );
            const selectedModelData = AVAILABLE_MODELS.find(
              (m: Model) => m.id === selectedModel
            );

            if (!selectedModelData || !apiKeys[selectedModelData.provider]) {
              console.warn("No API key found for selected model");
              return { suggestions: [] };
            }

            const suggestions = await getCompletionSuggestions(
              textUntilPosition,
              selectedModel,
              apiKeys[selectedModelData.provider]
            );

            return {
              suggestions: suggestions.map((suggestion) => ({
                label: suggestion,
                kind: monaco.languages.CompletionItemKind.Text,
                insertText: suggestion,
                range: {
                  startLineNumber: position.lineNumber,
                  endLineNumber: position.lineNumber,
                  startColumn: wordInfo.startColumn,
                  endColumn: wordInfo.endColumn,
                },
              })),
            };
          } catch (error) {
            console.error("Error getting completions:", error);
            return { suggestions: [] };
          }
        },
        triggerCharacters: [" ", "\n"],
      }
    );

    return () => disposable.dispose();
  }, [editorRef, selectedModel, monaco]);

  useEffect(() => {
    // Check if the selected model is still enabled
    const savedSettings = localStorage.getItem("mdtw-model-settings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      const selectedModelData = AVAILABLE_MODELS.find(
        (m: Model) => m.id === selectedModel
      );

      if (
        selectedModelData &&
        !settings.enabledModels[selectedModelData.provider]
      ) {
        // Find the first enabled model
        const firstEnabledModel = AVAILABLE_MODELS.find(
          (m) => settings.enabledModels[m.provider]
        );
        if (firstEnabledModel) {
          setSelectedModel(firstEnabledModel.id);
        }
      }
    }
  }, [selectedModel]);

  const handleSave = async () => {
    if (selectedFile) {
      try {
        await writeTextFile(selectedFile.path, editContent);
        setContent(editContent);
        setIsEditing(false);
      } catch (error) {
        console.error("Error saving file:", error);
      }
    }
  };

  const insertMarkdown = (syntax: string, wrap: boolean = false) => {
    if (!editorRef) return;
    const selection = editorRef.getSelection();

    if (selection) {
      const selectedText = editorRef.getModel().getValueInRange(selection);
      let newText = wrap
        ? `${syntax}${selectedText}${syntax}`
        : `${syntax} ${selectedText}`;

      editorRef.executeEdits("", [
        {
          range: selection,
          text: newText,
          forceMoveMarkers: true,
        },
      ]);
    }
  };

  const renderViewer = () => {
    if (isEditing) {
      if (showDualView) {
        return (
          <div className="flex h-full">
            <div className="h-full relative w-1/2">
              <Editor
                height="100%"
                defaultLanguage="markdown"
                theme="vs-light"
                value={editContent}
                onChange={(value) => setEditContent(value || "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: "on",
                  lineNumbers: "on",
                  renderWhitespace: "selection",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 16, bottom: 16 },
                  fixedOverflowWidgets: true,
                }}
                onMount={(editor) => setEditorRef(editor)}
              />
            </div>
            <div className="h-full overflow-auto w-1/2">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-full">
                    Loading viewer...
                  </div>
                }
              >
                {isPresentation ? (
                  <PresentationViewer
                    content={editContent}
                    isFullscreen={false}
                  />
                ) : (
                  <MarkdownViewer content={editContent} />
                )}
              </Suspense>
            </div>
          </div>
        );
      }
      return (
        <div className="h-full relative">
          <Editor
            height="100%"
            defaultLanguage="markdown"
            theme="vs-light"
            value={editContent}
            onChange={(value) => setEditContent(value || "")}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: "on",
              lineNumbers: "on",
              renderWhitespace: "selection",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 16, bottom: 16 },
              fixedOverflowWidgets: true,
            }}
            onMount={(editor) => setEditorRef(editor)}
          />
        </div>
      );
    }

    return (
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-full">
            Loading viewer...
          </div>
        }
      >
        {isPresentation ? (
          <PresentationViewer content={content} isFullscreen={isFullscreen} />
        ) : (
          <div className="h-full overflow-auto">
            <MarkdownViewer content={content} />
          </div>
        )}
      </Suspense>
    );
  };

  const renderModelSelector = () => {
    if (!isEditing) return null;
    return <ModelSelector value={selectedModel} onChange={setSelectedModel} />;
  };

  if (showSettings) {
    return <SettingsView />;
  }

  return (
    <Layout>
      <div className="flex flex-col h-screen w-full overflow-hidden bg-background">
        {content ? (
          <>
            <div className="flex justify-end gap-4 p-4 border-b">
              {isEditing ? (
                <>
                  <EditTools
                    insertMarkdown={insertMarkdown}
                    setIsEditing={setIsEditing}
                    handleSave={handleSave}
                    editorRef={editorRef}
                  />
                  <Button
                    variant="outline"
                    onClick={() => setShowDualView(!showDualView)}
                  >
                    {showDualView ? "Single View" : "Dual View"}
                  </Button>
                  {renderModelSelector()}
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsPresentation(!isPresentation)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    {isPresentation ? "Exit Slide Mode" : "Slide Mode"}
                  </Button>
                  {isPresentation && (
                    <Button
                      variant="outline"
                      onClick={() => setIsPresentationMode(!isPresentationMode)}
                    >
                      <Presentation className="mr-2 h-4 w-4" />
                      {isPresentationMode ? "Exit Presentation" : "Present"}
                    </Button>
                  )}
                  {isPresentation && isPresentationMode && (
                    <Button
                      variant="outline"
                      onClick={() => setIsFullscreen(!isFullscreen)}
                    >
                      <Expand className="mr-2 h-4 w-4" />
                      {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                    </Button>
                  )}
                </>
              )}
            </div>
            <div className="flex-1 overflow-hidden w-full">
              {renderViewer()}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a file to view its contents
          </div>
        )}
      </div>
    </Layout>
  );
}

async function getCompletionSuggestions(
  text: string,
  model: string,
  apiKey: string
): Promise<string[]> {
  switch (model) {
    case "gpt-3.5-turbo":
    case "gpt-4":
      try {
        const response = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model,
              messages: [
                {
                  role: "system",
                  content:
                    "You are a helpful assistant that provides concise completions for markdown text. Provide 3-5 relevant completions.",
                },
                {
                  role: "user",
                  content: `Complete this markdown text: ${text}`,
                },
              ],
              temperature: 0.7,
              n: 3,
              max_tokens: 50,
            }),
          }
        );

        const data = await response.json();
        return data.choices.map((choice: any) => choice.message.content.trim());
      } catch (error) {
        console.error("OpenAI API error:", error);
        return [];
      }

    case "claude-2":
      try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-2",
            max_tokens: 50,
            messages: [
              {
                role: "user",
                content: `Complete this markdown text with 3-5 suggestions: ${text}`,
              },
            ],
          }),
        });

        const data = await response.json();
        // Split the response into separate suggestions
        return data.content
          .split("\n")
          .filter((line: string) => line.trim())
          .slice(0, 5);
      } catch (error) {
        console.error("Anthropic API error:", error);
        return [];
      }

    case "command":
      try {
        const response = await fetch("https://api.cohere.ai/v1/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "command",
            prompt: `Complete this markdown text with 3-5 suggestions: ${text}`,
            max_tokens: 50,
            temperature: 0.7,
            k: 0,
            num_generations: 3,
          }),
        });

        const data = await response.json();
        return data.generations.map((gen: any) => gen.text.trim());
      } catch (error) {
        console.error("Cohere API error:", error);
        return [];
      }

    default:
      return [];
  }
}
