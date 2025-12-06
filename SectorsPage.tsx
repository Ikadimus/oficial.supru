import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sector } from '../types';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

// Modal Form for Creating/Editing Sectors
const SectorFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (sector: Sector) => void;
    sector: Sector | null;
}> = ({ isOpen, onClose, onSave, sector }) => {
    const [formData, setFormData] = useState<Partial<Sector>>({});

    React.useEffect(() => {
        setFormData(sector || {});
    }, [sector]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Sector);
    };
    
    const isEditing = !!sector?.id;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">{isEditing ? 'Editar Setor' : 'Novo Setor'}</h2>
                            <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">Preencha os dados do setor</p>
                        <div className="mt-6 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-300">Nome</label>
                                <input type="text" name="name" value={formData.name || ''} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-600 bg-gray-800 rounded-md text-sm" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-300">Descrição</label>
                                <textarea name="description" value={formData.description || ''} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-600 bg-gray-800 rounded-md text-sm" rows={3}></textarea>
                            </div>
                        </div>
                    </div>
                    <div className="bg-zinc-800/50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                        <Button type="submit">{isEditing ? 'Salvar' : 'Criar'}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const SectorsPage: React.FC = () => {
    const { sectors, users, addSector, updateSector, deleteSector } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
    const [sectorToDelete, setSectorToDelete] = useState<Sector | null>(null);
    
    const userCountBySector = useMemo(() => {
        const counts: { [key: string]: number } = {};
        users.forEach(user => {
            if (user.sector) {
                counts[user.sector] = (counts[user.sector] || 0) + 1;
            }
        });
        return counts;
    }, [users]);

    const handleOpenModal = (sector: Sector | null) => {
        setSelectedSector(sector);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedSector(null);
    };

    const handleSaveSector = (sector: Sector) => {
        if (sector.id) {
            updateSector(sector.id, sector);
        } else {
            addSector(sector);
        }
        handleCloseModal();
    };
    
    const handleDeleteClick = (sector: Sector) => {
        setSectorToDelete(sector);
    };
    
    const confirmDelete = () => {
        if (sectorToDelete) {
            deleteSector(sectorToDelete.id);
            setSectorToDelete(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Setores</h1>
                    <p className="text-gray-400">Total de {sectors.length} setores cadastrados</p>
                </div>
                <Button onClick={() => handleOpenModal(null)}>+ Novo Setor</Button>
            </div>
            
            <div className="bg-zinc-900 shadow-xl rounded-lg overflow-hidden border border-zinc-800">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-zinc-800">
                        <thead className="bg-zinc-800/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Nome</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Descrição</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Usuários</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {sectors.map(sector => (
                                <tr key={sector.id} className="hover:bg-zinc-800/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{sector.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{sector.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                                        {userCountBySector[sector.name] || 0}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                        <button onClick={() => handleOpenModal(sector)} className="text-blue-400 hover:text-blue-300">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                                        </button>
                                        <button onClick={() => handleDeleteClick(sector)} className="text-red-400 hover:text-red-300">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <SectorFormModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSaveSector} sector={selectedSector} />

            <Modal
                isOpen={!!sectorToDelete}
                onClose={() => setSectorToDelete(null)}
                onConfirm={confirmDelete}
                title="Confirmar Exclusão"
            >
                Você tem certeza que deseja deletar o setor {sectorToDelete?.name}? Esta ação não pode ser desfeita.
            </Modal>
        </div>
    );
};

export default SectorsPage;