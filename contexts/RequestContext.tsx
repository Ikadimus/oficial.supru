
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Request, FormField, Status, Supplier, AppConfig, ThermalAnalysis, PriceMap, Measurement } from '../types';
import { supabase } from '../lib/supabaseClient';

interface RequestContextType {
  requests: Request[];
  formFields: FormField[];
  statuses: Status[];
  suppliers: Supplier[];
  appConfig: AppConfig;
  // Added: Thermal Analysis and Price Map states
  thermalAnalyses: ThermalAnalysis[];
  priceMaps: PriceMap[];
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

  // Added: Thermal Analysis and Price Map methods
  getThermalAnalysisById: (id: number) => ThermalAnalysis | undefined;
  addThermalAnalysis: (analysis: Omit<ThermalAnalysis, 'id'>) => Promise<void>;
  addMeasurement: (analysisId: number, measurement: Omit<Measurement, 'id'>) => Promise<void>;
  
  getPriceMapById: (id: number) => PriceMap | undefined;
  addPriceMap: (priceMap: Omit<PriceMap, 'id'>) => Promise<void>;
  updatePriceMap: (id: number, updatedPriceMap: Partial<PriceMap>) => Promise<void>;
}

const RequestContext = createContext<RequestContextType | undefined>(undefined);

export const RequestProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [appConfig, setAppConfig] = useState<AppConfig>({ id: 1, sla_excellent: 5, sla_good: 10 });
  // Added: Missing states for Thermal Analysis and Price Maps
  const [thermalAnalyses, setThermalAnalyses] = useState<ThermalAnalysis[]>([]);
  const [priceMaps, setPriceMaps] = useState<PriceMap[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
      const { data, error } = await supabase.from('requests').select('*').order('id', { ascending: false });
      if (error) console.error("Erro ao buscar solicitações:", error);
      if (data) setRequests(data);
  };

  const fetchConfigs = async () => {
      try {
        const { data: fieldsData } = await supabase.from('form_fields').select('*');
        if (fieldsData) setFormFields(fieldsData.sort((a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0)));

        const { data: statusesData } = await supabase.from('statuses').select('*');
        if (statusesData) setStatuses(statusesData);

        const { data: suppliersData } = await supabase.from('suppliers').select('*');
        if (suppliersData) setSuppliers(suppliersData);

        const { data: configData } = await supabase.from('app_config').select('*').single();
        if (configData) setAppConfig(configData);

        // Fetch Thermal Analyses
        const { data: thermalData } = await supabase.from('thermal_analyses').select('*');
        if (thermalData) setThermalAnalyses(thermalData);

        // Fetch Price Maps
        const { data: priceMapsData } = await supabase.from('price_maps').select('*');
        if (priceMapsData) setPriceMaps(priceMapsData);
      } catch (e) { console.log("DB Init or missing tables..."); }
  };

  const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchConfigs(), fetchRequests()]);
      setLoading(false);
  }

  useEffect(() => {
    loadAll();
    const channels = [
        supabase.channel('public:requests').on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, () => fetchRequests()).subscribe(),
        supabase.channel('public:thermal_analyses').on('postgres_changes', { event: '*', schema: 'public', table: 'thermal_analyses' }, () => fetchConfigs()).subscribe(),
        supabase.channel('public:price_maps').on('postgres_changes', { event: '*', schema: 'public', table: 'price_maps' }, () => fetchConfigs()).subscribe(),
    ];
    return () => { channels.forEach(c => supabase.removeChannel(c)); };
  }, []);

  const getRequestById = useCallback((id: number) => requests.find(r => r.id === id), [requests]);
  const getSupplierById = useCallback((id: string) => suppliers.find(s => s.id === id), [suppliers]);

  // Added: Logic for Thermal Analysis and Price Maps
  const getThermalAnalysisById = useCallback((id: number) => thermalAnalyses.find(a => a.id === id), [thermalAnalyses]);
  const getPriceMapById = useCallback((id: number) => priceMaps.find(pm => pm.id === id), [priceMaps]);

  const addRequest = async (request: Omit<Request, 'id'>) => {
    const { error } = await supabase.from('requests').insert(request);
    if (error) {
        console.error("Erro ao inserir solicitação:", error);
        throw error;
    }
    await fetchRequests();
  };

  const updateRequest = async (id: number, updatedRequest: Partial<Request>) => {
    const { id: _, ...dataToUpdate } = updatedRequest as any;
    const { error } = await supabase.from('requests').update(dataToUpdate).eq('id', id);
    if (error) {
        console.error("Erro ao atualizar solicitação:", error);
        throw error;
    }
    await fetchRequests();
  };

  const deleteRequest = async (id: number) => {
    const { error } = await supabase.from('requests').delete().eq('id', id);
    if (error) {
        console.error("Erro ao deletar solicitação:", error);
        throw error;
    }
    await fetchRequests();
  };

  const updateFormFields = async (fields: FormField[]) => {
    setFormFields(fields);
    for (const field of fields) { await supabase.from('form_fields').upsert(field); }
  };

  const addFormField = async (field: Pick<FormField, 'label' | 'type'>) => {
    const newField = { ...field, id: `custom-${Date.now()}`, isActive: true, required: false, isStandard: false, isVisibleInList: true, orderIndex: formFields.length + 1 };
    await supabase.from('form_fields').insert(newField);
    await fetchConfigs();
  };

  const updateFormField = async (id: string, updatedField: Partial<FormField>) => {
    await supabase.from('form_fields').update(updatedField).eq('id', id);
    await fetchConfigs();
  };

  const deleteFormField = async (id: string) => {
    await supabase.from('form_fields').delete().eq('id', id);
    await fetchConfigs();
  };

  const addStatus = async (status: Omit<Status, 'id'>) => {
    await supabase.from('statuses').insert({ ...status, id: `status-${Date.now()}` });
    await fetchConfigs();
  };

  const updateStatus = async (id: string, updatedStatus: Partial<Status>) => {
    await supabase.from('statuses').update(updatedStatus).eq('id', id);
    await fetchConfigs();
  };

  const deleteStatus = async (id: string) => {
    await supabase.from('statuses').delete().eq('id', id);
    await fetchConfigs();
  };

  const addSupplier = async (supplier: Omit<Supplier, 'id'>) => {
      await supabase.from('suppliers').insert({ ...supplier, id: `supp-${Date.now()}` });
      await fetchConfigs();
  };

  const updateSupplier = async (id: string, updatedSupplier: Partial<Supplier>) => {
      await supabase.from('suppliers').update(updatedSupplier).eq('id', id);
      await fetchConfigs();
  };

  const deleteSupplier = async (id: string) => {
      await supabase.from('suppliers').delete().eq('id', id);
      await fetchConfigs();
  };

  const updateAppConfig = async (config: Partial<AppConfig>) => {
      await supabase.from('app_config').update(config).eq('id', 1);
      await fetchConfigs();
  };

  // Added: Thermal Analysis and Price Map methods implementation
  const addThermalAnalysis = async (analysis: Omit<ThermalAnalysis, 'id'>) => {
    const { error } = await supabase.from('thermal_analyses').insert(analysis);
    if (error) throw error;
    await fetchConfigs();
  };

  const addMeasurement = async (analysisId: number, measurement: Omit<Measurement, 'id'>) => {
    const analysis = thermalAnalyses.find(a => a.id === analysisId);
    if (!analysis) return;
    
    const newMeasurement = { ...measurement, id: `m-${Date.now()}` };
    const updatedMeasurements = [...(analysis.measurements || []), newMeasurement];
    
    // Determine new status based on temperature
    const diff = Math.abs(measurement.measuredTemp - analysis.operatingTemp);
    let newStatus: 'Normal' | 'Atenção' | 'Crítico' = 'Normal';
    if (diff > analysis.criticalThreshold * 2) newStatus = 'Crítico';
    else if (diff > analysis.criticalThreshold) newStatus = 'Atenção';

    const { error } = await supabase.from('thermal_analyses').update({
        measurements: updatedMeasurements,
        lastMeasurementDate: measurement.date,
        status: newStatus
    }).eq('id', analysisId);

    if (error) throw error;
    await fetchConfigs();
  };

  const addPriceMap = async (priceMap: Omit<PriceMap, 'id'>) => {
    const { error } = await supabase.from('price_maps').insert(priceMap);
    if (error) throw error;
    await fetchConfigs();
  };

  const updatePriceMap = async (id: number, updatedPriceMap: Partial<PriceMap>) => {
    const { id: _, ...dataToUpdate } = updatedPriceMap as any;
    const { error } = await supabase.from('price_maps').update(dataToUpdate).eq('id', id);
    if (error) throw error;
    await fetchConfigs();
  };

  return (
    <RequestContext.Provider value={{ 
        requests, formFields, statuses, suppliers, appConfig, loading, 
        thermalAnalyses, priceMaps,
        getRequestById, getSupplierById, addRequest, updateRequest, deleteRequest, 
        updateFormFields, addFormField, updateFormField, deleteFormField, 
        addStatus, updateStatus, deleteStatus, addSupplier, updateSupplier, deleteSupplier, updateAppConfig,
        getThermalAnalysisById, addThermalAnalysis, addMeasurement,
        getPriceMapById, addPriceMap, updatePriceMap
    }}>
      {children}
    </RequestContext.Provider>
  );
};

export const useRequests = () => {
  const context = useContext(RequestContext);
  if (context === undefined) { throw new Error('useRequests must be used within an RequestProvider'); }
  return context;
};
