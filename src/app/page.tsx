"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { differenceInDays, differenceInWeeks } from 'date-fns';
import { CalendarHeart, CheckCircle2, AlertCircle, IndianRupee, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const EVENTS_DATA = [
  { name: 'Puja', color: 'bg-purple-500', p: 100, date: 'Jan 27, 2027', link: '/events/puja' },
  { name: 'Mehendi', color: 'bg-emerald-500', p: 80, date: 'Jan 28, 2027', link: '/events/mehendi' },
  { name: 'Haldi', color: 'bg-yellow-500', p: 45, date: 'Jan 29, 2027', link: '/events/haldi' },
  { name: 'Sangeet', color: 'bg-blue-500', p: 60, date: 'Jan 29, 2027', link: '/events/sangeet' },
  { name: 'Reception', color: 'bg-champagne', p: 20, date: 'Jan 30, 2027', link: '/events/reception' }
];

export default function Dashboard() {
  const weddingDate = new Date('2027-01-30');
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
            <CalendarHeart className="w-5 h-5 text-gold-500" /> January 30, 2027
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
        {/* Dynamic Events Summary with Pop-ups */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-2">
          <Card className="shadow-sm hover:shadow-md transition-shadow h-full border-emerald-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Event Readiness (Click for details)
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {EVENTS_DATA.map((evt) => (
                <Dialog key={evt.name}>
                  <DialogTrigger asChild>
                    <div className="p-4 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all cursor-pointer group">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-slate-800">{evt.name}</span>
                        <span className="text-sm font-bold text-slate-600 group-hover:text-emerald-600">{evt.p}%</span>
                      </div>
                      <Progress value={evt.p} className="h-2" indicatorColor={evt.color} />
                    </div>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="font-serif text-2xl text-emerald-900">{evt.name} Details</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="flex justify-between text-sm text-slate-600">
                        <span>Scheduled Date:</span>
                        <span className="font-medium text-slate-900">{evt.date}</span>
                      </div>
                      <div className="flex justify-between text-sm text-slate-600">
                        <span>Planning Progress:</span>
                        <span className="font-medium text-emerald-600">{evt.p}% Complete</span>
                      </div>
                      <Progress value={evt.p} className="h-2" indicatorColor={evt.color} />
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

        {/* Budget Snapshot */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="shadow-sm hover:shadow-md transition-shadow h-full border-gold-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-gold-600">
                <IndianRupee className="w-5 h-5" />
                Budget Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mt-2">
                <div>
                  <p className="text-sm text-slate-500">Total Spent / Advanced</p>
                  <p className="text-2xl font-serif font-bold text-slate-800">₹ 4,50,000</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Pending Payments</p>
                  <p className="text-xl font-serif text-orange-500">₹ 1,25,000</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}