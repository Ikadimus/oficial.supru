
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRequests } from '../contexts/RequestContext';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
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

const RequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getRequestById, deleteRequest, formFields } = useRequests();
  const { isPrivilegedUser, hasFullVisibility, user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const requestId = Number(id);
  const request = getRequestById(requestId);

  if (!request) {
    return <NotFoundPage />;
  }

  // Segurança: Bloqueia acesso se usuário sem visibilidade total tentar ver solicitação de outro setor
  if (!hasFullVisibility && request.sector !== user?.sector) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center">
             <div className="bg-red-900/20 p-4 rounded-full mb-4">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
             </div>
             <h2 className="text-xl font-bold text-white">Acesso Negado</h2>
             <p className="text-gray-400 mt-2">Você não tem permissão para visualizar solicitações do setor {request.sector}.</p>
             <Button variant="secondary" className="mt-6" onClick={() => navigate('/')}>Voltar ao Dashboard</Button>
        </div>
      );
  }

  const handleDelete = () => {
    deleteRequest(requestId);
    navigate('/');
  };

  const visibleFields = formFields.filter(f => f.isActive);

  const renderFieldValue = (fieldId: string, value: any) => {
      if (value === undefined || value === null || value === '') return <span className="text-gray-400 italic">Não informado</span>;
       if (fieldId === 'status') {
          return <StatusBadge statusName={String(value)} />;
      }
      return String(value);
  }
  
  const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleString('pt-BR');
  }

  return (
    <div className="space-y-8">
        <div className="bg-zinc-900 shadow-xl rounded-lg overflow-hidden border border-zinc-800">
            <div className="p-6 border-b border-zinc-800">
                <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-white">
                    Detalhes da Solicitação: {request.orderNumber}
                </h1>
                <div className="flex items-center space-x-2">
                    <Button as="link" to="/requests" variant="secondary">
                    Voltar
                    </Button>
                    {isPrivilegedUser && (
                    <>
                        <Button as="link" to={`/requests/edit/${request.id}`} variant="primary">
                        📝 Editar Solicitação
                        </Button>
                        <Button variant="danger" onClick={() => setIsModalOpen(true)}>
                        🗑️ Deletar Solicitação
                        </Button>
                    </>
                    )}
                </div>
                </div>
            </div>
            
            <div className="p-6">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                    {visibleFields.map(field => (
                        <div key={field.id} className={`${field.id === 'description' || field.type === 'textarea' ? 'col-span-1 md:col-span-2' : 'col-span-1'}`}>
                            <dt className="text-sm font-medium text-gray-400">{field.label}</dt>
                            <dd className={`mt-1 text-sm text-gray-100 ${field.id === 'description' || field.type === 'textarea' ? 'whitespace-pre-wrap' : ''}`}>
                                {renderFieldValue(field.id, (request as any)[field.id] || request.customFields?.[field.id])}
                            </dd>
                        </div>
                    ))}
                </dl>
                
                <div className="mt-8">
                    <h3 className="text-lg font-medium text-white mb-4">Itens da Solicitação</h3>
                    <div className="border border-zinc-800 rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-zinc-800">
                            <thead className="bg-zinc-800/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Item</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Quantidade</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status do Item</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {request.items.length > 0 ? request.items.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">{item.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">{item.quantity}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <StatusBadge statusName={item.status} />
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={3} className="text-center py-10 text-gray-500">
                                            Nenhum item encontrado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        {/* --- HISTÓRICO DE ALTERAÇÕES --- */}
        <div className="bg-zinc-900 shadow-xl rounded-lg overflow-hidden border border-zinc-800">
            <div className="p-6 border-b border-zinc-800">
                 <h3 className="text-lg font-bold text-white">Histórico de Alterações</h3>
            </div>
            <div className="overflow-x-auto">
                 <table className="min-w-full divide-y divide-zinc-800">
                     <thead className="bg-zinc-800/50">
                         <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Data/Hora</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Usuário</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Campo Alterado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Antes</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Depois</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-zinc-800">
                        {request.history && request.history.length > 0 ? (
                             [...request.history].reverse().map((entry, index) => (
                                 <tr key={index} className="hover:bg-zinc-800/50">
                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatDate(entry.date)}</td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-medium">{entry.user}</td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-400">{entry.field}</td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-red-400/80 line-through decoration-red-500/50">{entry.oldValue}</td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">{entry.newValue}</td>
                                 </tr>
                             ))
                        ) : (
                             <tr>
                                 <td colSpan={5} className="px-6 py-8 text-center text-gray-500 text-sm">
                                     Nenhuma alteração registrada no histórico.
                                 </td>
                             </tr>
                        )}
                     </tbody>
                 </table>
            </div>
        </div>

        <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={handleDelete}
            title="Confirmar Exclusão"
        >
            Você tem certeza que deseja deletar a solicitação {request.orderNumber}? Esta ação não pode ser desfeita.
        </Modal>
    </div>
  );
};

export default RequestDetailPage;
