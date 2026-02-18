
import React, { useMemo, useState } from 'react';
// Fixed: Verified standard exports for react-router-dom version 6.
import { Link } from 'react-router-dom';
import { useRequests } from '../contexts/RequestContext';
import { useAuth } from '../contexts/AuthContext';
import { Request } from '../types';
import Button from '../components/ui/Button';

// --- Components ---

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; colorName: string }> = ({ title, value, icon, colorName }) => {
  
  // Mapeamento de cores para classes Tailwind
  const colorMap: Record<string, { bg: string, text: string }> = {
    yellow: { bg: 'bg-yellow-600', text: 'text-yellow-400' },
    blue:   { bg: 'bg-blue-600',   text: 'text-blue-400' },
    purple: { bg: 'bg-purple-600', text: 'text-purple-400' },
    green:  { bg: 'bg-emerald-600',text: 'text-emerald-400' },
    red:    { bg: 'bg-red-600',    text: 'text-red-400' },
    gray:   { bg: 'bg-zinc-600',   text: 'text-zinc-400' },
    // Fallback
    default:{ bg: 'bg-zinc-700',   text: 'text-zinc-300' }
  };

  const colors = colorMap[colorName] || colorMap.default;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex items-center justify-between shadow-lg hover:shadow-xl transition-shadow duration-300 relative overflow-hidden group">
        <div className={`absolute top-0 right-0 w-24 h-24 ${colors.bg} opacity-5 rounded-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>
        <div className="relative z-10">
        <p className="text-gray-400 text-sm font-medium uppercase tracking-wider truncate max-w-[120px]" title={title}>{title}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className={`text-gray-300 ${colors.bg} bg-opacity-20 p-3 rounded-lg relative z-10`}>
             <div className={colors.text}>
                 {icon}
             </div>
        </div>
    </div>
  );
};

const getStatusIcon = (color: string) => {
    switch (color) {
        case 'green': // Concluído/Entregue
            return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
        case 'yellow': // Pendente/Atenção
            return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
        case 'blue': // Processando/Info
            return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>;
        case 'purple': // Especial/Aguardando
            return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>;
        case 'red': // Cancelado/Erro
            return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
        default: // Gray/Outros
            return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>;
    }
}

const StatusBadge: React.FC<{ statusName: string }> = ({ statusName }) => {
    const { statuses } = useRequests();
    const status = statuses.find(s => s.name === statusName);
    const color = status?.color || 'gray';

    const statusStyles: Record<string, string> = {
        yellow: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
        blue: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
        purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
        green: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
        red: 'bg-red-500/10 text-red-400 border border-red-500/20',
        gray: 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20',
    };
    return (
        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-md ${statusStyles[color]}`}>
            {statusName}
        </span>
    );
};

// Formata data para DD/MM/AAAA (Br)
const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    // Se já estiver em formato BR, retorna
    if (dateString.includes('/') && dateString.length === 10) return dateString;
    
    // Divide por traço para evitar timezone offset de 'new Date()'
    const [year, month, day] = dateString.split('-');
    if(day && month && year) {
        return `${day}/${month}/${year}`;
    }
    return dateString;
}

interface MonthSectorData {
    name: string;
    total: number;
    urgent: number;
}

interface MonthlyStat {
    name: string;
    fullDate: string;
    count: number;
    urgentCount: number;
    sectors: MonthSectorData[];
}

const DashboardPage: React.FC = () => {
  const { requests, loading, formFields, statuses } = useRequests();
  const { user, hasFullVisibility, sectors } = useAuth();
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  const filteredRequests = useMemo(() => {
      if (loading || !user) return [];
      if (hasFullVisibility) return requests;
      return requests.filter(r => r.sector === user.sector);
  }, [requests, user, hasFullVisibility, loading]);

  // --- Contagem Dinâmica por Status ---
  const statusCounts = useMemo(() => {
      const counts: Record<string, number> = {};
      // Inicializa com 0 para todos os status configurados
      statuses.forEach(s => counts[s.name] = 0);
      
      // Conta as solicitações
      filteredRequests.forEach(req => {
          if (counts[req.status] !== undefined) {
              counts[req.status]++;
          }
      });
      return counts;
  }, [filteredRequests, statuses]);

  // --- Estatísticas Mensais com Detalhamento por Setor ---
  const monthlyStats = useMemo(() => {
      const stats: MonthlyStat[] = [];
      const today = new Date();
      
      for (let i = 5; i >= 0; i--) {
          const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
          const monthName = d.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
          const yearShort = d.getFullYear().toString().slice(2);
          const key = `${monthName}/${yearShort}`;
          
          const monthRequests = filteredRequests.filter(req => {
             if (!req.requestDate) return false;
             const reqYearMonth = req.requestDate.slice(0, 7); 
             const currentYearMonth = d.toISOString().slice(0, 7);
             return reqYearMonth === currentYearMonth;
          });

          const count = monthRequests.length;
          const urgentCount = monthRequests.filter(req => req.urgency === 'Alta').length;

          // Processa detalhamento por setor para este mês específico
          const sectorMap: Record<string, { total: number; urgent: number }> = {};
          monthRequests.forEach(req => {
              const sName = req.sector || 'Sem Setor';
              if (!sectorMap[sName]) sectorMap[sName] = { total: 0, urgent: 0 };
              sectorMap[sName].total++;
              if (req.urgency === 'Alta') sectorMap[sName].urgent++;
          });

          const monthSectors = Object.entries(sectorMap)
              .map(([name, data]) => ({ name, ...data }))
              .sort((a, b) => b.total - a.total);

          stats.push({ 
              name: key, 
              fullDate: d.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }), 
              count, 
              urgentCount,
              sectors: monthSectors
          });
      }
      return stats;
  }, [filteredRequests]);

  // Cálculo para o Eixo Y (Escala)
  const maxMonthlyCount = Math.max(...monthlyStats.map(s => s.count), 1);
  const yAxisMax = Math.ceil((maxMonthlyCount + 1) / 5) * 5; 
  const yAxisSteps = [yAxisMax, yAxisMax * 0.75, yAxisMax * 0.5, yAxisMax * 0.25, 0];

  // --- Estatísticas por Setor ---
  const sectorStats = useMemo(() => {
      const counts: Record<string, { total: number; urgent: number }> = {};
      
      sectors.forEach(s => {
          counts[s.name] = { total: 0, urgent: 0 };
      });

      filteredRequests.forEach(req => {
          const sName = req.sector || 'Sem Setor';
          if (!counts[sName]) counts[sName] = { total: 0, urgent: 0 };
          
          counts[sName].total += 1;
          if (req.urgency === 'Alta') {
              counts[sName].urgent += 1;
          }
      });

      return Object.entries(counts)
          .map(([name, data]) => ({ name, ...data }))
          .sort((a, b) => b.total - a.total)
          .filter(s => s.total > 0 || sectors.length <= 5)
          .slice(0, 6);
  }, [filteredRequests, sectors]);

  const maxSectorCount = Math.max(...sectorStats.map(s => s.total), 1);

  if (loading) {
    return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );
  }
  
  const total = filteredRequests.length;
  const recentRequests = filteredRequests.slice(0, 5);
  const visibleColumns = formFields.filter(f => f.isVisibleInList !== false);

  const getCellValue = (request: any, fieldId: string, isStandard: boolean, fieldType?: string) => {
      const value = isStandard ? request[fieldId] : request.customFields?.[fieldId];
      if (value === undefined || value === null) return '-';
      
      if (fieldId === 'status') {
          return <StatusBadge statusName={String(value)} />;
      }

      if (fieldId === 'urgency') {
          const val = String(value);
          let colorClass = 'text-gray-300';
          if (val === 'Alta') colorClass = 'text-red-500 font-bold';
          else if (val === 'Normal') colorClass = 'text-yellow-500 font-bold';
          else if (val === 'Baixa') colorClass = 'text-green-500 font-bold';
          return <span className={colorClass}>{val}</span>;
      }

      if (fieldId === 'deliveryDate') {
           if (request.status === 'Entregue') return <span className="text-gray-300">{formatDate(value)}</span>;
           
           const today = new Date();
           today.setHours(0, 0, 0, 0);
           const target = new Date(value);
           target.setHours(0, 0, 0, 0);
           
           const diffTime = target.getTime() - today.getTime();
           const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
           
           let dateColorClass = 'text-gray-300';
           let icon = null;

           if (diffDays < 0) {
               dateColorClass = 'text-red-500 font-bold';
               icon = <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
           } else if (diffDays <= 5) {
               dateColorClass = 'text-yellow-500 font-bold';
           } else if (diffDays > 5) {
               dateColorClass = 'text-green-500 font-bold';
           }

           return (
               <span className={`${dateColorClass} flex items-center gap-1`}>
                   {icon}
                   {formatDate(value)}
               </span>
           );
      }

      if (fieldId === 'description') {
           return (
               <span className="block max-w-xs truncate text-gray-300" title={String(value)}>
                   {String(value)}
               </span>
           )
      }

      if (fieldId === 'orderNumber') {
          return <span className="font-bold text-white">{value}</span>;
      }

      if (fieldType === 'date' || fieldId === 'requestDate') {
           return <span className="text-gray-300">{formatDate(value)}</span>;
      }

      return <span className="text-gray-300">{value}</span>;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-gray-400 mt-1">
             {hasFullVisibility 
                ? 'Visão geral operacional de todas as áreas.' 
                : `Painel de controle do setor ${user?.sector}.`}
          </p>
        </div>
        <div className="text-right hidden md:block">
            <p className="text-sm text-gray-400">Última atualização</p>
            <p className="text-white font-mono text-sm">{new Date().toLocaleTimeString()}</p>
        </div>
      </div>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            title="Total Geral" 
            value={total} 
            colorName="blue"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>} 
        />
        {statuses.map((status) => (
            <StatCard 
                key={status.id}
                title={status.name} 
                value={statusCounts[status.name] || 0} 
                colorName={status.color}
                icon={getStatusIcon(status.color)} 
            />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gráfico Mensal */}
          <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-bold text-white flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path></svg>
                    Volume de Solicitações
                </h3>
              </div>
              
              <div className="relative h-64 w-full pl-8 pb-6 select-none">
                  <div className="absolute inset-0 flex flex-col justify-between text-xs text-gray-500 font-mono">
                      {yAxisSteps.map((step, i) => (
                          <div key={i} className="relative flex items-center w-full h-0">
                               <span className="absolute -left-8 w-6 text-right">{Math.round(step)}</span>
                               <div className="w-full border-t border-zinc-700/50 border-dashed"></div>
                          </div>
                      ))}
                  </div>

                  <div className="absolute inset-x-0 bottom-0 top-0 flex items-end justify-around px-2 z-10 pt-2">
                      {monthlyStats.map((stat, index) => {
                          const heightPercentage = Math.round((stat.count / yAxisMax) * 100);
                          const urgentPercentage = stat.count > 0 ? (stat.urgentCount / stat.count) * 100 : 0;
                          const normalPercentage = 100 - urgentPercentage;
                          const isHovered = hoveredMonth === index;
                          
                          return (
                              <div 
                                key={index} 
                                className="flex flex-col items-center flex-1 h-full justify-end group relative"
                                onMouseEnter={() => setHoveredMonth(index)}
                                onMouseLeave={() => setHoveredMonth(null)}
                              >
                                  {/* POPUP DETALHADO POR ÁREA */}
                                  <div className={`absolute bottom-full mb-3 transition-all duration-300 pointer-events-none z-50 ${isHovered ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}>
                                      <div className="bg-zinc-800 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden min-w-[180px]">
                                          <div className="bg-zinc-900/50 px-3 py-2 border-b border-zinc-700">
                                              <p className="text-white text-[11px] font-black uppercase tracking-wider">{stat.fullDate}</p>
                                              <div className="flex justify-between mt-1">
                                                  <span className="text-[10px] text-zinc-400">Total: <b className="text-white">{stat.count}</b></span>
                                                  <span className="text-[10px] text-zinc-400">Urgentes: <b className="text-red-400">{stat.urgentCount}</b></span>
                                              </div>
                                          </div>
                                          
                                          <div className="p-2 space-y-1 max-h-[200px] overflow-y-auto scrollbar-thin">
                                              {stat.sectors.length > 0 ? stat.sectors.map((s, idx) => (
                                                  <div key={idx} className="flex justify-between items-center text-[10px] p-1.5 rounded hover:bg-zinc-700/50 transition-colors">
                                                      <span className="text-zinc-200 font-medium truncate max-w-[90px]" title={s.name}>{s.name}</span>
                                                      <div className="text-right shrink-0">
                                                          <span className="text-white font-bold">{s.total}</span>
                                                          {s.urgent > 0 && <span className="text-red-400 ml-1">({s.urgent})</span>}
                                                      </div>
                                                  </div>
                                              )) : (
                                                  <p className="text-center text-[10px] text-zinc-500 py-2">Sem registros</p>
                                              )}
                                          </div>
                                          
                                          <div className="bg-zinc-800 p-1 text-center">
                                              <div className="w-2 h-2 bg-zinc-800 border-r border-b border-zinc-700 transform rotate-45 mx-auto -mb-2"></div>
                                          </div>
                                      </div>
                                  </div>

                                  <div className="relative w-full max-w-[24px] sm:max-w-[40px] flex flex-col justify-end h-full">
                                      <div 
                                          style={{ height: `${heightPercentage}%` }} 
                                          className={`w-full rounded-t-sm transition-all duration-500 ease-out flex flex-col justify-end overflow-hidden ${stat.count === 0 ? 'bg-zinc-800 h-1' : 'shadow-[0_0_15px_rgba(59,130,246,0.1)]'}`}
                                      >
                                          {stat.count > 0 && stat.urgentCount > 0 && (
                                              <div 
                                                style={{ height: `${urgentPercentage}%` }} 
                                                className={`w-full bg-red-600 transition-all duration-300 ${isHovered ? 'brightness-125' : ''}`}
                                              ></div>
                                          )}
                                          {stat.count > 0 && (
                                              <div 
                                                style={{ height: `${normalPercentage}%` }} 
                                                className={`w-full bg-gradient-to-t from-blue-700 via-blue-600 to-indigo-500 transition-all duration-300 ${isHovered ? 'brightness-125' : ''}`}
                                              ></div>
                                          )}
                                      </div>
                                  </div>
                                  <span className={`text-[10px] mt-3 font-bold uppercase transition-colors ${isHovered ? 'text-white' : 'text-gray-500'}`}>
                                      {stat.name.split('/')[0]}
                                  </span>
                              </div>
                          );
                      })}
                  </div>
              </div>
              <div className="mt-4 flex justify-center gap-6 text-[10px] uppercase font-bold tracking-widest text-zinc-500">
                  <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span>Normal</span>
                  </div>
                  <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      <span>Urgente</span>
                  </div>
              </div>
          </div>

          {/* Gráfico por Setor */}
          <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg flex flex-col">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>
                  Top Setores / Urgência
              </h3>
              
              <div className="flex-grow flex flex-col justify-center space-y-5">
                  {sectorStats.length > 0 ? sectorStats.map((stat, index) => {
                      const widthPercentage = Math.round((stat.total / maxSectorCount) * 100);
                      const urgentPercentage = stat.total > 0 ? Math.round((stat.urgent / stat.total) * 100) : 0;
                      
                      return (
                          <div key={index} className="group">
                              <div className="flex justify-between items-end mb-1">
                                  <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors truncate max-w-[50%]">
                                      {stat.name}
                                  </span>
                                  <div className="text-right">
                                      <span className="text-sm font-bold text-white mr-1">
                                          {stat.total} / <span className="text-red-400">{stat.urgent}</span>
                                      </span>
                                      <span className="text-xs text-gray-500">({urgentPercentage}%)</span>
                                  </div>
                              </div>
                              <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden shadow-inner relative">
                                  <div 
                                      className="h-full absolute top-0 left-0 rounded-l-full bg-zinc-600" 
                                      style={{ width: `${widthPercentage}%` }}
                                  >
                                        <div 
                                            className="h-full absolute top-0 left-0 bg-red-600 transition-all duration-1000 ease-out"
                                            style={{ width: `${urgentPercentage}%` }}
                                        ></div>
                                  </div>
                              </div>
                          </div>
                      );
                  }) : (
                      <div className="text-center text-gray-500 py-10">
                          <p>Nenhum dado disponível.</p>
                      </div>
                  )}
              </div>
          </div>
      </div>

      {/* Solicitações Recentes */}
       <div className="bg-zinc-900 shadow-lg rounded-xl overflow-hidden border border-zinc-800">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-800/20">
            <h2 className="text-lg font-bold text-white flex items-center">
                 <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 Solicitações Recentes
            </h2>
            <Button as="link" to="/requests" variant="secondary" className="text-xs !py-1.5">Ver Todas</Button>
        </div>
        
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-800">
                <thead className="bg-zinc-900">
                    <tr>
                         {visibleColumns.map(field => (
                             <th key={field.id} scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                {field.label}
                            </th>
                        ))}
                        <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider"></th>
                    </tr>
                </thead>
                 <tbody className="divide-y divide-zinc-800 bg-zinc-900/50">
                    {recentRequests.length > 0 ? recentRequests.map((request) => {
                        return (
                        <tr key={request.id} className="hover:bg-zinc-800 transition-colors group">
                             {visibleColumns.map(field => (
                                <td key={`${request.id}-${field.id}`} className="px-6 py-4 whitespace-nowrap text-sm">
                                     {getCellValue(request, field.id, field.isStandard, field.type)}
                                </td>
                            ))}
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Link to={`/requests/${request.id}`} className="text-blue-400 hover:text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Detalhes &rarr;
                                </Link>
                            </td>
                        </tr>
                        );
                    }) : (
                        <tr>
                            <td colSpan={visibleColumns.length + 1} className="text-center py-12 text-gray-500">
                                <p>Nenhuma solicitação encontrada recentemente.</p>
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
