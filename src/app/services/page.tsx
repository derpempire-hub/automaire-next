import { Metadata } from 'next';
import ServicesPage from '@/components/pages/ServicesPage';

export const metadata: Metadata = {
  title: 'Services | Automaire',
  description: 'Custom websites, AI automation, chatbots, and voice agents. We build high-performance solutions for modern businesses.',
  openGraph: {
    title: 'Services | Automaire',
    description: 'Custom websites, AI automation, chatbots, and voice agents.',
  },
};

export default function Page() {
  return <ServicesPage />;
}
