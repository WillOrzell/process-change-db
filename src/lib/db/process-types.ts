// Define types for process changes without database dependencies
export type ProcessStatus = "PROPOSED" | "OPEN" | "SUBMITTED" | "ACCEPTED" | "REJECTED";
export type ProcessArea = "METALS" | "ETCH" | "PLATING" | "SAW" | "GRIND" | "PHOTO" | "DIFFUSION" | "OTHER";

export interface ProcessChange {
  id: number;
  status: ProcessStatus;
  title: string;
  processArea: ProcessArea;
  changeOwner: number;
  proposalDate: string;
  targetDate: string;
  acceptanceDate?: string;
  ageOfChange: number;
  reason: string;
  changeOverview: string;
  generalComments?: string;
  attachments?: string;
  specUpdated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProcessChangeInput extends Omit<ProcessChange, 'id' | 'ageOfChange' | 'createdAt' | 'updatedAt'> {
  ageOfChange?: number;
} 