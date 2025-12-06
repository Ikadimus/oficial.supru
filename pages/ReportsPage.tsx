
import React, { useState } from 'react';
import { useRequests } from '../contexts/RequestContext';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import * as XLSX from 'xlsx';
import { Navigate } from 'react-router-dom';

const ReportsPage: React.FC = () => {
  const { requests, formFields } = useRequests();
  const { hasFullVisibility } = useAuth();
  
  // Datas iniciais: Primeiro dia do mês atual e data de hoje
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

  const [startDate, setStartDate] = useState(firstDay.toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(today.toISOString().slice(0, 10));
  
  // Estado para as colunas selecionadas (começa com todas selecionadas)
  const [selectedColumnIds, setSelectedColumnIds] = useState<string[]>(
    formFields.map(f => f.id).concat(['items']) // Adiciona 'items' manualmente pois não é um formField
  );

  if (!hasFullVisibility) {
      return <Navigate to="/" replace />;
  }

  const handleToggleColumn = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedColumnIds(prev => [...prev, id]);
    } else {
      setSelectedColumnIds(prev => prev.filter(colId => colId !== id));
    }
  };

  const handleSelectAll = () => {
    setSelectedColumnIds(formFields.map(f => f.id).concat(['items']));
  }
  
  const handleDeselectAll = () => {
    setSelectedColumnIds([]);
  }

  const generateExcel = () => {
    // 1. Filtrar por data
    const filteredRequests = requests.filter(req => {
        if (!req.requestDate) return false;
        return req.requestDate >= startDate && req.requestDate <= endDate;
    });

    if (filteredRequests.length === 0) {
        alert("Nenhuma solicitação encontrada no período selecionado.");
        return;
    }

    // 2. Mapear dados baseado nas colunas selecionadas
    const dataToExport = filteredRequests.map(req => {
        const row: any = {};
        
        // Colunas dinâmicas
        formFields.forEach(field => {
            if (selectedColumnIds.includes(field.id)) {
                let value = field.isStandard 
                    ? (req as any)[field.id] 
                    : req.customFields?.[field.id];
                
                // Formatação básica
                if (value === undefined || value === null) value = '';
                row[field.label] = value;
            }
        });

        // Coluna Especial: Itens
        if (selectedColumnIds.includes('items')) {
            const itemsString = req.items
                .map(item => `${item.quantity}x ${item.name} (${item.status})`)
                .join('; \n');
            row['Itens da Solicitação'] = itemsString;
        }

        return row;
    });

    // 3. Gerar Planilha
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Solicitações");

    // 4. Download
    XLSX.writeFile(workbook, `Relatorio_Suprimentos_${startDate}_a_${endDate}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Relatórios Gerenciais</h1>
        <p className="text-gray-400">Exporte dados das solicitações para planilhas do Excel.</p>
      </div>

      <div className="bg-zinc-900 shadow-xl rounded-lg p-6 border border-zinc-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Data Inicial</label>
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-600 rounded p-2 text-white"
                  />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Data Final</label>
                   <input 
                    type="date" 
                    value={endDate} 
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-600 rounded p-2 text-white"
                  />
              </div>
          </div>

          <div className="mb-8">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-white">Selecionar Colunas</h3>
                <div className="space-x-2 text-sm">
                    <button onClick={handleSelectAll} className="text-blue-400 hover:text-blue-300">Marcar Todas</button>
                    <span className="text-gray-600">|</span>
                    <button onClick={handleDeselectAll} className="text-blue-400 hover:text-blue-300">Desmarcar Todas</button>
                </div>
             </div>
             
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-zinc-800/50 p-4 rounded-lg">
                {formFields.map(field => (
                    <div key={field.id} className="flex items-center">
                        <ToggleSwitch 
                            checked={selectedColumnIds.includes(field.id)}
                            onChange={(checked) => handleToggleColumn(field.id, checked)}
                            label={field.label}
                        />
                    </div>
                ))}
                {/* Checkbox manual para Itens */}
                 <div className="flex items-center">
                        <ToggleSwitch 
                            checked={selectedColumnIds.includes('items')}
                            onChange={(checked) => handleToggleColumn('items', checked)}
                            label="Itens da Solicitação"
                        />
                 </div>
             </div>
          </div>

          <div className="flex justify-end">
             <Button onClick={generateExcel} className="!bg-green-600 hover:!bg-green-700 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                Baixar Relatório (.xlsx)
             </Button>
          </div>
      </div>
    </div>
  );
};

export default ReportsPage;