import { Metadata } from 'next';
import HomePage from '@/components/pages/HomePage';

export const metadata: Metadata = {
  title: 'Automaire - Automation Agency',
  description: 'Custom websites, AI automation, and intelligent agents for modern businesses. Design workflows visually, we handle the execution.',
  openGraph: {
    title: 'Automaire - Automation Agency',
    description: 'Custom websites, AI automation, and intelligent agents for modern businesses.',
    type: 'website',
  },
};

export default function Page() {
  return <HomePage />;
}
