
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import DatabaseSetup from '../components/DatabaseSetup';

const BackgroundAnimation: React.FC = () => {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-[#02040a]">
            {/* Camada de Textura/Ruído para profundidade */}
            <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

            {/* Esferas de Energia Ampliadas */}
            <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-[#10b981]/10 rounded-full blur-[150px] animate-pulse"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-[#f97316]/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '3s' }}></div>
            
            {/* Grid de Perspectiva 3D */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] opacity-20" 
                     style={{ 
                         backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)', 
                         backgroundSize: '80px 80px',
                         transform: 'perspective(500px) rotateX(60deg)',
                         maskImage: 'linear-gradient(to bottom, transparent, black, transparent)'
                     }}>
                </div>
            </div>

            {/* Partículas de Biometano (Flutuantes) */}
            <div className="absolute inset-0">
                {[...Array(20)].map((_, i) => (
                    <div 
                        key={i}
                        className="absolute rounded-full bg-white opacity-20 animate-float-particle"
                        style={{
                            width: Math.random() * 4 + 1 + 'px',
                            height: Math.random() * 4 + 1 + 'px',
                            left: Math.random() * 100 + '%',
                            top: Math.random() * 100 + '%',
                            animationDuration: Math.random() * 10 + 10 + 's',
                            animationDelay: Math.random() * 5 + 's',
                            boxShadow: '0 0 10px rgba(255,255,255,0.5)'
                        }}
                    />
                ))}
            </div>
            
            {/* Linhas de Fluxo Energético */}
            <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="transparent" />
                        <stop offset="50%" stopColor="#10b981" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                </defs>
                <path d="M-100 300 Q 500 150 1100 450 T 2100 300" stroke="url(#line-grad)" strokeWidth="0.5" fill="none" className="animate-[dash_30s_linear_infinite]" />
                <path d="M-100 700 Q 600 900 1200 600 T 2200 800" stroke="url(#line-grad)" strokeWidth="0.5" fill="none" className="animate-[dash_40s_linear_infinite]" style={{ animationDelay: '-10s' }} />
            </svg>

            <style>{`
                @keyframes dash {
                    to { stroke-dashoffset: -2000; }
                }
                @keyframes float-particle {
                    0% { transform: translateY(0) scale(1); opacity: 0; }
                    20% { opacity: 0.3; }
                    80% { opacity: 0.3; }
                    100% { transform: translateY(-100vh) scale(0.5); opacity: 0; }
                }
                .animate-float-particle {
                    animation: float-particle linear infinite;
                }
            `}</style>
        </div>
    );
};

const ConfigModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [url, setUrl] = useState('');
    const [key, setKey] = useState('');

    useEffect(() => {
        if (isOpen) {
            setUrl(localStorage.getItem('supabase_url') || 'https://ucyybgyhnwnpkfhwsoea.supabase.co');
            setKey(localStorage.getItem('supabase_key') || '');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        localStorage.setItem('supabase_url', url);
        localStorage.setItem('supabase_key', key);
        window.location.reload();
    };

    const handleReset = () => {
        localStorage.removeItem('supabase_url');
        localStorage.removeItem('supabase_key');
        window.location.reload();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
            <div className="bg-zinc-900/90 border border-zinc-700 rounded-3xl shadow-2xl w-full max-w-md p-8 backdrop-blur-xl">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path></svg>
                    </div>
                    Configurações
                </h3>
                <div className="space-y-5">
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1.5">Supabase URL</label>
                        <input 
                            type="text" 
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            placeholder="https://seu-projeto.supabase.co"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1.5">Public Key</label>
                        <input 
                            type="password" 
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={key}
                            onChange={e => setKey(e.target.value)}
                            placeholder="eyJh..."
                        />
                    </div>
                </div>
                <div className="mt-8 flex justify-between items-center">
                     <button onClick={handleReset} className="text-[10px] text-red-400 hover:text-red-300 font-black tracking-widest uppercase">Resetar</button>
                    <div className="flex space-x-3">
                        <Button variant="secondary" onClick={onClose} className="!rounded-xl">Fechar</Button>
                        <Button onClick={handleSave} className="!bg-blue-600 !rounded-xl">Salvar</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  
  const { login, connectionError, missingTables } = useAuth();
  const navigate = useNavigate();

  if (missingTables) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-[#02040a] py-12 px-4 relative">
              <BackgroundAnimation />
              <DatabaseSetup />
          </div>
      );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Preencha todos os campos.');
      return;
    }
    
    setIsLoading(true);
    try {
        const success = await login(email, password);
        if (success) {
        navigate('/');
        } else {
        setError('E-mail ou senha incorretos.');
        }
    } catch (err) {
        setError('Erro ao conectar.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#02040a] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
       <BackgroundAnimation />

       {/* Config Button - Estilizado como um Floating Action Button */}
       <button 
         onClick={() => setIsConfigOpen(true)}
         className="fixed top-8 right-8 p-3 text-white/40 hover:text-white rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 backdrop-blur-xl group z-50 shadow-2xl"
         title="Configurar Conexão"
       >
         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform group-hover:rotate-90 duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
         </svg>
       </button>

       <ConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} />

      <div className="max-w-md w-full space-y-8 bg-black/60 backdrop-blur-[40px] p-10 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/5 relative z-10 before:absolute before:inset-0 before:rounded-[2.5rem] before:bg-gradient-to-b before:from-white/10 before:to-transparent before:pointer-events-none">
        <div className="flex flex-col items-center">
          {/* Logo Customizado BIOMETANO Caieiras */}
          <div className="mb-10 flex flex-col items-center group cursor-default">
            <div className="flex items-baseline gap-2 italic transition-all group-hover:scale-110 duration-700">
              <span className="text-4xl font-black text-white tracking-tighter drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]">BIOMETANO</span>
              <span className="text-4xl font-black text-[#f97316] tracking-tighter drop-shadow-[0_0_25px_rgba(249,115,22,0.4)]">Caieiras</span>
            </div>
            <div className="mt-3 relative">
              <span className="text-[12px] font-black text-[#10b981] tracking-[0.4em] uppercase">
                Gestão de Suprimentos
              </span>
              <div className="absolute -bottom-2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#10b981]/50 to-transparent"></div>
            </div>
          </div>
          
          <p className="text-center text-xs text-white/40 font-bold uppercase tracking-[0.2em] mb-2">
            Autenticação Segura
          </p>
        </div>
        
        {connectionError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-red-500/20 rounded-lg">
                        <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    </div>
                    <div className="text-[11px] text-red-200 leading-tight">
                        <p className="font-black uppercase tracking-widest">Erro Crítico</p>
                        <p className="opacity-60">Revise os parâmetros de conexão.</p>
                    </div>
                </div>
            </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div className="group">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1 mb-2 block group-focus-within:text-[#10b981] transition-colors">
                E-mail Institucional
              </label>
              <input
                type="email"
                required
                className="w-full bg-white/[0.03] border border-white/10 text-white rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-[#10b981] focus:bg-white/[0.08] outline-none transition-all placeholder-white/10 hover:border-white/20"
                placeholder="nome@empresa.com.br"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
              />
            </div>
            <div className="group">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1 mb-2 block group-focus-within:text-[#f97316] transition-colors">
                Chave de Acesso
              </label>
              <input
                type="password"
                required
                className="w-full bg-white/[0.03] border border-white/10 text-white rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-[#f97316] focus:bg-white/[0.08] outline-none transition-all placeholder-white/10 hover:border-white/20"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-[11px] font-black text-center bg-red-400/10 py-3 rounded-xl animate-shake uppercase tracking-widest">
                {error}
            </div>
          )}

          <div className="pt-4">
            <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full !rounded-2xl !py-5 font-black uppercase tracking-[0.3em] text-xs !bg-gradient-to-r from-[#10b981] to-[#0ea5e9] hover:scale-[1.02] active:scale-95 shadow-[0_20px_40px_rgba(16,185,129,0.3)] transition-all duration-300"
            >
              {isLoading ? 'Validando...' : 'Entrar no Sistema'}
            </Button>
          </div>
        </form>
      </div>

      {/* Marca d'água de Suporte sutil no canto inferior */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 text-white/10 text-[10px] font-black tracking-[0.5em] uppercase pointer-events-none whitespace-nowrap">
        Bio-Energy Intelligence System
      </div>

      <style>{`
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-6px); }
            75% { transform: translateX(6px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </div>
  );
};

export default LoginPage;
