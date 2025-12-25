'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Logo } from '@/components/Logo';
import { FileUploadField } from '@/components/service-intake/FileManager';
import { OnboardingWizard, OnboardingStep } from '@/components/service-intake/wizard';
import { useAuth } from '@/hooks/useAuth';
import {
  useServiceRequest,
  useUpdateServiceRequestIntake,
  useSubmitServiceRequest,
  useCompleteOnboarding,
} from '@/hooks/useServiceRequests';
import type { ServiceType, WebsiteIntakeData, ChatbotIntakeData, VoiceAgentIntakeData } from '@/types/service-intake';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Industry options shared across forms
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

export default function ServiceOnboardingPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceType = params.serviceType as ServiceType;
  const requestId = searchParams.get('request');

  const { user, loading: isAuthLoading } = useAuth();
  const { data: request, isLoading: isRequestLoading } = useServiceRequest(requestId || '');
  const updateIntake = useUpdateServiceRequestIntake();
  const submitRequest = useSubmitServiceRequest();
  const completeOnboarding = useCompleteOnboarding();

  // Form state
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [intakeData, setIntakeData] = useState<Record<string, unknown>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/auth?redirect=/onboarding');
    }
  }, [user, isAuthLoading, router]);

  // Redirect if no request ID
  useEffect(() => {
    if (!requestId) {
      router.push('/onboarding');
    }
  }, [requestId, router]);

  // Load existing data
  useEffect(() => {
    if (request) {
      setBusinessName(request.business_name || '');
      setIndustry(request.industry || '');
      setTargetAudience(request.target_audience || '');
      setIntakeData((request.intake_data as Record<string, unknown>) || {});
    }
  }, [request]);

  // Auto-save function
  const saveProgress = useCallback(async () => {
    if (!requestId) return;
    try {
      await updateIntake.mutateAsync({
        id: requestId,
        intake_data: intakeData,
        business_name: businessName,
        industry,
        target_audience: targetAudience,
      });
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }, [requestId, intakeData, businessName, industry, targetAudience, updateIntake]);

  // Update intake data helper
  const updateField = useCallback((field: string, value: unknown) => {
    setIntakeData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Handle completion
  const handleComplete = async () => {
    if (!requestId) return;

    setIsSubmitting(true);
    try {
      // Save final data
      await saveProgress();
      // Submit the request
      await submitRequest.mutateAsync({ id: requestId });
      // Mark onboarding complete
      await completeOnboarding.mutateAsync(requestId);
      setIsComplete(true);
    } catch (error) {
      console.error('Failed to submit:', error);
      setIsSubmitting(false);
    }
  };

  // Build steps based on service type
  const steps = useMemo((): OnboardingStep[] => {
    const commonBusinessStep: OnboardingStep = {
      id: 'business',
      title: 'Business Info',
      description: 'Tell us about your business',
      component: (
        <Card>
          <CardHeader>
            <CardTitle>About Your Business</CardTitle>
            <CardDescription>
              This helps us tailor the solution to your needs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                  <SelectValue placeholder="Select your industry" />
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
            <div className="space-y-2">
              <Label htmlFor="targetAudience">Target Audience *</Label>
              <Textarea
                id="targetAudience"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="Describe your ideal customers or clients"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      ),
      validate: () => Boolean(businessName && industry && targetAudience),
      onLeave: saveProgress,
    };

    if (serviceType === 'website') {
      return [
        commonBusinessStep,
        {
          id: 'design',
          title: 'Design',
          description: 'Your visual preferences',
          component: <WebsiteDesignStep intakeData={intakeData as unknown as WebsiteIntakeData} updateField={updateField} />,
          onLeave: saveProgress,
        },
        {
          id: 'content',
          title: 'Content',
          description: 'Pages and content needs',
          component: <WebsiteContentStep intakeData={intakeData as unknown as WebsiteIntakeData} updateField={updateField} />,
          onLeave: saveProgress,
        },
        {
          id: 'assets',
          title: 'Assets',
          description: 'Upload your brand files',
          component: requestId ? <WebsiteAssetsStep requestId={requestId} /> : null,
          onLeave: saveProgress,
        },
        {
          id: 'review',
          title: 'Review',
          description: 'Confirm and submit',
          component: (
            <ReviewStep
              businessName={businessName}
              industry={industry}
              targetAudience={targetAudience}
              intakeData={intakeData}
              serviceType={serviceType}
            />
          ),
        },
      ];
    }

    if (serviceType === 'chatbot') {
      return [
        commonBusinessStep,
        {
          id: 'knowledge',
          title: 'Knowledge',
          description: 'What should your chatbot know?',
          component: <ChatbotKnowledgeStep intakeData={intakeData as unknown as ChatbotIntakeData} updateField={updateField} />,
          onLeave: saveProgress,
        },
        {
          id: 'leads',
          title: 'Lead Qualification',
          description: 'How to identify good leads',
          component: <ChatbotLeadsStep intakeData={intakeData as unknown as ChatbotIntakeData} updateField={updateField} />,
          onLeave: saveProgress,
        },
        {
          id: 'conversation',
          title: 'Conversation',
          description: 'Chatbot personality and flow',
          component: <ChatbotConversationStep intakeData={intakeData as unknown as ChatbotIntakeData} updateField={updateField} />,
          onLeave: saveProgress,
        },
        {
          id: 'review',
          title: 'Review',
          description: 'Confirm and submit',
          component: (
            <ReviewStep
              businessName={businessName}
              industry={industry}
              targetAudience={targetAudience}
              intakeData={intakeData}
              serviceType={serviceType}
            />
          ),
        },
      ];
    }

    if (serviceType === 'voice_agent') {
      return [
        commonBusinessStep,
        {
          id: 'usecase',
          title: 'Use Case',
          description: 'What will the agent do?',
          component: <VoiceUseCaseStep intakeData={intakeData as unknown as VoiceAgentIntakeData} updateField={updateField} />,
          onLeave: saveProgress,
        },
        {
          id: 'voice',
          title: 'Voice',
          description: 'How should it sound?',
          component: <VoicePreferencesStep intakeData={intakeData as unknown as VoiceAgentIntakeData} updateField={updateField} />,
          onLeave: saveProgress,
        },
        {
          id: 'handling',
          title: 'Call Handling',
          description: 'Managing calls and escalations',
          component: <VoiceHandlingStep intakeData={intakeData as unknown as VoiceAgentIntakeData} updateField={updateField} />,
          onLeave: saveProgress,
        },
        {
          id: 'review',
          title: 'Review',
          description: 'Confirm and submit',
          component: (
            <ReviewStep
              businessName={businessName}
              industry={industry}
              targetAudience={targetAudience}
              intakeData={intakeData}
              serviceType={serviceType}
            />
          ),
        },
      ];
    }

    return [commonBusinessStep];
  }, [serviceType, businessName, industry, targetAudience, intakeData, updateField, saveProgress, requestId]);

  if (isAuthLoading || isRequestLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isComplete) {
    return <CompletionScreen serviceType={serviceType} />;
  }

  const serviceTitle = {
    website: 'Website Project',
    chatbot: 'Chatbot Setup',
    voice_agent: 'Voice Agent Setup',
  }[serviceType];

  return (
    <OnboardingWizard
      steps={steps}
      onComplete={handleComplete}
      isSubmitting={isSubmitting}
      title={serviceTitle}
      subtitle="Complete the following steps to get started"
      allowSkipToReview={true}
    />
  );
}

// Website Steps
function WebsiteDesignStep({
  intakeData,
  updateField,
}: {
  intakeData: Partial<WebsiteIntakeData>;
  updateField: (field: string, value: unknown) => void;
}) {
  const styles = ['Modern', 'Classic', 'Minimalist', 'Bold', 'Playful', 'Corporate'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Design Preferences</CardTitle>
        <CardDescription>Tell us about your visual style preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Design Style *</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {styles.map((style) => (
              <label
                key={style}
                className={cn(
                  'flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-colors',
                  intakeData.design_style === style.toLowerCase()
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-muted-foreground/50'
                )}
              >
                <input
                  type="radio"
                  name="design_style"
                  value={style.toLowerCase()}
                  checked={intakeData.design_style === style.toLowerCase()}
                  onChange={(e) => updateField('design_style', e.target.value)}
                  className="sr-only"
                />
                <span className="font-medium">{style}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="colorPreferences">Color Preferences</Label>
          <Input
            id="colorPreferences"
            value={intakeData.color_preferences || ''}
            onChange={(e) => updateField('color_preferences', e.target.value)}
            placeholder="e.g., Blue and white, warm earth tones, vibrant colors"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="inspirationSites">Websites You Like</Label>
          <Textarea
            id="inspirationSites"
            value={(intakeData.inspiration_sites || []).join('\n')}
            onChange={(e) => updateField('inspiration_sites', e.target.value.split('\n').filter(Boolean))}
            placeholder="Enter website URLs (one per line) that have a style you like"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function WebsiteContentStep({
  intakeData,
  updateField,
}: {
  intakeData: Partial<WebsiteIntakeData>;
  updateField: (field: string, value: unknown) => void;
}) {
  const pageOptions = ['Home', 'About', 'Services', 'Products', 'Contact', 'Blog', 'FAQ', 'Pricing', 'Team', 'Portfolio'];
  const selectedPages = intakeData.pages_needed || [];

  const togglePage = (page: string) => {
    if (selectedPages.includes(page)) {
      updateField('pages_needed', selectedPages.filter((p) => p !== page));
    } else {
      updateField('pages_needed', [...selectedPages, page]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content & Pages</CardTitle>
        <CardDescription>What pages and content do you need?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Pages Needed *</Label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {pageOptions.map((page) => (
              <label
                key={page}
                className={cn(
                  'flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors',
                  selectedPages.includes(page)
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-muted-foreground/50'
                )}
              >
                <Checkbox
                  checked={selectedPages.includes(page)}
                  onCheckedChange={() => togglePage(page)}
                />
                <span className="text-sm">{page}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Do you have existing content?</Label>
          <RadioGroup
            value={intakeData.has_existing_content ? 'yes' : 'no'}
            onValueChange={(v) => updateField('has_existing_content', v === 'yes')}
          >
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <RadioGroupItem value="yes" />
                <span>Yes, I have content ready</span>
              </label>
              <label className="flex items-center gap-2">
                <RadioGroupItem value="no" />
                <span>No, I need help with content</span>
              </label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contentNotes">Additional Content Notes</Label>
          <Textarea
            id="contentNotes"
            value={intakeData.content_notes || ''}
            onChange={(e) => updateField('content_notes', e.target.value)}
            placeholder="Any specific content requirements or notes..."
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function WebsiteAssetsStep({ requestId }: { requestId: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Brand Assets</CardTitle>
        <CardDescription>Upload your logo, brand guide, and other assets</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FileUploadField
          serviceRequestId={requestId}
          label="Logo"
          description="Your company logo (PNG, SVG, or AI preferred)"
          accept={['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']}
          category="logo"
        />

        <FileUploadField
          serviceRequestId={requestId}
          label="Brand Guide (Optional)"
          description="Brand guidelines, color codes, typography specifications"
          accept={['application/pdf']}
          category="brand_guide"
        />

        <FileUploadField
          serviceRequestId={requestId}
          label="Other Assets (Optional)"
          description="Any additional images or documents"
          maxFiles={10}
          category="assets"
        />
      </CardContent>
    </Card>
  );
}

// Chatbot Steps
function ChatbotKnowledgeStep({
  intakeData,
  updateField,
}: {
  intakeData: Partial<ChatbotIntakeData>;
  updateField: (field: string, value: unknown) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Knowledge Base</CardTitle>
        <CardDescription>What should your chatbot know about your business?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="productsDescription">Products/Services Description *</Label>
          <Textarea
            id="productsDescription"
            value={intakeData.products_services || ''}
            onChange={(e) => updateField('products_services', e.target.value)}
            placeholder="Describe your main products or services in detail..."
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="websiteUrl">Website URL</Label>
          <Input
            id="websiteUrl"
            type="url"
            value={intakeData.website_url || ''}
            onChange={(e) => updateField('website_url', e.target.value)}
            placeholder="https://yourwebsite.com"
          />
          <p className="text-xs text-muted-foreground">
            We&apos;ll analyze your website to help train the chatbot
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="commonQuestions">Common Customer Questions</Label>
          <Textarea
            id="commonQuestions"
            value={(intakeData.common_questions || []).join('\n')}
            onChange={(e) => updateField('common_questions', e.target.value.split('\n').filter(Boolean))}
            placeholder="Enter common questions (one per line)"
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function ChatbotLeadsStep({
  intakeData,
  updateField,
}: {
  intakeData: Partial<ChatbotIntakeData>;
  updateField: (field: string, value: unknown) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead Qualification</CardTitle>
        <CardDescription>Help us understand what makes a good lead for your business</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="qualifiedLeadCriteria">What Makes a Qualified Lead? *</Label>
          <Textarea
            id="qualifiedLeadCriteria"
            value={intakeData.qualification_criteria || ''}
            onChange={(e) => updateField('qualification_criteria', e.target.value)}
            placeholder="e.g., Budget over $5k, decision maker, timeline within 3 months..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="idealCustomerProfile">Ideal Customer Profile</Label>
          <Textarea
            id="idealCustomerProfile"
            value={intakeData.ideal_customer || ''}
            onChange={(e) => updateField('ideal_customer', e.target.value)}
            placeholder="Describe your ideal customer..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="disqualificationCriteria">Disqualification Criteria</Label>
          <Textarea
            id="disqualificationCriteria"
            value={intakeData.disqualification_criteria || ''}
            onChange={(e) => updateField('disqualification_criteria', e.target.value)}
            placeholder="What would disqualify a lead? e.g., Outside service area, budget too low..."
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function ChatbotConversationStep({
  intakeData,
  updateField,
}: {
  intakeData: Partial<ChatbotIntakeData>;
  updateField: (field: string, value: unknown) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversation Design</CardTitle>
        <CardDescription>Define how your chatbot should communicate</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="greetingMessage">Greeting Message *</Label>
          <Textarea
            id="greetingMessage"
            value={intakeData.greeting_message || ''}
            onChange={(e) => updateField('greeting_message', e.target.value)}
            placeholder="Hi! 👋 Welcome to [Company]. How can I help you today?"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="handoffTrigger">When to Hand Off to Human</Label>
          <Textarea
            id="handoffTrigger"
            value={intakeData.handoff_trigger || ''}
            onChange={(e) => updateField('handoff_trigger', e.target.value)}
            placeholder="Describe scenarios when the chatbot should hand off to a human"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="escalationEmail">Escalation Email</Label>
          <Input
            id="escalationEmail"
            type="email"
            value={intakeData.escalation_email || ''}
            onChange={(e) => updateField('escalation_email', e.target.value)}
            placeholder="support@yourcompany.com"
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Voice Agent Steps
function VoiceUseCaseStep({
  intakeData,
  updateField,
}: {
  intakeData: Partial<VoiceAgentIntakeData>;
  updateField: (field: string, value: unknown) => void;
}) {
  const useCases = [
    { value: 'inbound_support', label: 'Inbound Support', description: 'Answer incoming customer calls' },
    { value: 'outbound_calls', label: 'Outbound Calls', description: 'Make calls for sales, surveys, or follow-ups' },
    { value: 'appointment_reminders', label: 'Appointment Reminders', description: 'Call customers about upcoming appointments' },
    { value: 'other', label: 'Other', description: 'Something else' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Use Case</CardTitle>
        <CardDescription>What will your voice agent do?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Primary Use Case *</Label>
          <RadioGroup value={intakeData.use_case || ''} onValueChange={(v) => updateField('use_case', v)}>
            <div className="grid gap-3">
              {useCases.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    'flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors',
                    intakeData.use_case === option.value
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-muted-foreground/50'
                  )}
                >
                  <RadioGroupItem value={option.value} className="mt-1" />
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-muted-foreground">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="useCaseDescription">Detailed Description *</Label>
          <Textarea
            id="useCaseDescription"
            value={intakeData.use_case_description || ''}
            onChange={(e) => updateField('use_case_description', e.target.value)}
            placeholder="Describe in detail what the voice agent should do..."
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function VoicePreferencesStep({
  intakeData,
  updateField,
}: {
  intakeData: Partial<VoiceAgentIntakeData>;
  updateField: (field: string, value: unknown) => void;
}) {
  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'neutral', label: 'Neutral' },
  ];

  const accentOptions = [
    'American English',
    'British English',
    'Australian English',
    'Canadian English',
    'Neutral/Standard',
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Voice Preferences</CardTitle>
        <CardDescription>How should your voice agent sound?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Voice Gender *</Label>
          <RadioGroup
            value={intakeData.voice_gender || ''}
            onValueChange={(v) => updateField('voice_gender', v)}
          >
            <div className="flex gap-4">
              {genderOptions.map((option) => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value={option.value} />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Accent *</Label>
          <Select
            value={intakeData.voice_accent || ''}
            onValueChange={(v) => updateField('voice_accent', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select accent" />
            </SelectTrigger>
            <SelectContent>
              {accentOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="voicePersonality">Personality & Tone</Label>
          <Textarea
            id="voicePersonality"
            value={intakeData.voice_personality || ''}
            onChange={(e) => updateField('voice_personality', e.target.value)}
            placeholder="e.g., Professional but friendly, warm and empathetic, energetic and upbeat"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sampleConversation">Sample Conversation</Label>
          <Textarea
            id="sampleConversation"
            value={intakeData.sample_conversations || ''}
            onChange={(e) => updateField('sample_conversations', e.target.value)}
            placeholder={`Agent: Hello, thank you for calling. How can I help you today?\n\nCaller: I'd like to schedule an appointment.\n\nAgent: I'd be happy to help...`}
            rows={6}
            className="font-mono text-sm"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function VoiceHandlingStep({
  intakeData,
  updateField,
}: {
  intakeData: Partial<VoiceAgentIntakeData>;
  updateField: (field: string, value: unknown) => void;
}) {
  const overflowOptions = [
    { value: 'voicemail', label: 'Send to voicemail' },
    { value: 'transfer', label: 'Transfer to a human' },
    { value: 'callback', label: 'Schedule a callback' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Call Handling</CardTitle>
        <CardDescription>Configure how calls should be managed</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="operatingHours">Operating Hours *</Label>
          <Input
            id="operatingHours"
            value={intakeData.operating_hours || ''}
            onChange={(e) => updateField('operating_hours', e.target.value)}
            placeholder="e.g., Mon-Fri 9am-5pm EST, 24/7"
          />
        </div>

        <div className="space-y-2">
          <Label>When Unable to Help *</Label>
          <RadioGroup
            value={intakeData.overflow_action || ''}
            onValueChange={(v) => updateField('overflow_action', v)}
          >
            <div className="grid gap-2">
              {overflowOptions.map((option) => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value={option.value} />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </RadioGroup>
        </div>

        {intakeData.overflow_action === 'transfer' && (
          <div className="space-y-2">
            <Label htmlFor="escalationNumber">Transfer Number *</Label>
            <Input
              id="escalationNumber"
              type="tel"
              value={intakeData.escalation_number || ''}
              onChange={(e) => updateField('escalation_number', e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>Phone Number</Label>
          <RadioGroup
            value={intakeData.phone_status || ''}
            onValueChange={(v) => updateField('phone_status', v)}
          >
            <div className="grid gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="have_number" />
                <span>I have a phone number to use</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="need_number" />
                <span>I need a new phone number</span>
              </label>
            </div>
          </RadioGroup>
        </div>

        {intakeData.phone_status === 'have_number' && (
          <div className="space-y-2">
            <Label htmlFor="existingNumber">Existing Phone Number</Label>
            <Input
              id="existingNumber"
              type="tel"
              value={intakeData.existing_number || ''}
              onChange={(e) => updateField('existing_number', e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Review Step
function ReviewStep({
  businessName,
  industry,
  targetAudience,
  intakeData,
  serviceType,
}: {
  businessName: string;
  industry: string;
  targetAudience: string;
  intakeData: Record<string, unknown>;
  serviceType: ServiceType;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Your Information</CardTitle>
        <CardDescription>
          Please review the information below before submitting
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Business Information</h3>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-muted-foreground">Business Name:</dt>
              <dd>{businessName || '-'}</dd>
              <dt className="text-muted-foreground">Industry:</dt>
              <dd>{industry || '-'}</dd>
              <dt className="text-muted-foreground">Target Audience:</dt>
              <dd className="col-span-2">{targetAudience || '-'}</dd>
            </dl>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Project Details</h3>
            <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto max-h-64">
              {JSON.stringify(intakeData, null, 2)}
            </pre>
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            By clicking Submit, your project request will be sent to our team for review.
            We&apos;ll reach out within 1-2 business days to discuss next steps.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Completion Screen
function CompletionScreen({ serviceType }: { serviceType: ServiceType }) {
  const router = useRouter();
  const serviceName = {
    website: 'Website',
    chatbot: 'Chatbot',
    voice_agent: 'Voice Agent',
  }[serviceType];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
      <Card className="max-w-md mx-4 text-center">
        <CardHeader>
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">You&apos;re All Set!</CardTitle>
          <CardDescription>
            Your {serviceName} project request has been submitted successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Our team will review your submission and reach out within 1-2 business days
            to discuss the next steps.
          </p>

          <div className="flex flex-col gap-2">
            <Button onClick={() => router.push('/dashboard/service-requests')}>
              View My Requests
            </Button>
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
