import { FolderProvider } from "./context/FolderContext";
import { Selector } from "./components/molecules/Selector";
import { FolderView } from "./components/pages/FolderView";
import { useFolderContext } from "./context/FolderContext";

function AppContent() {
  const { isLoaded } = useFolderContext();
  return isLoaded ? <FolderView /> : <Selector />;
}

function App() {
  return (
    <FolderProvider>
      <main className="min-h-screen bg-white dark:bg-gray-900">
        <AppContent />
      </main>
    </FolderProvider>
  );
}

export default App;
