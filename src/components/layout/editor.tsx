import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/molecules/AppSidebar"


export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex h-full w-full overflow-x-hidden flex-1">
        <SidebarTrigger />
        {children}
      </main>

    </SidebarProvider>
  )
}
