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
  RotateCcw,
  Heart,
  Users,
  DollarSign,
  Briefcase,
  Trophy,
  ChevronLeft,
  BookOpen,
  Gamepad2,
  Timer,
  MessageSquare,
  RefreshCw,
  Dices,
  Grid3X3,
  Sparkles
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

interface Goal {
  id: string;
  title: string;
  milestones: string[];
  wins: string[];
  status: 'active' | 'completed';
  timeframe?: 'short' | 'medium' | 'long';
}

interface LifeVisionData {
  paragraph: string;
  goals: Goal[];
}

interface TimeBlock {
  id: string;
  startTime: string;
  endTime: string;
  label: string;
  type: 'meeting' | 'focus' | 'break';
  tasks: string[];
}

interface Task {
  id: string;
  title: string;
  duration?: number; // minutes
  urgency: 'low' | 'medium' | 'high';
  isStrategic: boolean;
  isFrog: boolean;
  status: 'todo' | 'done';
}

interface DailySchedule {
  blocks: TimeBlock[];
  summary: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM AM/PM
  endTime: string; // HH:MM AM/PM
  type: 'work' | 'social' | 'health' | 'other' | 'workout';
}

interface Workout {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM (24h)
  endTime: string; // HH:MM (24h)
  type: string;
  duration: number;
  completed: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: any;
  color: string;
  goals: Goal[];
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
        Ensure there is plenty of whitespace and it's very easy to read.
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
        <div className="flex flex-col items-center justify-center py-24 gap-6">
          <Loader2 className="animate-spin text-zinc-400" size={32} />
          <p className="text-xs text-zinc-400 font-medium animate-pulse tracking-widest uppercase">Curating your personal newsletter...</p>
        </div>
      ) : (
        <div className="space-y-12 py-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-6">
            <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              <Newspaper size={16} />
              <span>Daily Briefing • {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <button 
              onClick={fetchNews}
              className="text-[10px] font-bold text-zinc-400 hover:text-zinc-900 uppercase tracking-widest transition-colors bg-zinc-50 px-3 py-1.5 rounded-full border border-black/5"
            >
              Refresh
            </button>
          </div>
          
          <div className="prose prose-zinc prose-sm max-w-none prose-headings:tracking-tight prose-headings:font-bold prose-headings:mt-12 prose-headings:mb-6 prose-p:text-zinc-600 prose-p:leading-relaxed prose-p:mb-6 prose-li:text-zinc-600 prose-li:mb-4">
            <div className="markdown-body space-y-8">
              <Markdown>{summary}</Markdown>
            </div>
          </div>
          
          <div className="pt-12 border-t border-zinc-100">
            <p className="text-[10px] text-zinc-400 italic text-center tracking-widest uppercase opacity-60">
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
            if (breathPhase === 'Inhale') {
              setBreathPhase('Hold');
              return 5;
            } else if (breathPhase === 'Hold') {
              setBreathPhase('Exhale');
              return 5;
            } else if (breathPhase === 'Exhale') {
              setBreathPhase('Rest');
              return 5;
            } else {
              // Rest phase finished
              if (cycle >= totalCycles - 1) {
                setStep('completed');
                return 0;
              }
              setCycle(c => c + 1);
              setBreathPhase('Inhale');
              return 5;
            }
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
      className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center text-zinc-900 p-6"
    >
      <button 
        onClick={onClose}
        className="absolute top-8 right-8 p-3 hover:bg-zinc-100 rounded-full transition-colors border border-black/5"
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
            <div className="w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Wind size={40} className="text-zinc-400" />
            </div>
            <h2 className="text-6xl font-bold tracking-tighter">Take a breath.</h2>
            <p className="text-zinc-500 max-w-md mx-auto font-medium leading-relaxed">
              Let's reset with a 5-second box breathing routine. 
              Find a comfortable position and clear your mind.
            </p>
            <button 
              onClick={startBreathing}
              className="px-16 py-5 bg-zinc-900 text-white rounded-full font-bold text-lg hover:bg-zinc-800 transition-all shadow-2xl shadow-zinc-200"
            >
              Start Reset
            </button>
          </motion.div>
        )}

        {step === 'breathing' && (
          <motion.div 
            key="breathing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center space-y-16"
          >
            <div className="relative w-80 h-80 flex items-center justify-center">
              {/* Visual Breathing Circle */}
              <motion.div 
                animate={{ 
                  scale: (breathPhase === 'Inhale' || breathPhase === 'Hold') ? 1.4 : 1,
                  opacity: (breathPhase === 'Inhale' || breathPhase === 'Hold') ? 0.15 : 0.05
                }}
                transition={{ duration: 5, ease: "easeInOut" }}
                className="absolute inset-0 bg-zinc-900 rounded-full"
              />
              <motion.div 
                animate={{ 
                  scale: (breathPhase === 'Inhale' || breathPhase === 'Hold') ? 1.2 : 1,
                  borderWidth: (breathPhase === 'Inhale' || breathPhase === 'Hold') ? '2px' : '1px'
                }}
                transition={{ duration: 5, ease: "easeInOut" }}
                className="absolute inset-10 border border-zinc-200 rounded-full"
              />
              <div className="z-10 flex flex-col items-center">
                <span className="text-6xl font-mono font-bold tracking-tighter">{timer}</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mt-2">Seconds</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-4xl font-bold tracking-tight uppercase tracking-[0.25em] text-zinc-900">
                {breathPhase === 'Rest' ? 'Hold' : breathPhase}
              </h3>
              <div className="flex gap-2 justify-center">
                {[...Array(totalCycles)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-2 h-2 rounded-full transition-all duration-500 ${i < cycle ? 'bg-zinc-900 w-6' : i === cycle ? 'bg-zinc-400' : 'bg-zinc-100'}`} 
                  />
                ))}
              </div>
              <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Cycle {cycle + 1} of {totalCycles}</p>
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
            <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Sparkles size={40} />
            </div>
            <h2 className="text-5xl font-bold tracking-tighter">Feeling better?</h2>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={startBreathing}
                className="px-10 py-4 bg-zinc-100 text-zinc-900 rounded-full font-bold hover:bg-zinc-200 transition-all flex items-center gap-2"
              >
                <RotateCcw size={20} />
                Repeat
              </button>
              <button 
                onClick={onClose}
                className="px-10 py-4 bg-zinc-900 text-white rounded-full font-bold hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200"
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

const LifeVisionSetup = ({ onComplete }: { onComplete: (data: LifeVisionData) => void }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const questions = [
    "What does your ideal morning look like?",
    "What kind of work or activities make you feel most fulfilled?",
    "Who are the people you spend your time with in your dream life?",
    "What does health and vitality mean to you?",
    "What is one big impact you want to have on the world?"
  ];

  const handleNext = () => {
    if (!currentAnswer.trim()) return;
    const newAnswers = [...answers, currentAnswer];
    setAnswers(newAnswers);
    setCurrentAnswer('');
    
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      generateVision(newAnswers);
    }
  };

  const generateVision = async (finalAnswers: string[]) => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Based on these answers about a person's ideal life:
        ${questions.map((q, i) => `Q: ${q}\nA: ${finalAnswers[i]}`).join('\n\n')}
        
        1. Write a vivid "day in the life" paragraph (about 150 words) that describes this vision as if it's already happening.
        2. Break this vision down into specific goals. Categorize them into 'short' (next 6 months), 'medium' (1-2 years), and 'long' (5+ years) timeframes.
        
        Return the response as a JSON object with this structure:
        {
          "paragraph": "...",
          "goals": [
            { "title": "...", "timeframe": "short|medium|long", "category": "Health|Family & Friends|Finance|Business & Career" }
          ]
        }`,
        config: {
          responseMimeType: "application/json"
        }
      });

      const data = JSON.parse(response.text || '{}');
      onComplete({
        paragraph: data.paragraph,
        goals: data.goals.map((g: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          title: g.title,
          timeframe: g.timeframe,
          category: g.category,
          milestones: [],
          wins: [],
          status: 'active'
        }))
      });
    } catch (error) {
      console.error("Vision generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <div className="relative">
          <Loader2 className="animate-spin text-zinc-900" size={48} />
          <Sparkles className="absolute -top-2 -right-2 text-amber-500 animate-pulse" size={20} />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Manifesting your vision...</h2>
          <p className="text-zinc-500">AI is weaving your dreams into a concrete plan.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Step {step + 1} of {questions.length}</span>
          <div className="flex gap-1">
            {questions.map((_, i) => (
              <div key={i} className={`h-1 w-8 rounded-full transition-colors ${i <= step ? 'bg-zinc-900' : 'bg-zinc-100'}`} />
            ))}
          </div>
        </div>
        <h2 className="text-3xl font-bold tracking-tight">{questions[step]}</h2>
      </div>

      <textarea 
        autoFocus
        value={currentAnswer}
        onChange={(e) => setCurrentAnswer(e.target.value)}
        placeholder="Speak from the heart..."
        className="w-full h-48 bg-white border border-black/5 rounded-3xl p-6 text-lg outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all resize-none shadow-sm"
      />

      <div className="mt-8 flex justify-end">
        <button 
          onClick={handleNext}
          disabled={!currentAnswer.trim()}
          className="px-8 py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {step === questions.length - 1 ? 'Generate Vision' : 'Next Question'}
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

const LifeVision = ({ visionData, onUpdateVision }: { visionData: LifeVisionData | null, onUpdateVision: (data: LifeVisionData) => void }) => {
  const [categories, setCategories] = useState<Category[]>([
    { 
      id: '1', name: 'Health', icon: Heart, color: 'text-rose-500 bg-rose-50', 
      goals: [] 
    },
    { 
      id: '2', name: 'Family & Friends', icon: Users, color: 'text-blue-500 bg-blue-50', 
      goals: [] 
    },
    { 
      id: '3', name: 'Finance', icon: DollarSign, color: 'text-emerald-500 bg-emerald-50', 
      goals: [] 
    },
    { 
      id: '4', name: 'Business & Career', icon: Briefcase, color: 'text-amber-500 bg-amber-50', 
      goals: [] 
    },
  ]);

  useEffect(() => {
    if (visionData) {
      setCategories(prev => prev.map(cat => ({
        ...cat,
        goals: visionData.goals.filter((g: any) => g.category === cat.name)
      })));
    }
  }, [visionData]);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newGoalTitle, setNewGoalTitle] = useState('');

  const addCategory = () => {
    if (!newCategoryName.trim()) return;
    const newCat: Category = {
      id: Date.now().toString(),
      name: newCategoryName,
      icon: Target,
      color: 'text-zinc-500 bg-zinc-50',
      goals: []
    };
    setCategories([...categories, newCat]);
    setNewCategoryName('');
    setIsAddingCategory(false);
  };

  const addGoal = (catId: string) => {
    if (!newGoalTitle.trim()) return;
    const newGoal: Goal = {
      id: Date.now().toString(),
      title: newGoalTitle,
      milestones: [],
      wins: [],
      status: 'active'
    };
    const updatedCategories = categories.map(cat => 
      cat.id === catId ? { ...cat, goals: [...cat.goals, newGoal] } : cat
    );
    setCategories(updatedCategories);
    
    // Sync back to vision data
    if (visionData) {
      onUpdateVision({
        ...visionData,
        goals: [...visionData.goals, { ...newGoal, category: categories.find(c => c.id === catId)?.name } as any]
      });
    }

    if (selectedCategory?.id === catId) {
      setSelectedCategory({ ...selectedCategory, goals: [...selectedCategory.goals, newGoal] });
    }
    setNewGoalTitle('');
    setIsAddingGoal(false);
  };

  if (!visionData) {
    return <LifeVisionSetup onComplete={onUpdateVision} />;
  }

  return (
    <div className="space-y-12">
      {/* Vision Paragraph */}
      <div className="bg-white p-10 rounded-[40px] border border-black/5 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
          <Sparkles size={120} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Your Manifested Vision</h2>
          </div>
          <p className="text-2xl font-medium text-zinc-800 leading-relaxed italic">
            "{visionData.paragraph}"
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {selectedCategory && (
            <button 
              onClick={() => setSelectedCategory(null)}
              className="p-2 hover:bg-white rounded-xl transition-colors border border-black/5"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
            {selectedCategory ? selectedCategory.name : 'Life Categories'}
          </h1>
        </div>
        {!selectedCategory && (
          <button 
            onClick={() => setIsAddingCategory(true)}
            className="bg-zinc-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-200"
          >
            <Plus size={18} />
            <span>Add Category</span>
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!selectedCategory ? (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {categories.map((cat) => (
              <div 
                key={cat.id}
                onClick={() => setSelectedCategory(cat)}
                className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${cat.color}`}>
                    <cat.icon size={24} />
                  </div>
                  <ChevronRight size={20} className="text-zinc-300 group-hover:text-zinc-900 transition-colors" />
                </div>
                <h3 className="text-xl font-bold mb-4">{cat.name}</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Active Goals</p>
                    <div className="flex flex-wrap gap-2">
                      {cat.goals.length > 0 ? cat.goals.map(g => (
                        <span key={g.id} className="px-3 py-1 bg-zinc-100 rounded-full text-xs font-medium text-zinc-600">
                          {g.title}
                        </span>
                      )) : <span className="text-xs text-zinc-400 italic">No goals yet</span>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-50">
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Milestones</p>
                      <p className="text-sm font-bold text-zinc-900">
                        {cat.goals.reduce((acc, g) => acc + g.milestones.length, 0)} Upcoming
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Wins</p>
                      <p className="text-sm font-bold text-emerald-600">
                        {cat.goals.reduce((acc, g) => acc + g.wins.length, 0)} Recent
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isAddingCategory && (
              <div className="bg-zinc-900 p-6 rounded-3xl text-white">
                <h3 className="text-lg font-bold mb-4">New Category</h3>
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Category Name..." 
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full bg-white/10 border border-white/10 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-white/20 mb-4"
                />
                <div className="flex gap-2">
                  <button 
                    onClick={addCategory}
                    className="flex-1 py-2 bg-white text-zinc-900 rounded-xl text-xs font-bold hover:bg-zinc-100 transition-all"
                  >
                    Create
                  </button>
                  <button 
                    onClick={() => setIsAddingCategory(false)}
                    className="flex-1 py-2 bg-white/10 text-white rounded-xl text-xs font-bold hover:bg-white/20 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Goals</h2>
                  <button 
                    onClick={() => setIsAddingGoal(true)}
                    className="p-2 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                {isAddingGoal && (
                  <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm">
                    <h3 className="text-sm font-bold mb-4 uppercase tracking-widest text-zinc-400">New Goal</h3>
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="What do you want to achieve?" 
                      value={newGoalTitle}
                      onChange={(e) => setNewGoalTitle(e.target.value)}
                      className="w-full bg-zinc-50 border border-black/5 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10 mb-4"
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={() => addGoal(selectedCategory.id)}
                        className="flex-1 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all"
                      >
                        Add Goal
                      </button>
                      <button 
                        onClick={() => setIsAddingGoal(false)}
                        className="flex-1 py-2 bg-zinc-100 text-zinc-600 rounded-xl text-xs font-bold hover:bg-zinc-200 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {selectedCategory.goals.map(goal => (
                    <Card key={goal.id}>
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <h3 className="text-xl font-bold text-zinc-900">{goal.title}</h3>
                          <div className="flex gap-2 mt-1">
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Active</span>
                            {goal.timeframe && (
                              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">• {goal.timeframe} term</span>
                            )}
                          </div>
                        </div>
                        <button className="p-2 hover:bg-zinc-50 rounded-xl transition-colors">
                          <Settings size={18} className="text-zinc-400" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Target size={12} />
                            Upcoming Milestones
                          </p>
                          <div className="space-y-2">
                            {goal.milestones.length > 0 ? goal.milestones.map((m, i) => (
                              <div key={i} className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl border border-black/5">
                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
                                <span className="text-sm font-medium">{m}</span>
                              </div>
                            )) : <p className="text-xs text-zinc-400 italic">No milestones defined</p>}
                            <button className="w-full py-2 border border-dashed border-zinc-200 rounded-xl text-[10px] font-bold text-zinc-400 uppercase hover:border-zinc-400 hover:text-zinc-600 transition-all">
                              + Add Milestone
                            </button>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Trophy size={12} />
                            Recent Wins
                          </p>
                          <div className="space-y-2">
                            {goal.wins.length > 0 ? goal.wins.map((w, i) => (
                              <div key={i} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span className="text-sm font-medium text-emerald-900">{w}</span>
                              </div>
                            )) : <p className="text-xs text-zinc-400 italic">No wins yet</p>}
                            <button className="w-full py-2 border border-dashed border-emerald-200 rounded-xl text-[10px] font-bold text-emerald-400 uppercase hover:border-emerald-400 hover:text-emerald-600 transition-all">
                              + Log a Win
                            </button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <Card title="Category Stats">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-500 font-medium">Total Goals</span>
                      <span className="text-lg font-bold">{selectedCategory.goals.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-500 font-medium">Completed</span>
                      <span className="text-lg font-bold text-emerald-600">0</span>
                    </div>
                    <div className="pt-4 border-t border-zinc-50">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Category Focus</p>
                      <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full bg-zinc-900 w-2/3"></div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DailyCheckIn = ({ onComplete }: { onComplete: (tasks: Task[], energy: number, focus: number, notes: string) => void }) => {
  const [step, setStep] = useState(0);
  const [energy, setEnergy] = useState(5);
  const [focus, setFocus] = useState(5);
  const [notes, setNotes] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskUrgency, setNewTaskUrgency] = useState<'low' | 'medium' | 'high'>('medium');
  const [isStrategic, setIsStrategic] = useState(false);
  const [isFrog, setIsFrog] = useState(false);

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    const task: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTaskTitle,
      urgency: newTaskUrgency,
      isStrategic,
      isFrog,
      status: 'todo'
    };
    setTasks([...tasks, task]);
    setNewTaskTitle('');
    setIsStrategic(false);
    setIsFrog(false);
  };

  const steps = [
    { title: "Energy & Focus", description: "How are you feeling today?" },
    { title: "Tasks", description: "What's on your mind?" },
    { title: "Additional Info", description: "Anything else relevant?" }
  ];

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="mb-12">
        <h2 className="text-3xl font-bold tracking-tight mb-2">{steps[step].title}</h2>
        <p className="text-zinc-500">{steps[step].description}</p>
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div 
            key="step0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-12"
          >
            <div className="space-y-6">
              <label className="text-sm font-bold uppercase tracking-widest text-zinc-400">Energy Level ({energy})</label>
              <input 
                type="range" min="1" max="10" value={energy} 
                onChange={(e) => setEnergy(parseInt(e.target.value))}
                className="w-full h-2 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900"
              />
              <div className="flex justify-between text-[10px] font-bold text-zinc-400">
                <span>DRAINED</span>
                <span>VIBRANT</span>
              </div>
            </div>
            <div className="space-y-6">
              <label className="text-sm font-bold uppercase tracking-widest text-zinc-400">Focus Level ({focus})</label>
              <input 
                type="range" min="1" max="10" value={focus} 
                onChange={(e) => setFocus(parseInt(e.target.value))}
                className="w-full h-2 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900"
              />
              <div className="flex justify-between text-[10px] font-bold text-zinc-400">
                <span>SCATTERED</span>
                <span>LASER-FOCUSED</span>
              </div>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-4">
              <input 
                type="text" 
                placeholder="Add a task..." 
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
                className="w-full bg-zinc-50 border border-black/5 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
              />
              <div className="flex flex-wrap gap-4 items-center">
                <select 
                  value={newTaskUrgency}
                  onChange={(e) => setNewTaskUrgency(e.target.value as any)}
                  className="bg-zinc-50 border border-black/5 rounded-xl p-2 text-xs font-bold outline-none"
                >
                  <option value="low">Low Urgency</option>
                  <option value="medium">Medium Urgency</option>
                  <option value="high">High Urgency</option>
                </select>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={isStrategic}
                    onChange={(e) => setIsStrategic(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  />
                  <span className="text-xs font-bold text-zinc-500 group-hover:text-zinc-900 transition-colors">Strategic</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={isFrog}
                    onChange={(e) => setIsFrog(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  />
                  <span className="text-xs font-bold text-zinc-500 group-hover:text-zinc-900 transition-colors">Frog 🐸</span>
                </label>
                <button 
                  onClick={addTask}
                  className="ml-auto p-2 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {tasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-4 bg-white border border-black/5 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${task.urgency === 'high' ? 'bg-red-500' : task.urgency === 'medium' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                    <span className="font-medium">{task.title}</span>
                    {task.isFrog && <span className="text-xs">🐸</span>}
                    {task.isStrategic && <Zap size={12} className="text-amber-500" />}
                  </div>
                  <button onClick={() => setTasks(tasks.filter(t => t.id !== task.id))}>
                    <Trash2 size={16} className="text-zinc-300 hover:text-red-500 transition-colors" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <textarea 
              autoFocus
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any other relevant information for today..."
              className="w-full h-48 bg-white border border-black/5 rounded-3xl p-6 text-lg outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all resize-none shadow-sm"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-12 flex justify-between">
        <button 
          onClick={() => setStep(step - 1)}
          disabled={step === 0}
          className="px-6 py-3 text-zinc-400 font-bold hover:text-zinc-900 transition-all disabled:opacity-0"
        >
          Back
        </button>
        <button 
          onClick={() => step < 2 ? setStep(step + 1) : onComplete(tasks, energy, focus, notes)}
          className="px-12 py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 flex items-center gap-2"
        >
          {step === 2 ? 'Complete Check-in' : 'Next'}
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

const WorkMode = ({ 
  tasks, 
  allTasks,
  schedule, 
  onUpdateSchedule,
  onUpdateTasks,
  onStartCheckIn
}: { 
  tasks: Task[], 
  allTasks: Task[],
  schedule: DailySchedule | null, 
  onUpdateSchedule: (s: DailySchedule) => void,
  onUpdateTasks: (t: Task[]) => void,
  onStartCheckIn: () => void
}) => {
  const [mode, setMode] = useState<'overview' | 'pomodoro' | 'wheel' | 'bingo'>('overview');
  const [activeBlock, setActiveBlock] = useState<TimeBlock | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  const toggleTaskStatus = (taskId: string) => {
    const updatedTasks = allTasks.map(t => 
      t.id === taskId ? { ...t, status: (t.status === 'todo' ? 'done' : 'todo') as 'todo' | 'done' } : t
    );
    onUpdateTasks(updatedTasks);
  };

  const removeTaskFromBlock = (blockId: string, taskId: string) => {
    if (!schedule) return;
    const updatedBlocks = schedule.blocks.map(block => 
      block.id === blockId ? { ...block, tasks: block.tasks.filter(id => id !== taskId) } : block
    );
    onUpdateSchedule({ ...schedule, blocks: updatedBlocks });
  };

  const addTaskToBlock = (blockId: string, taskId: string) => {
    if (!schedule) return;
    const updatedBlocks = schedule.blocks.map(block => 
      block.id === blockId ? { ...block, tasks: [...block.tasks, taskId] } : block
    );
    onUpdateSchedule({ ...schedule, blocks: updatedBlocks });
    setIsAddTaskOpen(false);
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const newMessages = [...chatMessages, { role: 'user' as const, text: chatInput }];
    setChatMessages(newMessages);
    const input = chatInput;
    setChatInput('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `The user wants to modify their schedule or tasks. 
        Current Schedule: ${JSON.stringify(schedule)}
        User Input: ${input}
        
        Respond naturally and if they want to change something, provide the updated schedule in JSON format at the end of your message wrapped in <SCHEDULE>...</SCHEDULE>.`,
      });

      const text = response.text || '';
      const scheduleMatch = text.match(/<SCHEDULE>(.*?)<\/SCHEDULE>/s);
      if (scheduleMatch) {
        try {
          const newSchedule = JSON.parse(scheduleMatch[1]);
          onUpdateSchedule(newSchedule);
        } catch (e) {
          console.error("Failed to parse updated schedule");
        }
      }
      setChatMessages([...newMessages, { role: 'ai', text: text.replace(/<SCHEDULE>.*?<\/SCHEDULE>/s, '').trim() }]);
    } catch (error) {
      console.error("Chat failed:", error);
    }
  };

  const spinWheel = () => {
    if (tasks.length === 0) return;
    setIsSpinning(true);
    setTimeout(() => {
      const randomTask = tasks[Math.floor(Math.random() * tasks.length)];
      setSelectedTask(randomTask);
      setIsSpinning(false);
    }, 2000);
  };

  if (!schedule) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center">
        <div className="w-20 h-20 bg-zinc-100 rounded-3xl flex items-center justify-center mb-6">
          <Zap className="text-zinc-400" size={40} />
        </div>
        <h2 className="text-2xl font-bold mb-2">No Schedule Yet</h2>
        <p className="text-zinc-500 max-w-md mb-8">Complete your morning check-in to generate your AI-optimized work schedule.</p>
        <button 
          onClick={onStartCheckIn}
          className="px-8 py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 flex items-center gap-2"
        >
          <Zap size={18} />
          Start Morning Check-in
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900">Work Mode</h1>
        <div className="flex gap-2 bg-white p-1 rounded-2xl border border-black/5 shadow-sm">
          <button 
            onClick={() => setMode('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${mode === 'overview' ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-900'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setMode('pomodoro')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${mode === 'pomodoro' ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-900'}`}
          >
            Pomodoro
          </button>
          <button 
            onClick={() => setMode('wheel')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${mode === 'wheel' ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-900'}`}
          >
            Spinny Wheel
          </button>
          <button 
            onClick={() => setMode('bingo')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${mode === 'bingo' ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-900'}`}
          >
            Bingo
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {mode === 'overview' && (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 space-y-6">
              <Card title="Today's Schedule">
                <div className="space-y-4">
                  {schedule.blocks && schedule.blocks.length > 0 ? schedule.blocks.map(block => (
                    <div 
                      key={block.id}
                      onClick={() => setActiveBlock(block)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${activeBlock?.id === block.id ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white border-black/5 hover:bg-zinc-50'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${activeBlock?.id === block.id ? 'text-white/60' : 'text-zinc-400'}`}>
                            {block.startTime} - {block.endTime}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest ${block.type === 'focus' ? 'bg-amber-100 text-amber-600' : block.type === 'meeting' ? 'bg-blue-100 text-blue-600' : 'bg-zinc-100 text-zinc-600'}`}>
                            {block.type}
                          </span>
                        </div>
                        <ChevronRight size={16} className={activeBlock?.id === block.id ? 'text-white/40' : 'text-zinc-300'} />
                      </div>
                      <h4 className="font-bold">{block.label}</h4>
                      {activeBlock?.id === block.id && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          className="mt-4 pt-4 border-t border-white/10 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Assigned Tasks</p>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setIsAddTaskOpen(true); }}
                              className="text-[10px] font-bold text-white/60 hover:text-white uppercase tracking-widest flex items-center gap-1"
                            >
                              <Plus size={10} />
                              Add Task
                            </button>
                          </div>
                          {block.tasks && block.tasks.map((taskId, i) => {
                            const task = allTasks.find(t => t.id === taskId);
                            return (
                              <div key={i} className="flex items-center justify-between group/task">
                                <div 
                                  className="flex items-center gap-3 text-sm cursor-pointer"
                                  onClick={(e) => { e.stopPropagation(); toggleTaskStatus(taskId); }}
                                >
                                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${task?.status === 'done' ? 'bg-emerald-500 border-emerald-500' : 'border-white/20 hover:border-white/40'}`}>
                                    {task?.status === 'done' && <CheckSquare size={12} className="text-white" />}
                                  </div>
                                  <span className={task?.status === 'done' ? 'line-through text-white/40' : ''}>
                                    {task?.title || taskId}
                                  </span>
                                </div>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); removeTaskFromBlock(block.id, taskId); }}
                                  className="opacity-0 group-hover/task:opacity-100 p-1 hover:bg-white/10 rounded transition-all"
                                >
                                  <Trash2 size={12} className="text-white/40 hover:text-red-400" />
                                </button>
                              </div>
                            );
                          })}

                          {isAddTaskOpen && (
                            <div className="mt-4 p-4 bg-white/5 rounded-2xl border border-white/10 space-y-4" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-between">
                                <h5 className="text-xs font-bold uppercase tracking-widest">Select Task</h5>
                                <button onClick={() => setIsAddTaskOpen(false)}><X size={14} /></button>
                              </div>
                              <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                {allTasks.filter(t => !block.tasks.includes(t.id)).map(task => (
                                  <div 
                                    key={task.id}
                                    onClick={() => addTaskToBlock(block.id, task.id)}
                                    className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs cursor-pointer transition-all border border-transparent hover:border-white/10"
                                  >
                                    {task.title}
                                  </div>
                                ))}
                                <button 
                                  className="w-full p-2 border border-dashed border-white/20 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
                                  onClick={() => {
                                    const newTitle = prompt("Enter new task title:");
                                    if (newTitle) {
                                      const newTask: Task = {
                                        id: Math.random().toString(36).substr(2, 9),
                                        title: newTitle,
                                        status: 'todo',
                                        urgency: 'medium',
                                        isStrategic: false,
                                        isFrog: false
                                      };
                                      onUpdateTasks([...allTasks, newTask]);
                                      addTaskToBlock(block.id, newTask.id);
                                    }
                                  }}
                                >
                                  + Create New Task
                                </button>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  )) : (
                    <p className="text-xs text-zinc-400 italic text-center py-8">No tasks scheduled for today.</p>
                  )}
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card title="Assistant">
                <div className="flex flex-col h-[400px]">
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                    {chatMessages.length === 0 && (
                      <p className="text-xs text-zinc-400 italic text-center py-8">Ask me to reshuffle your schedule or change time blocks.</p>
                    )}
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-800'}`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Chat with AI..." 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                      className="flex-1 bg-zinc-50 border border-black/5 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
                    />
                    <button 
                      onClick={handleChat}
                      className="p-3 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-colors"
                    >
                      <MessageSquare size={18} />
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {mode === 'pomodoro' && (
          <motion.div 
            key="pomodoro"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex flex-col items-center justify-center py-12 space-y-12"
          >
            <div className="relative w-72 h-72 flex items-center justify-center">
              <div className="absolute inset-0 border-8 border-zinc-100 rounded-full" />
              <div className="absolute inset-0 border-8 border-zinc-900 rounded-full border-t-transparent animate-spin-slow" />
              <div className="text-center">
                <span className="text-7xl font-mono font-bold tracking-tighter">25:00</span>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mt-2">Focus Time</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button className="px-12 py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200">
                Start Timer
              </button>
              <button className="px-8 py-4 bg-zinc-100 text-zinc-600 rounded-2xl font-bold hover:bg-zinc-200 transition-all">
                Reset
              </button>
            </div>

            <div className="max-w-md w-full space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 text-center">Tasks for this block</h3>
              {(activeBlock ? activeBlock.tasks.map(id => allTasks.find(t => t.id === id)).filter(Boolean) : allTasks.slice(0, 3)).map(task => (
                <div 
                  key={task!.id} 
                  onClick={() => toggleTaskStatus(task!.id)}
                  className="p-4 bg-white border border-black/5 rounded-2xl flex items-center gap-4 shadow-sm cursor-pointer hover:bg-zinc-50 transition-all"
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${task!.status === 'done' ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-200'}`}>
                    {task!.status === 'done' && <CheckSquare size={12} className="text-white" />}
                  </div>
                  <span className={`font-medium ${task!.status === 'done' ? 'line-through text-zinc-400' : ''}`}>{task!.title}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {mode === 'wheel' && (
          <motion.div 
            key="wheel"
            initial={{ opacity: 0, rotate: -10 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 10 }}
            className="flex flex-col items-center justify-center py-12 space-y-12"
          >
            <div className={`relative w-80 h-80 rounded-full border-8 border-zinc-900 flex items-center justify-center transition-all duration-[2000ms] ease-out ${isSpinning ? 'rotate-[1080deg]' : ''}`}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1 h-full bg-zinc-100 absolute" />
                <div className="h-1 w-full bg-zinc-100 absolute" />
                <div className="w-1 h-full bg-zinc-100 absolute rotate-45" />
                <div className="w-1 h-full bg-zinc-100 absolute -rotate-45" />
              </div>
              <div className="w-16 h-16 bg-zinc-900 rounded-full z-10 flex items-center justify-center border-4 border-white">
                <Zap size={24} className="text-white" />
              </div>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-zinc-900 z-20" />
            </div>

            <div className="text-center space-y-6">
              {selectedTask ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Your Assigned Task</p>
                  <h3 className="text-3xl font-bold tracking-tight">{selectedTask.title}</h3>
                </motion.div>
              ) : (
                <p className="text-zinc-500">Spin the wheel to get a random task assigned.</p>
              )}
              <button 
                onClick={spinWheel}
                disabled={isSpinning}
                className="px-16 py-5 bg-zinc-900 text-white rounded-full font-bold text-lg hover:bg-zinc-800 transition-all shadow-2xl shadow-zinc-200 flex items-center gap-3"
              >
                <RefreshCw size={24} className={isSpinning ? 'animate-spin' : ''} />
                {isSpinning ? 'Spinning...' : 'Spin the Wheel'}
              </button>
            </div>
          </motion.div>
        )}

        {mode === 'bingo' && (
          <motion.div 
            key="bingo"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center py-12 space-y-8"
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Task Bingo</h2>
              <p className="text-zinc-500">Complete a line to win the morning!</p>
            </div>

            <div className="grid grid-cols-5 gap-2 bg-zinc-100 p-2 rounded-3xl border border-black/5">
              {[...Array(25)].map((_, i) => {
                const task = tasks && tasks.length > 0 ? tasks[i % tasks.length] : null;
                return (
                  <div 
                    key={i}
                    className={`w-24 h-24 bg-white rounded-2xl p-2 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-zinc-50 transition-all border border-black/5 ${i === 12 ? 'bg-zinc-900 text-white' : ''}`}
                  >
                    {i === 12 ? (
                      <span className="text-[10px] font-bold uppercase tracking-widest">FREE SPACE</span>
                    ) : (
                      <span className="text-[10px] font-bold leading-tight line-clamp-3">{task?.title || 'Rest'}</span>
                    )}
                  </div>
                );
              })}
            </div>

            <button className="px-12 py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all">
              Shuffle Board
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProjectsTab = () => {
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const projects = [
    { id: '1', title: 'lifedotAI MVP', progress: 65, status: 'on-track', deadline: 'Mar 30', description: 'Building the first version of the life management AI.', tasks: ['Implement Work Mode', 'Fix Calendar Alignment', 'Refine News UI'] },
    { id: '2', title: 'Health Transformation', progress: 40, status: 'at-risk', deadline: 'Apr 15', description: 'Focusing on physical and mental well-being.', tasks: ['Daily 5km run', 'Meditation 10min', 'Meal prep'] },
    { id: '3', title: 'Financial Freedom Plan', progress: 20, status: 'on-track', deadline: 'Dec 31', description: 'Long-term wealth building and budgeting.', tasks: ['Set up emergency fund', 'Automate savings', 'Review investments'] }
  ];

  if (selectedProject) {
    return (
      <div className="space-y-8">
        <button 
          onClick={() => setSelectedProject(null)}
          className="flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest"
        >
          <ChevronLeft size={16} />
          Back to Projects
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex flex-col gap-4">
              <h1 className="text-4xl font-bold tracking-tight text-zinc-900">{selectedProject.title}</h1>
              <p className="text-zinc-500 font-medium">{selectedProject.description}</p>
            </div>

            <Card title="Project Tasks">
              <div className="space-y-4">
                {selectedProject.tasks.map((task: string, i: number) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-zinc-50 rounded-2xl border border-black/5">
                    <div className="w-6 h-6 rounded-full border-2 border-zinc-200" />
                    <span className="font-medium">{task}</span>
                  </div>
                ))}
                <button className="w-full py-3 border border-dashed border-zinc-200 rounded-2xl text-xs font-bold text-zinc-400 hover:bg-zinc-50 transition-all uppercase tracking-widest">
                  + Add Task to Project
                </button>
              </div>
            </Card>
          </div>

          <div className="space-y-8">
            <Card title="Project Stats">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase mb-2">
                    <span>Overall Progress</span>
                    <span>{selectedProject.progress}%</span>
                  </div>
                  <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div className="h-full bg-zinc-900 transition-all duration-500" style={{ width: `${selectedProject.progress}%` }}></div>
                  </div>
                </div>
                <div className="p-4 bg-zinc-50 rounded-2xl border border-black/5">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Status</p>
                  <p className={`font-bold uppercase tracking-widest text-xs ${selectedProject.status === 'on-track' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {selectedProject.status.replace('-', ' ')}
                  </p>
                </div>
                <div className="p-4 bg-zinc-50 rounded-2xl border border-black/5">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Deadline</p>
                  <p className="font-bold text-zinc-900">{selectedProject.deadline}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900">Projects</h1>
        <button className="bg-zinc-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-200">
          <Plus size={18} />
          <span>New Project</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <Card 
            key={project.id} 
            className="hover:shadow-md transition-all cursor-pointer group"
          >
            <div onClick={() => setSelectedProject(project)}>
              <div className="flex justify-between items-start mb-6">
                <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-all">
                  <Briefcase size={20} />
                </div>
                <span className={`px-2 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest ${project.status === 'on-track' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                  {project.status.replace('-', ' ')}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2">{project.title}</h3>
              <p className="text-xs text-zinc-400 font-medium mb-6 flex items-center gap-1">
                <Calendar size={12} />
                Deadline: {project.deadline}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-zinc-900 transition-all duration-500" style={{ width: `${project.progress}%` }}></div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const CalendarTab = ({ 
  schedule, 
  events, 
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent
}: { 
  schedule: DailySchedule | null, 
  events: CalendarEvent[],
  onAddEvent: (event: CalendarEvent) => void,
  onUpdateEvent: (event: CalendarEvent) => void,
  onDeleteEvent: (id: string) => void
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    startTime: '09:00',
    endTime: '10:00',
    type: 'work' as const
  });

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const getWeekDays = (date: Date) => {
    const start = new Date(date);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    start.setDate(diff);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  const weekDays = getWeekDays(currentDate);

  const timeToMinutes = (timeStr: string) => {
    if (!timeStr) return 0;
    // Handle AM/PM format
    if (timeStr.includes('AM') || timeStr.includes('PM')) {
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (hours === 12) hours = 0;
      if (modifier === 'PM') hours += 12;
      return hours * 60 + (minutes || 0);
    }
    // Handle 24h format
    const [hours, minutes] = timeStr.split(':').map(Number);
    return (hours || 0) * 60 + (minutes || 0);
  };

  const minutesToTime = (minutes: number) => {
    let h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  const handleAddEvent = () => {
    if (!newEvent.title) return;
    
    const formatTime = (time: string) => {
      let [h, m] = time.split(':').map(Number);
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12;
      h = h ? h : 12;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
    };

    onAddEvent({
      id: Math.random().toString(36).substr(2, 9),
      title: newEvent.title,
      date: currentDate.toISOString().split('T')[0],
      startTime: formatTime(newEvent.startTime),
      endTime: formatTime(newEvent.endTime),
      type: newEvent.type
    });
    setIsAddModalOpen(false);
    setNewEvent({ title: '', startTime: '09:00', endTime: '10:00', type: 'work' });
  };

  const handleDragEnd = (event: CalendarEvent, info: any, day: Date) => {
    const deltaY = info.offset.y;
    const deltaMinutes = Math.round(deltaY / 60) * 60; // Snap to hour
    
    const startMin = timeToMinutes(event.startTime);
    const endMin = timeToMinutes(event.endTime);
    const duration = endMin - startMin;
    
    const newStartMin = Math.max(0, Math.min(1440 - duration, startMin + deltaMinutes));
    const newEndMin = newStartMin + duration;
    
    onUpdateEvent({
      ...event,
      date: day.toISOString().split('T')[0],
      startTime: minutesToTime(newStartMin),
      endTime: minutesToTime(newEndMin)
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900">Calendar</h1>
          <div className="flex gap-2 bg-white p-1 rounded-xl border border-black/5 shadow-sm">
            <button onClick={() => {
              const d = new Date(currentDate);
              d.setDate(d.getDate() - 7);
              setCurrentDate(d);
            }} className="p-2 hover:bg-zinc-50 rounded-lg transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => {
              const d = new Date(currentDate);
              d.setDate(d.getDate() + 7);
              setCurrentDate(d);
            }} className="p-2 hover:bg-zinc-50 rounded-lg transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
          <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
            {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </span>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-zinc-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-200"
          >
            <Plus size={18} />
            <span>Add Event</span>
          </button>
          <button className="bg-white text-zinc-600 border border-black/5 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium hover:bg-zinc-50 transition-colors">
            <Calendar size={18} />
            <span>Connect Google Calendar</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl border border-black/5"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold tracking-tight">Add Event</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-zinc-100 rounded-full">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Event Title</label>
                  <input 
                    type="text" 
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="What's happening?"
                    className="w-full bg-zinc-50 border border-black/5 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Start Time</label>
                    <input 
                      type="time" 
                      value={newEvent.startTime}
                      onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                      className="w-full bg-zinc-50 border border-black/5 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">End Time</label>
                    <input 
                      type="time" 
                      value={newEvent.endTime}
                      onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                      className="w-full bg-zinc-50 border border-black/5 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Category</label>
                  <select 
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as any })}
                    className="w-full bg-zinc-50 border border-black/5 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
                  >
                    <option value="work">Work</option>
                    <option value="social">Social</option>
                    <option value="health">Health</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <button 
                  onClick={handleAddEvent}
                  className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold mt-4 hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200"
                >
                  Create Event
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-[40px] border border-black/5 shadow-sm overflow-hidden">
        <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-zinc-100">
          <div className="p-6 border-r border-zinc-50" />
          {weekDays.map((day, i) => (
            <div key={i} className={`p-6 text-center border-r border-zinc-50 last:border-0 ${day.toDateString() === new Date().toDateString() ? 'bg-zinc-50' : ''}`}>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{days[i]}</p>
              <p className={`text-2xl font-bold ${day.toDateString() === new Date().toDateString() ? 'text-zinc-900' : 'text-zinc-400'}`}>
                {day.getDate()}
              </p>
            </div>
          ))}
        </div>
        <div className="h-[600px] overflow-y-auto relative custom-scrollbar">
          <div className="grid grid-cols-[80px_repeat(7,1fr)] min-h-[1440px]">
            {/* Time Labels */}
            <div className="border-r border-zinc-50 bg-zinc-50/30">
              {[...Array(24)].map((_, i) => (
                <div key={i} className="h-[60px] border-b border-zinc-50 flex items-start justify-center pt-2">
                  <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">{i}:00</span>
                </div>
              ))}
            </div>

            {/* Day Columns */}
            {weekDays.map((day, dayIdx) => (
              <div key={dayIdx} className="relative border-r border-zinc-50 last:border-0">
                {[...Array(24)].map((_, i) => (
                  <div key={i} className="h-[60px] border-b border-zinc-50/50" />
                ))}

                {/* Render Schedule Blocks only for today */}
                {day.toDateString() === new Date().toDateString() && schedule?.blocks && schedule.blocks.map((block, i) => {
                  const startMin = timeToMinutes(block.startTime);
                  const endMin = timeToMinutes(block.endTime);
                  const duration = endMin - startMin;
                  const top = startMin;
                  const height = duration;

                  return (
                    <div 
                      key={`block-${i}`}
                      className={`absolute left-1 right-1 p-2 rounded-xl border shadow-sm z-10 overflow-hidden ${block.type === 'focus' ? 'bg-amber-50 border-amber-100 text-amber-900' : block.type === 'meeting' ? 'bg-blue-50 border-blue-100 text-blue-900' : 'bg-zinc-50 border-zinc-100 text-zinc-900'}`}
                      style={{ top: `${top}px`, height: `${height}px` }}
                    >
                      <div className="flex flex-col h-full">
                        <span className="text-[8px] font-bold uppercase tracking-widest opacity-60 mb-0.5">{block.startTime}</span>
                        <h4 className="text-[10px] font-bold leading-tight line-clamp-2">{block.label}</h4>
                      </div>
                    </div>
                  );
                })}

                {/* Render Custom Events */}
                {events.filter(e => e.date === day.toISOString().split('T')[0]).map((event, i) => {
                  const startMin = timeToMinutes(event.startTime);
                  const endMin = timeToMinutes(event.endTime);
                  const duration = endMin - startMin;
                  const top = startMin;
                  const height = duration;

                  return (
                    <motion.div 
                      key={event.id}
                      drag="y"
                      dragMomentum={false}
                      onDragEnd={(_, info) => handleDragEnd(event, info, day)}
                      className={`absolute left-1 right-1 p-2 rounded-xl border shadow-sm z-20 overflow-hidden cursor-grab active:cursor-grabbing group ${event.type === 'work' ? 'bg-zinc-900 text-white border-zinc-900' : event.type === 'health' ? 'bg-emerald-50 border-emerald-100 text-emerald-900' : event.type === 'social' ? 'bg-blue-50 border-blue-100 text-blue-900' : event.type === 'workout' ? 'bg-amber-900 text-white border-amber-900' : 'bg-zinc-50 border-zinc-100 text-zinc-900'}`}
                      style={{ top: `${top}px`, height: `${height}px` }}
                    >
                      <div className="flex flex-col h-full relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Delete this event?')) onDeleteEvent(event.id);
                          }}
                          className="absolute top-0 right-0 p-1 bg-white/10 hover:bg-white/20 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={10} />
                        </button>
                        <span className={`text-[8px] font-bold uppercase tracking-widest mb-0.5 ${['work', 'workout'].includes(event.type) ? 'text-white/60' : 'opacity-60'}`}>{event.startTime}</span>
                        <h4 className="text-[10px] font-bold leading-tight line-clamp-2">{event.title}</h4>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const WorkoutPlannerTab = ({ 
  workouts, 
  onAddWorkout,
  onUpdateWorkout,
  onDeleteWorkout
}: { 
  workouts: Workout[], 
  onAddWorkout: (w: Workout) => void,
  onUpdateWorkout: (w: Workout) => void,
  onDeleteWorkout: (id: string) => void
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [newWorkout, setNewWorkout] = useState({
    title: '',
    type: 'Strength',
    duration: 45,
    startTime: '08:00',
    endTime: '08:45'
  });

  useEffect(() => {
    if (editingWorkout) {
      setNewWorkout({
        title: editingWorkout.title,
        type: editingWorkout.type,
        duration: editingWorkout.duration,
        startTime: editingWorkout.startTime,
        endTime: editingWorkout.endTime
      });
      setSelectedDay(new Date(editingWorkout.date));
      setIsAddModalOpen(true);
    }
  }, [editingWorkout]);

  const handleAddWorkout = () => {
    if (!selectedDay || !newWorkout.title) return;
    
    const dateStr = selectedDay.toISOString().split('T')[0];
    
    if (editingWorkout) {
      onUpdateWorkout({
        ...editingWorkout,
        title: newWorkout.title,
        date: dateStr,
        type: newWorkout.type,
        duration: newWorkout.duration,
        startTime: newWorkout.startTime,
        endTime: newWorkout.endTime
      });
    } else {
      onAddWorkout({
        id: Math.random().toString(36).substr(2, 9),
        title: newWorkout.title,
        date: dateStr,
        type: newWorkout.type,
        duration: newWorkout.duration,
        startTime: newWorkout.startTime,
        endTime: newWorkout.endTime,
        completed: false
      });
    }
    
    setIsAddModalOpen(false);
    setEditingWorkout(null);
    setNewWorkout({ title: '', type: 'Strength', duration: 45, startTime: '08:00', endTime: '08:45' });
  };

  const handleDeleteWorkout = (id: string) => {
    if (confirm('Are you sure you want to delete this workout?')) {
      onDeleteWorkout(id);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days = [];
    // Pad start
    const startPadding = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const monthDays = getDaysInMonth(currentDate);
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900">Workout Planner</h1>
          <div className="flex gap-2 bg-white p-1 rounded-xl border border-black/5 shadow-sm">
            <button onClick={() => {
              const d = new Date(currentDate);
              d.setMonth(d.getMonth() - 1);
              setCurrentDate(d);
            }} className="p-2 hover:bg-zinc-50 rounded-lg transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => {
              const d = new Date(currentDate);
              d.setMonth(d.getMonth() + 1);
              setCurrentDate(d);
            }} className="p-2 hover:bg-zinc-50 rounded-lg transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
          <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
            {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[40px] border border-black/5 shadow-sm overflow-hidden p-8">
            <div className="grid grid-cols-7 mb-4">
              {weekDays.map(day => (
                <div key={day} className="text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {monthDays.map((day, i) => {
                if (!day) return <div key={`pad-${i}`} className="aspect-square" />;
                
                const dateStr = day.toISOString().split('T')[0];
                const dayWorkouts = workouts.filter(w => w.date === dateStr);
                const isToday = day.toDateString() === new Date().toDateString();
                
                return (
                  <div 
                    key={i}
                    onClick={() => {
                      setSelectedDay(day);
                      setIsAddModalOpen(true);
                    }}
                    className={`aspect-square p-2 rounded-2xl border transition-all cursor-pointer group relative ${isToday ? 'bg-zinc-900 border-zinc-900' : 'bg-zinc-50 border-black/5 hover:bg-white hover:shadow-md'}`}
                  >
                    <span className={`text-xs font-bold ${isToday ? 'text-white' : 'text-zinc-400'}`}>{day.getDate()}</span>
                    <div className="mt-1 space-y-1">
                      {dayWorkouts.map((w, idx) => (
                        <div key={idx} className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md truncate ${isToday ? 'bg-white/20 text-white' : 'bg-zinc-900 text-white'}`}>
                          {w.title}
                        </div>
                      ))}
                    </div>
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus size={12} className={isToday ? 'text-white' : 'text-zinc-400'} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card title="Upcoming Workouts">
            <div className="space-y-4">
              {workouts.filter(w => new Date(w.date) >= new Date(new Date().setHours(0,0,0,0))).sort((a,b) => a.date.localeCompare(b.date)).slice(0, 5).map(w => (
                <div key={w.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-black/5 group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <Activity size={16} className="text-zinc-900" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">{w.title}</h4>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{w.date} • {w.startTime} • {w.duration}m</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setEditingWorkout(w)}
                      className="p-2 hover:bg-zinc-200 rounded-lg text-zinc-400 hover:text-zinc-900 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Settings size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteWorkout(w.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-zinc-400 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div className={`w-2 h-2 rounded-full ${w.completed ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
                  </div>
                </div>
              ))}
              {workouts.length === 0 && (
                <p className="text-xs text-zinc-400 italic text-center py-4">No workouts planned yet.</p>
              )}
            </div>
          </Card>

          <Card title="Monthly Stats">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-500 font-medium">Total Workouts</span>
                <span className="text-lg font-bold">{workouts.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-500 font-medium">Completed</span>
                <span className="text-lg font-bold text-emerald-600">
                  {workouts.filter(w => w.completed).length}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl border border-black/5"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold tracking-tight">{editingWorkout ? 'Edit Workout' : 'Plan Workout'}</h2>
                <button onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingWorkout(null);
                }} className="p-2 hover:bg-zinc-100 rounded-full">
                  <X size={20} />
                </button>
              </div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6">
                For {selectedDay?.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Workout Title</label>
                  <input 
                    type="text" 
                    value={newWorkout.title}
                    onChange={(e) => setNewWorkout({ ...newWorkout, title: e.target.value })}
                    placeholder="e.g. Upper Body Power"
                    className="w-full bg-zinc-50 border border-black/5 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Start Time</label>
                    <input 
                      type="time" 
                      value={newWorkout.startTime}
                      onChange={(e) => setNewWorkout({ ...newWorkout, startTime: e.target.value })}
                      className="w-full bg-zinc-50 border border-black/5 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">End Time</label>
                    <input 
                      type="time" 
                      value={newWorkout.endTime}
                      onChange={(e) => setNewWorkout({ ...newWorkout, endTime: e.target.value })}
                      className="w-full bg-zinc-50 border border-black/5 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Type</label>
                    <select 
                      value={newWorkout.type}
                      onChange={(e) => setNewWorkout({ ...newWorkout, type: e.target.value })}
                      className="w-full bg-zinc-50 border border-black/5 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
                    >
                      <option>Strength</option>
                      <option>Cardio</option>
                      <option>Yoga</option>
                      <option>HIIT</option>
                      <option>Mobility</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Duration (min)</label>
                    <input 
                      type="number" 
                      value={newWorkout.duration}
                      onChange={(e) => setNewWorkout({ ...newWorkout, duration: parseInt(e.target.value) })}
                      className="w-full bg-zinc-50 border border-black/5 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
                    />
                  </div>
                </div>
                <button 
                  onClick={handleAddWorkout}
                  className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold mt-4 hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200"
                >
                  {editingWorkout ? 'Update Workout' : 'Plan Workout'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SideQuestsTab = () => {
  const dopamineMenu = [
    { title: "Quick Meditation", duration: 5, reward: "50 XP", icon: Wind },
    { title: "Hydration Break", duration: 2, reward: "20 XP", icon: Activity },
    { title: "Stretch Routine", duration: 10, reward: "75 XP", icon: Zap },
    { title: "Read 10 Pages", duration: 15, reward: "100 XP", icon: BookOpen },
    { title: "Power Nap", duration: 20, reward: "150 XP", icon: ClockIcon }
  ].sort((a, b) => a.duration - b.duration);

  const sideQuests = [
    { title: "Visit a new coffee shop", difficulty: "Easy", reward: "200 XP", icon: Compass },
    { title: "Learn a new skill for 1 hour", difficulty: "Medium", reward: "500 XP", icon: Target },
    { title: "Cook a new recipe", difficulty: "Medium", reward: "400 XP", icon: Heart },
    { title: "Attend a local meetup", difficulty: "Hard", reward: "1000 XP", icon: Users }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900">Side Quests</h1>
        <div className="flex items-center gap-3 bg-zinc-900 text-white px-4 py-2 rounded-2xl shadow-lg">
          <Trophy size={18} className="text-amber-400" />
          <span className="text-sm font-bold">Level 12 • 2,450 XP</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Dopamine Menu (Sorted by Duration)">
          <div className="space-y-4">
            {dopamineMenu.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-black/5 hover:bg-white hover:shadow-md transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-all shadow-sm">
                    <item.icon size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{item.title}</h4>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{item.duration} min</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-600">+{item.reward}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Side Quests (Make Life Interesting)">
          <div className="space-y-4">
            {sideQuests.map((quest, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-black/5 hover:bg-white hover:shadow-md transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-all shadow-sm">
                    <quest.icon size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{quest.title}</h4>
                    <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${quest.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-600' : quest.difficulty === 'Medium' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
                      {quest.difficulty}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-amber-600">+{quest.reward}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

const KnowledgeBaseTab = () => {
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const topics = [
    { title: "Artificial Intelligence", notes: 12, lastUpdated: "2h ago", content: "AI is transforming how we work and live. Key areas include LLMs, computer vision, and robotics." },
    { title: "Productivity Systems", notes: 8, lastUpdated: "1d ago", content: "Systems like GTD, Time Blocking, and the Zettelkasten method help manage information and tasks." },
    { title: "Digital Health", notes: 5, lastUpdated: "3d ago", content: "Using technology to improve physical and mental well-being, from wearables to meditation apps." },
    { title: "Philosophy", notes: 15, lastUpdated: "5d ago", content: "Exploring fundamental questions about existence, knowledge, values, and reason." }
  ];

  if (selectedTopic) {
    return (
      <div className="space-y-8">
        <button 
          onClick={() => setSelectedTopic(null)}
          className="flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest"
        >
          <ChevronLeft size={16} />
          Back to Knowledge Base
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex flex-col gap-4">
              <h1 className="text-4xl font-bold tracking-tight text-zinc-900">{selectedTopic.title}</h1>
              <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                <span>{selectedTopic.notes} Notes</span>
                <span>•</span>
                <span>Updated {selectedTopic.lastUpdated}</span>
              </div>
            </div>

            <Card title="Topic Overview">
              <div className="prose prose-zinc prose-sm max-w-none">
                <p className="text-zinc-600 leading-relaxed">{selectedTopic.content}</p>
              </div>
            </Card>

            <Card title="Notes">
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-4 bg-zinc-50 rounded-2xl border border-black/5 hover:bg-white hover:shadow-sm transition-all cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm">Note Title {i}</h4>
                      <ChevronRight size={16} className="text-zinc-300 group-hover:text-zinc-900" />
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">Snippet of the note content goes here...</p>
                  </div>
                ))}
                <button className="w-full py-3 border border-dashed border-zinc-200 rounded-2xl text-xs font-bold text-zinc-400 hover:bg-zinc-50 transition-all uppercase tracking-widest">
                  + Add New Note
                </button>
              </div>
            </Card>
          </div>

          <div className="space-y-8">
            <Card title="AI Assistant">
              <div className="space-y-4">
                <p className="text-xs text-zinc-500 italic">Ask the AI about this topic based on your notes.</p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Ask anything..." 
                    className="flex-1 bg-zinc-50 border border-black/5 rounded-xl p-3 text-sm outline-none"
                  />
                  <button className="p-3 bg-zinc-900 text-white rounded-xl">
                    <Sparkles size={18} />
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900">Knowledge Base</h1>
        <button 
          onClick={() => alert("New Topic feature coming soon!")}
          className="bg-zinc-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-200"
        >
          <Plus size={18} />
          <span>New Topic</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {topics.map((topic, i) => (
          <Card 
            key={i} 
            className="hover:shadow-md transition-all cursor-pointer group"
          >
            <div onClick={() => setSelectedTopic(topic)}>
              <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-zinc-900 group-hover:text-white transition-all">
                <BookOpen size={20} />
              </div>
              <h3 className="text-lg font-bold mb-1">{topic.title}</h3>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">{topic.notes} Notes</p>
              <div className="flex items-center justify-between pt-4 border-t border-zinc-50">
                <span className="text-[8px] font-bold text-zinc-300 uppercase tracking-widest">Updated {topic.lastUpdated}</span>
                <ChevronRight size={14} className="text-zinc-300 group-hover:text-zinc-900" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card title="Recent AI Summaries">
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-4 bg-zinc-50 rounded-2xl border border-black/5 flex items-center justify-between group cursor-pointer hover:bg-white hover:shadow-sm transition-all">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <Sparkles size={14} className="text-amber-500" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Summary of "Building a Second Brain"</h4>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Added yesterday</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-zinc-300 group-hover:text-zinc-900" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

const SettingsTab = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold tracking-tight text-zinc-900">Settings</h1>
      
      <div className="max-w-2xl space-y-6">
        <Card title="Profile Settings">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-zinc-100 rounded-2xl overflow-hidden">
                <img src="https://picsum.photos/seed/user/100/100" alt="User" referrerPolicy="no-referrer" />
              </div>
              <button className="px-4 py-2 bg-zinc-100 text-zinc-600 rounded-xl text-xs font-bold hover:bg-zinc-200 transition-all">
                Change Photo
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Full Name</label>
                <input type="text" defaultValue="Lea Rattei" className="w-full bg-zinc-50 border border-black/5 rounded-xl p-3 text-sm outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Email</label>
                <input type="email" defaultValue="lea.rattei@gmail.com" className="w-full bg-zinc-50 border border-black/5 rounded-xl p-3 text-sm outline-none" />
              </div>
            </div>
          </div>
        </Card>

        <Card title="Life Vision Settings">
          <div className="space-y-4">
            <p className="text-sm text-zinc-500">Your vision was generated on Mar 21, 2026. You can reset it to start the AI questionnaire again.</p>
            <button className="px-6 py-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-all border border-red-100">
              Reset Life Vision
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
const SidebarItem = ({ icon: Icon, label, active = false, collapsed = false }: { icon: any, label: string, active?: boolean, collapsed?: boolean }) => (
  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 group relative ${active ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-100'}`}>
    <Icon size={20} className="shrink-0" />
    {!collapsed && <span className="font-medium text-sm whitespace-nowrap">{label}</span>}
    {collapsed && (
      <div className="absolute left-full ml-4 px-3 py-1 bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
        {label}
      </div>
    )}
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
  const [activeTab, setActiveTab] = useState<'overview' | 'vision' | 'projects' | 'work' | 'calendar' | 'quests' | 'knowledge' | 'workout' | 'settings'>('overview');
  const [interests] = useState(['Artificial Intelligence', 'Productivity', 'Digital Health']);
  const [dailyPulseData, setDailyPulseData] = useState<DailyPulseData>({
    energy: 0,
    focus: 0,
    source: null
  });
  const [isOverwhelmed, setIsOverwhelmed] = useState(false);
  const [visionData, setVisionData] = useState<LifeVisionData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([
    { id: 't1', title: 'Design Landing Page', duration: 60, urgency: 'high', isStrategic: true, isFrog: false, status: 'todo' },
    { id: 't2', title: 'Write Blog Post', duration: 45, urgency: 'medium', isStrategic: false, isFrog: true, status: 'todo' },
    { id: 't3', title: 'Review Analytics', duration: 30, urgency: 'low', isStrategic: false, isFrog: false, status: 'todo' },
  ]);
  const [schedule, setSchedule] = useState<DailySchedule | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([
    { id: 'e1', title: 'Deep Work: App Architecture', date: new Date().toISOString().split('T')[0], startTime: '09:00 AM', endTime: '11:30 AM', type: 'work' },
    { id: 'e2', title: 'Lunch with Sarah', date: new Date().toISOString().split('T')[0], startTime: '12:30 PM', endTime: '01:30 PM', type: 'social' },
    { id: 'e3', title: 'Product Review', date: new Date().toISOString().split('T')[0], startTime: '02:00 PM', endTime: '03:00 PM', type: 'work' },
    { id: 'e4', title: 'Gym Session', date: new Date().toISOString().split('T')[0], startTime: '04:30 PM', endTime: '05:30 PM', type: 'health' }
  ]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isCheckInOpen, setIsCheckInOpen] = useState(true);

  const handleAddWorkout = (w: Workout) => {
    setWorkouts([...workouts, w]);
    
    // Feed into calendar
    const formatTime = (time: string) => {
      let [h, m] = time.split(':').map(Number);
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12;
      h = h ? h : 12;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
    };

    const newEvent: CalendarEvent = {
      id: `w-${w.id}`,
      title: `Workout: ${w.title}`,
      date: w.date,
      startTime: formatTime(w.startTime),
      endTime: formatTime(w.endTime),
      type: 'workout'
    };
    setCalendarEvents(prev => [...prev, newEvent]);
  };

  const handleUpdateWorkout = (updatedWorkout: Workout) => {
    setWorkouts(prev => prev.map(w => w.id === updatedWorkout.id ? updatedWorkout : w));
    
    // Update calendar event too
    const formatTime = (time: string) => {
      let [h, m] = time.split(':').map(Number);
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12;
      h = h ? h : 12;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
    };

    setCalendarEvents(prev => prev.map(e => e.id === `w-${updatedWorkout.id}` ? {
      ...e,
      title: `Workout: ${updatedWorkout.title}`,
      date: updatedWorkout.date,
      startTime: formatTime(updatedWorkout.startTime),
      endTime: formatTime(updatedWorkout.endTime)
    } : e));
  };

  const handleDeleteWorkout = (id: string) => {
    setWorkouts(prev => prev.filter(w => w.id !== id));
    setCalendarEvents(prev => prev.filter(e => e.id !== `w-${id}`));
  };

  const handleUpdateEvent = (updatedEvent: CalendarEvent) => {
    setCalendarEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
    
    // If it's a workout event, update the workout state too
    if (updatedEvent.id.startsWith('w-')) {
      const workoutId = updatedEvent.id.replace('w-', '');
      
      const parseTime = (timeStr: string) => {
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (hours === 12) hours = 0;
        if (modifier === 'PM') hours += 12;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      };

      setWorkouts(prev => prev.map(w => w.id === workoutId ? {
        ...w,
        date: updatedEvent.date,
        startTime: parseTime(updatedEvent.startTime),
        endTime: parseTime(updatedEvent.endTime)
      } : w));
    }
  };

  const handleCheckInSave = (energy: number, focus: number) => {
    setDailyPulseData({
      energy,
      focus,
      source: 'manual'
    });
  };

  const handleCheckInComplete = async (newTasks: Task[], energy: number, focus: number, notes: string) => {
    // Add new tasks to the centralized task list if they don't exist
    setAllTasks(prev => {
      const existingIds = new Set(prev.map(t => t.id));
      const uniqueNewTasks = newTasks.filter(t => !existingIds.has(t.id));
      return [...prev, ...uniqueNewTasks];
    });
    setTasks(newTasks);
    setDailyPulseData({ energy, focus, source: 'manual' });
    setIsCheckInOpen(false);

    // Generate schedule with AI
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Create a daily schedule for a user with these tasks:
        ${newTasks.map(t => `- ${t.title} (Urgency: ${t.urgency}, Strategic: ${t.isStrategic}, Frog: ${t.isFrog})`).join('\n')}
        
        Energy Level: ${energy}/10
        Focus Level: ${focus}/10
        Notes: ${notes}
        
        Rules:
        1. "Frog" tasks (unpleasant but important) MUST be scheduled first thing in the morning.
        2. "Strategic" tasks should be placed during high energy/focus periods.
        3. Include breaks and meetings.
        
        Return the response as a JSON object with this structure:
        {
          "summary": "...",
          "blocks": [
            { "id": "...", "startTime": "HH:MM", "endTime": "HH:MM", "label": "...", "type": "focus|meeting|break", "tasks": ["taskId1", "taskId2"] }
          ]
        }`,
        config: {
          responseMimeType: "application/json"
        }
      });

      const data = JSON.parse(response.text || '{}');
      setSchedule(data);
      setActiveTab('work');
    } catch (error) {
      console.error("Schedule generation failed:", error);
    }
  };

  const isSidebarCollapsed = true; // Always collapsed as per user request

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
      <div className="flex h-screen overflow-hidden">
        
        {/* Left Sidebar - Menu */}
        <aside className={`border-r border-black/5 bg-white flex flex-col p-6 transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'w-24' : 'w-64'}`}>
          <div className={`flex items-center gap-2 mb-10 px-2 transition-all duration-500 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center shrink-0">
              <Compass className="text-white" size={18} />
            </div>
            {!isSidebarCollapsed && <span className="font-bold text-xl tracking-tight italic whitespace-nowrap">lifedotAI</span>}
          </div>

          <nav className="flex-1 space-y-1">
            <div onClick={() => setActiveTab('overview')}>
              <SidebarItem icon={LayoutDashboard} label="Overview" active={activeTab === 'overview'} collapsed={isSidebarCollapsed} />
            </div>
            <div onClick={() => setActiveTab('vision')}>
              <SidebarItem icon={Target} label="Life Vision" active={activeTab === 'vision'} collapsed={isSidebarCollapsed} />
            </div>
            <div onClick={() => setActiveTab('projects')}>
              <SidebarItem icon={Briefcase} label="Projects" active={activeTab === 'projects'} collapsed={isSidebarCollapsed} />
            </div>
            <div onClick={() => setActiveTab('work')}>
              <SidebarItem icon={Timer} label="Work Mode" active={activeTab === 'work'} collapsed={isSidebarCollapsed} />
            </div>
            <div onClick={() => setActiveTab('calendar')}>
              <SidebarItem icon={Calendar} label="Calendar" active={activeTab === 'calendar'} collapsed={isSidebarCollapsed} />
            </div>
            <div onClick={() => setActiveTab('workout')}>
              <SidebarItem icon={Activity} label="Workout Planner" active={activeTab === 'workout'} collapsed={isSidebarCollapsed} />
            </div>
            <div onClick={() => setActiveTab('quests')}>
              <SidebarItem icon={Gamepad2} label="Side Quests" active={activeTab === 'quests'} collapsed={isSidebarCollapsed} />
            </div>
            <div onClick={() => setActiveTab('knowledge')}>
              <SidebarItem icon={BookOpen} label="Knowledge" active={activeTab === 'knowledge'} collapsed={isSidebarCollapsed} />
            </div>
          </nav>

          <div className="mt-auto pt-6 border-t border-black/5 space-y-1">
            <div onClick={() => setActiveTab('settings')}>
              <SidebarItem icon={Settings} label="Settings" active={activeTab === 'settings'} collapsed={isSidebarCollapsed} />
            </div>
            <div className={`flex items-center gap-3 px-4 py-3 mt-4 bg-zinc-100 rounded-2xl transition-all duration-500 ${isSidebarCollapsed ? 'justify-center px-2' : ''}`}>
              <div className="w-8 h-8 bg-zinc-300 rounded-full overflow-hidden shrink-0">
                <img src="https://picsum.photos/seed/user/100/100" alt="User" referrerPolicy="no-referrer" />
              </div>
              {!isSidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">Lea Rattei</p>
                  <p className="text-xs text-zinc-500 truncate">Pro Plan</p>
                </div>
              )}
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
              <button 
                onClick={() => setIsOverwhelmed(true)}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:bg-red-100 transition-all border border-red-100"
              >
                <Wind size={16} />
                <span>Overwhelmed</span>
              </button>
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
            <AnimatePresence mode="wait">
              {activeTab === 'overview' ? (
                <motion.div 
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-bold tracking-tight text-zinc-900">Good morning, Lea.</h1>
                    <p className="text-zinc-500 font-medium">Ready to build a life you love today?</p>
                  </div>

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
                      </div>
                      <CalendarPreview />
                    </div>
                  </div>
                </motion.div>
              ) : activeTab === 'vision' ? (
                <motion.div 
                  key="vision"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <LifeVision visionData={visionData} onUpdateVision={setVisionData} />
                </motion.div>
              ) : activeTab === 'work' ? (
                <motion.div 
                  key="work"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <WorkMode 
                    tasks={tasks} 
                    allTasks={allTasks}
                    schedule={schedule} 
                    onUpdateSchedule={setSchedule} 
                    onUpdateTasks={setAllTasks}
                    onStartCheckIn={() => setIsCheckInOpen(true)}
                  />
                </motion.div>
              ) : activeTab === 'projects' ? (
                <motion.div 
                  key="projects"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <ProjectsTab />
                </motion.div>
              ) : activeTab === 'calendar' ? (
                <motion.div 
                  key="calendar"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <CalendarTab 
                    schedule={schedule} 
                    events={calendarEvents}
                    onAddEvent={(e) => setCalendarEvents([...calendarEvents, e])}
                    onUpdateEvent={handleUpdateEvent}
                    onDeleteEvent={(id) => {
                      setCalendarEvents(prev => prev.filter(e => e.id !== id));
                      if (id.startsWith('w-')) {
                        const workoutId = id.replace('w-', '');
                        setWorkouts(prev => prev.filter(w => w.id !== workoutId));
                      }
                    }}
                  />
                </motion.div>
              ) : activeTab === 'workout' ? (
                <motion.div 
                  key="workout"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <WorkoutPlannerTab 
                    workouts={workouts}
                    onAddWorkout={handleAddWorkout}
                    onUpdateWorkout={handleUpdateWorkout}
                    onDeleteWorkout={handleDeleteWorkout}
                  />
                </motion.div>
              ) : activeTab === 'quests' ? (
                <motion.div 
                  key="quests"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <SideQuestsTab />
                </motion.div>
              ) : activeTab === 'knowledge' ? (
                <motion.div 
                  key="knowledge"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <KnowledgeBaseTab />
                </motion.div>
              ) : activeTab === 'settings' ? (
                <motion.div 
                  key="settings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <SettingsTab />
                </motion.div>
              ) : (
                <motion.div 
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-40 text-center"
                >
                  <div className="w-20 h-20 bg-zinc-100 rounded-3xl flex items-center justify-center mb-6">
                    <Compass className="text-zinc-400" size={40} />
                  </div>
                  <h2 className="text-2xl font-bold mb-2 uppercase tracking-widest">Coming Soon</h2>
                  <p className="text-zinc-500 font-medium">We're still building the {activeTab} lab. Stay tuned!</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        <AnimatePresence>
          {isOverwhelmed && (
            <OverwhelmedModal isOpen={isOverwhelmed} onClose={() => setIsOverwhelmed(false)} />
          )}
          {isCheckInOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90] bg-white flex flex-col items-center justify-center p-6"
            >
              <button 
                onClick={() => setIsCheckInOpen(false)}
                className="absolute top-8 right-8 p-3 hover:bg-zinc-100 rounded-full transition-colors border border-black/5"
              >
                <X size={24} />
              </button>
              <DailyCheckIn onComplete={handleCheckInComplete} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
