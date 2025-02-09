import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFolderContext } from "@/context/FolderContext";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LazyStore } from '@tauri-apps/plugin-store';



export function Selector() {
  const { openFolder, openHistoricalFolder } = useFolderContext();
  const [recentFolders, setRecentFolders] = useState<Array<{ path: string, name: string }>>([]);

  useEffect(() => {
    // Load recent folders from Tauri store on component mount
    const loadRecentFolders = async () => {
      try {
        const store = new LazyStore('.settings.dat');
        const savedFolders = await store.get('recentFolders');
        if (savedFolders) {
          setRecentFolders(savedFolders as Array<{ path: string, name: string }>);

        }
      } catch (error) {
        console.error('Failed to load recent folders:', error);
        toast.error('Failed to load recent folders');
      }
    };

    loadRecentFolders();
  }, []);

  const saveRecentFolders = async (folders: Array<{ path: string, name: string }>) => {
    try {
      const store = new LazyStore('.settings.dat');
      await store.set('recentFolders', folders);
      setRecentFolders(folders);

    } catch (error) {
      console.error('Failed to save recent folders:', error);
      toast.error('Failed to save recent folders');
    }
  };

  const openFolderFromHistory = async (path: string) => {
    try {
      const { exists } = await import('@tauri-apps/plugin-fs');
      const folderExists = await exists(path);
      
      if (!folderExists) {
        toast.error("Folder no longer exists");
        // Remove from recent folders
        const updatedFolders = recentFolders.filter(folder => folder.path !== path);
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
            onClick={async () => {
              const path = await openFolder();
              if (path) {
                // Extract folder name from path
                const name = path.split('/').pop() || path.split('\\').pop() || path;
                const newFolder = { path, name };
                
                // Add to recent folders, avoiding duplicates
                const updatedFolders = [
                  newFolder,
                  ...recentFolders.filter(folder => folder.path !== path)
                ].slice(0, 5); // Keep only last 5 folders
                
                await saveRecentFolders(updatedFolders);
              }
            }}
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
