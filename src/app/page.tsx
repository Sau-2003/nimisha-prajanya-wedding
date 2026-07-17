"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { differenceInDays, differenceInWeeks } from 'date-fns';
import { CalendarHeart, CheckCircle2, AlertCircle, Clock, IndianRupee } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function Dashboard() {
  const weddingDate = new Date('2027-01-30');
  const startDate = new Date('2024-01-01'); // Assume planning started here
  
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [weeksRemaining, setWeeksRemaining] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    const today = new Date();
    setDaysRemaining(differenceInDays(weddingDate, today));
    setWeeksRemaining(differenceInWeeks(weddingDate, today));
    
    const totalDays = differenceInDays(weddingDate, startDate);
    const passedDays = differenceInDays(today, startDate);
    setTimeElapsed(Math.max(0, Math.min(100, (passedDays / totalDays) * 100)));
  }, []);

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-emerald-900 dark:text-emerald-50">
            Nimisha & Prajanya
          </h1>
          <p className="text-lg text-slate-500 mt-2 flex items-center gap-2">
            <CalendarHeart className="w-5 h-5 text-gold-500" />
            January 30, 2027
          </p>
        </div>
        
        {/* Countdown Ring / Stats */}
        <div className="flex items-center gap-6 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-emerald-100">
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

      {/* Progress Bar */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-emerald-100"
      >
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Overall Planning Progress</span>
          <span className="text-sm font-medium text-emerald-600">64%</span>
        </div>
        {/* Using a custom gradient for the progress bar */}
        <Progress value={64} className="h-3 bg-slate-100" indicatorColor="bg-gradient-to-r from-emerald-400 to-gold-400" />
      </motion.div>

      {/* Grid Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Urgency Engine - Overdue Tasks */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-red-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                Critical & Overdue
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                <span className="text-sm font-medium">Finalize Nikah Venue</span>
                <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">2 days late</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                <span className="text-sm font-medium">Book Makeup Artist</span>
                <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">Due Today</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Dynamic Events Summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Event Readiness
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: 'Mehendi', color: 'bg-emerald-500', p: 80 },
                { name: 'Haldi', color: 'bg-yellow-500', p: 45 },
                { name: 'Reception', color: 'bg-champagne', p: 20 }
              ].map((evt) => (
                <div key={evt.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{evt.name}</span>
                    <span>{evt.p}%</span>
                  </div>
                  <Progress value={evt.p} className="h-2" indicatorColor={evt.color} />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Budget Snapshot */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-gold-600">
                <IndianRupee className="w-5 h-5" />
                Budget Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500">Total Spent / Advanced</p>
                  <p className="text-2xl font-serif font-bold">₹ 4,50,000</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Pending Payments (Next 30 days)</p>
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