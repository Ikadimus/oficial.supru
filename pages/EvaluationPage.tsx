
import React, { useState, useMemo, useEffect } from 'react';
import { useRequests } from '../contexts/RequestContext';
import { useAuth } from '../contexts/AuthContext';
import { Supplier } from '../types';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import StarRating from '../components/ui/StarRating';
import { Navigate, Link } from 'react-router-dom';

// Modal para criar/editar Fornecedor
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
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-1 md:col-span-2">
                                <label className="text-sm font-medium text-gray-300">Nome da Empresa</label>
                                <input type="text" name="name" value={formData.name || ''} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-600 bg-gray-800 rounded-md text-sm text-white" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-300">Contato</label>
                                <input type="text" name="contactName" value={formData.contactName || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-600 bg-gray-800 rounded-md text-sm text-white" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-300">Categoria</label>
                                <input type="text" name="category" value={formData.category || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-600 bg-gray-800 rounded-md text-sm text-white" placeholder="Ex: Informática" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-300">Email</label>
                                <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-600 bg-gray-800 rounded-md text-sm text-white" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-300">Telefone</label>
                                <input type="text" name="phone" value={formData.phone || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-600 bg-gray-800 rounded-md text-sm text-white" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-300">Avaliação (1-5)</label>
                                <select name="rating" value={formData.rating || 0} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-600 bg-gray-800 rounded-md text-sm text-white">
                                    <option value="0">Sem avaliação</option>
                                    <option value="1">1 Estrela</option>
                                    <option value="2">2 Estrelas</option>
                                    <option value="3">3 Estrelas</option>
                                    <option value="4">4 Estrelas</option>
                                    <option value="5">5 Estrelas</option>
                                </select>
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <label className="text-sm font-medium text-gray-300">Observações</label>
                                <textarea name="notes" value={formData.notes || ''} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-600 bg-gray-800 rounded-md text-sm text-white"></textarea>
                            </div>
                        </div>
                    </div>
                    <div className="bg-zinc-800/50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                        <Button type="submit">{isEditing ? 'Salvar' : 'Cadastrar'}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const EvaluationPage: React.FC = () => {
    const { requests, suppliers, addSupplier, updateSupplier, deleteSupplier } = useRequests();
    const { hasFullVisibility, users } = useAuth();
    
    const [activeTab, setActiveTab] = useState<'team' | 'suppliers' | 'efficiency'>('team');
    
    const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
    
    // Estado da Pesquisa
    const [searchTerm, setSearchTerm] = useState('');

    // --- CONFIGURAÇÃO DE METAS (THRESHOLDS) ---
    // Salva no localStorage para persistir entre recargas
    const [thresholds, setThresholds] = useState<{ excellent: number; good: number }>({ excellent: 5, good: 10 });

    useEffect(() => {
        const stored = localStorage.getItem('performance_thresholds');
        if (stored) {
            setThresholds(JSON.parse(stored));
        }
    }, []);

    const saveThresholds = (newThresholds: { excellent: number; good: number }) => {
        setThresholds(newThresholds);
        localStorage.setItem('performance_thresholds', JSON.stringify(newThresholds));
    };

    // Se não tiver permissão, redireciona
    if (!hasFullVisibility) {
        return <Navigate to="/" replace />;
    }

    // --- CÁLCULOS DE DESEMPENHO DA EQUIPE (LEAD TIME TOTAL: Solicitação -> Entrega) ---
    const teamMetrics = useMemo(() => {
        const metrics: Record<string, { total: number; completed: number; totalDays: number; avgLeadTime: number }> = {};

        // Inicializa com todos os usuários cadastrados
        users.forEach(u => {
            metrics[u.name] = { total: 0, completed: 0, totalDays: 0, avgLeadTime: 0 };
        });

        requests.forEach(req => {
            const responsible = req.responsible || 'Não atribuído';
            
            if (!metrics[responsible]) {
                metrics[responsible] = { total: 0, completed: 0, totalDays: 0, avgLeadTime: 0 };
            }

            metrics[responsible].total += 1;

            // Calcula Lead Time (Data Entrega/Conclusão - Data Solicitação)
            if ((req.status === 'Entregue' || req.status === 'Concluído') && req.requestDate && req.deliveryDate) {
                const start = new Date(req.requestDate);
                const end = new Date(req.deliveryDate);
                const diffTime = Math.abs(end.getTime() - start.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                metrics[responsible].completed += 1;
                metrics[responsible].totalDays += diffDays;
            }
        });

        // Calcula médias
        Object.keys(metrics).forEach(key => {
            const m = metrics[key];
            if (m.completed > 0) {
                m.avgLeadTime = parseFloat((m.totalDays / m.completed).toFixed(1));
            }
        });

        return Object.entries(metrics)
            .sort(([, a], [, b]) => b.total - a.total); // Ordena por volume de trabalho
    }, [requests, users]);

    // --- CÁLCULOS DE EFICIÊNCIA DE SUPRIMENTOS (TEMPO DE COMPRA: Solicitação -> Data da OC) ---
    const supplyMetrics = useMemo(() => {
        // Lista de requisições que possuem Data OC
        const validRequests = requests.filter(r => r.requestDate && r.purchaseOrderDate);
        
        const data = validRequests.map(req => {
            const start = new Date(req.requestDate);
            const end = new Date(req.purchaseOrderDate!);
            const diffTime = end.getTime() - start.getTime(); // Pode ser negativo se inserido errado
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            return {
                ...req,
                daysToPO: diffDays >= 0 ? diffDays : 0 // Proteção contra datas invertidas
            };
        });

        // Média Geral
        const totalDays = data.reduce((acc, curr) => acc + curr.daysToPO, 0);
        const avgDays = data.length > 0 ? (totalDays / data.length).toFixed(1) : '0.0';

        return { list: data, avgDays };
    }, [requests]);

    // --- CÁLCULOS DE FORNECEDORES ---
    const supplierMetrics = useMemo(() => {
        const metrics: Record<string, { count: number, lastDate: string }> = {};

        requests.forEach(req => {
            const suppName = req.supplier;
            if (suppName) {
                if (!metrics[suppName]) {
                    metrics[suppName] = { count: 0, lastDate: '' };
                }
                metrics[suppName].count += 1;
                if (!metrics[suppName].lastDate || req.requestDate > metrics[suppName].lastDate) {
                    metrics[suppName].lastDate = req.requestDate;
                }
            }
        });
        return metrics;
    }, [requests]);
    
    // --- LÓGICA DE FILTRAGEM (PESQUISA) ---
    const filteredSuppliers = useMemo(() => {
        if (!searchTerm) return suppliers;
        const lowerTerm = searchTerm.toLowerCase();

        return suppliers.filter(s => 
            (s.name && s.name.toLowerCase().includes(lowerTerm)) ||
            (s.contactName && s.contactName.toLowerCase().includes(lowerTerm)) ||
            (s.email && s.email.toLowerCase().includes(lowerTerm)) ||
            (s.phone && s.phone.toLowerCase().includes(lowerTerm)) ||
            (s.category && s.category.toLowerCase().includes(lowerTerm)) ||
            (s.notes && s.notes.toLowerCase().includes(lowerTerm))
        );
    }, [suppliers, searchTerm]);

    // --- HANDLERS FORNECEDORES ---
    const handleSaveSupplier = (data: any) => {
        if (selectedSupplier && selectedSupplier.id) {
            updateSupplier(selectedSupplier.id, data);
        } else {
            addSupplier(data);
        }
        setIsSupplierModalOpen(false);
        setSelectedSupplier(null);
    }

    const handleDeleteSupplier = () => {
        if (supplierToDelete) {
            deleteSupplier(supplierToDelete.id);
            setSupplierToDelete(null);
        }
    }

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header e Abas */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Avaliação de Desempenho</h1>
                    <p className="text-gray-400 mt-1">Análise de métricas da equipe, eficiência de compras e gestão de fornecedores.</p>
                </div>
                <div className="bg-zinc-800 p-1 rounded-lg inline-flex flex-wrap">
                    <button 
                        onClick={() => setActiveTab('team')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'team' ? 'bg-zinc-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                        Desempenho da Equipe
                    </button>
                     <button 
                        onClick={() => setActiveTab('efficiency')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'efficiency' ? 'bg-zinc-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                        Eficiência de Suprimentos
                    </button>
                    <button 
                        onClick={() => setActiveTab('suppliers')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'suppliers' ? 'bg-zinc-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                        Gestão de Fornecedores
                    </button>
                </div>
            </div>

            {/* CONTEÚDO DA ABA: EQUIPE */}
            {activeTab === 'team' && (
                <div className="grid grid-cols-1 gap-6">
                    {/* Configuração de Metas */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <div className="mb-4">
                             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Configurar Metas de Atendimento (Lead Time)</h3>
                             <p className="text-xs text-gray-500">Defina os limites de dias para classificar o desempenho da equipe.</p>
                        </div>
                        <div className="flex flex-col md:flex-row gap-6 items-center">
                             <div className="w-full md:w-1/3">
                                 <label className="text-xs text-green-400 font-bold block mb-1">Excelente (até X dias)</label>
                                 <input 
                                    type="number" 
                                    value={thresholds.excellent} 
                                    onChange={(e) => saveThresholds({ ...thresholds, excellent: Number(e.target.value) })}
                                    className="w-full bg-zinc-800 border border-green-900/50 text-green-100 rounded p-2 text-sm"
                                 />
                             </div>
                             <div className="w-full md:w-1/3">
                                 <label className="text-xs text-yellow-400 font-bold block mb-1">Bom (até X dias)</label>
                                 <input 
                                    type="number" 
                                    value={thresholds.good} 
                                    onChange={(e) => saveThresholds({ ...thresholds, good: Number(e.target.value) })}
                                    className="w-full bg-zinc-800 border border-yellow-900/50 text-yellow-100 rounded p-2 text-sm"
                                 />
                             </div>
                             <div className="w-full md:w-1/3 pt-4">
                                 <p className="text-xs text-gray-400">
                                     Acima de <span className="text-red-400 font-bold">{thresholds.good} dias</span> será considerado <span className="text-red-400 font-bold">Atenção</span>.
                                 </p>
                             </div>
                        </div>
                    </div>

                    {/* Resumo Rápido */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <h2 className="text-lg font-bold text-white mb-4">Eficiência Operacional</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-zinc-800">
                                <thead className="bg-zinc-800/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Responsável</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Total Solicitações</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Concluídas/Entregues</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Tempo Médio (Dias)</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Desempenho</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800">
                                    {teamMetrics.map(([name, metrics]) => {
                                        // Cálculo de "score" visual baseado nas metas configuradas
                                        let scoreColor = 'text-gray-400';
                                        let scoreText = 'Indefinido';
                                        
                                        if (metrics.completed > 0) {
                                            if (metrics.avgLeadTime <= thresholds.excellent) {
                                                scoreColor = 'text-green-400';
                                                scoreText = 'Excelente';
                                            }
                                            else if (metrics.avgLeadTime <= thresholds.good) {
                                                scoreColor = 'text-yellow-400';
                                                scoreText = 'Bom';
                                            }
                                            else {
                                                scoreColor = 'text-red-400';
                                                scoreText = 'Atenção';
                                            }
                                        }

                                        return (
                                            <tr key={name} className="hover:bg-zinc-800/50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-8 w-8 rounded-full bg-blue-600/30 text-blue-300 flex items-center justify-center font-bold text-xs mr-3">
                                                            {name.charAt(0)}
                                                        </div>
                                                        <span className="text-sm font-medium text-white">{name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-300">{metrics.total}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-300">{metrics.completed}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-300">
                                                    {metrics.completed > 0 ? metrics.avgLeadTime : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                                    {metrics.completed > 0 ? (
                                                        <span className={`font-bold ${scoreColor}`}>
                                                            {scoreText}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-500">Sem dados suficientes</span>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* CONTEÚDO DA ABA: EFICIÊNCIA DE SUPRIMENTOS */}
            {activeTab === 'efficiency' && (
                <div className="space-y-6">
                     <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                         <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-white">Tempo Médio de Conversão (Solicitação ➝ OC)</h2>
                                <p className="text-sm text-gray-400">Média de dias entre a criação da solicitação e a emissão da Ordem de Compra.</p>
                            </div>
                            <div className="text-right">
                                <span className="text-4xl font-bold text-blue-500">{supplyMetrics.avgDays}</span>
                                <span className="text-sm text-gray-400 block">dias úteis (aprox.)</span>
                            </div>
                         </div>
                     </div>

                     <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
                        <div className="p-4 border-b border-zinc-800">
                             <h3 className="text-sm font-bold text-white uppercase">Detalhamento por Solicitação</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-zinc-800">
                                <thead className="bg-zinc-800/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Pedido</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Data Solicitação</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Data OC</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Tempo Decorrido</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Fornecedor</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Ver</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800">
                                    {supplyMetrics.list.length > 0 ? supplyMetrics.list.map(req => (
                                        <tr key={req.id} className="hover:bg-zinc-800/50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">
                                                {req.orderNumber}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                {formatDate(req.requestDate)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-300">
                                                {formatDate(req.purchaseOrderDate || '')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${req.daysToPO <= 2 ? 'bg-green-100 text-green-800' : req.daysToPO <= 5 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                    {req.daysToPO} dias
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                {req.supplier}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                 <Link to={`/requests/${req.id}`} className="text-blue-400 hover:text-blue-300">
                                                    ➔
                                                </Link>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={6} className="text-center py-8 text-gray-500">
                                                Nenhuma solicitação com "Data da OC" preenchida encontrada.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                     </div>
                </div>
            )}

            {/* CONTEÚDO DA ABA: FORNECEDORES */}
            {activeTab === 'suppliers' && (
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        {/* Barra de Pesquisa */}
                        <div className="relative w-full md:w-96">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <input 
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Pesquisar telefone, email, obs..." 
                                className="bg-zinc-800 border border-zinc-700 text-gray-100 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 placeholder-gray-500"
                            />
                        </div>

                        <Button onClick={() => { setSelectedSupplier(null); setIsSupplierModalOpen(true); }}>
                            + Cadastrar Fornecedor
                        </Button>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-zinc-800">
                                <thead className="bg-zinc-800/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Fornecedor</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Contato</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Avaliação</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Solicitações Atendidas</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Última Negociação</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800">
                                    {filteredSuppliers.length > 0 ? filteredSuppliers.map(supplier => {
                                        // Dados calculados das solicitações vinculadas pelo nome
                                        const metrics = supplierMetrics[supplier.name] || { count: 0, lastDate: '' };
                                        
                                        return (
                                            <tr key={supplier.id} className="hover:bg-zinc-800/50 group">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <Link to={`/suppliers/${supplier.id}`} className="text-sm font-bold text-white hover:text-blue-400 transition-colors">
                                                            {supplier.name}
                                                        </Link>
                                                        <p className="text-xs text-gray-500">{supplier.category || 'Geral'}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                    <p>{supplier.contactName || '-'}</p>
                                                    <p className="text-xs text-gray-500">{supplier.email || supplier.phone}</p>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <StarRating rating={supplier.rating || 0} />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-blue-400 font-bold">
                                                    {metrics.count}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-400">
                                                    {formatDate(metrics.lastDate)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                                    <Link to={`/suppliers/${supplier.id}`} className="text-blue-400 hover:text-blue-300 inline-block" title="Ver Detalhes">
                                                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                                    </Link>
                                                    <button onClick={() => { setSelectedSupplier(supplier); setIsSupplierModalOpen(true); }} className="text-gray-400 hover:text-white" title="Editar">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                                    </button>
                                                    <button onClick={() => setSupplierToDelete(supplier)} className="text-red-400 hover:text-red-300" title="Excluir">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan={6} className="text-center py-8 text-gray-500">
                                                {searchTerm ? 'Nenhum fornecedor encontrado para a pesquisa.' : 'Nenhum fornecedor cadastrado.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            <SupplierFormModal 
                isOpen={isSupplierModalOpen} 
                onClose={() => setIsSupplierModalOpen(false)} 
                onSave={handleSaveSupplier}
                supplier={selectedSupplier}
            />

            <Modal
                isOpen={!!supplierToDelete}
                onClose={() => setSupplierToDelete(null)}
                onConfirm={handleDeleteSupplier}
                title="Excluir Fornecedor"
            >
                Tem certeza que deseja remover o fornecedor <strong>{supplierToDelete?.name}</strong>?
            </Modal>
        </div>
    );
};

export default EvaluationPage;
