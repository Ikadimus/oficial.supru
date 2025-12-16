
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useRequests } from '../contexts/RequestContext';
import { useAuth } from '../contexts/AuthContext';

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
    if (!dateString) return '';
    if (dateString.includes('/') && dateString.length === 10) return dateString;
    try {
        const [year, month, day] = dateString.split('-');
        if (!day || !month || !year) return dateString;
        return `${day}/${month}/${year}`;
    } catch (e) {
        return dateString;
    }
}


const RequestListPage: React.FC = () => {
  const { requests, loading, formFields } = useRequests();
  const { user, isPrivilegedUser, hasFullVisibility } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para ordenação
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  if (loading) {
    return <div className="text-center p-10 text-gray-400">Carregando solicitações...</div>;
  }

  // Filter requests based on search term (Deep Search) AND User Permission
  const filteredRequests = requests.filter(request => {
      // 1. Permissão: Se não tem visibilidade total, só vê setor
      if (!hasFullVisibility && request.sector !== user?.sector) {
          return false;
      }

      // Se não tem termo de busca, passa (se passou na permissão)
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();

      // 2. Verifica campos padrão principais
      const mainFieldsToCheck = [
          request.orderNumber,
          request.description,
          request.supplier,
          request.responsible,
          request.sector,
          request.status,
          request.urgency, // Incluído na busca
          request.requestDate,
          request.deliveryDate,
          request.purchaseOrderDate
      ];

      const matchesMain = mainFieldsToCheck.some(val => 
          val && String(val).toLowerCase().includes(term)
      );
      if (matchesMain) return true;

      // 3. Verifica dentro dos Itens (Nome e Status)
      if (request.items && request.items.length > 0) {
          const matchesItems = request.items.some(item => 
              (item.name && item.name.toLowerCase().includes(term)) ||
              (item.status && item.status.toLowerCase().includes(term))
          );
          if (matchesItems) return true;
      }

      // 4. Verifica Campos Personalizados
      if (request.customFields) {
          const matchesCustom = Object.values(request.customFields).some(val => 
              val && String(val).toLowerCase().includes(term)
          );
          if (matchesCustom) return true;
      }

      return false;
  });
  
  // Função para lidar com a ordenação
  const sortedRequests = useMemo(() => {
    let sortableItems = [...filteredRequests];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        // Encontra a definição do campo para saber se é padrão ou customizado
        const field = formFields.find(f => f.id === sortConfig.key);
        const isStandard = field ? field.isStandard : true; // Fallback to standard if field not found in definitions but key exists (e.g. id)

        let aValue = isStandard ? (a as any)[sortConfig.key] : a.customFields?.[sortConfig.key];
        let bValue = isStandard ? (b as any)[sortConfig.key] : b.customFields?.[sortConfig.key];

        // Trata nulos/undefined
        if (aValue === undefined || aValue === null) aValue = '';
        if (bValue === undefined || bValue === null) bValue = '';

        // Tenta comparar como número se possível
        const aNum = parseFloat(aValue);
        const bNum = parseFloat(bValue);

        // Se ambos forem números válidos e a string original não estiver vazia, compara numericamente
        if (!isNaN(aNum) && !isNaN(bNum) && String(aValue).trim() !== '' && String(bValue).trim() !== '') {
             if (aNum < bNum) return sortConfig.direction === 'asc' ? -1 : 1;
             if (aNum > bNum) return sortConfig.direction === 'asc' ? 1 : -1;
             return 0;
        }

        // Comparação de Strings
        const aString = String(aValue).toLowerCase();
        const bString = String(bValue).toLowerCase();

        if (aString < bString) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aString > bString) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredRequests, sortConfig, formFields]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: string) => {
      if (!sortConfig || sortConfig.key !== key) return <span className="text-gray-600 ml-1">⇅</span>;
      return sortConfig.direction === 'asc' ? <span className="text-blue-400 ml-1">↑</span> : <span className="text-blue-400 ml-1">↓</span>;
  }

  // Get columns that should be visible in the list
  const visibleColumns = formFields.filter(f => f.isVisibleInList !== false);

  const getCellValue = (request: any, fieldId: string, isStandard: boolean, fieldType: string, isUrgent: boolean) => {
      const value = isStandard ? request[fieldId] : request.customFields?.[fieldId];
      if (value === undefined || value === null) return '-';
      
      const textColorClass = isUrgent ? "text-red-400 font-bold" : "text-gray-300";

      if (fieldId === 'status') {
          return <StatusBadge statusName={value} />;
      }
      if (fieldType === 'date' || fieldId === 'requestDate' || fieldId === 'deliveryDate' || fieldId === 'purchaseOrderDate') {
          return <span className={textColorClass}>{formatDate(value)}</span>;
      }
      return <span className={textColorClass}>{value}</span>;
  };

  return (
    <div className="bg-zinc-900 shadow-xl rounded-lg overflow-hidden border border-zinc-800">
        <div className="p-6 border-b border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h1 className="text-2xl font-bold text-white">
                {hasFullVisibility ? 'Todas as Solicitações' : `Solicitações: ${user?.sector}`}
            </h1>
            
            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                </div>
                <input
                    type="text"
                    className="bg-zinc-800 border border-zinc-700 text-gray-100 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 placeholder-gray-500"
                    placeholder="Pesquisar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
        
        {sortedRequests.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
                <p>{searchTerm ? 'Nenhuma solicitação encontrada para a pesquisa.' : 'Nenhuma solicitação encontrada neste setor.'}</p>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-zinc-800">
                    <thead className="bg-zinc-800/50">
                        <tr>
                            {/* Dynamically render headers with Sorting */}
                            {visibleColumns.map(field => (
                                <th 
                                    key={field.id} 
                                    scope="col" 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-zinc-800 select-none transition-colors"
                                    onClick={() => requestSort(field.id)}
                                >
                                    <div className="flex items-center">
                                        {field.label}
                                        {getSortIndicator(field.id)}
                                    </div>
                                </th>
                            ))}
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {sortedRequests.map((request) => {
                            const isUrgent = request.urgency === 'Alta';
                            const rowClass = isUrgent ? "bg-red-900/10 hover:bg-red-900/20" : "hover:bg-zinc-800/50";

                            return (
                                <tr key={request.id} className={`${rowClass} transition-colors`}>
                                    {/* Dynamically render cells */}
                                    {visibleColumns.map(field => (
                                        <td key={`${request.id}-${field.id}`} className="px-6 py-4 whitespace-nowrap text-sm">
                                            {field.id === 'orderNumber' ? (
                                                <div className="flex items-center">
                                                    {isUrgent && (
                                                        <span className="text-red-500 font-bold text-lg mr-2" title="Urgência Alta">!</span>
                                                    )}
                                                    <span className={`font-medium ${isUrgent ? 'text-red-400' : 'text-white'}`}>
                                                        {getCellValue(request, field.id, field.isStandard, field.type, isUrgent)}
                                                    </span>
                                                </div>
                                            ) : (
                                                getCellValue(request, field.id, field.isStandard, field.type, isUrgent)
                                            )}
                                        </td>
                                    ))}
                                    
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link to={`/requests/${request.id}`} className="text-blue-400 hover:text-blue-300">
                                            Ver Detalhes
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        )}
    </div>
  );
};

export default RequestListPage;
