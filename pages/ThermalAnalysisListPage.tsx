
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRequests } from '../contexts/RequestContext';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';

const ThermalAnalysisListPage: React.FC = () => {
    const { thermalAnalyses, loading } = useRequests();
    const { user, isPrivilegedUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = thermalAnalyses.filter(item => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return item.tag.toLowerCase().includes(term) || item.equipmentName.toLowerCase().includes(term);
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Normal': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'Atenção': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'Crítico': return 'bg-red-500/10 text-red-400 border-red-500/20';
            default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
        }
    };

    if (loading) return <div className="text-center p-10 text-zinc-400">Carregando análises...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Termoanálises de Campo</h1>
                    <p className="text-gray-400 mt-1">Monitoramento de temperatura e saúde de ativos.</p>
                </div>
                {isPrivilegedUser && (
                    <Button as="link" to="/thermal/new" className="!bg-blue-600 hover:!bg-blue-700">+ Novo Equipamento</Button>
                )}
            </div>

            <div className="bg-zinc-900 shadow-xl rounded-lg border border-zinc-800 p-6 flex flex-col gap-6">
                <div className="relative w-full md:w-96">
                    <input
                        type="text"
                        className="bg-zinc-800 border border-zinc-700 text-gray-100 text-sm rounded-lg block w-full pl-4 p-2.5 placeholder-gray-500"
                        placeholder="Pesquisar por TAG ou Nome..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-zinc-800">
                        <thead className="bg-zinc-800/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-tight">TAG</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-tight">Equipamento</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-tight">Temp. Alvo</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-tight">Última Medição</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-tight">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-tight">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {filtered.map((item) => (
                                <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-400">{item.tag}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.equipmentName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-300 font-mono">{item.operatingTemp}°C</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-400">
                                        {item.lastMeasurementDate ? new Date(item.lastMeasurementDate).toLocaleDateString('pt-BR') : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`px-3 py-1 text-[10px] font-bold rounded-full border ${getStatusColor(item.status)} uppercase`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                        <Link to={`/thermal/${item.id}`} className="text-blue-400 hover:text-blue-300 font-bold">Analisar &rarr;</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ThermalAnalysisListPage;
