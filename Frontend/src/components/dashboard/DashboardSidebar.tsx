import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Home,
  CalendarClock,
  Package,
  FileText,
  Settings,
  User,
  LogOut,
} from "lucide-react";

const DashboardSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user } = useAuth();

  // Generate user initials
  const getUserInitials = (name: string) => {
    if (!name) return "U";
    const names = name.trim().split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  };

  const mainMenuItems = [
    {
      title: "Services",
      icon: Home,
      path: "/patient-dashboard",
      isActive: currentPath === "/patient-dashboard",
    },
    {
      title: "My Orders",
      icon: Package,
      path: "/patient-dashboard/orders",
      isActive: currentPath === "/patient-dashboard/orders",
    },
    {
      title: "Medical Records",
      icon: FileText,
      path: "/patient-dashboard/records",
      isActive: currentPath === "/patient-dashboard/records",
    },
  ];

  const userMenuItems = [
    {
      title: "Profile",
      icon: User,
      path: "/patient-dashboard/profile",
      isActive: currentPath === "/patient-dashboard/profile",
    },
    {
      title: "Settings",
      icon: Settings,
      path: "/patient-dashboard/settings",
      isActive: currentPath === "/patient-dashboard/settings",
    },
  ];

  return (
    <Sidebar side="left" variant="sidebar" collapsible="icon">
      <SidebarHeader className="py-5 bg-gradient-to-br from-secondary-green to-secondary-green/80">
        <div className="flex flex-col items-center justify-center px-4">
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-secondary-green font-semibold text-lg shadow-md border-2 border-white">
            {getUserInitials(user?.name || "")}
          </div>
          <span className="mt-2 font-medium text-sm text-white">
            {user?.name || "User"}
          </span>
          <span className="text-xs text-white/80">Patient</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-gradient-to-b from-green-50 to-white">
        <SidebarMenu>
          {mainMenuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={item.isActive}
                tooltip={item.title}
                className={`${item.isActive ? "bg-secondary-green/10 text-secondary-green font-medium" : "hover:bg-green-50"}`}
              >
                <Link to={item.path}>
                  <item.icon
                    className={`h-5 w-5 ${item.isActive ? "text-secondary-green" : "text-gray-500"}`}
                  />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <div className="mt-8">
          <div className="px-4 mb-2 text-xs font-medium text-secondary-green/70">
            USER
          </div>
          <SidebarMenu>
            {userMenuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={item.isActive}
                  tooltip={item.title}
                  className={`${item.isActive ? "bg-secondary-green/10 text-secondary-green font-medium" : "hover:bg-green-50"}`}
                >
                  <Link to={item.path}>
                    <item.icon
                      className={`h-5 w-5 ${item.isActive ? "text-secondary-green" : "text-gray-500"}`}
                    />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarFooter className="bg-white border-t border-gray-100">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Log Out"
              className="hover:bg-red-50 hover:text-red-500"
            >
              <Link to="/logout" className="text-gray-500 hover:text-red-500">
                <LogOut className="h-5 w-5" />
                <span>Log Out</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
