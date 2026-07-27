"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, CalendarDays, MapPin, Plus, X, Pencil, Trash2, LayoutDashboard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { differenceInDays, differenceInWeeks, format, parseISO } from "date-fns";
import { supabase } from "@/lib/supabase";

interface EventItem {
  id?: string;
  name: string;
  date?: string;
  place?: string;
  link: string;
  color: string;
}

const colorOptions = [
  { label: "Slate", value: "bg-slate-500" },
  { label: "Stone", value: "bg-stone-500" },
  { label: "Red", value: "bg-red-500" },
  { label: "Deep Red", value: "bg-red-800" },
  { label: "Orange", value: "bg-orange-500" },
  { label: "Amber", value: "bg-amber-400" },
  { label: "Yellow", value: "bg-yellow-500" },
  { label: "Gold", value: "bg-yellow-600" },
  { label: "Lime", value: "bg-lime-500" },
  { label: "Green", value: "bg-green-500" },
  { label: "Emerald", value: "bg-emerald-500" },
  { label: "Teal", value: "bg-teal-500" },
  { label: "Cyan", value: "bg-cyan-500" },
  { label: "Sky Blue", value: "bg-sky-500" },
  { label: "Blue", value: "bg-blue-500" },
  { label: "Indigo", value: "bg-indigo-500" },
  { label: "Deep Indigo", value: "bg-indigo-900" },
  { label: "Violet", value: "bg-violet-500" },
  { label: "Purple", value: "bg-purple-500" },
  { label: "Fuchsia Bright", value: "bg-fuchsia-500" },
  { label: "Fuchsia Deep", value: "bg-fuchsia-900" },
  { label: "Pink", value: "bg-pink-400" },
  { label: "Rose", value: "bg-rose-500" },
];

const defaultEvents: EventItem[] = [
  { name: "Puja", date: "2027-01-27", place: "", link: "/events/puja", color: "bg-orange-500" },
  { name: "Mehendi", date: "2027-01-29", place: "", link: "/events/mehendi", color: "bg-emerald-500" },
  { name: "Check In", date: "2027-01-30", place: "", link: "/events/check-in", color: "bg-fuchsia-900" },
  { name: "Tilak", date: "2027-01-30", place: "", link: "/events/tilak", color: "bg-yellow-900" },
  { name: "Sangeet", date: "2027-01-30", place: "", link: "/events/sangeet", color: "bg-indigo-500" },
  { name: "Haldi", date: "2027-01-31", place: "", link: "/events/haldi", color: "bg-amber-400" },
  { name: "Phere", date: "2027-01-31", place: "", link: "/events/phere", color: "bg-red-500" },
  { name: "Reception", date: "2027-01-31", place: "", link: "/events/reception", color: "bg-fuchsia-600" },
  { name: "Pagphere", date: "2027-02-01", place: "", link: "/events/pagphere", color: "bg-cyan-500" },
  { name: "Vidai", date: "2027-02-01", place: "", link: "/events/vidai", color: "bg-pink-400" },
];

export default function Dashboard() {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup" | "reset">("signin");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  const [events, setEvents] = useState<EventItem[]>(defaultEvents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  
  const [newEvent, setNewEvent] = useState<EventItem>({
    name: "",
    date: "",
    place: "",
    link: "",
    color: "bg-emerald-500",
  });
  const [savingEvent, setSavingEvent] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setIsAuthorized(true);
        fetchEvents();
      } else {
        const savedEmail = localStorage.getItem("wedding_app_email");
        if (savedEmail) {
          setEmail(savedEmail);
        }
      }
      setIsChecking(false);
    };

    checkUser();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase.from("events").select("*");
    
    if (!error && data) {
      const dbEventLinks = data.map(evt => evt.link);
      const untouchedDefaults = defaultEvents.filter(evt => !dbEventLinks.includes(evt.link));
      
      const combinedEvents = [...untouchedDefaults, ...data].sort((a, b) => {
        const dateA = a.date || "9999-12-31"; 
        const dateB = b.date || "9999-12-31";
        return dateA.localeCompare(dateB);
      });

      setEvents(combinedEvents);
    }
  };

  const handleOpenAddModal = () => {
    setEditingEventId(null);
    setNewEvent({
      name: "",
      date: "",
      place: "",
      link: "",
      color: "bg-emerald-500",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (evt: EventItem) => {
    setEditingEventId(evt.id || null);
    setNewEvent({
      name: evt.name,
      date: evt.date || "",
      place: evt.place || "",
      link: evt.link,
      color: evt.color,
    });
    setIsModalOpen(true);
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (!error) {
      fetchEvents();
    } else {
      alert("Error deleting event: " + error.message);
    }
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEvent(true);
    const { data: { user } } = await supabase.auth.getUser();
    const generatedLink = newEvent.link || `/events/${newEvent.name.toLowerCase().replace(/\s+/g, '-')}`;

    if (editingEventId) {
      const { error } = await supabase.from("events").update({
          name: newEvent.name,
          date: newEvent.date || "", 
          place: newEvent.place || "",
          link: generatedLink,
          color: newEvent.color,
        }).eq("id", editingEventId);

      if (!error) {
        setIsModalOpen(false);
        fetchEvents();
      }
    } else {
      const { error } = await supabase.from("events").insert([{
          name: newEvent.name,
          date: newEvent.date || "",
          place: newEvent.place || "",
          link: generatedLink,
          color: newEvent.color,
          user_id: user?.id,
        }]);
      if (!error) {
        setIsModalOpen(false);
        fetchEvents();
      }
    }
    setSavingEvent(false);
  };

  const formatDateDisplay = (dateString?: string) => {
    if (!dateString) return "Date TBD";
    try {
      return format(parseISO(dateString), "MMM d, yyyy");
    } catch {
      return dateString;
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccess(null);

    if (authMode === "reset") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) setAuthError(error.message);
      else {
        setAuthSuccess("A password reset link has been sent to your email.");
        setAuthMode("signin");
      }
    } else if (authMode === "signup") {
      const { error, data } = await supabase.auth.signUp({ email, password });
      if (error) setAuthError(error.message);
      else if (data.user?.identities?.length === 0) setAuthError("This email is already registered. Please sign in.");
      else {
        setAuthSuccess("Account created! You can now sign in.");
        setAuthMode("signin");
        setPassword("");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setAuthError(error.message);
      else {
        localStorage.setItem("wedding_app_email", email);
        setIsAuthorized(true);
        fetchEvents();
      }
    }
    setAuthLoading(false);
  };

  const targetDate = new Date("2027-01-31");
  const today = new Date();
  const daysToGo = differenceInDays(targetDate, today);
  const weeksToGo = differenceInWeeks(targetDate, today);

  if (isChecking) return null;

  if (!isAuthorized) {
    return (
      <div className="h-[100dvh] w-screen overflow-y-auto flex items-center justify-center bg-slate-50 p-4 sm:p-6">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8 flex flex-col justify-center my-auto">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-serif font-bold text-emerald-900">
              {authMode === "signin" ? "Welcome Back" : authMode === "signup" ? "Create an Account" : "Reset Password"}
            </h1>
            <p className="text-sm text-slate-500 mt-1.5">
              {authMode === "signin" ? "Sign in to access the wedding planner" : authMode === "signup" ? "Sign up with your email to get started" : "Enter your email to receive a reset link"}
            </p>
          </div>
          {authError && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">{authError}</div>}
          {authSuccess && <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-sm rounded-xl border border-emerald-100">{authSuccess}</div>}
          
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 text-base sm:text-sm border border-slate-200 rounded-xl text-slate-800"
                placeholder="you@email.com"
              />
            </div>

            {authMode !== "reset" && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-slate-700">Password</label>
                  {authMode === "signin" && (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("reset");
                        setAuthError(null);
                        setAuthSuccess(null);
                      }}
                      className="text-xs text-emerald-600 hover:text-emerald-700 hover:underline font-medium"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 text-base sm:text-sm border border-slate-200 rounded-xl text-slate-800"
                  placeholder="••••••••"
                />
              </div>
            )}

            <button type="submit" disabled={authLoading} className="w-full bg-emerald-600 text-white py-3 rounded-xl text-base sm:text-sm font-medium hover:bg-emerald-700 shadow-sm mt-2">
              {authLoading ? "Processing..." : authMode === "signin" ? "Sign In" : authMode === "signup" ? "Sign Up" : "Send Reset Link"}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-slate-500">
            {authMode === "reset" ? (
              <button
                onClick={() => {
                  setAuthMode("signin");
                  setAuthError(null);
                  setAuthSuccess(null);
                }}
                className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
              >
                Back to Sign In
              </button>
            ) : (
              <>
                {authMode === "signin" ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => {
                    setAuthMode(authMode === "signin" ? "signup" : "signin");
                    setAuthError(null);
                    setAuthSuccess(null);
                  }}
                  className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
                >
                  {authMode === "signin" ? "Sign up here" : "Sign in here"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-3 py-4 sm:p-6 md:p-12 w-full max-w-6xl mx-auto space-y-6 md:space-y-10 relative">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8">
        
        {/* MATCHED SHOPPING FORMAT HERE */}
        <div>
          <h1 className="text-3xl font-serif font-bold text-emerald-900 flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-emerald-700 shrink-0" />Wedding Planner</h1>
          <p className="text-sm text-slate-500 mt-1">
            January 31, 2027
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full md:w-auto md:flex md:gap-4">
          <div className="flex flex-col items-center justify-center bg-emerald-50 border border-emerald-100 px-4 py-4 sm:px-6 rounded-2xl shadow-sm md:min-w-[120px]">
            <span className="text-3xl md:text-4xl font-bold text-emerald-700">{daysToGo > 0 ? daysToGo : 0}</span>
            <span className="text-xs sm:text-sm font-medium text-emerald-600 uppercase tracking-wide mt-1">Days to go</span>
          </div>
          <div className="flex flex-col items-center justify-center bg-emerald-50 border border-emerald-100 px-4 py-4 sm:px-6 rounded-2xl shadow-sm md:min-w-[120px]">
            <span className="text-3xl md:text-4xl font-bold text-emerald-700">{weeksToGo > 0 ? weeksToGo : 0}</span>
            <span className="text-xs sm:text-sm font-medium text-emerald-600 uppercase tracking-wide mt-1">Weeks to go</span>
          </div>
        </div>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
          <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
            <CheckCircle2 className="text-emerald-600" /> Event Schedule
          </CardTitle>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors w-full sm:w-auto shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Event
          </button>
        </CardHeader>
        
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 p-4 sm:p-6 pt-0">
          {events.map((evt, idx) => (
            <div
              key={evt.id || idx}
              className="p-4 sm:p-5 border border-slate-200 rounded-xl flex items-center justify-between gap-3 hover:border-emerald-500 hover:shadow-md transition-all bg-white group"
            >
              <Link href={evt.link} className="flex items-center gap-3 md:gap-4 flex-1 min-w-0 cursor-pointer">
                <div className={`w-2 h-14 md:h-16 rounded-full shrink-0 ${evt.color}`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-base md:text-lg font-semibold text-slate-800 truncate">{evt.name}</p>
                  <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                    <CalendarDays className="w-3.5 h-3.5 shrink-0" /> {formatDateDisplay(evt.date)}
                  </p>
                  {evt.place && (
                    <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 mt-0.5 truncate">
                      <MapPin className="w-3.5 h-3.5 shrink-0" /> {evt.place}
                    </p>
                  )}
                </div>
              </Link>

              <div className="flex items-center gap-1 shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleOpenEditModal(evt)}
                  className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  title="Edit Event"
                >
                  <Pencil className="w-4 h-4" />
                </button>

                {evt.id && (
                  <button
                    onClick={() => handleDeleteEvent(evt.id!)}
                    className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 my-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-serif font-bold text-slate-900">
                {editingEventId ? "Edit Event" : "Add Event"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Event Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newEvent.name}
                  onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                  className="w-full px-4 py-2.5 text-base sm:text-sm border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="e.g., Reception"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Date (Optional)</label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="w-full px-4 py-2.5 text-base sm:text-sm border border-slate-200 rounded-xl text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Place / Venue (Optional)</label>
                <input
                  type="text"
                  value={newEvent.place}
                  onChange={(e) => setNewEvent({ ...newEvent, place: e.target.value })}
                  className="w-full px-4 py-2.5 text-base sm:text-sm border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="e.g., Grand Ballroom"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Theme Color</label>
                <select
                  value={newEvent.color}
                  onChange={(e) => setNewEvent({ ...newEvent, color: e.target.value })}
                  className="w-full px-4 py-2.5 text-base sm:text-sm border border-slate-200 rounded-xl bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {colorOptions.map((col) => (
                    <option key={col.value} value={col.value}>
                      {col.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl text-base sm:text-sm font-medium hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEvent}
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-xl text-base sm:text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {savingEvent ? "Saving..." : "Save Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}