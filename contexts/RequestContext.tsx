
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Request, FormField, Status, Supplier, AppConfig, PriceMap, ThermalAnalysis, ThermalMeasurement } from '../types';
import { supabase } from '../lib/supabaseClient';
import { initialFormFields, initialStatuses } from '../constants';

interface RequestContextType {
  requests: Request[];
  formFields: FormField[];
  statuses: Status[];
  suppliers: Supplier[];
  priceMaps: PriceMap[];
  thermalAnalyses: ThermalAnalysis[];
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

  // Price Map Operations
  getPriceMapById: (id: number) => PriceMap | undefined;
  addPriceMap: (priceMap: Omit<PriceMap, 'id'>) => Promise<void>;
  updatePriceMap: (id: number, updatedPriceMap: Partial<PriceMap>) => Promise<void>;
  
  // Thermal Analysis Operations
  getThermalAnalysisById: (id: number) => ThermalAnalysis | undefined;
  addThermalAnalysis: (analysis: Omit<ThermalAnalysis, 'id'>) => Promise<void>;
  addMeasurement: (analysisId: number, measurement: Omit<ThermalMeasurement, 'id'>) => Promise<void>;
}

const RequestContext = createContext<RequestContextType | undefined>(undefined);

export const RequestProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [priceMaps, setPriceMaps] = useState<PriceMap[]>([]);
  const [thermalAnalyses, setThermalAnalyses] = useState<ThermalAnalysis[]>([]);
  const [appConfig, setAppConfig] = useState<AppConfig>({ id: 1, sla_excellent: 5, sla_good: 10 });
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
      const { data } = await supabase.from('requests').select('*').order('id', { ascending: false });
      if (data) setRequests(data);
  };

  const fetchPriceMaps = async () => {
      const { data } = await supabase.from('price_maps').select('*').order('id', { ascending: false });
      if (data) setPriceMaps(data);
  }

  const fetchThermalAnalyses = async () => {
      const { data } = await supabase.from('thermal_analyses').select('*').order('id', { ascending: false });
      if (data) setThermalAnalyses(data);
  }

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
      } catch (e) { console.log("DB Init..."); }
  };

  const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchConfigs(), fetchRequests(), fetchPriceMaps(), fetchThermalAnalyses()]);
      setLoading(false);
  }

  useEffect(() => {
    loadAll();
    const channels = [
        supabase.channel('public:requests').on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, () => fetchRequests()).subscribe(),
        supabase.channel('public:price_maps').on('postgres_changes', { event: '*', schema: 'public', table: 'price_maps' }, () => fetchPriceMaps()).subscribe(),
        supabase.channel('public:thermal_analyses').on('postgres_changes', { event: '*', schema: 'public', table: 'thermal_analyses' }, () => fetchThermalAnalyses()).subscribe(),
    ];
    return () => { channels.forEach(c => supabase.removeChannel(c)); };
  }, []);

  const getRequestById = useCallback((id: number) => requests.find(r => r.id === id), [requests]);
  const getSupplierById = useCallback((id: string) => suppliers.find(s => s.id === id), [suppliers]);

  const addRequest = async (request: Omit<Request, 'id'>) => {
    const newRequest = { ...request, id: Date.now() }; 
    await supabase.from('requests').insert(newRequest);
  };

  const updateRequest = async (id: number, updatedRequest: Partial<Request>) => {
    await supabase.from('requests').update(updatedRequest).eq('id', id);
  };

  const deleteRequest = async (id: number) => {
    await supabase.from('requests').delete().eq('id', id);
  };

  const updateFormFields = async (fields: FormField[]) => {
    setFormFields(fields);
    for (const field of fields) { await supabase.from('form_fields').upsert(field); }
  };

  const addFormField = async (field: Pick<FormField, 'label' | 'type'>) => {
    const newField = { ...field, id: `custom-${Date.now()}`, isActive: true, required: false, isStandard: false, isVisibleInList: true, orderIndex: formFields.length + 1 };
    await supabase.from('form_fields').insert(newField);
  };

  const updateFormField = async (id: string, updatedField: Partial<FormField>) => {
    await supabase.from('form_fields').update(updatedField).eq('id', id);
  };

  const deleteFormField = async (id: string) => {
    await supabase.from('form_fields').delete().eq('id', id);
  };

  const addStatus = async (status: Omit<Status, 'id'>) => {
    await supabase.from('statuses').insert({ ...status, id: `status-${Date.now()}` });
  };

  const updateStatus = async (id: string, updatedStatus: Partial<Status>) => {
    await supabase.from('statuses').update(updatedStatus).eq('id', id);
  };

  const deleteStatus = async (id: string) => {
    await supabase.from('statuses').delete().eq('id', id);
  };

  const addSupplier = async (supplier: Omit<Supplier, 'id'>) => {
      await supabase.from('suppliers').insert({ ...supplier, id: `supp-${Date.now()}` });
  };

  const updateSupplier = async (id: string, updatedSupplier: Partial<Supplier>) => {
      await supabase.from('suppliers').update(updatedSupplier).eq('id', id);
  };

  const deleteSupplier = async (id: string) => {
      await supabase.from('suppliers').delete().eq('id', id);
  };

  const updateAppConfig = async (config: Partial<AppConfig>) => {
      await supabase.from('app_config').update(config).eq('id', 1);
  };

  // Price Map Handlers
  const getPriceMapById = useCallback((id: number) => priceMaps.find(pm => pm.id === id), [priceMaps]);
  
  const addPriceMap = async (priceMap: Omit<PriceMap, 'id'>) => {
    const newMap = { ...priceMap, id: Date.now() };
    await supabase.from('price_maps').insert(newMap);
  };

  const updatePriceMap = async (id: number, updatedPriceMap: Partial<PriceMap>) => {
    await supabase.from('price_maps').update(updatedPriceMap).eq('id', id);
  };

  // Thermal Analysis Handlers
  const getThermalAnalysisById = useCallback((id: number) => thermalAnalyses.find(ta => ta.id === id), [thermalAnalyses]);

  const addThermalAnalysis = async (analysis: Omit<ThermalAnalysis, 'id'>) => {
    const newAnalysis = { ...analysis, id: Date.now() };
    await supabase.from('thermal_analyses').insert(newAnalysis);
  };

  const addMeasurement = async (analysisId: number, measurement: Omit<ThermalMeasurement, 'id'>) => {
    const analysis = thermalAnalyses.find(ta => ta.id === analysisId);
    if (!analysis) return;

    const newMeasurement = { ...measurement, id: `m-${Date.now()}` };
    const updatedMeasurements = [...(analysis.measurements || []), newMeasurement];
    
    // Determine equipment status based on measured temperature thresholds
    let newStatus: 'Normal' | 'Atenção' | 'Crítico' = 'Normal';
    const diff = Math.abs(newMeasurement.measuredTemp - analysis.operatingTemp);
    if (diff > analysis.criticalThreshold * 1.5) newStatus = 'Crítico';
    else if (diff > analysis.criticalThreshold) newStatus = 'Atenção';

    await supabase.from('thermal_analyses').update({ 
      measurements: updatedMeasurements,
      status: newStatus,
      lastMeasurementDate: newMeasurement.date
    }).eq('id', analysisId);
  };

  return (
    <RequestContext.Provider value={{ requests, formFields, statuses, suppliers, priceMaps, thermalAnalyses, appConfig, loading, getRequestById, getSupplierById, addRequest, updateRequest, deleteRequest, updateFormFields, addFormField, updateFormField, deleteFormField, addStatus, updateStatus, deleteStatus, addSupplier, updateSupplier, deleteSupplier, updateAppConfig, getPriceMapById, addPriceMap, updatePriceMap, getThermalAnalysisById, addThermalAnalysis, addMeasurement }}>
      {children}
    </RequestContext.Provider>
  );
};

export const useRequests = () => {
  const context = useContext(RequestContext);
  if (context === undefined) { throw new Error('useRequests must be used within an RequestProvider'); }
  return context;
};
