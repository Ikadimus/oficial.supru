
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Request, FormField, Status } from '../types';
import { supabase } from '../lib/supabaseClient';
import { initialFormFields, initialStatuses } from '../constants';

interface RequestContextType {
  requests: Request[];
  formFields: FormField[];
  statuses: Status[];
  loading: boolean;
  getRequestById: (id: number) => Request | undefined;
  addRequest: (request: Omit<Request, 'id'>) => Promise<void>;
  updateRequest: (id: number, updatedRequest: Partial<Request>) => Promise<void>;
  deleteRequest: (id: number) => Promise<void>;
  updateFormFields: (fields: FormField[]) => Promise<void>;
  addFormField: (field: Pick<FormField, 'label' | 'type'>) => Promise<void>;
  updateFormField: (id: string, updatedField: Partial<FormField>) => Promise<void>;
  deleteFormField: (id: string) => Promise<void>;
  addStatus: (status: Omit<Status, 'id'>) => Promise<void>;
  updateStatus: (id: string, updatedStatus: Partial<Status>) => Promise<void>;
  deleteStatus: (id: string) => Promise<void>;
}

const RequestContext = createContext<RequestContextType | undefined>(undefined);

export const RequestProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
      const { data, error } = await supabase.from('requests').select('*').order('id', { ascending: false });
      if (data && !error) {
          setRequests(data);
      } else {
          // Ignora se o erro for tabela inexistente (AuthContext já trata isso)
          if (error && error.code !== 'PGRST205' && error.code !== '42P01') {
             console.error("Erro ao buscar solicitações:", JSON.stringify(error));
          }
      }
  };

  const fetchConfigs = async () => {
      try {
        // --- FORM FIELDS ---
        const { data: fieldsData, error: fieldsError } = await supabase.from('form_fields').select('*');
        
        if (fieldsError && fieldsError.code !== 'PGRST205' && fieldsError.code !== '42P01') {
             // Apenas loga erro real
        } else if (fieldsData && fieldsData.length > 0) {
            // Garante que o campo isVisibleInList e orderIndex existam
            let sanitizedFields = fieldsData.map((f: any) => ({
                ...f,
                isVisibleInList: f.isVisibleInList !== undefined ? f.isVisibleInList : (f.isStandard ? true : false),
                orderIndex: f.orderIndex !== undefined && f.orderIndex !== null ? f.orderIndex : 99 // Ordem padrão fim da fila
            }));
            
            // --- CORREÇÃO AUTOMÁTICA DE CAMPO DESCRIÇÃO ---
            const hasDescription = sanitizedFields.some((f: any) => f.id === 'description');
            if (!hasDescription) {
                const descField = initialFormFields.find(f => f.id === 'description');
                if (descField) {
                    sanitizedFields.push(descField);
                    supabase.from('form_fields').insert(descField).then(({ error }) => {
                        if (!error) console.log("Campo 'description' corrigido automaticamente.");
                    });
                }
            }

            // --- CORREÇÃO AUTOMÁTICA DE CAMPO SOLICITANTE ---
            const hasRequester = sanitizedFields.some((f: any) => f.id === 'requester');
            if (!hasRequester) {
                const reqField = initialFormFields.find(f => f.id === 'requester');
                if (reqField) {
                    sanitizedFields.push(reqField);
                    supabase.from('form_fields').insert(reqField).then(({ error }) => {
                        if (!error) console.log("Campo 'requester' corrigido automaticamente.");
                    });
                }
            }
            
            // Ordena os campos
            sanitizedFields.sort((a: any, b: any) => (a.orderIndex || 99) - (b.orderIndex || 99));

            setFormFields(sanitizedFields);
        } else if (!fieldsError) {
            // Auto-seed se vazio e sem erro de tabela
            console.log("Configurando campos iniciais no banco...");
            for(const f of initialFormFields) {
                await supabase.from('form_fields').insert(f);
            }
            const { data: newFields } = await supabase.from('form_fields').select('*');
            if(newFields) setFormFields(newFields.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)));
        }

        // --- STATUSES ---
        const { data: statusesData, error: statusError } = await supabase.from('statuses').select('*');
        if (statusError && statusError.code !== 'PGRST205' && statusError.code !== '42P01') {
             // Apenas loga erro real
        } else if (statusesData && statusesData.length > 0) {
            setStatuses(statusesData);
        } else if (!statusError) {
            // Auto-seed se vazio e sem erro de tabela
            console.log("Configurando status iniciais no banco...");
            for(const s of initialStatuses) {
                await supabase.from('statuses').insert(s);
            }
            const { data: newStatuses } = await supabase.from('statuses').select('*');
            if(newStatuses) setStatuses(newStatuses);
        }
      } catch (e) {
          console.log("Aguardando configuração do banco...");
      }
  };

  const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchConfigs(), fetchRequests()]);
      setLoading(false);
  }

  useEffect(() => {
    loadAll();

    // REALTIME: Ouve mudanças em qualquer tabela relevante
    const requestsChannel = supabase
      .channel('public:requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, () => {
        fetchRequests();
      })
      .subscribe();
    
    const fieldsChannel = supabase
      .channel('public:form_fields')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'form_fields' }, () => {
        fetchConfigs();
      })
      .subscribe();

    const statusesChannel = supabase
      .channel('public:statuses')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'statuses' }, () => {
        fetchConfigs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(requestsChannel);
      supabase.removeChannel(fieldsChannel);
      supabase.removeChannel(statusesChannel);
    };
  }, []);

  const getRequestById = (id: number): Request | undefined => {
    return requests.find(r => r.id === id);
  };

  const addRequest = async (request: Omit<Request, 'id'>) => {
    const newRequest = { ...request, id: Date.now() }; 
    // Atualização otimista: atualiza o estado local imediatamente
    setRequests(prev => [newRequest as Request, ...prev]);
    
    await supabase.from('requests').insert(newRequest);
  };

  const updateRequest = async (id: number, updatedRequest: Partial<Request>) => {
    // Atualização otimista
    setRequests(prev => prev.map(r => r.id === id ? { ...r, ...updatedRequest } : r));

    await supabase.from('requests').update(updatedRequest).eq('id', id);
  };

  const deleteRequest = async (id: number) => {
    // Atualização otimista
    setRequests(prev => prev.filter(r => r.id !== id));

    await supabase.from('requests').delete().eq('id', id);
  };
  
  const moveField = async (index: number, direction: 'up' | 'down') => {
       // Função auxiliar para reordenar (apenas estado local para UI rápida, a persistência é via updateFormFields)
       // Implementado no componente SettingsPage, mas a lógica de banco pode ser abstraída aqui futuramente
  };
  
  const updateFormFields = async (fields: FormField[]) => {
    // Atualização otimista
    setFormFields(fields);

    for (const field of fields) {
        await supabase.from('form_fields').upsert(field);
    }
  };

  const addFormField = async (field: Pick<FormField, 'label' | 'type'>) => {
    // Calcula próximo orderIndex
    const maxOrder = Math.max(...formFields.map(f => f.orderIndex || 0), 0);
    
    const newField: FormField = {
      ...field,
      id: `custom-${Date.now()}`,
      isActive: true,
      required: false,
      isStandard: false,
      isVisibleInList: true, // Default to true for new fields
      orderIndex: maxOrder + 1
    };
    // Atualização otimista
    setFormFields(prev => [...prev, newField]);

    await supabase.from('form_fields').insert(newField);
  };

  const updateFormField = async (id: string, updatedField: Partial<FormField>) => {
    // Atualização otimista
    setFormFields(prev => prev.map(f => f.id === id ? { ...f, ...updatedField } : f));

    await supabase.from('form_fields').update(updatedField).eq('id', id);
  };

  const deleteFormField = async (id: string) => {
    // Atualização otimista
    setFormFields(prev => prev.filter(f => f.id !== id));

    await supabase.from('form_fields').delete().eq('id', id);
  };

  const addStatus = async (status: Omit<Status, 'id'>) => {
    const newStatus = { ...status, id: `status-${Date.now()}` };
    // Atualização otimista
    setStatuses(prev => [...prev, newStatus]);

    await supabase.from('statuses').insert(newStatus);
  };

  const updateStatus = async (id: string, updatedStatus: Partial<Status>) => {
    // Atualização otimista
    setStatuses(prev => prev.map(s => s.id === id ? { ...s, ...updatedStatus } : s));

    await supabase.from('statuses').update(updatedStatus).eq('id', id);
  };

  const deleteStatus = async (id: string) => {
    // Atualização otimista
    setStatuses(prev => prev.filter(s => s.id !== id));

    await supabase.from('statuses').delete().eq('id', id);
  };

  return (
    <RequestContext.Provider value={{ requests, formFields, statuses, loading, getRequestById, addRequest, updateRequest, deleteRequest, updateFormFields, addFormField, updateFormField, deleteFormField, addStatus, updateStatus, deleteStatus }}>
      {children}
    </RequestContext.Provider>
  );
};

export const useRequests = () => {
  const context = useContext(RequestContext);
  if (context === undefined) {
    throw new Error('useRequests must be used within a RequestProvider');
  }
  return context;
};