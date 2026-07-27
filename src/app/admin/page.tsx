// "use client";

// import { useEffect, useState } from "react";
// import { supabase } from "@/lib/supabase";
// import { User
// } from "lucide-react";
// import { ADMIN_EMAILS } from "@/lib/admin"; // Importing your new file

// export default function AdminPage() {
//   const [isAuthorized, setIsAuthorized] = useState(false);

//   useEffect(() => {
//     const checkAccess = async () => {
//       const {
//         data: { user },
//       } = await supabase.auth.getUser();

//       // Check if the logged-in user's email is in your lib/admin.ts list
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
//     return null; // The screen will stay blank until we confirm they are an admin
//   }

//   // return (
//   //   <div className="p-8">
//   //     <h1 className="User text-2xl font-bold">Admin Dashboard</h1>
//   //     <p className="mt-4 text-slate-600">Welcome to the admin area!</p>
//   //     {/* Add your admin content here */}
//   //   </div>
//   // );

//     return (
//       <div className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto space-y-8">
        
//         {/* Page Header */}
//         <div>
//           <h1 className="text-3xl md:text-4xl font-serif font-bold text-emerald-900 flex items-center gap-3">
//             <User className="w-8 h-8 text-emerald-700" />
//             Admin Dashboard
//           </h1>
//           <p className="text-slate-500 mt-2">
//             Add your admin content here
//           </p>
//         </div>
//       </div>
//         );
// }
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User, ShieldCheck, Plus, Trash2 } from "lucide-react";
import { ADMIN_EMAILS } from "@/lib/admin";

type UserRole = {
  id: string;
  email: string;
  can_view_budget: boolean;
};

export default function AdminPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [users, setUsers] = useState<UserRole[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [giveBudgetAccess, setGiveBudgetAccess] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setLoading(true);

    const { error } = await supabase.from("user_roles").insert([
      {
        email: newEmail.toLowerCase().trim(),
        can_view_budget: giveBudgetAccess,
      },
    ]);

    if (error) {
      alert("Error: User might already be in the list.");
    } else {
      setNewEmail("");
      setGiveBudgetAccess(false);
      fetchUsers(); // Refresh the list
    }
    setLoading(false);
  };

  const toggleBudgetAccess = async (id: string, currentStatus: boolean) => {
    await supabase
      .from("user_roles")
      .update({ can_view_budget: !currentStatus })
      .eq("id", id);
    fetchUsers();
  };

  const removeUser = async (id: string) => {
    if (confirm("Are you sure you want to remove this user's permissions?")) {
      await supabase.from("user_roles").delete().eq("id", id);
      fetchUsers();
    }
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
          Manage who can access restricted pages like the Budget.
        </p>
      </div>

      {/* Add New User Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Grant New Access</h2>
        <form onSubmit={handleAddUser} className="flex flex-col md:flex-row gap-4 md:items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              User's Email Address
            </label>
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="guest@gmail.com"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          
          <div className="flex items-center gap-2 h-[42px] px-2">
            <input
              type="checkbox"
              id="budget"
              checked={giveBudgetAccess}
              onChange={(e) => setGiveBudgetAccess(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <label htmlFor="budget" className="text-sm font-medium text-slate-700 cursor-pointer">
              Allow Budget Access
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 text-white font-medium px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors h-[42px] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> {loading ? "Adding..." : "Add User"}
          </button>
        </form>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Current Permissions</h2>
        </div>
        
        <div className="divide-y divide-slate-100">
          {users.length === 0 ? (
            <p className="p-6 text-slate-500 text-sm">No special access granted yet.</p>
          ) : (
            users.map((u) => (
              <div key={u.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{u.email}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Custom Permissions Granted</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer bg-slate-100 px-3 py-1.5 rounded-md">
                    <input
                      type="checkbox"
                      checked={u.can_view_budget}
                      onChange={() => toggleBudgetAccess(u.id, u.can_view_budget)}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Budget</span>
                  </label>

                  <button
                    onClick={() => removeUser(u.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove User"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}