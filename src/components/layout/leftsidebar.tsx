"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {LayoutDashboard,
Gem,CalendarHeart,ClipboardList,Gift,ShoppingBag,Users,IndianRupee,Menu,X,BookIcon,CalendarClock,Handshake,SquareMenu,Search,ArrowUpDown,Folders,LogOut,ShieldCheck,} from "lucide-react";
import { DressIcon } from "@phosphor-icons/react";

import { supabase } from "@/lib/supabase";
import { ADMIN_EMAILS } from "@/lib/admin";

// --- Navigation Data ---
const mainNav = [
  { name: "Admin", href: "/admin", icon: ShieldCheck, adminOnly: true },
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Global Task Board", href: "/global_task_board", icon: ClipboardList },
  { name: "Menu", href: "/menu", icon: SquareMenu },
  { name: "Vendors", href: "/vendors", icon: Handshake },
  { name: "Budget", href: "/budget", icon: IndianRupee, requiresBudget: true },
  { name: "Guests", href: "/guests", icon: Users },
  { name: "Notes", href: "/notes", icon: BookIcon },
  { name: "Task Schedule", href: "/task-schedule", icon: CalendarClock },
  { name: "Chadana", href: "/chadana", icon: Gem },
  { name: "Gifts", href: "/gifts", icon: Gift },
  { name: "Shoping", href: "/shoping", icon: ShoppingBag },
  { name: "All Outfits", href: "/all_outfits", icon: DressIcon },
];

interface EventNavItem {
  name: string;
  href: string;
  color: string;
  date?: string; // Added date for sorting
}

// Ensure defaults match the dashboard exactly
const defaultEvents = [
  { name: "Puja", date: "2027-01-27", link: "/events/puja", color: "bg-orange-500" },
  { name: "Mehendi", date: "2027-01-29", link: "/events/mehendi", color: "bg-emerald-500" },
  { name: "Check In", date: "2027-01-30", link: "/events/check-in", color: "bg-fuchsia-900" },
  { name: "Tilak", date: "2027-01-30", link: "/events/tilak", color: "bg-yellow-900" },
  { name: "Sangeet", date: "2027-01-30", link: "/events/sangeet", color: "bg-indigo-500" },
  { name: "Haldi", date: "2027-01-31", link: "/events/haldi", color: "bg-amber-400" },
  { name: "Phere", date: "2027-01-31", link: "/events/phere", color: "bg-red-500" },
  { name: "Reception", date: "2027-01-31", link: "/events/reception", color: "bg-fuchsia-600" },
  { name: "Pagphere", date: "2027-02-01", link: "/events/pagphere", color: "bg-cyan-500" },
  { name: "Vidai", date: "2027-02-01", link: "/events/vidai", color: "bg-pink-400" },
];

export default function Sidebar() {
  const pathname = usePathname();

  // --- State ---
  const [email, setEmail] = useState("");
  const [hasBudgetAccess, setHasBudgetAccess] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [mainSortOrder, setMainSortOrder] = useState("recommended");
  const [eventSortOrder, setEventSortOrder] = useState("date"); // Changed default to 'date'

  // Dynamic Event Navigation State
  const [eventNav, setEventNav] = useState<EventNavItem[]>([]);

  // --- Authentication / Admin Check & Event Fetching ---
  useEffect(() => {
    const getUserInfo = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const userEmail = user?.email ?? "";
      setEmail(userEmail);

      if (ADMIN_EMAILS.includes(userEmail)) {
        setHasBudgetAccess(true);
      } else if (userEmail) {
        const { data } = await supabase
          .from("user_roles")
          .select("can_view_budget")
          .eq("email", userEmail)
          .single();

        if (data?.can_view_budget) {
          setHasBudgetAccess(true);
        }
      }
    };

    const fetchEvents = async () => {
      const { data, error } = await supabase.from("events").select("*");
      
      let combinedEvents = [...defaultEvents];

      if (!error && data) {
        // Find default events that have been saved to DB and remove them so they aren't duplicated
        const dbEventLinks = data.map(evt => evt.link);
        const untouchedDefaults = defaultEvents.filter(evt => !dbEventLinks.includes(evt.link));

        combinedEvents = [...untouchedDefaults, ...data];
      }

      const mappedEvents: EventNavItem[] = combinedEvents.map((evt) => ({
        name: evt.name,
        href: evt.link || `/events/${evt.name.toLowerCase().replace(/\s+/g, '-')}`,
        color: evt.color || "bg-emerald-500",
        date: evt.date || "9999-12-31", // Fallback for dateless events so they go to the bottom
      }));
      
      setEventNav(mappedEvents);
    };

    getUserInfo();
    fetchEvents();
  }, []);

  const isAdmin = ADMIN_EMAILS.includes(email);

  // --- Logout Logic ---
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  // --- Filter & Sort Logic for Main Nav ---
  const filteredMainNav = useMemo(() => {
    let result = mainNav.filter(
      (item) =>
        (!item.adminOnly || isAdmin) &&
        (!item.requiresBudget || isAdmin || hasBudgetAccess)
    );

    if (searchQuery.trim()) {
      result = result.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (mainSortOrder === "asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (mainSortOrder === "desc") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }

    return result;
  }, [searchQuery, mainSortOrder, isAdmin, hasBudgetAccess]);

  // --- Filter & Sort Logic for Event Nav ---
  const filteredEventNav = useMemo(() => {
    let result = [...eventNav];

    if (searchQuery.trim()) {
      result = result.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (eventSortOrder === "asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (eventSortOrder === "desc") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else if (eventSortOrder === "date") {
      // Explicitly sort by date chronologically
      result.sort((a, b) => {
        const dateA = a.date || "9999-12-31";
        const dateB = b.date || "9999-12-31";
        return dateA.localeCompare(dateB);
      });
    }

    return result;
  }, [searchQuery, eventSortOrder, eventNav]);

  return (
    <>
      {/* Mobile Top Header Bar */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur-md border-b border-slate-200 z-40 flex items-center px-4 md:hidden">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 bg-slate-50 border border-slate-200 rounded-xl shadow-sm"
        >
          <Menu className="w-5 h-5 text-emerald-900" />
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-screen w-64 bg-white dark:bg-slate-950 border-r border-slate-100 dark:border-slate-800 z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="p-6 flex-1 overflow-y-auto">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 md:hidden"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mb-6 mt-4 md:mt-0 w-full flex flex-col items-center justify-center">
            <Image
              src="/logo.png"
              alt="Wedding Logo"
              width={64}
              height={64}
              className="w-16 h-16 object-contain"
            />
             <p className="text-xs text-slate-400 tracking-widest uppercase mt-3">
               Nimisha & Prajanya
             </p>
           </div>

          <div className="relative w-full mb-8">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search everything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-800"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {(filteredMainNav.length > 0 || searchQuery) && (
            <div className="mb-8">
              <div className="px-3 mb-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  <Folders className="w-3.5 h-3.5" /> Main Functions
                </div>
                
                <div className="relative w-6 h-6 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors shrink-0" title="Sort Main Functions">
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  <select
                    value={mainSortOrder}
                    onChange={(e) => setMainSortOrder(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  >
                    <option value="recommended">Recommended</option>
                    <option value="asc">A to Z</option>
                    <option value="desc">Z to A</option>
                  </select>
                </div>
              </div>

              <nav className="space-y-1">
                {filteredMainNav.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-2">No functions found</p>
                )}
                {filteredMainNav.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => {
                        setIsOpen(false);
                        setSearchQuery("");
                      }}
                    >
                      <div
                        className={`relative flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${
                          isActive
                            ? "text-emerald-700 font-medium"
                            : "text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="active-nav"
                            className="absolute inset-0 bg-emerald-50 rounded-lg"
                          />
                        )}
                        <Icon
                          className={`w-5 h-5 relative z-10 ${
                            isActive ? "text-emerald-600" : "text-slate-400"
                          }`}
                        />
                        <span className="relative z-10 text-sm">{item.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}

          {(filteredEventNav.length > 0 || searchQuery) && (
            <div className="mb-6">
              <div className="px-3 mb-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  <CalendarHeart className="w-3.5 h-3.5" /> Wedding Events
                </div>

                <div className="relative w-6 h-6 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors shrink-0" title="Sort Wedding Events">
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  <select
                    value={eventSortOrder}
                    onChange={(e) => setEventSortOrder(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  >
                    <option value="date">By Date</option>
                    <option value="asc">A to Z</option>
                    <option value="desc">Z to A</option>
                  </select>
                </div>
              </div>

              <nav className="space-y-1">
                {filteredEventNav.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-2">No events found</p>
                )}
                {filteredEventNav.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => {
                      setIsOpen(false);
                      setSearchQuery("");
                    }}
                  >
                    <div
                      className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                        pathname === item.href
                          ? "bg-slate-50 font-medium"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${item.color}`} />
                        <span className="text-sm text-slate-600">{item.name}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </nav>
            </div>
          )}

          {/* --- Profile and Logout Section (Scrollable) --- */}
          <div className="pt-4 border-t border-slate-100 bg-slate-50/50 -mx-6 -mb-6 p-4">
            {email ? (
              <div className="flex items-center justify-between gap-3 bg-white border border-slate-200 p-2 rounded-xl shadow-sm">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <span className="text-xs font-semibold text-slate-700 truncate" title={email}>
                    {email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Log Out</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}