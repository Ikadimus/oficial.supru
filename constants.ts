
import { Request, FormField, Status, User, Sector } from './types';

export const initialSectors: Sector[] = [
  { id: 'sector-1', name: 'TI', description: 'Tecnologia da Informação' },
  { id: 'sector-2', name: 'RH', description: 'Recursos Humanos' },
  { id: 'sector-3', name: 'Financeiro', description: 'Departamento Financeiro' },
  { id: 'sector-4', name: 'Gerente', description: 'Gerência Geral - Visão Global' },
  { id: 'sector-5', name: 'Diretor', description: 'Diretoria - Visão Global' },
];

export const initialUsers: User[] = [
  { id: 1, name: 'Administrador', email: 'admin@empresa.com', password: 'admin123', role: 'admin', sector: 'TI' },
  { id: 2, name: 'John Doe', email: 'john@example.com', password: 'password', role: 'user', sector: 'RH' },
  { id: 3, name: 'Jane Smith', email: 'jane@example.com', password: 'password', role: 'user', sector: 'Financeiro' },
];

export const initialStatuses: Status[] = [
    { id: 'status-1', name: 'Pendente', color: 'yellow' },
    { id: 'status-2', name: 'Em Andamento', color: 'blue' },
    { id: 'status-3', name: 'Aguardando Peças', color: 'purple' },
    { id: 'status-4', name: 'Entregue', color: 'green' },
    { id: 'status-5', name: 'Cancelado', color: 'red' },
];

export const initialFormFields: FormField[] = [
    { id: 'orderNumber', label: 'Nº da Requisição RC', type: 'text', isActive: true, required: true, isStandard: true, isVisibleInList: true, orderIndex: 1 },
    { id: 'urgency', label: 'Urgência', type: 'select', isActive: true, required: true, isStandard: true, isVisibleInList: true, orderIndex: 2 },
    { id: 'requestDate', label: 'Data da Solicitação', type: 'date', isActive: true, required: true, isStandard: true, isVisibleInList: true, orderIndex: 3 },
    { id: 'requester', label: 'Solicitante', type: 'select', isActive: true, required: true, isStandard: true, isVisibleInList: true, orderIndex: 4 },
    { id: 'sector', label: 'Setor', type: 'select', isActive: true, required: true, isStandard: true, isVisibleInList: false, orderIndex: 5 },
    { id: 'description', label: 'Descrição', type: 'text', isActive: true, required: false, isStandard: true, isVisibleInList: true, orderIndex: 6 },
    { id: 'supplier', label: 'Fornecedor', type: 'text', isActive: true, required: true, isStandard: true, isVisibleInList: true, orderIndex: 7 },
    { id: 'purchaseOrderDate', label: 'Data da OC', type: 'date', isActive: true, required: false, isStandard: true, isVisibleInList: false, orderIndex: 8 },
    { id: 'forecastDate', label: 'Previsão de Entrega', type: 'date', isActive: true, required: false, isStandard: true, isVisibleInList: false, orderIndex: 9 },
    { id: 'deliveryDate', label: 'Data de Entrega', type: 'date', isActive: true, required: false, isStandard: true, isVisibleInList: false, orderIndex: 10 },
    { id: 'status', label: 'Status', type: 'select', isActive: true, required: true, isStandard: true, isVisibleInList: true, orderIndex: 11 },
    { id: 'responsible', label: 'Responsável (Atendimento)', type: 'select', isActive: true, required: true, isStandard: true, isVisibleInList: true, orderIndex: 12 },
    { id: 'notes', label: 'Observações', type: 'textarea', isActive: false, required: false, isStandard: false, isVisibleInList: false, orderIndex: 13 },
];

export const initialRequests: Request[] = [
  {
    id: 1,
    orderNumber: 'RC-001',
    requestDate: '2023-10-01',
    requester: 'John Doe',
    sector: 'TI',
    supplier: 'Fornecedor A',
    description: 'Compra de periféricos urgentes',
    deliveryDate: '2023-10-10',
    purchaseOrderDate: '2023-10-03',
    urgency: 'Alta',
    status: 'Entregue',
    responsible: 'Administrador',
    items: [
      { id: 'item-1', name: 'Mouse Gamer', quantity: 5, status: 'Entregue' },
      { id: 'item-2', name: 'Teclado Mecânico', quantity: 5, status: 'Entregue' },
    ],
    customFields: { notes: 'Urgente' }
  },
  {
    id: 2,
    orderNumber: 'RC-002',
    requestDate: '2023-10-02',
    requester: 'John Doe',
    sector: 'RH',
    supplier: 'Fornecedor B',
    description: 'Mobiliário para nova sala',
    forecastDate: '2023-10-15',
    urgency: 'Normal',
    status: 'Em Andamento',
    responsible: 'John Doe',
    items: [
      { id: 'item-3', name: 'Cadeira de Escritório', quantity: 2, status: 'Em Andamento' },
    ],
  },
];
