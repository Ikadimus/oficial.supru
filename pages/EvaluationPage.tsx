
import React, { useState, useMemo } from 'react';
import { useRequests } from '../contexts/RequestContext';
import { useAuth } from '../contexts/AuthContext';
import { Supplier } from '../types';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import StarRating from '../components/ui/StarRating';
import { Navigate, Link } from 'react-router-dom';

const SupplierFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (supplier: Omit<Supplier, 'id'>) => void;
    supplier: Supplier | null;
}> = ({ isOpen, onClose, onSave, supplier }) => {
    const [formData, setFormData] = useState<Partial<Supplier>>({ rating: 0 });

    React.useEffect(() => {
        setFormData(supplier || { rating: 0 });
    }, [supplier, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'rating' ? parseInt(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Supplier);
    };

    const isEditing = !!supplier?.id;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">{isEditing ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h2>
                            <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Nome da Empresa</label>
                                <input type="text" name="name" value={formData.name || ''} onChange={handleChange} required className="w-full bg-zinc-800 border border-zinc-700 text-white rounded p-2 text-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Telefone</label>
                                    <input type="text" name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 text-white rounded p-2 text-sm" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Categoria</label>
                                    <input type="text" name="category" value={formData.category || ''} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 text-white rounded p-2 text-sm" placeholder="Ex: Elétrica, Civil" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Email</label>
                                <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 text-white rounded p-2 text-sm" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Pessoa de Contato</label>
                                <input type="text" name="contactName" value={formData.contactName || ''} onChange={handleChange} className="w-full bg-zinc-800 border border-zinc-700 text-white rounded p-2 text-sm" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-zinc-800/50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                        <Button type="submit">{isEditing ? 'Salvar Alterações' : 'Cadastrar Fornecedor'}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const EvaluationPage: React.FC = () => {
    const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useRequests();
    const { hasFullVisibility } = useAuth();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

    if (!hasFullVisibility) return <Navigate to="/" replace />;

    const filteredSuppliers = suppliers.filter(s => 
        (s.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.category?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleSaveSupplier = (data: any) => {
        if (selectedSupplier?.id) updateSupplier(selectedSupplier.id, data);
        else addSupplier(data);
        setIsSupplierModalOpen(false);
        setSelectedSupplier(null);
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Fornecedores</h1>
                    <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Base de Dados de Parceiros Comerciais</p>
                </div>
                <Button onClick={() => { setSelectedSupplier(null); setIsSupplierModalOpen(true); }}>+ Novo Fornecedor</Button>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
                <div className="p-4 bg-zinc-800/20 border-b border-zinc-800">
                    <input 
                        className="bg-zinc-800 border border-zinc-700 rounded p-2 text-sm text-white w-64 outline-none focus:ring-1 focus:ring-blue-500" 
                        placeholder="Pesquisar..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-zinc-800">
                        <thead className="bg-zinc-900/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-[10px] font-black text-zinc-500 uppercase tracking-wider">Fornecedor</th>
                                <th className="px-6 py-3 text-left text-[10px] font-black text-zinc-500 uppercase tracking-wider">Contato</th>
                                <th className="px-6 py-3 text-left text-[10px] font-black text-zinc-500 uppercase tracking-wider">Categoria</th>
                                <th className="px-6 py-3 text-right text-[10px] font-black text-zinc-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {filteredSuppliers.map(s => (
                                <tr key={s.id} className="hover:bg-zinc-800/30 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-white">{s.name}</div>
                                        <div className="text-[10px] text-zinc-500">{s.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-300">{s.phone || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded text-[10px] font-black uppercase">{s.category || 'Geral'}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-3 text-xs">
                                        <Link to={`/suppliers/${s.id}`} className="text-zinc-400 hover:text-white">Detalhes</Link>
                                        <button onClick={() => { setSelectedSupplier(s); setIsSupplierModalOpen(true); }} className="text-blue-400 hover:text-blue-300 font-bold">Editar</button>
                                        <button onClick={() => setSupplierToDelete(s)} className="text-red-400 hover:text-red-300 font-bold">Excluir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <SupplierFormModal 
                isOpen={isSupplierModalOpen} 
                onClose={() => setIsSupplierModalOpen(false)} 
                onSave={handleSaveSupplier}
                supplier={selectedSupplier}
            />

            <Modal
                isOpen={!!supplierToDelete}
                onClose={() => setSupplierToDelete(null)}
                onConfirm={() => { deleteSupplier(supplierToDelete!.id); setSupplierToDelete(null); }}
                title="Confirmar Exclusão"
            >
                Remover fornecedor {supplierToDelete?.name}?
            </Modal>
        </div>
    );
};

export default EvaluationPage;
