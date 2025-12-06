
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import DatabaseSetup from '../components/DatabaseSetup';

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
        window.location.reload(); // Recarrega para pegar as novas configs
    };

    const handleReset = () => {
        localStorage.removeItem('supabase_url');
        localStorage.removeItem('supabase_key');
        window.location.reload();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl w-full max-w-md p-6">
                <h3 className="text-xl font-bold text-white mb-4">Configurar Conexão</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400">URL do Supabase</label>
                        <input 
                            type="text" 
                            className="w-full bg-zinc-800 border border-zinc-600 rounded p-2 text-white text-sm"
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            placeholder="https://seu-projeto.supabase.co"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Anon Key (Pública)</label>
                        <input 
                            type="text" 
                            className="w-full bg-zinc-800 border border-zinc-600 rounded p-2 text-white text-sm"
                            value={key}
                            onChange={e => setKey(e.target.value)}
                            placeholder="eyJh..."
                        />
                        <p className="text-xs text-gray-500 mt-1">A chave deve começar com 'ey...' (JWT).</p>
                    </div>
                </div>
                <div className="mt-6 flex justify-between">
                     <button onClick={handleReset} className="text-xs text-red-400 hover:text-red-300">Restaurar Padrão</button>
                    <div className="flex space-x-2">
                        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                        <Button onClick={handleSave}>Salvar e Recarregar</Button>
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

  // Se as tabelas não existirem, mostra o setup
  if (missingTables) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-[#111111] py-12 px-4 sm:px-6 lg:px-8 relative">
              <DatabaseSetup />
          </div>
      );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, preencha o e-mail e a senha.');
      return;
    }
    
    setIsLoading(true);
    try {
        const success = await login(email, password);
        if (success) {
        navigate('/');
        } else {
        setError('Credenciais inválidas. Por favor, tente novamente.');
        }
    } catch (err) {
        setError('Erro ao conectar com o servidor.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111111] py-12 px-4 sm:px-6 lg:px-8 relative">
       {/* Config Button */}
       <button 
         onClick={() => setIsConfigOpen(true)}
         className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
         title="Configurar Banco de Dados"
       >
         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
         </svg>
       </button>

       <ConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} />

      <div className="max-w-md w-full space-y-8 bg-[#1c1c1c] p-10 rounded-xl shadow-2xl border border-gray-700">
        <div className="flex flex-col items-center">
            <div className="bg-blue-600/20 p-3 rounded-lg border border-blue-500/30">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                <path d="M12 2L4 6.5V15.5L12 20L20 15.5V6.5L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M12 11L20 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 11V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 11L4 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16.5 4.5L8.5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-100">
            Sistema de Suprimentos
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Entre com suas credenciais para acessar o painel
          </p>
        </div>
        
        {connectionError && (
            <div className="bg-red-900/30 border border-red-500/50 rounded-md p-4 mb-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-300">Erro de Conexão</h3>
                        <div className="mt-2 text-sm text-red-200">
                            <p>{connectionError}</p>
                            <p className="mt-2 font-bold cursor-pointer underline" onClick={() => setIsConfigOpen(true)}>Clique aqui para configurar a chave correta.</p>
                        </div>
                    </div>
                </div>
            </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-600 bg-gray-800 placeholder-gray-500 text-gray-100 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
              />
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-medium text-gray-300">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-600 bg-gray-800 placeholder-gray-500 text-gray-100 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="********"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <div>
            <Button type="submit" disabled={isLoading} className="w-full !bg-blue-600 hover:!bg-blue-700 focus:ring-blue-500">
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
