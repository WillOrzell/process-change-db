'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProcessChangeForm from '@/components/ProcessChangeForm';
// Use our local auth instead of Clerk
import { useAuth } from '@/lib/local-auth';
import { UserData } from '@/lib/auth';

export default function NewProcessChangePage() {
  const router = useRouter();
  const { user: currentUser, isLoaded, isSignedIn } = useAuth();
  
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Set user from local auth
  useEffect(() => {
    if (isLoaded) {
      setLoading(false);
      
      if (isSignedIn && currentUser) {
        setUser(currentUser);
      } else {
        setError('User not found. Please sign in.');
      }
    }
  }, [isLoaded, isSignedIn, currentUser]);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">Loading...</div>
      </div>
    );
  }
  
  if (error || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          {error || 'User not found. Please sign in.'}
        </div>
        <div className="mt-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-blue-600 hover:text-blue-800 inline-flex items-center"
        >
          <span className="mr-1">←</span> Back to Dashboard
        </button>
      </div>
      
      <ProcessChangeForm
        userRole={user.role}
        isOwner={true}
      />
    </div>
  );
} 