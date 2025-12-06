
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
             console.error("Erro ao buscar campos:", fieldsError);
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
                    // Tenta inserir, mas se falhar por coluna inexistente, loga erro silencioso
                    supabase.from('form_fields').insert(descField).then(({ error }) => {
                        if (error) console.warn("Falha ao auto-inserir description (pode faltar coluna no DB):", error.message);
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
                         if (error) console.warn("Falha ao auto-inserir requester:", error.message);
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
    
    const { error } = await supabase.from('requests').insert(newRequest);
    if (error) {
        console.error("Erro ao criar solicitação:", error);
        alert(`Erro ao criar: ${error.message}`);
    }
  };

  const updateRequest = async (id: number, updatedRequest: Partial<Request>) => {
    // 1. Atualização Otimista (UI primeiro) para responsividade
    setRequests(prev => prev.map(r => r.id === id ? { ...r, ...updatedRequest } : r));

    try {
        // 2. Preparar Payload Seguro (Allow-list)
        // Isso remove qualquer propriedade extra que o objeto 'Request' possa ter em memória
        // e que não existe no banco de dados, evitando erros de "Column does not exist".
        const dbPayload: any = {
            orderNumber: updatedRequest.orderNumber,
            requestDate: updatedRequest.requestDate,
            requester: updatedRequest.requester,
            sector: updatedRequest.sector,
            supplier: updatedRequest.supplier,
            description: updatedRequest.description,
            deliveryDate: updatedRequest.deliveryDate,
            status: updatedRequest.status,
            responsible: updatedRequest.responsible,
            items: updatedRequest.items,
            customFields: updatedRequest.customFields,
            history: updatedRequest.history
        };

        // 3. Limpeza: Remover chaves que são estritamente 'undefined'
        // O Supabase/PostgREST aceita null, mas comportamento com undefined pode variar no client.
        Object.keys(dbPayload).forEach(key => {
            if (dbPayload[key] === undefined) {
                delete dbPayload[key];
            }
        });

        // 4. Atualização no Banco
        const { error } = await supabase.from('requests').update(dbPayload).eq('id', id);
        
        if (error) {
            console.error("Supabase Error Details:", error);
            
            // Tratamento Específico para Coluna Inexistente (Código 42703)
            if (error.code === '42703') {
                alert(`ERRO DE BANCO DE DADOS: O sistema tentou salvar um campo que não existe na tabela (ex: 'history' ou 'description').\n\nSolução: Por favor, execute o script SQL de atualização na tela de Login/Configurações.`);
            } else {
                alert(`Erro ao salvar no banco: ${error.message} (Código: ${error.code})`);
            }
            throw error;
        }
    } catch (err) {
        console.error("Erro ao salvar atualização no banco:", err);
        // O throw permite que a UI (botão de salvar) saiba que falhou
        throw err;
    }
  };

  const deleteRequest = async (id: number) => {
    // Atualização otimista
    setRequests(prev => prev.filter(r => r.id !== id));

    await supabase.from('requests').delete().eq('id', id);
  };
  
  const updateFormFields = async (fields: FormField[]) => {
    // Atualização otimista
    setFormFields(fields);

    for (const field of fields) {
        const { error } = await supabase.from('form_fields').upsert(field);
        if (error) {
            console.error("Erro ao atualizar campo:", error);
            if (error.code === '42703') {
                alert("Erro: O banco de dados está desatualizado (coluna faltando em form_fields). Execute o SQL de configuração novamente.");
                break;
            }
        }
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
