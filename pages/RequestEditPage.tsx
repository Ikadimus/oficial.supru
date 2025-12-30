
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
  const { getRequestById, updateRequest, formFields, statuses, loading } = useRequests();
  const { users, sectors, user } = useAuth();
  
  const [requestData, setRequestData] = useState<Partial<Request> | null>(null);
  const [initialData, setInitialData] = useState<Partial<Request> | null>(null);
  const [items, setItems] = useState<RequestItem[]>([]);
  const [newItem, setNewItem] = useState({ name: '', quantity: 1, status: statuses[0]?.name || 'Pendente' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const requestId = Number(id);
    if (requestId && !requestData) {
        const req = getRequestById(requestId);
        if (req) {
            setRequestData(JSON.parse(JSON.stringify(req)));
            setInitialData(JSON.parse(JSON.stringify(req)));
            setItems(JSON.parse(JSON.stringify(req.items || [])));
        }
    }
  }, [id, getRequestById, requestData]);

  if (loading && !requestData) return <div className="text-center p-10 text-gray-400">Carregando dados...</div>;
  if (!requestData || !initialData) return <NotFoundPage />;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const isStandardField = formFields.find(f => f.id === name)?.isStandard;
    
    if (isStandardField) {
        setRequestData(prev => {
            if (!prev) return null;
            const updated = { ...prev, [name]: value };
            
            // Lógica automática silenciosa: se preencher a data de entrega, muda status para Entregue
            if (name === 'deliveryDate' && value) {
                updated.status = 'Entregue';
            }
            
            return updated;
        });
    } else {
        setRequestData(prev => prev ? { 
            ...prev, 
            customFields: { ...prev.customFields, [name]: value } 
        } : null);
    }
  };
  
  const handleAddItem = () => {
    if (newItem.name) {
      setItems([...items, { ...newItem, id: `item-${Date.now()}` }]);
      setNewItem({ name: '', quantity: 1, status: statuses[0]?.name || 'Pendente' });
    }
  };

  const handleRemoveItem = (id: string) => setItems(items.filter(i => i.id !== id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestData.id || !initialData) return;
    setIsSaving(true);

    const history: RequestHistoryEntry[] = requestData.history || [];
    const now = new Date().toISOString();
    
    formFields.forEach(f => {
        const oldVal = f.isStandard ? (initialData as any)[f.id] : initialData.customFields?.[f.id];
        const newVal = f.isStandard ? (requestData as any)[f.id] : requestData.customFields?.[f.id];
        if (String(oldVal || '').trim() !== String(newVal || '').trim()) {
            history.push({ 
                date: now, 
                user: user?.name || 'Sistema', 
                field: f.label, 
                oldValue: String(oldVal || '(vazio)'), 
                newValue: String(newVal || '(vazio)') 
            });
        }
    });

    try {
        await updateRequest(requestData.id, { ...requestData, items, history });
        navigate(`/requests/${requestData.id}`, { replace: true });
    } catch (err) {
        setIsSaving(false);
        console.error("Erro ao salvar:", err);
    }
  };

  const sortedFields = [...formFields]
    .filter(f => f.isActive)
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

  return (
    <div className="bg-zinc-900 shadow-xl rounded-lg border border-zinc-800">
      <div className="p-6 border-b border-zinc-800">
        <h1 className="text-2xl font-bold text-white">Editar Solicitação: {requestData.orderNumber}</h1>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedFields.map(field => {
            const value = (field.isStandard ? (requestData as any)[field.id] : requestData.customFields?.[field.id]) ?? '';
            return (
              <div key={field.id} className={field.type === 'textarea' || field.id === 'description' ? 'col-span-2' : ''}>
                <label className="text-sm font-medium text-gray-400 mb-1 block">{field.label}</label>
                {field.type === 'select' ? (
                   <select 
                     name={field.id} 
                     value={value} 
                     onChange={handleInputChange} 
                     className="w-full bg-gray-800 text-white rounded-md p-2 text-sm border-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
                   >
                      <option value="">Selecione...</option>
                      {(field.id === 'status' ? statuses.map(s => s.name) : 
                        field.id === 'sector' ? sectors.map(s => s.name) :
                        field.id === 'urgency' ? ['Alta', 'Normal', 'Baixa'] :
                        users.map(u => u.name)).map(o => <option key={o} value={o}>{o}</option>)}
                   </select>
                ) : (
                   <input 
                     type={field.type} 
                     name={field.id} 
                     value={value} 
                     onChange={handleInputChange} 
                     className="w-full bg-gray-800 text-white rounded-md p-2 text-sm border-gray-600 outline-none focus:ring-2 focus:ring-blue-500" 
                   />
                )}
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-end space-x-3 pt-4 border-t border-zinc-800">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancelar</Button>
          <Button type="submit" disabled={isSaving} className="!bg-blue-600">
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RequestEditPage;
