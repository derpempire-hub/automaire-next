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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { FileUploadField } from '@/components/service-intake/FileManager';
import type { WebsiteIntakeData } from '@/types/service-intake';
import { useDebouncedCallback } from 'use-debounce';

interface WebsiteIntakeFormProps {
  serviceRequestId: string;
  initialData: Partial<WebsiteIntakeData> | Record<string, unknown>;
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

const DESIGN_STYLES = [
  { value: 'modern', label: 'Modern & Clean' },
  { value: 'classic', label: 'Classic & Professional' },
  { value: 'minimalist', label: 'Minimalist' },
  { value: 'bold', label: 'Bold & Creative' },
  { value: 'custom', label: 'Custom / Other' },
];

const PAGES_OPTIONS = [
  'Home',
  'About',
  'Services',
  'Products',
  'Contact',
  'Blog',
  'Team',
  'Pricing',
  'FAQ',
  'Portfolio',
  'Testimonials',
  'Gallery',
];

const INTEGRATIONS_OPTIONS = [
  'Google Analytics',
  'Facebook Pixel',
  'HubSpot',
  'Mailchimp',
  'Stripe Payments',
  'Calendar Booking',
  'Live Chat',
  'Contact Forms',
];

const CMS_OPTIONS = [
  { value: 'none', label: 'No CMS needed' },
  { value: 'sanity', label: 'Sanity' },
  { value: 'contentful', label: 'Contentful' },
  { value: 'strapi', label: 'Strapi' },
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

export function WebsiteIntakeForm({
  serviceRequestId,
  initialData,
  businessName: initialBusinessName,
  industry: initialIndustry,
  targetAudience: initialTargetAudience,
  onSave,
  isSaving,
}: WebsiteIntakeFormProps) {
  // Business info
  const [businessName, setBusinessName] = useState(initialBusinessName);
  const [industry, setIndustry] = useState(initialIndustry);
  const [targetAudience, setTargetAudience] = useState(initialTargetAudience);

  // Intake data
  const [designStyle, setDesignStyle] = useState<string>(
    (initialData as WebsiteIntakeData)?.design_style || ''
  );
  const [colorPreferences, setColorPreferences] = useState<string[]>(
    (initialData as WebsiteIntakeData)?.color_preferences || []
  );
  const [competitorSites, setCompetitorSites] = useState<string[]>(
    (initialData as WebsiteIntakeData)?.competitor_sites || []
  );
  const [inspirationSites, setInspirationSites] = useState<string[]>(
    (initialData as WebsiteIntakeData)?.inspiration_sites || []
  );
  const [pagesNeeded, setPagesNeeded] = useState<string[]>(
    (initialData as WebsiteIntakeData)?.pages_needed || []
  );
  const [hasExistingContent, setHasExistingContent] = useState(
    (initialData as WebsiteIntakeData)?.has_existing_content || false
  );
  const [contentNotes, setContentNotes] = useState(
    (initialData as WebsiteIntakeData)?.content_notes || ''
  );
  const [integrations, setIntegrations] = useState<string[]>(
    (initialData as WebsiteIntakeData)?.integrations || []
  );
  const [cmsPreference, setCmsPreference] = useState<string>(
    (initialData as WebsiteIntakeData)?.cms_preference || 'none'
  );
  const [cmsOther, setCmsOther] = useState(
    (initialData as WebsiteIntakeData)?.cms_other || ''
  );
  const [domainStatus, setDomainStatus] = useState<string>(
    (initialData as WebsiteIntakeData)?.domain_status || 'undecided'
  );
  const [domainName, setDomainName] = useState(
    (initialData as WebsiteIntakeData)?.domain_name || ''
  );
  const [hasLogo, setHasLogo] = useState(
    (initialData as WebsiteIntakeData)?.has_logo || false
  );
  const [hasBrandGuide, setHasBrandGuide] = useState(
    (initialData as WebsiteIntakeData)?.has_brand_guide || false
  );

  // URL input states
  const [newCompetitorUrl, setNewCompetitorUrl] = useState('');
  const [newInspirationUrl, setNewInspirationUrl] = useState('');
  const [newColor, setNewColor] = useState('#3b82f6');

  // Build the data object
  const buildIntakeData = useCallback((): WebsiteIntakeData => ({
    design_style: designStyle as WebsiteIntakeData['design_style'],
    color_preferences: colorPreferences,
    competitor_sites: competitorSites,
    inspiration_sites: inspirationSites,
    pages_needed: pagesNeeded,
    has_existing_content: hasExistingContent,
    content_notes: contentNotes,
    integrations,
    cms_preference: cmsPreference as WebsiteIntakeData['cms_preference'],
    cms_other: cmsOther,
    domain_status: domainStatus as WebsiteIntakeData['domain_status'],
    domain_name: domainName,
    has_logo: hasLogo,
    has_brand_guide: hasBrandGuide,
  }), [
    designStyle, colorPreferences, competitorSites, inspirationSites,
    pagesNeeded, hasExistingContent, contentNotes, integrations,
    cmsPreference, cmsOther, domainStatus, domainName, hasLogo, hasBrandGuide,
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
    businessName, industry, targetAudience, designStyle, colorPreferences,
    competitorSites, inspirationSites, pagesNeeded, hasExistingContent,
    contentNotes, integrations, cmsPreference, cmsOther, domainStatus,
    domainName, hasLogo, hasBrandGuide, debouncedSave,
  ]);

  const addCompetitorUrl = () => {
    if (newCompetitorUrl && !competitorSites.includes(newCompetitorUrl)) {
      setCompetitorSites([...competitorSites, newCompetitorUrl]);
      setNewCompetitorUrl('');
    }
  };

  const addInspirationUrl = () => {
    if (newInspirationUrl && !inspirationSites.includes(newInspirationUrl)) {
      setInspirationSites([...inspirationSites, newInspirationUrl]);
      setNewInspirationUrl('');
    }
  };

  const addColor = () => {
    if (newColor && !colorPreferences.includes(newColor)) {
      setColorPreferences([...colorPreferences, newColor]);
    }
  };

  const togglePage = (page: string) => {
    if (pagesNeeded.includes(page)) {
      setPagesNeeded(pagesNeeded.filter((p) => p !== page));
    } else {
      setPagesNeeded([...pagesNeeded, page]);
    }
  };

  const toggleIntegration = (integration: string) => {
    if (integrations.includes(integration)) {
      setIntegrations(integrations.filter((i) => i !== integration));
    } else {
      setIntegrations([...integrations, integration]);
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
              placeholder="Describe your ideal customers - their demographics, needs, and pain points"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Design Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Design Preferences</CardTitle>
          <CardDescription>What style are you looking for?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Design Style *</Label>
            <Select value={designStyle} onValueChange={setDesignStyle}>
              <SelectTrigger>
                <SelectValue placeholder="Select a style" />
              </SelectTrigger>
              <SelectContent>
                {DESIGN_STYLES.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    {style.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Color Preferences</Label>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Button type="button" variant="outline" onClick={addColor}>
                <Plus className="h-4 w-4 mr-1" />
                Add Color
              </Button>
            </div>
            {colorPreferences.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {colorPreferences.map((color) => (
                  <Badge
                    key={color}
                    variant="outline"
                    className="flex items-center gap-1.5 pr-1"
                  >
                    <div
                      className="h-4 w-4 rounded-full border"
                      style={{ backgroundColor: color }}
                    />
                    {color}
                    <button
                      onClick={() =>
                        setColorPreferences(colorPreferences.filter((c) => c !== color))
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

          <div className="space-y-2">
            <Label>Competitor Websites</Label>
            <p className="text-xs text-muted-foreground">
              Share websites of competitors you'd like us to review
            </p>
            <div className="flex gap-2">
              <Input
                value={newCompetitorUrl}
                onChange={(e) => setNewCompetitorUrl(e.target.value)}
                placeholder="https://example.com"
                onKeyDown={(e) => e.key === 'Enter' && addCompetitorUrl()}
              />
              <Button type="button" variant="outline" onClick={addCompetitorUrl}>
                Add
              </Button>
            </div>
            {competitorSites.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {competitorSites.map((url) => (
                  <Badge key={url} variant="secondary" className="pr-1">
                    {url}
                    <button
                      onClick={() =>
                        setCompetitorSites(competitorSites.filter((u) => u !== url))
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

          <div className="space-y-2">
            <Label>Inspiration Websites</Label>
            <p className="text-xs text-muted-foreground">
              Share websites you love the design of
            </p>
            <div className="flex gap-2">
              <Input
                value={newInspirationUrl}
                onChange={(e) => setNewInspirationUrl(e.target.value)}
                placeholder="https://example.com"
                onKeyDown={(e) => e.key === 'Enter' && addInspirationUrl()}
              />
              <Button type="button" variant="outline" onClick={addInspirationUrl}>
                Add
              </Button>
            </div>
            {inspirationSites.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {inspirationSites.map((url) => (
                  <Badge key={url} variant="secondary" className="pr-1">
                    {url}
                    <button
                      onClick={() =>
                        setInspirationSites(inspirationSites.filter((u) => u !== url))
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

      {/* Content Needs */}
      <Card>
        <CardHeader>
          <CardTitle>Content Needs</CardTitle>
          <CardDescription>What pages and content do you need?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Pages Needed *</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {PAGES_OPTIONS.map((page) => (
                <label
                  key={page}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={pagesNeeded.includes(page)}
                    onCheckedChange={() => togglePage(page)}
                  />
                  <span className="text-sm">{page}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="hasContent"
              checked={hasExistingContent}
              onCheckedChange={setHasExistingContent}
            />
            <Label htmlFor="hasContent">I have existing content ready</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contentNotes">Content Notes</Label>
            <Textarea
              id="contentNotes"
              value={contentNotes}
              onChange={(e) => setContentNotes(e.target.value)}
              placeholder="Any notes about content - what you have, what you need help with, etc."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Technical Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Requirements</CardTitle>
          <CardDescription>Integrations and technical needs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Integrations Needed</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {INTEGRATIONS_OPTIONS.map((integration) => (
                <label
                  key={integration}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={integrations.includes(integration)}
                    onCheckedChange={() => toggleIntegration(integration)}
                  />
                  <span className="text-sm">{integration}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>CMS Preference</Label>
              <Select value={cmsPreference} onValueChange={setCmsPreference}>
                <SelectTrigger>
                  <SelectValue placeholder="Select CMS" />
                </SelectTrigger>
                <SelectContent>
                  {CMS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {cmsPreference === 'other' && (
                <Input
                  value={cmsOther}
                  onChange={(e) => setCmsOther(e.target.value)}
                  placeholder="Specify CMS"
                  className="mt-2"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>Domain Status</Label>
              <Select value={domainStatus} onValueChange={setDomainStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="have_domain">I have a domain</SelectItem>
                  <SelectItem value="need_domain">I need a domain</SelectItem>
                  <SelectItem value="undecided">Undecided</SelectItem>
                </SelectContent>
              </Select>
              {domainStatus === 'have_domain' && (
                <Input
                  value={domainName}
                  onChange={(e) => setDomainName(e.target.value)}
                  placeholder="yourdomain.com"
                  className="mt-2"
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Brand Assets */}
      <Card>
        <CardHeader>
          <CardTitle>Brand Assets</CardTitle>
          <CardDescription>Upload your brand materials</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Switch
                id="hasLogo"
                checked={hasLogo}
                onCheckedChange={setHasLogo}
              />
              <Label htmlFor="hasLogo">I have a logo</Label>
            </div>

            {hasLogo && (
              <FileUploadField
                serviceRequestId={serviceRequestId}
                category="logo"
                label="Logo Files"
                description="Upload your logo in various formats (PNG, SVG, etc.)"
                accept={['image/*']}
                maxFiles={5}
              />
            )}

            <div className="flex items-center gap-3">
              <Switch
                id="hasBrandGuide"
                checked={hasBrandGuide}
                onCheckedChange={setHasBrandGuide}
              />
              <Label htmlFor="hasBrandGuide">I have a brand guide</Label>
            </div>

            {hasBrandGuide && (
              <FileUploadField
                serviceRequestId={serviceRequestId}
                category="brand_guide"
                label="Brand Guide"
                description="Upload your brand guidelines document"
                accept={['application/pdf', 'image/*']}
                maxFiles={3}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
