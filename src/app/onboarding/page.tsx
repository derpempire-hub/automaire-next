'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, MessageSquare, Phone, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/hooks/useAuth';
import { useServiceRequests, useCreateServiceRequest } from '@/hooks/useServiceRequests';
import type { ServiceType } from '@/types/service-intake';
import { cn } from '@/lib/utils';

const SERVICES: {
  type: ServiceType;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    type: 'website',
    title: 'Custom Website',
    description: 'Professional website tailored to your brand and business needs',
    icon: <Globe className="h-8 w-8" />,
    color: 'text-blue-500',
  },
  {
    type: 'chatbot',
    title: 'AI Chatbot',
    description: 'Intelligent chatbot to engage visitors and qualify leads 24/7',
    icon: <MessageSquare className="h-8 w-8" />,
    color: 'text-green-500',
  },
  {
    type: 'voice_agent',
    title: 'Voice Agent',
    description: 'AI-powered voice agent for calls and customer support',
    icon: <Phone className="h-8 w-8" />,
    color: 'text-purple-500',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading: isAuthLoading } = useAuth();
  const { data: existingRequests, isLoading: isRequestsLoading } = useServiceRequests();
  const createRequest = useCreateServiceRequest();

  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/auth?redirect=/onboarding');
    }
  }, [user, isAuthLoading, router]);

  // Check for existing draft requests
  const draftRequests = existingRequests?.filter((r) => r.status === 'draft' && r.source === 'onboarding') || [];

  const handleContinueExisting = (requestId: string, serviceType: ServiceType) => {
    router.push(`/onboarding/${serviceType}?request=${requestId}`);
  };

  const handleStartNew = async () => {
    if (!selectedService) return;

    setIsCreating(true);
    try {
      const result = await createRequest.mutateAsync({
        service_type: selectedService,
        title: `${SERVICES.find((s) => s.type === selectedService)?.title} Project`,
        source: 'onboarding',
      });
      router.push(`/onboarding/${selectedService}?request=${result.id}`);
    } catch (error) {
      console.error('Failed to create request:', error);
      setIsCreating(false);
    }
  };

  if (isAuthLoading || isRequestsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <Logo to="/dashboard" size="lg" />
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">
            Welcome to Your Project Setup
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Let&apos;s get started by gathering the information we need to build your
            perfect solution. This should only take about 10-15 minutes.
          </p>
        </div>

        {/* Existing Drafts */}
        {draftRequests.length > 0 && (
          <div className="mb-12">
            <h2 className="text-lg font-semibold mb-4">Continue Where You Left Off</h2>
            <div className="grid gap-4">
              {draftRequests.map((request) => {
                const service = SERVICES.find((s) => s.type === request.service_type);
                return (
                  <Card
                    key={request.id}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => handleContinueExisting(request.id, request.service_type)}
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className={cn('p-2 rounded-lg bg-muted', service?.color)}>
                          {service?.icon}
                        </div>
                        <div>
                          <p className="font-medium">{request.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Started {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or start a new project
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Service Selection */}
        <div>
          <h2 className="text-lg font-semibold mb-4">
            {draftRequests.length > 0 ? 'Start a New Project' : 'Select Your Service'}
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {SERVICES.map((service) => (
              <Card
                key={service.type}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-md',
                  selectedService === service.type
                    ? 'ring-2 ring-primary border-primary'
                    : 'hover:border-muted-foreground/50'
                )}
                onClick={() => setSelectedService(service.type)}
              >
                <CardHeader className="text-center pb-2">
                  <div className={cn('mx-auto mb-2', service.color)}>
                    {service.icon}
                  </div>
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8 flex justify-center">
          <Button
            size="lg"
            disabled={!selectedService || isCreating}
            onClick={handleStartNew}
            className="min-w-[200px]"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                Get Started
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>

        {/* Skip Option */}
        <div className="mt-6 text-center">
          <Button
            variant="link"
            onClick={() => router.push('/dashboard')}
            className="text-muted-foreground"
          >
            Skip for now and go to dashboard
          </Button>
        </div>
      </main>
    </div>
  );
}
