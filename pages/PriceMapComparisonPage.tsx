
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRequests } from '../contexts/RequestContext';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';

const PriceMapComparisonPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getPriceMapById, updatePriceMap } = useRequests();
    const { user } = useAuth();
    
    const [activeTab, setActiveTab] = useState<'quotation' | 'analysis'>('quotation');
    const priceMap = getPriceMapById(Number(id));

    if (!priceMap) return <div className="text-center p-20 text-white">Cotação não encontrada.</div>;

    const handleUpdatePrice = (supplierId: string, itemId: string, price: number) => {
        const newOffers = priceMap.offers.map(offer => {
            if (offer.supplierId === supplierId) {
                return { ...offer, prices: { ...offer.prices, [itemId]: price } };
            }
            return offer;
        });
        updatePriceMap(priceMap.id, { offers: newOffers });
    };

    const handleUpdateMeta = (supplierId: string, field: 'freight' | 'deliveryDeadline', value: number) => {
        const newOffers = priceMap.offers.map(offer => {
            if (offer.supplierId === supplierId) {
                return { ...offer, [field]: value };
            }
            return offer;
        });
        updatePriceMap(priceMap.id, { offers: newOffers });
    };

    // --- CÁLCULOS ---
    const lowestPrices = useMemo(() => {
        const map: { [itemId: string]: number } = {};
        priceMap.items.forEach(item => {
            const prices = priceMap.offers.map(o => o.prices[item.id]).filter(p => p > 0);
            if (prices.length > 0) map[item.id] = Math.min(...prices);
        });
        return map;
    }, [priceMap]);

    const totals = useMemo(() => {
        return priceMap.offers.map(offer => {
            let sum = 0;
            priceMap.items.forEach(item => {
                sum += (offer.prices[item.id] || 0) * item.quantity;
            });
            return {
                supplierId: offer.supplierId,
                totalProducts: sum,
                totalWithFreight: sum + offer.freight
            };
        });
    }, [priceMap]);

    const globalWinner = useMemo(() => {
        if (totals.length === 0) return null;
        return totals.reduce((min, curr) => (curr.totalWithFreight < min.totalWithFreight && curr.totalWithFreight > 0) ? curr : min, totals[0]);
    }, [totals]);

    const maxPrice = useMemo(() => {
        const allTotals = totals.map(t => t.totalWithFreight).filter(t => t > 0);
        return allTotals.length > 0 ? Math.max(...allTotals) : 0;
    }, [totals]);

    return (
        <div className="space-y-6 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">{priceMap.title}</h1>
                    <div className="flex gap-4 mt-1">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase">Cotação entre {priceMap.offers.length} Fornecedores</span>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase">Resp: {priceMap.responsible}</span>
                    </div>
                </div>
                <div className="flex items-center bg-zinc-800 p-1 rounded-lg">
                    <button onClick={() => setActiveTab('quotation')} className={`px-4 py-2 text-xs font-bold rounded ${activeTab === 'quotation' ? 'bg-blue-600 text-white' : 'text-zinc-500'}`}>COTAÇÃO</button>
                    <button onClick={() => setActiveTab('analysis')} className={`px-4 py-2 text-xs font-bold rounded ${activeTab === 'analysis' ? 'bg-blue-600 text-white' : 'text-zinc-500'}`}>ANÁLISE</button>
                </div>
            </div>

            {activeTab === 'quotation' ? (
                <div className="space-y-6">
                    {/* Header de Totais (Baseado na Imagem 1) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-1">
                        {totals.map((t, idx) => (
                            <div key={t.supplierId} className={`p-4 border border-zinc-800 text-center ${t.supplierId === globalWinner?.supplierId ? 'bg-emerald-500/10' : 'bg-zinc-900'}`}>
                                <p className="text-[9px] text-zinc-500 font-bold uppercase mb-1">Fornecedor {idx + 1}</p>
                                <p className={`text-sm font-black ${t.supplierId === globalWinner?.supplierId ? 'text-emerald-400' : 'text-white'}`}>
                                    {t.totalWithFreight.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Grade de Cotação */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse">
                                <thead>
                                    <tr className="bg-zinc-800/80">
                                        <th className="px-3 py-4 text-left text-[10px] font-black text-zinc-500 uppercase border-r border-zinc-700 w-16">Cód</th>
                                        <th className="px-3 py-4 text-left text-[10px] font-black text-zinc-500 uppercase border-r border-zinc-700">Produto</th>
                                        <th className="px-3 py-4 text-center text-[10px] font-black text-zinc-500 uppercase border-r border-zinc-700 w-16">UM</th>
                                        <th className="px-3 py-4 text-center text-[10px] font-black text-zinc-500 uppercase border-r border-zinc-700 w-16">Qtd</th>
                                        {priceMap.offers.map((offer, idx) => (
                                            <th key={offer.supplierId} colSpan={2} className="px-3 py-2 text-center text-[10px] font-black text-white uppercase border-r border-zinc-700">
                                                <div className="flex flex-col">
                                                    <span className="text-blue-500 mb-1 truncate max-w-[120px] mx-auto">{offer.supplierName}</span>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <span className="text-[8px] text-zinc-500">V. Unitário</span>
                                                        <span className="text-[8px] text-zinc-500">Total</span>
                                                    </div>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800">
                                    {priceMap.items.map((item, rowIdx) => (
                                        <tr key={item.id} className="hover:bg-zinc-800/20">
                                            <td className="px-3 py-3 text-[10px] font-mono text-zinc-600 border-r border-zinc-800">{rowIdx + 1}</td>
                                            <td className="px-3 py-3 text-xs font-bold text-gray-200 border-r border-zinc-800">{item.description}</td>
                                            <td className="px-3 py-3 text-center text-[10px] text-zinc-500 border-r border-zinc-800 font-mono">{item.unit}</td>
                                            <td className="px-3 py-3 text-center text-[10px] text-zinc-500 border-r border-zinc-800 font-mono">{item.quantity}</td>
                                            {priceMap.offers.map(offer => {
                                                const price = offer.prices[item.id] || 0;
                                                const isLowest = price > 0 && price === lowestPrices[item.id];
                                                const totalItem = price * item.quantity;
                                                
                                                return (
                                                    <React.Fragment key={offer.supplierId}>
                                                        <td className={`px-2 py-3 border-r border-zinc-800 ${isLowest ? 'bg-emerald-500/5' : ''}`}>
                                                            <input 
                                                                type="number" 
                                                                className={`w-full bg-transparent text-xs font-bold text-center outline-none ${isLowest ? 'text-emerald-400' : 'text-zinc-400'}`}
                                                                value={price || ''}
                                                                onChange={e => handleUpdatePrice(offer.supplierId, item.id, parseFloat(e.target.value))}
                                                                placeholder="0,00"
                                                            />
                                                        </td>
                                                        <td className={`px-2 py-3 text-[10px] font-black text-center border-r border-zinc-800 ${isLowest ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-600'}`}>
                                                            {totalItem > 0 ? totalItem.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}
                                                        </td>
                                                    </React.Fragment>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                    {/* Linha de Frete e Prazo */}
                                    <tr className="bg-zinc-900/80 border-t-2 border-zinc-700">
                                        <td colSpan={4} className="px-3 py-4 text-right text-[10px] font-black text-zinc-500 uppercase bg-zinc-800/20">Custo do Frete</td>
                                        {priceMap.offers.map(offer => (
                                            <td key={offer.supplierId} colSpan={2} className="px-3 py-3 border-r border-zinc-800">
                                                <input 
                                                    type="number" 
                                                    className="w-full bg-transparent text-xs font-bold text-center text-blue-400 outline-none"
                                                    value={offer.freight || ''}
                                                    onChange={e => handleUpdateMeta(offer.supplierId, 'freight', parseFloat(e.target.value))}
                                                    placeholder="Frete R$"
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td colSpan={4} className="px-3 py-4 text-right text-[10px] font-black text-zinc-500 uppercase bg-zinc-800/20">Prazo de Entrega (Dias)</td>
                                        {priceMap.offers.map(offer => (
                                            <td key={offer.supplierId} colSpan={2} className="px-3 py-3 border-r border-zinc-800">
                                                <input 
                                                    type="number" 
                                                    className="w-full bg-transparent text-xs font-bold text-center text-yellow-500 outline-none"
                                                    value={offer.deliveryDeadline || ''}
                                                    onChange={e => handleUpdateMeta(offer.supplierId, 'deliveryDeadline', parseInt(e.target.value))}
                                                    placeholder="Dias"
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-fade-in">
                    {/* Dashboard de Análise (Baseado na Imagem 3) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-zinc-900 border border-emerald-500/30 p-8 rounded-2xl shadow-xl flex items-center gap-6 group hover:border-emerald-500 transition-colors">
                            <div className="bg-emerald-500/20 p-4 rounded-xl text-emerald-400 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Preço Mais Baixo</p>
                                <p className="text-2xl font-black text-white italic">{globalWinner?.totalWithFreight.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                <p className="text-xs font-bold text-emerald-400">Vencedor: {priceMap.offers.find(o => o.supplierId === globalWinner?.supplierId)?.supplierName}</p>
                            </div>
                        </div>

                        <div className="bg-zinc-900 border border-red-500/30 p-8 rounded-2xl shadow-xl flex items-center gap-6 group hover:border-red-500 transition-colors">
                            <div className="bg-red-500/20 p-4 rounded-xl text-red-400 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Preço Mais Alto</p>
                                <p className="text-2xl font-black text-white italic">{maxPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                <p className="text-xs font-bold text-red-400">Variação: {globalWinner ? (((maxPrice / globalWinner.totalWithFreight) - 1) * 100).toFixed(1) : 0}%</p>
                            </div>
                        </div>

                         <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-xl">
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6">Comparativo de Prazos de Entrega</p>
                            <div className="space-y-4">
                                {priceMap.offers.map(offer => (
                                    <div key={offer.supplierId} className="space-y-1">
                                        <div className="flex justify-between text-[10px] font-bold">
                                            <span className="text-zinc-400">{offer.supplierName}</span>
                                            <span className="text-white">{offer.deliveryDeadline} dias</span>
                                        </div>
                                        <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                                            <div 
                                                className="bg-yellow-500 h-full transition-all duration-1000" 
                                                style={{ width: `${Math.min((offer.deliveryDeadline / 30) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Gráfico Total (Simulado com Divs para fidelidade ao layout Excel) */}
                    <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl">
                         <h3 className="text-lg font-black text-white italic mb-8 uppercase">Preço Total (Produtos + Frete)</h3>
                         <div className="flex items-end justify-around h-64 border-b border-zinc-800 px-10">
                            {totals.map(t => {
                                const percentage = maxPrice > 0 ? (t.totalWithFreight / maxPrice) * 100 : 0;
                                const isWinner = t.supplierId === globalWinner?.supplierId;
                                return (
                                    <div key={t.supplierId} className="flex flex-col items-center group relative w-12">
                                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-10">
                                            {t.totalWithFreight.toLocaleString('pt-BR')}
                                        </div>
                                        <div 
                                            className={`w-full rounded-t-xl transition-all duration-1000 ease-out shadow-lg ${isWinner ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-emerald-500/20' : 'bg-gradient-to-t from-blue-700 to-blue-500 shadow-blue-500/10'}`}
                                            style={{ height: `${percentage}%` }}
                                        ></div>
                                        <span className="text-[8px] font-black text-zinc-500 uppercase mt-4 text-center leading-tight">
                                            {priceMap.offers.find(o => o.supplierId === t.supplierId)?.supplierName.split(' ')[0]}
                                        </span>
                                    </div>
                                );
                            })}
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PriceMapComparisonPage;
