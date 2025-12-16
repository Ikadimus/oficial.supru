
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Request, FormField, Status, Supplier } from '../types';
import { supabase } from '../lib/supabaseClient';
import { initialFormFields, initialStatuses } from '../constants';

interface RequestContextType {
  requests: Request[];
  formFields: FormField[];
  statuses: Status[];
  suppliers: Supplier[];
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
}

const RequestContext = createContext<RequestContextType | undefined>(undefined);

export const RequestProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
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
          // Ignora se o erro for tabela inexistente (AuthContext já trata isso)
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

        // --- SUPPLIERS ---
        const { data: suppliersData, error: suppliersError } = await supabase.from('suppliers').select('*');
        if (suppliersError && suppliersError.code !== 'PGRST205' && suppliersError.code !== '42P01') {
             // Apenas loga erro real
        } else if (suppliersData) {
            setSuppliers(suppliersData);
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
      
    const suppliersChannel = supabase
      .channel('public:suppliers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'suppliers' }, () => {
        fetchConfigs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(requestsChannel);
      supabase.removeChannel(fieldsChannel);
      supabase.removeChannel(statusesChannel);
      supabase.removeChannel(suppliersChannel);
    };
  }, []);

  // Usa useCallback para que a função seja estável e não cause re-renderizações desnecessárias em efeitos
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
    // 1. Atualização Otimista
    setRequests(prev => prev.map(r => r.id === id ? { ...r, ...updatedRequest } : r));

    try {
        // 2. Preparar Payload Seguro (Allow-list)
        // Definimos explicitamente apenas os campos que existem na tabela para evitar erro 400
        const dbPayload: any = {
            orderNumber: updatedRequest.orderNumber,
            requestDate: updatedRequest.requestDate,
            requester: updatedRequest.requester,
            sector: updatedRequest.sector,
            supplier: updatedRequest.supplier,
            description: updatedRequest.description,
            purchaseOrderDate: updatedRequest.purchaseOrderDate, // Assegura envio
            deliveryDate: updatedRequest.deliveryDate,
            status: updatedRequest.status,
            responsible: updatedRequest.responsible,
            items: updatedRequest.items,
            customFields: updatedRequest.customFields,
            history: updatedRequest.history // Garante que history seja enviado
        };

        // 3. Limpeza: Remover chaves estritamente undefined
        Object.keys(dbPayload).forEach(key => {
            if (dbPayload[key] === undefined) {
                delete dbPayload[key];
            }
        });

        // 4. Atualização no Banco
        const { error } = await supabase.from('requests').update(dbPayload).eq('id', id);
        
        if (error) {
            console.error("Supabase Error Details:", JSON.stringify(error, null, 2));
            if (error.code === '42703') {
                alert(`ERRO DE BANCO: Coluna inexistente. Por favor, execute o script SQL de atualização em Configurações.`);
            } else {
                alert(`Erro ao salvar no banco: ${error.message || JSON.stringify(error)}`);
            }
            throw error;
        }
    } catch (err) {
        console.error("Erro ao salvar atualização no banco:", err);
        throw err;
    }
  };

  const deleteRequest = async (id: number) => {
    setRequests(prev => prev.filter(r => r.id !== id));
    await supabase.from('requests').delete().eq('id', id);
  };
  
  const updateFormFields = async (fields: FormField[]) => {
    setFormFields(fields);
    for (const field of fields) {
        const { error } = await supabase.from('form_fields').upsert(field);
        if (error && error.code === '42703') {
             alert("Erro: Coluna faltante em form_fields. Execute o SQL de configuração.");
             break;
        }
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

  // --- SUPPLIER FUNCTIONS ---
  const addSupplier = async (supplier: Omit<Supplier, 'id'>) => {
      const newSupplier = { ...supplier, id: `supp-${Date.now()}` };
      // 1. Otimista
      setSuppliers(prev => [...prev, newSupplier]);

      // 2. Payload Cleaning
      const dbPayload = {
          id: newSupplier.id,
          name: newSupplier.name,
          "contactName": newSupplier.contactName || null, // Aspas para CamelCase
          email: newSupplier.email || null,
          phone: newSupplier.phone || null,
          category: newSupplier.category || null,
          rating: newSupplier.rating || 0,
          notes: newSupplier.notes || null
      };

      const { error } = await supabase.from('suppliers').insert(dbPayload);
      if (error) {
          console.error("Erro ao adicionar fornecedor:", error);
          if (error.code === '42P01') {
              alert("A tabela 'suppliers' não existe no banco. Por favor, vá em Login > Configurar > Copiar SQL e execute no Supabase.");
          } else if (error.code === '42703') {
              alert("Erro de coluna. Execute o script SQL novamente para atualizar a tabela.");
          } else {
             alert(`Erro ao salvar fornecedor: ${error.message}`);
          }
      }
  };

  const updateSupplier = async (id: string, updatedSupplier: Partial<Supplier>) => {
      // 1. Otimista
      setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...updatedSupplier } : s));
      
      // 2. Payload Cleaning (Garante que só envia colunas válidas)
      const dbPayload: any = {
          name: updatedSupplier.name,
          "contactName": updatedSupplier.contactName, // Aspas para CamelCase
          email: updatedSupplier.email,
          phone: updatedSupplier.phone,
          category: updatedSupplier.category,
          rating: updatedSupplier.rating,
          notes: updatedSupplier.notes
      };

      // Remove undefined para não enviar null se não foi alterado
      Object.keys(dbPayload).forEach(key => {
        if (dbPayload[key] === undefined) delete dbPayload[key];
      });

      const { error } = await supabase.from('suppliers').update(dbPayload).eq('id', id);
       if (error) {
          console.error("Erro ao atualizar fornecedor:", error);
          alert(`Erro ao salvar edição: ${error.message}`);
      }
  };

  const deleteSupplier = async (id: string) => {
      setSuppliers(prev => prev.filter(s => s.id !== id));
      await supabase.from('suppliers').delete().eq('id', id);
  };

  return (
    <RequestContext.Provider value={{ requests, formFields, statuses, suppliers, loading, getRequestById, getSupplierById, addRequest, updateRequest, deleteRequest, updateFormFields, addFormField, updateFormField, deleteFormField, addStatus, updateStatus, deleteStatus, addSupplier, updateSupplier, deleteSupplier }}>
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
