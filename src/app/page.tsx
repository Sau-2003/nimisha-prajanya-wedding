"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  CheckCircle2, CalendarDays, MapPin, Plus, X, Pencil, Trash2, 
  LayoutDashboard, Search, FileText, Users, Store, CheckSquare, 
  Loader2, Wallet, ShoppingBag, Utensils, Gift, Layers, Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { differenceInDays, differenceInWeeks, format, parseISO } from "date-fns";
import { supabase } from "@/lib/supabase";
import { defaultEvents } from "@/components/layout/leftsidebar";

interface EventItem {
  id?: string;
  name: string;
  date?: string;
  place?: string;
  link: string;
  color: string;
}

interface UniversalSearchResult {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  link: string;
  color?: string;
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

const EXACT_TABLES = [
  { name: "budget", link: "/budget", label: "Budget" },
  { name: "chadana", link: "/chadana", label: "Chadana" },
  { name: "entry_collaborators", link: "/collaborators", label: "Collaborators" },
  { name: "event_items", link: "/tasks", label: "Event Tasks" },
  { name: "events", link: "/events", label: "Events" },
  { name: "gift_masterlist", link: "/gifts", label: "Gift Masterlist" },
  { name: "gifts", link: "/gifts", label: "Gifts" },
  { name: "guests", link: "/guests", label: "Guests" },
  { name: "menus", link: "/menus", label: "Menus" },
  { name: "notes", link: "/notes", label: "Notes" },
  { name: "option_tabs", link: "/options", label: "Option Tabs" },
];

const IGNORED_KEYS = new Set(["id", "user_id", "created_at", "updated_at", "color", "link", "entry_id"]);

function extractTextFromAny(obj: any, prefix = ""): { key: string; value: string }[] {
  if (obj === null || obj === undefined) return [];
  if (typeof obj !== "object") {
    return [{ key: prefix || "value", value: String(obj) }];
  }
  if (Array.isArray(obj)) {
    return obj.flatMap((item, idx) => extractTextFromAny(item, `${prefix}[${idx + 1}]`));
  }
  return Object.entries(obj).flatMap(([k, v]) => {
    if (IGNORED_KEYS.has(k.toLowerCase()) || k.toLowerCase().endsWith("_id")) return [];
    const nextKey = prefix ? `${prefix}.${k}` : k;
    return extractTextFromAny(v, nextKey);
  });
}

// --- Dynamic Route Resolver for Exact Item Navigation ---
function resolveExactRoute(tableName: string, row: Record<string, any>): { label: string; link: string } {
  const t = tableName.toLowerCase();
  const explicitLink = row.link || row.url || row.path || row.route;

  if (explicitLink) {
    // If table has a pre-saved link (like /events/sangeet), use it directly
    return { label: getTableLabel(t), link: explicitLink };
  }

  const itemId = row.id;

  if (t === "events") {
    return { label: "Events", link: itemId ? `/events/${itemId}` : "/" };
  }
  if (t === "notes") {
    return { label: "Notes", link: itemId ? `/notes/${itemId}` : "/notes" };
  }
  if (t === "chadana") {
    return { label: "Chadana", link: itemId ? `/chadana/${itemId}` : "/chadana" };
  }
  if (t === "gifts" || t === "gift_masterlist") {
    return { label: "Gifts", link: itemId ? `/gifts/${itemId}` : "/gifts" };
  }
  if (t === "guests") {
    return { label: "Guests", link: itemId ? `/guests/${itemId}` : "/guests" };
  }
  if (t === "menus") {
    return { label: "Menus", link: itemId ? `/menus/${itemId}` : "/menus" };
  }
  if (t === "event_items") {
    return { label: "Event Tasks", link: itemId ? `/tasks/${itemId}` : "/tasks" };
  }
  if (t === "budget") {
    return { label: "Budget", link: itemId ? `/budget/${itemId}` : "/budget" };
  }

  const formattedLabel = t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    label: formattedLabel,
    link: itemId ? `/${t}/${itemId}` : `/${t}`,
  };
}

function getTableLabel(t: string): string {
  const found = EXACT_TABLES.find((tbl) => tbl.name === t);
  if (found) return found.label;
  return t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

type AuthMode = "signin" | "signup" | "reset" | "update-password";

export default function Dashboard() {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  const [events, setEvents] = useState<EventItem[]>(defaultEvents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  
  // --- Universal Search State ---
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<UniversalSearchResult[]>([]);
  
  const [newEvent, setNewEvent] = useState<EventItem>({
    name: "", date: "", place: "", link: "", color: "bg-emerald-500",
  });
  const [savingEvent, setSavingEvent] = useState(false);

  // Keyboard shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsAuthorized(true);
        fetchEvents();
      } else {
        const savedEmail = localStorage.getItem("wedding_app_email");
        if (savedEmail) setEmail(savedEmail);
      }
      setIsChecking(false);
    };
    checkUser();
  }, []);

  // --- Universal Schema-Agnostic Deep Scanner with Exact Routing ---
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const q = searchQuery.toLowerCase().trim();
      const allMatches: UniversalSearchResult[] = [];
      const seenIds = new Set<string>();

      // 1. Scan Local/Sidebar Events
      events.forEach((evt, idx) => {
        const searchableText = `${evt.name} ${evt.place || ""} ${evt.date || ""}`.toLowerCase();
        if (searchableText.includes(q)) {
          seenIds.add(`Events-${evt.link}`);
          allMatches.push({
            id: `local-evt-${idx}`,
            category: "Events",
            title: evt.name,
            subtitle: [evt.place, formatDateDisplay(evt.date)].filter(Boolean).join(" • "),
            link: evt.link || "/",
            color: evt.color,
          });
        }
      });

      // 2. Scan every exact table from your schema in parallel
      await Promise.all(
        EXACT_TABLES.map(async ({ name: tableName }) => {
          try {
            const { data, error } = await supabase.from(tableName).select("*").limit(500);
            if (error || !data) return;

            data.forEach((row: Record<string, any>, rowIndex: number) => {
              const flatFields = extractTextFromAny(row);

              const matches = flatFields.filter(({ value }) => value.toLowerCase().includes(q));
              if (matches.length === 0) return;

              const title =
                row.name ||
                row.title ||
                row.item ||
                row.event_name ||
                row.family ||
                row.tab_name ||
                row.label ||
                row.collaborator_email ||
                row.category ||
                matches[0]?.value ||
                "Record";

              const subtitleParts = flatFields
                .filter(({ value }) => value !== String(title) && value.trim() !== "")
                .slice(0, 3)
                .map(({ key, value }) => {
                  const cleanKey = key.split(".").pop()?.replace(/_/g, " ") || key;
                  return `${cleanKey}: ${value}`;
                });

              const resolved = resolveExactRoute(tableName, row);
              const dedupeKey = `${tableName}-${row.id || title}`;
              if (seenIds.has(dedupeKey)) return;
              seenIds.add(dedupeKey);

              allMatches.push({
                id: `${tableName}-${row.id || rowIndex}`,
                category: resolved.label,
                title: String(title),
                subtitle: subtitleParts.join(" • ") || `Found in ${resolved.label}`,
                link: resolved.link,
                color: row.color,
              });
            });
          } catch {
            // Silently handle any query issues
          }
        })
      );

      setSearchResults(allMatches);
      setIsSearching(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, events]);

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
    setNewEvent({ name: "", date: "", place: "", link: "", color: "bg-emerald-500" });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (evt: EventItem) => {
    setEditingEventId(evt.id || null);
    setNewEvent({ name: evt.name, date: evt.date || "", place: evt.place || "", link: evt.link, color: evt.color });
    setIsModalOpen(true);
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (!error) fetchEvents();
    else alert("Error deleting event: " + error.message);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEvent(true);
    const { data: { user } } = await supabase.auth.getUser();
    const generatedLink = newEvent.link || `/events/${newEvent.name.toLowerCase().replace(/\s+/g, '-')}`;

    if (editingEventId) {
      const { error } = await supabase.from("events").update({
          name: newEvent.name, date: newEvent.date || "", place: newEvent.place || "", link: generatedLink, color: newEvent.color,
        }).eq("id", editingEventId);
      if (!error) { setIsModalOpen(false); fetchEvents(); }
    } else {
      const { error } = await supabase.from("events").insert([{
          name: newEvent.name, date: newEvent.date || "", place: newEvent.place || "", link: generatedLink, color: newEvent.color, user_id: user?.id,
        }]);
      if (!error) { setIsModalOpen(false); fetchEvents(); }
    }
    setSavingEvent(false);
  };

  const formatDateDisplay = (dateString?: string) => {
    if (!dateString) return "Date TBD";
    try { return format(parseISO(dateString), "MMM d, yyyy"); } 
    catch { return dateString; }
  };

  const getCategoryIcon = (category: string, color?: string) => {
    const c = category.toLowerCase();
    if (c.includes("event")) return <div className={`w-8 h-8 rounded-full flex items-center justify-center ${color || "bg-emerald-500"} text-white shrink-0`}><CalendarDays className="w-4 h-4" /></div>;
    if (c.includes("note") || c.includes("chadana")) return <div className="w-8 h-8 rounded-full flex items-center justify-center bg-amber-100 text-amber-600 shrink-0"><FileText className="w-4 h-4" /></div>;
    if (c.includes("guest")) return <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 text-blue-600 shrink-0"><Users className="w-4 h-4" /></div>;
    if (c.includes("gift")) return <div className="w-8 h-8 rounded-full flex items-center justify-center bg-pink-100 text-pink-600 shrink-0"><Gift className="w-4 h-4" /></div>;
    if (c.includes("budget")) return <div className="w-8 h-8 rounded-full flex items-center justify-center bg-emerald-100 text-emerald-700 shrink-0"><Wallet className="w-4 h-4" /></div>;
    if (c.includes("menu")) return <div className="w-8 h-8 rounded-full flex items-center justify-center bg-orange-100 text-orange-600 shrink-0"><Utensils className="w-4 h-4" /></div>;
    if (c.includes("task")) return <div className="w-8 h-8 rounded-full flex items-center justify-center bg-rose-100 text-rose-600 shrink-0"><CheckSquare className="w-4 h-4" /></div>;
    return <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-slate-600 shrink-0"><Layers className="w-4 h-4" /></div>;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true); setAuthError(null); setAuthSuccess(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
    else {
      localStorage.setItem("wedding_app_email", email);
      setIsAuthorized(true);
      fetchEvents();
    }
    setAuthLoading(false);
  };

  const targetDate = new Date("2027-01-31");
  const today = new Date();
  const daysToGo = differenceInDays(targetDate, today);
  const weeksToGo = differenceInWeeks(targetDate, today);

  const groupedResults = searchResults.reduce<Record<string, UniversalSearchResult[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  if (isChecking) return null;

  if (!isAuthorized) {
    return (
      <div className="h-[100dvh] w-screen overflow-y-auto flex items-center justify-center bg-slate-50 p-4 sm:p-6">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8 flex flex-col justify-center my-auto">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-serif font-bold text-emerald-900">Welcome Back</h1>
          </div>
          {authError && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-xl">{authError}</div>}
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 text-sm border rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2.5 text-sm border rounded-xl" />
            </div>
            <button type="submit" disabled={authLoading} className="w-full bg-emerald-600 text-white py-3 rounded-xl text-sm font-medium">{authLoading ? "Processing..." : "Sign In"}</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-3 py-4 sm:p-6 md:p-12 w-full max-w-6xl mx-auto space-y-6 md:space-y-10 relative">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-emerald-900 flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-emerald-700 shrink-0" />Wedding Planner
          </h1>
          <p className="text-sm text-slate-500 mt-1">January 31, 2027</p>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="hidden md:flex items-center gap-2.5 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-500 hover:border-emerald-500 hover:text-emerald-700 transition-all shadow-sm w-56 lg:w-72"
          >
            <Search className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate">Search entire app...</span>
            <kbd className="ml-auto text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-sans text-slate-400">⌘K</kbd>
          </button>
          
          <button onClick={() => setIsSearchOpen(true)} className="md:hidden p-3.5 bg-white border border-slate-200 rounded-2xl text-emerald-700 shadow-sm shrink-0">
            <Search className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-2 gap-3 flex-1 md:flex-none md:flex md:gap-4">
            <div className="flex flex-col items-center justify-center bg-emerald-50 border border-emerald-100 px-4 py-4 sm:px-6 rounded-2xl shadow-sm md:min-w-[120px]">
              <span className="text-3xl font-bold text-emerald-700">{daysToGo > 0 ? daysToGo : 0}</span>
              <span className="text-xs font-medium text-emerald-600 uppercase mt-1">Days to go</span>
            </div>
            <div className="flex flex-col items-center justify-center bg-emerald-50 border border-emerald-100 px-4 py-4 sm:px-6 rounded-2xl shadow-sm md:min-w-[120px]">
              <span className="text-3xl font-bold text-emerald-700">{weeksToGo > 0 ? weeksToGo : 0}</span>
              <span className="text-xs font-medium text-emerald-600 uppercase mt-1">Weeks to go</span>
            </div>
          </div>
        </div>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
          <CardTitle className="flex items-center gap-2 text-xl"><CheckCircle2 className="text-emerald-600" /> Event Schedule</CardTitle>
          <button onClick={handleOpenAddModal} className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm w-full sm:w-auto">
            <Plus className="w-4 h-4" /> Add Event
          </button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 p-4 pt-0">
          {events.map((evt, idx) => (
            <div key={evt.id || idx} className="p-4 border rounded-xl flex items-center justify-between gap-3 hover:border-emerald-500 bg-white group">
              <Link href={evt.link} className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-2 h-14 rounded-full shrink-0 ${evt.color}`}></div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{evt.name}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1"><CalendarDays className="w-3.5 h-3.5" /> {formatDateDisplay(evt.date)}</p>
                  {evt.place && <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 truncate"><MapPin className="w-3.5 h-3.5" /> {evt.place}</p>}
                </div>
              </Link>
              <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenEditModal(evt)} className="p-2 text-slate-400 hover:text-emerald-600"><Pencil className="w-4 h-4" /></button>
                {evt.id && <button onClick={() => handleDeleteEvent(evt.id!)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Universal Search Modal with Exact Navigation */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center p-4 pt-16 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center px-4 border-b border-slate-100">
              <Search className="w-5 h-5 text-emerald-600 shrink-0" />
              <input
                type="text" autoFocus value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search budget, chadana, gifts, guests, menus, notes, tasks..."
                className="w-full px-4 py-4 text-base bg-transparent border-none focus:ring-0 outline-none"
              />
              {isSearching ? (
                <Loader2 className="w-5 h-5 text-emerald-500 animate-spin mr-2 shrink-0" />
              ) : (
                <button onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            
            <div className="max-h-[65vh] overflow-y-auto p-3">
              {searchQuery.trim() === "" ? (
                <div className="p-8 text-center text-slate-500 text-sm">Type anything to search across all your tables and JSON columns.</div>
              ) : Object.keys(groupedResults).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(groupedResults).map(([category, items]) => (
                    <div key={category} className="space-y-1">
                      <div className="px-3 py-1.5 text-xs font-semibold text-emerald-800 uppercase bg-slate-50 rounded-lg">{category} ({items.length})</div>
                      {items.map((item) => (
                        <Link href={item.link} key={item.id} onClick={() => setIsSearchOpen(false)} className="flex items-start gap-3 px-3 py-2.5 hover:bg-emerald-50/70 rounded-xl transition-colors">
                          {getCategoryIcon(item.category, item.color)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{item.title}</p>
                            <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{item.subtitle}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              ) : !isSearching ? (
                <div className="p-8 text-center text-slate-500 text-sm">No matches found for &ldquo;{searchQuery}&rdquo;.</div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">{editingEventId ? "Edit Event" : "Add Event"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div><label className="block text-sm font-medium mb-1">Name *</label><input type="text" required value={newEvent.name} onChange={(e) => setNewEvent({...newEvent, name: e.target.value})} className="w-full px-4 py-2 border rounded-xl" /></div>
              <div><label className="block text-sm font-medium mb-1">Date</label><input type="date" value={newEvent.date} onChange={(e) => setNewEvent({...newEvent, date: e.target.value})} className="w-full px-4 py-2 border rounded-xl" /></div>
              <div><label className="block text-sm font-medium mb-1">Place</label><input type="text" value={newEvent.place} onChange={(e) => setNewEvent({...newEvent, place: e.target.value})} className="w-full px-4 py-2 border rounded-xl" /></div>
              <div>
                <label className="block text-sm font-medium mb-1">Theme Color</label>
                <select value={newEvent.color} onChange={(e) => setNewEvent({...newEvent, color: e.target.value})} className="w-full px-4 py-2 border rounded-xl">
                  {colorOptions.map(col => <option key={col.value} value={col.value}>{col.label}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 py-3 rounded-xl font-medium">Cancel</button>
                <button type="submit" disabled={savingEvent} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-medium">{savingEvent ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}