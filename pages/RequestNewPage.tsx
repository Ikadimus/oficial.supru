
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequests } from '../contexts/RequestContext';
import { useAuth } from '../contexts/AuthContext';
import { Request, RequestItem } from '../types';
import Button from '../components/ui/Button';

const RequestNewPage: React.FC = () => {
  const navigate = useNavigate();
  const { addRequest, formFields, statuses } = useRequests();
  const { users, sectors, user } = useAuth();
  
  const [requestData, setRequestData] = useState<Partial<Request>>({
    orderNumber: `PED-${Date.now().toString().slice(-6)}`,
    requestDate: new Date().toISOString().slice(0, 10),
    sector: user?.sector || '',
    requester: user?.name || '',
    supplier: '',
    description: '',
    urgency: 'Normal',
    forecastDate: '', 
    deliveryDate: '', 
    purchaseOrderDate: '',
    status: statuses[0]?.name || 'Pendente',
    responsible: '',
    items: [],
    customFields: {},
  });
  
  const [items, setItems] = useState<RequestItem[]>([]);
  const [newItem, setnewItem] = useState({ name: '', quantity: 1, status: statuses[0]?.name || 'Pendente' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const isStandardField = formFields.find(f => f.id === name)?.isStandard;

    if (isStandardField) {
      // Atualiza o dado no estado
      setRequestData(prev => ({ ...prev, [name]: value }));

      // GATILHO DO POPUP: Verificamos o ID do campo diretamente do evento
      if (name === 'deliveryDate' && value) {
        // Usamos setTimeout para não travar o render do input antes de abrir o popup
        setTimeout(() => {
          const confirmStatus = window.confirm("Você preencheu a Data de Entrega. Gostaria de alterar o status desta solicitação para 'Entregue'?");
          if (confirmStatus) {
            setRequestData(prev => ({ ...prev, status: 'Entregue' }));
          }
        }, 150);
      }
    } else {
      setRequestData(prev => ({
        ...prev,
        customFields: { ...prev.customFields, [name]: value },
      }));
    }
  };

  const handleNewItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setnewItem({ ...newItem, [name]: name === 'quantity' ? parseInt(value, 10) : value });
  };

  const handleAddItem = () => {
    if (newItem.name && newItem.quantity > 0) {
      setItems([...items, { ...newItem, id: `item-${Date.now()}` }]);
      setnewItem({ name: '', quantity: 1, status: statuses[0]?.name || 'Pendente' });
    }
  };

  const handleRemoveItem = (id: string) => setItems(items.filter(item => item.id !== id));
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addRequest({ ...requestData, items } as Omit<Request, 'id'>);
    navigate('/requests');
  };

  const sortedFields = [...formFields]
    .filter(f => f.isActive)
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  
  return (
    <div className="bg-zinc-900 shadow-xl rounded-lg overflow-hidden border border-zinc-800">
      <div className="p-6 border-b border-zinc-800">
        <h1 className="text-2xl font-bold text-white">Nova Solicitação</h1>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedFields.map(field => {
            const value = (field.isStandard ? (requestData as any)[field.id] : requestData.customFields?.[field.id]) ?? '';
            
            if (field.type === 'select') {
                let options: string[] = [];
                if (field.id === 'status') options = statuses.map(s => s.name);
                if (field.id === 'sector') options = sectors.map(s => s.name);
                if (field.id === 'responsible' || field.id === 'requester') options = users.map(u => u.name);
                if (field.id === 'urgency') options = ['Alta', 'Normal', 'Baixa'];
                
                return (
                     <div key={field.id}>
                        <label className="block text-sm font-medium text-gray-400 mb-1">{field.label}</label>
                        <select
                          name={field.id}
                          value={value}
                          onChange={handleInputChange}
                          required={field.required}
                          className="w-full bg-gray-800 border-gray-600 text-gray-100 rounded-md py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Selecione...</option>
                            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                );
            }

            return (
              <div key={field.id} className={field.type === 'textarea' || field.id === 'description' ? 'col-span-1 md:col-span-2' : ''}>
                <label className="block text-sm font-medium text-gray-400 mb-1">{field.label}</label>
                {field.type === 'textarea' || field.id === 'description' ? (
                  <textarea
                    name={field.id}
                    value={value}
                    onChange={handleInputChange}
                    required={field.required}
                    rows={4}
                    className="w-full bg-gray-800 border-gray-600 text-gray-100 rounded-md py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <input
                    type={field.type}
                    name={field.id}
                    value={value}
                    onChange={handleInputChange}
                    required={field.required}
                    className="w-full bg-gray-800 border-gray-600 text-gray-100 rounded-md py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="p-6 border-t border-zinc-800">
          <h3 className="text-lg font-medium text-white mb-4">Itens da Solicitação</h3>
          <div className="space-y-2 mb-4">
            {items.map(item => (
              <div key={item.id} className="flex items-center justify-between p-2 bg-zinc-800 rounded-md border border-zinc-700">
                <span className="text-sm text-gray-200">{item.name} ({item.quantity}x)</span>
                <button type="button" onClick={() => handleRemoveItem(item.id)} className="text-red-400 hover:text-red-300 text-xs font-bold">Remover</button>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 border border-dashed border-zinc-700 rounded-lg">
            <input type="text" placeholder="Item" name="name" value={newItem.name} onChange={handleNewItemChange} className="bg-gray-800 border-gray-600 rounded-md text-sm p-2 text-white" />
            <input type="number" placeholder="Qtd" name="quantity" value={newItem.quantity} onChange={handleNewItemChange} className="bg-gray-800 border-gray-600 rounded-md text-sm p-2 text-white" min="1" />
            <select name="status" value={newItem.status} onChange={handleNewItemChange} className="bg-gray-800 border-gray-600 rounded-md text-sm p-2 text-white">
                {statuses.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
            <Button type="button" variant="secondary" onClick={handleAddItem}>Adicionar</Button>
          </div>
        </div>

        <div className="p-6 bg-zinc-800/50 flex justify-end space-x-3">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancelar</Button>
          <Button type="submit" className="!bg-blue-600 hover:!bg-blue-700">Criar Solicitação</Button>
        </div>
      </form>
    </div>
  );
};

export default RequestNewPage;
