// // // "use client";

// // // import { useEffect, useState } from "react";
// // // import { supabase } from "@/lib/supabase";
// // // import { ADMIN_EMAILS } from "@/lib/admin";

// // // export default function AdminPage() {
// // //   const [isAuthorized, setIsAuthorized] = useState(false);

// // //   useEffect(() => {
// // //     const checkAccess = async () => {
// // //       const {
// // //         data: { user },
// // //       } = await supabase.auth.getUser();

// // //       if (!ADMIN_EMAILS.includes(user?.email ?? "")) {
// // //         // Kick unauthorized users back to the dashboard
// // //         window.location.href = "/";
// // //       } else {
// // //         // Reveal the page once we confirm they are an admin
// // //         setIsAuthorized(true);
// // //       }
// // //     };

// // //     checkAccess();
// // //   }, []);

// // //   // Prevent a brief "flash" of the admin content before the redirect happens
// // //   if (!isAuthorized) {
// // //     return null; // Or return a <LoadingSpinner /> if you have one
// // //   }

// // //   return (
// // //     <div className="p-8">
// // //       <h1 className="text-2xl font-bold">Admin Dashboard</h1>
// // //       {/* Rest of your admin page content */}
// // //     </div>
// // //   );
// // // }

// // // import { Card } from "@/components/ui/card";
// // // import { Button } from "@/components/ui/button";
// // // import { ExternalLink, IndianRupee, PlusCircle } from "lucide-react";

// // // export default function BudgetPage() {
// // //   return (
// // //     <div className="p-6 md:p-12 max-w-[1600px] mx-auto h-[calc(100vh-40px)] flex flex-col">
// // //       {/* Header Section */}
// // //       <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
// // //         <div>
// // //           <h1 className="font-serif text-3xl font-bold text-emerald-900 flex items-center gap-3">
// // //             <IndianRupee className="w-8 h-8 text-emerald-600" />
// // //             Budget &amp; Expenses
// // //           </h1>
// // //           <p className="text-slate-500 mt-1">Live overview of your wedding expenses.</p>
// // //         </div>
        
// // //         {/* Action Buttons Container */}
// // //         <div className="flex flex-wrap items-center gap-3">
// // //           {/* Quick Add Form Button */}
// // //           <a 
// // //             href="https://docs.google.com/forms/d/e/1FAIpQLScwW6sforfMpWeOcF-5RG3M0tteSx1fB8XdAeLUJmEic-12fw/viewform" 
// // //             target="_blank" 
// // //             rel="noopener noreferrer"
// // //           >
// // //             <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-sm font-medium">
// // //               <PlusCircle className="w-4 h-4 mr-2" />
// // //               Log Expense
// // //             </Button>
// // //           </a>

// // //           {/* Full Google Sheet Button */}
// // //           <a 
// // //             href="https://docs.google.com/spreadsheets/d/1o5cCLpPLm38YauUIZbmayh4ywXIFiMGCIhi85fQpnag/edit" 
// // //             target="_blank" 
// // //             rel="noopener noreferrer"
// // //           >
// // //             <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm font-medium">
// // //               <ExternalLink className="w-4 h-4 mr-2 text-slate-400" />
// // //               Open Sheet
// // //             </Button>
// // //           </a>
// // //         </div>
// // //       </div>

// // //       {/* Clean Embedded Table */}
// // //       <Card className="flex-1 w-full overflow-hidden border-slate-200 shadow-sm rounded-xl relative bg-white">
// // //         <iframe
// // //           // widget=false removes the bottom tabs
// // //           // chrome=false removes the top header/menus
// // //           // headers=false removes the 1,2,3 / A,B,C grid labels
// // //           src="https://docs.google.com/spreadsheets/d/1o5cCLpPLm38YauUIZbmayh4ywXIFiMGCIhi85fQpnag/htmlembed?gid=1406821983&widget=false&chrome=false&headers=false"
// // //           width="100%"
// // //           height="100%"
// // //           className="absolute inset-0 w-full h-full border-none"
// // //           title="Wedding Budget Tracker"
// // //         />
// // //       </Card>
// // //     </div>
// // //   );
// // // }
// // "use client";

// // import { useEffect, useState } from "react";
// // import { supabase } from "@/lib/supabase";
// // import { ADMIN_EMAILS } from "@/lib/admin";
// // import { Card } from "@/components/ui/card";
// // import { Button } from "@/components/ui/button";
// // import { ExternalLink, IndianRupee, PlusCircle } from "lucide-react";

// // export default function BudgetPage() {
// //   const [isAuthorized, setIsAuthorized] = useState(false);

// //   const [email, setEmail] = useState("");
// //   const [hasBudgetAccess, setHasBudgetAccess] = useState(false); // <-- NEW

// //   useEffect(() => {
// //     const getUserInfo = async () => {
// //       const { data: { user } } = await supabase.auth.getUser();
// //       const userEmail = user?.email ?? "";
// //       setEmail(userEmail);

// //       // If they are a super-admin, they automatically get budget access
// //       if (ADMIN_EMAILS.includes(userEmail)) {
// //         setHasBudgetAccess(true);
// //       } else if (userEmail) {
// //         // Otherwise, check the database for their specific permissions
// //         const { data } = await supabase
// //           .from("user_roles")
// //           .select("can_view_budget")
// //           .eq("email", userEmail)
// //           .single();
          
// //         if (data?.can_view_budget) {
// //           setHasBudgetAccess(true);
// //         }
// //       }
// //     };
// //     getUserInfo();
// //   }, []);

// //   const isAdmin = ADMIN_EMAILS.includes(email);

// //   // Prevent a brief "flash" of the budget content before the redirect happens
// //   if (!isAuthorized) {
// //     return null; // The screen stays blank while checking permissions
// //   }

// //   return (
// //     <div className="p-6 md:p-12 max-w-[1600px] mx-auto h-[calc(100vh-40px)] flex flex-col">
// //       {/* Header Section */}
// //       <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
// //         <div>
// //           <h1 className="font-serif text-3xl font-bold text-emerald-900 flex items-center gap-3">
// //             <IndianRupee className="w-8 h-8 text-emerald-600" />
// //             Budget & Expenses
// //           </h1>
// //           <p className="text-slate-500 mt-1">Live overview of your wedding expenses.</p>
// //         </div>
        
// //         {/* Action Buttons Container */}
// //         <div className="flex flex-wrap items-center gap-3">
// //           {/* Quick Add Form Button */}
// //           <a 
// //             href="https://docs.google.com/forms/d/e/1FAIpQLScwW6sforfMpWeOcF-5RG3M0tteSx1fB8XdAeLUJmEic-12fw/viewform" 
// //             target="_blank" 
// //             rel="noopener noreferrer"
// //           >
// //             <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-sm font-medium">
// //               <PlusCircle className="w-4 h-4 mr-2" />
// //               Log Expense
// //             </Button>
// //           </a>

// //           {/* Full Google Sheet Button */}
// //           <a 
// //             href="https://docs.google.com/spreadsheets/d/1o5cCLpPLm38YauUIZbmayh4ywXIFiMGCIhi85fQpnag/edit" 
// //             target="_blank" 
// //             rel="noopener noreferrer"
// //           >
// //             <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm font-medium">
// //               <ExternalLink className="w-4 h-4 mr-2 text-slate-400" />
// //               Open Sheet
// //             </Button>
// //           </a>
// //         </div>
// //       </div>

// //       {/* Clean Embedded Table */}
// //       <Card className="flex-1 w-full overflow-hidden border-slate-200 shadow-sm rounded-xl relative bg-white">
// //         <iframe
// //           // widget=false removes the bottom tabs
// //           // chrome=false removes the top header/menus
// //           // headers=false removes the 1,2,3 / A,B,C grid labels
// //           src="https://docs.google.com/spreadsheets/d/1o5cCLpPLm38YauUIZbmayh4ywXIFiMGCIhi85fQpnag/htmlembed?gid=1406821983&widget=false&chrome=false&headers=false"
// //           width="100%"
// //           height="100%"
// //           className="absolute inset-0 w-full h-full border-none"
// //           title="Wedding Budget Tracker"
// //         />
// //       </Card>
// //     </div>
// //   );
// // }
// "use client";

// import { useEffect, useState } from "react";
// import { supabase } from "@/lib/supabase";
// import { ADMIN_EMAILS } from "@/lib/admin";
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { ExternalLink, IndianRupee, PlusCircle } from "lucide-react";

// export default function BudgetPage() {
//   const [isAuthorized, setIsAuthorized] = useState(false);

//   useEffect(() => {
//     const checkAccess = async () => {
//       const { data: { user } } = await supabase.auth.getUser();
//       const userEmail = user?.email ?? "";

//       if (!userEmail) {
//         window.location.href = "/";
//         return;
//       }

//       // 1. Super-admins automatically get access
//       if (ADMIN_EMAILS.includes(userEmail)) {
//         setIsAuthorized(true);
//       } else {
//         // 2. Otherwise, check the database for specific permissions
//         const { data } = await supabase
//           .from("user_roles")
//           .select("can_view_budget")
//           .eq("email", userEmail)
//           .single();
          
//         if (data?.can_view_budget) {
//           setIsAuthorized(true); // They have permission! Reveal the page.
//         } else {
//           window.location.href = "/"; // No permission! Kick them to the dashboard.
//         }
//       }
//     };
    
//     checkAccess();
//   }, []);

//   // Prevent a brief "flash" of the budget content before the redirect happens
//   if (!isAuthorized) {
//     return null; // The screen stays blank while checking permissions
//   }

//   return (
//     <div className="p-6 md:p-12 max-w-[1600px] mx-auto h-[calc(100vh-40px)] flex flex-col">
//       {/* Header Section */}
//       <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
//         <div>
//           <h1 className="font-serif text-3xl font-bold text-emerald-900 flex items-center gap-3">
//             <IndianRupee className="w-8 h-8 text-emerald-600" />
//             Budget & Expenses
//           </h1>
//           <p className="text-slate-500 mt-1">Live overview of your wedding expenses.</p>
//         </div>
        
//         {/* Action Buttons Container */}
//         <div className="flex flex-wrap items-center gap-3">
//           {/* Quick Add Form Button */}
//           <a 
//             href="https://docs.google.com/forms/d/e/1FAIpQLScwW6sforfMpWeOcF-5RG3M0tteSx1fB8XdAeLUJmEic-12fw/viewform" 
//             target="_blank" 
//             rel="noopener noreferrer"
//           >
//             <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-sm font-medium">
//               <PlusCircle className="w-4 h-4 mr-2" />
//               Log Expense
//             </Button>
//           </a>

//           {/* Full Google Sheet Button */}
//           <a 
//             href="https://docs.google.com/spreadsheets/d/1o5cCLpPLm38YauUIZbmayh4ywXIFiMGCIhi85fQpnag/edit" 
//             target="_blank" 
//             rel="noopener noreferrer"
//           >
//             <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm font-medium">
//               <ExternalLink className="w-4 h-4 mr-2 text-slate-400" />
//               Open Sheet
//             </Button>
//           </a>
//         </div>
//       </div>

//       {/* Clean Embedded Table */}
//       <Card className="flex-1 w-full overflow-hidden border-slate-200 shadow-sm rounded-xl relative bg-white">
//         <iframe
//           // widget=false removes the bottom tabs
//           // chrome=false removes the top header/menus
//           // headers=false removes the 1,2,3 / A,B,C grid labels
//           src="https://docs.google.com/spreadsheets/d/1o5cCLpPLm38YauUIZbmayh4ywXIFiMGCIhi85fQpnag/htmlembed?gid=1406821983&widget=false&chrome=false&headers=false"
//           width="100%"
//           height="100%"
//           className="absolute inset-0 w-full h-full border-none"
//           title="Wedding Budget Tracker"
//         />
//       </Card>
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User, ShieldCheck } from "lucide-react";
import { ADMIN_EMAILS } from "@/lib/admin";

type UserRole = {
  id: string;
  email: string;
  can_view_budget: boolean;
};

export default function AdminPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [users, setUsers] = useState<UserRole[]>([]);

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      // STRICT ADMIN CHECK: Only emails in lib/admin.ts can see this page
      if (!ADMIN_EMAILS.includes(user?.email ?? "")) {
        window.location.href = "/";
      } else {
        setIsAuthorized(true);
        fetchUsers();
      }
    };
    checkAccess();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setUsers(data);
  };

  const toggleBudgetAccess = async (id: string, currentStatus: boolean) => {
    // Instantly update the database
    await supabase
      .from("user_roles")
      .update({ can_view_budget: !currentStatus })
      .eq("id", id);
      
    // Refresh the list to show the new status
    fetchUsers();
  };

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-5xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-emerald-900 flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-emerald-700" />
          Access Management
        </h1>
        <p className="text-slate-500 mt-2">
          Toggle budget access for users who have signed up for the app.
        </p>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Registered Users</h2>
          <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">
            Auto-updates on signup
          </span>
        </div>
        
        <div className="divide-y divide-slate-100">
          {users.length === 0 ? (
            <p className="p-6 text-slate-500 text-sm">No users have signed up yet.</p>
          ) : (
            users.map((u) => (
              <div key={u.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{u.email}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {ADMIN_EMAILS.includes(u.email) ? "Super Admin" : "Standard User"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Hide the toggle for Super Admins since they always have access */}
                  {!ADMIN_EMAILS.includes(u.email) && (
                    <label className={`flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-md transition-colors border ${u.can_view_budget ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                      <input
                        type="checkbox"
                        checked={u.can_view_budget}
                        onChange={() => toggleBudgetAccess(u.id, u.can_view_budget)}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                      />
                      <span className={`text-sm font-medium ${u.can_view_budget ? 'text-emerald-700' : 'text-slate-600'}`}>
                        Budget Access
                      </span>
                    </label>
                  )}
                </div>
                
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}