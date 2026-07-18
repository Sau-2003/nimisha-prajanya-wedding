"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { differenceInDays, differenceInWeeks } from 'date-fns';
import { CalendarHeart, CheckCircle2, ArrowRight, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const EVENTS_DATA = [
  { name: 'Puja', date: 'Jan 27, 2027', link: '/events/puja' },
  { name: 'Mehendi', date: 'Jan 29, 2027', link: '/events/mehendi' },
  { name: 'Haldi', date: 'Jan 31, 2027', link: '/events/haldi' },
  { name: 'Sangeet', date: 'Jan 30, 2027', link: '/events/sangeet' },
  { name: 'Reception', date: 'Jan 31, 2027', link: '/events/reception' }
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
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-emerald-900">Nimisha & Prajanya</h1>
          <p className="text-lg text-slate-500 mt-2 flex items-center gap-2">
            <CalendarHeart className="w-5 h-5 text-gold-500" /> January 31, 2027
          </p>
        </div>
        <div className="flex items-center gap-6 bg-white p-4 rounded-2xl shadow-sm border border-emerald-100">
          <div className="text-center">
            <p className="text-3xl font-serif font-bold text-emerald-600">{daysRemaining}</p>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Days to go</p>
          </div>
          <div className="w-px h-12 bg-slate-200"></div>
          <div className="text-center">
            <p className="text-3xl font-serif font-bold text-gold-500">{weeksRemaining}</p>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Weeks to go</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Dynamic Events Summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-2">
          <Card className="shadow-sm hover:shadow-md transition-shadow h-full border-emerald-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Event Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {EVENTS_DATA.map((evt) => (
                <Dialog key={evt.name}>
                  <DialogTrigger asChild>
                    <button className="w-full text-left p-4 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all cursor-pointer group">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-slate-800">{evt.name}</span>
                        <div className="flex items-center text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                          <CalendarDays className="w-3 h-3 mr-1" />
                          {evt.date}
                        </div>
                      </div>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="font-serif text-2xl text-emerald-900">{evt.name} Details</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="text-slate-600">Prepare for the {evt.name} on {evt.date}.</p>
                    </div>
                    <Link href={evt.link} className="w-full">
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white group">
                        Go to {evt.name} Workspace <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </DialogContent>
                </Dialog>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}