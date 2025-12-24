import { Metadata } from 'next';
import PricingPage from '@/components/pages/PricingPage';

export const metadata: Metadata = {
  title: 'Pricing | Automaire',
  description: 'Compare plans and pricing for custom websites, AI automation, chatbots, and voice agents.',
  openGraph: {
    title: 'Pricing | Automaire',
    description: 'Compare plans and pricing for custom websites, AI automation, chatbots, and voice agents.',
  },
};

export default function Page() {
  return <PricingPage />;
}
