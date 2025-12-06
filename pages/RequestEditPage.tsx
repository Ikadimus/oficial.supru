
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRequests } from '../contexts/RequestContext';
import { useAuth } from '../contexts/AuthContext';
import { Request, RequestItem, RequestHistoryEntry } from '../types';
import Button from '../components/ui/Button';
import NotFoundPage from './NotFoundPage';

const RequestEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRequestById, updateRequest, formFields, statuses } = useRequests();
  const { users, sectors, user } = useAuth();
  
  const [requestData, setRequestData] = useState<Partial<Request> | null>(null);
  const [initialData, setInitialData] = useState<Partial<Request> | null>(null);
  const [items, setItems] = useState<RequestItem[]>([]);
  const [initialItems, setInitialItems] = useState<RequestItem[]>([]);
  const [newItem, setNewItem] = useState({ name: '', quantity: 1, status: statuses[0]?.name || '' });

  useEffect(() => {
    const requestId = Number(id);
    if (requestId) {
        const requestToEdit = getRequestById(requestId);
        if (requestToEdit) {
            // Cria cópias profundas para evitar referência direta
            const dataCopy = JSON.parse(JSON.stringify(requestToEdit));
            setRequestData(dataCopy);
            setInitialData(JSON.parse(JSON.stringify(requestToEdit)));
            
            const itemsCopy = JSON.parse(JSON.stringify(requestToEdit.items || []));
            setItems(itemsCopy);
            setInitialItems(JSON.parse(JSON.stringify(requestToEdit.items || [])));
        }
    }
  }, [id, getRequestById]);

  if (!requestData || !initialData) {
    return <NotFoundPage />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const field = formFields.find(f => f.id === name);
     if (field?.isStandard) {
        setRequestData({ ...requestData, [name]: value });
    } else {
        setRequestData({
            ...requestData,
            customFields: { ...requestData.customFields, [name]: value },
        });
    }
  };
  
  const handleNewItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewItem({ ...newItem, [name]: name === 'quantity' ? parseInt(value, 10) : value });
  };

  const handleAddItem = () => {
    if (newItem.name && newItem.quantity > 0) {
      const itemToAdd: RequestItem = {
        ...newItem,
        id: `item-${Date.now()}`,
      };
      setItems([...items, itemToAdd]);
      setNewItem({ name: '', quantity: 1, status: statuses[0]?.name || '' });
    }
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (requestData && requestData.id && initialData) {
        // --- Lógica de Auditoria (Diff) ---
        const historyEntries: RequestHistoryEntry[] = requestData.history || [];
        const now = new Date().toISOString();
        const userName = user?.name || 'Desconhecido';
        
        const formatValue = (val: any) => {
            if (val === null || val === undefined) return '';
            return String(val);
        };

        // 1. Verificar Campos
        formFields.forEach(field => {
            if (!field.isActive) return;

            const oldValue = field.isStandard 
                ? (initialData as any)[field.id] 
                : initialData.customFields?.[field.id];
            
            const newValue = field.isStandard 
                ? (requestData as any)[field.id] 
                : requestData.customFields?.[field.id];
            
            if (formatValue(oldValue) !== formatValue(newValue)) {
                historyEntries.push({
                    date: now,
                    user: userName,
                    field: field.label,
                    oldValue: formatValue(oldValue) || '(vazio)',
                    newValue: formatValue(newValue) || '(vazio)'
                });
            }
        });

        // 2. Verificar Itens
        // Simplificação: Compara o JSON string. Se diferente, registra que itens mudaram.
        // Para uma auditoria item a item seria necessário um algoritmo mais complexo de diff de arrays.
        const oldItemsStr = JSON.stringify(initialItems);
        const newItemsStr = JSON.stringify(items);
        
        if (oldItemsStr !== newItemsStr) {
            historyEntries.push({
                date: now,
                user: userName,
                field: 'Itens da Solicitação',
                oldValue: `${initialItems.length} itens`,
                newValue: `${items.length} itens (lista modificada)`
            });
        }

        // Salvar
        updateRequest(requestData.id, { ...requestData, items, history: historyEntries });
        navigate(`/requests/${requestData.id}`, { replace: true });
    }
  };

  const activeFields = formFields.filter(f => f.isActive);
  
  return (
    <div className="bg-zinc-900 shadow-xl rounded-lg overflow-hidden border border-zinc-800">
      <div className="p-6 border-b border-zinc-800">
        <h1 className="text-2xl font-bold text-white">Editar Solicitação: {requestData.orderNumber}</h1>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeFields.map(field => {
            const value = (field.isStandard ? (requestData as any)[field.id] : requestData.customFields?.[field.id]) ?? '';
            
            if (field.type === 'select') {
                let options: string[] = [];
                if (field.id === 'status') options = statuses.map(s => s.name);
                if (field.id === 'sector') options = sectors.map(s => s.name);
                // Preenche opções de usuários tanto para Responsável quanto para Solicitante
                if (field.id === 'responsible' || field.id === 'requester') options = users.map(u => u.name);
                
                return (
                     <div key={field.id}>
                        <label htmlFor={field.id} className="block text-sm font-medium text-gray-300">{field.label}</label>
                        <select
                          id={String(field.id)}
                          name={String(field.id)}
                          value={value}
                          onChange={handleInputChange}
                          required={field.required}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-gray-800 text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                            <option value="">Selecione...</option>
                            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                );
            }
            
            // Tratamento especial para Textarea (mas sem o botão de timestamp manual agora)
            if (field.id === 'description' || field.type === 'textarea') {
                return (
                    <div key={field.id} className="col-span-1 md:col-span-2">
                        <label htmlFor={field.id} className="block text-sm font-medium text-gray-300">{field.label}</label>
                        <textarea
                            id={String(field.id)}
                            name={String(field.id)}
                            value={value}
                            onChange={handleInputChange}
                            required={field.required}
                            rows={6}
                            className="mt-1 block w-full px-3 py-2 border border-gray-600 bg-gray-800 placeholder-gray-500 text-gray-100 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono text-sm leading-relaxed"
                            placeholder="Descreva a solicitação..."
                        />
                    </div>
                );
            }
            
            return (
              <div key={field.id}>
                <label htmlFor={field.id} className="block text-sm font-medium text-gray-300">{field.label}</label>
                <input
                  type={field.type}
                  id={String(field.id)}
                  name={String(field.id)}
                  value={value}
                  onChange={handleInputChange}
                  required={field.required}
                  className="mt-1 block w-full px-3 py-2 border border-gray-600 bg-gray-800 placeholder-gray-500 text-gray-100 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            );
          })}
        </div>

        <div className="p-6 border-t border-zinc-800">
          <h3 className="text-lg font-medium text-white mb-4">Itens da Solicitação</h3>
           <div className="space-y-4 mb-4">
            {items.map(item => (
              <div key={item.id} className="flex items-center space-x-4 p-3 bg-zinc-800/50 rounded-md">
                <span className="flex-grow text-sm text-gray-200">{item.name} ({item.quantity}x) - {item.status}</span>
                <button type="button" onClick={() => handleRemoveItem(item.id)} className="text-red-400 hover:text-red-300">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-end space-x-2 p-3 border border-dashed border-zinc-700 rounded-md">
            <div className="flex-grow">
              <label className="text-sm font-medium text-gray-300">Nome do Item</label>
              <input type="text" name="name" value={newItem.name} onChange={handleNewItemChange} className="mt-1 w-full bg-gray-800 border-gray-600 rounded-md text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Qtd.</label>
              <input type="number" name="quantity" value={newItem.quantity} onChange={handleNewItemChange} className="mt-1 w-20 bg-gray-800 border-gray-600 rounded-md text-sm" min="1"/>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Status</label>
              <select name="status" value={newItem.status} onChange={handleNewItemChange} className="mt-1 w-full bg-gray-800 border-gray-600 rounded-md text-sm">
                {statuses.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <Button type="button" variant="secondary" onClick={handleAddItem}>Adicionar</Button>
          </div>
        </div>
        
        <div className="p-6 bg-zinc-800/50 flex justify-end space-x-2">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancelar</Button>
          <Button type="submit">Salvar Alterações</Button>
        </div>
      </form>
    </div>
  );
};

export default RequestEditPage;