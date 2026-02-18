
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRequests } from '../contexts/RequestContext';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';

const PriceMapListPage: React.FC = () => {
    const { priceMaps, loading } = useRequests();
    const { isPrivilegedUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = priceMaps.filter(pm => 
        pm.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-10 text-center text-zinc-400 font-bold">Carregando mapas de cotação...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Mapa de Coleta</h1>
                    <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Comparativo de Preços entre Fornecedores</p>
                </div>
                {isPrivilegedUser && (
                    <Button as="link" to="/pricemaps/new" className="!bg-emerald-600 hover:!bg-emerald-700 shadow-lg shadow-emerald-900/20">
                        + Nova Cotação
                    </Button>
                )}
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <div className="mb-6 relative max-w-md">
                    <input 
                        type="text" 
                        placeholder="Pesquisar cotação..."
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm text-white pl-10 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <svg className="w-5 h-5 absolute left-3 top-3 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(map => (
                        <Link 
                            key={map.id} 
                            to={`/pricemaps/${map.id}`}
                            className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl hover:border-blue-500/50 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${map.status === 'Finalizada' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                    {map.status}
                                </span>
                                <span className="text-[10px] text-zinc-500 font-bold font-mono">{new Date(map.date).toLocaleDateString()}</span>
                            </div>
                            <h3 className="text-white font-bold group-hover:text-blue-400 transition-colors">{map.title}</h3>
                            <div className="mt-4 flex gap-4 text-[10px] font-bold text-zinc-500 uppercase">
                                <span>{map.items.length} Itens</span>
                                <span>{map.offers.length} Fornecedores</span>
                            </div>
                        </Link>
                    ))}
                    {filtered.length === 0 && (
                        <div className="col-span-full py-20 text-center text-zinc-600 italic">Nenhum mapa de coleta encontrado.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PriceMapListPage;
