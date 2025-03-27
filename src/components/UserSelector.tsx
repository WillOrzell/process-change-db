'use client';

import { useState, useEffect } from 'react';
import { setCurrentUser } from '@/lib/local-auth';

const users = [
  { id: 'user_1', name: 'John Engineer (Engineer)' },
  { id: 'user_2', name: 'Jane Supervisor (Supervisor)' },
  { id: 'user_3', name: 'Admin User (Admin)' }
];

export default function UserSelector() {
  const [selectedUser, setSelectedUser] = useState('user_1');
  const [isLoading, setIsLoading] = useState(false);

  // Change user when selection changes - only run on client side
  useEffect(() => {
    async function changeUser() {
      setIsLoading(true);
      try {
        await setCurrentUser(selectedUser);
      } catch (error) {
        console.error('Error changing user:', error);
      } finally {
        setIsLoading(false);
      }
    }

    // Execute user change
    changeUser();
  }, [selectedUser]);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Test as:</span>
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 text-sm"
          disabled={isLoading}
        >
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
        {isLoading && (
          <span className="w-4 h-4 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></span>
        )}
      </div>
      <div className="text-sm font-medium">
        Process Change Database
      </div>
    </div>
  );
} 