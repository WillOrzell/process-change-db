'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProcessChange } from '@/lib/db/process-changes';
import ProcessChangeForm from '@/components/ProcessChangeForm';
// Use our local auth instead of Clerk
import { useAuth, hasRole } from '@/lib/local-auth';
import { UserData } from '@/lib/auth';
import { parseAttachments } from '@/lib/uploads';

interface ChangeDetailPageProps {
  params: { id: string };
}

export default function ChangeDetailPage({ params }: ChangeDetailPageProps) {
  const { id } = params;
  const router = useRouter();
  const { user: currentUser, isLoaded, isSignedIn } = useAuth();
  
  const [change, setChange] = useState<ProcessChange | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  // Fetch process change data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch process change data
        const response = await fetch(`/api/changes/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch process change');
        }
        
        const data = await response.json();
        setChange(data);
        
        // Use the current user from local auth
        if (isSignedIn && currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load process change data');
      } finally {
        setLoading(false);
      }
    }
    
    if (isLoaded) {
      fetchData();
    }
  }, [id, isLoaded, isSignedIn, currentUser]);
  
  // Check if the user is the owner of this change
  const isOwner = user && change ? change.changeOwner === user.id : false;
  
  // Check user role
  const userRole = user ? user.role : 'ENGINEER';
  const isAdmin = user ? hasRole(user.role, 'ADMIN') : false;
  
  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PROPOSED':
        return 'bg-blue-100 text-blue-800';
      case 'OPEN':
        return 'bg-yellow-100 text-yellow-800';
      case 'SUBMITTED':
        return 'bg-purple-100 text-purple-800';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Handle delete
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this process change?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/changes/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete process change');
      }
      
      // Redirect to dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error('Error deleting process change:', error);
      setError('Failed to delete process change');
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">Loading process change...</div>
      </div>
    );
  }
  
  if (error || !change) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          {error || 'Process change not found'}
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
  
  // If in editing mode, show the form
  if (isEditing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => setIsEditing(false)}
          className="mb-4 text-blue-600 hover:text-blue-800 inline-flex items-center"
        >
          <span className="mr-1">←</span> Back to Details
        </button>
        
        <ProcessChangeForm
          initialData={change}
          isEditing={true}
          userRole={userRole}
          isOwner={isOwner}
        />
      </div>
    );
  }
  
  // Parse attachments
  const attachments = change.attachments ? parseAttachments(change.attachments) : [];
  
  // Detail view
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-blue-600 hover:text-blue-800 inline-flex items-center"
        >
          <span className="mr-1">←</span> Back to Dashboard
        </button>
        
        {(isAdmin || isOwner) && (
          <div className="space-x-2">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Edit
            </button>
            {isAdmin && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <h1 className="text-2xl font-bold">{change.title}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(change.status)}`}>
              {change.status}
            </span>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Process Details</h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Process Area:</span>
                  <p>{change.processArea}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Age of Change:</span>
                  <p>{change.ageOfChange} days</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Specification Updated:</span>
                  <p>{change.specUpdated ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-2">Dates</h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Proposal Date:</span>
                  <p>{formatDate(change.proposalDate)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Target Date:</span>
                  <p>{formatDate(change.targetDate)}</p>
                </div>
                {change.acceptanceDate && (
                  <div>
                    <span className="text-sm text-gray-500">Acceptance Date:</span>
                    <p>{formatDate(change.acceptanceDate)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Reason for Change</h2>
            <p className="whitespace-pre-wrap">{change.reason}</p>
          </div>
          
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Change Overview</h2>
            <p className="whitespace-pre-wrap">{change.changeOverview}</p>
          </div>
          
          {change.generalComments && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">General Comments</h2>
              <p className="whitespace-pre-wrap">{change.generalComments}</p>
            </div>
          )}
          
          {attachments.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Attachments</h2>
              <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                {attachments.map((path, index) => (
                  <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                    <div className="w-0 flex-1 flex items-center">
                      <span className="ml-2 flex-1 w-0 truncate">
                        {path.split('/').pop()}
                      </span>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <a
                        href={path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:text-blue-500"
                      >
                        View
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 