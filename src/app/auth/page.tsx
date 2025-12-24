import { Metadata } from 'next';
import AuthPage from '@/components/pages/AuthPage';

export const metadata: Metadata = {
  title: 'Sign In | Automaire',
  description: 'Sign in to your Automaire dashboard or create a new account.',
  openGraph: {
    title: 'Sign In | Automaire',
    description: 'Sign in to your Automaire dashboard.',
  },
};

export default function Page() {
  return <AuthPage />;
}
