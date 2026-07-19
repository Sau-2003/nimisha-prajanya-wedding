"use client";

import Link from "next/link";
import { CheckCircle2, CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { differenceInDays, differenceInWeeks } from 'date-fns';

const events = [
  { name: 'Puja',       date: 'Jan 27, 2027', link: '/events/puja',       color: 'bg-violet-500' },
  { name: 'Mehendi',    date: 'Jan 29, 2027', link: '/events/mehendi',    color: 'bg-emerald-500' },
  { name: 'Tilak',      date: 'Jan 30, 2027', link: '/events/tilak',      color: 'bg-fuchsia-500' },
  { name: 'Sangeet',    date: 'Jan 30, 2027', link: '/events/sangeet',    color: 'bg-sky-500' },
  { name: 'Haldi',      date: 'Jan 31, 2027', link: '/events/haldi',      color: 'bg-amber-400' },
  { name: 'Reception',  date: 'Jan 31, 2027', link: '/events/reception',  color: 'bg-red-500' },
  { name: 'Phere',      date: 'Jan 31, 2027', link: '/events/phere',      color: 'bg-indigo-600' },
  { name: 'Pagphere',   date: 'Feb 1, 2027',  link: '/events/pagphere',   color: 'bg-cyan-500' },
  { name: 'Vidai',      date: 'Feb 1, 2027',  link: '/events/vidai',      color: 'bg-rose-500' },
];

export default function Dashboard() {
  // Main Wedding Date Calculation
  const targetDate = new Date('2027-01-31');
  const today = new Date();
  
  const daysToGo = differenceInDays(targetDate, today);
  const weeksToGo = differenceInWeeks(targetDate, today);

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-5xl mx-auto space-y-10">
      
      {/* Hero Section & Countdown */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        <div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-slate-900 mb-2">Nimisha & Prajanya</h1>
          <p className="text-xl text-slate-500">January 31, 2027</p>
        </div>

        {/* Global Countdown Badges */}
        <div className="flex gap-4">
          <div className="flex flex-col items-center justify-center bg-emerald-50 border border-emerald-100 px-6 py-4 rounded-2xl shadow-sm min-w-[120px]">
            <span className="text-4xl font-bold text-emerald-700">
              {daysToGo > 0 ? daysToGo : 0}
            </span>
            <span className="text-sm font-medium text-emerald-600 uppercase tracking-wide mt-1">Days to go</span>
          </div>

          <div className="flex flex-col items-center justify-center bg-emerald-50 border border-emerald-100 px-6 py-4 rounded-2xl shadow-sm min-w-[120px]">
            <span className="text-4xl font-bold text-emerald-700">
              {weeksToGo > 0 ? weeksToGo : 0}
            </span>
            <span className="text-sm font-medium text-emerald-600 uppercase tracking-wide mt-1">Weeks to go</span>
          </div>
        </div>
      </div>

      {/* Event Schedule */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <CheckCircle2 className="text-emerald-600" /> Event Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((evt) => (
            <Link 
              key={evt.name} 
              href={evt.link} 
              className="p-5 border border-slate-200 rounded-xl flex items-center gap-4 hover:border-emerald-500 hover:shadow-md transition-all bg-white"
            >
              <div className={`w-2 h-14 rounded-full ${evt.color}`}></div>
              <div className="flex-1">
                <p className="text-lg font-semibold text-slate-800">{evt.name}</p>
                <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                  <CalendarDays className="w-4 h-4"/> {evt.date}
                </p>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}