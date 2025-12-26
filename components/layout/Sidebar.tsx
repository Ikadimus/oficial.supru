
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';

const NavIcon: React.FC<{ path: string }> = ({ path }) => (
  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={path}></path>
  </svg>
);

const Sidebar: React.FC = () => {
  const { user, logout, isPrivilegedUser, hasFullVisibility } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
      isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-zinc-700'
    }`;

  const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    const initials = names.map(n => n[0]).join('');
    return initials.slice(0, 2).toUpperCase();
  };

  return (
    <aside className="w-72 flex-shrink-0 bg-[#0a0f1a] p-4 flex flex-col justify-between border-r border-zinc-800">
      <div>
        {/* Logo Customizado BIOMETANO Caieiras */}
        <div className="mb-10 px-2">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5 italic">
              <span className="text-2xl font-black text-white tracking-tighter">BIOMETANO</span>
              <span className="text-2xl font-black text-[#f97316] tracking-tighter">Caieiras</span>
            </div>
            <div className="mt-1">
              <span className="text-[10px] font-bold text-[#10b981] tracking-[0.2em] uppercase">
                Gestão de Suprimentos
              </span>
            </div>
          </div>
        </div>

        {/* Botão de Adicionar visível apenas para Admin */}
        {isPrivilegedUser && (
          <div className="mb-6">
             <Button as="link" to="/requests/new" className="w-full !bg-blue-600 hover:!bg-blue-700 !rounded-lg !py-3 font-bold shadow-lg shadow-blue-900/20">
                + Nova Solicitação
              </Button>
          </div>
        )}

        <nav className="space-y-1.5">
          <NavLink to="/" className={navLinkClass} end>
            <NavIcon path="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            Dashboard
          </NavLink>
          <NavLink to="/requests" className={navLinkClass}>
            <NavIcon path="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            Solicitações
          </NavLink>
          
          {/* Relatórios para Admin, Gerente, Diretor */}
          {hasFullVisibility && (
              <>
                <NavLink to="/reports" className={navLinkClass}>
                  <NavIcon path="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  Relatórios
                </NavLink>
                <NavLink to="/evaluations" className={navLinkClass}>
                  <NavIcon path="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  Avaliação
                </NavLink>
              </>
          )}

          {/* Configurações visíveis apenas para Admin */}
          {isPrivilegedUser && (
            <div className="pt-4 mt-4 border-t border-zinc-800 space-y-1.5">
              <p className="px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Administração</p>
              <NavLink to="/users" className={navLinkClass}>
                <NavIcon path="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21a6 6 0 006-6v-1a3 3 0 00-3-3H9a3 3 0 00-3 3v1a6 6 0 006 6z" />
                Usuários
              </NavLink>
              <NavLink to="/sectors" className={navLinkClass}>
                <NavIcon path="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m5-4h1m-1 4h1" />
                Setores
              </NavLink>
              <NavLink to="/settings" className={navLinkClass}>
                <NavIcon path="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                Personalizar Sistema
              </NavLink>
            </div>
          )}
        </nav>
      </div>
      
      <div className="border-t border-zinc-800 pt-4">
        <div className="flex items-center p-2 rounded-md hover:bg-zinc-800 transition-colors">
           <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-bold text-white mr-3 flex-shrink-0 border border-white/10 shadow-lg">
            {user ? getInitials(user.name) : ''}
          </div>
          <div className="flex-grow overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight truncate">{user?.sector || 'Sem setor'}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full flex items-center mt-2 px-3 py-2 text-xs font-bold rounded-md text-red-400/70 hover:text-red-400 hover:bg-red-400/10 transition-all uppercase tracking-widest">
          <NavIcon path="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          Sair do Sistema
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
