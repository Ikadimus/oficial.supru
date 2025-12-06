
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Sector } from '../types';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

const UserFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: User) => void;
    user: User | null;
    sectors: Sector[];
}> = ({ isOpen, onClose, onSave, user, sectors }) => {
    // Inicialização robusta para garantir que role e sector tenham valores válidos
    const [formData, setFormData] = useState<Partial<User>>({ role: 'user', sector: 'Nenhum' });

    useEffect(() => {
        if (isOpen) {
            // Se estiver editando, usa os dados do usuário. Se for novo, usa padrões.
            setFormData(user || { role: 'user', sector: 'Nenhum' });
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Garante que valores padrão sejam enviados se o usuário não mexer nos selects
        const finalData = {
            ...formData,
            role: formData.role || 'user',
            sector: formData.sector || 'Nenhum'
        };
        onSave(finalData as User);
    };
    
    const isEditing = !!user?.id;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">{isEditing ? 'Editar Usuário' : 'Novo Usuário'}</h2>
                            <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">Preencha os dados do usuário</p>

                        <div className="mt-6 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-300">Nome</label>
                                <input type="text" name="name" value={formData.name || ''} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-600 bg-gray-800 rounded-md text-sm text-white" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-300">Email</label>
                                <input type="email" name="email" value={formData.email || ''} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-600 bg-gray-800 rounded-md text-sm text-white" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-300">Senha</label>
                                <input type="password" name="password" onChange={handleChange} required={!isEditing} placeholder={isEditing ? 'Deixe em branco para não alterar' : ''} className="mt-1 block w-full px-3 py-2 border border-gray-600 bg-gray-800 rounded-md text-sm text-white" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-300">Função</label>
                                <select name="role" value={formData.role || 'user'} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-600 bg-gray-800 rounded-md text-sm text-white">
                                    <option value="user">Usuário</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-300">Setor</label>
                                <select name="sector" value={formData.sector || 'Nenhum'} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-600 bg-gray-800 rounded-md text-sm text-white">
                                    <option value="Nenhum">Selecione um setor...</option>
                                    {sectors.map(s => (
                                        <option key={s.id} value={s.name}>{s.name}</option>
                                    ))}
                                </select>
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

const UsersPage: React.FC = () => {
    const { users, sectors, addUser, updateUser, deleteUser } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const handleOpenModal = (user: User | null) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    const handleSaveUser = (userData: User) => {
        if (userData.id) {
            updateUser(userData.id, userData);
        } else {
            addUser(userData);
        }
        handleCloseModal();
    };

    const handleDeleteClick = (user: User) => {
        setUserToDelete(user);
    };

    const confirmDelete = () => {
        if (userToDelete) {
            deleteUser(userToDelete.id);
            setUserToDelete(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Usuários</h1>
                    <p className="text-gray-400">Gerencie o acesso ao sistema</p>
                </div>
                <Button onClick={() => handleOpenModal(null)}>+ Novo Usuário</Button>
            </div>

            <div className="bg-zinc-900 shadow-xl rounded-lg overflow-hidden border border-zinc-800">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-zinc-800">
                        <thead className="bg-zinc-800/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Nome</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Função</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Setor</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-zinc-800/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'admin' ? 'bg-purple-900/50 text-purple-300 border border-purple-500/30' : 'bg-gray-700 text-gray-300 border border-gray-500/30'}`}>
                                            {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.sector || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                        <button onClick={() => handleOpenModal(user)} className="text-blue-400 hover:text-blue-300">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                                        </button>
                                        <button onClick={() => handleDeleteClick(user)} className="text-red-400 hover:text-red-300">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <UserFormModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSaveUser} user={selectedUser} sectors={sectors} />

            <Modal
                isOpen={!!userToDelete}
                onClose={() => setUserToDelete(null)}
                onConfirm={confirmDelete}
                title="Confirmar Exclusão"
            >
                Você tem certeza que deseja deletar o usuário {userToDelete?.name}? Esta ação não pode ser desfeita.
            </Modal>
        </div>
    );
};

export default UsersPage;
