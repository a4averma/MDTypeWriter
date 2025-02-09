import { IFile } from "@/context/FolderContext";
import { File, Folder, ChevronRight } from "lucide-react";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { useState } from 'react';

export default function FileItem({ file, handleClick }: { file: IFile, handleClick: (file: IFile) => void }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return <SidebarMenuItem>
    <SidebarMenuButton asChild onClick={() => handleClick(file)}>
      <div className="flex items-center gap-2 cursor-pointer select-none">
        {file.is_directory && (
          <button 
            onClick={handleToggle}
            className="hover:bg-gray-100 rounded-sm p-1"
          >
            <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </button>
        )}
        {file.is_directory ? <Folder /> : <File />}
        <span>{file.name}</span>
      </div>
    </SidebarMenuButton>
    
    {isExpanded && file.is_directory && file.children.length > 0 && (
      <div className="pl-4">
        {file.children.map(child => (
          <FileItem 
            key={child.path} 
            file={child} 
            handleClick={handleClick}
          />
        ))}
      </div>
    )}
  </SidebarMenuItem>;
}




