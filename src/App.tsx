/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Zap,
  Clock as ClockIcon,
  Play,
  Watch,
  Activity,
  Newspaper,
  Loader2,
  Trash2,
  Save,
  Pause,
  Wind,
  X,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';

// --- Types ---

interface DailyPulseData {
  energy: number;
  focus: number;
  source: 'manual' | 'watch' | null;
}

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

const TimeTracking = () => {
  const [project, setProject] = useState('App Development');
  const [isTracking, setIsTracking] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isTracking) {
      timerRef.current = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTracking]);

  const formatDuration = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleSave = () => {
    alert(`Saved ${formatDuration(seconds)} for ${project}`);
    setIsTracking(false);
    setSeconds(0);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this session?')) {
      setIsTracking(false);
      setSeconds(0);
    }
  };

  return (
    <Card title="Time Tracking">
      <div className="space-y-4">
        {!isTracking && seconds === 0 ? (
          <>
            <select 
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="w-full p-3 bg-zinc-50 border border-black/5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
            >
              <option>App Development</option>
              <option>Life Visioning</option>
              <option>Health & Fitness</option>
              <option>Learning</option>
            </select>
            <button 
              onClick={() => setIsTracking(true)}
              className="w-full py-3 bg-zinc-900 text-white rounded-xl flex items-center justify-center gap-2 text-sm font-bold shadow-lg shadow-zinc-200 hover:bg-zinc-800 transition-all"
            >
              <Play size={16} fill="currentColor" />
              Start Tracking
            </button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center p-4 bg-zinc-50 rounded-2xl border border-black/5">
              <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">{project}</p>
              <p className="text-3xl font-mono font-medium tracking-tighter text-zinc-900">
                {formatDuration(seconds)}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => setIsTracking(!isTracking)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${isTracking ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-zinc-900 border-zinc-900 text-white'}`}
              >
                {isTracking ? <Pause size={18} /> : <Play size={18} />}
                <span className="text-[10px] font-bold uppercase mt-1">{isTracking ? 'Pause' : 'Resume'}</span>
              </button>
              <button 
                onClick={handleSave}
                className="flex flex-col items-center justify-center p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all"
              >
                <Save size={18} />
                <span className="text-[10px] font-bold uppercase mt-1">Save</span>
              </button>
              <button 
                onClick={handleDelete}
                className="flex flex-col items-center justify-center p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl hover:bg-red-100 transition-all"
              >
                <Trash2 size={18} />
                <span className="text-[10px] font-bold uppercase mt-1">Delete</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

const DailyPulse = ({ data }: { data: DailyPulseData }) => {
  return (
    <Card title="Daily Pulse">
      <div className="space-y-6">
        {data.source ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase">
              {data.source === 'manual' ? <Zap size={12} /> : <Watch size={12} />}
              <span>Source: {data.source === 'manual' ? 'Manual Check-in' : 'Fitness Watch'}</span>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold text-zinc-400 uppercase mb-2">
                <span>Energy Level</span>
                <span>{data.energy * 10}%</span>
              </div>
              <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-zinc-900 transition-all duration-500" style={{ width: `${data.energy * 10}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold text-zinc-400 uppercase mb-2">
                <span>Focus Score</span>
                <span>{data.focus * 10}%</span>
              </div>
              <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-zinc-900 transition-all duration-500" style={{ width: `${data.focus * 10}%` }}></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 flex flex-col items-center justify-center text-center gap-2">
            <Watch size={24} className="text-zinc-400" />
            <p className="text-xs text-zinc-500 font-medium">No data available. Check-in or connect a device.</p>
          </div>
        )}
        <button className="w-full py-3 bg-white border border-black/5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-zinc-600 hover:bg-zinc-50 transition-all">
          <Activity size={16} />
          Connect Fitness Watch
        </button>
      </div>
    </Card>
  );
};

const CheckInMode = ({ onSave }: { onSave: (energy: number, focus: number) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [energy, setEnergy] = useState(5);
  const [focus, setFocus] = useState(5);

  const handleSave = () => {
    onSave(energy, focus);
    setIsOpen(false);
  };

  return (
    <div className="space-y-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 bg-zinc-100 hover:bg-zinc-200 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold text-zinc-900 transition-all"
      >
        <Zap size={16} />
        Check-in Mode
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <Card className="bg-zinc-900 text-white border-0">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase mb-3">
                    <span>Energy Level</span>
                    <span>{energy}/10</span>
                  </div>
                  <input 
                    type="range" min="1" max="10" 
                    value={energy} 
                    onChange={(e) => setEnergy(parseInt(e.target.value))}
                    className="w-full accent-white"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase mb-3">
                    <span>Focus Score</span>
                    <span>{focus}/10</span>
                  </div>
                  <input 
                    type="range" min="1" max="10" 
                    value={focus} 
                    onChange={(e) => setFocus(parseInt(e.target.value))}
                    className="w-full accent-white"
                  />
                </div>
                <button 
                  onClick={handleSave}
                  className="w-full py-2 bg-white text-zinc-900 rounded-xl text-xs font-bold hover:bg-zinc-100 transition-all"
                >
                  Save Check-in
                </button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CalendarPreview = () => {
  const events = [
    { time: "09:00 AM", title: "Deep Work: App Architecture", type: "work" },
    { time: "12:30 PM", title: "Lunch with Sarah", type: "social" },
    { time: "02:00 PM", title: "Product Review", type: "work" },
    { time: "04:30 PM", title: "Gym Session", type: "health" }
  ];

  return (
    <Card title="Today's Calendar">
      <div className="space-y-4">
        {events.map((event, i) => (
          <div key={i} className="flex gap-4 group">
            <div className="flex flex-col items-center">
              <div className="w-2 h-2 rounded-full bg-zinc-900 mt-1" />
              <div className="w-px flex-1 bg-zinc-100 my-1 group-last:hidden" />
            </div>
            <div className="flex-1 pb-4">
              <p className="text-[10px] font-bold text-zinc-400 uppercase">{event.time}</p>
              <p className="text-sm font-semibold text-zinc-900">{event.title}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

const RelevantNews = ({ interests }: { interests: string[] }) => {
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Research the latest news related to these interests: ${interests.join(', ')}. 
        Then, write a highly structured, professional newsletter-style summary.
        Use clear headings (###), bullet points, and bold text for key insights.
        Include a "Why it matters" section for each major update.
        Keep it concise but informative. Use Markdown.`,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });
      
      setSummary(response.text || 'No updates found for today.');
    } catch (error) {
      console.error("Failed to fetch news:", error);
      setSummary("Failed to load news updates. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [interests]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return (
    <Card title="Relevant News">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <Loader2 className="animate-spin text-zinc-400" size={24} />
          <p className="text-xs text-zinc-400 font-medium animate-pulse tracking-widest uppercase">Curating your personal newsletter...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              <Newspaper size={14} />
              <span>Daily Briefing • {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <button 
              onClick={fetchNews}
              className="text-[10px] font-bold text-zinc-400 hover:text-zinc-900 uppercase tracking-widest transition-colors"
            >
              Refresh
            </button>
          </div>
          
          <div className="prose prose-zinc prose-sm max-w-none prose-headings:tracking-tight prose-headings:font-bold prose-p:text-zinc-600 prose-li:text-zinc-600">
            <div className="markdown-body leading-relaxed">
              <Markdown>{summary}</Markdown>
            </div>
          </div>
          
          <div className="pt-6 border-t border-zinc-100">
            <p className="text-[10px] text-zinc-400 italic text-center">
              Summarized by lifedotAI based on your selected interests.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};

const OverwhelmedModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [step, setStep] = useState<'idle' | 'breathing' | 'completed'>('idle');
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [timer, setTimer] = useState(5);
  const [cycle, setCycle] = useState(0);
  const totalCycles = 4;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'breathing') {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            // Switch phase
            if (breathPhase === 'Inhale') setBreathPhase('Hold');
            else if (breathPhase === 'Hold') setBreathPhase('Exhale');
            else if (breathPhase === 'Exhale') setBreathPhase('Rest');
            else {
              if (cycle >= totalCycles - 1) {
                setStep('completed');
                return 0;
              }
              setCycle(c => c + 1);
              setBreathPhase('Inhale');
            }
            return 5;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, breathPhase, cycle]);

  const startBreathing = () => {
    setStep('breathing');
    setBreathPhase('Inhale');
    setTimer(5);
    setCycle(0);
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-zinc-900 flex flex-col items-center justify-center text-white p-6"
    >
      <button 
        onClick={onClose}
        className="absolute top-8 right-8 p-2 hover:bg-white/10 rounded-full transition-colors"
      >
        <X size={24} />
      </button>

      <AnimatePresence mode="wait">
        {step === 'idle' && (
          <motion.div 
            key="idle"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="text-center space-y-8"
          >
            <h2 className="text-6xl font-bold tracking-tighter">Take a breath.</h2>
            <p className="text-zinc-400 max-w-md mx-auto">
              Let's reset with a 5-second box breathing routine. 
              Find a comfortable position and clear your mind.
            </p>
            <button 
              onClick={startBreathing}
              className="px-12 py-4 bg-white text-zinc-900 rounded-2xl font-bold text-lg hover:bg-zinc-100 transition-all shadow-xl shadow-white/10"
            >
              Start
            </button>
          </motion.div>
        )}

        {step === 'breathing' && (
          <motion.div 
            key="breathing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center space-y-12"
          >
            <div className="relative w-64 h-64 flex items-center justify-center">
              {/* Visual Breathing Box */}
              <motion.div 
                animate={{ 
                  scale: breathPhase === 'Inhale' ? 1.5 : 
                         breathPhase === 'Hold' ? 1.5 : 
                         breathPhase === 'Exhale' ? 1 : 1,
                  opacity: breathPhase === 'Inhale' ? 1 : 
                           breathPhase === 'Hold' ? 0.8 : 
                           breathPhase === 'Exhale' ? 0.6 : 0.4
                }}
                transition={{ duration: 5, ease: "easeInOut" }}
                className="absolute inset-0 border-2 border-white/20 rounded-3xl"
              />
              <motion.div 
                animate={{ 
                  scale: breathPhase === 'Inhale' ? 1.5 : 
                         breathPhase === 'Hold' ? 1.5 : 
                         breathPhase === 'Exhale' ? 1 : 1,
                  backgroundColor: breathPhase === 'Inhale' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'
                }}
                transition={{ duration: 5, ease: "easeInOut" }}
                className="w-32 h-32 rounded-2xl bg-white/10 flex items-center justify-center"
              >
                <span className="text-4xl font-mono font-bold">{timer}</span>
              </motion.div>
            </div>

            <div className="space-y-2">
              <h3 className="text-3xl font-bold tracking-tight uppercase tracking-[0.2em]">
                {breathPhase === 'Rest' ? 'Hold' : breathPhase}
              </h3>
              <p className="text-zinc-500 font-medium">Cycle {cycle + 1} of {totalCycles}</p>
            </div>
          </motion.div>
        )}

        {step === 'completed' && (
          <motion.div 
            key="completed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8"
          >
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap size={40} />
            </div>
            <h2 className="text-5xl font-bold tracking-tighter">Feeling better?</h2>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={startBreathing}
                className="px-8 py-4 bg-white/10 text-white rounded-2xl font-bold hover:bg-white/20 transition-all flex items-center gap-2"
              >
                <RotateCcw size={20} />
                Repeat
              </button>
              <button 
                onClick={onClose}
                className="px-8 py-4 bg-white text-zinc-900 rounded-2xl font-bold hover:bg-zinc-100 transition-all"
              >
                I'm done
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
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
  const [interests] = useState(['Artificial Intelligence', 'Productivity', 'Digital Health']);
  const [dailyPulseData, setDailyPulseData] = useState<DailyPulseData>({
    energy: 0,
    focus: 0,
    source: null
  });
  const [isOverwhelmed, setIsOverwhelmed] = useState(false);

  const handleCheckInSave = (energy: number, focus: number) => {
    setDailyPulseData({
      energy,
      focus,
      source: 'manual'
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
      <div className="flex h-screen overflow-hidden">
        
        {/* Left Sidebar - Menu */}
        <aside className="w-64 border-r border-black/5 bg-white flex flex-col p-6">
          <div className="flex items-center gap-2 mb-10 px-2">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
              <Compass className="text-white" size={18} />
            </div>
            <span className="font-bold text-xl tracking-tight italic">lifedotAI</span>
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

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Main Section (Left/Center) */}
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

                {/* Relevant News Section */}
                <RelevantNews interests={interests} />
              </div>

              {/* Right Sidebar */}
              <div className="space-y-8">
                <Clock />
                <TimeTracking />
                <DailyPulse data={dailyPulseData} />
                <div className="space-y-4">
                  <CheckInMode onSave={handleCheckInSave} />
                  <button 
                    onClick={() => setIsOverwhelmed(true)}
                    className="w-full py-4 bg-red-50 hover:bg-red-100 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold text-red-600 transition-all border border-red-100"
                  >
                    <Wind size={16} />
                    Overwhelmed
                  </button>
                </div>
                <CalendarPreview />
              </div>

            </div>
          </div>
        </main>

        <AnimatePresence>
          {isOverwhelmed && (
            <OverwhelmedModal isOpen={isOverwhelmed} onClose={() => setIsOverwhelmed(false)} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
