import { createContext, useContext, useState, ReactNode } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';

export interface IFile {
  children: IFile[];
  name: string;
  path: string;
  isExpanded?: boolean;
  is_directory: boolean;
}


interface FolderContextType {
  folderPath: string | null;
  isLoaded: boolean;
  files: IFile[];
  openFolder: () => Promise<void>;
  setFiles: (files: IFile[]) => void;
  selectedFile: IFile | null;
  handleListClick: (file: IFile) => Promise<void>;
  openHistoricalFolder: (path: string) => Promise<void>;
  closeFolder: () => void;
}



const FolderContext = createContext<FolderContextType | undefined>(undefined);

export function FolderProvider({ children }: { children: ReactNode }) {
  const [folderPath, setFolderPath] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [files, setFiles] = useState<IFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<IFile | null>(null);

  const closeFolder = () => {
    setFolderPath(null);
    setFiles([]);
    setIsLoaded(false);
    setSelectedFile(null);
  }


  const openHistoricalFolder = async (path: string) => {
    setFolderPath(path);
    setIsLoaded(true);
    const files = await invoke('get_file_tree', { folderPath: path });
    setFiles(files.children as IFile[]);
  }


  const handleListClick = async (file: IFile) => {
    if (file.is_directory) {
      if (file.isExpanded) {
        setFiles(prevFiles => updateNestedFiles(prevFiles, file.path, [{
          ...file,
          isExpanded: false
        } as IFile]));
      }
    }
    setSelectedFile(file);
  }

  const openFolder = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
      });

      if (selected && !Array.isArray(selected)) {
        setFolderPath(selected);
        setIsLoaded(true);
        console.log(selected);
        const files = await invoke('get_file_tree', { folderPath: selected });
        console.log(files);
        setFiles(files.children as IFile[]);
      }
    } catch (error) {
      console.error('Error opening folder:', error);
    }
  };

  return (
    <FolderContext.Provider
      value={{
        folderPath,
        isLoaded,
        files,
        openFolder,
        setFiles,
        selectedFile,
        handleListClick,
        openHistoricalFolder,
        closeFolder
      }}
    >

      {children}



    </FolderContext.Provider>
  );
}

export function useFolderContext() {
  const context = useContext(FolderContext);
  if (context === undefined) {
    throw new Error('useFolderContext must be used within a FolderProvider');
  }
  return context;
}

function updateNestedFiles(files: IFile[], targetPath: string, updatedFiles: IFile[]): IFile[] {
  return files.map(file => {
    if (file.path === targetPath) {
      return updatedFiles[0];
    }
    if (file.children.length > 0) {
      return { ...file, children: updateNestedFiles(file.children, targetPath, updatedFiles) };
    }
    return file;
  });
} 