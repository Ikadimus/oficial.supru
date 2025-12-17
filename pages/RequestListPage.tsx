
import React, { useState, useMemo, useEffect } from 'react';
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
        <span className={`px-2 py-0.5 inline-flex text-[10px] leading-4 font-semibold rounded-full ${statusStyles[color]}`}>
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
  const { user, hasFullVisibility } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  
  const visibleColumns = useMemo(() => formFields.filter(f => f.isVisibleInList !== false), [formFields]);

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
      const saved = localStorage.getItem('request_list_column_widths');
      return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
      localStorage.setItem('request_list_column_widths', JSON.stringify(columnWidths));
  }, [columnWidths]);

  const filteredRequests = requests.filter(request => {
      if (!hasFullVisibility && request.sector !== user?.sector) return false;
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const fields = [
          request.orderNumber, 
          request.description, 
          request.supplier, 
          request.responsible, 
          request.sector, 
          request.status, 
          request.urgency
      ];
      return fields.some(val => val && String(val).toLowerCase().includes(term));
  });
  
  const sortedRequests = useMemo(() => {
    let sortableItems = [...filteredRequests];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const field = formFields.find(f => f.id === sortConfig.key);
        const isStandard = field ? field.isStandard : true;
        let aValue = isStandard ? (a as any)[sortConfig.key] : a.customFields?.[sortConfig.key];
        let bValue = isStandard ? (b as any)[sortConfig.key] : b.customFields?.[sortConfig.key];
        if (aValue === undefined || aValue === null) aValue = '';
        if (bValue === undefined || bValue === null) bValue = '';
        const aString = String(aValue).toLowerCase();
        const bString = String(bValue).toLowerCase();
        if (aString < bString) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aString > bString) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredRequests, sortConfig, formFields]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const getCellValue = (request: any, fieldId: string, isStandard: boolean, fieldType: string | undefined) => {
      const value = isStandard ? request[fieldId] : request.customFields?.[fieldId];
      if (value === undefined || value === null || value === '') return '-';
      
      if (fieldId === 'status') return <StatusBadge statusName={value} />;
      
      if (fieldId === 'urgency') {
          const val = String(value);
          let colorClass = 'text-gray-300';
          if (val === 'Alta') colorClass = 'text-red-500 font-bold';
          else if (val === 'Normal') colorClass = 'text-yellow-500 font-bold';
          else if (val === 'Baixa') colorClass = 'text-green-500 font-bold';
          return <span className={colorClass}>{val}</span>;
      }

      if (fieldId === 'description') {
          const text = String(value);
          if (text.length > 35) {
              return text.substring(0, 35) + '...';
          }
          return text;
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
          if (diffDays < 0) dateColorClass = 'text-red-500 font-bold';
          else if (diffDays <= 5) dateColorClass = 'text-yellow-500 font-bold';
          else if (diffDays > 5) dateColorClass = 'text-green-500 font-bold';

          return <span className={dateColorClass}>{formatDate(value)}</span>;
      }

      if (fieldType === 'date' || ['requestDate', 'purchaseOrderDate'].includes(fieldId)) {
          return formatDate(value);
      }
      
      return String(value);
  };

  const handleMouseDown = (fieldId: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      const startX = e.clientX;
      const headerCell = (e.currentTarget as HTMLElement).closest('th');
      if (!headerCell) return;
      
      const startWidth = headerCell.offsetWidth;

      const onMouseMove = (moveEvent: MouseEvent) => {
          const currentX = moveEvent.clientX;
          const newWidth = Math.max(10, startWidth + (currentX - startX)); 
          setColumnWidths(prev => ({ ...prev, [fieldId]: newWidth }));
      };

      const onMouseUp = () => {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
          document.body.style.cursor = 'default';
      };

      document.body.style.cursor = 'col-resize';
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
  };

  if (loading) return <div className="text-center p-10 text-gray-400">Carregando solicitações...</div>;

  return (
    <div className="bg-zinc-900 shadow-xl rounded-lg border border-zinc-800 flex flex-col h-[calc(100vh-90px)]">
        <div className="p-6 border-b border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4 flex-shrink-0">
            <h1 className="text-2xl font-bold text-white">
                {hasFullVisibility ? 'Todas as Solicitações' : `Solicitações: ${user?.sector}`}
            </h1>
            <div className="relative w-full sm:w-64">
                <input
                    type="text"
                    className="bg-zinc-800 border border-zinc-700 text-gray-100 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 placeholder-gray-500"
                    placeholder="Pesquisar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
        
        <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
            <table className="table-fixed divide-y divide-zinc-800" style={{ width: 'max-content', minWidth: '100%' }}>
                <colgroup>
                    {visibleColumns.map(field => (
                        <col key={`col-${field.id}`} style={{ width: columnWidths[field.id] ? `${columnWidths[field.id]}px` : '150px' }} />
                    ))}
                    <col style={{ width: '100px' }} />
                </colgroup>
                <thead className="bg-zinc-800 sticky top-0 z-30">
                    <tr>
                        {visibleColumns.map(field => (
                            <th 
                                key={field.id} 
                                scope="col" 
                                className="px-2 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-tight relative group select-none overflow-hidden bg-zinc-800"
                            >
                                <div 
                                    className="flex items-center cursor-pointer hover:text-white w-full pr-2" 
                                    onClick={() => requestSort(field.id)}
                                >
                                    <span className="truncate block w-full" title={field.label}>{field.label}</span>
                                </div>
                                
                                <div 
                                    onMouseDown={(e) => handleMouseDown(field.id, e)}
                                    className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize z-20 hover:bg-blue-500/50 active:bg-blue-600 transition-colors"
                                />
                            </th>
                        ))}
                        <th scope="col" className="px-2 py-3 text-right text-[11px] font-bold text-gray-400 uppercase tracking-tight w-[100px] bg-zinc-800">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 bg-zinc-900/30">
                    {sortedRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-zinc-800/50 transition-colors">
                            {visibleColumns.map(field => (
                                <td 
                                    key={`${request.id}-${field.id}`} 
                                    className="px-2 py-3 whitespace-nowrap text-[13px] text-gray-300 overflow-hidden"
                                >
                                    <div 
                                        className="truncate block w-full" 
                                        title={field.id !== 'description' ? String((field.isStandard ? (request as any)[field.id] : request.customFields?.[field.id]) || '') : undefined}
                                    >
                                        {getCellValue(request, field.id, field.isStandard, field.type)}
                                    </div>
                                </td>
                            ))}
                            <td className="px-2 py-3 whitespace-nowrap text-right text-[12px] font-medium">
                                <Link to={`/requests/${request.id}`} className="text-blue-400 hover:text-blue-300">Ver</Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default RequestListPage;
