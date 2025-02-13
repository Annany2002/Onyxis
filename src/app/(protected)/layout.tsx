import { UserButton } from "@clerk/nextjs";
import type { ReactNode } from "react";
import { SidebarProvider } from "~/components/ui/sidebar";
import AppSidebar from "./app-sidebar";

const SideBarLayout = ({ children }: { children: ReactNode }) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="m-2 w-full">
        {/* main content */}
        <div className="overflow-y-scroll rounded-md border border-sidebar-border bg-sidebar p-4 shadow">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
};

export default SideBarLayout;
