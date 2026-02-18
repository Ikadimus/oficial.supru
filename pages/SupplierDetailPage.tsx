
import React, { useMemo } from 'react';
// Fixed: Verified standard exports for react-router-dom version 6.
import { useParams, Link } from 'react-router-dom';
import { useRequests } from '../contexts/RequestContext';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import StarRating from '../components/ui/StarRating';
import NotFoundPage from './NotFoundPage';

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

const SupplierDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { getSupplierById, requests, loading } = useRequests();
    const { hasFullVisibility, user } = useAuth();

    const supplier = getSupplierById(id || '');

    // Filtra TODAS as solicitações deste fornecedor
    const supplierRequests = useMemo(() => {
        if (!supplier) return [];
        return requests.filter(r => r.supplier === supplier.name).sort((a, b) => b.id - a.id);
    }, [requests, supplier]);

    // Lógica de Permissão:
    // 1. Admin/Gerente/Diretor (hasFullVisibility) vê tudo.
    // 2. Usuário comum só vê se o fornecedor tiver atendido o setor dele pelo menos uma vez.
    const canView = useMemo(() => {
        if (loading) return true; // Evita bloqueio durante carregamento
        if (hasFullVisibility) return true;
        if (!user?.sector) return false;

        // Verifica histórico do setor
        return supplierRequests.some(req => req.sector === user.sector);
    }, [hasFullVisibility, user, supplierRequests, loading]);

    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return '-';
        const [year, month, day] = dateStr.split('-');
        if(day && month && year) return `${day}/${month}/${year}`;
        return dateStr;
    }

    if (loading) return <div className="text-center p-10 text-gray-400">Carregando...</div>;
    
    if (!supplier) return <NotFoundPage />;

    if (!canView) {
         return (
             <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
                 <div className="bg-red-900/20 p-4 rounded-full mb-4">
                    <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                 </div>
                 <h2 className="text-xl text-white font-bold mb-2">Acesso Restrito</h2>
                 <p className="text-gray-400 max-w-md">
                     Você não tem permissão para visualizar os detalhes deste fornecedor pois não há histórico de solicitações vinculadas ao seu setor ({user?.sector}).
                 </p>
                 <Button as="link" to="/" className="mt-6">Voltar ao Dashboard</Button>
             </div>
         )
    }

    // Se o usuário não tem visibilidade total, filtramos a lista para mostrar APENAS as solicitações do setor dele
    const requestsToShow = hasFullVisibility 
        ? supplierRequests 
        : supplierRequests.filter(req => req.sector === user?.sector);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">{supplier.name}</h1>
                    <p className="text-gray-400 mt-1 flex items-center gap-2">
                        {supplier.category || 'Fornecedor Geral'}
                        <span className="text-gray-600">•</span>
                         <StarRating rating={supplier.rating || 0} />
                    </p>
                </div>
                {/* Se o usuário veio de uma tela permitida, o botão volta, caso contrário Dashboard */}
                {hasFullVisibility ? (
                    <Button as="link" to="/evaluations" variant="secondary">Voltar para Lista</Button>
                ) : (
                    <Button as="link" to="/" variant="secondary">Voltar</Button>
                )}
            </div>

            {/* Informações Principais */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-white mb-4 border-b border-zinc-800 pb-2">Informações de Contato</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Pessoa de Contato</p>
                        <p className="text-gray-200 text-lg">{supplier.contactName || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="text-gray-200 text-lg">{supplier.email || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Telefone</p>
                        <p className="text-gray-200 text-lg">{supplier.phone || '-'}</p>
                    </div>
                     <div className="col-span-1 md:col-span-3">
                        <p className="text-sm font-medium text-gray-500">Observações</p>
                        <p className="text-gray-300 italic mt-1 bg-zinc-800/50 p-3 rounded-md border border-zinc-800">
                            {supplier.notes || 'Nenhuma observação cadastrada.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Histórico de Solicitações */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">
                        Histórico de Solicitações {hasFullVisibility ? '' : `(${user?.sector})`}
                        <span className="ml-2 text-sm font-normal text-gray-400">Total: {requestsToShow.length}</span>
                    </h3>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-zinc-800">
                        <thead className="bg-zinc-800/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Nº Pedido</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Data</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Descrição</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Solicitante</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {requestsToShow.length > 0 ? requestsToShow.map(req => (
                                <tr key={req.id} className="hover:bg-zinc-800/50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-white">{req.orderNumber}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {formatDate(req.requestDate)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-300 max-w-xs truncate" title={req.description}>
                                        {req.description || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {req.requester}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <StatusBadge statusName={req.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link to={`/requests/${req.id}`} className="text-blue-400 hover:text-blue-300">
                                            Ver Pedido &rarr;
                                        </Link>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-gray-500">
                                        Nenhuma solicitação encontrada vinculada a este fornecedor para seu setor.
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

export default SupplierDetailPage;
