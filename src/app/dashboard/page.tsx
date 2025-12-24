'use client';

import { useRouter } from 'next/navigation';
import { Users, Building2, FileText, FolderKanban, CheckSquare, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const kpis = [
  {
    title: 'Total Leads',
    value: 0,
    subtitle: 'Active prospects',
    icon: Users,
    href: '/dashboard/leads',
  },
  {
    title: 'Companies',
    value: 0,
    subtitle: 'Organizations tracked',
    icon: Building2,
    href: '/dashboard/companies',
  },
  {
    title: 'Proposals',
    value: 0,
    subtitle: 'Pending review',
    icon: FileText,
    href: '/dashboard/proposals',
  },
  {
    title: 'Projects',
    value: 0,
    subtitle: 'In progress',
    icon: FolderKanban,
    href: '/dashboard/projects',
  },
  {
    title: 'Tasks',
    value: 0,
    subtitle: 'Pending',
    icon: CheckSquare,
    href: '/dashboard/tasks',
  },
];

export default function DashboardHome() {
  const router = useRouter();
  const totalItems = kpis.reduce((sum, k) => sum + k.value, 0);
  const isEmpty = totalItems === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="text-muted-foreground">Here is an overview of your business.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {kpis.map((kpi) => (
          <Card
            key={kpi.href}
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => router.push(kpi.href)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground">{kpi.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {isEmpty && (
        <div className="border border-dashed border-primary/30 rounded-xl p-8 bg-primary/5">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-semibold mb-2">Ready to grow your business?</h3>
              <p className="text-muted-foreground mb-4 max-w-lg">
                Your dashboard is set up and ready to go. Start by adding your first lead to begin tracking
                opportunities and building your sales pipeline.
              </p>
              <Button onClick={() => router.push('/dashboard/leads')}>
                Add Your First Lead
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
