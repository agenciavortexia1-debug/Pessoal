import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  Brain, 
  Wallet, 
  Trophy, 
  Inbox,
  Plus,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Clock,
  Zap,
  Moon,
  DollarSign,
  CheckCircle2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { format, subDays, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { cn, calculateScore, getCorrelation } from './lib/utils';
import { BodyLog, MindLog, FinanceLog, Project, DisciplineLog, InboxItem, DashboardData } from './types';

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center w-full gap-3 px-4 py-3 rounded-xl transition-all duration-200",
      active 
        ? "bg-black text-white shadow-lg" 
        : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
    )}
  >
    <Icon size={20} />
    <span className="font-medium hidden lg:block">{label}</span>
  </button>
);

const MobileNavItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center flex-1 gap-1 py-2 transition-all duration-200",
      active ? "text-black" : "text-zinc-400"
    )}
  >
    <Icon size={20} strokeWidth={active ? 2.5 : 2} />
    <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
  </button>
);

const Card = ({ children, title, subtitle, className }: any) => (
  <div className={cn("bg-white border border-zinc-100 rounded-2xl p-4 md:p-6 shadow-sm", className)}>
    {(title || subtitle) && (
      <div className="mb-4 md:mb-6">
        {title && <h3 className="text-base md:text-lg font-semibold text-zinc-900">{title}</h3>}
        {subtitle && <p className="text-xs md:text-sm text-zinc-500">{subtitle}</p>}
      </div>
    )}
    {children}
  </div>
);

const ScoreWidget = ({ label, score, color, icon: Icon }: any) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-zinc-500">
        <Icon size={16} />
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <span className={cn("text-sm font-bold", color)}>{score}</span>
    </div>
    <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        className={cn("h-full rounded-full", color.replace('text-', 'bg-'))}
      />
    </div>
  </div>
);

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/dashboard');
      if (!res.ok) {
        throw new Error(`Erro do servidor: ${res.status}`);
      }
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("O servidor não retornou JSON. Verifique se o backend está rodando corretamente.");
      }
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderContent = () => {
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-96 gap-4 text-center p-6">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-500">
            <AlertCircle size={32} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900">Falha na Conexão</h3>
            <p className="text-sm text-zinc-500 max-w-xs mx-auto mt-1">{error}</p>
          </div>
          <button 
            onClick={fetchData}
            className="px-6 py-2 bg-black text-white rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-transform"
          >
            Tentar Novamente
          </button>
          <p className="text-[10px] text-zinc-400 mt-4 uppercase tracking-widest">
            Nota: Se você estiver usando Vercel, o banco de dados SQLite local não é suportado.
          </p>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard': return <DashboardView data={data} onRefresh={fetchData} />;
      case 'body': return <BodyView onUpdate={fetchData} />;
      case 'mind': return <MindView onUpdate={fetchData} />;
      case 'finance': return <FinanceView onUpdate={fetchData} />;
      case 'discipline': return <DisciplineView onUpdate={fetchData} />;
      case 'inbox': return <InboxView onUpdate={fetchData} />;
      default: return <DashboardView data={data} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans text-zinc-900 pb-20 md:pb-0">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-20 lg:w-64 border-r border-zinc-200 bg-white p-4 lg:p-6 flex-col gap-8 fixed h-full z-20">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shrink-0">
            <Zap className="text-white" size={18} />
          </div>
          <h1 className="font-bold text-lg tracking-tight hidden lg:block">Life Intel</h1>
        </div>

        <nav className="flex flex-col gap-2">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={Activity} label="Corpo" active={activeTab === 'body'} onClick={() => setActiveTab('body')} />
          <SidebarItem icon={Brain} label="Mente" active={activeTab === 'mind'} onClick={() => setActiveTab('mind')} />
          <SidebarItem icon={Wallet} label="Finanças" active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} />
          <SidebarItem icon={Trophy} label="Disciplina" active={activeTab === 'discipline'} onClick={() => setActiveTab('discipline')} />
          <SidebarItem icon={Inbox} label="Inbox" active={activeTab === 'inbox'} onClick={() => setActiveTab('inbox')} />
        </nav>

        <div className="mt-auto p-4 bg-zinc-50 rounded-2xl border border-zinc-100 hidden lg:block">
          <p className="text-xs text-zinc-400 uppercase font-bold tracking-widest mb-2">Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-zinc-600">Sincronizado</span>
          </div>
        </div>
      </aside>

      {/* Bottom Nav - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 px-2 py-1 flex justify-around items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <MobileNavItem icon={LayoutDashboard} label="Home" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
        <MobileNavItem icon={Activity} label="Corpo" active={activeTab === 'body'} onClick={() => setActiveTab('body')} />
        <MobileNavItem icon={Brain} label="Mente" active={activeTab === 'mind'} onClick={() => setActiveTab('mind')} />
        <MobileNavItem icon={Wallet} label="Money" active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} />
        <MobileNavItem icon={Trophy} label="Foco" active={activeTab === 'discipline'} onClick={() => setActiveTab('discipline')} />
        <MobileNavItem icon={Inbox} label="Inbox" active={activeTab === 'inbox'} onClick={() => setActiveTab('inbox')} />
      </nav>

      {/* Main Content */}
      <main className="flex-1 md:ml-20 lg:ml-64 p-4 md:p-8">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Zap className="text-white" size={16} />
            </div>
            <h1 className="font-bold text-lg tracking-tight">Life Intel</h1>
          </div>
          <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

// --- Views ---

function DashboardView({ data, onRefresh }: { data: DashboardData | null, onRefresh: () => void }) {
  if (!data) return (
    <div className="flex flex-col items-center justify-center h-96 gap-4">
      <div className="w-12 h-12 border-4 border-zinc-200 border-t-black rounded-full animate-spin" />
      <p className="text-zinc-500 font-medium">Carregando inteligência...</p>
    </div>
  );

  const hasData = data.body.length > 0 || data.mind.length > 0 || data.finance.length > 0 || data.discipline.length > 0;

  const latestBody = data.body[0];
  const latestMind = data.mind[0];
  const latestFinance = data.finance[0];
  
  // Calculate Scores
  const bodyScore = latestBody ? calculateScore((latestBody.sleep_quality + latestBody.energy_level + (latestBody.training_done ? 5 : 0)) / 3) : 0;
  const mindScore = latestMind ? calculateScore((latestMind.mood + (6 - latestMind.anxiety) + (6 - latestMind.stress) + latestMind.focus) / 4) : 0;
  
  const financialPressure = latestFinance ? Math.min(100, Math.round((latestFinance.debts / (latestFinance.income || 1)) * 100)) : 0;
  const financeScore = 100 - financialPressure;

  const disciplineScore = data.discipline.length > 0 ? Math.min(100, Math.round(data.discipline[0].total_minutes / 2.4)) : 0;

  const overallScore = Math.round((bodyScore + mindScore + financeScore + disciplineScore) / 4);

  if (!hasData) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-sm text-zinc-500">Comece a registrar para ver sua inteligência.</p>
          </div>
          <button onClick={onRefresh} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <Clock size={20} className="text-zinc-400" />
          </button>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-12">
          <div className="flex flex-col items-center text-center p-8 bg-white border border-zinc-100 rounded-3xl shadow-sm">
            <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mb-4">
              <Plus className="text-zinc-400" size={32} />
            </div>
            <h3 className="text-lg font-bold">Nenhum dado detectado</h3>
            <p className="text-sm text-zinc-500 mt-2 max-w-xs">
              O sistema precisa de pelo menos um registro em qualquer categoria para começar a processar sua inteligência de vida.
            </p>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
              <p className="text-sm font-bold text-indigo-900">Dica de Inteligência</p>
              <p className="text-xs text-indigo-700 mt-1">
                Registre seu sono na aba "Corpo" e seu humor na aba "Mente" para ver as primeiras correlações.
              </p>
            </div>
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
              <p className="text-sm font-bold text-emerald-900">Privacidade</p>
              <p className="text-xs text-emerald-700 mt-1">
                Seus dados são processados localmente e nunca saem do seu controle.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Correlation Analysis
  const insights = [];
  if (data.body.length > 5 && data.discipline.length > 5) {
    const sleep = data.body.map(b => b.sleep_hours);
    const focus = data.mind.map(m => m.focus);
    const corr = getCorrelation(sleep, focus);
    if (Math.abs(corr) > 0.4) {
      insights.push({
        title: "Padrão de Foco Detectado",
        text: `Sua qualidade de sono tem uma correlação de ${Math.round(corr * 100)}% com seu nível de foco diário.`,
        type: corr > 0 ? 'positive' : 'negative'
      });
    }
  }

  if (data.finance.length > 5 && data.mind.length > 5) {
    const debts = data.finance.map(f => f.debts);
    const anxiety = data.mind.map(m => m.anxiety);
    const corr = getCorrelation(debts, anxiety);
    if (corr > 0.3) {
      insights.push({
        title: "Pressão Financeira",
        text: "Detectamos que aumentos em suas dívidas estão diretamente ligados ao seu nível de ansiedade.",
        type: 'negative'
      });
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-sm text-zinc-500">Visão geral da sua inteligência de vida.</p>
          </div>
          <button 
            onClick={onRefresh}
            className="md:hidden p-2 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <Clock size={20} className="text-zinc-400" />
          </button>
        </div>
        <div className="flex items-center justify-between md:justify-end gap-4 bg-white p-3 md:p-0 rounded-2xl border border-zinc-100 md:border-none">
          <button 
            onClick={onRefresh}
            className="hidden md:flex p-2 hover:bg-zinc-100 rounded-full transition-colors mr-2"
          >
            <Clock size={20} className="text-zinc-400" />
          </button>
          <div className="text-left md:text-right">
            <p className="text-[10px] md:text-xs font-bold text-zinc-400 uppercase tracking-widest">Score Geral</p>
            <p className="text-2xl md:text-3xl font-black text-black">{overallScore}</p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-4 border-zinc-100 flex items-center justify-center">
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-black" />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <Card className="flex flex-col justify-between h-28 md:h-32 p-4 md:p-6">
          <ScoreWidget label="Corpo" score={bodyScore} color="text-emerald-600" icon={Activity} />
        </Card>
        <Card className="flex flex-col justify-between h-28 md:h-32 p-4 md:p-6">
          <ScoreWidget label="Mente" score={mindScore} color="text-indigo-600" icon={Brain} />
        </Card>
        <Card className="flex flex-col justify-between h-28 md:h-32 p-4 md:p-6">
          <ScoreWidget label="Money" score={financeScore} color="text-amber-600" icon={Wallet} />
        </Card>
        <Card className="flex flex-col justify-between h-28 md:h-32 p-4 md:p-6">
          <ScoreWidget label="Foco" score={disciplineScore} color="text-rose-600" icon={Trophy} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card title="Correlações Críticas" subtitle="Padrões detectados" className="lg:col-span-2 p-4 md:p-6">
          <div className="h-[200px] md:h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[...data.body].reverse()}>
                <defs>
                  <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="sleep_hours" stroke="#10b981" fillOpacity={1} fill="url(#colorSleep)" strokeWidth={2} name="Sono (h)" />
                <Area type="monotone" dataKey="energy_level" stroke="#6366f1" fill="transparent" strokeWidth={2} name="Energia" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="p-4 bg-zinc-50 rounded-xl">
              <p className="text-xs font-bold text-zinc-400 uppercase mb-1">Sono Médio</p>
              <p className="text-xl font-bold">{(data.body.reduce((a, b) => a + b.sleep_hours, 0) / (data.body.length || 1)).toFixed(1)}h</p>
            </div>
            <div className="p-4 bg-zinc-50 rounded-xl">
              <p className="text-xs font-bold text-zinc-400 uppercase mb-1">Energia Média</p>
              <p className="text-xl font-bold">{(data.body.reduce((a, b) => a + b.energy_level, 0) / (data.body.length || 1)).toFixed(1)}</p>
            </div>
          </div>
        </Card>

        <Card title="Insights & Alertas" subtitle="O que o sistema aprendeu hoje">
          <div className="space-y-4 mt-4">
            {insights.length > 0 ? insights.map((insight, i) => (
              <div key={i} className={cn(
                "p-4 rounded-xl border flex gap-3",
                insight.type === 'positive' ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100"
              )}>
                <div className={cn(
                  "mt-1",
                  insight.type === 'positive' ? "text-emerald-600" : "text-rose-600"
                )}>
                  {insight.type === 'positive' ? <TrendingUp size={18} /> : <AlertCircle size={18} />}
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-900">{insight.title}</p>
                  <p className="text-xs text-zinc-600 mt-1 leading-relaxed">{insight.text}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="text-zinc-400" size={24} />
                </div>
                <p className="text-sm text-zinc-500">Aguardando mais dados para gerar insights profundos.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function BodyView({ onUpdate }: { onUpdate: () => void }) {
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    sleep_hours: 7,
    sleep_quality: 3,
    training_done: false,
    training_type: '',
    energy_level: 3,
    activity_level: 3
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/body', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    onUpdate();
    alert('Dados salvos!');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card title="Registro do Corpo" subtitle="Como está sua máquina biológica hoje?">
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Data</label>
              <input 
                type="date" 
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-black outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Horas de Sono</label>
              <input 
                type="number" step="0.5"
                value={formData.sleep_hours}
                onChange={e => setFormData({...formData, sleep_hours: parseFloat(e.target.value)})}
                className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-black outline-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-medium text-zinc-700">Qualidade do Sono (1-5)</p>
            <div className="flex justify-between gap-2">
              {[1, 2, 3, 4, 5].map(v => (
                <button
                  key={v} type="button"
                  onClick={() => setFormData({...formData, sleep_quality: v})}
                  className={cn(
                    "flex-1 py-3 rounded-xl border transition-all",
                    formData.sleep_quality === v ? "bg-black text-white border-black" : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400"
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-100">
            <div className="flex items-center gap-3">
              <Activity className="text-emerald-500" size={20} />
              <div>
                <p className="text-sm font-bold">Treinou hoje?</p>
                <p className="text-xs text-zinc-500">Qualquer atividade física conta.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFormData({...formData, training_done: !formData.training_done})}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative",
                formData.training_done ? "bg-emerald-500" : "bg-zinc-300"
              )}
            >
              <motion.div 
                animate={{ x: formData.training_done ? 24 : 4 }}
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
              />
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-medium text-zinc-700">Nível de Energia (1-5)</p>
            <div className="flex justify-between gap-2">
              {[1, 2, 3, 4, 5].map(v => (
                <button
                  key={v} type="button"
                  onClick={() => setFormData({...formData, energy_level: v})}
                  className={cn(
                    "flex-1 py-3 rounded-xl border transition-all",
                    formData.energy_level === v ? "bg-black text-white border-black" : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400"
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="w-full py-4 bg-black text-white rounded-xl font-bold shadow-lg hover:bg-zinc-800 transition-all">
            Salvar Registro
          </button>
        </form>
      </Card>
    </div>
  );
}

function MindView({ onUpdate }: { onUpdate: () => void }) {
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    mood: 3,
    anxiety: 1,
    stress: 1,
    focus: 3,
    journal: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/mind', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    onUpdate();
    alert('Mente registrada!');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card title="Estado Mental" subtitle="Esvazie sua mente e registre seu estado interno.">
        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <p className="text-sm font-bold text-zinc-700 uppercase tracking-wider">Humor</p>
              <div className="flex gap-1 md:gap-2">
                {[1, 2, 3, 4, 5].map(v => (
                  <button key={v} type="button" onClick={() => setFormData({...formData, mood: v})}
                    className={cn("flex-1 h-12 md:h-10 rounded-xl border font-bold", formData.mood === v ? "bg-black text-white" : "bg-white")}>{v}</button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-bold text-zinc-700 uppercase tracking-wider">Foco</p>
              <div className="flex gap-1 md:gap-2">
                {[1, 2, 3, 4, 5].map(v => (
                  <button key={v} type="button" onClick={() => setFormData({...formData, focus: v})}
                    className={cn("flex-1 h-12 md:h-10 rounded-xl border font-bold", formData.focus === v ? "bg-black text-white" : "bg-white")}>{v}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <p className="text-sm font-bold text-zinc-700 uppercase tracking-wider">Ansiedade</p>
              <div className="flex gap-1 md:gap-2">
                {[1, 2, 3, 4, 5].map(v => (
                  <button key={v} type="button" onClick={() => setFormData({...formData, anxiety: v})}
                    className={cn("flex-1 h-12 md:h-10 rounded-xl border font-bold", formData.anxiety === v ? "bg-rose-500 text-white border-rose-500" : "bg-white")}>{v}</button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-bold text-zinc-700 uppercase tracking-wider">Estresse</p>
              <div className="flex gap-1 md:gap-2">
                {[1, 2, 3, 4, 5].map(v => (
                  <button key={v} type="button" onClick={() => setFormData({...formData, stress: v})}
                    className={cn("flex-1 h-12 md:h-10 rounded-xl border font-bold", formData.stress === v ? "bg-rose-500 text-white border-rose-500" : "bg-white")}>{v}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Diário Rápido</label>
            <textarea 
              placeholder="Hoje estou me sentindo ___ porque ___."
              value={formData.journal}
              onChange={e => setFormData({...formData, journal: e.target.value})}
              className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl h-32 focus:ring-2 focus:ring-black outline-none resize-none"
            />
          </div>

          <button type="submit" className="w-full py-4 bg-black text-white rounded-xl font-bold shadow-lg">
            Finalizar Registro Mental
          </button>
        </form>
      </Card>
    </div>
  );
}

function FinanceView({ onUpdate }: { onUpdate: () => void }) {
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    income: 0,
    expenses: 0,
    debts: 0,
    installments: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/finance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    onUpdate();
    alert('Finanças atualizadas!');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card title="Saúde Financeira" subtitle="Controle seus números para reduzir a pressão mental.">
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Receitas do Mês</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3.5 text-zinc-400" size={16} />
                <input type="number" value={formData.income} onChange={e => setFormData({...formData, income: parseFloat(e.target.value)})}
                  className="w-full pl-10 p-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-black" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Despesas Fixas/Variáveis</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3.5 text-zinc-400" size={16} />
                <input type="number" value={formData.expenses} onChange={e => setFormData({...formData, expenses: parseFloat(e.target.value)})}
                  className="w-full pl-10 p-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-black" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Total de Dívidas</label>
              <input type="number" value={formData.debts} onChange={e => setFormData({...formData, debts: parseFloat(e.target.value)})}
                className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Parcelamentos Ativos</label>
              <input type="number" value={formData.installments} onChange={e => setFormData({...formData, installments: parseFloat(e.target.value)})}
                className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-black" />
            </div>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
            <div className="flex gap-3">
              <AlertCircle className="text-amber-600 mt-0.5" size={18} />
              <div>
                <p className="text-sm font-bold text-amber-900">Por que registrar dívidas?</p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  O sistema cruza o volume de dívidas com seu nível de ansiedade para mostrar o impacto real do dinheiro na sua paz mental.
                </p>
              </div>
            </div>
          </div>

          <button type="submit" className="w-full py-4 bg-black text-white rounded-xl font-bold shadow-lg">
            Salvar Dados Financeiros
          </button>
        </form>
      </Card>
    </div>
  );
}

function DisciplineView({ onUpdate }: { onUpdate: () => void }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProject, setNewProject] = useState({ name: '', goal: 10 });
  const [log, setLog] = useState({ project_id: 0, minutes: 60, focus: 3, date: format(new Date(), 'yyyy-MM-dd') });

  const fetchProjects = async () => {
    const res = await fetch('/api/projects');
    const json = await res.json();
    setProjects(json);
    if (json.length > 0) setLog(l => ({ ...l, project_id: json[0].id }));
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newProject.name, weekly_goal_hours: newProject.goal })
    });
    setNewProject({ name: '', goal: 10 });
    fetchProjects();
  };

  const handleLogDiscipline = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/discipline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        date: log.date, 
        project_id: log.project_id, 
        minutes_invested: log.minutes, 
        focus_level: log.focus 
      })
    });
    onUpdate();
    alert('Progresso registrado!');
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
      <div className="space-y-6 md:space-y-8">
        <Card title="Projetos Ativos" subtitle="O que você está construindo?" className="p-4 md:p-6">
          <form onSubmit={handleAddProject} className="flex flex-col sm:flex-row gap-2 mb-6">
            <input 
              placeholder="Nome do projeto" 
              value={newProject.name}
              onChange={e => setNewProject({...newProject, name: e.target.value})}
              className="flex-1 p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none"
            />
            <div className="flex gap-2">
              <input 
                type="number" 
                placeholder="Meta (h)" 
                value={newProject.goal}
                onChange={e => setNewProject({...newProject, goal: parseFloat(e.target.value)})}
                className="flex-1 sm:w-20 p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none"
              />
              <button type="submit" className="p-3 bg-black text-white rounded-xl"><Plus size={20}/></button>
            </div>
          </form>

          <div className="space-y-3">
            {projects.map(p => (
              <div key={p.id} className="p-4 border border-zinc-100 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">{p.name}</p>
                  <p className="text-xs text-zinc-500">Meta: {p.weekly_goal_hours}h / semana</p>
                </div>
                <ChevronRight size={16} className="text-zinc-300" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-8">
        <Card title="Registro de Foco" subtitle="Quanto tempo você investiu hoje?">
          <form onSubmit={handleLogDiscipline} className="space-y-6 mt-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Projeto</label>
              <select 
                value={log.project_id}
                onChange={e => setLog({...log, project_id: parseInt(e.target.value)})}
                className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none"
              >
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Minutos</label>
                <input type="number" value={log.minutes} onChange={e => setLog({...log, minutes: parseInt(e.target.value)})}
                  className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Nível de Foco (1-5)</label>
                <input type="number" min="1" max="5" value={log.focus} onChange={e => setLog({...log, focus: parseInt(e.target.value)})}
                  className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none" />
              </div>
            </div>

            <button type="submit" className="w-full py-4 bg-black text-white rounded-xl font-bold shadow-lg">
              Registrar Progresso
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}

function InboxView({ onUpdate }: { onUpdate: () => void }) {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [content, setContent] = useState('');
  const [type, setType] = useState<'idea' | 'worry' | 'thought' | 'task'>('idea');

  const fetchItems = async () => {
    const res = await fetch('/api/inbox');
    const json = await res.json();
    setItems(json);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    await fetch('/api/inbox', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, type })
    });
    setContent('');
    fetchItems();
  };

  const deleteItem = async (id: number) => {
    await fetch(`/api/inbox/${id}`, { method: 'DELETE' });
    fetchItems();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Card title="Inbox Mental" subtitle="Tire da cabeça, coloque no sistema.">
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="flex gap-2">
            {(['idea', 'worry', 'thought', 'task'] as const).map(t => (
              <button
                key={t} type="button"
                onClick={() => setType(t)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all",
                  type === t ? "bg-black text-white border-black" : "bg-white text-zinc-500 border-zinc-200"
                )}
              >
                {t === 'idea' ? 'Ideia' : t === 'worry' ? 'Preocupação' : t === 'thought' ? 'Pensamento' : 'Tarefa'}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input 
              placeholder="O que está na sua mente agora?"
              value={content}
              onChange={e => setContent(e.target.value)}
              className="flex-1 p-4 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-black"
            />
            <button type="submit" className="px-6 bg-black text-white rounded-xl font-bold shadow-lg">
              Capturar
            </button>
          </div>
        </form>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(item => (
          <motion.div 
            layout
            key={item.id} 
            className="p-4 bg-white border border-zinc-100 rounded-xl shadow-sm flex items-start justify-between group"
          >
            <div className="flex gap-3">
              <div className={cn(
                "w-1.5 h-1.5 rounded-full mt-2",
                item.type === 'idea' ? "bg-emerald-500" : 
                item.type === 'worry' ? "bg-rose-500" : 
                item.type === 'thought' ? "bg-indigo-500" : "bg-amber-500"
              )} />
              <div>
                <p className="text-sm text-zinc-800 leading-relaxed">{item.content}</p>
                <p className="text-[10px] text-zinc-400 mt-2 uppercase font-bold tracking-widest">{format(new Date(item.created_at), 'dd MMM HH:mm')}</p>
              </div>
            </div>
            <button 
              onClick={() => deleteItem(item.id)}
              className="text-zinc-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
            >
              <CheckCircle2 size={18} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
