// Node Registry - Defines all available workflow nodes

import type {
  NodeDefinition,
  WorkflowNodeType,
  NodeCategory,
  BaseNodeData,
} from './types';

// ============================================
// Node Category Metadata
// ============================================

export const NODE_CATEGORIES: Record<NodeCategory, { label: string; description: string; color: string }> = {
  triggers: {
    label: 'Triggers',
    description: 'Start your workflow',
    color: 'bg-emerald-500',
  },
  actions: {
    label: 'Actions',
    description: 'Perform operations',
    color: 'bg-blue-500',
  },
  logic: {
    label: 'Logic',
    description: 'Control flow',
    color: 'bg-amber-500',
  },
  ai: {
    label: 'AI Steps',
    description: 'Smart automation',
    color: 'bg-purple-500',
  },
  integrations: {
    label: 'Integrations',
    description: 'Connect services',
    color: 'bg-pink-500',
  },
};

// ============================================
// Node Definitions
// ============================================

export const NODE_REGISTRY: Record<WorkflowNodeType, NodeDefinition> = {
  // ============================================
  // TRIGGERS - Schedule
  // ============================================
  'trigger:schedule_daily': {
    type: 'trigger:schedule_daily',
    category: 'triggers',
    label: 'Daily Schedule',
    description: 'Runs every day at a specified time',
    icon: 'Calendar',
    color: 'bg-emerald-500',
    handles: { inputs: 0, outputs: 1 },
    configFields: [
      {
        name: 'time',
        label: 'Time of Day',
        type: 'text',
        required: true,
        placeholder: '09:00',
        helpText: 'Time to run (24-hour format)',
      },
      {
        name: 'timezone',
        label: 'Timezone',
        type: 'select',
        required: true,
        defaultValue: 'America/New_York',
        options: [
          { value: 'America/New_York', label: 'Eastern Time' },
          { value: 'America/Chicago', label: 'Central Time' },
          { value: 'America/Denver', label: 'Mountain Time' },
          { value: 'America/Los_Angeles', label: 'Pacific Time' },
          { value: 'UTC', label: 'UTC' },
        ],
      },
    ],
    defaultData: { label: 'Daily Schedule', isConfigured: false, hasErrors: false },
  },

  'trigger:schedule_weekly': {
    type: 'trigger:schedule_weekly',
    category: 'triggers',
    label: 'Weekly Schedule',
    description: 'Runs on specific days each week',
    icon: 'Calendar',
    color: 'bg-emerald-500',
    handles: { inputs: 0, outputs: 1 },
    configFields: [
      {
        name: 'dayOfWeek',
        label: 'Day of Week',
        type: 'select',
        required: true,
        options: [
          { value: 'monday', label: 'Monday' },
          { value: 'tuesday', label: 'Tuesday' },
          { value: 'wednesday', label: 'Wednesday' },
          { value: 'thursday', label: 'Thursday' },
          { value: 'friday', label: 'Friday' },
          { value: 'saturday', label: 'Saturday' },
          { value: 'sunday', label: 'Sunday' },
        ],
      },
      {
        name: 'time',
        label: 'Time of Day',
        type: 'text',
        required: true,
        placeholder: '09:00',
      },
    ],
    defaultData: { label: 'Weekly Schedule', isConfigured: false, hasErrors: false },
  },

  'trigger:schedule_monthly': {
    type: 'trigger:schedule_monthly',
    category: 'triggers',
    label: 'Monthly Schedule',
    description: 'Runs on a specific day each month',
    icon: 'Calendar',
    color: 'bg-emerald-500',
    handles: { inputs: 0, outputs: 1 },
    configFields: [
      {
        name: 'dayOfMonth',
        label: 'Day of Month',
        type: 'number',
        required: true,
        placeholder: '1',
        helpText: '1-31 (will use last day if month is shorter)',
      },
      {
        name: 'time',
        label: 'Time of Day',
        type: 'text',
        required: true,
        placeholder: '09:00',
      },
    ],
    defaultData: { label: 'Monthly Schedule', isConfigured: false, hasErrors: false },
  },

  // ============================================
  // TRIGGERS - Leads
  // ============================================
  'trigger:lead_created': {
    type: 'trigger:lead_created',
    category: 'triggers',
    label: 'Lead Created',
    description: 'Triggers when a new lead is created',
    icon: 'UserPlus',
    color: 'bg-emerald-500',
    handles: { inputs: 0, outputs: 1 },
    configFields: [
      {
        name: 'source',
        label: 'Lead Source',
        type: 'select',
        required: false,
        placeholder: 'Any source',
        options: [
          { value: 'website', label: 'Website' },
          { value: 'referral', label: 'Referral' },
          { value: 'social', label: 'Social Media' },
          { value: 'ads', label: 'Paid Ads' },
        ],
        helpText: 'Filter by lead source (optional)',
      },
    ],
    defaultData: { label: 'Lead Created', isConfigured: true, hasErrors: false },
  },

  'trigger:lead_status_changed': {
    type: 'trigger:lead_status_changed',
    category: 'triggers',
    label: 'Lead Status Changed',
    description: 'Triggers when a lead status changes',
    icon: 'UserCheck',
    color: 'bg-emerald-500',
    handles: { inputs: 0, outputs: 1 },
    configFields: [
      {
        name: 'fromStatus',
        label: 'From Status',
        type: 'select',
        required: false,
        placeholder: 'Any status',
        options: [
          { value: 'new', label: 'New' },
          { value: 'contacted', label: 'Contacted' },
          { value: 'qualified', label: 'Qualified' },
          { value: 'unqualified', label: 'Unqualified' },
        ],
      },
      {
        name: 'toStatus',
        label: 'To Status',
        type: 'select',
        required: false,
        placeholder: 'Any status',
        options: [
          { value: 'new', label: 'New' },
          { value: 'contacted', label: 'Contacted' },
          { value: 'qualified', label: 'Qualified' },
          { value: 'unqualified', label: 'Unqualified' },
        ],
      },
    ],
    defaultData: { label: 'Lead Status Changed', isConfigured: true, hasErrors: false },
  },

  'trigger:lead_follow_up_due': {
    type: 'trigger:lead_follow_up_due',
    category: 'triggers',
    label: 'Lead Follow-up Due',
    description: 'Triggers when a lead follow-up is due',
    icon: 'Bell',
    color: 'bg-emerald-500',
    handles: { inputs: 0, outputs: 1 },
    configFields: [],
    defaultData: { label: 'Lead Follow-up Due', isConfigured: true, hasErrors: false },
  },

  // ============================================
  // TRIGGERS - Projects
  // ============================================
  'trigger:project_created': {
    type: 'trigger:project_created',
    category: 'triggers',
    label: 'Project Created',
    description: 'Triggers when a new project is created',
    icon: 'FolderPlus',
    color: 'bg-emerald-500',
    handles: { inputs: 0, outputs: 1 },
    configFields: [],
    defaultData: { label: 'Project Created', isConfigured: true, hasErrors: false },
  },

  'trigger:project_status_changed': {
    type: 'trigger:project_status_changed',
    category: 'triggers',
    label: 'Project Status Changed',
    description: 'Triggers when project status changes',
    icon: 'FolderCheck',
    color: 'bg-emerald-500',
    handles: { inputs: 0, outputs: 1 },
    configFields: [
      {
        name: 'toStatus',
        label: 'New Status',
        type: 'select',
        required: false,
        placeholder: 'Any status',
        options: [
          { value: 'planning', label: 'Planning' },
          { value: 'in_progress', label: 'In Progress' },
          { value: 'on_hold', label: 'On Hold' },
          { value: 'completed', label: 'Completed' },
        ],
      },
    ],
    defaultData: { label: 'Project Status Changed', isConfigured: true, hasErrors: false },
  },

  'trigger:project_milestone_reached': {
    type: 'trigger:project_milestone_reached',
    category: 'triggers',
    label: 'Milestone Reached',
    description: 'Triggers when a project milestone is reached',
    icon: 'Flag',
    color: 'bg-emerald-500',
    handles: { inputs: 0, outputs: 1 },
    configFields: [],
    defaultData: { label: 'Milestone Reached', isConfigured: true, hasErrors: false },
  },

  // ============================================
  // TRIGGERS - Proposals
  // ============================================
  'trigger:proposal_sent': {
    type: 'trigger:proposal_sent',
    category: 'triggers',
    label: 'Proposal Sent',
    description: 'Triggers when a proposal is sent',
    icon: 'Send',
    color: 'bg-emerald-500',
    handles: { inputs: 0, outputs: 1 },
    configFields: [],
    defaultData: { label: 'Proposal Sent', isConfigured: true, hasErrors: false },
  },

  'trigger:proposal_viewed': {
    type: 'trigger:proposal_viewed',
    category: 'triggers',
    label: 'Proposal Viewed',
    description: 'Triggers when a proposal is viewed',
    icon: 'Eye',
    color: 'bg-emerald-500',
    handles: { inputs: 0, outputs: 1 },
    configFields: [],
    defaultData: { label: 'Proposal Viewed', isConfigured: true, hasErrors: false },
  },

  'trigger:proposal_accepted': {
    type: 'trigger:proposal_accepted',
    category: 'triggers',
    label: 'Proposal Accepted',
    description: 'Triggers when a proposal is accepted',
    icon: 'CheckCircle',
    color: 'bg-emerald-500',
    handles: { inputs: 0, outputs: 1 },
    configFields: [],
    defaultData: { label: 'Proposal Accepted', isConfigured: true, hasErrors: false },
  },

  'trigger:proposal_declined': {
    type: 'trigger:proposal_declined',
    category: 'triggers',
    label: 'Proposal Declined',
    description: 'Triggers when a proposal is declined',
    icon: 'XCircle',
    color: 'bg-emerald-500',
    handles: { inputs: 0, outputs: 1 },
    configFields: [],
    defaultData: { label: 'Proposal Declined', isConfigured: true, hasErrors: false },
  },

  // ============================================
  // TRIGGERS - Tasks
  // ============================================
  'trigger:task_created': {
    type: 'trigger:task_created',
    category: 'triggers',
    label: 'Task Created',
    description: 'Triggers when a new task is created',
    icon: 'PlusSquare',
    color: 'bg-emerald-500',
    handles: { inputs: 0, outputs: 1 },
    configFields: [],
    defaultData: { label: 'Task Created', isConfigured: true, hasErrors: false },
  },

  'trigger:task_completed': {
    type: 'trigger:task_completed',
    category: 'triggers',
    label: 'Task Completed',
    description: 'Triggers when a task is completed',
    icon: 'CheckSquare',
    color: 'bg-emerald-500',
    handles: { inputs: 0, outputs: 1 },
    configFields: [],
    defaultData: { label: 'Task Completed', isConfigured: true, hasErrors: false },
  },

  'trigger:task_overdue': {
    type: 'trigger:task_overdue',
    category: 'triggers',
    label: 'Task Overdue',
    description: 'Triggers when a task becomes overdue',
    icon: 'AlertTriangle',
    color: 'bg-emerald-500',
    handles: { inputs: 0, outputs: 1 },
    configFields: [],
    defaultData: { label: 'Task Overdue', isConfigured: true, hasErrors: false },
  },

  // ============================================
  // TRIGGERS - Companies
  // ============================================
  'trigger:company_created': {
    type: 'trigger:company_created',
    category: 'triggers',
    label: 'Company Created',
    description: 'Triggers when a new company is created',
    icon: 'Building',
    color: 'bg-emerald-500',
    handles: { inputs: 0, outputs: 1 },
    configFields: [],
    defaultData: { label: 'Company Created', isConfigured: true, hasErrors: false },
  },

  // ============================================
  // ACTIONS
  // ============================================
  'action:send_email': {
    type: 'action:send_email',
    category: 'actions',
    label: 'Send Email',
    description: 'Send an email to a recipient',
    icon: 'Mail',
    color: 'bg-blue-500',
    handles: { inputs: 1, outputs: 1 },
    configFields: [
      {
        name: 'to',
        label: 'Recipient',
        type: 'variable_picker',
        required: true,
        placeholder: '{{lead.email}}',
        helpText: 'Email address or variable like {{lead.email}}',
      },
      {
        name: 'subject',
        label: 'Subject',
        type: 'text',
        required: true,
        placeholder: 'Welcome to our service!',
      },
      {
        name: 'body',
        label: 'Email Body',
        type: 'textarea',
        required: true,
        placeholder: 'Hi {{lead.first_name}},\n\nThank you for...',
        helpText: 'Use {{variable}} syntax for dynamic content',
      },
      {
        name: 'templateId',
        label: 'Email Template',
        type: 'select',
        required: false,
        placeholder: 'Custom email',
        options: [
          { value: 'welcome', label: 'Welcome Email' },
          { value: 'follow_up', label: 'Follow Up' },
          { value: 'proposal', label: 'Proposal' },
        ],
      },
    ],
    defaultData: {
      label: 'Send Email',
      isConfigured: false,
      hasErrors: false,
    },
  },

  'action:update_crm': {
    type: 'action:update_crm',
    category: 'actions',
    label: 'Update CRM',
    description: 'Update a record in the CRM',
    icon: 'Database',
    color: 'bg-blue-500',
    handles: { inputs: 1, outputs: 1 },
    configFields: [
      {
        name: 'entity',
        label: 'Entity Type',
        type: 'select',
        required: true,
        options: [
          { value: 'lead', label: 'Lead' },
          { value: 'company', label: 'Company' },
          { value: 'deal', label: 'Deal' },
        ],
      },
      {
        name: 'operation',
        label: 'Operation',
        type: 'select',
        required: true,
        options: [
          { value: 'update', label: 'Update Existing' },
          { value: 'create', label: 'Create New' },
        ],
      },
      {
        name: 'fieldMappings',
        label: 'Field Mappings',
        type: 'json',
        required: true,
        placeholder: '{"status": "qualified", "score": 85}',
        helpText: 'JSON object mapping fields to values',
      },
    ],
    defaultData: {
      label: 'Update CRM',
      isConfigured: false,
      hasErrors: false,
    },
  },

  'action:create_task': {
    type: 'action:create_task',
    category: 'actions',
    label: 'Create Task',
    description: 'Create a new task',
    icon: 'CheckSquare',
    color: 'bg-blue-500',
    handles: { inputs: 1, outputs: 1 },
    configFields: [
      {
        name: 'title',
        label: 'Task Title',
        type: 'text',
        required: true,
        placeholder: 'Follow up with {{lead.first_name}}',
      },
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        required: false,
        placeholder: 'Task details...',
      },
      {
        name: 'dueDate',
        label: 'Due Date',
        type: 'text',
        required: false,
        placeholder: '+3 days',
        helpText: 'Relative date like "+3 days" or specific date',
      },
    ],
    defaultData: {
      label: 'Create Task',
      isConfigured: false,
      hasErrors: false,
    },
  },

  'action:http_request': {
    type: 'action:http_request',
    category: 'actions',
    label: 'HTTP Request',
    description: 'Make an HTTP request',
    icon: 'Globe',
    color: 'bg-blue-500',
    handles: { inputs: 1, outputs: 1 },
    configFields: [
      {
        name: 'url',
        label: 'URL',
        type: 'text',
        required: true,
        placeholder: 'https://api.example.com/endpoint',
      },
      {
        name: 'method',
        label: 'Method',
        type: 'select',
        required: true,
        defaultValue: 'POST',
        options: [
          { value: 'GET', label: 'GET' },
          { value: 'POST', label: 'POST' },
          { value: 'PUT', label: 'PUT' },
          { value: 'DELETE', label: 'DELETE' },
        ],
      },
      {
        name: 'headers',
        label: 'Headers',
        type: 'json',
        required: false,
        placeholder: '{"Authorization": "Bearer ..."}',
      },
      {
        name: 'body',
        label: 'Request Body',
        type: 'textarea',
        required: false,
        placeholder: '{"key": "value"}',
      },
    ],
    defaultData: {
      label: 'HTTP Request',
      isConfigured: false,
      hasErrors: false,
    },
  },

  'action:send_sms': {
    type: 'action:send_sms',
    category: 'actions',
    label: 'Send SMS',
    description: 'Send a text message',
    icon: 'MessageSquare',
    color: 'bg-blue-500',
    handles: { inputs: 1, outputs: 1 },
    configFields: [
      {
        name: 'to',
        label: 'Phone Number',
        type: 'variable_picker',
        required: true,
        placeholder: '{{lead.phone}}',
      },
      {
        name: 'message',
        label: 'Message',
        type: 'textarea',
        required: true,
        placeholder: 'Hi {{lead.first_name}}, ...',
      },
    ],
    defaultData: {
      label: 'Send SMS',
      isConfigured: false,
      hasErrors: false,
    },
  },

  'action:slack_message': {
    type: 'action:slack_message',
    category: 'actions',
    label: 'Slack Message',
    description: 'Send a Slack message',
    icon: 'Hash',
    color: 'bg-blue-500',
    handles: { inputs: 1, outputs: 1 },
    configFields: [
      {
        name: 'channel',
        label: 'Channel',
        type: 'text',
        required: true,
        placeholder: '#sales-alerts',
      },
      {
        name: 'message',
        label: 'Message',
        type: 'textarea',
        required: true,
        placeholder: 'New lead: {{lead.first_name}} {{lead.last_name}}',
      },
    ],
    defaultData: {
      label: 'Slack Message',
      isConfigured: false,
      hasErrors: false,
    },
  },

  // ============================================
  // LOGIC
  // ============================================
  'logic:condition': {
    type: 'logic:condition',
    category: 'logic',
    label: 'If/Else',
    description: 'Branch based on conditions',
    icon: 'GitBranch',
    color: 'bg-amber-500',
    handles: { inputs: 1, outputs: 'conditional' },
    configFields: [
      {
        name: 'conditions',
        label: 'Conditions',
        type: 'condition_builder',
        required: true,
        helpText: 'Define the conditions for branching',
      },
    ],
    defaultData: {
      label: 'If/Else',
      isConfigured: false,
      hasErrors: false,
    },
  },

  'logic:delay': {
    type: 'logic:delay',
    category: 'logic',
    label: 'Delay',
    description: 'Wait for a specified time',
    icon: 'Clock',
    color: 'bg-amber-500',
    handles: { inputs: 1, outputs: 1 },
    configFields: [
      {
        name: 'delayType',
        label: 'Delay Type',
        type: 'select',
        required: true,
        options: [
          { value: 'fixed', label: 'Fixed Duration' },
          { value: 'until_date', label: 'Until Specific Date' },
          { value: 'until_time', label: 'Until Time of Day' },
        ],
      },
      {
        name: 'durationValue',
        label: 'Duration',
        type: 'number',
        required: false,
        placeholder: '5',
      },
      {
        name: 'durationUnit',
        label: 'Unit',
        type: 'select',
        required: false,
        options: [
          { value: 'minutes', label: 'Minutes' },
          { value: 'hours', label: 'Hours' },
          { value: 'days', label: 'Days' },
        ],
      },
    ],
    defaultData: {
      label: 'Delay',
      isConfigured: false,
      hasErrors: false,
    },
  },

  'logic:loop': {
    type: 'logic:loop',
    category: 'logic',
    label: 'Loop',
    description: 'Iterate over a list',
    icon: 'Repeat',
    color: 'bg-amber-500',
    handles: { inputs: 1, outputs: 1 },
    configFields: [
      {
        name: 'iterateOver',
        label: 'Iterate Over',
        type: 'variable_picker',
        required: true,
        placeholder: '{{response.items}}',
        helpText: 'Variable containing the array to iterate',
      },
      {
        name: 'itemVariable',
        label: 'Item Variable Name',
        type: 'text',
        required: true,
        defaultValue: 'item',
        helpText: 'Name for the current item (use as {{item}})',
      },
      {
        name: 'maxIterations',
        label: 'Max Iterations',
        type: 'number',
        required: false,
        placeholder: '100',
        helpText: 'Safety limit to prevent infinite loops',
      },
    ],
    defaultData: {
      label: 'Loop',
      isConfigured: false,
      hasErrors: false,
    },
  },

  'logic:parallel': {
    type: 'logic:parallel',
    category: 'logic',
    label: 'Parallel',
    description: 'Run multiple branches simultaneously',
    icon: 'GitFork',
    color: 'bg-amber-500',
    handles: { inputs: 1, outputs: 1 },
    configFields: [
      {
        name: 'waitForAll',
        label: 'Wait for All',
        type: 'boolean',
        required: true,
        defaultValue: true,
        helpText: 'Wait for all branches to complete before continuing',
      },
    ],
    defaultData: {
      label: 'Parallel',
      isConfigured: true,
      hasErrors: false,
    },
  },

  // ============================================
  // AI STEPS
  // ============================================
  'ai:gpt_processing': {
    type: 'ai:gpt_processing',
    category: 'ai',
    label: 'AI Processing',
    description: 'Process data with GPT',
    icon: 'Brain',
    color: 'bg-purple-500',
    handles: { inputs: 1, outputs: 1 },
    configFields: [
      {
        name: 'prompt',
        label: 'Prompt Template',
        type: 'textarea',
        required: true,
        placeholder: 'Analyze this lead and suggest follow-up actions:\n\nName: {{lead.first_name}} {{lead.last_name}}\nCompany: {{lead.company}}\nScore: {{lead.score}}',
        helpText: 'Use {{variable}} syntax for dynamic content',
      },
      {
        name: 'outputVariable',
        label: 'Output Variable',
        type: 'text',
        required: true,
        defaultValue: 'ai_response',
        helpText: 'Store result as {{ai_response}}',
      },
    ],
    defaultData: {
      label: 'AI Processing',
      isConfigured: false,
      hasErrors: false,
    },
  },

  'ai:sentiment_analysis': {
    type: 'ai:sentiment_analysis',
    category: 'ai',
    label: 'Sentiment Analysis',
    description: 'Analyze text sentiment',
    icon: 'Heart',
    color: 'bg-purple-500',
    handles: { inputs: 1, outputs: 1 },
    configFields: [
      {
        name: 'textField',
        label: 'Text to Analyze',
        type: 'variable_picker',
        required: true,
        placeholder: '{{email.body}}',
      },
      {
        name: 'outputVariable',
        label: 'Output Variable',
        type: 'text',
        required: true,
        defaultValue: 'sentiment',
        helpText: 'Result will be positive, negative, or neutral',
      },
    ],
    defaultData: {
      label: 'Sentiment Analysis',
      isConfigured: false,
      hasErrors: false,
    },
  },

  'ai:data_enrichment': {
    type: 'ai:data_enrichment',
    category: 'ai',
    label: 'Data Enrichment',
    description: 'Enrich data with AI',
    icon: 'Sparkles',
    color: 'bg-purple-500',
    handles: { inputs: 1, outputs: 1 },
    configFields: [
      {
        name: 'enrichmentType',
        label: 'Enrichment Type',
        type: 'select',
        required: true,
        options: [
          { value: 'company_info', label: 'Company Information' },
          { value: 'linkedin_profile', label: 'LinkedIn Profile' },
          { value: 'email_validation', label: 'Email Validation' },
        ],
      },
      {
        name: 'inputField',
        label: 'Input',
        type: 'variable_picker',
        required: true,
        placeholder: '{{lead.company}}',
      },
    ],
    defaultData: {
      label: 'Data Enrichment',
      isConfigured: false,
      hasErrors: false,
    },
  },

  'ai:text_classification': {
    type: 'ai:text_classification',
    category: 'ai',
    label: 'Text Classification',
    description: 'Classify text into categories',
    icon: 'Tags',
    color: 'bg-purple-500',
    handles: { inputs: 1, outputs: 1 },
    configFields: [
      {
        name: 'textField',
        label: 'Text to Classify',
        type: 'variable_picker',
        required: true,
        placeholder: '{{email.subject}}',
      },
      {
        name: 'categories',
        label: 'Categories',
        type: 'text',
        required: true,
        placeholder: 'inquiry, support, complaint, feedback',
        helpText: 'Comma-separated list of categories',
      },
      {
        name: 'outputVariable',
        label: 'Output Variable',
        type: 'text',
        required: true,
        defaultValue: 'category',
      },
    ],
    defaultData: {
      label: 'Text Classification',
      isConfigured: false,
      hasErrors: false,
    },
  },

  // ============================================
  // INTEGRATIONS
  // ============================================
  'webhook:custom': {
    type: 'webhook:custom',
    category: 'integrations',
    label: 'Custom Webhook',
    description: 'Call a custom webhook endpoint',
    icon: 'Webhook',
    color: 'bg-pink-500',
    handles: { inputs: 1, outputs: 1 },
    configFields: [
      {
        name: 'url',
        label: 'Webhook URL',
        type: 'text',
        required: true,
        placeholder: 'https://hooks.example.com/trigger',
      },
      {
        name: 'method',
        label: 'Method',
        type: 'select',
        required: true,
        defaultValue: 'POST',
        options: [
          { value: 'GET', label: 'GET' },
          { value: 'POST', label: 'POST' },
          { value: 'PUT', label: 'PUT' },
          { value: 'DELETE', label: 'DELETE' },
        ],
      },
      {
        name: 'payload',
        label: 'Payload',
        type: 'textarea',
        required: false,
        placeholder: '{"lead_id": "{{lead.id}}", "event": "qualified"}',
      },
    ],
    defaultData: {
      label: 'Custom Webhook',
      isConfigured: false,
      hasErrors: false,
    },
  },
};

// ============================================
// Helper Functions
// ============================================

export function getNodesByCategory(category: NodeCategory): NodeDefinition[] {
  return Object.values(NODE_REGISTRY).filter(node => node.category === category);
}

export function getNodeDefinition(type: WorkflowNodeType): NodeDefinition | undefined {
  return NODE_REGISTRY[type];
}

export function getAllNodeTypes(): WorkflowNodeType[] {
  return Object.keys(NODE_REGISTRY) as WorkflowNodeType[];
}

export function createDefaultNodeData(type: WorkflowNodeType): BaseNodeData {
  const definition = NODE_REGISTRY[type];
  if (!definition) {
    return {
      label: 'Unknown Node',
      isConfigured: false,
      hasErrors: true,
      errors: ['Unknown node type'],
    };
  }

  return {
    label: definition.label,
    description: definition.description,
    isConfigured: definition.defaultData.isConfigured ?? false,
    hasErrors: definition.defaultData.hasErrors ?? false,
    ...definition.defaultData,
  };
}
