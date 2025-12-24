'use client';

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { Users, Building2, FileText, FolderKanban, CheckSquare, Sparkles, ArrowRight, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLeads } from '@/hooks/useLeads';
import { useCompanies } from '@/hooks/useCompanies';
import { useTasks } from '@/hooks/useTasks';
import { useProposals } from '@/hooks/useProposals';
import { useProjects } from '@/hooks/useProjects';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } }
};

function StatCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4" />
      </div>
      <Skeleton className="h-8 w-12 mb-2" />
      <Skeleton className="h-3 w-24" />
    </Card>
  );
}

export default function DashboardHome() {
  const router = useRouter();

  const { data: leads = [], isLoading: leadsLoading } = useLeads();
  const { data: companies = [], isLoading: companiesLoading } = useCompanies();
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { data: proposals = [], isLoading: proposalsLoading } = useProposals();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();

  const isLoading = leadsLoading || companiesLoading || tasksLoading || proposalsLoading || projectsLoading;

  const pendingTasks = useMemo(() => tasks.filter(t => t.status !== 'completed').length, [tasks]);
  const activeProjects = useMemo(() => projects.filter(p => p.status === 'in_progress' || p.status === 'planning').length, [projects]);
  const pendingProposals = useMemo(() => proposals.filter(p => p.status === 'sent' || p.status === 'draft').length, [proposals]);

  const kpis = [
    { title: 'Total Leads', value: leads.length, subtitle: 'Active prospects', icon: Users, href: '/dashboard/leads', color: 'text-blue-500' },
    { title: 'Companies', value: companies.length, subtitle: 'Organizations', icon: Building2, href: '/dashboard/companies', color: 'text-purple-500' },
    { title: 'Proposals', value: pendingProposals, subtitle: 'Pending review', icon: FileText, href: '/dashboard/proposals', color: 'text-orange-500' },
    { title: 'Projects', value: activeProjects, subtitle: 'In progress', icon: FolderKanban, href: '/dashboard/projects', color: 'text-green-500' },
    { title: 'Tasks', value: pendingTasks, subtitle: 'Pending', icon: CheckSquare, href: '/dashboard/tasks', color: 'text-pink-500' },
  ];

  const totalItems = leads.length + companies.length + proposals.length + projects.length + tasks.length;
  const isEmpty = totalItems === 0 && !isLoading;
  const hasData = totalItems > 0;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="text-muted-foreground">Here&apos;s an overview of your business.</p>
        </div>
        {hasData && (
          <div className="hidden sm:flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-950/30 px-3 py-1.5 rounded-full">
            <TrendingUp className="h-4 w-4" />
            <span>Pipeline active</span>
          </div>
        )}
      </motion.div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {kpis.map((kpi) => (
            <motion.div key={kpi.href} variants={itemVariants}>
              <Card className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all duration-200 group" onClick={() => router.push(kpi.href)}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
                  <div className={`p-2 rounded-lg bg-muted/50 group-hover:bg-muted transition-colors ${kpi.color}`}>
                    <kpi.icon className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold tracking-tight">{kpi.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{kpi.subtitle}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {isEmpty && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.2 }} className="border border-dashed border-primary/30 rounded-xl p-8 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-semibold mb-2">Ready to grow your business?</h3>
              <p className="text-muted-foreground mb-4 max-w-lg">Your dashboard is set up and ready to go. Start by adding your first lead to begin tracking opportunities and building your sales pipeline.</p>
              <Button onClick={() => router.push('/dashboard/leads?action=add')} size="lg">
                Add Your First Lead
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {hasData && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Add Lead', href: '/dashboard/leads?action=add', icon: Users, color: 'bg-blue-500' },
              { label: 'Create Task', href: '/dashboard/tasks?action=add', icon: CheckSquare, color: 'bg-pink-500' },
              { label: 'New Proposal', href: '/dashboard/proposals?action=add', icon: FileText, color: 'bg-orange-500' },
              { label: 'View Pipeline', href: '/dashboard/pipeline', icon: TrendingUp, color: 'bg-green-500' },
            ].map((action) => (
              <Button key={action.label} variant="outline" className="h-auto py-4 justify-start gap-3 hover:bg-muted/50" onClick={() => router.push(action.href)}>
                <div className={`p-2 rounded-lg ${action.color} text-white`}>
                  <action.icon className="h-4 w-4" />
                </div>
                <span>{action.label}</span>
              </Button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
