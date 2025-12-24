'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Sparkles, MessageCircle, UserCheck, FileText, Trophy, Kanban, ArrowRight } from 'lucide-react';

const stages = [
  {
    name: 'New',
    key: 'new',
    count: 0,
    icon: Sparkles,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    description: 'Fresh leads awaiting first contact',
  },
  {
    name: 'Contacted',
    key: 'contacted',
    count: 0,
    icon: MessageCircle,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    description: 'Initial outreach completed',
  },
  {
    name: 'Qualified',
    key: 'qualified',
    count: 0,
    icon: UserCheck,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    description: 'Confirmed fit for your services',
  },
  {
    name: 'Proposal',
    key: 'proposal',
    count: 0,
    icon: FileText,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    description: 'Quote sent, awaiting decision',
  },
  {
    name: 'Won',
    key: 'won',
    count: 0,
    icon: Trophy,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    description: 'Deal closed successfully',
  },
];

export default function PipelinePage() {
  const router = useRouter();
  const totalLeads = stages.reduce((sum, s) => sum + s.count, 0);

  const handleStageClick = (stageKey: string) => {
    router.push(`/dashboard/leads?status=${stageKey}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Pipeline</h1>
        <p className="text-muted-foreground">Visualize your sales pipeline stages.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {stages.map((stage) => {
          const Icon = stage.icon;

          return (
            <Card
              key={stage.name}
              className="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/50"
              onClick={() => handleStageClick(stage.key)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  {stage.name}
                  <div className={cn('h-6 w-6 rounded-full flex items-center justify-center', stage.bgColor)}>
                    <Icon className={cn('h-3.5 w-3.5', stage.color)} />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stage.count}</div>
                <p className="text-xs text-muted-foreground">leads</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {totalLeads === 0 && (
        <div className="border-2 border-dashed rounded-xl p-12 text-center bg-muted/20">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Kanban className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Your pipeline is empty</h3>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            Add leads to start tracking them through your sales pipeline.
          </p>
          <Button onClick={() => router.push('/dashboard/leads')}>
            Add Your First Lead
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
