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