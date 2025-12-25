'use client';

import { useState, useCallback, useEffect } from 'react';
import { Save, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileUploadField } from '@/components/service-intake/FileManager';
import type { ChatbotIntakeData } from '@/types/service-intake';
import { useDebouncedCallback } from 'use-debounce';

interface ChatbotIntakeFormProps {
  serviceRequestId: string;
  initialData: Partial<ChatbotIntakeData> | Record<string, unknown>;
  businessName: string;
  industry: string;
  targetAudience: string;
  onSave: (data: {
    intake_data: Record<string, unknown>;
    business_name?: string;
    industry?: string;
    target_audience?: string;
  }) => Promise<void>;
  isSaving: boolean;
}

const CALENDAR_OPTIONS = [
  { value: 'none', label: 'No calendar integration' },
  { value: 'calendly', label: 'Calendly' },
  { value: 'cal_com', label: 'Cal.com' },
  { value: 'google', label: 'Google Calendar' },
  { value: 'other', label: 'Other' },
];

const CRM_OPTIONS = [
  { value: 'none', label: 'No CRM integration' },
  { value: 'hubspot', label: 'HubSpot' },
  { value: 'salesforce', label: 'Salesforce' },
  { value: 'pipedrive', label: 'Pipedrive' },
  { value: 'other', label: 'Other' },
];

const INDUSTRY_OPTIONS = [
  'Technology',
  'Healthcare',
  'Finance',
  'Retail/E-commerce',
  'Education',
  'Real Estate',
  'Professional Services',
  'Manufacturing',
  'Food & Beverage',
  'Travel & Hospitality',
  'Non-Profit',
  'Other',
];

export function ChatbotIntakeForm({
  serviceRequestId,
  initialData,
  businessName: initialBusinessName,
  industry: initialIndustry,
  targetAudience: initialTargetAudience,
  onSave,
  isSaving,
}: ChatbotIntakeFormProps) {
  // Business info
  const [businessName, setBusinessName] = useState(initialBusinessName);
  const [industry, setIndustry] = useState(initialIndustry);
  const [targetAudience, setTargetAudience] = useState(initialTargetAudience);

  // Intake data
  const [productsServices, setProductsServices] = useState(
    (initialData as ChatbotIntakeData)?.products_services || ''
  );
  const [websiteUrl, setWebsiteUrl] = useState(
    (initialData as ChatbotIntakeData)?.website_url || ''
  );
  const [hasFaqDoc, setHasFaqDoc] = useState(
    (initialData as ChatbotIntakeData)?.has_faq_doc || false
  );
  const [commonQuestions, setCommonQuestions] = useState<string[]>(
    (initialData as ChatbotIntakeData)?.common_questions || []
  );
  const [websitePagesToScrape, setWebsitePagesToScrape] = useState<string[]>(
    (initialData as ChatbotIntakeData)?.website_pages_to_scrape || []
  );
  const [qualificationCriteria, setQualificationCriteria] = useState(
    (initialData as ChatbotIntakeData)?.qualification_criteria || ''
  );
  const [idealCustomer, setIdealCustomer] = useState(
    (initialData as ChatbotIntakeData)?.ideal_customer || ''
  );
  const [disqualificationCriteria, setDisqualificationCriteria] = useState(
    (initialData as ChatbotIntakeData)?.disqualification_criteria || ''
  );
  const [greetingMessage, setGreetingMessage] = useState(
    (initialData as ChatbotIntakeData)?.greeting_message || ''
  );
  const [handoffTrigger, setHandoffTrigger] = useState(
    (initialData as ChatbotIntakeData)?.handoff_trigger || ''
  );
  const [escalationEmail, setEscalationEmail] = useState(
    (initialData as ChatbotIntakeData)?.escalation_email || ''
  );
  const [calendarIntegration, setCalendarIntegration] = useState<string>(
    (initialData as ChatbotIntakeData)?.calendar_integration || 'none'
  );
  const [calendarOther, setCalendarOther] = useState(
    (initialData as ChatbotIntakeData)?.calendar_other || ''
  );
  const [crmIntegration, setCrmIntegration] = useState<string>(
    (initialData as ChatbotIntakeData)?.crm_integration || 'none'
  );
  const [crmOther, setCrmOther] = useState(
    (initialData as ChatbotIntakeData)?.crm_other || ''
  );

  // Input states
  const [newQuestion, setNewQuestion] = useState('');
  const [newPageUrl, setNewPageUrl] = useState('');

  // Build the data object
  const buildIntakeData = useCallback((): ChatbotIntakeData => ({
    products_services: productsServices,
    website_url: websiteUrl,
    has_faq_doc: hasFaqDoc,
    common_questions: commonQuestions,
    website_pages_to_scrape: websitePagesToScrape,
    qualification_criteria: qualificationCriteria,
    ideal_customer: idealCustomer,
    disqualification_criteria: disqualificationCriteria,
    greeting_message: greetingMessage,
    handoff_trigger: handoffTrigger,
    escalation_email: escalationEmail,
    calendar_integration: calendarIntegration as ChatbotIntakeData['calendar_integration'],
    calendar_other: calendarOther,
    crm_integration: crmIntegration as ChatbotIntakeData['crm_integration'],
    crm_other: crmOther,
  }), [
    productsServices, websiteUrl, hasFaqDoc, commonQuestions, websitePagesToScrape,
    qualificationCriteria, idealCustomer, disqualificationCriteria, greetingMessage,
    handoffTrigger, escalationEmail, calendarIntegration, calendarOther,
    crmIntegration, crmOther,
  ]);

  // Debounced auto-save
  const debouncedSave = useDebouncedCallback(
    async () => {
      await onSave({
        intake_data: buildIntakeData() as unknown as Record<string, unknown>,
        business_name: businessName,
        industry,
        target_audience: targetAudience,
      });
    },
    1500
  );

  // Auto-save on changes
  useEffect(() => {
    debouncedSave();
  }, [
    businessName, industry, targetAudience, productsServices, websiteUrl,
    hasFaqDoc, commonQuestions, websitePagesToScrape, qualificationCriteria,
    idealCustomer, disqualificationCriteria, greetingMessage, handoffTrigger,
    escalationEmail, calendarIntegration, calendarOther, crmIntegration,
    crmOther, debouncedSave,
  ]);

  const addQuestion = () => {
    if (newQuestion && !commonQuestions.includes(newQuestion)) {
      setCommonQuestions([...commonQuestions, newQuestion]);
      setNewQuestion('');
    }
  };

  const addPageUrl = () => {
    if (newPageUrl && !websitePagesToScrape.includes(newPageUrl)) {
      setWebsitePagesToScrape([...websitePagesToScrape, newPageUrl]);
      setNewPageUrl('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Saving indicator */}
      {isSaving && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <Save className="h-4 w-4 animate-pulse" />
          Saving...
        </div>
      )}

      {/* Business Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Business Overview</CardTitle>
          <CardDescription>Tell us about your business</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Your Company Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry *</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRY_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="productsServices">Products/Services *</Label>
            <Textarea
              id="productsServices"
              value={productsServices}
              onChange={(e) => setProductsServices(e.target.value)}
              placeholder="Describe your main products or services"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="websiteUrl">Website URL</Label>
            <Input
              id="websiteUrl"
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAudience">Target Audience *</Label>
            <Textarea
              id="targetAudience"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="Describe your ideal customers"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Knowledge Base */}
      <Card>
        <CardHeader>
          <CardTitle>Knowledge Base</CardTitle>
          <CardDescription>What should the chatbot know?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch
              id="hasFaqDoc"
              checked={hasFaqDoc}
              onCheckedChange={setHasFaqDoc}
            />
            <Label htmlFor="hasFaqDoc">I have an FAQ document to upload</Label>
          </div>

          {hasFaqDoc && (
            <FileUploadField
              serviceRequestId={serviceRequestId}
              category="faq"
              label="FAQ Document"
              description="Upload your FAQ document (PDF, Word, or text file)"
              accept={['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']}
              maxFiles={3}
            />
          )}

          <div className="space-y-2">
            <Label>Common Questions</Label>
            <p className="text-xs text-muted-foreground">
              List questions your customers frequently ask
            </p>
            <div className="flex gap-2">
              <Input
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="e.g., What are your pricing plans?"
                onKeyDown={(e) => e.key === 'Enter' && addQuestion()}
              />
              <Button type="button" variant="outline" onClick={addQuestion}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {commonQuestions.length > 0 && (
              <div className="space-y-2 mt-2">
                {commonQuestions.map((question, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-muted rounded-lg"
                  >
                    <span className="flex-1 text-sm">{question}</span>
                    <button
                      onClick={() =>
                        setCommonQuestions(commonQuestions.filter((_, i) => i !== index))
                      }
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Website Pages to Reference</Label>
            <p className="text-xs text-muted-foreground">
              URLs of pages the chatbot should learn from
            </p>
            <div className="flex gap-2">
              <Input
                value={newPageUrl}
                onChange={(e) => setNewPageUrl(e.target.value)}
                placeholder="https://yoursite.com/about"
                onKeyDown={(e) => e.key === 'Enter' && addPageUrl()}
              />
              <Button type="button" variant="outline" onClick={addPageUrl}>
                Add
              </Button>
            </div>
            {websitePagesToScrape.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {websitePagesToScrape.map((url) => (
                  <Badge key={url} variant="secondary" className="pr-1">
                    {url}
                    <button
                      onClick={() =>
                        setWebsitePagesToScrape(websitePagesToScrape.filter((u) => u !== url))
                      }
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lead Qualification */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Qualification</CardTitle>
          <CardDescription>How should leads be qualified?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="idealCustomer">Ideal Customer Profile *</Label>
            <Textarea
              id="idealCustomer"
              value={idealCustomer}
              onChange={(e) => setIdealCustomer(e.target.value)}
              placeholder="Describe your ideal customer - company size, industry, budget, etc."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="qualificationCriteria">Qualification Criteria *</Label>
            <Textarea
              id="qualificationCriteria"
              value={qualificationCriteria}
              onChange={(e) => setQualificationCriteria(e.target.value)}
              placeholder="What makes a lead qualified? e.g., has budget, decision-maker, timeline"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="disqualificationCriteria">Disqualification Criteria</Label>
            <Textarea
              id="disqualificationCriteria"
              value={disqualificationCriteria}
              onChange={(e) => setDisqualificationCriteria(e.target.value)}
              placeholder="When should a lead be disqualified? e.g., no budget, wrong industry"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Conversation Design */}
      <Card>
        <CardHeader>
          <CardTitle>Conversation Design</CardTitle>
          <CardDescription>Design the conversation flow</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="greetingMessage">Greeting Message *</Label>
            <Textarea
              id="greetingMessage"
              value={greetingMessage}
              onChange={(e) => setGreetingMessage(e.target.value)}
              placeholder="e.g., Hi! I'm the AI assistant for [Company]. How can I help you today?"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="handoffTrigger">Handoff Trigger</Label>
            <Textarea
              id="handoffTrigger"
              value={handoffTrigger}
              onChange={(e) => setHandoffTrigger(e.target.value)}
              placeholder="When should the chatbot transfer to a human? e.g., customer asks for pricing, complex questions"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="escalationEmail">Escalation Email *</Label>
            <Input
              id="escalationEmail"
              type="email"
              value={escalationEmail}
              onChange={(e) => setEscalationEmail(e.target.value)}
              placeholder="support@yourcompany.com"
            />
            <p className="text-xs text-muted-foreground">
              Email to notify when human handoff is needed
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>Connect to your existing tools</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Calendar Integration</Label>
              <Select value={calendarIntegration} onValueChange={setCalendarIntegration}>
                <SelectTrigger>
                  <SelectValue placeholder="Select calendar" />
                </SelectTrigger>
                <SelectContent>
                  {CALENDAR_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {calendarIntegration === 'other' && (
                <Input
                  value={calendarOther}
                  onChange={(e) => setCalendarOther(e.target.value)}
                  placeholder="Specify calendar tool"
                  className="mt-2"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>CRM Integration</Label>
              <Select value={crmIntegration} onValueChange={setCrmIntegration}>
                <SelectTrigger>
                  <SelectValue placeholder="Select CRM" />
                </SelectTrigger>
                <SelectContent>
                  {CRM_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {crmIntegration === 'other' && (
                <Input
                  value={crmOther}
                  onChange={(e) => setCrmOther(e.target.value)}
                  placeholder="Specify CRM"
                  className="mt-2"
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
