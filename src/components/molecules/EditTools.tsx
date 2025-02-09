import { Heading3, X, Heading2, Heading1, Bold, Italic, List, ListOrdered, LinkIcon, Save } from "lucide-react";
import { Button } from "../ui/button";
import { useEffect, useState } from 'react';

interface Position {
  top: number;
  left: number;
}

export default function EditTools({ insertMarkdown, setIsEditing, handleSave, editorRef }: {
  insertMarkdown: (syntax: string, wrap?: boolean) => void,
  setIsEditing: (isEditing: boolean) => void,
  handleSave: () => void,
  editorRef: any
}) {
  const [position, setPosition] = useState<Position | null>(null);

  useEffect(() => {
    if (!editorRef) return;

    const updatePosition = () => {
      const selection = editorRef.getSelection();
      if (!selection || selection.isEmpty()) {
        setPosition(null);
        return;
      }

      const range = selection.getStartPosition();
      const coordinates = editorRef.getScrolledVisiblePosition(range);
      
      if (coordinates) {
        const editorContainer = editorRef.getContainerDomNode();
        const rect = editorContainer.getBoundingClientRect();
        const toolbarWidth = 150; // Approximate width of the toolbar
        const windowWidth = window.innerWidth;
        
        let left = rect.left + coordinates.left;
        // Adjust if toolbar would overflow window
        if (left + toolbarWidth > windowWidth) {
          left = windowWidth - toolbarWidth - 220;
        }
        
        setPosition({
          top: rect.top + coordinates.top - 40,
          left: left
        });
      }
    };

    editorRef.onDidChangeCursorSelection(updatePosition);
    return () => editorRef?.dispose?.();
  }, [editorRef]);

  return (
    <>
      {position && (
        <div
          className="fixed z-50 bg-background border rounded-md shadow-lg p-1 flex gap-1"
          style={{ top: position.top, left: position.left }}
        >
          <Button variant="ghost" size="sm" onClick={() => insertMarkdown('**', true)}>
            <Bold className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => insertMarkdown('*', true)}>
            <Italic className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => insertMarkdown('[', true)} title="Link">
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown('# ')}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown('## ')}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown('### ')}
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown('- ')}
            title="Unordered List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown('1. ')}
            title="Ordered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="w-full flex justify-between">
        <div className="flex border-b p-2 flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown('# ')}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown('## ')}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown('### ')}
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => insertMarkdown('**', true)}>
            <Bold className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => insertMarkdown('*', true)}>
            <Italic className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => insertMarkdown('[', true)} title="Link">
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown('- ')}
            title="Unordered List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown('1. ')}
            title="Ordered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </div>
      </div>
    </>
  );
}
