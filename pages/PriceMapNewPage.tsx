
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequests } from '../contexts/RequestContext';
import { useAuth } from '../contexts/AuthContext';
import { PriceMapItem, SupplierOffer } from '../types';
import Button from '../components/ui/Button';

const PriceMapNewPage: React.FC = () => {
    const navigate = useNavigate();
    const { addPriceMap, suppliers } = useRequests();
    const { user } = useAuth();

    const [title, setTitle] = useState('');
    const [items, setItems] = useState<PriceMapItem[]>([]);
    const [newItem, setNewItem] = useState({ description: '', unit: 'UN', quantity: 1 });
    const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);

    const handleAddItem = () => {
        if (newItem.description) {
            setItems([...items, { ...newItem, id: `item-${Date.now()}` }]);
            setNewItem({ description: '', unit: 'UN', quantity: 1 });
        }
    };

    const handleToggleSupplier = (id: string) => {
        setSelectedSuppliers(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (items.length === 0 || selectedSuppliers.length === 0) return alert("Adicione itens e fornecedores.");

        const offers: SupplierOffer[] = selectedSuppliers.map(sid => {
            const s = suppliers.find(sup => sup.id === sid);
            return {
                supplierId: sid,
                supplierName: s?.name || 'Fornecedor',
                freight: 0,
                deliveryDeadline: 0,
                prices: {} // Inicialmente vazio
            };
        });

        await addPriceMap({
            title,
            date: new Date().toISOString().slice(0, 10),
            status: 'Aberta',
            items,
            offers,
            responsible: user?.name || 'Admin'
        });

        navigate('/pricemaps');
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter">Criar Novo Mapa de Coleta</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Título da Cotação / Referência</label>
                    <input 
                        required 
                        type="text" 
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Ex: Reforma da Planta Caieiras - Set/2023"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Itens */}
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                        <h3 className="text-sm font-bold text-white mb-4">1. Adicionar Itens</h3>
                        <div className="grid grid-cols-6 gap-2 mb-4">
                            <input className="col-span-3 bg-zinc-800 border border-zinc-700 rounded p-2 text-xs text-white" placeholder="Descrição do Produto" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
                            <input className="col-span-1 bg-zinc-800 border border-zinc-700 rounded p-2 text-xs text-white" placeholder="UM" value={newItem.unit} onChange={e => setNewItem({...newItem, unit: e.target.value})} />
                            <input className="col-span-1 bg-zinc-800 border border-zinc-700 rounded p-2 text-xs text-white" type="number" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: parseInt(e.target.value)})} />
                            <button type="button" onClick={handleAddItem} className="bg-blue-600 text-white rounded font-bold text-xs">+</button>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {items.map(item => (
                                <div key={item.id} className="flex justify-between items-center p-2 bg-zinc-800 rounded text-xs">
                                    <span className="text-white font-medium">{item.description}</span>
                                    <span className="text-zinc-500 font-bold">{item.quantity} {item.unit}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Fornecedores */}
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                        <h3 className="text-sm font-bold text-white mb-4">2. Selecionar Fornecedores Participantes</h3>
                        <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                            {suppliers.map(s => (
                                <label key={s.id} className="flex items-center p-2 bg-zinc-800/50 hover:bg-zinc-800 rounded cursor-pointer transition-colors">
                                    <input 
                                        type="checkbox" 
                                        className="mr-3" 
                                        checked={selectedSuppliers.includes(s.id)}
                                        onChange={() => handleToggleSupplier(s.id)}
                                    />
                                    <div>
                                        <p className="text-xs font-bold text-white">{s.name}</p>
                                        <p className="text-[10px] text-zinc-500">{s.category} | {s.city}/{s.state}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-zinc-800">
                    <Button variant="secondary" onClick={() => navigate(-1)}>Cancelar</Button>
                    <Button type="submit" className="!bg-blue-600 shadow-xl shadow-blue-900/20">Iniciar Coleta de Preços</Button>
                </div>
            </form>
        </div>
    );
};

export default PriceMapNewPage;
