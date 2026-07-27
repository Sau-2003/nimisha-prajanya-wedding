"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Supabase automatically reads the hash tokens in the URL and establishes a session.
    // We listen for it to finish setting up that recovery session.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        console.log("Recovery session ready.");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Password updated successfully! Redirecting...");
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    }
    setLoading(false);
  };

  return (
    <div className="h-[100dvh] w-screen overflow-hidden flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-center">
        <div className="text-center mb-5">
          <h1 className="text-xl font-serif font-bold text-emerald-900">
            Set New Password
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Please enter your new password below.
          </p>
        </div>

        {error && (
          <div className="mb-3 p-2 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-3 p-2 bg-emerald-50 text-emerald-700 text-xs rounded-lg border border-emerald-100">
            {success}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white font-medium py-2 rounded-lg text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50 mt-1"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}