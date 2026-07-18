"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { differenceInDays, differenceInWeeks } from 'date-fns';
import { CalendarHeart, CheckCircle2, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const EVENTS_DATA = [
  { name: 'Puja', date: 'Jan 27, 2027', link: '/events/puja', color: 'bg-purple-500' },
  { name: 'Mehendi', date: 'Jan 29, 2027', link: '/events/mehendi', color: 'bg-emerald-500' },
  { name: 'Haldi', date: 'Jan 31, 2027', link: '/events/haldi', color: 'bg-yellow-500' },
  { name: 'Sangeet', date: 'Jan 30, 2027', link: '/events/sangeet', color: 'bg-blue-500' },
  { name: 'Reception', date: 'Jan 31, 2027', link: '/events/reception', color: 'bg-red-500' }
];

export default function Dashboard() {
  const weddingDate = new Date('2027-01-31');
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [weeksRemaining, setWeeksRemaining] = useState(0);

  useEffect(() => {
    const today = new Date();
    setDaysRemaining(differenceInDays(weddingDate, today));
    setWeeksRemaining(differenceInWeeks(weddingDate, today));
  }, []);

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-slate-900">Nimisha & Prajanya</h1>
          <p className="text-lg text-slate-500 mt-2 flex items-center gap-2">
            <CalendarHeart className="w-5 h-5 text-slate-400" /> January 31, 2027
          </p>
        </div>
        <div className="flex items-center gap-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="text-center">
            <p className="text-3xl font-serif font-bold text-slate-700">{daysRemaining}</p>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Days to go</p>
          </div>
          <div className="w-px h-12 bg-slate-200"></div>
          <div className="text-center">
            <p className="text-3xl font-serif font-bold text-slate-700">{weeksRemaining}</p>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Weeks to go</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-2">
          <Card className="shadow-sm hover:shadow-md transition-shadow h-full border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-slate-400" />
                Event Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {EVENTS_DATA.map((evt) => (
                <Link key={evt.name} href={evt.link} className="block w-full">
                  <div className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all cursor-pointer shadow-sm flex items-center gap-3">
                    {/* Color indicator bar */}
                    <div className={`w-1.5 h-12 rounded-full ${evt.color}`}></div>
                    
                    <div className="flex-1 flex justify-between items-center">
                      <span className="font-medium text-slate-800">{evt.name}</span>
                      <div className="flex items-center text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                        <CalendarDays className="w-3 h-3 mr-1" />
                        {evt.date}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}