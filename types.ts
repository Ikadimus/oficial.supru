
export interface RequestItem {
  id: string;
  name: string;
  quantity: number;
  status: string;
}

export interface RequestHistoryEntry {
  date: string;
  user: string;
  field: string;
  oldValue: string;
  newValue: string;
}

export interface Request {
  id: number;
  orderNumber: string;
  requestDate: string;
  requester: string;
  sector: string;
  supplier: string;
  description?: string;
  urgency?: 'Alta' | 'Normal' | 'Baixa';
  purchaseOrderDate?: string;
  forecastDate?: string;
  deliveryDate?: string;
  status: string;
  responsible: string;
  items: RequestItem[];
  customFields?: { [key: string]: any };
  history?: RequestHistoryEntry[];
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'select';
  isActive: boolean;
  required: boolean;
  isStandard: boolean;
  isVisibleInList?: boolean;
  orderIndex?: number;
}

export interface Status {
  id: string;
  name: string;
  color: 'yellow' | 'blue' | 'purple' | 'green' | 'red' | 'gray';
}

export interface AppConfig {
  id: number;
  sla_excellent: number;
  sla_good: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'user';
  sector: string;
}

export interface Sector {
  id: string;
  name: string;
  description: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  category?: string;
  rating?: number;
  notes?: string;
  city?: string;
  state?: string;
}

// Added missing PriceMap interfaces for procurement comparison
export interface PriceMapItem {
  id: string;
  description: string;
  unit: string;
  quantity: number;
}

export interface SupplierOffer {
  supplierId: string;
  supplierName: string;
  freight: number;
  deliveryDeadline: number;
  prices: { [itemId: string]: number };
}

export interface PriceMap {
  id: number;
  title: string;
  date: string;
  status: 'Aberta' | 'Finalizada';
  items: PriceMapItem[];
  offers: SupplierOffer[];
  responsible: string;
}

// Added missing ThermalAnalysis interfaces for asset monitoring
export interface ThermalMeasurement {
  id: string;
  date: string;
  measuredTemp: number;
  responsible: string;
  notes?: string;
}

export interface ThermalAnalysis {
  id: number;
  tag: string;
  equipmentName: string;
  sector: string;
  operatingTemp: number;
  criticalThreshold: number;
  status: 'Normal' | 'Atenção' | 'Crítico';
  lastMeasurementDate?: string;
  measurements: ThermalMeasurement[];
}
