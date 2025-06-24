import { ClerkProvider as BaseClerkProvider } from '@clerk/clerk-react';
import { ReactNode } from 'react';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

interface ClerkProviderProps {
  children: ReactNode;
}

export const ClerkProvider = ({ children }: ClerkProviderProps) => {
  // If Clerk keys are not available, render children directly
  if (!clerkPubKey) {
    console.warn('Clerk publishable key not found, running in fallback mode');
    return <>{children}</>;
  }

  return (
    <BaseClerkProvider 
      publishableKey={clerkPubKey}
      afterSignInUrl="/role-selector"
      afterSignUpUrl="/role-selector"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      appearance={{
        variables: {
          colorPrimary: '#16a34a', // Green-600
          colorText: '#1f2937',
          colorTextSecondary: '#6b7280',
          colorDanger: '#ef4444',
          borderRadius: '0.5rem',
        },
        elements: {
          formButtonPrimary: 'bg-green-600 hover:bg-green-700 text-white',
          card: 'shadow-lg border-0',
          headerTitle: 'text-xl font-bold text-gray-900',
          headerSubtitle: 'text-gray-600',
          footerActionLink: 'text-green-600 hover:text-green-700',
        }
      }}
    >
      {children}
    </BaseClerkProvider>
  );
};