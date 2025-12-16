
import React, { useState, useEffect } from 'react';
import { useRequests } from '../contexts/RequestContext';
import { FormField, Status } from '../types';
import Button from '../components/ui/Button';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import Modal from '../components/ui/Modal';

const FieldFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (field: Partial<FormField>) => void;
    field: Partial<FormField> | null;
}> = ({ isOpen, onClose, onSave, field }) => {
    const [formData, setFormData] = useState<Partial<FormField>>({ type: 'text', isVisibleInList: true });

    useEffect(() => {
        if (isOpen) {
            setFormData(field || { type: 'text', isVisibleInList: true });
        }
    }, [field, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalData = {
            ...formData,
            type: formData.type || 'text',
            isVisibleInList: formData.isVisibleInList ?? true
        };
        onSave(finalData);
    };

    const isEditing = !!field?.id;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">{isEditing ? 'Editar Campo' : 'Novo Campo'}</h2>
                            <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                        </div>
                        <div className="mt-6 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-300">Rótulo do Campo</label>
                                <input type="text" name="label" value={formData.label || ''} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-600 bg-gray-800 rounded-md text-sm text-white" />
                            </div>
                            {!isEditing && (
                                <div>
                                    <label className="text-sm font-medium text-gray-300">Tipo do Campo</label>
                                    <select name="type" value={formData.type || 'text'} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-600 bg-gray-800 rounded-md text-sm text-white">
                                        <option value="text">Texto</option>
                                        <option value="textarea">Área de Texto</option>
                                        <option value="number">Número</option>
                                        <option value="date">Data</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="bg-zinc-800/50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                        <Button type="submit">{isEditing ? 'Salvar' : 'Criar Campo'}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const StatusFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (status: Partial<Status>) => void;
    status: Partial<Status> | null;
}> = ({ isOpen, onClose, onSave, status }) => {
    const [formData, setFormData] = useState<Partial<Status>>({ color: 'gray' });
    const colors: Status['color'][] = ['yellow', 'blue', 'purple', 'green', 'red', 'gray'];

    useEffect(() => {
        if (isOpen) {
            setFormData(status || { color: 'gray' });
        }
    }, [status, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalData = {
            ...formData,
            color: formData.color || 'gray'
        };
        onSave(finalData);
    };
    
    const isEditing = !!status?.id;

    return (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">{isEditing ? 'Editar Status' : 'Novo Status'}</h2>
                            <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                        </div>
                        <div className="mt-6 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-300">Nome do Status</label>
                                <input type="text" name="name" value={formData.name || ''} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-600 bg-gray-800 rounded-md text-sm text-white" />
                            </div>
                             <div>
                                <label className="text-sm font-medium text-gray-300">Cor</label>
                                <select name="color" value={formData.color || 'gray'} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-600 bg-gray-800 rounded-md text-sm text-white">
                                    {colors.map(color => <option key={color} value={color} className={`text-${color}-300`}>{color.charAt(0).toUpperCase() + color.slice(1)}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="bg-zinc-800/50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                        <Button type="submit">{isEditing ? 'Salvar' : 'Confirmar'}</Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

const SettingsPage: React.FC = () => {
  const { formFields, updateFormFields, addFormField, updateFormField, deleteFormField, statuses, addStatus, updateStatus, deleteStatus, appConfig, updateAppConfig } = useRequests();
  const [fields, setFields] = useState<FormField[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  
  // States para Campos
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [fieldToDelete, setFieldToDelete] = useState<FormField | null>(null);
  
  // States para Status
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<Status | null>(null);
  const [statusToDelete, setStatusToDelete] = useState<Status | null>(null);

  // States para SLA Global
  const [globalSla, setGlobalSla] = useState({ excellent: 5, good: 10 });
  const [slaHasChanges, setSlaHasChanges] = useState(false);

  useEffect(() => {
    setFields(JSON.parse(JSON.stringify(formFields)));
  }, [formFields]);

  useEffect(() => {
      if (appConfig) {
          setGlobalSla({ excellent: appConfig.sla_excellent, good: appConfig.sla_good });
      }
  }, [appConfig]);
  
  // --- HANDLERS DE CAMPOS ---
  const handleToggleChange = (id: string, key: 'isActive' | 'required' | 'isVisibleInList', value: boolean) => {
    setFields(prevFields =>
      prevFields.map(field => {
        if (field.id === id) {
          const updatedField = { ...field, [key]: value };
          if (key === 'isActive' && !value) {
            updatedField.required = false;
          }
          return updatedField;
        }
        return field;
      })
    );
    setHasChanges(true);
  };
  
  const handleSaveToggles = () => {
    updateFormFields(fields);
    setHasChanges(false);
  };
  
  const moveField = (index: number, direction: 'up' | 'down') => {
      const newFields = [...fields];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;

      if (targetIndex >= 0 && targetIndex < newFields.length) {
          const temp = newFields[index];
          newFields[index] = newFields[targetIndex];
          newFields[targetIndex] = temp;
          
          newFields.forEach((f, idx) => {
              f.orderIndex = idx + 1;
          });

          setFields(newFields);
          setHasChanges(true);
      }
  };

  const handleOpenFieldModal = (field: FormField | null) => {
    setEditingField(field);
    setIsFieldModalOpen(true);
  };
  
  const handleCloseFieldModal = () => {
    setEditingField(null);
    setIsFieldModalOpen(false);
  };

  const handleSaveField = (fieldData: Partial<FormField>) => {
    if (editingField) {
      updateFormField(editingField.id, fieldData);
    } else {
      addFormField(fieldData as Pick<FormField, 'label' | 'type'>);
    }
    handleCloseFieldModal();
  };
  
  const handleDeleteFieldClick = (field: FormField) => {
    setFieldToDelete(field);
  };

  const confirmDeleteField = () => {
    if (fieldToDelete) {
      deleteFormField(fieldToDelete.id);
      setFieldToDelete(null);
    }
  };
  
  // --- HANDLERS DE STATUS ---
  const handleOpenStatusModal = (status: Status | null) => {
    setEditingStatus(status);
    setIsStatusModalOpen(true);
  };
  
  const handleCloseStatusModal = () => {
    setEditingStatus(null);
    setIsStatusModalOpen(false);
  };

  const handleSaveStatus = (statusData: Partial<Status>) => {
    if (editingStatus) {
      updateStatus(editingStatus.id, statusData);
    } else {
      addStatus(statusData as Omit<Status, 'id'>);
    }
    handleCloseStatusModal();
  };
  
  const handleDeleteStatusClick = (status: Status) => {
    setStatusToDelete(status);
  };

  const confirmDeleteStatus = () => {
    if (statusToDelete) {
      deleteStatus(statusToDelete.id);
      setStatusToDelete(null);
    }
  };

  // --- HANDLERS DE SLA GLOBAL ---
  const handleGlobalSlaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setGlobalSla(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
      setSlaHasChanges(true);
  };

  const handleSaveGlobalSla = async () => {
      await updateAppConfig({
          sla_excellent: globalSla.excellent,
          sla_good: globalSla.good
      });
      setSlaHasChanges(false);
      alert('Metas de desempenho atualizadas!');
  };

  return (
    <div className="space-y-12">
      {/* 1. Fields Configuration */}
      <div className="space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Configurar Campos do Formulário</h1>
            <p className="text-gray-400">Adicione, edite e gerencie os campos dos formulários de solicitação.</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={() => handleOpenFieldModal(null)}>+ Novo Campo</Button>
            {hasChanges && <Button onClick={handleSaveToggles}>Salvar Alterações</Button>}
          </div>
        </div>

        <div className="bg-zinc-900 shadow-xl rounded-lg overflow-hidden border border-zinc-800">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-800">
              <thead className="bg-zinc-800/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Ordem</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Campo</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Ativo</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Obrigatório</th>
                   <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Mostrar na Lista</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {fields.map((field, index) => (
                  <tr key={field.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                        <div className="flex flex-col space-y-1">
                            <button onClick={() => moveField(index, 'up')} disabled={index === 0} className={`text-gray-500 hover:text-white ${index === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}>▲</button>
                            <button onClick={() => moveField(index, 'down')} disabled={index === fields.length - 1} className={`text-gray-500 hover:text-white ${index === fields.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}>▼</button>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-white">{field.label}</p>
                      <p className="text-xs text-gray-400">{field.isStandard ? 'Padrão' : 'Personalizado'}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center">
                        <ToggleSwitch checked={field.isActive} onChange={(checked) => handleToggleChange(String(field.id), 'isActive', checked)} />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center">
                        <ToggleSwitch checked={field.required} onChange={(checked) => handleToggleChange(String(field.id), 'required', checked)} disabled={!field.isActive} />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center">
                        <ToggleSwitch checked={field.isVisibleInList ?? true} onChange={(checked) => handleToggleChange(String(field.id), 'isVisibleInList', checked)} />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                          <button onClick={() => handleOpenFieldModal(field)} className="text-blue-400 hover:text-blue-300">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                          </button>
                          {!field.isStandard && (
                          <button onClick={() => handleDeleteFieldClick(field)} className="text-red-400 hover:text-red-300">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                          </button>
                          )}
                      </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 2. Statuses Configuration */}
      <div className="space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Configurar Status</h1>
            <p className="text-gray-400">Gerencie os status disponíveis para as solicitações.</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={() => handleOpenStatusModal(null)} variant="secondary">+ Novo Status</Button>
          </div>
        </div>
        <div className="bg-zinc-900 shadow-xl rounded-lg overflow-hidden border border-zinc-800">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-zinc-800">
                    <thead className="bg-zinc-800/50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {statuses.map(status => (
                            <tr key={status.id} className="hover:bg-zinc-800/20">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full bg-${status.color}-900/50 text-${status.color}-300 border border-${status.color}-500/30 uppercase`}>
                                        {status.name}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                    <button onClick={() => handleOpenStatusModal(status)} className="text-blue-400 hover:text-blue-300" title="Editar Nome/Cor">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                                    </button>
                                    <button onClick={() => handleDeleteStatusClick(status)} className="text-red-400 hover:text-red-300" title="Excluir Status">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>

      {/* 3. Performance Goals (SLA Global) */}
      <div className="space-y-6">
          <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                  <h1 className="text-2xl font-bold text-white">Configurar Metas de Atendimento (Lead Time)</h1>
                  <p className="text-gray-400">Defina os limites de dias para classificar o desempenho da equipe.</p>
              </div>
              {slaHasChanges && (
                  <Button onClick={handleSaveGlobalSla} className="animate-pulse !bg-green-600 hover:!bg-green-700">
                      Salvar Metas
                  </Button>
              )}
          </div>
          
          <div className="bg-zinc-900 shadow-xl rounded-lg border border-zinc-800 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                      <div className="flex justify-between items-center">
                          <label className="text-sm font-medium text-green-400">Excelente (até X dias)</label>
                          <input 
                              type="number" 
                              name="excellent"
                              value={globalSla.excellent}
                              onChange={handleGlobalSlaChange}
                              className="w-24 bg-zinc-800 border border-zinc-600 rounded p-2 text-white text-center font-bold"
                              min="0"
                          />
                      </div>
                      <p className="text-xs text-gray-500">Solicitações concluídas dentro deste prazo serão consideradas "Excelentes".</p>
                  </div>

                  <div className="space-y-4">
                      <div className="flex justify-between items-center">
                          <label className="text-sm font-medium text-yellow-400">Bom (até X dias)</label>
                          <input 
                              type="number" 
                              name="good"
                              value={globalSla.good}
                              onChange={handleGlobalSlaChange}
                              className="w-24 bg-zinc-800 border border-zinc-600 rounded p-2 text-white text-center font-bold"
                              min="0"
                          />
                      </div>
                      <p className="text-xs text-gray-500">Solicitações acima do prazo "Bom" serão marcadas como "Atenção".</p>
                  </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-zinc-800 text-sm text-gray-400">
                  <p><strong>Resumo da Regra:</strong></p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li><span className="text-green-400">Excelente</span>: 0 a {globalSla.excellent} dias.</li>
                      <li><span className="text-yellow-400">Bom</span>: {globalSla.excellent + 1} a {globalSla.good} dias.</li>
                      <li><span className="text-red-400">Atenção</span>: Acima de {globalSla.good} dias.</li>
                  </ul>
              </div>
          </div>
      </div>

       <FieldFormModal isOpen={isFieldModalOpen} onClose={handleCloseFieldModal} onSave={handleSaveField} field={editingField} />
       <StatusFormModal isOpen={isStatusModalOpen} onClose={handleCloseStatusModal} onSave={handleSaveStatus} status={editingStatus} />

       <Modal
            isOpen={!!fieldToDelete}
            onClose={() => setFieldToDelete(null)}
            onConfirm={confirmDeleteField}
            title="Confirmar Exclusão de Campo"
        >
            Você tem certeza que deseja deletar o campo "{fieldToDelete?.label}"? Esta ação não pode ser desfeita.
        </Modal>

        <Modal
            isOpen={!!statusToDelete}
            onClose={() => setStatusToDelete(null)}
            onConfirm={confirmDeleteStatus}
            title="Confirmar Exclusão de Status"
        >
            Você tem certeza que deseja deletar o status "{statusToDelete?.name}"? Esta ação não pode ser desfeita.
        </Modal>
    </div>
  );
};

export default SettingsPage;
