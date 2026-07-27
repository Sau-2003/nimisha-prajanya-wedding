// // // // // // "use client";

// // // // // // import { useState, useMemo } from 'react';
// // // // // // import Link from 'next/link';
// // // // // // import { usePathname, useRouter } from 'next/navigation';
// // // // // // import { motion } from 'framer-motion';
// // // // // // import { 
// // // // // //   LayoutDashboard, Gem, CalendarHeart, ClipboardList, Gift,
// // // // // //   ShoppingBag, Users, IndianRupee, Menu, X, BookIcon, CalendarClock, Handshake, SquareMenu, Search, ArrowUpDown
// // // // // // } from 'lucide-react';
// // // // // // import Image from "next/image";
// // // // // // import { DressIcon } from '@phosphor-icons/react';
// // // // // // import { useEffect } from "react";
// // // // // // import { supabase } from "@/lib/supabase";

// // // // // // const mainNav = [
// // // // // //   { name: 'Dashboard', href: '/', icon: LayoutDashboard },
// // // // // //   { name: 'Global Task Board', href: '/global_task_board', icon: ClipboardList },
// // // // // //   { name: 'Menu', href: '/menu', icon: SquareMenu },
// // // // // //   { name: 'Vendor Tracker', href: '/vendors', icon: Handshake },
// // // // // //   { name: 'Budget', href: '/budget', icon: IndianRupee, adminOnly: true },
// // // // // //   { name: 'Guests', href: '/guests', icon: Users },
// // // // // //   { name: 'Notes', href: '/notes', icon: BookIcon },
// // // // // //   { name: 'Task Schedule', href: '/task-schedule', icon: CalendarClock },
// // // // // //   { name: 'Chadana', href: '/chadana', icon: Gem },
// // // // // //   { name: 'Gifts', href: '/gifts', icon: Gift },
// // // // // //   { name: 'Shoping', href: '/shoping', icon: ShoppingBag },
// // // // // //   { name: 'All Outfits', href: '/all_outfits', icon: DressIcon },
// // // // // //   { name: 'Admin', href: '/admin', icon: LayoutDashboard },
// // // // // // ];

// // // // // // const eventNav = [
// // // // // //   { name: 'Puja',      href: '/events/puja',      color: 'bg-orange-500' },
// // // // // //   { name: 'Mehendi',   href: '/events/mehendi',   color: 'bg-emerald-500' },
// // // // // //   { name: 'Check In',  href: '/events/check-in',  color: 'bg-fuscia-900' },
// // // // // //   { name: 'Tilak',     href: '/events/tilak',     color: 'bg-yellow-900' },
// // // // // //   { name: 'Sangeet',   href: '/events/sangeet',   color: 'bg-indigo-500' },
// // // // // //   { name: 'Haldi',     href: '/events/haldi',     color: 'bg-amber-400' },
// // // // // //   { name: 'Reception', href: '/events/reception', color: 'bg-fuchsia-600' },
// // // // // //   { name: 'Phere',     href: '/events/phere',     color: 'bg-red-500' },
// // // // // //   { name: 'Pagphere',  href: '/events/pagphere',  color: 'bg-cyan-500' },
// // // // // //   { name: 'Vidai',     href: '/events/vidai',     color: 'bg-pink-400' },
// // // // // // ];

// // // // // // const [email, setEmail] = useState("");

// // // // // // useEffect(() => {
// // // // // //   const getUser = async () => {
// // // // // //     const {
// // // // // //       data: { user },
// // // // // //     } = await supabase.auth.getUser();

// // // // // //     setEmail(user?.email ?? "");
// // // // // //   };

// // // // // //   getUser();
// // // // // // }, []);

// // // // // // const adminEmails = [
// // // // // //   "saumyajain617@gmail.com",
// // // // // // ];

// // // // // // const isAdmin = adminEmails.includes(email);

// // // // // // export function Sidebar() {
// // // // // //   const pathname = usePathname();
// // // // // //   const router = useRouter();
// // // // // //   const [isOpen, setIsOpen] = useState(false);
// // // // // //   const [searchQuery, setSearchQuery] = useState('');
// // // // // //   const [sortOrder, setSortOrder] = useState('recommended'); // 'recommended', 'asc', 'desc'

// // // // // //   // Filter and Sort Main Nav
// // // // // //   const filteredMainNav = useMemo(() => {
// // // // // //     let result = [...mainNav];
    
// // // // // //     if (searchQuery.trim()) {
// // // // // //       result = result.filter(item => 
// // // // // //         item.name.toLowerCase().includes(searchQuery.toLowerCase())
// // // // // //       );
// // // // // //     }

// // // // // //     if (sortOrder === 'asc') {
// // // // // //       result.sort((a, b) => a.name.localeCompare(b.name));
// // // // // //     } else if (sortOrder === 'desc') {
// // // // // //       result.sort((a, b) => b.name.localeCompare(a.name));
// // // // // //     }

// // // // // //     return result;
// // // // // //   }, [searchQuery, sortOrder]);

// // // // // //   // Filter and Sort Event Nav
// // // // // //   const filteredEventNav = useMemo(() => {
// // // // // //     let result = [...eventNav];
    
// // // // // //     if (searchQuery.trim()) {
// // // // // //       result = result.filter(item => 
// // // // // //         item.name.toLowerCase().includes(searchQuery.toLowerCase())
// // // // // //       );
// // // // // //     }

// // // // // //     if (sortOrder === 'asc') {
// // // // // //       result.sort((a, b) => a.name.localeCompare(b.name));
// // // // // //     } else if (sortOrder === 'desc') {
// // // // // //       result.sort((a, b) => b.name.localeCompare(a.name));
// // // // // //     }

// // // // // //     return result;
// // // // // //   }, [searchQuery, sortOrder]);

// // // // // //   return (
// // // // // //     <>
// // // // // //       <button 
// // // // // //         onClick={() => setIsOpen(true)}
// // // // // //         className="fixed top-4 left-4 z-40 p-2 bg-white border border-slate-200 rounded-lg shadow-sm md:hidden"
// // // // // //       >
// // // // // //         <Menu className="w-6 h-6 text-emerald-900" />
// // // // // //       </button>

// // // // // //       {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsOpen(false)} />}

// // // // // //       <div className={`fixed top-0 left-0 h-screen w-64 bg-white dark:bg-slate-950 border-r border-slate-100 dark:border-slate-800 z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 overflow-y-auto`}>
// // // // // //         <div className="p-6">
// // // // // //           <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 md:hidden">
// // // // // //             <X className="w-5 h-5" />
// // // // // //           </button>

// // // // // //           <div className="mb-6 mt-4 md:mt-0 w-full flex flex-col items-center justify-center">            
// // // // // //              <Image src="/logo.png"
// // // // // //               alt="Wedding Logo" 
// // // // // //               width={64}
// // // // // //               height={64}
// // // // // //               className="w-16 h-16 object-contain"
// // // // // //              />
// // // // // //             <p className="text-xs text-slate-400 tracking-widest uppercase mt-1">Wedding Planner</p>
// // // // // //           </div>

// // // // // //           {/* Search & Sort Row */}
// // // // // //           <div className="flex items-center gap-2 mb-6 w-full">
// // // // // //             {/* Search Bar */}
// // // // // //             <div className="relative flex-1">
// // // // // //               <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
// // // // // //               <input 
// // // // // //                 type="text"
// // // // // //                 placeholder="Search..."
// // // // // //                 value={searchQuery}
// // // // // //                 onChange={(e) => setSearchQuery(e.target.value)}
// // // // // //                 className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-800"
// // // // // //               />
// // // // // //               {searchQuery && (
// // // // // //                 <button 
// // // // // //                   onClick={() => setSearchQuery('')}
// // // // // //                   className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
// // // // // //                 >
// // // // // //                   <X className="w-3.5 h-3.5" />
// // // // // //                 </button>
// // // // // //               )}
// // // // // //             </div>

// // // // // //             {/* Sorter */}
// // // // // //             <div className="relative shrink-0">
// // // // // //               <ArrowUpDown className="absolute left-2 top-2 w-3 h-3 text-slate-400 pointer-events-none" />              <select
// // // // // //                 value={sortOrder}
// // // // // //                 onChange={(e) => setSortOrder(e.target.value)}
// // // // // //                 className="w-3 pl-6 pr-3 py-1 text-[11px] font-medium bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-600 cursor-pointer appearance-none"                
// // // // // //                 style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
// // // // // //               >
// // // // // //                 <option value="recommended">Recommended</option>
// // // // // //                 <option value="asc">A to Z</option>
// // // // // //                 <option value="desc">Z to A</option>
// // // // // //               </select>
// // // // // //             </div>
// // // // // //           </div>

// // // // // //           <nav className="space-y-1 mb-8">
// // // // // //             {filteredMainNav.length === 0 && filteredEventNav.length === 0 && (
// // // // // //               <p className="text-xs text-slate-400 text-center py-4">No results found</p>
// // // // // //             )}

// // // // // //             {filteredMainNav.map((item) => {
// // // // // //               const isActive = pathname === item.href;
// // // // // //               const Icon = item.icon;
// // // // // //               return (
// // // // // //                 <Link key={item.name} href={item.href} onClick={() => { setIsOpen(false); setSearchQuery(''); }}>
// // // // // //                   <div className={`relative flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${isActive ? 'text-emerald-700 font-medium' : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'}`}>
// // // // // //                     {isActive && (
// // // // // //                       <motion.div layoutId="active-nav" className="absolute inset-0 bg-emerald-50 rounded-lg" />
// // // // // //                     )}
// // // // // //                     <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
// // // // // //                     <span className="relative z-10 text-sm">{item.name}</span>
// // // // // //                   </div>
// // // // // //                 </Link>
// // // // // //               );
// // // // // //             })}
// // // // // //           </nav>

// // // // // //           {filteredEventNav.length > 0 && (
// // // // // //             <div>
// // // // // //               <div className="px-3 mb-2 flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
// // // // // //                 <CalendarHeart className="w-4 h-4" /> Wedding Events
// // // // // //               </div>
// // // // // //               <nav className="space-y-1">
// // // // // //                 {filteredEventNav.map((item) => (
// // // // // //                   <Link key={item.name} href={item.href} onClick={() => { setIsOpen(false); setSearchQuery(''); }}>
// // // // // //                     <div className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${pathname === item.href ? 'bg-slate-50 font-medium' : 'hover:bg-slate-50'}`}>
// // // // // //                       <div className="flex items-center gap-3">
// // // // // //                         <div className={`w-2 h-2 rounded-full ${item.color}`} />
// // // // // //                         <span className="text-sm text-slate-600">{item.name}</span>
// // // // // //                       </div>
// // // // // //                     </div>
// // // // // //                   </Link>
// // // // // //                 ))}
// // // // // //               </nav>
// // // // // //             </div>
// // // // // //           )}
// // // // // //         </div>
// // // // // //       </div>
// // // // // //     </>
// // // // // //   );
// // // // // // }
// // // // "use client";

// // // // import { useState, useMemo, useEffect } from "react";
// // // // import Link from "next/link";
// // // // import { usePathname } from "next/navigation";
// // // // import Image from "next/image";
// // // // import { motion } from "framer-motion";
// // // // import {LayoutDashboard,Gem,CalendarHeart,ClipboardList,Gift,ShoppingBag,Users,IndianRupee,Menu,X,BookIcon,CalendarClock,Handshake,SquareMenu,Search,ArrowUpDown,} from "lucide-react";
// // // // import { DressIcon } from "@phosphor-icons/react";

// // // // import { supabase } from "@/lib/supabase";
// // // // import { ADMIN_EMAILS } from "@/lib/admin";

// // // // // --- Navigation Data ---
// // // // const mainNav = [
// // // //   { name: "Dashboard", href: "/", icon: LayoutDashboard },
// // // //   { name: "Global Task Board", href: "/global_task_board", icon: ClipboardList },
// // // //   { name: "Menu", href: "/menu", icon: SquareMenu },
// // // //   { name: "Vendor Tracker", href: "/vendors", icon: Handshake },
// // // //   { name: "Budget", href: "/budget", icon: IndianRupee, adminOnly: true },
// // // //   { name: "Guests", href: "/guests", icon: Users },
// // // //   { name: "Notes", href: "/notes", icon: BookIcon },
// // // //   { name: "Task Schedule", href: "/task-schedule", icon: CalendarClock },
// // // //   { name: "Chadana", href: "/chadana", icon: Gem },
// // // //   { name: "Gifts", href: "/gifts", icon: Gift },
// // // //   { name: "Shoping", href: "/shoping", icon: ShoppingBag },
// // // //   { name: "All Outfits", href: "/all_outfits", icon: DressIcon },
// // // //   { name: "Admin", href: "/admin", icon: LayoutDashboard, adminOnly: true },
// // // // ];

// // // // const eventNav = [
// // // //   { name: "Puja", href: "/events/puja", color: "bg-orange-500" },
// // // //   { name: "Mehendi", href: "/events/mehendi", color: "bg-emerald-500" },
// // // //   { name: "Check In", href: "/events/check-in", color: "bg-fuscia-900" },
// // // //   { name: "Tilak", href: "/events/tilak", color: "bg-yellow-900" },
// // // //   { name: "Sangeet", href: "/events/sangeet", color: "bg-indigo-500" },
// // // //   { name: "Haldi", href: "/events/haldi", color: "bg-amber-400" },
// // // //   { name: "Reception", href: "/events/reception", color: "bg-fuchsia-600" },
// // // //   { name: "Phere", href: "/events/phere", color: "bg-red-500" },
// // // //   { name: "Pagphere", href: "/events/pagphere", color: "bg-cyan-500" },
// // // //   { name: "Vidai", href: "/events/vidai", color: "bg-pink-400" },
// // // // ];

// // // // export function Sidebar() {
// // // //   const pathname = usePathname();

// // // //   // --- State ---
// // // //   const [email, setEmail] = useState("");
// // // //   const [isOpen, setIsOpen] = useState(false);
// // // //   const [searchQuery, setSearchQuery] = useState("");
// // // //   const [sortOrder, setSortOrder] = useState("recommended");

// // // //   // --- Authentication / Admin Check ---
// // // //   useEffect(() => {
// // // //     const getUser = async () => {
// // // //       const {
// // // //         data: { user },
// // // //       } = await supabase.auth.getUser();

// // // //       setEmail(user?.email ?? "");
// // // //     };

// // // //     getUser();
// // // //   }, []);

// // // //   const isAdmin = ADMIN_EMAILS.includes(email);

// // // //   // --- Filter & Sort Logic ---
// // // //   const filteredMainNav = useMemo(() => {
// // // //     let result = mainNav.filter((item) => !item.adminOnly || isAdmin);

// // // //     if (searchQuery.trim()) {
// // // //       result = result.filter((item) =>
// // // //         item.name.toLowerCase().includes(searchQuery.toLowerCase())
// // // //       );
// // // //     }

// // // //     if (sortOrder === "asc") {
// // // //       result.sort((a, b) => a.name.localeCompare(b.name));
// // // //     } else if (sortOrder === "desc") {
// // // //       result.sort((a, b) => b.name.localeCompare(a.name));
// // // //     }

// // // //     return result;
// // // //   }, [searchQuery, sortOrder, isAdmin]);

// // // //   const filteredEventNav = useMemo(() => {
// // // //     let result = [...eventNav];

// // // //     if (searchQuery.trim()) {
// // // //       result = result.filter((item) =>
// // // //         item.name.toLowerCase().includes(searchQuery.toLowerCase())
// // // //       );
// // // //     }

// // // //     if (sortOrder === "asc") {
// // // //       result.sort((a, b) => a.name.localeCompare(b.name));
// // // //     } else if (sortOrder === "desc") {
// // // //       result.sort((a, b) => b.name.localeCompare(a.name));
// // // //     }

// // // //     return result;
// // // //   }, [searchQuery, sortOrder]);

// // // //   return (
// // // //     <>
// // // //       {/* Mobile Menu Toggle Button */}
// // // //       <button
// // // //         onClick={() => setIsOpen(true)}
// // // //         className="fixed top-4 left-4 z-40 p-2 bg-white border border-slate-200 rounded-lg shadow-sm md:hidden"
// // // //       >
// // // //         <Menu className="w-6 h-6 text-emerald-900" />
// // // //       </button>

// // // //       {/* Mobile Overlay */}
// // // //       {isOpen && (
// // // //         <div
// // // //           className="fixed inset-0 bg-black/50 z-40 md:hidden"
// // // //           onClick={() => setIsOpen(false)}
// // // //         />
// // // //       )}

// // // //       {/* Sidebar Container */}
// // // //       <div
// // // //         className={`fixed top-0 left-0 h-screen w-64 bg-white dark:bg-slate-950 border-r border-slate-100 dark:border-slate-800 z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
// // // //           isOpen ? "translate-x-0" : "-translate-x-full"
// // // //         } md:translate-x-0`}
// // // //       >
// // // //         <div className="p-6">
// // // //           {/* Mobile Close Button */}
// // // //           <button
// // // //             onClick={() => setIsOpen(false)}
// // // //             className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 md:hidden"
// // // //           >
// // // //             <X className="w-5 h-5" />
// // // //           </button>

// // // //           {/* Logo Section */}
// // // //           <div className="mb-6 mt-4 md:mt-0 w-full flex flex-col items-center justify-center">
// // // //             <Image
// // // //               src="/logo.png"
// // // //               alt="Wedding Logo"
// // // //               width={64}
// // // //               height={64}
// // // //               className="w-16 h-16 object-contain"
// // // //             />
// // // //             <p className="text-xs text-slate-400 tracking-widest uppercase mt-1">
// // // //               Wedding Planner
// // // //             </p>
// // // //           </div>

// // // //           {/* Search & Sort Row */}
// // // //           <div className="flex items-center gap-2 mb-6 w-full">
            
// // // //             {/* Search Bar */}
// // // //             <div className="relative flex-1">
// // // //               <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
// // // //               <input
// // // //                 type="text"
// // // //                 placeholder="Search..."
// // // //                 value={searchQuery}
// // // //                 onChange={(e) => setSearchQuery(e.target.value)}
// // // //                 className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-800"
// // // //               />
// // // //               {searchQuery && (
// // // //                 <button
// // // //                   onClick={() => setSearchQuery("")}
// // // //                   className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
// // // //                 >
// // // //                   <X className="w-3.5 h-3.5" />
// // // //                 </button>
// // // //               )}
// // // //             </div>

// // // //             {/* Sorter */}
// // // //             <div className="relative shrink-0">
// // // //               <ArrowUpDown className="absolute left-2 top-2 w-3 h-3 text-slate-400 pointer-events-none" />
// // // //               <select
// // // //                 value={sortOrder}
// // // //                 onChange={(e) => setSortOrder(e.target.value)}
// // // //                 className="w-3 pl-6 pr-3 py-1 text-[11px] font-medium bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-600 cursor-pointer appearance-none"
// // // //                 style={{ WebkitAppearance: "none", MozAppearance: "none" }}
// // // //               >
// // // //                 <option value="recommended">Recommended</option>
// // // //                 <option value="asc">A to Z</option>
// // // //                 <option value="desc">Z to A</option>
// // // //               </select>
// // // //             </div>
// // // //           </div>

// // // //           {/* Main Navigation */}
// // // //           <nav className="space-y-1 mb-8">
// // // //             {filteredMainNav.length === 0 && filteredEventNav.length === 0 && (
// // // //               <p className="text-xs text-slate-400 text-center py-4">
// // // //                 No results found
// // // //               </p>
// // // //             )}

// // // //             {filteredMainNav.map((item) => {
// // // //               const isActive = pathname === item.href;
// // // //               const Icon = item.icon;
// // // //               return (
// // // //                 <Link
// // // //                   key={item.name}
// // // //                   href={item.href}
// // // //                   onClick={() => {
// // // //                     setIsOpen(false);
// // // //                     setSearchQuery("");
// // // //                   }}
// // // //                 >
// // // //                   <div
// // // //                     className={`relative flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${
// // // //                       isActive
// // // //                         ? "text-emerald-700 font-medium"
// // // //                         : "text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
// // // //                     }`}
// // // //                   >
// // // //                     {isActive && (
// // // //                       <motion.div
// // // //                         layoutId="active-nav"
// // // //                         className="absolute inset-0 bg-emerald-50 rounded-lg"
// // // //                       />
// // // //                     )}
// // // //                     <Icon
// // // //                       className={`w-5 h-5 relative z-10 ${
// // // //                         isActive ? "text-emerald-600" : "text-slate-400"
// // // //                       }`}
// // // //                     />
// // // //                     <span className="relative z-10 text-sm">{item.name}</span>
// // // //                   </div>
// // // //                 </Link>
// // // //               );
// // // //             })}
// // // //           </nav>

// // // //           {/* Event Navigation */}
// // // //           {filteredEventNav.length > 0 && (
// // // //             <div>
// // // //               <div className="px-3 mb-2 flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
// // // //                 <CalendarHeart className="w-4 h-4" /> Wedding Events
// // // //               </div>
// // // //               <nav className="space-y-1">
// // // //                 {filteredEventNav.map((item) => (
// // // //                   <Link
// // // //                     key={item.name}
// // // //                     href={item.href}
// // // //                     onClick={() => {
// // // //                       setIsOpen(false);
// // // //                       setSearchQuery("");
// // // //                     }}
// // // //                   >
// // // //                     <div
// // // //                       className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
// // // //                         pathname === item.href
// // // //                           ? "bg-slate-50 font-medium"
// // // //                           : "hover:bg-slate-50"
// // // //                       }`}
// // // //                     >
// // // //                       <div className="flex items-center gap-3">
// // // //                         <div
// // // //                           className={`w-2 h-2 rounded-full ${item.color}`}
// // // //                         />
// // // //                         <span className="text-sm text-slate-600">
// // // //                           {item.name}
// // // //                         </span>
// // // //                       </div>
// // // //                     </div>
// // // //                   </Link>
// // // //                 ))}
// // // //               </nav>
// // // //             </div>
// // // //           )}
// // // //         </div>
// // // //       </div>
// // // //     </>
// // // //   );
// // // // }
// // // "use client";

// // // import { useState, useMemo, useEffect } from "react";
// // // import Link from "next/link";
// // // import { usePathname } from "next/navigation";
// // // import Image from "next/image";
// // // import { motion } from "framer-motion";
// // // import {
// // //   LayoutDashboard,
// // //   Gem,
// // //   CalendarHeart,
// // //   ClipboardList,
// // //   Gift,
// // //   ShoppingBag,
// // //   Users,
// // //   IndianRupee,
// // //   Menu,
// // //   X,
// // //   BookIcon,
// // //   CalendarClock,
// // //   Handshake,
// // //   SquareMenu,
// // //   Search,
// // //   ArrowUpDown,
// // //   Folders
// // // } from "lucide-react";
// // // import { DressIcon } from "@phosphor-icons/react";

// // // import { supabase } from "@/lib/supabase";
// // // import { ADMIN_EMAILS } from "@/lib/admin";

// // // // --- Navigation Data ---
// // // const mainNav = [
// // //   { name: "Dashboard", href: "/", icon: LayoutDashboard },
// // //   { name: "Global Task Board", href: "/global_task_board", icon: ClipboardList },
// // //   { name: "Menu", href: "/menu", icon: SquareMenu },
// // //   { name: "Vendor Tracker", href: "/vendors", icon: Handshake },
// // //   { name: "Budget", href: "/budget", icon: IndianRupee, adminOnly: true },
// // //   { name: "Guests", href: "/guests", icon: Users },
// // //   { name: "Notes", href: "/notes", icon: BookIcon },
// // //   { name: "Task Schedule", href: "/task-schedule", icon: CalendarClock },
// // //   { name: "Chadana", href: "/chadana", icon: Gem },
// // //   { name: "Gifts", href: "/gifts", icon: Gift },
// // //   { name: "Shoping", href: "/shoping", icon: ShoppingBag },
// // //   { name: "All Outfits", href: "/all_outfits", icon: DressIcon },
// // //   { name: "Admin", href: "/admin", icon: LayoutDashboard, adminOnly: true },
// // // ];

// // // const eventNav = [
// // //   { name: "Puja", href: "/events/puja", color: "bg-orange-500" },
// // //   { name: "Mehendi", href: "/events/mehendi", color: "bg-emerald-500" },
// // //   { name: "Check In", href: "/events/check-in", color: "bg-fuscia-900" },
// // //   { name: "Tilak", href: "/events/tilak", color: "bg-yellow-900" },
// // //   { name: "Sangeet", href: "/events/sangeet", color: "bg-indigo-500" },
// // //   { name: "Haldi", href: "/events/haldi", color: "bg-amber-400" },
// // //   { name: "Reception", href: "/events/reception", color: "bg-fuchsia-600" },
// // //   { name: "Phere", href: "/events/phere", color: "bg-red-500" },
// // //   { name: "Pagphere", href: "/events/pagphere", color: "bg-cyan-500" },
// // //   { name: "Vidai", href: "/events/vidai", color: "bg-pink-400" },
// // // ];

// // // export function Sidebar() {
// // //   const pathname = usePathname();

// // //   // --- State ---
// // //   const [email, setEmail] = useState("");
// // //   const [isOpen, setIsOpen] = useState(false);
// // //   const [searchQuery, setSearchQuery] = useState("");
  
// // //   // Split sorting into two separate states
// // //   const [mainSortOrder, setMainSortOrder] = useState("recommended");
// // //   const [eventSortOrder, setEventSortOrder] = useState("recommended");

// // //   // --- Authentication / Admin Check ---
// // //   useEffect(() => {
// // //     const getUser = async () => {
// // //       const {
// // //         data: { user },
// // //       } = await supabase.auth.getUser();

// // //       setEmail(user?.email ?? "");
// // //     };

// // //     getUser();
// // //   }, []);

// // //   const isAdmin = ADMIN_EMAILS.includes(email);

// // //   // --- Filter & Sort Logic for Main Nav ---
// // //   const filteredMainNav = useMemo(() => {
// // //     let result = mainNav.filter((item) => !item.adminOnly || isAdmin);

// // //     if (searchQuery.trim()) {
// // //       result = result.filter((item) =>
// // //         item.name.toLowerCase().includes(searchQuery.toLowerCase())
// // //       );
// // //     }

// // //     if (mainSortOrder === "asc") {
// // //       result.sort((a, b) => a.name.localeCompare(b.name));
// // //     } else if (mainSortOrder === "desc") {
// // //       result.sort((a, b) => b.name.localeCompare(a.name));
// // //     }

// // //     return result;
// // //   }, [searchQuery, mainSortOrder, isAdmin]);

// // //   // --- Filter & Sort Logic for Event Nav ---
// // //   const filteredEventNav = useMemo(() => {
// // //     let result = [...eventNav];

// // //     if (searchQuery.trim()) {
// // //       result = result.filter((item) =>
// // //         item.name.toLowerCase().includes(searchQuery.toLowerCase())
// // //       );
// // //     }

// // //     if (eventSortOrder === "asc") {
// // //       result.sort((a, b) => a.name.localeCompare(b.name));
// // //     } else if (eventSortOrder === "desc") {
// // //       result.sort((a, b) => b.name.localeCompare(a.name));
// // //     }

// // //     return result;
// // //   }, [searchQuery, eventSortOrder]);

// // //   return (
// // //     <>
// // //       {/* Mobile Menu Toggle Button */}
// // //       <button
// // //         onClick={() => setIsOpen(true)}
// // //         className="fixed top-4 left-4 z-40 p-2 bg-white border border-slate-200 rounded-lg shadow-sm md:hidden"
// // //       >
// // //         <Menu className="w-6 h-6 text-emerald-900" />
// // //       </button>

// // //       {/* Mobile Overlay */}
// // //       {isOpen && (
// // //         <div
// // //           className="fixed inset-0 bg-black/50 z-40 md:hidden"
// // //           onClick={() => setIsOpen(false)}
// // //         />
// // //       )}

// // //       {/* Sidebar Container */}
// // //       <div
// // //         className={`fixed top-0 left-0 h-screen w-64 bg-white dark:bg-slate-950 border-r border-slate-100 dark:border-slate-800 z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
// // //           isOpen ? "translate-x-0" : "-translate-x-full"
// // //         } md:translate-x-0`}
// // //       >
// // //         <div className="p-6">
// // //           {/* Mobile Close Button */}
// // //           <button
// // //             onClick={() => setIsOpen(false)}
// // //             className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 md:hidden"
// // //           >
// // //             <X className="w-5 h-5" />
// // //           </button>

// // //           {/* Logo Section */}
// // //           <div className="mb-6 mt-4 md:mt-0 w-full flex flex-col items-center justify-center">
// // //             <Image
// // //               src="/logo.png"
// // //               alt="Wedding Logo"
// // //               width={64}
// // //               height={64}
// // //               className="w-16 h-16 object-contain"
// // //             />
// // //             <p className="text-xs text-slate-400 tracking-widest uppercase mt-1">
// // //               Wedding Planner
// // //             </p>
// // //           </div>

// // //           {/* Global Search Bar */}
// // //           <div className="relative w-full mb-8">
// // //             <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
// // //             <input
// // //               type="text"
// // //               placeholder="Search everything..."
// // //               value={searchQuery}
// // //               onChange={(e) => setSearchQuery(e.target.value)}
// // //               className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-800"
// // //             />
// // //             {searchQuery && (
// // //               <button
// // //                 onClick={() => setSearchQuery("")}
// // //                 className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
// // //               >
// // //                 <X className="w-3.5 h-3.5" />
// // //               </button>
// // //             )}
// // //           </div>

// // //           {/* MAIN FUNCTIONS SECTION */}
// // //           {(filteredMainNav.length > 0 || searchQuery) && (
// // //             <div className="mb-8">
// // //               {/* Main Functions Header & Sorter */}
// // //               <div className="px-3 mb-3 flex items-center justify-between">
// // //                 <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
// // //                   <Folders className="w-4 h-4" /> Main Functions
// // //                 </div>
                
// // //                 {/* Main Nav Sorter */}
// // //                 <div className="relative shrink-0">
// // //                   <ArrowUpDown className="absolute left-2 top-1.5 w-3 h-3 text-slate-400 pointer-events-none" />
// // //                   <select
// // //                     value={mainSortOrder}
// // //                     onChange={(e) => setMainSortOrder(e.target.value)}
// // //                     className="pl-6 pr-2 py-1 text-[10px] font-medium bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-600 cursor-pointer appearance-none"
// // //                     style={{ WebkitAppearance: "none", MozAppearance: "none" }}
// // //                   >
// // //                     <option value="recommended">Sort</option>
// // //                     <option value="asc">A to Z</option>
// // //                     <option value="desc">Z to A</option>
// // //                   </select>
// // //                 </div>
// // //               </div>

// // //               {/* Main Navigation Links */}
// // //               <nav className="space-y-1">
// // //                 {filteredMainNav.length === 0 && (
// // //                   <p className="text-xs text-slate-400 text-center py-2">No functions found</p>
// // //                 )}
// // //                 {filteredMainNav.map((item) => {
// // //                   const isActive = pathname === item.href;
// // //                   const Icon = item.icon;
// // //                   return (
// // //                     <Link
// // //                       key={item.name}
// // //                       href={item.href}
// // //                       onClick={() => {
// // //                         setIsOpen(false);
// // //                         setSearchQuery("");
// // //                       }}
// // //                     >
// // //                       <div
// // //                         className={`relative flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${
// // //                           isActive
// // //                             ? "text-emerald-700 font-medium"
// // //                             : "text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
// // //                         }`}
// // //                       >
// // //                         {isActive && (
// // //                           <motion.div
// // //                             layoutId="active-nav"
// // //                             className="absolute inset-0 bg-emerald-50 rounded-lg"
// // //                           />
// // //                         )}
// // //                         <Icon
// // //                           className={`w-5 h-5 relative z-10 ${
// // //                             isActive ? "text-emerald-600" : "text-slate-400"
// // //                           }`}
// // //                         />
// // //                         <span className="relative z-10 text-sm">{item.name}</span>
// // //                       </div>
// // //                     </Link>
// // //                   );
// // //                 })}
// // //               </nav>
// // //             </div>
// // //           )}

// // //           {/* WEDDING EVENTS SECTION */}
// // //           {(filteredEventNav.length > 0 || searchQuery) && (
// // //             <div>
// // //               {/* Wedding Events Header & Sorter */}
// // //               <div className="px-3 mb-3 flex items-center justify-between">
// // //                 <div className="flex items-center gap-2 text-xs font-semibold font small text-slate-400 uppercase tracking-wider">
// // //                   <CalendarHeart className="w-4 h-4" /> Wedding Events
// // //                 </div>

// // //                 {/* Event Nav Sorter */}
// // //                 <div className="relative shrink-0">
// // //                   <ArrowUpDown className="absolute left-2 top-1.5 w-3 h-3 text-slate-400 pointer-events-none" />
// // //                   <select
// // //                     value={eventSortOrder}
// // //                     onChange={(e) => setEventSortOrder(e.target.value)}
// // //                     className="w-3 pl-6 pr-3 py-1 text-[11px] font-medium bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-600 cursor-pointer appearance-none"
// // //                     style={{ WebkitAppearance: "none", MozAppearance: "none" }}
// // //                   >
// // //                     <option value="recommended">Sort</option>
// // //                     <option value="asc">A to Z</option>
// // //                     <option value="desc">Z to A</option>
// // //                   </select>
// // //                 </div>
// // //               </div>

// // //               {/* Event Navigation Links */}
// // //               <nav className="space-y-1">
// // //                 {filteredEventNav.length === 0 && (
// // //                   <p className="text-xs text-slate-400 text-center py-2">No events found</p>
// // //                 )}
// // //                 {filteredEventNav.map((item) => (
// // //                   <Link
// // //                     key={item.name}
// // //                     href={item.href}
// // //                     onClick={() => {
// // //                       setIsOpen(false);
// // //                       setSearchQuery("");
// // //                     }}
// // //                   >
// // //                     <div
// // //                       className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
// // //                         pathname === item.href
// // //                           ? "bg-slate-50 font-medium"
// // //                           : "hover:bg-slate-50"
// // //                       }`}
// // //                     >
// // //                       <div className="flex items-center gap-3">
// // //                         <div className={`w-2 h-2 rounded-full ${item.color}`} />
// // //                         <span className="text-sm text-slate-600">{item.name}</span>
// // //                       </div>
// // //                     </div>
// // //                   </Link>
// // //                 ))}
// // //               </nav>
// // //             </div>
// // //           )}
// // //         </div>
// // //       </div>
// // //     </>
// // //   );
// // // }
// // "use client";

// // import { useState, useMemo, useEffect } from "react";
// // import Link from "next/link";
// // import { usePathname } from "next/navigation";
// // import Image from "next/image";
// // import { motion } from "framer-motion";
// // import {
// //   LayoutDashboard,
// //   Gem,
// //   CalendarHeart,
// //   ClipboardList,
// //   Gift,
// //   ShoppingBag,
// //   Users,
// //   IndianRupee,
// //   Menu,
// //   X,
// //   BookIcon,
// //   CalendarClock,
// //   Handshake,
// //   SquareMenu,
// //   Search,
// //   ArrowUpDown,
// //   Folders,
// // } from "lucide-react";
// // import { DressIcon } from "@phosphor-icons/react";

// // import { supabase } from "@/lib/supabase";
// // import { ADMIN_EMAILS } from "@/lib/admin";

// // // --- Navigation Data ---
// // const mainNav = [
// //   { name: "Dashboard", href: "/", icon: LayoutDashboard },
// //   { name: "Global Task Board", href: "/global_task_board", icon: ClipboardList },
// //   { name: "Menu", href: "/menu", icon: SquareMenu },
// //   { name: "Vendor Tracker", href: "/vendors", icon: Handshake },
// //   { name: "Budget", href: "/budget", icon: IndianRupee, adminOnly: true },
// //   { name: "Guests", href: "/guests", icon: Users },
// //   { name: "Notes", href: "/notes", icon: BookIcon },
// //   { name: "Task Schedule", href: "/task-schedule", icon: CalendarClock },
// //   { name: "Chadana", href: "/chadana", icon: Gem },
// //   { name: "Gifts", href: "/gifts", icon: Gift },
// //   { name: "Shoping", href: "/shoping", icon: ShoppingBag },
// //   { name: "All Outfits", href: "/all_outfits", icon: DressIcon },
// //   { name: "Admin", href: "/admin", icon: LayoutDashboard, adminOnly: true },
// // ];

// // const eventNav = [
// //   { name: "Puja", href: "/events/puja", color: "bg-orange-500" },
// //   { name: "Mehendi", href: "/events/mehendi", color: "bg-emerald-500" },
// //   { name: "Check In", href: "/events/check-in", color: "bg-fuchsia-900" },
// //   { name: "Tilak", href: "/events/tilak", color: "bg-yellow-900" },
// //   { name: "Sangeet", href: "/events/sangeet", color: "bg-indigo-500" },
// //   { name: "Haldi", href: "/events/haldi", color: "bg-amber-400" },
// //   { name: "Reception", href: "/events/reception", color: "bg-fuchsia-600" },
// //   { name: "Phere", href: "/events/phere", color: "bg-red-500" },
// //   { name: "Pagphere", href: "/events/pagphere", color: "bg-cyan-500" },
// //   { name: "Vidai", href: "/events/vidai", color: "bg-pink-400" },
// // ];

// // export function Sidebar() {
// //   const pathname = usePathname();

// //   // --- State ---
// //   const [email, setEmail] = useState("");
// //   const [isOpen, setIsOpen] = useState(false);
// //   const [searchQuery, setSearchQuery] = useState("");
  
// //   // Split sorting into two separate states
// //   const [mainSortOrder, setMainSortOrder] = useState("recommended");
// //   const [eventSortOrder, setEventSortOrder] = useState("recommended");

// //   // --- Authentication / Admin Check ---
// //   useEffect(() => {
// //     const getUser = async () => {
// //       const {
// //         data: { user },
// //       } = await supabase.auth.getUser();

// //       setEmail(user?.email ?? "");
// //     };

// //     getUser();
// //   }, []);

// //   const isAdmin = ADMIN_EMAILS.includes(email);

// //   // --- Filter & Sort Logic for Main Nav ---
// //   const filteredMainNav = useMemo(() => {
// //     let result = mainNav.filter((item) => !item.adminOnly || isAdmin);

// //     if (searchQuery.trim()) {
// //       result = result.filter((item) =>
// //         item.name.toLowerCase().includes(searchQuery.toLowerCase())
// //       );
// //     }

// //     if (mainSortOrder === "asc") {
// //       result.sort((a, b) => a.name.localeCompare(b.name));
// //     } else if (mainSortOrder === "desc") {
// //       result.sort((a, b) => b.name.localeCompare(a.name));
// //     }

// //     return result;
// //   }, [searchQuery, mainSortOrder, isAdmin]);

// //   // --- Filter & Sort Logic for Event Nav ---
// //   const filteredEventNav = useMemo(() => {
// //     let result = [...eventNav];

// //     if (searchQuery.trim()) {
// //       result = result.filter((item) =>
// //         item.name.toLowerCase().includes(searchQuery.toLowerCase())
// //       );
// //     }

// //     if (eventSortOrder === "asc") {
// //       result.sort((a, b) => a.name.localeCompare(b.name));
// //     } else if (eventSortOrder === "desc") {
// //       result.sort((a, b) => b.name.localeCompare(a.name));
// //     }

// //     return result;
// //   }, [searchQuery, eventSortOrder]);

// //   return (
// //     <>
// //       {/* Mobile Menu Toggle Button */}
// //       <button
// //         onClick={() => setIsOpen(true)}
// //         className="fixed top-4 left-4 z-40 p-2 bg-white border border-slate-200 rounded-lg shadow-sm md:hidden"
// //       >
// //         <Menu className="w-6 h-6 text-emerald-900" />
// //       </button>

// //       {/* Mobile Overlay */}
// //       {isOpen && (
// //         <div
// //           className="fixed inset-0 bg-black/50 z-40 md:hidden"
// //           onClick={() => setIsOpen(false)}
// //         />
// //       )}

// //       {/* Sidebar Container */}
// //       <div
// //         className={`fixed top-0 left-0 h-screen w-64 bg-white dark:bg-slate-950 border-r border-slate-100 dark:border-slate-800 z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
// //           isOpen ? "translate-x-0" : "-translate-x-full"
// //         } md:translate-x-0`}
// //       >
// //         <div className="p-6">
// //           {/* Mobile Close Button */}
// //           <button
// //             onClick={() => setIsOpen(false)}
// //             className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 md:hidden"
// //           >
// //             <X className="w-5 h-5" />
// //           </button>

// //           {/* Logo Section */}
// //           <div className="mb-6 mt-4 md:mt-0 w-full flex flex-col items-center justify-center">
// //             <Image
// //               src="/logo.png"
// //               alt="Wedding Logo"
// //               width={64}
// //               height={64}
// //               className="w-16 h-16 object-contain"
// //             />
// //             <p className="text-xs text-slate-400 tracking-widest uppercase mt-1">
// //               Wedding Planner
// //             </p>
// //           </div>

// //           {/* Global Search Bar */}
// //           <div className="relative w-full mb-8">
// //             <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
// //             <input
// //               type="text"
// //               placeholder="Search everything..."
// //               value={searchQuery}
// //               onChange={(e) => setSearchQuery(e.target.value)}
// //               className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-800"
// //             />
// //             {searchQuery && (
// //               <button
// //                 onClick={() => setSearchQuery("")}
// //                 className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
// //               >
// //                 <X className="w-3.5 h-3.5" />
// //               </button>
// //             )}
// //           </div>

// //           {/* MAIN FUNCTIONS SECTION */}
// //           {(filteredMainNav.length > 0 || searchQuery) && (
// //             <div className="mb-8">
// //               {/* Main Functions Header & Sorter */}
// //               <div className="px-3 mb-3 flex items-center justify-between">
// //                 <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
// //                   <Folders className="w-3.5 h-3.5" /> Main Functions
// //                 </div>
                
// //                 {/* Main Nav Sorter - Icon Only Button */}
// //                 <div className="relative w-6 h-6 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors shrink-0" title="Sort Main Functions">
// //                   <ArrowUpDown className="w-3 h-3 text-slate-500" />
// //                   {/* Invisible select overlay */}
// //                   <select
// //                     value={mainSortOrder}
// //                     onChange={(e) => setMainSortOrder(e.target.value)}
// //                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
// //                   >
// //                     <option value="recommended">Recommended</option>
// //                     <option value="asc">A to Z</option>
// //                     <option value="desc">Z to A</option>
// //                   </select>
// //                 </div>
// //               </div>

// //               {/* Main Navigation Links */}
// //               <nav className="space-y-1">
// //                 {filteredMainNav.length === 0 && (
// //                   <p className="text-xs text-slate-400 text-center py-2">No functions found</p>
// //                 )}
// //                 {filteredMainNav.map((item) => {
// //                   const isActive = pathname === item.href;
// //                   const Icon = item.icon;
// //                   return (
// //                     <Link
// //                       key={item.name}
// //                       href={item.href}
// //                       onClick={() => {
// //                         setIsOpen(false);
// //                         setSearchQuery("");
// //                       }}
// //                     >
// //                       <div
// //                         className={`relative flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${
// //                           isActive
// //                             ? "text-emerald-700 font-medium"
// //                             : "text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
// //                         }`}
// //                       >
// //                         {isActive && (
// //                           <motion.div
// //                             layoutId="active-nav"
// //                             className="absolute inset-0 bg-emerald-50 rounded-lg"
// //                           />
// //                         )}
// //                         <Icon
// //                           className={`w-5 h-5 relative z-10 ${
// //                             isActive ? "text-emerald-600" : "text-slate-400"
// //                           }`}
// //                         />
// //                         <span className="relative z-10 text-sm">{item.name}</span>
// //                       </div>
// //                     </Link>
// //                   );
// //                 })}
// //               </nav>
// //             </div>
// //           )}

// //           {/* WEDDING EVENTS SECTION */}
// //           {(filteredEventNav.length > 0 || searchQuery) && (
// //             <div>
// //               {/* Wedding Events Header & Sorter */}
// //               <div className="px-3 mb-3 flex items-center justify-between">
// //                 <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
// //                   <CalendarHeart className="w-3.5 h-3.5" /> Wedding Events
// //                 </div>

// //                 {/* Event Nav Sorter - Icon Only Button */}
// //                 <div className="relative w-6 h-6 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors shrink-0" title="Sort Wedding Events">
// //                   <ArrowUpDown className="w-3 h-3 text-slate-500" />
// //                   {/* Invisible select overlay */}
// //                   <select
// //                     value={eventSortOrder}
// //                     onChange={(e) => setEventSortOrder(e.target.value)}
// //                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
// //                   >
// //                     <option value="recommended">Recommended</option>
// //                     <option value="asc">A to Z</option>
// //                     <option value="desc">Z to A</option>
// //                   </select>
// //                 </div>
// //               </div>

// //               {/* Event Navigation Links */}
// //               <nav className="space-y-1">
// //                 {filteredEventNav.length === 0 && (
// //                   <p className="text-xs text-slate-400 text-center py-2">No events found</p>
// //                 )}
// //                 {filteredEventNav.map((item) => (
// //                   <Link
// //                     key={item.name}
// //                     href={item.href}
// //                     onClick={() => {
// //                       setIsOpen(false);
// //                       setSearchQuery("");
// //                     }}
// //                   >
// //                     <div
// //                       className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
// //                         pathname === item.href
// //                           ? "bg-slate-50 font-medium"
// //                           : "hover:bg-slate-50"
// //                       }`}
// //                     >
// //                       <div className="flex items-center gap-3">
// //                         <div className={`w-2 h-2 rounded-full ${item.color}`} />
// //                         <span className="text-sm text-slate-600">{item.name}</span>
// //                       </div>
// //                     </div>
// //                   </Link>
// //                 ))}
// //               </nav>
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </>
// //   );
// // }
// "use client";

// import { useState, useMemo, useEffect } from "react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import Image from "next/image";
// import { motion } from "framer-motion";
// import {
//   LayoutDashboard,
//   Gem,
//   CalendarHeart,
//   ClipboardList,
//   Gift,
//   ShoppingBag,
//   Users,
//   IndianRupee,
//   Menu,
//   X,
//   BookIcon,
//   CalendarClock,
//   Handshake,
//   SquareMenu,
//   Search,
//   ArrowUpDown,
//   Folders,
//   LogOut // <-- 1. Add LogOut here
// } from "lucide-react";
// import { supabase } from "@/lib/supabase";
// import { ADMIN_EMAILS } from "@/lib/admin";

// export function Sidebar() {
//   const pathname = usePathname();
//   // ... (keep your existing state and useMemos)

//   // 2. Create the Logout Function
//   const handleLogout = async () => {
//     await supabase.auth.signOut();
//     // Force a page reload to kick them back to the login screen on the dashboard
//     window.location.href = "/"; 
//   };

//   return (
//     <>
//       {/* ... (Keep your mobile toggle and overlay) ... */}
      
//       <div
//         className={`fixed top-0 left-0 h-screen w-64 bg-white dark:bg-slate-950 border-r border-slate-100 dark:border-slate-800 z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
//           isOpen ? "translate-x-0" : "-translate-x-full"
//         } md:translate-x-0`}
//       >
//         {/* Make this top section flex-1 and overflow-y-auto so the logout button stays at the bottom */}
//         <div className="p-6 flex-1 overflow-y-auto">
//           {/* ... (Keep all your existing Logo, Search, Main Nav, and Event Nav code here) ... */}
//         </div>

//         {/* 3. Add the Logout Button at the bottom */}
//         <div className="p-4 border-t border-slate-100">
//           <button
//             onClick={handleLogout}
//             className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
//           >
//             <LogOut className="w-5 h-5" />
//             <span className="text-sm font-medium">Log Out</span>
//           </button>
//         </div>
        
//       </div>
//     </>
//   );
// }
"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Gem,
  CalendarHeart,
  ClipboardList,
  Gift,
  ShoppingBag,
  Users,
  IndianRupee,
  Menu,
  X,
  BookIcon,
  CalendarClock,
  Handshake,
  SquareMenu,
  Search,
  ArrowUpDown,
  Folders,
  User,
  LogOut, // <-- Imported LogOut
} from "lucide-react";
import { DressIcon } from "@phosphor-icons/react";

import { supabase } from "@/lib/supabase";
import { ADMIN_EMAILS } from "@/lib/admin";

// --- Navigation Data ---
const mainNav = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Global Task Board", href: "/global_task_board", icon: ClipboardList },
  { name: "Menu", href: "/menu", icon: SquareMenu },
  { name: "Vendor Tracker", href: "/vendors", icon: Handshake },
  { name: "Budget", href: "/budget", icon: IndianRupee, requiresBudget: true },
  { name: "Guests", href: "/guests", icon: Users },
  { name: "Notes", href: "/notes", icon: BookIcon },
  { name: "Task Schedule", href: "/task-schedule", icon: CalendarClock },
  { name: "Chadana", href: "/chadana", icon: Gem },
  { name: "Gifts", href: "/gifts", icon: Gift },
  { name: "Shoping", href: "/shoping", icon: ShoppingBag },
  { name: "All Outfits", href: "/all_outfits", icon: DressIcon },
  { name: "Admin", href: "/admin", icon: User, adminOnly: true },
];

const eventNav = [
  { name: "Puja", href: "/events/puja", color: "bg-orange-500" },
  { name: "Mehendi", href: "/events/mehendi", color: "bg-emerald-500" },
  { name: "Check In", href: "/events/check-in", color: "bg-fuchsia-900" },
  { name: "Tilak", href: "/events/tilak", color: "bg-yellow-900" },
  { name: "Sangeet", href: "/events/sangeet", color: "bg-indigo-500" },
  { name: "Haldi", href: "/events/haldi", color: "bg-amber-400" },
  { name: "Reception", href: "/events/reception", color: "bg-fuchsia-600" },
  { name: "Phere", href: "/events/phere", color: "bg-red-500" },
  { name: "Pagphere", href: "/events/pagphere", color: "bg-cyan-500" },
  { name: "Vidai", href: "/events/vidai", color: "bg-pink-400" },
];

export function Sidebar() {
  const pathname = usePathname();

  // --- State ---
  const [email, setEmail] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Split sorting into two separate states
  const [mainSortOrder, setMainSortOrder] = useState("recommended");
  const [eventSortOrder, setEventSortOrder] = useState("recommended");

  // --- Authentication / Admin Check ---
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setEmail(user?.email ?? "");
    };

    getUser();
  }, []);

  const isAdmin = ADMIN_EMAILS.includes(email);

  // --- Logout Logic ---
  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Refresh the page to trigger the dashboard's auth check and show the login screen
    window.location.href = "/";
  };

  // --- Filter & Sort Logic for Main Nav ---
  const filteredMainNav = useMemo(() => {
    let result = mainNav.filter((item) => !item.adminOnly || isAdmin);

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
  }, [searchQuery, mainSortOrder, isAdmin]);

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
    }

    return result;
  }, [searchQuery, eventSortOrder]);

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-40 p-2 bg-white border border-slate-200 rounded-lg shadow-sm md:hidden"
      >
        <Menu className="w-6 h-6 text-emerald-900" />
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`fixed top-0 left-0 h-screen w-64 bg-white dark:bg-slate-950 border-r border-slate-100 dark:border-slate-800 z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {/* Scrollable Navigation Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Mobile Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 md:hidden"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Logo Section */}
          <div className="mb-6 mt-4 md:mt-0 w-full flex flex-col items-center justify-center">
            <Image
              src="/logo.png"
              alt="Wedding Logo"
              width={64}
              height={64}
              className="w-16 h-16 object-contain"
            />
            <p className="text-xs text-slate-400 tracking-widest uppercase mt-1">
              Wedding Planner
            </p>
          </div>

          {/* Global Search Bar */}
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

          {/* MAIN FUNCTIONS SECTION */}
          {(filteredMainNav.length > 0 || searchQuery) && (
            <div className="mb-8">
              {/* Main Functions Header & Sorter */}
              <div className="px-3 mb-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  <Folders className="w-3.5 h-3.5" /> Main Functions
                </div>
                
                {/* Main Nav Sorter - Icon Only Button */}
                <div className="relative w-6 h-6 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors shrink-0" title="Sort Main Functions">
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  {/* Invisible select overlay */}
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

              {/* Main Navigation Links */}
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

          {/* WEDDING EVENTS SECTION */}
          {(filteredEventNav.length > 0 || searchQuery) && (
            <div>
              {/* Wedding Events Header & Sorter */}
              <div className="px-3 mb-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  <CalendarHeart className="w-3.5 h-3.5" /> Wedding Events
                </div>

                {/* Event Nav Sorter - Icon Only Button */}
                <div className="relative w-6 h-6 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors shrink-0" title="Sort Wedding Events">
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  {/* Invisible select overlay */}
                  <select
                    value={eventSortOrder}
                    onChange={(e) => setEventSortOrder(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  >
                    <option value="recommended">Recommended</option>
                    <option value="asc">A to Z</option>
                    <option value="desc">Z to A</option>
                  </select>
                </div>
              </div>

              {/* Event Navigation Links */}
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
        </div>

        {/* Pinned Logout Button at the Bottom */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Log Out</span>
          </button>
        </div>
      </div>
    </>
  );
}