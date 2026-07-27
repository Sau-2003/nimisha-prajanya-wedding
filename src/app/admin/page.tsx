// "use client";

// import { useEffect, useState } from "react";
// import { supabase } from "@/lib/supabase";
// import { ADMIN_EMAILS } from "@/lib/admin";

// export default function AdminPage() {
//   const [isAuthorized, setIsAuthorized] = useState(false);

//   useEffect(() => {
//     const checkAccess = async () => {
//       const {
//         data: { user },
//       } = await supabase.auth.getUser();

//       if (!ADMIN_EMAILS.includes(user?.email ?? "")) {
//         // Kick unauthorized users back to the dashboard
//         window.location.href = "/";
//       } else {
//         // Reveal the page once we confirm they are an admin
//         setIsAuthorized(true);
//       }
//     };

//     checkAccess();
//   }, []);

//   // Prevent a brief "flash" of the admin content before the redirect happens
//   if (!isAuthorized) {
//     return null; // Or return a <LoadingSpinner /> if you have one
//   }

//   return (
//     <div className="p-8">
//       <h1 className="text-2xl font-bold">Admin Dashboard</h1>
//       {/* Rest of your admin page content */}
//     </div>
//   );
// }

// const { data } = await supabase
//   .from("user_permissions")
//   .select("role, full_access")
//   .eq("email", user.email)
//   .single();

// const canSeeEverything = data?.full_access === true;
// {canSeeEverything && <AdminNav />}
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ADMIN_EMAILS } from "@/lib/admin"; // Importing your new file

export default function AdminPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Check if the logged-in user's email is in your lib/admin.ts list
      if (!ADMIN_EMAILS.includes(user?.email ?? "")) {
        // Kick unauthorized users back to the dashboard
        window.location.href = "/";
      } else {
        // Reveal the page once we confirm they are an admin
        setIsAuthorized(true);
      }
    };

    checkAccess();
  }, []);

  // Prevent a brief "flash" of the admin content before the redirect happens
  if (!isAuthorized) {
    return null; // The screen will stay blank until we confirm they are an admin
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="mt-4 text-slate-600">Welcome to the admin area!</p>
      {/* Add your admin content here */}
    </div>
  );
}