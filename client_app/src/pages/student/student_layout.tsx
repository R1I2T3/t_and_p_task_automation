import React from "react";
import { Link, Outlet } from "react-router";
import {
  BarChart,
  User,
  LogOut,
  Menu,
  MessageCircle,
  FileUser,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
const StudentLayout = () => {
  const menuItems = [
    { icon: BarChart, label: "Stats", href: "/student/" },
    { icon: User, label: "Personal Info", href: "/student/info" },
    { icon: FileUser, label: "Resume", href: "/student/resume" },
    { icon: MessageCircle, label: "Notifications", href: "/notifications/" },
  ];

  return (
    <div className="absolute top-0 left-0 w-full min-w-fit">
      <header className="min-w-fit bg-[#d17a00] px-4 py-3 shadow-lg flex justify-between items-center">
        <h1 className="text-xl md:text-2xl  font-bold text-white flex h-full">
          Student Dashboard
        </h1>
        <img src="/tcet_logo_2.png" />
      </header>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="my-3 z-40 rounded-full bg-white shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 "
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] p-0">
          <SheetHeader className="border-b p-6 dark:border-gray-700">
            <SheetTitle className="text-2xl font-bold">Menu</SheetTitle>
          </SheetHeader>
          <div className="flex h-full flex-col justify-between py-6">
            <nav className="space-y-2 px-4">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.href}
                  className={cn(
                    "flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                    "hover:bg-gray-100 hover:text-gray-900",
                    "focus:bg-gray-100 focus:text-gray-900 focus:outline-none",
                    "dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50",
                    "dark:focus:bg-gray-800 dark:focus:text-gray-50"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="px-4">
              <Button
                variant="outline"
                className="w-full justify-start bg-[#d17a00] text-white"
                onClick={() => {
                  // Add logout functionality here
                  console.log("Logout clicked");
                }}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Log out
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <Outlet />
    </div>
  );
};

export default StudentLayout;
