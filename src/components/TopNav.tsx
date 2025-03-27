'use client'; // Mark this explicitly as a client component

import UserSelector from './UserSelector';

export default function TopNav() {
  return (
    <div className="sticky top-0 z-50 bg-gray-100 border-b border-gray-200">
      <div className="container mx-auto px-4 py-2">
        <UserSelector />
      </div>
    </div>
  );
} 