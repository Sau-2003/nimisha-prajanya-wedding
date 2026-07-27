"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Sidebar } from "@/components/layout/leftsidebar"; // <-- Your exact Sidebar path

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
        // If they are NOT logged in, and NOT on the home/login page, redirect them back!
        if (pathname !== "/") {
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

  // Show a blank screen for a split second while verifying their credentials
  if (isChecking) return null; 

  // If they are LOGGED OUT and on the home page, show the Login screen (NO SIDEBAR)
  if (!isAuthorized && pathname === "/") {
    return <>{children}</>;
  }

  // If they are LOGGED OUT and tried to visit a secure page, render nothing while they are redirected
  if (!isAuthorized) {
    return null;
  }

  // If they are LOGGED IN, show the Sidebar AND your custom layout structure!
  return (
    <>
      <Sidebar />
      <main className="flex-1 w-full md:ml-64 overflow-y-auto h-screen">
        <div className="pt-16 md:pt-0">
          {children}
        </div>
      </main>
    </>
  );
}