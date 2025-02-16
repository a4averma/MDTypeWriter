import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { Sidebar } from "@/components/ui/sidebar";
import { IFile, useFolderContext } from "@/context/FolderContext";
import FileItem from "./FileItem";
import { Settings, X } from "lucide-react";
import { Button } from "../ui/button";

import { basename } from "@tauri-apps/api/path";
import { useState, useEffect } from "react";

export function AppSidebar() {
  const {
    files,
    handleListClick,
    folderPath,
    closeFolder,
    showSettings,
    setShowSettings,
  } = useFolderContext();
  const [folderName, setFolderName] = useState("");

  function handleSettings() {
    setShowSettings(!showSettings);
  }
  useEffect(() => {
    const getFolderName = async () => {
      if (folderPath) {
        const name = await basename(folderPath);
        setFolderName(name.toString());
      }
    };
    getFolderName();
  }, [folderPath]);

  const handleClick = (file: IFile) => {
    handleListClick(file);
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <div className="flex items-center gap-2 justify-between w-full">
              {folderName}
              <Button variant="ghost" size="icon" onClick={closeFolder}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {files.map((file) => (
                <FileItem
                  key={file.name}
                  file={file}
                  handleClick={handleClick}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Button variant="ghost" size="icon" onClick={handleSettings}>
              <Settings className="w-4 h-4" />
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
