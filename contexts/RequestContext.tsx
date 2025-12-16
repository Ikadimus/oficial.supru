
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Request, FormField, Status, Supplier, AppConfig } from '../types';
import { supabase } from '../lib/supabaseClient';
import { initialFormFields, initialStatuses } from '../constants';

interface RequestContextType {
  requests: Request[];
  formFields: FormField[];
  statuses: Status[];
  suppliers: Supplier[];
  appConfig: AppConfig;
  loading: boolean;
  getRequestById: (id: number) => Request | undefined;
  getSupplierById: (id: string) => Supplier | undefined;
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
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<void>;
  updateSupplier: (id: string, updatedSupplier: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  updateAppConfig: (config: Partial<AppConfig>) => Promise<void>;
}

const RequestContext = createContext<RequestContextType | undefined>(undefined);

export const RequestProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [appConfig, setAppConfig] = useState<AppConfig>({ id: 1, sla_excellent: 5, sla_good: 10 });
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
      const { data, error } = await supabase.from('requests').select('*').order('id', { ascending: false });
      if (data && !error) {
          // Normaliza os dados para garantir que history seja um array válido
          const safeData = data.map((req: any) => ({
              ...req,
              history: Array.isArray(req.history) ? req.history : [],
              items: Array.isArray(req.items) ? req.items : []
          }));
          setRequests(safeData);
      } else {
          if (error && error.code !== 'PGRST205' && error.code !== '42P01') {
             console.error("Erro ao buscar solicitações:", JSON.stringify(error, null, 2));
          }
      }
  };

  const fetchConfigs = async () => {
      try {
        // --- FORM FIELDS ---
        const { data: fieldsData, error: fieldsError } = await supabase.from('form_fields').select('*');
        
        if (fieldsError && fieldsError.code !== 'PGRST205' && fieldsError.code !== '42P01') {
             console.error("Erro ao buscar campos:", JSON.stringify(fieldsError, null, 2));
        } else if (fieldsData && fieldsData.length > 0) {
            let sanitizedFields = fieldsData.map((f: any) => ({
                ...f,
                isVisibleInList: f.isVisibleInList !== undefined ? f.isVisibleInList : (f.isStandard ? true : false),
                orderIndex: f.orderIndex !== undefined && f.orderIndex !== null ? f.orderIndex : 99 
            }));
            
            // --- CORREÇÃO AUTOMÁTICA DE CAMPO DESCRIÇÃO ---
            const hasDescription = sanitizedFields.some((f: any) => f.id === 'description');
            if (!hasDescription) {
                const descField = initialFormFields.find(f => f.id === 'description');
                if (descField) {
                    sanitizedFields.push(descField);
                    supabase.from('form_fields').insert(descField).then(({ error }) => {
                        if (error) console.warn("Falha ao auto-inserir description:", error.message);
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

            // --- CORREÇÃO AUTOMÁTICA DE CAMPO DATA DA OC ---
            const hasPO = sanitizedFields.some((f: any) => f.id === 'purchaseOrderDate');
            if (!hasPO) {
                const poField = initialFormFields.find(f => f.id === 'purchaseOrderDate');
                if (poField) {
                    sanitizedFields.push(poField);
                    supabase.from('form_fields').insert(poField).then(({ error }) => {
                         if (error) console.warn("Falha ao auto-inserir purchaseOrderDate:", error.message);
                    });
                }
            }

            // --- CORREÇÃO AUTOMÁTICA DE CAMPO URGÊNCIA ---
            const hasUrgency = sanitizedFields.some((f: any) => f.id === 'urgency');
            if (!hasUrgency) {
                const urgencyField = initialFormFields.find(f => f.id === 'urgency');
                if (urgencyField) {
                    sanitizedFields.push(urgencyField);
                    supabase.from('form_fields').insert(urgencyField).then(({ error }) => {
                         if (error) console.warn("Falha ao auto-inserir urgency:", error.message);
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
        if (statusesData && statusesData.length > 0) {
            setStatuses(statusesData);
        } else if (!statusError) {
            console.log("Configurando status iniciais no banco...");
            for(const s of initialStatuses) {
                await supabase.from('statuses').insert(s);
            }
            const { data: newStatuses } = await supabase.from('statuses').select('*');
            if(newStatuses) setStatuses(newStatuses);
        }

        // --- SUPPLIERS ---
        const { data: suppliersData } = await supabase.from('suppliers').select('*');
        if (suppliersData) {
            setSuppliers(suppliersData);
        }

        // --- APP CONFIG (GLOBAL SLA) ---
        const { data: configData } = await supabase.from('app_config').select('*').single();
        if (configData) {
            setAppConfig(configData);
        } else {
            // Se não existir, tenta criar o padrão
            const defaultConfig = { id: 1, sla_excellent: 5, sla_good: 10 };
            const { error: insertError } = await supabase.from('app_config').insert(defaultConfig);
            if (!insertError) {
                setAppConfig(defaultConfig);
            }
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

    const requestsChannel = supabase.channel('public:requests').on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, () => fetchRequests()).subscribe();
    const fieldsChannel = supabase.channel('public:form_fields').on('postgres_changes', { event: '*', schema: 'public', table: 'form_fields' }, () => fetchConfigs()).subscribe();
    const statusesChannel = supabase.channel('public:statuses').on('postgres_changes', { event: '*', schema: 'public', table: 'statuses' }, () => fetchConfigs()).subscribe();
    const suppliersChannel = supabase.channel('public:suppliers').on('postgres_changes', { event: '*', schema: 'public', table: 'suppliers' }, () => fetchConfigs()).subscribe();
    const configChannel = supabase.channel('public:app_config').on('postgres_changes', { event: '*', schema: 'public', table: 'app_config' }, () => fetchConfigs()).subscribe();

    return () => {
      supabase.removeChannel(requestsChannel);
      supabase.removeChannel(fieldsChannel);
      supabase.removeChannel(statusesChannel);
      supabase.removeChannel(suppliersChannel);
      supabase.removeChannel(configChannel);
    };
  }, []);

  const getRequestById = useCallback((id: number): Request | undefined => {
    return requests.find(r => r.id === id);
  }, [requests]);

  const getSupplierById = useCallback((id: string): Supplier | undefined => {
    return suppliers.find(s => s.id === id);
  }, [suppliers]);

  const addRequest = async (request: Omit<Request, 'id'>) => {
    const newRequest = { ...request, id: Date.now() }; 
    setRequests(prev => [newRequest as Request, ...prev]);
    const { error } = await supabase.from('requests').insert(newRequest);
    if (error) {
        console.error("Erro ao criar solicitação:", JSON.stringify(error, null, 2));
        if (error.code === '42703') {
             alert(`ERRO DE BANCO: Coluna inexistente. Execute o script SQL em Configurações.`);
        } else {
             alert(`Erro ao criar: ${error.message || JSON.stringify(error)}`);
        }
    }
  };

  const updateRequest = async (id: number, updatedRequest: Partial<Request>) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, ...updatedRequest } : r));
    
    // Limpeza de payload para evitar erros de banco
    const dbPayload: any = { 
        orderNumber: updatedRequest.orderNumber,
        requestDate: updatedRequest.requestDate,
        requester: updatedRequest.requester,
        sector: updatedRequest.sector,
        supplier: updatedRequest.supplier,
        description: updatedRequest.description,
        urgency: updatedRequest.urgency, // Novo campo
        purchaseOrderDate: updatedRequest.purchaseOrderDate, 
        deliveryDate: updatedRequest.deliveryDate,
        status: updatedRequest.status,
        responsible: updatedRequest.responsible,
        items: updatedRequest.items,
        customFields: updatedRequest.customFields,
        history: updatedRequest.history
    };
    
    // Remove chaves undefined
    const cleanPayload: any = {};
    Object.keys(dbPayload).forEach(key => {
        if (dbPayload[key] !== undefined) cleanPayload[key] = dbPayload[key];
    });

    const { error } = await supabase.from('requests').update(cleanPayload).eq('id', id);
    if (error) {
        console.error("Erro ao atualizar solicitação:", JSON.stringify(error, null, 2));
        if (error.code === '42703') {
             alert(`ERRO DE BANCO: Coluna inexistente (possivelmente 'urgency'). Execute o script SQL em Configurações.`);
        }
    }
  };

  const deleteRequest = async (id: number) => {
    setRequests(prev => prev.filter(r => r.id !== id));
    await supabase.from('requests').delete().eq('id', id);
  };
  
  const updateFormFields = async (fields: FormField[]) => {
    setFormFields(fields);
    for (const field of fields) {
        await supabase.from('form_fields').upsert(field);
    }
  };

  const addFormField = async (field: Pick<FormField, 'label' | 'type'>) => {
    const maxOrder = Math.max(...formFields.map(f => f.orderIndex || 0), 0);
    const newField: FormField = {
      ...field,
      id: `custom-${Date.now()}`,
      isActive: true,
      required: false,
      isStandard: false,
      isVisibleInList: true,
      orderIndex: maxOrder + 1
    };
    setFormFields(prev => [...prev, newField]);
    await supabase.from('form_fields').insert(newField);
  };

  const updateFormField = async (id: string, updatedField: Partial<FormField>) => {
    setFormFields(prev => prev.map(f => f.id === id ? { ...f, ...updatedField } : f));
    await supabase.from('form_fields').update(updatedField).eq('id', id);
  };

  const deleteFormField = async (id: string) => {
    setFormFields(prev => prev.filter(f => f.id !== id));
    await supabase.from('form_fields').delete().eq('id', id);
  };

  const addStatus = async (status: Omit<Status, 'id'>) => {
    const newStatus = { ...status, id: `status-${Date.now()}` };
    setStatuses(prev => [...prev, newStatus]);
    await supabase.from('statuses').insert(newStatus);
  };

  const updateStatus = async (id: string, updatedStatus: Partial<Status>) => {
    setStatuses(prev => prev.map(s => s.id === id ? { ...s, ...updatedStatus } : s));
    await supabase.from('statuses').update(updatedStatus).eq('id', id);
  };

  const deleteStatus = async (id: string) => {
    setStatuses(prev => prev.filter(s => s.id !== id));
    await supabase.from('statuses').delete().eq('id', id);
  };

  const addSupplier = async (supplier: Omit<Supplier, 'id'>) => {
      const newSupplier = { ...supplier, id: `supp-${Date.now()}` };
      setSuppliers(prev => [...prev, newSupplier]);
      const { error } = await supabase.from('suppliers').insert(newSupplier);
      if (error) alert(`Erro: ${error.message}`);
  };

  const updateSupplier = async (id: string, updatedSupplier: Partial<Supplier>) => {
      setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...updatedSupplier } : s));
      const payload: any = { ...updatedSupplier };
      delete payload.id;
      await supabase.from('suppliers').update(payload).eq('id', id);
  };

  const deleteSupplier = async (id: string) => {
      setSuppliers(prev => prev.filter(s => s.id !== id));
      await supabase.from('suppliers').delete().eq('id', id);
  };

  const updateAppConfig = async (config: Partial<AppConfig>) => {
      setAppConfig(prev => ({ ...prev, ...config }));
      const { error } = await supabase.from('app_config').update(config).eq('id', 1);
      if (error) {
          if (error.code === '42P01') {
              alert("Tabela app_config não existe. Atualize o banco.");
          } else {
              console.error(error);
          }
      }
  };

  return (
    <RequestContext.Provider value={{ requests, formFields, statuses, suppliers, appConfig, loading, getRequestById, getSupplierById, addRequest, updateRequest, deleteRequest, updateFormFields, addFormField, updateFormField, deleteFormField, addStatus, updateStatus, deleteStatus, addSupplier, updateSupplier, deleteSupplier, updateAppConfig }}>
      {children}
    </RequestContext.Provider>
  );
};

export const useRequests = () => {
  const context = useContext(RequestContext);
  if (context === undefined) {
    throw new Error('useRequests must be used within an RequestProvider');
  }
  return context;
};
