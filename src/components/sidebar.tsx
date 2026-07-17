"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  CheckSquare, 
  CalendarHeart, 
  ShoppingBag, 
  Users, 
  IndianRupee, 
  Settings,
  ChevronRight
} from 'lucide-react';

const mainNav = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Task Board', href: '/tasks', icon: CheckSquare },
  { name: 'Vendor Tracker', href: '/vendors', icon: ShoppingBag },
  { name: 'Budget', href: '/budget', icon: IndianRupee },
  { name: 'Guests & RSVP', href: '/guests', icon: Users },
];

const eventNav = [
  { name: 'Puja', href: '/events/puja', color: 'text-purple-500' },
  { name: 'Mehendi', href: '/events/mehendi', color: 'text-emerald-500' },
  { name: 'Haldi', href: '/events/haldi', color: 'text-yellow-500' },
  { name: 'Sangeet', href: '/events/sangeet', color: 'text-blue-500' },
  { name: 'Reception', href: '/events/reception', color: 'text-gold-500' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 h-screen bg-white dark:bg-slate-950 border-r border-slate-100 dark:border-slate-800 flex flex-col justify-between fixed top-0 left-0 overflow-y-auto">
      <div className="p-6">
        <div className="mb-8">
          <h2 className="font-serif text-2xl font-bold text-emerald-900 dark:text-emerald-50">
            N <span className="text-gold-500">&</span> P
          </h2>
          <p className="text-xs text-slate-400 tracking-widest uppercase mt-1">Wedding Planner</p>
        </div>

        <nav className="space-y-1 mb-8">
          {mainNav.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <div className={`relative flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${
                  isActive ? 'text-emerald-700 font-medium' : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'
                }`}>
                  {isActive && (
                    <motion.div layoutId="active-nav" className="absolute inset-0 bg-emerald-50 rounded-lg" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                  )}
                  <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-500'}`} />
                  <span className="relative z-10 text-sm">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* New Events Section */}
        <div>
          <div className="px-3 mb-2 flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <CalendarHeart className="w-4 h-4" /> Wedding Events
          </div>
          <nav className="space-y-1">
            {eventNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <div className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors group ${
                    isActive ? 'bg-slate-50 font-medium text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${item.color}`} />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}