'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProcessChange, ProcessStatus, ProcessArea } from '../../lib/db/process-changes';
import { getProcessChanges } from '@/lib/db/mock-data'; // Import the mock data function directly

export default function DashboardPage() {
  const [changes, setChanges] = useState<ProcessChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ProcessStatus | 'ALL'>('ALL');
  const [areaFilter, setAreaFilter] = useState<ProcessArea | 'ALL'>('ALL');

  // Process status options for filter
  const statusOptions: Array<ProcessStatus | 'ALL'> = [
    'ALL',
    'PROPOSED',
    'OPEN',
    'SUBMITTED',
    'ACCEPTED',
    'REJECTED',
  ];

  // Process area options for filter
  const areaOptions: Array<ProcessArea | 'ALL'> = [
    'ALL',
    'METALS',
    'ETCH',
    'PLATING',
    'SAW',
    'GRIND',
    'PHOTO',
    'DIFFUSION',
    'OTHER',
  ];

  // Load mock data directly
  useEffect(() => {
    // Get mock data directly instead of API call
    const mockChanges = getProcessChanges();
    setChanges(mockChanges);
    setLoading(false);
  }, []);

  // Apply filters
  const filteredChanges = changes.filter((change) => {
    if (statusFilter !== 'ALL' && change.status !== statusFilter) {
      return false;
    }
    if (areaFilter !== 'ALL' && change.processArea !== areaFilter) {
      return false;
    }
    return true;
  });

  // Function to get status badge color
  const getStatusColor = (status: ProcessStatus) => {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Process Change Dashboard</h1>
        <Link 
          href="/changes/new"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create New Change
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ProcessStatus | 'ALL')}
            className="border rounded px-3 py-2 w-full"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status === 'ALL' ? 'All Statuses' : status}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="areaFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Process Area
          </label>
          <select
            id="areaFilter"
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value as ProcessArea | 'ALL')}
            className="border rounded px-3 py-2 w-full"
          >
            {areaOptions.map((area) => (
              <option key={area} value={area}>
                {area === 'ALL' ? 'All Areas' : area}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="text-center py-8">Loading process changes...</div>
      ) : (
        <>
          {/* Results count */}
          <p className="mb-4 text-gray-600">
            Showing {filteredChanges.length} of {changes.length} changes
          </p>

          {/* Changes table */}
          {filteredChanges.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 px-4 border-b text-left">ID</th>
                    <th className="py-2 px-4 border-b text-left">Title</th>
                    <th className="py-2 px-4 border-b text-left">Status</th>
                    <th className="py-2 px-4 border-b text-left">Process Area</th>
                    <th className="py-2 px-4 border-b text-left">Age</th>
                    <th className="py-2 px-4 border-b text-left">Proposal Date</th>
                    <th className="py-2 px-4 border-b text-left">Target Date</th>
                    <th className="py-2 px-4 border-b text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredChanges.map((change) => (
                    <tr key={change.id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">{change.id}</td>
                      <td className="py-2 px-4 border-b">{change.title}</td>
                      <td className="py-2 px-4 border-b">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(change.status)}`}>
                          {change.status}
                        </span>
                      </td>
                      <td className="py-2 px-4 border-b">{change.processArea}</td>
                      <td className="py-2 px-4 border-b">{change.ageOfChange} days</td>
                      <td className="py-2 px-4 border-b">
                        {new Date(change.proposalDate).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {new Date(change.targetDate).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-4 border-b">
                        <Link
                          href={`/changes/${change.id}`}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No process changes found matching the current filters.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
} 