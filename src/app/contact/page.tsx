import { Metadata } from 'next';
import ContactPage from '@/components/pages/ContactPage';

export const metadata: Metadata = {
  title: 'Contact | Automaire',
  description: 'Get in touch with us. Tell us about your project and we will respond within 24 hours.',
  openGraph: {
    title: 'Contact | Automaire',
    description: 'Get in touch with us. Tell us about your project.',
  },
};

export default function Page() {
  return <ContactPage />;
}
