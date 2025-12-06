
// Fix: Provide full content for types.ts to define data structures for the application.
export interface RequestItem {
  id: string;
  name: string;
  quantity: number;
  status: string;
}

export interface RequestHistoryEntry {
  date: string; // ISO string
  user: string;
  field: string;
  oldValue: string;
  newValue: string;
}

export interface Request {
  id: number;
  orderNumber: string;
  requestDate: string;
  requester: string; // Novo campo: Solicitante
  sector: string;
  supplier: string;
  description?: string;
  deliveryDate?: string;
  status: string;
  responsible: string; // Quem dá andamento
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
  isVisibleInList?: boolean; // New property to control visibility in the list
  orderIndex?: number;
}

export interface Status {
  id: string;
  name: string;
  color: 'yellow' | 'blue' | 'purple' | 'green' | 'red' | 'gray';
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