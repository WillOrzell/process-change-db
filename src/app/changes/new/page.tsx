'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProcessChangeForm from '@/components/ProcessChangeForm';
// @ts-ignore
import { useUser } from '@clerk/nextjs';
import { getUserByClerkId, UserData } from '@/lib/auth';

export default function NewProcessChangePage() {
  const router = useRouter();
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Fetch user data
  useEffect(() => {
    async function fetchUser() {
      try {
        setLoading(true);
        
        if (isSignedIn && clerkUser) {
          const userData = await getUserByClerkId(clerkUser.id);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    }
    
    if (isLoaded) {
      fetchUser();
    }
  }, [isLoaded, isSignedIn, clerkUser]);
  
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