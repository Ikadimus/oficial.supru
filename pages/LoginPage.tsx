
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import DatabaseSetup from '../components/DatabaseSetup';

const BackgroundAnimation: React.FC = () => {
    // Cores vibrantes: Verde Biometano, Laranja Energia, Azul Tecnologia
    const colors = ['#10b981', '#f97316', '#3b82f6'];
    
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-[#010205]">
            {/* Camada de Textura/Ruído sutil */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

            {/* Auras de cor (Nebulosas) */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#10b981]/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#f97316]/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            
            {/* Grid de Perspectiva 3D */}
            <div className="absolute inset-0 overflow-hidden z-10">
                <div className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] opacity-[0.15]" 
                     style={{ 
                         backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)', 
                         backgroundSize: '80px 80px',
                         transform: 'perspective(500px) rotateX(60deg)',
                         maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
                     }}>
                </div>
            </div>

            {/* BIO-PARTICLES COLORIDAS (Z-INDEX 20) */}
            <div className="absolute inset-0 z-20">
                {[...Array(60)].map((_, i) => {
                    const color = colors[i % colors.length];
                    const size = Math.random() * 7 + 3; // Tamanhos de 3px a 10px
                    const duration = Math.random() * 12 + 8; // Mais rápidas e variadas
                    const delay = Math.random() * 15;
                    const left = Math.random() * 100;
                    const opacity = Math.random() * 0.6 + 0.4; // Mais opacas para visibilidade

                    return (
                        <div 
                            key={i}
                            className="absolute rounded-full animate-float-3d-enhanced"
                            style={{
                                width: size + 'px',
                                height: size + 'px',
                                left: left + '%',
                                bottom: '-5%',
                                backgroundColor: color,
                                boxShadow: `0 0 ${size * 3}px ${color}, 0 0 ${size}px white`,
                                opacity: opacity,
                                animationDuration: duration + 's',
                                animationDelay: -delay + 's',
                            }}
                        />
                    );
                })}
            </div>
            
            {/* Linhas de Fluxo Energético */}
            <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none z-30" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="flow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="transparent" />
                        <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                </defs>
                <path d="M-100 500 Q 500 300 1100 650 T 2100 500" stroke="url(#flow-grad)" strokeWidth="1" fill="none" className="animate-dash-line" />
            </svg>

            <style>{`
                @keyframes float-3d-enhanced {
                    0% { 
                        transform: translateY(0) translateX(0) scale(0.5); 
                        opacity: 0; 
                    }
                    20% { opacity: 0.8; }
                    50% { 
                        transform: translateY(-50vh) translateX(50px) scale(1.3); 
                        opacity: 1;
                    }
                    80% { opacity: 0.8; }
                    100% { 
                        transform: translateY(-110vh) translateX(-30px) scale(0.5); 
                        opacity: 0; 
                    }
                }
                .animate-float-3d-enhanced {
                    animation: float-3d-enhanced linear infinite;
                }
                @keyframes dash-line {
                    from { stroke-dasharray: 0 3000; stroke-dashoffset: 3000; }
                    to { stroke-dasharray: 1500 1500; stroke-dashoffset: 0; }
                }
                .animate-dash-line {
                    animation: dash-line 25s linear infinite;
                }
            `}</style>
        </div>
    );
};

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, connectionError, missingTables } = useAuth();
  const navigate = useNavigate();

  if (missingTables) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-[#010205] py-12 px-4 relative">
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
    <div className="min-h-screen flex items-center justify-center bg-[#010205] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
       <BackgroundAnimation />

      <div className="max-w-md w-full space-y-8 bg-black/60 backdrop-blur-[40px] p-10 rounded-[3rem] shadow-[0_0_150px_rgba(0,0,0,1)] border border-white/10 relative z-50 overflow-hidden group">
        {/* Efeito de brilho de vidro na borda */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
        
        <div className="flex flex-col items-center relative z-10">
          <div className="mb-10 flex flex-col items-center group cursor-default">
            <div className="flex items-baseline gap-2 italic transition-all group-hover:scale-105 duration-700">
              <span className="text-4xl font-black text-white tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">BIOMETANO</span>
              <span className="text-4xl font-black text-[#f97316] tracking-tighter drop-shadow-[0_0_30px_rgba(249,115,22,0.3)]">Caieiras</span>
            </div>
            <div className="mt-3 relative">
              <span className="text-[12px] font-black text-[#10b981] tracking-[0.4em] uppercase">
                Gestão de Suprimentos
              </span>
              <div className="absolute -bottom-2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#10b981]/50 to-transparent"></div>
            </div>
          </div>
          
          <p className="text-center text-[10px] text-white/40 font-black uppercase tracking-[0.3em] mb-2">
            Autenticação de Segurança
          </p>
        </div>
        
        {connectionError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-red-500/20 rounded-lg">
                        <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    </div>
                    <div className="text-[11px] text-red-200 leading-tight">
                        <p className="font-black uppercase tracking-widest">Erro de Sistema</p>
                        <p className="opacity-60">O banco de dados está inacessível no momento.</p>
                    </div>
                </div>
            </div>
        )}

        <form className="mt-8 space-y-6 relative z-10" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div className="group">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1 mb-2 block group-focus-within:text-[#10b981] transition-colors">
                Identificação (E-mail)
              </label>
              <input
                type="email"
                required
                className="w-full bg-white/[0.05] border border-white/10 text-white rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-[#10b981] focus:bg-white/[0.1] outline-none transition-all placeholder-white/5 hover:border-white/20"
                placeholder="usuario@biometano.com.br"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
              />
            </div>
            <div className="group">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1 mb-2 block group-focus-within:text-[#f97316] transition-colors">
                Senha de Acesso
              </label>
              <input
                type="password"
                required
                className="w-full bg-white/[0.05] border border-white/10 text-white rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-[#f97316] focus:bg-white/[0.1] outline-none transition-all placeholder-white/5 hover:border-white/20"
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
                className="w-full !rounded-2xl !py-5 font-black uppercase tracking-[0.4em] text-[10px] !bg-gradient-to-r from-[#10b981] via-[#3b82f6] to-[#f97316] bg-[length:200%_auto] hover:bg-right hover:scale-[1.02] active:scale-95 shadow-[0_20px_60px_rgba(16,185,129,0.4)] transition-all duration-500"
            >
              {isLoading ? 'Conectando...' : 'Acessar Sistema'}
            </Button>
          </div>
        </form>
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 text-white/10 text-[9px] font-black tracking-[0.8em] uppercase pointer-events-none whitespace-nowrap">
        BIO-ENERGY INTELLIGENCE SYSTEM
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
