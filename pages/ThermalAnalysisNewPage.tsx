
import React, { useState } from 'react';
// Fixed: Verified standard exports for react-router-dom version 6.
import { useNavigate } from 'react-router-dom';
import { useRequests } from '../contexts/RequestContext';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';

const ThermalAnalysisNewPage: React.FC = () => {
    const navigate = useNavigate();
    // Fixed: Resolved compilation error as addThermalAnalysis is now defined in RequestContext.
    const { addThermalAnalysis } = useRequests();
    const { sectors, user } = useAuth();

    const [formData, setFormData] = useState({
        tag: '',
        equipmentName: '',
        sector: user?.sector || '',
        operatingTemp: 60,
        criticalThreshold: 10,
        status: 'Normal' as 'Normal' | 'Atenção' | 'Crítico',
        measurements: []
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await addThermalAnalysis(formData);
        navigate('/thermal');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Cadastrar Ativo para Monitoramento</h1>
                <Button variant="secondary" onClick={() => navigate(-1)}>Voltar</Button>
            </div>

            <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 space-y-6 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">TAG / Identificação</label>
                        <input 
                            type="text" 
                            required 
                            placeholder="Ex: BOM-01-A"
                            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500"
                            value={formData.tag}
                            onChange={e => setFormData({...formData, tag: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Nome do Equipamento</label>
                        <input 
                            type="text" 
                            required 
                            placeholder="Ex: Bomba de Biometano"
                            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500"
                            value={formData.equipmentName}
                            onChange={e => setFormData({...formData, equipmentName: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Setor Responsável</label>
                        <select 
                            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500"
                            value={formData.sector}
                            onChange={e => setFormData({...formData, sector: e.target.value})}
                        >
                            {sectors.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Temp. de Operação Alvo (°C)</label>
                        <input 
                            type="number" 
                            required 
                            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500"
                            value={formData.operatingTemp}
                            onChange={e => setFormData({...formData, operatingTemp: parseInt(e.target.value)})}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Margem de Tolerância (+/- °C)</label>
                        <input 
                            type="number" 
                            required 
                            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500"
                            value={formData.criticalThreshold}
                            onChange={e => setFormData({...formData, criticalThreshold: parseInt(e.target.value)})}
                        />
                        <p className="text-[10px] text-zinc-500 mt-1 italic">Define quando o status mudará para Atenção/Crítico.</p>
                    </div>
                </div>

                <div className="pt-6 border-t border-zinc-800 flex justify-end">
                    <Button type="submit" className="!bg-blue-600 !px-8">Finalizar Cadastro</Button>
                </div>
            </form>
        </div>
    );
};

export default ThermalAnalysisNewPage;
