// Placeholder types for Supabase database

export interface Database {
  public: {
    Tables: {
      leads: { Row: Lead };
      companies: { Row: Company };
      tasks: { Row: Task };
      proposals: { Row: Proposal };
      projects: { Row: Project };
      workflows: { Row: Workflow };
    };
  };
}

export interface Lead {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  job_title: string | null;
  company_id: string | null;
  source: string | null;
  source_notes: string | null;
  notes: string | null;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  website: string | null;
  industry: string | null;
  size: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  due_time: string | null;
  lead_id: string | null;
  status: 'pending' | 'completed' | 'cancelled';
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Proposal {
  id: string;
  title: string;
  company_id: string | null;
  lead_id: string | null;
  line_items: unknown[];
  notes: string | null;
  valid_until: string | null;
  discount_percent: number;
  subtotal: number;
  total: number;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  title: string;
  description: string | null;
  company_id: string | null;
  lead_id: string | null;
  start_date: string | null;
  target_date: string | null;
  status: 'not_started' | 'in_progress' | 'review' | 'completed' | 'on_hold';
  created_at: string;
  updated_at: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string | null;
  status: 'draft' | 'active' | 'paused';
  trigger_type: string;
  trigger_config: unknown;
  steps: unknown[];
  outputs: unknown[];
  validation_errors: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
  run_count: number;
}
