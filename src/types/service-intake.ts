// Service Intake Types

export type ServiceType = 'website' | 'chatbot' | 'voice_agent';

export type ServiceRequestStatus =
  | 'draft'
  | 'submitted'
  | 'in_review'
  | 'in_progress'
  | 'pending_info'
  | 'completed'
  | 'cancelled';

export interface ServiceRequest {
  id: string;
  user_id: string;
  service_type: ServiceType;
  title: string;
  status: ServiceRequestStatus;
  business_name: string | null;
  industry: string | null;
  target_audience: string | null;
  additional_notes: string | null;
  intake_data: WebsiteIntakeData | ChatbotIntakeData | VoiceAgentIntakeData | Record<string, unknown>;
  submitted_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  source: 'onboarding' | 'dashboard';
  onboarding_completed: boolean;
}

export interface ServiceRequestFile {
  id: string;
  service_request_id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  category: string | null;
  created_at: string;
}

// ============================================
// Website Intake Data
// ============================================

export interface WebsiteIntakeData {
  // Design preferences
  design_style: 'modern' | 'classic' | 'minimalist' | 'bold' | 'custom';
  color_preferences: string[];
  competitor_sites: string[];
  inspiration_sites: string[];

  // Content
  pages_needed: string[];
  has_existing_content: boolean;
  content_notes: string;

  // Technical
  integrations: string[];
  cms_preference: 'none' | 'sanity' | 'contentful' | 'strapi' | 'other';
  cms_other: string;
  domain_status: 'have_domain' | 'need_domain' | 'undecided';
  domain_name: string;

  // Brand
  has_logo: boolean;
  has_brand_guide: boolean;
}

// ============================================
// Chatbot Intake Data
// ============================================

export interface ChatbotIntakeData {
  // Business context
  products_services: string;
  website_url: string;

  // Knowledge base
  has_faq_doc: boolean;
  common_questions: string[];
  website_pages_to_scrape: string[];

  // Lead qualification
  qualification_criteria: string;
  ideal_customer: string;
  disqualification_criteria: string;

  // Conversation design
  greeting_message: string;
  handoff_trigger: string;
  escalation_email: string;

  // Integrations
  calendar_integration: 'none' | 'calendly' | 'cal_com' | 'google' | 'other';
  calendar_other: string;
  crm_integration: 'none' | 'hubspot' | 'salesforce' | 'pipedrive' | 'other';
  crm_other: string;
}

// ============================================
// Voice Agent Intake Data
// ============================================

export interface VoiceAgentIntakeData {
  // Use case
  use_case: 'inbound_support' | 'outbound_calls' | 'appointment_reminders' | 'other';
  use_case_description: string;

  // Voice preferences
  voice_gender: 'male' | 'female' | 'neutral';
  voice_accent: string;
  voice_personality: string;

  // Scripts
  sample_conversations: string;
  common_scenarios: string[];

  // Call handling
  operating_hours: string;
  overflow_action: 'voicemail' | 'transfer' | 'callback';
  escalation_number: string;

  // Phone
  phone_status: 'have_number' | 'need_number';
  existing_number: string;
}

// ============================================
// Form Step Types
// ============================================

export interface FormStep {
  id: string;
  title: string;
  description: string;
  fields: string[];
}

export const WEBSITE_STEPS: FormStep[] = [
  { id: 'business', title: 'Business Info', description: 'Tell us about your business', fields: ['business_name', 'industry', 'target_audience'] },
  { id: 'design', title: 'Design Preferences', description: 'What style are you looking for?', fields: ['design_style', 'color_preferences', 'competitor_sites', 'inspiration_sites'] },
  { id: 'content', title: 'Content Needs', description: 'What pages and content do you need?', fields: ['pages_needed', 'has_existing_content', 'content_notes'] },
  { id: 'technical', title: 'Technical Requirements', description: 'Integrations and technical needs', fields: ['integrations', 'cms_preference', 'domain_status', 'domain_name'] },
  { id: 'brand', title: 'Brand Assets', description: 'Upload your brand materials', fields: ['has_logo', 'has_brand_guide'] },
];

export const CHATBOT_STEPS: FormStep[] = [
  { id: 'business', title: 'Business Overview', description: 'Tell us about your business', fields: ['business_name', 'products_services', 'website_url'] },
  { id: 'knowledge', title: 'Knowledge Base', description: 'What should the chatbot know?', fields: ['has_faq_doc', 'common_questions', 'website_pages_to_scrape'] },
  { id: 'qualification', title: 'Lead Qualification', description: 'How should leads be qualified?', fields: ['qualification_criteria', 'ideal_customer', 'disqualification_criteria'] },
  { id: 'conversation', title: 'Conversation Design', description: 'Design the conversation flow', fields: ['greeting_message', 'handoff_trigger', 'escalation_email'] },
  { id: 'integrations', title: 'Integrations', description: 'Connect to your tools', fields: ['calendar_integration', 'crm_integration'] },
];

export const VOICE_AGENT_STEPS: FormStep[] = [
  { id: 'usecase', title: 'Use Case', description: 'What will the voice agent do?', fields: ['use_case', 'use_case_description'] },
  { id: 'voice', title: 'Voice Preferences', description: 'How should it sound?', fields: ['voice_gender', 'voice_accent', 'voice_personality'] },
  { id: 'scripts', title: 'Scripts & Scenarios', description: 'What conversations will it have?', fields: ['sample_conversations', 'common_scenarios'] },
  { id: 'handling', title: 'Call Handling', description: 'How should calls be handled?', fields: ['operating_hours', 'overflow_action', 'escalation_number'] },
  { id: 'phone', title: 'Phone Setup', description: 'Phone number configuration', fields: ['phone_status', 'existing_number'] },
];

// ============================================
// Service Metadata
// ============================================

export const SERVICE_METADATA: Record<ServiceType, {
  label: string;
  description: string;
  icon: string;
  steps: FormStep[];
}> = {
  website: {
    label: 'Custom Website',
    description: 'High-performance website custom-designed for your brand',
    icon: 'Globe',
    steps: WEBSITE_STEPS,
  },
  chatbot: {
    label: 'AI Chatbot',
    description: 'Intelligent chat agent trained on your business data',
    icon: 'MessageSquare',
    steps: CHATBOT_STEPS,
  },
  voice_agent: {
    label: 'Voice Agent',
    description: 'Human-grade AI for handling inbound/outbound calls',
    icon: 'Phone',
    steps: VOICE_AGENT_STEPS,
  },
};

// ============================================
// Status Metadata
// ============================================

export const STATUS_METADATA: Record<ServiceRequestStatus, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  draft: { label: 'Draft', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  submitted: { label: 'Submitted', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  in_review: { label: 'In Review', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  in_progress: { label: 'In Progress', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  pending_info: { label: 'Pending Info', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  completed: { label: 'Completed', color: 'text-green-600', bgColor: 'bg-green-100' },
  cancelled: { label: 'Cancelled', color: 'text-red-600', bgColor: 'bg-red-100' },
};
