/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Target, 
  Calendar, 
  CheckSquare, 
  Compass, 
  Settings, 
  Plus,
  Search,
  Bell,
  ChevronRight,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';

// --- Components ---

const Clock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white/50 backdrop-blur-sm rounded-3xl border border-black/5 shadow-sm">
      <div className="text-4xl font-mono font-medium tracking-tighter text-zinc-900">
        {formatTime(time)}
      </div>
      <div className="text-xs uppercase tracking-widest text-zinc-500 mt-2 font-medium">
        {formatDate(time)}
      </div>
    </div>
  );
};

const SidebarItem = ({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${active ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-100'}`}>
    <Icon size={20} />
    <span className="font-medium text-sm">{label}</span>
  </div>
);

const Card = ({ title, children, className = "" }: { title?: string, children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-3xl border border-black/5 p-6 shadow-sm ${className}`}>
    {title && <h3 className="text-sm font-semibold text-zinc-900 mb-4 uppercase tracking-wider">{title}</h3>}
    {children}
  </div>
);

// --- Main App ---

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
      <div className="flex h-screen overflow-hidden">
        
        {/* Left Sidebar - Menu */}
        <aside className="w-64 border-r border-black/5 bg-white flex flex-col p-6">
          <div className="flex items-center gap-2 mb-10 px-2">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
              <Compass className="text-white" size={18} />
            </div>
            <span className="font-bold text-xl tracking-tight italic">Aura</span>
          </div>

          <nav className="flex-1 space-y-1">
            <SidebarItem icon={LayoutDashboard} label="Overview" active />
            <SidebarItem icon={Target} label="Life Vision" />
            <SidebarItem icon={Compass} label="Decision Lab" />
            <SidebarItem icon={Calendar} label="Timeline" />
            <SidebarItem icon={CheckSquare} label="Action Items" />
          </nav>

          <div className="mt-auto pt-6 border-t border-black/5 space-y-1">
            <SidebarItem icon={Settings} label="Settings" />
            <div className="flex items-center gap-3 px-4 py-3 mt-4 bg-zinc-100 rounded-2xl">
              <div className="w-8 h-8 bg-zinc-300 rounded-full overflow-hidden">
                <img src="https://picsum.photos/seed/user/100/100" alt="User" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">Lea Rattei</p>
                <p className="text-xs text-zinc-500 truncate">Pro Plan</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-zinc-50/50">
          {/* Header */}
          <header className="h-20 flex items-center justify-between px-8 sticky top-0 bg-zinc-50/80 backdrop-blur-md z-10">
            <div className="flex items-center gap-4 bg-white border border-black/5 px-4 py-2 rounded-2xl w-96 shadow-sm">
              <Search size={18} className="text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search your life..." 
                className="bg-transparent border-none outline-none text-sm w-full"
              />
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-white rounded-full transition-colors relative">
                <Bell size={20} className="text-zinc-600" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-zinc-50"></span>
              </button>
              <button className="bg-zinc-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-200">
                <Plus size={18} />
                <span>New Entry</span>
              </button>
            </div>
          </header>

          <div className="p-8 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-2"
            >
              <h1 className="text-4xl font-bold tracking-tight text-zinc-900">Good morning, Lea.</h1>
              <p className="text-zinc-500 font-medium">Ready to build a life you love today?</p>
            </motion.div>

            {/* Grid Layout Inspired by the request */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Bigger Block (Left/Center) */}
              <div className="lg:col-span-2 space-y-8">
                <Card title="Focus for today">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-zinc-900 text-white rounded-2xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                          <Zap size={20} />
                        </div>
                        <div>
                          <p className="font-semibold">Deep Work: App Architecture</p>
                          <p className="text-xs text-white/60">09:00 AM - 11:30 AM</p>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-white/40" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border border-black/5 rounded-2xl hover:bg-zinc-50 transition-colors cursor-pointer">
                        <p className="text-xs font-bold text-zinc-400 uppercase mb-1">Indecision to solve</p>
                        <p className="font-semibold">Choose tech stack for backend</p>
                      </div>
                      <div className="p-4 border border-black/5 rounded-2xl hover:bg-zinc-50 transition-colors cursor-pointer">
                        <p className="text-xs font-bold text-zinc-400 uppercase mb-1">Next milestone</p>
                        <p className="font-semibold">Complete MVP layout</p>
                      </div>
                    </div>
                  </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card title="Recent Decisions">
                    <div className="space-y-3">
                      {[
                        { label: "Morning Routine", status: "Defined" },
                        { label: "Quarterly Goals", status: "Locked" },
                        { label: "Reading List", status: "Active" }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-black/5 last:border-0">
                          <span className="text-sm font-medium">{item.label}</span>
                          <span className="text-[10px] px-2 py-1 bg-zinc-100 rounded-full font-bold text-zinc-500 uppercase">{item.status}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                  
                  <Card title="Inspiration">
                    <div className="relative h-40 rounded-2xl overflow-hidden group">
                      <img 
                        src="https://picsum.photos/seed/mountain/400/300" 
                        alt="Inspiration" 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                        <p className="text-white text-sm font-medium italic">"The best way to predict the future is to create it."</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Smaller Block (Right) */}
              <div className="space-y-8">
                <Clock />
                
                <Card title="Daily Pulse">
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-xs font-bold text-zinc-400 uppercase mb-2">
                        <span>Energy Level</span>
                        <span>85%</span>
                      </div>
                      <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full bg-zinc-900 w-[85%]"></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs font-bold text-zinc-400 uppercase mb-2">
                        <span>Focus Score</span>
                        <span>92%</span>
                      </div>
                      <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full bg-zinc-900 w-[92%]"></div>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card title="Upcoming">
                  <div className="space-y-4">
                    {[
                      { time: "12:30 PM", event: "Lunch with Sarah" },
                      { time: "02:00 PM", event: "Product Review" },
                      { time: "04:30 PM", event: "Gym Session" }
                    ].map((item, i) => (
                      <div key={i} className="flex gap-4">
                        <span className="text-[10px] font-bold text-zinc-400 w-14 pt-1">{item.time}</span>
                        <div className="flex-1 pb-4 border-b border-black/5 last:border-0">
                          <p className="text-sm font-semibold">{item.event}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
