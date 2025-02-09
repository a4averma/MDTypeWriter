import { useState, useEffect } from 'react';
import Layout from "@/components/layout/editor";
import MarkdownViewer from "@/components/molecules/MarkdownViewer";
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import { useFolderContext } from '@/context/FolderContext';
import { Button } from '../ui/button';
import { Edit } from 'lucide-react';
import Editor from "@monaco-editor/react";
import EditTools from '../molecules/EditTools';

export function FolderView() {
  const { selectedFile } = useFolderContext();
  const [content, setContent] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState<string>('');
  const [editorRef, setEditorRef] = useState<any>(null);

  useEffect(() => {
    const loadFileContent = async () => {
      if (selectedFile) {
        try {
          const fileContent = await readTextFile(selectedFile.path);
          setContent(fileContent);
          setEditContent(fileContent);
        } catch (error) {
          console.error('Error reading file:', error);
          setContent('Error loading file content');
        }
      }
    };

    loadFileContent();
  }, [selectedFile]);

  const handleSave = async () => {
    if (selectedFile) {
      try {
        await writeTextFile(selectedFile.path, editContent);
        setContent(editContent);
        setIsEditing(false);
      } catch (error) {
        console.error('Error saving file:', error);
      }
    }
  };

  const insertMarkdown = (syntax: string, wrap: boolean = false) => {
    if (!editorRef) return;
    const selection = editorRef.getSelection();

    if (selection) {
      const selectedText = editorRef.getModel().getValueInRange(selection);
      let newText = wrap ? `${syntax}${selectedText}${syntax}` : `${syntax} ${selectedText}`;

      editorRef.executeEdits('', [{
        range: selection,
        text: newText,
        forceMoveMarkers: true
      }]);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col h-screen w-full overflow-hidden bg-background">
        {content ? (
          <>
            <div className="flex justify-end gap-4 p-4 border-b">
              {isEditing ? (
                <EditTools insertMarkdown={insertMarkdown} setIsEditing={setIsEditing} handleSave={handleSave} editorRef={editorRef} />
              ) : (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
            </div>
            <div className="flex-1 overflow-hidden w-full">
              {isEditing ? (
                <div className="h-full relative">
                  <Editor
                    height="100%"
                    defaultLanguage="markdown"
                    theme="vs-light"
                    value={editContent}
                    onChange={(value) => setEditContent(value || '')}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      wordWrap: 'on',
                      lineNumbers: 'on',
                      renderWhitespace: 'selection',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      padding: { top: 16, bottom: 16 },
                      fixedOverflowWidgets: true,
                    }}
                    onMount={(editor) => setEditorRef(editor)}
                  />
                </div>
              ) : (
                <div className="h-full overflow-auto">
                  <MarkdownViewer content={content} />
                </div>
              )}
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