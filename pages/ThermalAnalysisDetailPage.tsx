
import React, { useState } from 'react';
// Fixed: Verified standard exports for react-router-dom version 6.
import { useParams, useNavigate } from 'react-router-dom';
import { useRequests } from '../contexts/RequestContext';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';

const ThermalAnalysisDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    // Fixed: Resolved compilation errors as methods are now defined in RequestContext.
    const { getThermalAnalysisById, addMeasurement } = useRequests();
    const { user } = useAuth();

    const analysis = getThermalAnalysisById(Number(id));
    
    const [isAdding, setIsAdding] = useState(false);
    const [newMeasure, setNewMeasure] = useState({
        date: new Date().toISOString().slice(0, 10),
        measuredTemp: 0,
        notes: ''
    });

    if (!analysis) return <div className="text-center p-10 text-white">Equipamento não encontrado.</div>;

    const handleAddMeasure = async (e: React.FormEvent) => {
        e.preventDefault();
        await addMeasurement(analysis.id, {
            ...newMeasure,
            responsible: user?.name || 'Sistema'
        });
        setIsAdding(false);
        setNewMeasure({ ...newMeasure, measuredTemp: 0, notes: '' });
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Normal': return 'text-green-400';
            case 'Atenção': return 'text-yellow-400';
            case 'Crítico': return 'text-red-500 font-black animate-pulse';
            default: return 'text-zinc-400';
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-white italic tracking-tighter">
                        {analysis.tag} <span className="text-zinc-600 font-normal">|</span> <span className="text-blue-500">{analysis.equipmentName}</span>
                    </h1>
                    <p className="text-zinc-500 uppercase text-[10px] font-bold tracking-[0.3em] mt-1">Monitoramento de Ativo Crítico</p>
                </div>
                <Button variant="secondary" onClick={() => navigate('/thermal')}>Voltar</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Info Card */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
                    <div>
                        <h3 className="text-xs font-bold text-zinc-500 uppercase mb-4 tracking-widest">Parâmetros Técnicos</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between border-b border-zinc-800 pb-2">
                                <span className="text-sm text-gray-400">Temp. Ideal (Target):</span>
                                <span className="text-sm font-mono text-white">{analysis.operatingTemp}°C</span>
                            </div>
                            <div className="flex justify-between border-b border-zinc-800 pb-2">
                                <span className="text-sm text-gray-400">Margem de Erro:</span>
                                <span className="text-sm font-mono text-white">+/- {analysis.criticalThreshold}°C</span>
                            </div>
                            <div className="flex justify-between border-b border-zinc-800 pb-2">
                                <span className="text-sm text-gray-400">Setor:</span>
                                <span className="text-sm text-white font-bold">{analysis.sector}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Status Atual do Ativo</p>
                        <h4 className={`text-4xl font-black uppercase italic ${getStatusStyle(analysis.status)}`}>
                            {analysis.status}
                        </h4>
                    </div>
                </div>

                {/* Form to add Measurement */}
                <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    
                    <h3 className="text-xs font-bold text-zinc-500 uppercase mb-6 tracking-widest flex justify-between items-center">
                        Lançamento de Medição de Campo
                        {!isAdding && <button onClick={() => setIsAdding(true)} className="text-blue-400 hover:text-blue-300 transition-colors">+ Nova Medição</button>}
                    </h3>

                    {isAdding ? (
                        <form onSubmit={handleAddMeasure} className="space-y-4 animate-fade-in relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Data da Leitura</label>
                                    <input 
                                        type="date" 
                                        required 
                                        className="w-full bg-zinc-800 border border-zinc-700 text-white rounded p-2 text-sm"
                                        value={newMeasure.date}
                                        onChange={e => setNewMeasure({...newMeasure, date: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Temperatura Lida (°C)</label>
                                    <input 
                                        type="number" 
                                        required 
                                        className="w-full bg-zinc-800 border border-zinc-700 text-white rounded p-2 text-sm font-mono"
                                        placeholder="Ex: 65.5"
                                        value={newMeasure.measuredTemp || ''}
                                        onChange={e => setNewMeasure({...newMeasure, measuredTemp: parseFloat(e.target.value)})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Observações / Anomalias</label>
                                <textarea 
                                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded p-2 text-sm"
                                    rows={2}
                                    placeholder="Ex: Identificado ruído anormal nos rolamentos."
                                    value={newMeasure.notes}
                                    onChange={e => setNewMeasure({...newMeasure, notes: e.target.value})}
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="secondary" className="!text-[10px]" onClick={() => setIsAdding(false)}>Cancelar</Button>
                                <Button type="submit" className="!bg-blue-600 !text-[10px]">Salvar Análise</Button>
                            </div>
                        </form>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 opacity-40">
                            <svg className="w-12 h-12 text-zinc-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012-2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                            <p className="text-sm">Selecione "+ Nova Medição" para registrar dados.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Historical Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
                <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-800/20">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Log de Medições Históricas</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-zinc-800">
                        <thead className="bg-zinc-800/30">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-tight">Data</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-tight">Responsável</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-tight">Lida (°C)</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-tight">Variação (Alvo)</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-tight">Observações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {analysis.measurements && analysis.measurements.length > 0 ? (
                                [...analysis.measurements].reverse().map((m) => {
                                    const diff = m.measuredTemp - analysis.operatingTemp;
                                    const diffColor = diff > analysis.criticalThreshold ? 'text-red-400' : diff < -analysis.criticalThreshold ? 'text-blue-400' : 'text-green-400';
                                    
                                    return (
                                        <tr key={m.id} className="hover:bg-zinc-800/30">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                {new Date(m.date).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                                                {m.responsible}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-mono text-white">
                                                {m.measuredTemp}°C
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-center text-sm font-mono font-bold ${diffColor}`}>
                                                {diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)}°C
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-400 italic">
                                                {m.notes || '-'}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-zinc-600 text-sm">Nenhuma medição registrada ainda.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ThermalAnalysisDetailPage;
