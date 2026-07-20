"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, CheckSquare, CalendarHeart, 
  ShoppingBag, Users, IndianRupee, Menu, X, BookIcon, CalendarClock // Import CalendarClock
} from 'lucide-react';
import Image from "next/image";

const mainNav = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Global Task Board', href: '/master-task', icon: CheckSquare },
  { name: 'Vendor Tracker', href: '/vendors', icon: ShoppingBag },
  { name: 'Budget', href: '/budget', icon: IndianRupee },
  { name: 'Guests', href: '/guests', icon: Users },
  { name: 'Notes', href: '/notes', icon: BookIcon }, // Added missing comma here
  { name: 'Date Schedule', href: '/date-schedule', icon: CalendarClock }, // Corrected Clock to CalendarClock
];
const eventNav = [
  { name: 'Puja',href: '/events/puja',color: 'bg-violet-500' },
  { name: 'Mehendi',href: '/events/mehendi',color: 'bg-emerald-500' },
  { name: 'Tilak',href: '/events/tilak',color: 'bg-fuchsia-500' },
  { name: 'Sangeet',href: '/events/sangeet',color: 'bg-sky-500' },
  { name: 'Haldi',href: '/events/haldi',color: 'bg-amber-400' },
  { name: 'Reception',href: '/events/reception',color: 'bg-red-500' },
  { name: 'Phere',href: '/events/phere',color: 'bg-indigo-600' },
  { name: 'Pagphere',href: '/events/pagphere',color: 'bg-cyan-500' },
  { name: 'Vidai',href: '/events/vidai',color: 'bg-rose-500' },
];


export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-40 p-2 bg-white border border-slate-200 rounded-lg shadow-sm md:hidden"
      >
        <Menu className="w-6 h-6 text-emerald-900" />
      </button>

      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsOpen(false)} />}

      <div className={`fixed top-0 left-0 h-screen w-64 bg-white dark:bg-slate-950 border-r border-slate-100 dark:border-slate-800 z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 overflow-y-auto`}>
        <div className="p-6">
          <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 md:hidden">
            <X className="w-5 h-5" />
          </button>

          <div className="mb-8 mt-4 md:mt-0 w-full flex flex-col items-center justify-center">              <Image src="/logo.png"
              alt="Wedding Logo" 
              width={64}
              height={64}
              className="w-16 h-16 object-contain"
              />
            <p className="text-xs text-slate-400 tracking-widest uppercase mt-1">Wedding Planner</p>
          </div>

          <nav className="space-y-1 mb-8">
            {mainNav.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)}>
                  <div className={`relative flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${isActive ? 'text-emerald-700 font-medium' : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'}`}>
                    {isActive && (
                      <motion.div layoutId="active-nav" className="absolute inset-0 bg-emerald-50 rounded-lg" />
                    )}
                    <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span className="relative z-10 text-sm">{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div>
            <div className="px-3 mb-2 flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <CalendarHeart className="w-4 h-4" /> Wedding Events
            </div>
            <nav className="space-y-1">
              {eventNav.map((item) => (
                <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)}>
                  <div className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${pathname === item.href ? 'bg-slate-50 font-medium' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${item.color}`} />
                      <span className="text-sm text-slate-600">{item.name}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}