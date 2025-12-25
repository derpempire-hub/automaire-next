'use client';

import { useState, useCallback, useEffect } from 'react';
import { Save, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { VoiceAgentIntakeData } from '@/types/service-intake';
import { useDebouncedCallback } from 'use-debounce';

interface VoiceAgentIntakeFormProps {
  serviceRequestId: string;
  initialData: Partial<VoiceAgentIntakeData> | Record<string, unknown>;
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

const USE_CASE_OPTIONS = [
  { value: 'inbound_support', label: 'Inbound Support', description: 'Answer incoming customer calls' },
  { value: 'outbound_calls', label: 'Outbound Calls', description: 'Make calls for sales, surveys, or follow-ups' },
  { value: 'appointment_reminders', label: 'Appointment Reminders', description: 'Call customers about upcoming appointments' },
  { value: 'other', label: 'Other', description: 'Something else' },
];

const VOICE_GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'neutral', label: 'Neutral' },
];

const ACCENT_OPTIONS = [
  'American English',
  'British English',
  'Australian English',
  'Canadian English',
  'Neutral/Standard',
  'Other',
];

const OVERFLOW_OPTIONS = [
  { value: 'voicemail', label: 'Send to voicemail' },
  { value: 'transfer', label: 'Transfer to a human' },
  { value: 'callback', label: 'Schedule a callback' },
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

export function VoiceAgentIntakeForm({
  serviceRequestId,
  initialData,
  businessName: initialBusinessName,
  industry: initialIndustry,
  targetAudience: initialTargetAudience,
  onSave,
  isSaving,
}: VoiceAgentIntakeFormProps) {
  // Business info
  const [businessName, setBusinessName] = useState(initialBusinessName);
  const [industry, setIndustry] = useState(initialIndustry);
  const [targetAudience, setTargetAudience] = useState(initialTargetAudience);

  // Intake data
  const [useCase, setUseCase] = useState<string>(
    (initialData as VoiceAgentIntakeData)?.use_case || ''
  );
  const [useCaseDescription, setUseCaseDescription] = useState(
    (initialData as VoiceAgentIntakeData)?.use_case_description || ''
  );
  const [voiceGender, setVoiceGender] = useState<string>(
    (initialData as VoiceAgentIntakeData)?.voice_gender || ''
  );
  const [voiceAccent, setVoiceAccent] = useState(
    (initialData as VoiceAgentIntakeData)?.voice_accent || ''
  );
  const [voicePersonality, setVoicePersonality] = useState(
    (initialData as VoiceAgentIntakeData)?.voice_personality || ''
  );
  const [sampleConversations, setSampleConversations] = useState(
    (initialData as VoiceAgentIntakeData)?.sample_conversations || ''
  );
  const [commonScenarios, setCommonScenarios] = useState<string[]>(
    (initialData as VoiceAgentIntakeData)?.common_scenarios || []
  );
  const [operatingHours, setOperatingHours] = useState(
    (initialData as VoiceAgentIntakeData)?.operating_hours || ''
  );
  const [overflowAction, setOverflowAction] = useState<string>(
    (initialData as VoiceAgentIntakeData)?.overflow_action || ''
  );
  const [escalationNumber, setEscalationNumber] = useState(
    (initialData as VoiceAgentIntakeData)?.escalation_number || ''
  );
  const [phoneStatus, setPhoneStatus] = useState<string>(
    (initialData as VoiceAgentIntakeData)?.phone_status || ''
  );
  const [existingNumber, setExistingNumber] = useState(
    (initialData as VoiceAgentIntakeData)?.existing_number || ''
  );

  // Input states
  const [newScenario, setNewScenario] = useState('');

  // Build the data object
  const buildIntakeData = useCallback((): VoiceAgentIntakeData => ({
    use_case: useCase as VoiceAgentIntakeData['use_case'],
    use_case_description: useCaseDescription,
    voice_gender: voiceGender as VoiceAgentIntakeData['voice_gender'],
    voice_accent: voiceAccent,
    voice_personality: voicePersonality,
    sample_conversations: sampleConversations,
    common_scenarios: commonScenarios,
    operating_hours: operatingHours,
    overflow_action: overflowAction as VoiceAgentIntakeData['overflow_action'],
    escalation_number: escalationNumber,
    phone_status: phoneStatus as VoiceAgentIntakeData['phone_status'],
    existing_number: existingNumber,
  }), [
    useCase, useCaseDescription, voiceGender, voiceAccent, voicePersonality,
    sampleConversations, commonScenarios, operatingHours, overflowAction,
    escalationNumber, phoneStatus, existingNumber,
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
    businessName, industry, targetAudience, useCase, useCaseDescription,
    voiceGender, voiceAccent, voicePersonality, sampleConversations,
    commonScenarios, operatingHours, overflowAction, escalationNumber,
    phoneStatus, existingNumber, debouncedSave,
  ]);

  const addScenario = () => {
    if (newScenario && !commonScenarios.includes(newScenario)) {
      setCommonScenarios([...commonScenarios, newScenario]);
      setNewScenario('');
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

      {/* Business Info */}
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
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
            <Label htmlFor="targetAudience">Target Audience *</Label>
            <Textarea
              id="targetAudience"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="Who will be receiving/making calls?"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Use Case */}
      <Card>
        <CardHeader>
          <CardTitle>Use Case</CardTitle>
          <CardDescription>What will the voice agent do?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Primary Use Case *</Label>
            <RadioGroup value={useCase} onValueChange={setUseCase}>
              <div className="grid gap-3">
                {USE_CASE_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent"
                  >
                    <RadioGroupItem value={option.value} className="mt-1" />
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {option.description}
                      </div>
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
              value={useCaseDescription}
              onChange={(e) => setUseCaseDescription(e.target.value)}
              placeholder="Describe in detail what the voice agent should do. What tasks should it handle? What information should it collect?"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Voice Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Voice Preferences</CardTitle>
          <CardDescription>How should the voice agent sound?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Voice Gender *</Label>
              <RadioGroup value={voiceGender} onValueChange={setVoiceGender}>
                <div className="flex gap-4">
                  {VOICE_GENDER_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <RadioGroupItem value={option.value} />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Accent *</Label>
              <Select value={voiceAccent} onValueChange={setVoiceAccent}>
                <SelectTrigger>
                  <SelectValue placeholder="Select accent" />
                </SelectTrigger>
                <SelectContent>
                  {ACCENT_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="voicePersonality">Personality & Tone</Label>
            <Textarea
              id="voicePersonality"
              value={voicePersonality}
              onChange={(e) => setVoicePersonality(e.target.value)}
              placeholder="e.g., Professional but friendly, warm and empathetic, energetic and upbeat"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Scripts & Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle>Scripts & Scenarios</CardTitle>
          <CardDescription>What conversations will the agent have?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sampleConversations">Sample Conversation *</Label>
            <p className="text-xs text-muted-foreground">
              Write out an example conversation the voice agent might have
            </p>
            <Textarea
              id="sampleConversations"
              value={sampleConversations}
              onChange={(e) => setSampleConversations(e.target.value)}
              placeholder={`Agent: Hello, thank you for calling [Company]. How can I help you today?\n\nCaller: I'd like to schedule an appointment.\n\nAgent: I'd be happy to help you schedule an appointment. May I have your name please?`}
              rows={8}
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label>Common Scenarios</Label>
            <p className="text-xs text-muted-foreground">
              List typical call scenarios the agent should handle
            </p>
            <div className="flex gap-2">
              <Input
                value={newScenario}
                onChange={(e) => setNewScenario(e.target.value)}
                placeholder="e.g., Schedule appointment, Cancel booking, Ask about pricing"
                onKeyDown={(e) => e.key === 'Enter' && addScenario()}
              />
              <Button type="button" variant="outline" onClick={addScenario}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {commonScenarios.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {commonScenarios.map((scenario) => (
                  <Badge key={scenario} variant="secondary" className="pr-1">
                    {scenario}
                    <button
                      onClick={() =>
                        setCommonScenarios(commonScenarios.filter((s) => s !== scenario))
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

      {/* Call Handling */}
      <Card>
        <CardHeader>
          <CardTitle>Call Handling</CardTitle>
          <CardDescription>How should calls be handled?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="operatingHours">Operating Hours *</Label>
            <Input
              id="operatingHours"
              value={operatingHours}
              onChange={(e) => setOperatingHours(e.target.value)}
              placeholder="e.g., Mon-Fri 9am-5pm EST, 24/7"
            />
          </div>

          <div className="space-y-2">
            <Label>When Unable to Help *</Label>
            <RadioGroup value={overflowAction} onValueChange={setOverflowAction}>
              <div className="grid gap-2">
                {OVERFLOW_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <RadioGroupItem value={option.value} />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </RadioGroup>
          </div>

          {overflowAction === 'transfer' && (
            <div className="space-y-2">
              <Label htmlFor="escalationNumber">Transfer Number *</Label>
              <Input
                id="escalationNumber"
                type="tel"
                value={escalationNumber}
                onChange={(e) => setEscalationNumber(e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phone Setup */}
      <Card>
        <CardHeader>
          <CardTitle>Phone Setup</CardTitle>
          <CardDescription>Phone number configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Phone Number Status *</Label>
            <RadioGroup value={phoneStatus} onValueChange={setPhoneStatus}>
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

          {phoneStatus === 'have_number' && (
            <div className="space-y-2">
              <Label htmlFor="existingNumber">Existing Phone Number</Label>
              <Input
                id="existingNumber"
                type="tel"
                value={existingNumber}
                onChange={(e) => setExistingNumber(e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
