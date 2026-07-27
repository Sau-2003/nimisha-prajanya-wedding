"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
// 🚨 Notice: NO curly braces around Sidebar! 🚨
import Sidebar from "@/components/layout/leftsidebar"; 

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const handleAuthState = (user: any) => {
      if (user) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
        // Allow unauthenticated users on home AND reset-password pages
        if (pathname !== "/" && pathname !== "/reset-password") {
          window.location.href = "/";
        }
      }
      setIsChecking(false);
    };

    // 1. Initial check when the app loads
    supabase.auth.getUser().then(({ data: { user } }) => {
      handleAuthState(user);
    });

    // 2. Listen in real-time for Logins and Logouts
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      handleAuthState(session?.user);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [pathname]);

  // Show a blank screen for a split second while verifying credentials
  if (isChecking) return null; 

  // If LOGGED OUT and on a public page, render full screen (NO SIDEBAR, NO MARGINS)
  if (!isAuthorized && (pathname === "/" || pathname === "/reset-password")) {
    return <>{children}</>;
  }

  // If LOGGED OUT and tried to visit a secure page, block render while redirecting
  if (!isAuthorized) {
    return null;
  }

  // If LOGGED IN, show Sidebar and add the correct padding to make room for it
  return (
    <>
      <Sidebar />
      {/* 
        Removed flex, h-screen, and simplified to block layout. 
        Uses md:pl-64 to make exact room for the desktop sidebar. 
      */}
      <main className="w-full md:pl-64 pt-14 md:pt-0 transition-all duration-300 ease-in-out block">
        {children}
      </main>
    </>
  );
}