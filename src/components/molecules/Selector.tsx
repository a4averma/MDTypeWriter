import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFolderContext } from "@/context/FolderContext";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface Model {
  id: string;
  name: string;
  provider: "openai" | "anthropic" | "cohere";
}

export const AVAILABLE_MODELS: Model[] = [
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", provider: "openai" },
  { id: "gpt-4", name: "GPT-4", provider: "openai" },
  { id: "claude-2", name: "Claude 2", provider: "anthropic" },
  { id: "command", name: "Command", provider: "cohere" },
];

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const [enabledModels, setEnabledModels] = useState<{
    openai: boolean;
    anthropic: boolean;
    cohere: boolean;
  }>({
    openai: true,
    anthropic: true,
    cohere: true,
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem("mdtw-model-settings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setEnabledModels(settings.enabledModels);
    }
  }, []);

  const filteredModels = AVAILABLE_MODELS.filter(
    (model) => enabledModels[model.provider]
  );

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>
      <SelectContent>
        {filteredModels.map((model) => (
          <SelectItem key={model.id} value={model.id}>
            {model.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function Selector() {
  const { openFolder, openHistoricalFolder, folderPath } = useFolderContext();
  const [recentFolders, setRecentFolders] = useState<
    Array<{ path: string; name: string }>
  >([]);

  useEffect(() => {
    // Load recent folders from localStorage as a fallback
    const loadRecentFolders = async () => {
      try {
        const savedFolders = localStorage.getItem("mdtw-recent-folders");
        if (savedFolders) {
          setRecentFolders(JSON.parse(savedFolders));
        }
      } catch (error) {
        console.error("Failed to load recent folders:", error);
        toast.error("Failed to load recent folders");
      }
    };

    loadRecentFolders();
  }, []);

  const saveRecentFolders = async (
    folders: Array<{ path: string; name: string }>
  ) => {
    try {
      localStorage.setItem("mdtw-recent-folders", JSON.stringify(folders));
      console.log("Saved recent folders:", folders);
      setRecentFolders(folders);
    } catch (error) {
      console.error("Failed to save recent folders:", error);
      toast.error("Failed to save recent folders");
    }
  };

  const openFolderFromHistory = async (path: string) => {
    try {
      const { exists } = await import("@tauri-apps/plugin-fs");
      const folderExists = await exists(path);

      if (!folderExists) {
        toast.error("Folder no longer exists");
        // Remove from recent folders
        const updatedFolders = recentFolders.filter(
          (folder) => folder.path !== path
        );
        await saveRecentFolders(updatedFolders);
        return;
      }

      await openHistoricalFolder(path);
    } catch (error) {
      toast.error("Failed to open folder");
      console.error(error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Welcome to MDTypeWriter</CardTitle>
          <CardDescription>
            Get started by selecting a folder to work with
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={openFolder}
            className="w-full"
            variant="outline"
            size="lg"
          >
            Select Folder
          </Button>

          {recentFolders.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Recent Folders</h3>
              <div className="space-y-2">
                {recentFolders.map((folder) => (
                  <Button
                    key={folder.path}
                    onClick={() => openFolderFromHistory(folder.path)}
                    className="w-full text-left"
                    variant="ghost"
                    size="sm"
                  >
                    {folder.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
