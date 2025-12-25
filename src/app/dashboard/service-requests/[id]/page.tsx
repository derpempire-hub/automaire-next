'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Globe, MessageSquare, Phone, Send, Save } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ServiceRequestStatusBadge } from '@/components/service-intake/ServiceRequestStatusBadge';
import { FileManager } from '@/components/service-intake/FileManager';
import { WebsiteIntakeForm } from '@/components/service-intake/forms/WebsiteIntakeForm';
import { ChatbotIntakeForm } from '@/components/service-intake/forms/ChatbotIntakeForm';
import { VoiceAgentIntakeForm } from '@/components/service-intake/forms/VoiceAgentIntakeForm';
import {
  useServiceRequest,
  useUpdateServiceRequestIntake,
  useSubmitServiceRequest,
} from '@/hooks/useServiceRequests';
import type { ServiceType } from '@/types/service-intake';
import { cn } from '@/lib/utils';

const SERVICE_ICONS: Record<ServiceType, React.ReactNode> = {
  website: <Globe className="h-5 w-5" />,
  chatbot: <MessageSquare className="h-5 w-5" />,
  voice_agent: <Phone className="h-5 w-5" />,
};

const SERVICE_LABELS: Record<ServiceType, string> = {
  website: 'Custom Website',
  chatbot: 'AI Chatbot',
  voice_agent: 'Voice Agent',
};

export default function ServiceRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const isEditMode = searchParams.get('edit') === 'true';

  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  const { data: request, isLoading, error } = useServiceRequest(id);
  const updateIntake = useUpdateServiceRequestIntake();
  const submitRequest = useSubmitServiceRequest();

  const canEdit = request?.status === 'draft';
  const canSubmit = request?.status === 'draft';

  // Redirect to edit mode if draft
  useEffect(() => {
    if (request && request.status === 'draft' && !isEditMode) {
      router.replace(`/dashboard/service-requests/${id}?edit=true`);
    }
  }, [request, isEditMode, id, router]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Request not found</p>
        <Button variant="link" asChild>
          <Link href="/dashboard/service-requests">Back to requests</Link>
        </Button>
      </div>
    );
  }

  const handleSubmit = async () => {
    await submitRequest.mutateAsync({ id });
    setShowSubmitDialog(false);
    router.push('/dashboard/service-requests');
  };

  const renderIntakeForm = () => {
    if (!canEdit) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
            <CardDescription>
              This request has been submitted and cannot be edited.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
              {JSON.stringify(request.intake_data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      );
    }

    const formProps = {
      serviceRequestId: id,
      initialData: request.intake_data as Record<string, unknown>,
      businessName: request.business_name || '',
      industry: request.industry || '',
      targetAudience: request.target_audience || '',
      onSave: async (data: {
        intake_data: Record<string, unknown>;
        business_name?: string;
        industry?: string;
        target_audience?: string;
      }) => {
        await updateIntake.mutateAsync({
          id,
          ...data,
        });
      },
      isSaving: updateIntake.isPending,
    };

    switch (request.service_type) {
      case 'website':
        return <WebsiteIntakeForm {...formProps} />;
      case 'chatbot':
        return <ChatbotIntakeForm {...formProps} />;
      case 'voice_agent':
        return <VoiceAgentIntakeForm {...formProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/service-requests">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {SERVICE_ICONS[request.service_type]}
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold">{request.title}</h1>
              <ServiceRequestStatusBadge status={request.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {SERVICE_LABELS[request.service_type]}
              {request.business_name && ` • ${request.business_name}`}
            </p>
          </div>
        </div>

        {canSubmit && (
          <Button onClick={() => setShowSubmitDialog(true)}>
            <Send className="h-4 w-4 mr-2" />
            Submit for Review
          </Button>
        )}
      </div>

      {/* Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6">
          {renderIntakeForm()}
        </TabsContent>

        <TabsContent value="files" className="mt-6">
          <FileManager
            serviceRequestId={id}
            title="Project Files"
            description="Upload logos, brand guides, documents, and other relevant files"
            showDelete={canEdit}
          />
        </TabsContent>
      </Tabs>

      {/* Submit Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit for Review?</AlertDialogTitle>
            <AlertDialogDescription>
              Once submitted, your request will be reviewed by our team and you
              won&apos;t be able to make changes. Make sure all information is complete
              and accurate.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmit}
              disabled={submitRequest.isPending}
            >
              {submitRequest.isPending ? 'Submitting...' : 'Submit'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
