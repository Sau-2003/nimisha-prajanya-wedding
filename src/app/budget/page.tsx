"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ADMIN_EMAILS } from "@/lib/admin";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, IndianRupee, PlusCircle, Loader2 } from "lucide-react";

export default function BudgetPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // <-- Added loading state

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const userEmail = user?.email?.toLowerCase() ?? "";

        if (!userEmail) {
          window.location.href = "/";
          return;
        }

        // 1. Super-admins automatically get access
        if (ADMIN_EMAILS.map(e => e.toLowerCase()).includes(userEmail)) {
          setIsAuthorized(true);
        } else {
          // 2. Otherwise, check the database for specific permissions
          const { data, error } = await supabase
            .from("user_roles")
            .select("can_view_budget")
            .eq("email", userEmail)
            .maybeSingle(); // <-- Changed from .single() so it doesn't crash if empty
            
          if (data?.can_view_budget) {
            setIsAuthorized(true); // They have permission! Reveal the page.
          } else {
            window.location.href = "/"; // No permission! Kick them to the dashboard.
          }
        }
      } catch (error) {
        console.error("Error verifying budget access:", error);
        window.location.href = "/"; // Failsafe redirect
      } finally {
        setIsLoading(false); // Turn off the loading spinner
      }
    };
    
    checkAccess();
  }, []);

  // Show a loading spinner while checking the database
  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-4 text-emerald-700">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-sm font-medium animate-pulse">Verifying access...</p>
      </div>
    );
  }

  // Prevent rendering if they somehow bypassed the redirect
  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="p-6 md:p-12 max-w-[1600px] mx-auto h-[calc(100vh-40px)] flex flex-col">
      {/* Header Section */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-emerald-900 flex items-center gap-3">
            <IndianRupee className="w-8 h-8 text-emerald-600" />
            Budget & Expenses
          </h1>
          <p className="text-slate-500 mt-1">Live overview of your wedding expenses.</p>
        </div>
        
        {/* Action Buttons Container */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Add Form Button */}
          <a 
            href="https://docs.google.com/forms/d/e/1FAIpQLScwW6sforfMpWeOcF-5RG3M0tteSx1fB8XdAeLUJmEic-12fw/viewform" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-sm font-medium">
              <PlusCircle className="w-4 h-4 mr-2" />
              Log Expense
            </Button>
          </a>

          {/* Full Google Sheet Button */}
          <a 
            href="https://docs.google.com/spreadsheets/d/1o5cCLpPLm38YauUIZbmayh4ywXIFiMGCIhi85fQpnag/edit" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm font-medium">
              <ExternalLink className="w-4 h-4 mr-2 text-slate-400" />
              Open Sheet
            </Button>
          </a>
        </div>
      </div>

      {/* Clean Embedded Table */}
      <Card className="flex-1 w-full overflow-hidden border-slate-200 shadow-sm rounded-xl relative bg-white">
        <iframe
          src="https://docs.google.com/spreadsheets/d/1o5cCLpPLm38YauUIZbmayh4ywXIFiMGCIhi85fQpnag/htmlembed?gid=1406821983&widget=false&chrome=false&headers=false"
          width="100%"
          height="100%"
          className="absolute inset-0 w-full h-full border-none"
          title="Wedding Budget Tracker"
        />
      </Card>
    </div>
  );
}