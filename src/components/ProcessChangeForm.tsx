'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ProcessChange, ProcessArea, ProcessStatus } from '@/lib/db/process-changes';
import { parseAttachments, stringifyAttachments } from '@/lib/uploads';

interface ProcessChangeFormProps {
  initialData?: ProcessChange;
  isEditing?: boolean;
  userRole: 'ENGINEER' | 'SUPERVISOR' | 'ADMIN';
  isOwner?: boolean;
}

// Interface for form state that uses string[] for attachments
interface FormState {
  title: string;
  processArea: ProcessArea;
  reason: string;
  changeOverview: string;
  generalComments: string;
  targetDate: string;
  status: ProcessStatus;
  specUpdated: boolean;
  attachments: string[];
  [key: string]: any; // Allow additional properties
}

const ProcessChangeForm = ({ 
  initialData, 
  isEditing = false, 
  userRole,
  isOwner = false
}: ProcessChangeFormProps) => {
  const router = useRouter();
  const isAdmin = userRole === 'ADMIN';
  const isSupervisor = userRole === 'SUPERVISOR';
  const canEditAllFields = isAdmin || (isOwner && isEditing);
  const canChangeStatus = isAdmin || isSupervisor || (isOwner && initialData?.status === 'OPEN');
  
  // Default form state
  const defaultFormState: FormState = {
    title: '',
    processArea: 'OTHER',
    reason: '',
    changeOverview: '',
    generalComments: '',
    targetDate: new Date().toISOString().split('T')[0],
    status: 'PROPOSED',
    specUpdated: false,
    attachments: []
  };
  
  // Form state - convert attachments from string to string[] if needed
  const [formState, setFormState] = useState<FormState>(
    initialData ? {
      ...initialData,
      generalComments: initialData.generalComments || '',
      attachments: initialData.attachments ? parseAttachments(initialData.attachments) : []
    } : defaultFormState
  );
  
  // File upload state
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [attachments, setAttachments] = useState<string[]>(
    initialData?.attachments ? parseAttachments(initialData.attachments) : []
  );
  
  // Status options based on current status and user role
  const getStatusOptions = (): ProcessStatus[] => {
    if (!initialData) return ['PROPOSED'];
    
    switch (initialData.status) {
      case 'PROPOSED':
        return isSupervisor ? ['PROPOSED', 'OPEN'] : ['PROPOSED'];
      case 'OPEN':
        return isOwner ? ['OPEN', 'SUBMITTED'] : ['OPEN'];
      case 'SUBMITTED':
        return isSupervisor ? ['SUBMITTED', 'ACCEPTED', 'REJECTED'] : ['SUBMITTED'];
      default:
        return isAdmin ? ['PROPOSED', 'OPEN', 'SUBMITTED', 'ACCEPTED', 'REJECTED'] : [initialData.status];
    }
  };
  
  // Process areas
  const processAreas: ProcessArea[] = [
    'METALS', 'ETCH', 'PLATING', 'SAW', 'GRIND', 'PHOTO', 'DIFFUSION', 'OTHER'
  ];
  
  // Handle input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormState(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormState(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Handle file input change
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };
  
  // Upload files
  const uploadFiles = async (): Promise<string[]> => {
    if (files.length === 0) return attachments;
    
    setIsUploading(true);
    setUploadError('');
    
    const uploadedPaths: string[] = [];
    
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        
        if (initialData?.id) {
          formData.append('processChangeId', initialData.id.toString());
        }
        
        const response = await fetch('/api/uploads', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }
        
        const { filePath } = await response.json();
        uploadedPaths.push(filePath);
      }
      
      setFiles([]);
      return [...attachments, ...uploadedPaths];
    } catch (error) {
      console.error('Error uploading files:', error);
      setUploadError('Failed to upload files. Please try again.');
      return attachments;
    } finally {
      setIsUploading(false);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      // Upload any pending files first
      const updatedAttachments = await uploadFiles();
      
      // Prepare data for submission
      const submitData = {
        ...formState,
        attachments: stringifyAttachments(updatedAttachments)
      };
      
      // API endpoint and method based on if we're creating or editing
      const endpoint = isEditing && initialData 
        ? `/api/changes/${initialData.id}` 
        : '/api/changes';
      const method = isEditing ? 'PATCH' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save process change');
      }
      
      const result = await response.json();
      
      // Redirect to the process change detail page
      router.push(`/changes/${result.id}`);
      router.refresh();
    } catch (error) {
      console.error('Error saving process change:', error);
      setUploadError(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  // Delete an attachment
  const handleDeleteAttachment = async (filePath: string) => {
    try {
      const response = await fetch('/api/uploads', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filePath })
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete file');
      }
      
      // Update attachments list
      setAttachments(prev => prev.filter(path => path !== filePath));
    } catch (error) {
      console.error('Error deleting attachment:', error);
      setUploadError('Failed to delete attachment');
    }
  };
  
  // Get filename from path
  const getFilenameFromPath = (path: string) => {
    return path.split('/').pop() || path;
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          {isEditing ? 'Edit Process Change' : 'New Process Change'}
        </h2>
        
        {uploadError && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md">{uploadError}</div>
        )}
        
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formState.title || ''}
            onChange={handleChange}
            disabled={!canEditAllFields}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>
        
        {/* Process Area */}
        <div>
          <label htmlFor="processArea" className="block text-sm font-medium text-gray-700">
            Process Area
          </label>
          <select
            id="processArea"
            name="processArea"
            value={formState.processArea || 'OTHER'}
            onChange={handleChange}
            disabled={!canEditAllFields}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          >
            {processAreas.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>
        
        {/* Target Date */}
        <div>
          <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700">
            Target Date
          </label>
          <input
            type="date"
            id="targetDate"
            name="targetDate"
            value={formState.targetDate ? formState.targetDate.toString().substring(0, 10) : ''}
            onChange={handleChange}
            disabled={!canEditAllFields}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>
        
        {/* Status */}
        {isEditing && (
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formState.status || 'PROPOSED'}
              onChange={handleChange}
              disabled={!canChangeStatus}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            >
              {getStatusOptions().map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        )}
        
        {/* Reason */}
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
            Reason for Change
          </label>
          <textarea
            id="reason"
            name="reason"
            value={formState.reason || ''}
            onChange={handleChange}
            disabled={!canEditAllFields}
            required
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>
        
        {/* Change Overview */}
        <div>
          <label htmlFor="changeOverview" className="block text-sm font-medium text-gray-700">
            Change Overview
          </label>
          <textarea
            id="changeOverview"
            name="changeOverview"
            value={formState.changeOverview || ''}
            onChange={handleChange}
            disabled={!canEditAllFields}
            required
            rows={5}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>
        
        {/* General Comments */}
        <div>
          <label htmlFor="generalComments" className="block text-sm font-medium text-gray-700">
            General Comments
          </label>
          <textarea
            id="generalComments"
            name="generalComments"
            value={formState.generalComments || ''}
            onChange={handleChange}
            disabled={!canEditAllFields && !isSupervisor}
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>
        
        {/* Spec Updated */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="specUpdated"
            name="specUpdated"
            checked={formState.specUpdated || false}
            onChange={(e) => setFormState(prev => ({ ...prev, specUpdated: e.target.checked }))}
            disabled={!canEditAllFields}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="specUpdated" className="ml-2 block text-sm text-gray-700">
            Specification Updated
          </label>
        </div>
        
        {/* File Attachments */}
        {(canEditAllFields || isAdmin) && (
          <div>
            <label htmlFor="files" className="block text-sm font-medium text-gray-700">
              Attachments
            </label>
            <input
              type="file"
              id="files"
              name="files"
              multiple
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            <div className="mt-2 text-sm text-gray-500">
              Selected files: {files.length > 0 ? files.map(f => f.name).join(', ') : 'None'}
            </div>
          </div>
        )}
        
        {/* Current Attachments */}
        {attachments.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700">Current Attachments</h3>
            <ul className="mt-2 border border-gray-200 rounded-md divide-y divide-gray-200">
              {attachments.map((path, index) => (
                <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                  <div className="w-0 flex-1 flex items-center">
                    <span className="ml-2 flex-1 w-0 truncate">{getFilenameFromPath(path)}</span>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex space-x-4">
                    <a
                      href={path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:text-blue-500"
                    >
                      View
                    </a>
                    {(canEditAllFields || isAdmin) && (
                      <button
                        type="button"
                        onClick={() => handleDeleteAttachment(path)}
                        className="font-medium text-red-600 hover:text-red-500"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        
        <button
          type="submit"
          disabled={isUploading}
          className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isUploading ? 'Uploading...' : isEditing ? 'Save Changes' : 'Create Process Change'}
        </button>
      </div>
    </form>
  );
};

export default ProcessChangeForm; 