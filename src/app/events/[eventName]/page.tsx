"use client";

import { motion } from 'framer-motion';
import { CheckSquare, Users, IndianRupee } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SingleEventPage({ params }: { params: { eventName: string } }) {
  // This automatically capitalizes the event name from the URL (e.g., "mehendi" -> "Mehendi")
  const title = params.eventName.charAt(0).toUpperCase() + params.eventName.slice(1);

  return (
    <div className="p-6 md:p-12 max-w-[1600px] mx-auto space-y-8 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-4xl font-bold text-emerald-900">{title} Workspace</h1>
          <p className="text-slate-500 mt-2">Manage all tasks, vendors, and guests specific to the {title} ceremony.</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">+ Add Task</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {[
          { label: 'Event Tasks', icon: CheckSquare, desc: 'View checklist' },
          { label: 'Assigned Vendors', icon: IndianRupee, desc: 'Manage bookings' },
          { label: 'Guest List', icon: Users, desc: 'View attendees' },
        ].map((module, i) => {
          const Icon = module.icon;
          return (
            <motion.div key={module.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-4 rounded-full bg-slate-50 group-hover:bg-emerald-50 transition-colors">
                    <Icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{module.label}</p>
                    <p className="text-sm text-slate-500">{module.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}