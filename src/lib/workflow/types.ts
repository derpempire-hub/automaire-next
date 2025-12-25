// Workflow Designer Type Definitions

// ============================================
// Node Categories and Types
// ============================================

export type NodeCategory =
  | 'triggers'
  | 'actions'
  | 'logic'
  | 'ai'
  | 'integrations';

export type TriggerType =
  // Schedule triggers
  | 'schedule_daily'
  | 'schedule_weekly'
  | 'schedule_monthly'
  // Lead triggers
  | 'lead_created'
  | 'lead_status_changed'
  | 'lead_follow_up_due'
  // Project triggers
  | 'project_created'
  | 'project_status_changed'
  | 'project_milestone_reached'
  // Proposal triggers
  | 'proposal_sent'
  | 'proposal_viewed'
  | 'proposal_accepted'
  | 'proposal_declined'
  // Task triggers
  | 'task_created'
  | 'task_completed'
  | 'task_overdue'
  // Company triggers
  | 'company_created';

export type ActionType =
  | 'send_email'
  | 'update_crm'
  | 'create_task'
  | 'http_request'
  | 'send_sms'
  | 'slack_message';

export type LogicType =
  | 'condition'
  | 'delay'
  | 'loop'
  | 'parallel';

export type AIStepType =
  | 'gpt_processing'
  | 'sentiment_analysis'
  | 'data_enrichment'
  | 'text_classification';

export type WorkflowNodeType =
  | `trigger:${TriggerType}`
  | `action:${ActionType}`
  | `logic:${LogicType}`
  | `ai:${AIStepType}`
  | 'webhook:custom';

// ============================================
// Node Data Structures
// ============================================

export interface BaseNodeData {
  label: string;
  description?: string;
  isConfigured: boolean;
  hasErrors: boolean;
  errors?: string[];
}

export interface TriggerNodeData extends BaseNodeData {
  triggerType: TriggerType;
  config: TriggerConfig;
}

export interface ActionNodeData extends BaseNodeData {
  actionType: ActionType;
  config: ActionConfig;
}

export interface ConditionNodeData extends BaseNodeData {
  conditions: ConditionRule[];
  defaultBranch: 'true' | 'false';
}

export interface DelayNodeData extends BaseNodeData {
  delayType: 'fixed' | 'until_date' | 'until_time';
  duration?: { value: number; unit: 'minutes' | 'hours' | 'days' };
  untilDate?: string;
}

export interface AIStepNodeData extends BaseNodeData {
  aiType: AIStepType;
  prompt?: string;
  inputMapping: Record<string, string>;
  outputVariable: string;
}

export interface LoopNodeData extends BaseNodeData {
  iterateOver: string;
  itemVariable: string;
  maxIterations?: number;
}

export interface ParallelNodeData extends BaseNodeData {
  branches: string[];
  waitForAll: boolean;
}

export interface WebhookNodeData extends BaseNodeData {
  webhookUrl: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: string;
}

export type NodeData =
  | TriggerNodeData
  | ActionNodeData
  | ConditionNodeData
  | DelayNodeData
  | AIStepNodeData
  | LoopNodeData
  | ParallelNodeData
  | WebhookNodeData;

// ============================================
// Configuration Types
// ============================================

export interface TriggerConfig {
  new_lead?: {
    source?: string[];
    scoreThreshold?: number;
  };
  form_submission?: {
    formId: string;
    formName?: string;
  };
  schedule?: {
    cronExpression?: string;
    timezone: string;
    frequency: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom';
  };
  webhook?: {
    path: string;
    method: 'GET' | 'POST' | 'PUT';
    secret?: string;
  };
  manual?: {
    allowedRoles: string[];
  };
}

export interface ActionConfig {
  send_email?: {
    to: string;
    subject: string;
    body: string;
    templateId?: string;
  };
  update_crm?: {
    entity: 'lead' | 'company' | 'deal';
    operation: 'update' | 'create';
    fieldMappings: Record<string, string>;
  };
  create_task?: {
    title: string;
    description?: string;
    assignee?: string;
    dueDate?: string;
  };
  http_request?: {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    body?: string;
    authentication?: {
      type: 'none' | 'bearer' | 'basic' | 'api_key';
      config?: Record<string, string>;
    };
  };
  send_sms?: {
    to: string;
    message: string;
  };
  slack_message?: {
    channel: string;
    message: string;
    webhookUrl?: string;
  };
}

export interface ConditionRule {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value: string | number | boolean;
  logic?: 'and' | 'or';
}

// ============================================
// ReactFlow Node and Edge Types
// ============================================

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  position: { x: number; y: number };
  data: NodeData;
  selected?: boolean;
  dragging?: boolean;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  type?: 'default' | 'conditional';
  data?: {
    condition?: 'true' | 'false';
  };
}

// ============================================
// Serialization Types (for database storage)
// ============================================

export interface SerializedWorkflowStep {
  id: string;
  type: WorkflowNodeType;
  label: string;
  description?: string;
  config: Record<string, unknown>;
  position: { x: number; y: number };
  connections: {
    incoming: string[];
    outgoing: Array<{
      targetId: string;
      condition?: string;
    }>;
  };
}

export interface CanvasState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  viewport: { x: number; y: number; zoom: number };
}

// ============================================
// Workflow Design (Database Record)
// ============================================

export type WorkflowStatus = 'draft' | 'pending_review' | 'in_implementation' | 'active' | 'paused';

export interface WorkflowDesign {
  id: string;
  name: string;
  description: string | null;
  status: WorkflowStatus;
  trigger_type: TriggerType | string;
  trigger_config: TriggerConfig | Record<string, unknown>;
  steps: SerializedWorkflowStep[];
  canvas_state: CanvasState;
  outputs: WorkflowOutput[];
  validation_errors: ValidationError[];
  submission_notes?: string;
  submitted_at?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  reviewed_at?: string;
  reviewer_notes?: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  run_count: number;
}

export interface WorkflowOutput {
  id: string;
  name: string;
  type: 'variable' | 'webhook_response' | 'notification';
  config: Record<string, unknown>;
}

export interface ValidationError {
  nodeId?: string;
  field?: string;
  message: string;
  severity: 'error' | 'warning';
}

// ============================================
// Submission Types
// ============================================

export interface WorkflowSubmission {
  workflowId: string;
  notes: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  requestedCompletionDate?: string;
}

// ============================================
// Node Definition (for Node Registry)
// ============================================

export interface ConfigFieldDefinition {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'boolean' | 'json' | 'variable_picker' | 'condition_builder';
  required: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  helpText?: string;
  defaultValue?: unknown;
}

export interface NodeDefinition {
  type: WorkflowNodeType;
  category: NodeCategory;
  label: string;
  description: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind color class
  handles: {
    inputs: number;
    outputs: number | 'conditional';
  };
  configFields: ConfigFieldDefinition[];
  defaultData: Partial<BaseNodeData>;
}

// ============================================
// Canvas Event Types
// ============================================

export interface CanvasDropEvent {
  nodeType: WorkflowNodeType;
  position: { x: number; y: number };
}

export interface NodeSelectEvent {
  nodeId: string | null;
  node: WorkflowNode | null;
}

export interface ConnectionEvent {
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}
