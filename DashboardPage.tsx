
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useRequests } from '../contexts/RequestContext';
import { useAuth } from '../contexts/AuthContext';
import { Request } from '../types';
import Button from '../components/ui/Button';

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-5 flex items-center justify-between">
    <div>
      <p className="text-gray-400 text-sm">{title}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
    <div className="text-gray-500 bg-zinc-800 p-3 rounded-full">
      {icon}
    </div>
  </div>
);

const StatusBadge: React.FC<{ statusName: string }> = ({ statusName }) => {
    const { statuses } = useRequests();
    const status = statuses.find(s => s.name === statusName);
    const color = status?.color || 'gray';

    const statusStyles: Record<string, string> = {
        yellow: 'bg-yellow-900/50 text-yellow-300 border border-yellow-500/30',
        blue: 'bg-blue-900/50 text-blue-300 border border-blue-500/30',
        purple: 'bg-purple-900/50 text-purple-300 border border-purple-500/30',
        green: 'bg-green-900/50 text-green-300 border border-green-500/30',
        red: 'bg-red-900/50 text-red-300 border border-red-500/30',
        gray: 'bg-gray-700 text-gray-300 border border-gray-500/30',
    };
    return (
        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[color]}`}>
            {statusName}
        </span>
    );
};

const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

const DashboardPage: React.FC = () => {
  const { requests, loading, formFields } = useRequests();
  const { user, hasFullVisibility, sectors } = useAuth();

  const filteredRequests = useMemo(() => {
      if (loading || !user) return [];
      // Se tiver visibilidade total (Admin, Gerente, Diretor), vê tudo. Se não, filtra pelo setor.
      if (hasFullVisibility) return requests;
      return requests.filter(r => r.sector === user.sector);
  }, [requests, user, hasFullVisibility, loading]);

  // --- Estatísticas Mensais ---
  const monthlyStats = useMemo(() => {
      const stats: { name: string; count: number }[] = [];
      const today = new Date();
      
      // Gera os últimos 6 meses
      for (let i = 5; i >= 0; i--) {
          const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
          const monthName = d.toLocaleString('pt-BR', { month: 'short' });
          const yearShort = d.getFullYear().toString().slice(2);
          const key = `${monthName}/${yearShort}`;
          
          // Filtra requests desse mês/ano
          const count = filteredRequests.filter(req => {
             if (!req.requestDate) return false;
             const reqDate = new Date(req.requestDate);
             // Ajuste de fuso horário simples (considerando data YYYY-MM-DD)
             // Vamos comparar strings YYYY-MM para ser mais seguro
             const reqYearMonth = req.requestDate.slice(0, 7); // "2023-10"
             const currentYearMonth = d.toISOString().slice(0, 7);
             return reqYearMonth === currentYearMonth;
          }).length;

          stats.push({ name: key, count });
      }
      return stats;
  }, [filteredRequests]);

  const maxMonthlyCount = Math.max(...monthlyStats.map(s => s.count), 1); // Evita divisão por zero

  // --- Estatísticas por Setor ---
  const sectorStats = useMemo(() => {
      // 1. Inicializa contagem com todos os setores cadastrados (para mostrar 0 se não tiver nada)
      const counts: Record<string, number> = {};
      
      // Se for Admin/Gerente, mostramos todos os setores. Se for usuário comum, foca no dele (mas a lógica filteredRequests já limita os dados)
      // Porém, para o gráfico ficar bonito para o Admin, pegamos a lista completa de 'sectors'
      sectors.forEach(s => {
          counts[s.name] = 0;
      });

      // 2. Conta as solicitações
      filteredRequests.forEach(req => {
          const sName = req.sector || 'Sem Setor';
          counts[sName] = (counts[sName] || 0) + 1;
      });

      // 3. Transforma em array e ordena
      return Object.entries(counts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count); // Ordena do maior para o menor
  }, [filteredRequests, sectors]);

  const maxSectorCount = Math.max(...sectorStats.map(s => s.count), 1);

  if (loading) {
    return <div className="text-center p-10 text-gray-400">Carregando...</div>;
  }
  
  const total = filteredRequests.length;
  const pending = filteredRequests.filter(r => r.status === 'Pendente').length;
  const inProgress = filteredRequests.filter(r => r.status === 'Em Andamento').length;
  const concluded = filteredRequests.filter(r => r.status === 'Entregue').length;
  
  const recentRequests = filteredRequests.slice(0, 5);
  
  // Colunas Visíveis (Sincronizado com a configuração de campos)
  const visibleColumns = formFields.filter(f => f.isVisibleInList !== false);

  const getCellValue = (request: any, fieldId: string, isStandard: boolean) => {
      const value = isStandard ? request[fieldId] : request.customFields?.[fieldId];
      if (value === undefined || value === null) return '-';
      
      if (fieldId === 'status') {
          return <StatusBadge statusName={String(value)} />;
      }

      // Lógica específica do Dashboard: Highlight de atraso
      if (fieldId === 'deliveryDate') {
           const todayDate = new Date().toISOString().split('T')[0];
           const isOverdue = value && value < todayDate && request.status !== 'Entregue';
           return (
               <span className={isOverdue ? 'text-red-500 font-semibold' : 'text-gray-300'}>
                   {formatDate(value)}
               </span>
           );
      }

      // Lógica específica do Dashboard: Truncar descrição
      if (fieldId === 'description') {
           return (
               <span className="block max-w-xs truncate text-gray-300" title={String(value)}>
                   {String(value)}
               </span>
           )
      }

      if (fieldId === 'requestDate' || (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value))) {
          return <span className="text-gray-300">{formatDate(value)}</span>;
      }
      return <span className="text-gray-300">{value}</span>;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Bem-vindo, {user?.name.split(' ')[0]}</h1>
          <p className="text-gray-400">
             {hasFullVisibility 
                ? 'Visão geral de todas as solicitações' 
                : `Visão geral das solicitações do setor ${user?.sector}`}
          </p>
        </div>
      </div>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total de Solicitações" value={total} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>} />
        <StatCard title="Pendentes" value={pending} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>} />
        <StatCard title="Em Andamento" value={inProgress} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>} />
        <StatCard title="Concluídas" value={concluded} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>} />
      </div>

      {/* --- GRÁFICOS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Gráfico Mensal */}
          <div className="bg-zinc-900 shadow-xl rounded-lg p-6 border border-zinc-800">
              <h3 className="text-lg font-bold text-white mb-6">Solicitações por Mês</h3>
              <div className="flex items-end justify-between h-48 space-x-2">
                  {monthlyStats.map((stat, index) => {
                      const heightPercentage = Math.round((stat.count / maxMonthlyCount) * 100);
                      return (
                          <div key={index} className="flex flex-col items-center flex-1 group">
                              <div className="relative w-full flex justify-center items-end h-full">
                                  <div 
                                      style={{ height: `${heightPercentage}%` }} 
                                      className={`w-full max-w-[40px] rounded-t-sm transition-all duration-500 ${stat.count > 0 ? 'bg-blue-600 group-hover:bg-blue-500' : 'bg-zinc-800 h-1'}`}
                                  ></div>
                                  {/* Tooltip on hover */}
                                  <div className="absolute -top-8 bg-zinc-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                      {stat.count}
                                  </div>
                              </div>
                              <span className="text-xs text-gray-400 mt-2 font-medium uppercase">{stat.name.split('/')[0]}</span>
                          </div>
                      );
                  })}
              </div>
          </div>

          {/* Gráfico por Setor */}
          <div className="bg-zinc-900 shadow-xl rounded-lg p-6 border border-zinc-800">
              <h3 className="text-lg font-bold text-white mb-6">Solicitações por Setor</h3>
              <div className="space-y-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {sectorStats.map((stat, index) => {
                      const widthPercentage = Math.round((stat.count / total) * 100) || 0;
                      // Calcular largura relativa ao maior setor para a barra visual ficar boa
                      const visualWidth = Math.round((stat.count / maxSectorCount) * 100);
                      
                      return (
                          <div key={index}>
                              <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-300 font-medium">{stat.name}</span>
                                  <span className="text-gray-400">{stat.count} <span className="text-xs text-zinc-600">({widthPercentage}%)</span></span>
                              </div>
                              <div className="w-full bg-zinc-800 rounded-full h-2.5">
                                  <div 
                                      className="bg-purple-600 h-2.5 rounded-full transition-all duration-500" 
                                      style={{ width: `${visualWidth}%` }}
                                  ></div>
                              </div>
                          </div>
                      );
                  })}
                  {sectorStats.length === 0 && <p className="text-gray-500 text-sm">Nenhum setor encontrado.</p>}
              </div>
          </div>

      </div>

      {/* Recent Requests Table */}
       <div className="bg-zinc-900 shadow-xl rounded-lg overflow-hidden border border-zinc-800">
        <div className="p-6 flex justify-between items-center">
            <div>
                <h2 className="text-xl font-bold text-white">Solicitações Recentes</h2>
                <p className="text-sm text-gray-400">
                    {hasFullVisibility ? 'Todos os setores' : `Setor: ${user?.sector}`}
                </p>
            </div>
          <Button as="link" to="/requests" variant="secondary">Ver Todas</Button>
        </div>
        
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-800">
                <thead className="bg-zinc-800/50">
                    <tr>
                         {visibleColumns.map(field => (
                             <th key={field.id} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                {field.label}
                            </th>
                        ))}
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Ações</th>
                    </tr>
                </thead>
                 <tbody className="divide-y divide-zinc-800">
                    {recentRequests.length > 0 ? recentRequests.map((request) => {
                        return (
                        <tr key={request.id} className="hover:bg-zinc-800/50 transition-colors">
                             {visibleColumns.map(field => (
                                <td key={`${request.id}-${field.id}`} className="px-6 py-4 whitespace-nowrap text-sm">
                                     {field.id === 'orderNumber' ? (
                                        <span className="font-medium text-white">{getCellValue(request, field.id, field.isStandard)}</span>
                                    ) : (
                                        getCellValue(request, field.id, field.isStandard)
                                    )}
                                </td>
                            ))}
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Link to={`/requests/${request.id}`} className="text-blue-400 hover:text-blue-300">
                                    Ver
                                </Link>
                            </td>
                        </tr>
                        );
                    }) : (
                        <tr>
                            <td colSpan={visibleColumns.length + 1} className="text-center py-10 text-gray-500">
                                Nenhuma solicitação encontrada.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
