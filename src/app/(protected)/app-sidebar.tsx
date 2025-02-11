"use client";

import { Bot, CreditCardIcon, LayoutDashboard, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "~/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar";
import useProject from "~/hooks/use-project";
import { cn } from "~/lib/utils";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Q&A", url: "/qa", icon: Bot },
  { title: "Billing", url: "/billing", icon: CreditCardIcon },
];

const AppSidebar = () => {
  const pathname = usePathname();
  const { projects, projectId, setProjectId } = useProject();
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Image
            className="rounded-full"
            src={"/Logo.jpeg"}
            alt="logo"
            width={40}
            height={40}
          />
          {open && (
            <h1 className="text-xl font-bold text-primary/70">Onyxis</h1>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarGroupContent>
              {items.map((item) => {
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url}
                        className={cn(
                          { "bg-primary text-white": pathname === item.url },
                          "list-none",
                        )}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarGroupContent>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Your Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects?.map((project) => {
                return (
                  <SidebarMenuItem key={project.name}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={"/dashboard"}
                        className="cursor-pointer"
                        onClick={() => setProjectId(project.id)}
                      >
                        <div
                          className={cn(
                            "flex size-6 items-center justify-center rounded-sm border bg-white text-sm text-primary",
                            {
                              "bg-primary text-white": project.id === projectId,
                            },
                          )}
                        >
                          {project.name[0]}
                        </div>
                        <span>{project.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              <div className="h-2"></div>
              {open && (
                <SidebarMenuItem>
                  <Link href={"/create"}>
                    <Button size={"sm"} className="w-fit" variant={"outline"}>
                      <Plus />
                      Create Project
                    </Button>
                  </Link>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
