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
  Sparkles,
  Check
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
  estimatedDuration?: '<5min' | '<30min' | '30min+';
  projectId?: string;
  priority: 'low' | 'medium' | 'high';
  isStrategic: boolean;
  isFrog: boolean;
  status: 'todo' | 'done';
  notes?: string;
  deadline?: string;
}

interface Project {
  id: string;
  title: string;
  status: 'on-track' | 'at-risk' | 'completed';
  deadline: string;
  description: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
}

interface KnowledgeTopic {
  id: string;
  title: string;
  notes: Note[];
  lastUpdated: string;
  content: string;
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
    <div className="glass-card flex flex-col items-center justify-center p-6 rounded-3xl">
      <div className="text-4xl font-mono font-bold tracking-tighter text-white">
        {formatTime(time)}
      </div>
      <div className="text-[10px] uppercase tracking-widest text-white/40 mt-2 font-bold">
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
              className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-sm outline-none focus:ring-2 focus:ring-white/20 transition-all text-white"
            >
              <option className="bg-zinc-900">App Development</option>
              <option className="bg-zinc-900">Life Visioning</option>
              <option className="bg-zinc-900">Health & Fitness</option>
              <option className="bg-zinc-900">Learning</option>
            </select>
            <button 
              onClick={() => setIsTracking(true)}
              className="w-full py-3 glass-button rounded-xl flex items-center justify-center gap-2 text-sm font-bold shadow-lg"
            >
              <Play size={16} fill="currentColor" />
              Start Tracking
            </button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center p-4 glass-card rounded-2xl">
              <p className="text-[10px] font-bold text-white/40 uppercase mb-1">{project}</p>
              <p className="text-3xl font-mono font-bold tracking-tighter text-white">
                {formatDuration(seconds)}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => setIsTracking(!isTracking)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${isTracking ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'glass-button'}`}
              >
                {isTracking ? <Pause size={18} /> : <Play size={18} />}
                <span className="text-[10px] font-bold uppercase mt-1">{isTracking ? 'Pause' : 'Resume'}</span>
              </button>
              <button 
                onClick={handleSave}
                className="flex flex-col items-center justify-center p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-xl hover:bg-emerald-500/30 transition-all"
              >
                <Save size={18} />
                <span className="text-[10px] font-bold uppercase mt-1">Save</span>
              </button>
              <button 
                onClick={handleDelete}
                className="flex flex-col items-center justify-center p-3 bg-red-500/20 border border-red-500/40 text-red-400 rounded-xl hover:bg-red-500/30 transition-all"
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
            <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase">
              {data.source === 'manual' ? <Zap size={12} /> : <Watch size={12} />}
              <span>Source: {data.source === 'manual' ? 'Manual Check-in' : 'Fitness Watch'}</span>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold text-white/40 uppercase mb-2">
                <span>Energy Level</span>
                <span>{data.energy * 10}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-white/80 transition-all duration-500" style={{ width: `${data.energy * 10}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold text-white/40 uppercase mb-2">
                <span>Focus Score</span>
                <span>{data.focus * 10}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-white/80 transition-all duration-500" style={{ width: `${data.focus * 10}%` }}></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-white/5 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center gap-2">
            <Watch size={24} className="text-white/40" />
            <p className="text-xs text-white/60 font-medium">No data available. Check-in or connect a device.</p>
          </div>
        )}
        <button className="w-full py-3 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-white hover:bg-white/20 transition-all">
          <Activity size={16} />
          Connect Fitness Watch
        </button>
      </div>
    </Card>
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
              <div className="w-2 h-2 rounded-full bg-white mt-1" />
              <div className="w-px flex-1 bg-white/10 my-1 group-last:hidden" />
            </div>
            <div className="flex-1 pb-4">
              <p className="text-[10px] font-bold text-white/40 uppercase">{event.time}</p>
              <p className="text-sm font-semibold text-white">{event.title}</p>
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
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        setSummary("Error: Gemini API key is not configured. Please set it in your environment variables.");
        return;
      }
      const ai = new GoogleGenAI({ apiKey });
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
    } catch (error: any) {
      console.error("Failed to fetch news:", error);
      let errorMessage = "Failed to load news updates. Please try again later.";
      if (error.message?.includes("API key")) {
        errorMessage = "Invalid API key. Please check your configuration.";
      }
      setSummary(errorMessage);
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
          <Loader2 className="animate-spin text-white/40" size={32} />
          <p className="text-xs text-white/40 font-medium animate-pulse tracking-widest uppercase">Curating your personal newsletter...</p>
        </div>
      ) : (
        <div className="space-y-12 py-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <div className="flex items-center gap-3 text-[10px] font-bold text-white/40 uppercase tracking-widest">
              <Newspaper size={16} />
              <span>Daily Briefing • {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <button 
              onClick={fetchNews}
              className="text-[10px] font-bold text-white/60 hover:text-white uppercase tracking-widest transition-colors glass-button px-3 py-1.5 rounded-full"
            >
              Refresh
            </button>
          </div>
          
          <div className="prose prose-invert prose-sm max-w-none prose-headings:tracking-tight prose-headings:font-bold prose-headings:mt-12 prose-headings:mb-6 prose-p:text-white/70 prose-p:leading-relaxed prose-p:mb-6 prose-li:text-white/70 prose-li:mb-4">
            <div className="markdown-body space-y-8">
              <Markdown>{summary}</Markdown>
            </div>
          </div>
          
          <div className="pt-12 border-t border-white/10">
            <p className="text-[10px] text-white/40 italic text-center tracking-widest uppercase opacity-60">
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
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-xl flex flex-col items-center justify-center text-white p-6"
    >
      <button 
        onClick={onClose}
        className="absolute top-8 right-8 p-3 hover:bg-white/10 rounded-full transition-colors border border-white/10"
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
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto shadow-inner border border-white/10">
              <Wind size={40} className="text-white/40" />
            </div>
            <h2 className="text-6xl font-bold tracking-tighter">Take a breath.</h2>
            <p className="text-white/40 max-w-md mx-auto font-medium leading-relaxed">
              Let's reset with a 5-second box breathing routine. 
              Find a comfortable position and clear your mind.
            </p>
            <button 
              onClick={startBreathing}
              className="px-16 py-5 bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-full font-bold text-lg hover:bg-white/30 transition-all shadow-2xl shadow-black/20"
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
                className="absolute inset-0 bg-white rounded-full"
              />
              <motion.div 
                animate={{ 
                  scale: (breathPhase === 'Inhale' || breathPhase === 'Hold') ? 1.2 : 1,
                  borderWidth: (breathPhase === 'Inhale' || breathPhase === 'Hold') ? '2px' : '1px'
                }}
                transition={{ duration: 5, ease: "easeInOut" }}
                className="absolute inset-10 border border-white/20 rounded-full"
              />
              <div className="z-10 flex flex-col items-center">
                <span className="text-6xl font-mono font-bold tracking-tighter">{timer}</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mt-2">Seconds</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-4xl font-bold tracking-tight uppercase tracking-[0.25em] text-white">
                {breathPhase === 'Rest' ? 'Hold' : breathPhase}
              </h3>
              <div className="flex gap-2 justify-center">
                {[...Array(totalCycles)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-2 h-2 rounded-full transition-all duration-500 ${i < cycle ? 'bg-white w-6' : i === cycle ? 'bg-white/40' : 'bg-white/10'}`} 
                  />
                ))}
              </div>
              <p className="text-white/40 font-bold uppercase text-[10px] tracking-widest">Cycle {cycle + 1} of {totalCycles}</p>
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
            <div className="w-24 h-24 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-emerald-500/20">
              <Sparkles size={40} />
            </div>
            <h2 className="text-5xl font-bold tracking-tighter">Feeling better?</h2>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={startBreathing}
                className="px-10 py-4 bg-white/10 text-white rounded-full font-bold hover:bg-white/20 transition-all flex items-center gap-2 border border-white/10"
              >
                <RotateCcw size={20} />
                Repeat
              </button>
              <button 
                onClick={onClose}
                className="px-10 py-4 bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-full font-bold hover:bg-white/30 transition-all shadow-xl shadow-black/20"
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
          <Loader2 className="animate-spin text-white" size={48} />
          <Sparkles className="absolute -top-2 -right-2 text-amber-400 animate-pulse" size={20} />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-white">Manifesting your vision...</h2>
          <p className="text-white/40">AI is weaving your dreams into a concrete plan.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Step {step + 1} of {questions.length}</span>
          <div className="flex gap-1">
            {questions.map((_, i) => (
              <div key={i} className={`h-1 w-8 rounded-full transition-colors ${i <= step ? 'bg-white' : 'bg-white/10'}`} />
            ))}
          </div>
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-white">{questions[step]}</h2>
      </div>

      <textarea 
        autoFocus
        value={currentAnswer}
        onChange={(e) => setCurrentAnswer(e.target.value)}
        placeholder="Speak from the heart..."
        className="w-full h-48 bg-white/5 border border-white/10 rounded-3xl p-6 text-lg outline-none focus:ring-4 focus:ring-white/5 transition-all resize-none shadow-sm text-white placeholder:text-white/30 backdrop-blur-md"
      />

      <div className="mt-8 flex justify-end">
        <button 
          onClick={handleNext}
          disabled={!currentAnswer.trim()}
          className="px-8 py-4 bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-2xl font-bold hover:bg-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-xl shadow-black/20"
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
      id: '1', name: 'Health', icon: Heart, color: 'text-rose-400 bg-white/10', 
      goals: [] 
    },
    { 
      id: '2', name: 'Family & Friends', icon: Users, color: 'text-blue-400 bg-white/10', 
      goals: [] 
    },
    { 
      id: '3', name: 'Finance', icon: DollarSign, color: 'text-emerald-400 bg-white/10', 
      goals: [] 
    },
    { 
      id: '4', name: 'Business & Career', icon: Briefcase, color: 'text-amber-400 bg-white/10', 
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
      color: 'text-white/60 bg-white/10',
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
      <div className="glass-card p-10 rounded-[40px] relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity text-white">
          <Sparkles size={120} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 glass-button rounded-lg flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-white/40">Your Manifested Vision</h2>
          </div>
          <p className="text-2xl font-medium text-white leading-relaxed italic">
            "{visionData.paragraph}"
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {selectedCategory && (
            <button 
              onClick={() => setSelectedCategory(null)}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors border border-white/10 text-white"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <h1 className="text-4xl font-bold tracking-tight text-white">
            {selectedCategory ? selectedCategory.name : 'Life Categories'}
          </h1>
        </div>
        {!selectedCategory && (
          <button 
            onClick={() => setIsAddingCategory(true)}
            className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium hover:bg-white/30 transition-colors shadow-lg shadow-black/20"
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
                className="glass-card p-6 rounded-3xl hover:bg-white/20 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${cat.color}`}>
                    <cat.icon size={24} />
                  </div>
                  <ChevronRight size={20} className="text-white/20 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-white">{cat.name}</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Active Goals</p>
                    <div className="flex flex-wrap gap-2">
                      {cat.goals.length > 0 ? cat.goals.map(g => (
                        <span key={g.id} className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-white/60">
                          {g.title}
                        </span>
                      )) : <span className="text-xs text-white/20 italic">No goals yet</span>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    <div>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Milestones</p>
                      <p className="text-sm font-bold text-white">
                        {cat.goals.reduce((acc, g) => acc + g.milestones.length, 0)} Upcoming
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Wins</p>
                      <p className="text-sm font-bold text-emerald-400">
                        {cat.goals.reduce((acc, g) => acc + g.wins.length, 0)} Recent
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isAddingCategory && (
              <div className="bg-black/40 backdrop-blur-xl p-6 rounded-3xl text-white border border-white/10">
                <h3 className="text-lg font-bold mb-4">New Category</h3>
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Category Name..." 
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full bg-white/10 border border-white/10 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-white/20 mb-4 text-white"
                />
                <div className="flex gap-2">
                  <button 
                    onClick={addCategory}
                    className="flex-1 py-2 bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-xl text-xs font-bold hover:bg-white/30 transition-all"
                  >
                    Create
                  </button>
                  <button 
                    onClick={() => setIsAddingCategory(false)}
                    className="flex-1 py-2 bg-white/10 text-white rounded-xl text-xs font-bold hover:bg-white/20 transition-all border border-white/10"
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
                  <h2 className="text-2xl font-bold text-white">Goals</h2>
                  <button 
                    onClick={() => setIsAddingGoal(true)}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10 text-white"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                {isAddingGoal && (
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10 shadow-sm backdrop-blur-md">
                    <h3 className="text-sm font-bold mb-4 uppercase tracking-widest text-white/40">New Goal</h3>
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="What do you want to achieve?" 
                      value={newGoalTitle}
                      onChange={(e) => setNewGoalTitle(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-white/20 text-white placeholder:text-white/30 mb-4"
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={() => addGoal(selectedCategory.id)}
                        className="flex-1 py-2 bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-xl text-xs font-bold hover:bg-white/30 transition-all"
                      >
                        Add Goal
                      </button>
                      <button 
                        onClick={() => setIsAddingGoal(false)}
                        className="flex-1 py-2 bg-white/10 text-white/60 rounded-xl text-xs font-bold hover:bg-white/20 transition-all border border-white/10"
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
                          <h3 className="text-xl font-bold text-white">{goal.title}</h3>
                          <div className="flex gap-2 mt-1">
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Active</span>
                            {goal.timeframe && (
                              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">• {goal.timeframe} term</span>
                            )}
                          </div>
                        </div>
                        <button className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/40 hover:text-white">
                          <Settings size={18} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Target size={12} />
                            Upcoming Milestones
                          </p>
                          <div className="space-y-2">
                            {goal.milestones.length > 0 ? goal.milestones.map((m, i) => (
                              <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                <span className="text-sm font-medium text-white/80">{m}</span>
                              </div>
                            )) : <p className="text-xs text-white/20 italic">No milestones defined</p>}
                            <button className="w-full py-2 border border-dashed border-white/20 rounded-xl text-[10px] font-bold text-white/40 uppercase hover:border-white/40 hover:text-white/60 transition-all">
                              + Add Milestone
                            </button>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Trophy size={12} />
                            Recent Wins
                          </p>
                          <div className="space-y-2">
                            {goal.wins.length > 0 ? goal.wins.map((w, i) => (
                              <div key={i} className="flex items-center gap-3 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span className="text-sm font-medium text-emerald-400">{w}</span>
                              </div>
                            )) : <p className="text-xs text-white/20 italic">No wins yet</p>}
                            <button className="w-full py-2 border border-dashed border-emerald-500/20 rounded-xl text-[10px] font-bold text-emerald-400 uppercase hover:border-emerald-500/40 hover:text-emerald-500 transition-all">
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
                      <span className="text-sm text-white/60 font-medium">Total Goals</span>
                      <span className="text-lg font-bold text-white">{selectedCategory.goals.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/60 font-medium">Completed</span>
                      <span className="text-lg font-bold text-emerald-400">0</span>
                    </div>
                    <div className="pt-4 border-t border-white/10">
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Category Focus</p>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-white/80 w-2/3"></div>
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

const DURATION_OPTIONS = ['<5min', '<30min', '30min+'] as const;
type DurationOption = typeof DURATION_OPTIONS[number];

const priorityStyle = (p: 'low' | 'medium' | 'high') =>
  p === 'high' ? 'bg-red-500/20 text-red-400' : p === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-white/40';

const blankNewTask = () => ({
  title: '',
  notes: '',
  deadline: '',
  projectId: '',
  priority: 'medium' as const,
  estimatedDuration: '' as DurationOption | '',
  isFrog: false,
});

const TaskDatabaseTab = ({
  allTasks,
  projects,
  onUpdateTasks
}: {
  allTasks: Task[],
  projects: Project[],
  onUpdateTasks: (t: Task[]) => void
}) => {
  const [newTask, setNewTask] = useState(blankNewTask());
  const [showForm, setShowForm] = useState(false);

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;
    const t: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTask.title.trim(),
      notes: newTask.notes || undefined,
      deadline: newTask.deadline || undefined,
      projectId: newTask.projectId || undefined,
      priority: newTask.priority,
      estimatedDuration: (newTask.estimatedDuration as DurationOption) || undefined,
      isFrog: newTask.isFrog,
      isStrategic: false,
      status: 'todo'
    };
    onUpdateTasks([...allTasks, t]);
    setNewTask(blankNewTask());
    setShowForm(false);
  };

  const deleteTask = (id: string) => onUpdateTasks(allTasks.filter(t => t.id !== id));

  const done = allTasks.filter(t => t.status === 'done').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-4 text-sm text-white/40 font-medium">
          <span>{allTasks.length} tasks</span>
          <span>·</span>
          <span>{done} done</span>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white/20 border border-white/30 rounded-xl text-sm font-bold text-white hover:bg-white/30 transition-all"
        >
          <Plus size={16} /> Add Task
        </button>
      </div>

      <Card title="Task Inventory">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10">
                <th className="pb-3 text-[10px] font-bold text-white/40 uppercase tracking-widest">Task</th>
                <th className="pb-3 text-[10px] font-bold text-white/40 uppercase tracking-widest">Project</th>
                <th className="pb-3 text-[10px] font-bold text-white/40 uppercase tracking-widest text-center">Duration</th>
                <th className="pb-3 text-[10px] font-bold text-white/40 uppercase tracking-widest text-center">Priority</th>
                <th className="pb-3 text-[10px] font-bold text-white/40 uppercase tracking-widest text-center">Deadline</th>
                <th className="pb-3 text-[10px] font-bold text-white/40 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {allTasks.map(task => (
                <tr key={task.id} className="group hover:bg-white/5 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        {task.isFrog && <span className="text-xs">🐸</span>}
                        <span className={`font-semibold text-sm ${task.status === 'done' ? 'line-through text-white/30' : 'text-white'}`}>{task.title}</span>
                      </div>
                      {task.notes && <span className="text-[10px] text-white/30 italic truncate max-w-[200px]">{task.notes}</span>}
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-xs font-medium text-white/50">
                      {projects.find(p => p.id === task.projectId)?.title || '—'}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-center">
                    {task.estimatedDuration
                      ? <span className="text-[10px] font-mono text-white/50">{task.estimatedDuration}</span>
                      : <span className="text-white/20">—</span>}
                  </td>
                  <td className="py-3 pr-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest ${priorityStyle(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-center">
                    {task.deadline
                      ? <span className="text-[10px] text-white/50">{task.deadline}</span>
                      : <span className="text-white/20">—</span>}
                  </td>
                  <td className="py-3 text-right">
                    <button onClick={() => deleteTask(task.id)} className="p-2 text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {allTasks.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-white/20 italic text-sm">
                    No tasks yet. Click "Add Task" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}
          >
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-zinc-900/95 border border-white/10 rounded-3xl p-8 space-y-5 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">New Task</h2>
                <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white"><X size={20} /></button>
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">Title</label>
                <input autoFocus type="text" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                  placeholder="What needs to be done?" className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-white/20" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">Details / Notes</label>
                <textarea value={newTask.notes} onChange={e => setNewTask({ ...newTask, notes: e.target.value })}
                  placeholder="Add context, links, or details…" rows={3}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-white/20 resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">Project</label>
                  <select value={newTask.projectId} onChange={e => setNewTask({ ...newTask, projectId: e.target.value })}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-white/20">
                    <option value="" className="bg-zinc-900">No Project</option>
                    {projects.map(p => <option key={p.id} value={p.id} className="bg-zinc-900">{p.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">Deadline</label>
                  <input type="date" value={newTask.deadline} onChange={e => setNewTask({ ...newTask, deadline: e.target.value })}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-white/20" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">Priority</label>
                  <select value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-white/20">
                    <option value="low" className="bg-zinc-900">Low</option>
                    <option value="medium" className="bg-zinc-900">Medium</option>
                    <option value="high" className="bg-zinc-900">High</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">Est. Duration</label>
                  <select value={newTask.estimatedDuration} onChange={e => setNewTask({ ...newTask, estimatedDuration: e.target.value as DurationOption | '' })}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-white/20">
                    <option value="" className="bg-zinc-900">—</option>
                    {DURATION_OPTIONS.map(d => <option key={d} value={d} className="bg-zinc-900">{d}</option>)}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" checked={newTask.isFrog} onChange={e => setNewTask({ ...newTask, isFrog: e.target.checked })}
                  className="w-4 h-4 accent-white rounded" />
                <span className="text-sm font-medium text-white/60 group-hover:text-white transition-colors">🐸 Frog — do this first thing</span>
              </label>

              <div className="flex gap-3 pt-2 border-t border-white/10">
                <button onClick={handleAddTask} disabled={!newTask.title.trim()}
                  className="flex-1 py-3 bg-white/20 border border-white/30 rounded-xl font-bold text-sm text-white hover:bg-white/30 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                  <Plus size={16} /> Add Task
                </button>
                <button onClick={() => setShowForm(false)} className="px-5 py-3 text-white/40 hover:text-white transition-colors text-sm font-medium">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const WorkMode = ({
  allTasks,
  projects,
  onUpdateTasks
}: {
  allTasks: Task[],
  projects: Project[],
  onUpdateTasks: (t: Task[]) => void
}) => {
  const [mode, setMode] = useState<'overview' | 'bingo' | 'wheel' | 'pomodoro' | 'task-database'>('overview');

  // ---- Overview ----
  const toggleTask = (taskId: string) => {
    onUpdateTasks(allTasks.map(t =>
      t.id === taskId ? { ...t, status: (t.status === 'todo' ? 'done' : 'todo') as 'todo' | 'done' } : t
    ));
  };

  const [detailTask, setDetailTask] = useState<Task | null>(null);

  const openDetail = (task: Task) => setDetailTask({ ...task });

  const saveDetail = () => {
    if (!detailTask) return;
    onUpdateTasks(allTasks.map(t => t.id === detailTask.id ? detailTask : t));
    setDetailTask(null);
  };

  const deleteTask = (taskId: string) => {
    onUpdateTasks(allTasks.filter(t => t.id !== taskId));
    if (detailTask?.id === taskId) setDetailTask(null);
  };

  // ---- Bingo ----
  const makeBingoBoard = (): (Task | null)[] => {
    const todo = allTasks.filter(t => t.status === 'todo');
    const shuffled = [...todo].sort(() => Math.random() - 0.5).slice(0, 16);
    while (shuffled.length < 16) shuffled.push(null);
    return shuffled;
  };
  const [bingoBoard, setBingoBoard] = useState<(Task | null)[]>(() => makeBingoBoard());
  const [markedCells, setMarkedCells] = useState<Set<number>>(new Set());

  const checkBingo = (marked: Set<number>) => {
    const lines = [
      [0,1,2,3],[4,5,6,7],[8,9,10,11],[12,13,14,15],
      [0,4,8,12],[1,5,9,13],[2,6,10,14],[3,7,11,15],
      [0,5,10,15],[3,6,9,12]
    ];
    return lines.some(line => line.every(i => marked.has(i)));
  };

  const markCell = (i: number) => {
    if (!bingoBoard[i]) return;
    const next = new Set(markedCells);
    if (next.has(i)) next.delete(i); else next.add(i);
    setMarkedCells(next);
  };

  const hasBingo = checkBingo(markedCells);

  // ---- Spinny Wheel ----
  const wheelTasks = allTasks.filter(t => t.status === 'todo').slice(0, 8);
  const [spinDeg, setSpinDeg] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelResult, setWheelResult] = useState<Task | null>(null);
  const wheelColors = ['#f59e0b','#ef4444','#3b82f6','#10b981','#8b5cf6','#f97316','#06b6d4','#ec4899'];

  const spinWheel = () => {
    if (isSpinning || wheelTasks.length === 0) return;
    const extra = 1440 + Math.floor(Math.random() * 360);
    const newDeg = spinDeg + extra;
    setSpinDeg(newDeg);
    setIsSpinning(true);
    setWheelResult(null);
    setTimeout(() => {
      const n = wheelTasks.length;
      const winnerIdx = Math.floor((newDeg % 360) / (360 / n)) % n;
      setWheelResult(wheelTasks[winnerIdx]);
      setIsSpinning(false);
    }, 4000);
  };

  const renderWheelSegments = () => {
    const n = wheelTasks.length;
    if (n === 0) return <circle cx="150" cy="150" r="130" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />;
    const cx = 150, cy = 150, r = 130;
    const sliceAngle = (2 * Math.PI) / n;
    return (
      <>
        {wheelTasks.map((task, i) => {
          const start = i * sliceAngle - Math.PI / 2;
          const end = (i + 1) * sliceAngle - Math.PI / 2;
          const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
          const x2 = cx + r * Math.cos(end), y2 = cy + r * Math.sin(end);
          const largeArc = sliceAngle > Math.PI ? 1 : 0;
          const mid = (start + end) / 2;
          const tx = cx + r * 0.65 * Math.cos(mid);
          const ty = cy + r * 0.65 * Math.sin(mid);
          const label = task.title.length > 11 ? task.title.slice(0, 11) + '…' : task.title;
          return (
            <g key={task.id}>
              <path
                d={`M ${cx} ${cy} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`}
                fill={wheelColors[i % wheelColors.length]}
                stroke="rgba(0,0,0,0.25)"
                strokeWidth="2"
              />
              <text
                x={tx.toFixed(1)}
                y={ty.toFixed(1)}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="8"
                fontWeight="bold"
                fill="white"
                transform={`rotate(${((mid * 180) / Math.PI + 90).toFixed(1)}, ${tx.toFixed(1)}, ${ty.toFixed(1)})`}
                style={{ userSelect: 'none', pointerEvents: 'none' }}
              >
                {label}
              </text>
            </g>
          );
        })}
        <circle cx="150" cy="150" r="18" fill="rgba(0,0,0,0.6)" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
      </>
    );
  };

  // ---- Pomodoro ----
  const FOCUS_TIME = 25 * 60;
  const BREAK_TIME = 5 * 60;
  const [pomSec, setPomSec] = useState(FOCUS_TIME);
  const [pomRunning, setPomRunning] = useState(false);
  const [pomBreak, setPomBreak] = useState(false);
  const [sessionTaskIds, setSessionTaskIds] = useState<string[]>([]);

  useEffect(() => {
    if (!pomRunning) return;
    const interval = setInterval(() => {
      setPomSec(s => {
        if (s <= 1) { setPomRunning(false); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [pomRunning]);

  const resetPomodoro = () => { setPomRunning(false); setPomSec(FOCUS_TIME); setPomBreak(false); };
  const switchPomMode = () => { const next = !pomBreak; setPomBreak(next); setPomSec(next ? BREAK_TIME : FOCUS_TIME); setPomRunning(false); };
  const pomMin = String(Math.floor(pomSec / 60)).padStart(2, '0');
  const pomSecStr = String(pomSec % 60).padStart(2, '0');

  const toggleSessionTask = (taskId: string) => {
    setSessionTaskIds(prev => prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]);
  };

  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'bingo' as const, label: 'Bingo' },
    { id: 'wheel' as const, label: 'Wheel' },
    { id: 'pomodoro' as const, label: 'Pomodoro' },
    { id: 'task-database' as const, label: 'Task DB' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-4xl font-bold tracking-tight text-white">Work Mode</h1>
        <div className="flex gap-1 bg-white/10 p-1 rounded-2xl border border-white/20 shadow-sm backdrop-blur-md">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setMode(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${mode === tab.id ? 'glass-button shadow-md' : 'text-white/40 hover:text-white'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ---- TASK DATABASE ---- */}
        {mode === 'task-database' && (
          <motion.div key="task-database" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <TaskDatabaseTab allTasks={allTasks} projects={projects} onUpdateTasks={onUpdateTasks} />
          </motion.div>
        )}

        {/* ---- OVERVIEW: tasks grouped by project ---- */}
        {mode === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
            {allTasks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Zap className="text-white/20 mb-4" size={40} />
                <p className="text-white/40">No tasks yet. Add tasks in the Task DB tab.</p>
              </div>
            )}
            {[
              ...projects.map(p => ({ label: `${p.title} — ${allTasks.filter(t => t.projectId === p.id && t.status === 'done').length}/${allTasks.filter(t => t.projectId === p.id).length}`, tasks: allTasks.filter(t => t.projectId === p.id), key: p.id })),
              { label: 'No Project', tasks: allTasks.filter(t => !t.projectId), key: '__none__' }
            ].filter(g => g.tasks.length > 0).map(group => (
              <Card key={group.key} title={group.label}>
                <div className="space-y-1">
                  {group.tasks.map(task => (
                    <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${task.status === 'done' ? 'bg-emerald-500 border-emerald-500' : 'border-white/20 hover:border-white/50'}`}
                      >
                        {task.status === 'done' && <Check size={11} className="text-white" />}
                      </button>
                      <button onClick={() => openDetail(task)} className={`text-sm font-medium flex-1 text-left transition-all hover:underline underline-offset-2 ${task.status === 'done' ? 'line-through text-white/30' : 'text-white'}`}>
                        {task.title}
                      </button>
                      {task.isFrog && <span className="text-xs">🐸</span>}
                      {task.notes && <span className="text-[10px] text-white/30 italic hidden group-hover:inline">has notes</span>}
                      {task.estimatedDuration ? <span className="text-[10px] font-mono text-white/30">{task.estimatedDuration}</span> : null}
                      <span className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full ${priorityStyle(task.priority)}`}>
                        {task.priority}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openDetail(task)} className="p-1.5 hover:bg-white/10 rounded-lg transition-all" title="Edit">
                          <Save size={12} className="text-white/40 hover:text-white" />
                        </button>
                        <button onClick={() => deleteTask(task.id)} className="p-1.5 hover:bg-red-500/20 rounded-lg transition-all" title="Delete">
                          <Trash2 size={12} className="text-white/40 hover:text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </motion.div>
        )}

        {/* ---- BINGO: 4×4 board from task DB ---- */}
        {mode === 'bingo' && (
          <motion.div key="bingo" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center py-8 space-y-8">
            <div className="text-center space-y-1">
              <h2 className="text-3xl font-bold text-white">Task Bingo</h2>
              <p className="text-white/40 text-sm">Click tasks to mark them. Get a row, column, or diagonal to win!</p>
              {hasBingo && (
                <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-2xl font-bold text-amber-400 pt-1">🎉 BINGO!</motion.p>
              )}
            </div>
            <div className="grid grid-cols-4 gap-3">
              {bingoBoard.map((task, i) => (
                <button
                  key={i}
                  onClick={() => markCell(i)}
                  disabled={!task}
                  className={`w-28 h-28 rounded-2xl p-3 flex flex-col items-center justify-center text-center transition-all border text-xs font-bold leading-tight ${
                    markedCells.has(i)
                      ? 'bg-emerald-500/25 border-emerald-500/50 text-emerald-300'
                      : task
                      ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white/80 cursor-pointer'
                      : 'bg-white/5 border-white/5 text-white/20 cursor-default'
                  }`}
                >
                  {markedCells.has(i) && <Check size={16} className="mb-1 text-emerald-400 flex-shrink-0" />}
                  <span className="line-clamp-3">{task?.title || '—'}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => { setBingoBoard(makeBingoBoard()); setMarkedCells(new Set()); }}
              className="flex items-center gap-2 px-8 py-3 bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-2xl font-bold hover:bg-white/30 transition-all"
            >
              <RefreshCw size={16} />
              Shuffle Board
            </button>
          </motion.div>
        )}

        {/* ---- SPINNY WHEEL: colored SVG segments ---- */}
        {mode === 'wheel' && (
          <motion.div key="wheel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center py-8 space-y-8">
            <div className="relative">
              {/* Fixed pointer at top */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[20px] border-t-white drop-shadow-lg" />
              <svg
                width="300"
                height="300"
                style={{
                  transform: `rotate(${spinDeg}deg)`,
                  transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
                  filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.4))',
                }}
              >
                {renderWheelSegments()}
              </svg>
            </div>
            {wheelTasks.length === 0 && (
              <p className="text-white/40 text-sm">Add todo tasks to the database to use the wheel.</p>
            )}
            {wheelResult && !isSpinning && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">You got</p>
                <h3 className="text-2xl font-bold text-white">{wheelResult.title}</h3>
              </motion.div>
            )}
            <button
              onClick={spinWheel}
              disabled={isSpinning || wheelTasks.length === 0}
              className="flex items-center gap-3 px-12 py-4 bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-full font-bold text-lg hover:bg-white/30 transition-all shadow-2xl shadow-black/20 disabled:opacity-50"
            >
              <RefreshCw size={20} className={isSpinning ? 'animate-spin' : ''} />
              {isSpinning ? 'Spinning…' : 'Spin the Wheel'}
            </button>
          </motion.div>
        )}

        {/* ---- POMODORO: working timer + task assignment ---- */}
        {mode === 'pomodoro' && (
          <motion.div key="pomodoro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Timer side */}
            <div className="flex flex-col items-center justify-center py-8 space-y-8">
              <div className="flex gap-2 bg-white/10 p-1 rounded-2xl border border-white/20">
                <button onClick={() => { if (pomBreak) switchPomMode(); }} className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${!pomBreak ? 'glass-button' : 'text-white/40 hover:text-white'}`}>Focus</button>
                <button onClick={() => { if (!pomBreak) switchPomMode(); }} className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${pomBreak ? 'glass-button' : 'text-white/40 hover:text-white'}`}>Break</button>
              </div>
              <div className="relative w-56 h-56 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-8 border-white/10" />
                <div className={`absolute inset-0 rounded-full border-8 border-t-transparent ${pomBreak ? 'border-emerald-400' : 'border-white'} ${pomRunning ? 'animate-spin-slow' : ''}`} />
                <span className="text-6xl font-mono font-bold tracking-tighter text-white z-10">{pomMin}:{pomSecStr}</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setPomRunning(r => !r)}
                  className="px-10 py-3 bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-2xl font-bold hover:bg-white/30 transition-all flex items-center gap-2"
                >
                  {pomRunning ? <Pause size={18} /> : <Play size={18} />}
                  {pomRunning ? 'Pause' : 'Start'}
                </button>
                <button onClick={resetPomodoro} className="px-6 py-3 bg-white/10 text-white rounded-2xl font-bold hover:bg-white/20 transition-all border border-white/10 flex items-center gap-2">
                  <RotateCcw size={16} />
                  Reset
                </button>
              </div>
              {sessionTaskIds.length > 0 && (
                <div className="w-full max-w-xs space-y-2">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest text-center">Session tasks</p>
                  {sessionTaskIds.map(id => {
                    const task = allTasks.find(t => t.id === id);
                    if (!task) return null;
                    return (
                      <div key={id} onClick={() => toggleTask(id)}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer group border border-white/10">
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${task.status === 'done' ? 'bg-emerald-500 border-emerald-500' : 'border-white/20 group-hover:border-white/40'}`}>
                          {task.status === 'done' && <Check size={11} className="text-white" />}
                        </div>
                        <span className={`text-sm font-medium flex-1 ${task.status === 'done' ? 'line-through text-white/30' : 'text-white'}`}>{task.title}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {/* Task picker side */}
            <Card title="Assign Tasks to Session">
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Select tasks to focus on</p>
                {allTasks.filter(t => t.status === 'todo').map(task => (
                  <div key={task.id} onClick={() => toggleSessionTask(task.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${sessionTaskIds.includes(task.id) ? 'bg-white/15 border-white/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${sessionTaskIds.includes(task.id) ? 'bg-white/80 border-white/80' : 'border-white/20'}`}>
                      {sessionTaskIds.includes(task.id) && <Check size={11} className="text-black" />}
                    </div>
                    <span className="text-sm text-white font-medium flex-1">{task.title}</span>
                    {task.estimatedDuration ? <span className="text-[10px] font-mono text-white/30">{task.estimatedDuration}</span> : null}
                    {task.projectId && <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">{projects.find(p => p.id === task.projectId)?.title}</span>}
                  </div>
                ))}
                {allTasks.filter(t => t.status === 'todo').length === 0 && (
                  <p className="text-white/30 text-sm italic text-center py-8">No todo tasks. Add tasks in the Task DB tab.</p>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- TASK DETAIL MODAL ---- */}
      <AnimatePresence>
        {detailTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={(e) => { if (e.target === e.currentTarget) saveDetail(); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-zinc-900/95 border border-white/10 rounded-3xl p-8 space-y-6 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <input
                  autoFocus
                  type="text"
                  value={detailTask.title}
                  onChange={e => setDetailTask({ ...detailTask, title: e.target.value })}
                  className="text-2xl font-bold bg-transparent text-white outline-none flex-1 border-b border-white/10 pb-1 focus:border-white/40 transition-colors"
                  placeholder="Task title"
                />
                <button onClick={() => setDetailTask(null)} className="text-white/40 hover:text-white mt-1 flex-shrink-0"><X size={20} /></button>
              </div>

              <textarea
                value={detailTask.notes || ''}
                onChange={e => setDetailTask({ ...detailTask, notes: e.target.value })}
                placeholder="Add notes, context, or details…"
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-white/20 resize-none transition-all"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">Priority</label>
                  <select
                    value={detailTask.priority}
                    onChange={e => setDetailTask({ ...detailTask, priority: e.target.value as Task['priority'] })}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-white/20"
                  >
                    <option value="low" className="bg-zinc-900">Low</option>
                    <option value="medium" className="bg-zinc-900">Medium</option>
                    <option value="high" className="bg-zinc-900">High</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">Est. Duration</label>
                  <select
                    value={detailTask.estimatedDuration || ''}
                    onChange={e => setDetailTask({ ...detailTask, estimatedDuration: e.target.value as Task['estimatedDuration'] || undefined })}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-white/20"
                  >
                    <option value="" className="bg-zinc-900">—</option>
                    {DURATION_OPTIONS.map(d => <option key={d} value={d} className="bg-zinc-900">{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">Deadline</label>
                  <input
                    type="date"
                    value={detailTask.deadline || ''}
                    onChange={e => setDetailTask({ ...detailTask, deadline: e.target.value || undefined })}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-white/20"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">Project</label>
                  <select
                    value={detailTask.projectId || ''}
                    onChange={e => setDetailTask({ ...detailTask, projectId: e.target.value || undefined })}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-white/20"
                  >
                    <option value="" className="bg-zinc-900">No Project</option>
                    {projects.map(p => <option key={p.id} value={p.id} className="bg-zinc-900">{p.title}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" checked={detailTask.isFrog} onChange={e => setDetailTask({ ...detailTask, isFrog: e.target.checked })} className="w-4 h-4 rounded bg-white/10 border-white/20 accent-white" />
                  <span className="text-xs font-bold text-white/40 group-hover:text-white transition-colors">Frog 🐸</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" checked={detailTask.status === 'done'} onChange={e => setDetailTask({ ...detailTask, status: e.target.checked ? 'done' : 'todo' })} className="w-4 h-4 rounded bg-white/10 border-white/20 accent-white" />
                  <span className="text-xs font-bold text-white/40 group-hover:text-white transition-colors">Done</span>
                </label>
              </div>

              <div className="flex gap-3 pt-2 border-t border-white/10">
                <button
                  onClick={saveDetail}
                  className="flex-1 py-3 bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-xl font-bold text-sm hover:bg-white/30 transition-all"
                >
                  Save
                </button>
                <button
                  onClick={() => deleteTask(detailTask.id)}
                  className="px-5 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl font-bold text-sm hover:bg-red-500/20 transition-all flex items-center gap-2"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const blankNewProjectTask = (projectId: string) => ({
  title: '',
  notes: '',
  deadline: '',
  priority: 'medium' as const,
  estimatedDuration: '' as DurationOption | '',
  isFrog: false,
  projectId,
});

const ProjectsTab = ({
  projects,
  allTasks,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  onUpdateTasks
}: {
  projects: Project[],
  allTasks: Task[],
  onAddProject: (p: Project) => void,
  onUpdateProject: (p: Project) => void,
  onDeleteProject: (id: string) => void,
  onUpdateTasks: (t: Task[]) => void
}) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '', deadline: '', status: 'on-track' as const });
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTask, setNewTask] = useState(blankNewProjectTask(''));

  const projectTasks = (projectId: string) => allTasks.filter(t => t.projectId === projectId);
  const projectProgress = (projectId: string) => {
    const tasks = projectTasks(projectId);
    if (tasks.length === 0) return 0;
    return Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100);
  };

  const handleToggleTask = (taskId: string) => {
    onUpdateTasks(allTasks.map(t => t.id === taskId ? { ...t, status: (t.status === 'done' ? 'todo' : 'done') as Task['status'] } : t));
  };

  const handleAddTask = () => {
    if (!newTask.title.trim() || !selectedProject) return;
    const t: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTask.title.trim(),
      notes: newTask.notes || undefined,
      deadline: newTask.deadline || undefined,
      projectId: selectedProject.id,
      priority: newTask.priority,
      estimatedDuration: (newTask.estimatedDuration as DurationOption) || undefined,
      isFrog: newTask.isFrog,
      isStrategic: false,
      status: 'todo'
    };
    onUpdateTasks([...allTasks, t]);
    setNewTask(blankNewProjectTask(selectedProject.id));
    setShowTaskForm(false);
  };

  const handleDeleteTask = (taskId: string) => {
    onUpdateTasks(allTasks.filter(t => t.id !== taskId));
  };

  const handleAddProject = () => {
    if (!newProject.title) return;
    const p: Project = {
      id: Math.random().toString(36).substr(2, 9),
      title: newProject.title,
      description: newProject.description,
      deadline: newProject.deadline,
      status: newProject.status,
    };
    onAddProject(p);
    setIsAddingProject(false);
    setNewProject({ title: '', description: '', deadline: '', status: 'on-track' });
  };

  if (selectedProject) {
    const tasks = projectTasks(selectedProject.id);
    const progress = projectProgress(selectedProject.id);
    return (
      <div className="space-y-8">
        <button onClick={() => setSelectedProject(null)}
          className="flex items-center gap-2 text-sm font-bold text-white/40 hover:text-white transition-colors uppercase tracking-widest">
          <ChevronLeft size={16} /> Back to Projects
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-bold tracking-tight text-white">{selectedProject.title}</h1>
              <p className="text-white/60 font-medium">{selectedProject.description}</p>
            </div>

            <Card title={`Tasks — ${tasks.filter(t => t.status === 'done').length}/${tasks.length} done`}>
              <div className="space-y-2">
                {tasks.map(task => (
                  <div key={task.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group">
                    <button onClick={() => handleToggleTask(task.id)}
                      className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${task.status === 'done' ? 'bg-white/80 border-white/80' : 'border-white/20 hover:border-white/50'}`}>
                      {task.status === 'done' && <Check size={11} className="text-black" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {task.isFrog && <span className="text-xs">🐸</span>}
                        <span className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-white/30' : 'text-white'}`}>{task.title}</span>
                        {task.estimatedDuration && <span className="text-[10px] font-mono text-white/30">{task.estimatedDuration}</span>}
                        <span className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full ${priorityStyle(task.priority)}`}>{task.priority}</span>
                        {task.deadline && <span className="text-[10px] text-white/30 flex items-center gap-1"><Calendar size={9} />{task.deadline}</span>}
                      </div>
                      {task.notes && <p className="text-[11px] text-white/40 mt-0.5 italic">{task.notes}</p>}
                    </div>
                    <button onClick={() => handleDeleteTask(task.id)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 rounded-lg transition-all flex-shrink-0">
                      <Trash2 size={12} className="text-white/30 hover:text-red-400" />
                    </button>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <p className="text-center text-white/20 italic text-sm py-6">No tasks yet. Add the first one!</p>
                )}
                <button onClick={() => { setNewTask(blankNewProjectTask(selectedProject.id)); setShowTaskForm(true); }}
                  className="w-full py-3 border border-dashed border-white/20 rounded-2xl text-xs font-bold text-white/40 hover:bg-white/10 transition-all uppercase tracking-widest mt-2">
                  + Add Task
                </button>
              </div>
            </Card>
          </div>

          <div className="space-y-8">
            <Card title="Project Stats">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase mb-2">
                    <span>Overall Progress</span><span>{progress}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-white/80 transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-[10px] font-bold text-white/40 uppercase mb-1">Status</p>
                  <p className={`font-bold uppercase tracking-widest text-xs ${selectedProject.status === 'on-track' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {selectedProject.status.replace('-', ' ')}
                  </p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-[10px] font-bold text-white/40 uppercase mb-1">Deadline</p>
                  <p className="font-bold text-white">{selectedProject.deadline || '—'}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Add Task Modal */}
        <AnimatePresence>
          {showTaskForm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-6"
              onClick={e => { if (e.target === e.currentTarget) setShowTaskForm(false); }}
            >
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-lg bg-zinc-900/95 border border-white/10 rounded-3xl p-8 space-y-5 shadow-2xl"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Add Task to {selectedProject.title}</h2>
                  <button onClick={() => setShowTaskForm(false)} className="text-white/40 hover:text-white"><X size={20} /></button>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">Title</label>
                  <input autoFocus type="text" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                    onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                    placeholder="What needs to be done?" className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-white/20" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">Details / Notes</label>
                  <textarea value={newTask.notes} onChange={e => setNewTask({ ...newTask, notes: e.target.value })}
                    placeholder="Add context or details…" rows={3}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-white/20 resize-none" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">Priority</label>
                    <select value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })}
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-white/20">
                      <option value="low" className="bg-zinc-900">Low</option>
                      <option value="medium" className="bg-zinc-900">Medium</option>
                      <option value="high" className="bg-zinc-900">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">Duration</label>
                    <select value={newTask.estimatedDuration} onChange={e => setNewTask({ ...newTask, estimatedDuration: e.target.value as DurationOption | '' })}
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-white/20">
                      <option value="" className="bg-zinc-900">—</option>
                      {DURATION_OPTIONS.map(d => <option key={d} value={d} className="bg-zinc-900">{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">Deadline</label>
                    <input type="date" value={newTask.deadline} onChange={e => setNewTask({ ...newTask, deadline: e.target.value })}
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-white/20" />
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={newTask.isFrog} onChange={e => setNewTask({ ...newTask, isFrog: e.target.checked })} className="w-4 h-4 accent-white rounded" />
                  <span className="text-sm font-medium text-white/60 group-hover:text-white transition-colors">🐸 Frog — do this first thing</span>
                </label>
                <div className="flex gap-3 pt-2 border-t border-white/10">
                  <button onClick={handleAddTask} disabled={!newTask.title.trim()}
                    className="flex-1 py-3 bg-white/20 border border-white/30 rounded-xl font-bold text-sm text-white hover:bg-white/30 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                    <Plus size={16} /> Add Task
                  </button>
                  <button onClick={() => setShowTaskForm(false)} className="px-5 py-3 text-white/40 hover:text-white transition-colors text-sm font-medium">Cancel</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold tracking-tight text-white">Projects</h1>
        <button onClick={() => setIsAddingProject(true)}
          className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium hover:bg-white/30 transition-colors shadow-lg shadow-black/20">
          <Plus size={18} /><span>New Project</span>
        </button>
      </div>

      <AnimatePresence>
        {isAddingProject && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={e => { if (e.target === e.currentTarget) setIsAddingProject(false); }}
          >
            <Card className="max-w-md w-full shadow-2xl border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">New Project</h2>
                <button onClick={() => setIsAddingProject(false)} className="text-white/40 hover:text-white"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 block">Project Title</label>
                  <input autoFocus type="text" value={newProject.title} onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-sm outline-none focus:ring-2 focus:ring-white/20 text-white transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 block">Description</label>
                  <textarea value={newProject.description} onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-sm outline-none focus:ring-2 focus:ring-white/20 h-24 resize-none text-white transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 block">Deadline</label>
                  <input type="date" value={newProject.deadline} onChange={e => setNewProject({ ...newProject, deadline: e.target.value })}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-sm outline-none focus:ring-2 focus:ring-white/20 text-white transition-all" />
                </div>
                <button onClick={handleAddProject} disabled={!newProject.title}
                  className="w-full py-3 bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-xl font-bold text-sm hover:bg-white/30 transition-all shadow-lg shadow-black/20 disabled:opacity-50">
                  Create Project
                </button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => {
          const progress = projectProgress(project.id);
          const total = projectTasks(project.id).length;
          return (
            <Card key={project.id} className="hover:shadow-md transition-all cursor-pointer group border-white/10">
              <div onClick={() => setSelectedProject(project)}>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-all text-white border border-transparent group-hover:border-white/30">
                    <Briefcase size={20} />
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest ${project.status === 'on-track' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {project.status.replace('-', ' ')}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-1 text-white">{project.title}</h3>
                <p className="text-xs text-white/40 font-medium mb-1 flex items-center gap-1">
                  <Calendar size={12} /> {project.deadline || 'No deadline'}
                </p>
                <p className="text-xs text-white/30 mb-5">{total} task{total !== 1 ? 's' : ''}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase">
                    <span>Progress</span><span>{progress}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-white/80 transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
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
          <h1 className="text-4xl font-bold tracking-tight text-white">Calendar</h1>
          <div className="flex gap-2 bg-white/10 p-1 rounded-xl border border-white/20 shadow-sm backdrop-blur-md">
            <button onClick={() => {
              const d = new Date(currentDate);
              d.setDate(d.getDate() - 7);
              setCurrentDate(d);
            }} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => {
              const d = new Date(currentDate);
              d.setDate(d.getDate() + 7);
              setCurrentDate(d);
            }} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white">
              <ChevronRight size={16} />
            </button>
          </div>
          <span className="text-sm font-bold text-white/40 uppercase tracking-widest">
            {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </span>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium hover:bg-white/30 transition-colors shadow-lg shadow-black/20"
          >
            <Plus size={18} />
            <span>Add Event</span>
          </button>
          <button className="bg-white/10 text-white border border-white/20 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium hover:bg-white/20 transition-colors">
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
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white/10 rounded-[32px] p-8 w-full max-w-md shadow-2xl border border-white/10 backdrop-blur-xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-white">Add Event</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Event Title</label>
                  <input 
                    type="text" 
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="What's happening?"
                    className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-white/20 text-white placeholder:text-white/30 transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Start Time</label>
                    <input 
                      type="time" 
                      value={newEvent.startTime}
                      onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-white/20 text-white transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">End Time</label>
                    <input 
                      type="time" 
                      value={newEvent.endTime}
                      onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-white/20 text-white transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Category</label>
                  <select 
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as any })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-white/20 text-white transition-all"
                  >
                    <option value="work" className="bg-zinc-900">Work</option>
                    <option value="social" className="bg-zinc-900">Social</option>
                    <option value="health" className="bg-zinc-900">Health</option>
                    <option value="other" className="bg-zinc-900">Other</option>
                  </select>
                </div>
                <button 
                  onClick={handleAddEvent}
                  className="w-full py-4 bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-2xl font-bold mt-4 hover:bg-white/30 transition-all shadow-xl shadow-black/20"
                >
                  Create Event
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass-card rounded-[40px] overflow-hidden">
        <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-white/10">
          <div className="p-6 border-r border-white/5" />
          {weekDays.map((day, i) => (
            <div key={i} className={`p-6 text-center border-r border-white/5 last:border-0 ${day.toDateString() === new Date().toDateString() ? 'bg-white/20' : ''}`}>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">{days[i]}</p>
              <p className={`text-2xl font-bold ${day.toDateString() === new Date().toDateString() ? 'text-white' : 'text-white/40'}`}>
                {day.getDate()}
              </p>
            </div>
          ))}
        </div>
        <div className="h-[600px] overflow-y-auto relative custom-scrollbar">
          <div className="grid grid-cols-[80px_repeat(7,1fr)] min-h-[1440px]">
            {/* Time Labels */}
            <div className="border-r border-white/10 bg-white/5">
              {[...Array(24)].map((_, i) => (
                <div key={i} className="h-[60px] border-b border-white/10 flex items-start justify-center pt-2">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{i}:00</span>
                </div>
              ))}
            </div>

            {/* Day Columns */}
            {weekDays.map((day, dayIdx) => (
              <div key={dayIdx} className="relative border-r border-white/10 last:border-0">
                {[...Array(24)].map((_, i) => (
                  <div key={i} className="h-[60px] border-b border-white/5" />
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
                      className={`absolute left-1 right-1 p-2 rounded-xl border shadow-sm z-10 overflow-hidden ${block.type === 'focus' ? 'bg-amber-500/20 border-amber-500/30 text-white' : block.type === 'meeting' ? 'bg-blue-500/20 border-blue-500/30 text-white' : 'bg-white/10 border-white/20 text-white'}`}
                      style={{ top: `${top}px`, height: `${height}px` }}
                    >
                      <div className="flex flex-col h-full">
                        <span className="text-[8px] font-bold uppercase tracking-widest text-white/60 mb-0.5">{block.startTime}</span>
                        <h4 className="text-[10px] font-bold leading-tight line-clamp-2 text-white">{block.label}</h4>
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
                      className={`absolute left-1 right-1 p-2 rounded-xl border shadow-sm z-20 overflow-hidden cursor-grab active:cursor-grabbing group ${event.type === 'work' ? 'bg-white/20 text-white border-white/30' : event.type === 'health' ? 'bg-emerald-500/20 border-emerald-500/30 text-white' : event.type === 'social' ? 'bg-blue-500/20 border-blue-500/30 text-white' : event.type === 'workout' ? 'bg-amber-500/20 text-white border-amber-500/30' : 'bg-white/10 border-white/20 text-white'}`}
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
                          <Trash2 size={10} className="text-white" />
                        </button>
                        <span className="text-[8px] font-bold uppercase tracking-widest mb-0.5 text-white/60">{event.startTime}</span>
                        <h4 className="text-[10px] font-bold leading-tight line-clamp-2 text-white">{event.title}</h4>
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
          <h1 className="text-4xl font-bold tracking-tight text-white">Workout Planner</h1>
          <div className="flex gap-2 bg-white/10 p-1 rounded-xl border border-white/20 shadow-sm">
            <button onClick={() => {
              const d = new Date(currentDate);
              d.setMonth(d.getMonth() - 1);
              setCurrentDate(d);
            }} className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => {
              const d = new Date(currentDate);
              d.setMonth(d.getMonth() + 1);
              setCurrentDate(d);
            }} className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white">
              <ChevronRight size={16} />
            </button>
          </div>
          <span className="text-sm font-bold text-white/60 uppercase tracking-widest">
            {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="glass-card rounded-[40px] overflow-hidden p-8">
            <div className="grid grid-cols-7 mb-4">
              {weekDays.map(day => (
                <div key={day} className="text-center text-[10px] font-bold text-white/40 uppercase tracking-widest py-2">
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
                    className={`aspect-square p-2 rounded-2xl border transition-all cursor-pointer group relative ${isToday ? 'glass-button' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:shadow-md'}`}
                  >
                    <span className={`text-xs font-bold ${isToday ? 'text-white' : 'text-white/40'}`}>{day.getDate()}</span>
                    <div className="mt-1 space-y-1">
                      {dayWorkouts.map((w, idx) => (
                        <div key={idx} className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md truncate ${isToday ? 'bg-white/20 text-white' : 'bg-white/20 text-white'}`}>
                          {w.title}
                        </div>
                      ))}
                    </div>
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus size={12} className={isToday ? 'text-white' : 'text-white/40'} />
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
                <div key={w.id} className="flex items-center justify-between p-4 glass-card rounded-2xl group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center shadow-sm">
                      <Activity size={16} className="text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{w.title}</h4>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{w.date} • {w.startTime} • {w.duration}m</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setEditingWorkout(w)}
                      className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Settings size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteWorkout(w.id)}
                      className="p-2 hover:bg-red-500/10 rounded-lg text-white/40 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div className={`w-2 h-2 rounded-full ${w.completed ? 'bg-emerald-400' : 'bg-white/20'}`} />
                  </div>
                </div>
              ))}
              {workouts.length === 0 && (
                <p className="text-xs text-white/40 italic text-center py-4">No workouts planned yet.</p>
              )}
            </div>
          </Card>

          <Card title="Monthly Stats">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/60 font-medium">Total Workouts</span>
                <span className="text-lg font-bold text-white">{workouts.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/60 font-medium">Completed</span>
                <span className="text-lg font-bold text-emerald-400">
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
              className="bg-white/10 backdrop-blur-xl rounded-[32px] p-8 w-full max-w-md shadow-2xl border border-white/20"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-white">{editingWorkout ? 'Edit Workout' : 'Plan Workout'}</h2>
                <button onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingWorkout(null);
                }} className="p-2 hover:bg-white/10 rounded-full text-white">
                  <X size={20} />
                </button>
              </div>
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-6">
                For {selectedDay?.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Workout Title</label>
                  <input 
                    type="text" 
                    value={newWorkout.title}
                    onChange={(e) => setNewWorkout({ ...newWorkout, title: e.target.value })}
                    placeholder="e.g. Upper Body Power"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-white/20 text-white placeholder:text-white/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Start Time</label>
                    <input 
                      type="time" 
                      value={newWorkout.startTime}
                      onChange={(e) => setNewWorkout({ ...newWorkout, startTime: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">End Time</label>
                    <input 
                      type="time" 
                      value={newWorkout.endTime}
                      onChange={(e) => setNewWorkout({ ...newWorkout, endTime: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-white/20 text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Type</label>
                    <select 
                      value={newWorkout.type}
                      onChange={(e) => setNewWorkout({ ...newWorkout, type: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-white/20 text-white"
                    >
                      <option className="bg-zinc-900">Strength</option>
                      <option className="bg-zinc-900">Cardio</option>
                      <option className="bg-zinc-900">Yoga</option>
                      <option className="bg-zinc-900">HIIT</option>
                      <option className="bg-zinc-900">Mobility</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Duration (min)</label>
                    <input 
                      type="number" 
                      value={newWorkout.duration}
                      onChange={(e) => setNewWorkout({ ...newWorkout, duration: parseInt(e.target.value) })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-white/20 text-white"
                    />
                  </div>
                </div>
                <button 
                  onClick={handleAddWorkout}
                  className="w-full py-4 bg-white/20 text-white rounded-2xl font-bold mt-4 hover:bg-white/30 transition-all shadow-xl shadow-black/20"
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
        <h1 className="text-4xl font-bold tracking-tight text-white">Side Quests</h1>
        <div className="flex items-center gap-3 glass-button px-4 py-2 rounded-2xl shadow-lg">
          <Trophy size={18} className="text-amber-400" />
          <span className="text-sm font-bold">Level 12 • 2,450 XP</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Dopamine Menu (Sorted by Duration)">
          <div className="space-y-4">
            {dopamineMenu.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 glass-card rounded-2xl hover:bg-white/20 transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/30 group-hover:text-white transition-all shadow-sm border border-transparent group-hover:border-white/30">
                    <item.icon size={18} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{item.title}</h4>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{item.duration} min</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-400">+{item.reward}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Side Quests (Make Life Interesting)">
          <div className="space-y-4">
            {sideQuests.map((quest, i) => (
              <div key={i} className="flex items-center justify-between p-4 glass-card rounded-2xl hover:bg-white/20 transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/30 group-hover:text-white transition-all shadow-sm border border-transparent group-hover:border-white/30">
                    <quest.icon size={18} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{quest.title}</h4>
                    <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${quest.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-400' : quest.difficulty === 'Medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                      {quest.difficulty}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-amber-400">+{quest.reward}</span>
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
  const [selectedTopic, setSelectedTopic] = useState<KnowledgeTopic | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [topics, setTopics] = useState<KnowledgeTopic[]>([
    { 
      id: '1', 
      title: "Artificial Intelligence", 
      lastUpdated: "2h ago", 
      content: "AI is transforming how we work and live. Key areas include LLMs, computer vision, and robotics.",
      notes: [
        { id: 'n1', title: 'LLM Basics', content: 'Large Language Models are trained on vast amounts of text data to understand and generate human-like text. They use transformer architectures to process sequences of information.', date: '2026-03-21' },
        { id: 'n2', title: 'Neural Networks', content: 'Inspired by the human brain, neural networks are the backbone of deep learning. They consist of layers of interconnected nodes that learn patterns from data.', date: '2026-03-20' }
      ]
    },
    { 
      id: '2', 
      title: "Productivity Systems", 
      lastUpdated: "1d ago", 
      content: "Systems like GTD, Time Blocking, and the Zettelkasten method help manage information and tasks.",
      notes: [
        { id: 'n3', title: 'GTD Method', content: 'Getting Things Done is a personal productivity system developed by David Allen. It relies on moving planned tasks and projects out of the mind by recording them externally.', date: '2026-03-19' }
      ]
    },
    { 
      id: '3', 
      title: "Digital Health", 
      lastUpdated: "3d ago", 
      content: "Using technology to improve physical and mental well-being, from wearables to meditation apps.",
      notes: []
    },
    { 
      id: '4', 
      title: "Philosophy", 
      lastUpdated: "5d ago", 
      content: "Exploring fundamental questions about existence, knowledge, values, and reason.",
      notes: []
    }
  ]);

  const handleAddNote = () => {
    if (!selectedTopic || !newNote.title || !newNote.content) return;

    const note: Note = {
      id: Math.random().toString(36).substr(2, 9),
      title: newNote.title,
      content: newNote.content,
      date: new Date().toISOString().split('T')[0]
    };

    const updatedTopics = topics.map(t => {
      if (t.id === selectedTopic.id) {
        return {
          ...t,
          notes: [note, ...t.notes],
          lastUpdated: 'Just now'
        };
      }
      return t;
    });

    setTopics(updatedTopics);
    setSelectedTopic(updatedTopics.find(t => t.id === selectedTopic.id) || null);
    setIsAddingNote(false);
    setNewNote({ title: '', content: '' });
  };

  const handleAiQuery = async () => {
    if (!aiQuery.trim() || !selectedTopic) return;

    try {
      setIsAiLoading(true);
      setAiResponse('');
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        setAiResponse("Error: Gemini API key is not configured. Please check your environment variables.");
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are an AI assistant for a personal knowledge base.
        The user is asking a question about the topic: "${selectedTopic.title}".
        
        Topic Overview: ${selectedTopic.content}
        
        User's Notes on this topic:
        ${selectedTopic.notes.length > 0 
          ? selectedTopic.notes.map(n => `- ${n.title}: ${n.content}`).join('\n')
          : "No notes available for this topic yet."}
        
        User Question: ${aiQuery}
        
        Answer the question based on the provided topic overview and notes. If the information is not in the notes, use your general knowledge but mention it wasn't in the notes. Keep the answer concise and helpful. Use Markdown for formatting.`,
      });

      const text = response.text;
      if (!text) {
        throw new Error("Empty response from AI");
      }
      
      setAiResponse(text);
    } catch (error: any) {
      console.error("AI Assistant error:", error);
      let errorMessage = "Sorry, I encountered an error while processing your request.";
      if (error.message?.includes("API key")) {
        errorMessage = "Invalid API key. Please check your configuration.";
      } else if (error.message?.includes("quota")) {
        errorMessage = "API quota exceeded. Please try again later.";
      }
      setAiResponse(errorMessage);
    } finally {
      setIsAiLoading(false);
    }
  };

  if (selectedNote) {
    return (
      <div className="space-y-8">
        <button 
          onClick={() => setSelectedNote(null)}
          className="flex items-center gap-2 text-sm font-bold text-white/40 hover:text-white transition-colors uppercase tracking-widest"
        >
          <ChevronLeft size={16} />
          Back to {selectedTopic?.title}
        </button>

        <div className="max-w-3xl mx-auto">
          <Card>
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-white">{selectedNote.title}</h1>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{selectedNote.date}</p>
              </div>
              <div className="prose prose-invert prose-sm max-w-none">
                <p className="text-white/70 leading-relaxed whitespace-pre-wrap">{selectedNote.content}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (selectedTopic) {
    return (
      <div className="space-y-8">
        <button 
          onClick={() => {
            setSelectedTopic(null);
            setAiResponse('');
            setAiQuery('');
          }}
          className="flex items-center gap-2 text-sm font-bold text-white/40 hover:text-white transition-colors uppercase tracking-widest"
        >
          <ChevronLeft size={16} />
          Back to Knowledge Base
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex flex-col gap-4">
              <h1 className="text-4xl font-bold tracking-tight text-white">{selectedTopic.title}</h1>
              <div className="flex items-center gap-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                <span>{selectedTopic.notes.length} Notes</span>
                <span>•</span>
                <span>Updated {selectedTopic.lastUpdated}</span>
              </div>
            </div>

            <Card title="Topic Overview">
              <div className="prose prose-invert prose-sm max-w-none">
                <p className="text-white/70 leading-relaxed">{selectedTopic.content}</p>
              </div>
            </Card>

            <Card title="Notes">
              <div className="space-y-4">
                {isAddingNote ? (
                  <div className="p-6 glass-card rounded-2xl space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Note Title</label>
                      <input 
                        type="text" 
                        value={newNote.title}
                        onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                        placeholder="Enter note title..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-white/20 text-white placeholder:text-white/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Content</label>
                      <textarea 
                        value={newNote.content}
                        onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                        placeholder="Write your thoughts..."
                        rows={5}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-white/20 text-white placeholder:text-white/30 resize-none"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button 
                        onClick={handleAddNote}
                        className="flex-1 py-3 glass-button text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/30 transition-all"
                      >
                        Save Note
                      </button>
                      <button 
                        onClick={() => setIsAddingNote(false)}
                        className="px-6 py-3 bg-white/10 border border-white/20 text-white/60 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/20 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {selectedTopic.notes.length > 0 ? (
                      selectedTopic.notes.map(note => (
                        <div 
                          key={note.id} 
                          onClick={() => setSelectedNote(note)}
                          className="p-4 glass-card rounded-2xl hover:bg-white/20 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-sm text-white">{note.title}</h4>
                            <ChevronRight size={16} className="text-white/20 group-hover:text-white" />
                          </div>
                          <p className="text-xs text-white/40 mt-1 line-clamp-1">{note.content}</p>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center border border-dashed border-white/10 rounded-2xl">
                        <p className="text-xs text-white/40 font-medium">No notes yet for this topic.</p>
                      </div>
                    )}
                    <button 
                      onClick={() => setIsAddingNote(true)}
                      className="w-full py-3 border border-dashed border-white/20 rounded-2xl text-xs font-bold text-white/40 hover:bg-white/5 transition-all uppercase tracking-widest"
                    >
                      + Add New Note
                    </button>
                  </>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-8">
            <Card title="AI Assistant">
              <div className="space-y-4">
                <p className="text-xs text-white/40 italic">Ask the AI about this topic based on your notes.</p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAiQuery()}
                    placeholder="Ask anything..." 
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-white/20 text-white placeholder:text-white/30"
                  />
                  <button 
                    onClick={handleAiQuery}
                    disabled={isAiLoading}
                    className="p-3 glass-button text-white rounded-xl disabled:opacity-50"
                  >
                    {isAiLoading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                  </button>
                </div>
                {aiResponse && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 glass-card rounded-2xl"
                  >
                    <div className="flex items-start gap-3">
                      <Sparkles size={14} className="text-amber-400 shrink-0 mt-1" />
                      <div className="prose prose-invert prose-xs max-w-none">
                        <Markdown>{aiResponse}</Markdown>
                      </div>
                    </div>
                  </motion.div>
                )}
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
        <h1 className="text-4xl font-bold tracking-tight text-white">Knowledge Base</h1>
        <button 
          onClick={() => alert("New Topic feature coming soon!")}
          className="glass-button text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium shadow-lg"
        >
          <Plus size={18} />
          <span>New Topic</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {topics.map((topic) => (
          <Card 
            key={topic.id} 
            className="hover:shadow-md transition-all cursor-pointer group"
          >
            <div onClick={() => setSelectedTopic(topic)}>
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/20 group-hover:text-white transition-all border border-transparent group-hover:border-white/30">
                <BookOpen size={20} className="text-white" />
              </div>
              <h3 className="text-lg font-bold mb-1 text-white">{topic.title}</h3>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">{topic.notes.length} Notes</p>
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Updated {topic.lastUpdated}</span>
                <ChevronRight size={14} className="text-white/20 group-hover:text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card title="Recent AI Summaries">
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between group cursor-pointer hover:bg-white/10 hover:shadow-sm transition-all">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center shadow-sm">
                  <Sparkles size={14} className="text-amber-400" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Summary of "Building a Second Brain"</h4>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Added yesterday</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-white/20 group-hover:text-white" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

const SettingsTab = ({ 
  interests, 
  onUpdateInterests 
}: { 
  interests: string[], 
  onUpdateInterests: (i: string[]) => void 
}) => {
  const [newInterest, setNewInterest] = useState('');

  const addInterest = () => {
    if (newInterest && !interests.includes(newInterest)) {
      onUpdateInterests([...interests, newInterest]);
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    onUpdateInterests(interests.filter(i => i !== interest));
  };

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold tracking-tight text-white">Settings</h1>
      
      <div className="max-w-2xl space-y-6">
        <Card title="Profile Settings">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/10 rounded-2xl overflow-hidden">
                <img src="https://picsum.photos/seed/user/100/100" alt="User" referrerPolicy="no-referrer" />
              </div>
              <button className="px-4 py-2 glass-button text-white/60 rounded-xl text-xs font-bold hover:text-white transition-all">
                Change Photo
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Full Name</label>
                <input type="text" defaultValue="Lea Rattei" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-white/20 text-white placeholder:text-white/30" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Email</label>
                <input type="email" defaultValue="lea.rattei@gmail.com" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-white/20 text-white placeholder:text-white/30" />
              </div>
            </div>
          </div>
        </Card>

        <Card title="Newsletter Interests">
          <div className="space-y-6">
            <p className="text-sm text-white/60">Select the topics you're interested in. These will be used to curate your daily briefing on the overview page.</p>
            
            <div className="flex flex-wrap gap-2">
              {interests.map(interest => (
                <div key={interest} className="flex items-center gap-2 bg-white/20 text-white px-3 py-1.5 rounded-full text-xs font-medium border border-white/10">
                  {interest}
                  <button 
                    onClick={() => removeInterest(interest)}
                    className="hover:text-red-400 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input 
                type="text" 
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addInterest()}
                placeholder="Add a new area of interest..." 
                className="flex-1 bg-white/10 border border-white/20 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-white/20 text-white placeholder:text-white/30" 
              />
              <button 
                onClick={addInterest}
                className="px-4 py-2 bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-xl text-xs font-bold hover:bg-white/30 transition-all shadow-lg shadow-black/20"
              >
                Add
              </button>
            </div>
          </div>
        </Card>

        <Card title="Life Vision Settings">
          <div className="space-y-4">
            <p className="text-sm text-white/60">Your vision was generated on Mar 21, 2026. You can reset it to start the AI questionnaire again.</p>
            <button className="px-6 py-3 bg-red-500/10 text-red-400 rounded-xl text-xs font-bold hover:bg-red-500/20 transition-all border border-red-500/20">
              Reset Life Vision
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
const SidebarItem = ({ icon: Icon, label, active = false, collapsed = false }: { icon: any, label: string, active?: boolean, collapsed?: boolean }) => (
  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 group relative ${active ? 'glass-button shadow-lg' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}>
    <Icon size={20} className="shrink-0" />
    {!collapsed && <span className="font-semibold text-sm whitespace-nowrap">{label}</span>}
    {collapsed && (
      <div className="absolute left-full ml-4 px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap border border-white/10">
        {label}
      </div>
    )}
  </div>
);

const Card = ({ title, children, className = "" }: { title?: string, children: React.ReactNode, className?: string }) => (
  <div className={`glass-card rounded-3xl p-6 ${className}`}>
    {title && <h3 className="text-sm font-semibold text-white/90 mb-4 uppercase tracking-wider">{title}</h3>}
    {children}
  </div>
);

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'vision' | 'projects' | 'work' | 'calendar' | 'quests' | 'knowledge' | 'workout' | 'settings'>('overview');
  const [interests, setInterests] = useState(['Artificial Intelligence', 'Productivity', 'Digital Health']);
  const [dailyPulseData, setDailyPulseData] = useState<DailyPulseData>({
    energy: 0,
    focus: 0,
    source: null
  });
  const [isOverwhelmed, setIsOverwhelmed] = useState(false);
  const [visionData, setVisionData] = useState<LifeVisionData | null>(null);
  const [projects, setProjects] = useState<Project[]>([
    { id: '1', title: 'lifedotAI MVP', status: 'on-track', deadline: 'Mar 30', description: 'Building the first version of the life management AI.' },
    { id: '2', title: 'Health Transformation', status: 'at-risk', deadline: 'Apr 15', description: 'Focusing on physical and mental well-being.' },
    { id: '3', title: 'Financial Freedom Plan', status: 'on-track', deadline: 'Dec 31', description: 'Long-term wealth building and budgeting.' }
  ]);
  const [allTasks, setAllTasks] = useState<Task[]>([
    { id: 't1', title: 'Design Landing Page', priority: 'high', isStrategic: true, isFrog: false, status: 'todo' },
    { id: 't2', title: 'Write Blog Post', priority: 'medium', isStrategic: false, isFrog: true, status: 'todo' },
    { id: 't3', title: 'Review Analytics', priority: 'low', isStrategic: false, isFrog: false, status: 'todo' },
    { id: '1a', title: 'Implement Work Mode', projectId: '1', priority: 'high', isStrategic: true, isFrog: false, status: 'done' },
    { id: '1b', title: 'Fix Calendar Alignment', projectId: '1', priority: 'medium', isStrategic: false, isFrog: false, status: 'todo' },
    { id: '1c', title: 'Refine News UI', projectId: '1', priority: 'low', isStrategic: false, isFrog: false, status: 'todo' },
    { id: '2a', title: 'Daily 5km run', projectId: '2', priority: 'high', isStrategic: false, isFrog: true, status: 'todo' },
    { id: '2b', title: 'Meditation 10min', projectId: '2', priority: 'medium', isStrategic: false, isFrog: false, status: 'todo' },
    { id: '2c', title: 'Meal prep', projectId: '2', priority: 'low', isStrategic: false, isFrog: false, status: 'todo' },
    { id: '3a', title: 'Set up emergency fund', projectId: '3', priority: 'high', isStrategic: true, isFrog: false, status: 'todo' },
    { id: '3b', title: 'Automate savings', projectId: '3', priority: 'medium', isStrategic: false, isFrog: false, status: 'todo' },
    { id: '3c', title: 'Review investments', projectId: '3', priority: 'low', isStrategic: false, isFrog: false, status: 'todo' },
  ]);
  const [schedule, setSchedule] = useState<DailySchedule | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([
    { id: 'e1', title: 'Deep Work: App Architecture', date: new Date().toISOString().split('T')[0], startTime: '09:00 AM', endTime: '11:30 AM', type: 'work' },
    { id: 'e2', title: 'Lunch with Sarah', date: new Date().toISOString().split('T')[0], startTime: '12:30 PM', endTime: '01:30 PM', type: 'social' },
    { id: 'e3', title: 'Product Review', date: new Date().toISOString().split('T')[0], startTime: '02:00 PM', endTime: '03:00 PM', type: 'work' },
    { id: 'e4', title: 'Gym Session', date: new Date().toISOString().split('T')[0], startTime: '04:30 PM', endTime: '05:30 PM', type: 'health' }
  ]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);

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


  const isSidebarCollapsed = true; // Always collapsed as per user request

  return (
    <div className="min-h-screen text-white font-sans selection:bg-white/30 selection:text-white">
      <div className="flex h-screen overflow-hidden">
        
        {/* Left Sidebar - Menu */}
        <aside className={`glass-sidebar flex flex-col p-6 transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'w-24' : 'w-64'}`}>
          <div className={`flex items-center gap-2 mb-10 px-2 transition-all duration-500 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
              <Compass className="text-white" size={18} />
            </div>
            {!isSidebarCollapsed && <span className="font-bold text-xl tracking-tight italic whitespace-nowrap text-white">lifedotAI</span>}
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

          <div className="mt-auto pt-6 border-t border-white/10 space-y-1">
            <div onClick={() => setActiveTab('settings')}>
              <SidebarItem icon={Settings} label="Settings" active={activeTab === 'settings'} collapsed={isSidebarCollapsed} />
            </div>
            <div className={`flex items-center gap-3 px-4 py-3 mt-4 bg-white/10 rounded-2xl transition-all duration-500 ${isSidebarCollapsed ? 'justify-center px-2' : ''}`}>
              <div className="w-8 h-8 bg-white/20 rounded-full overflow-hidden shrink-0">
                <img src="https://picsum.photos/seed/user/100/100" alt="User" referrerPolicy="no-referrer" />
              </div>
              {!isSidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">Lea Rattei</p>
                  <p className="text-xs text-white/40 truncate">Pro Plan</p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-transparent">
          {/* Header */}
          <header className="h-20 flex items-center justify-between px-8 sticky top-0 bg-white/5 backdrop-blur-md z-10">
            <div className="flex items-center gap-4 bg-white/10 border border-white/20 px-4 py-2 rounded-2xl w-96 shadow-sm backdrop-blur-sm">
              <Search size={18} className="text-white/60" />
              <input 
                type="text" 
                placeholder="Search your life..." 
                className="bg-transparent border-none outline-none text-sm w-full text-white placeholder:text-white/40"
              />
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsOverwhelmed(true)}
                className="px-4 py-2 bg-red-500/20 text-red-200 rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:bg-red-500/30 transition-all border border-red-500/30"
              >
                <Wind size={16} />
                <span>Overwhelmed</span>
              </button>
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors relative">
                <Bell size={20} className="text-white/80" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white/20"></span>
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
                    <h1 className="text-4xl font-bold tracking-tight text-white">Good morning, Lea.</h1>
                    <p className="text-white/60 font-medium">Ready to build a life you love today?</p>
                  </div>

                  {/* Grid Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Main Section (Left/Center) */}
                    <div className="lg:col-span-2 space-y-8">
                      <Card title="Focus for today">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-2xl">
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
                            <div className="p-4 border border-white/10 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer">
                              <p className="text-xs font-bold text-white/40 uppercase mb-1">Indecision to solve</p>
                              <p className="font-semibold">Choose tech stack for backend</p>
                            </div>
                            <div className="p-4 border border-white/10 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer">
                              <p className="text-xs font-bold text-white/40 uppercase mb-1">Next milestone</p>
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
                    allTasks={allTasks}
                    projects={projects}
                    onUpdateTasks={setAllTasks}
                  />
                </motion.div>
              ) : activeTab === 'projects' ? (
                <motion.div 
                  key="projects"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <ProjectsTab
                    projects={projects}
                    allTasks={allTasks}
                    onAddProject={(p) => setProjects([...projects, p])}
                    onUpdateProject={(p) => setProjects(prev => prev.map(proj => proj.id === p.id ? p : proj))}
                    onDeleteProject={(id) => setProjects(prev => prev.filter(p => p.id !== id))}
                    onUpdateTasks={setAllTasks}
                  />
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
                  <SettingsTab 
                    interests={interests} 
                    onUpdateInterests={setInterests} 
                  />
                </motion.div>
              ) : (
                <motion.div 
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-40 text-center"
                >
                  <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mb-6">
                    <Compass className="text-white/40" size={40} />
                  </div>
                  <h2 className="text-2xl font-bold mb-2 uppercase tracking-widest">Coming Soon</h2>
                  <p className="text-white/40 font-medium">We're still building the {activeTab} lab. Stay tuned!</p>
                </motion.div>
              )}
            </AnimatePresence>
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
