// Mock email functions for development
import { ProcessChange } from './db/process-types';

// Mock transporter for development
const mockTransporter = {
  sendMail: async (options: any) => {
    console.log('MOCK EMAIL SENT:');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('Text:', options.text);
    return { messageId: `mock-${Date.now()}` };
  }
};

/**
 * Send email notification when a change status is updated
 */
export async function sendStatusUpdateEmail(processChange: ProcessChange, previousStatus: string): Promise<void> {
  try {
    // In a real implementation, we would:
    // 1. Get the engineer's email from the database
    // 2. Get supervisor emails from the database
    // 3. Send appropriate emails based on the status change
    
    console.log(`Mock email for change #${processChange.id}: Status changed from ${previousStatus} to ${processChange.status}`);
    
    // For demonstration, always log a mock email
    await mockTransporter.sendMail({
      to: 'mock-user@example.com',
      subject: `Process Change #${processChange.id} - Status Update`,
      text: `The status of process change "${processChange.title}" has been updated from ${previousStatus} to ${processChange.status}.`
    });
  } catch (error) {
    console.error('Error sending status update email:', error);
  }
}

/**
 * Send email notification when a new process change is created
 */
export async function sendNewChangeEmail(processChange: ProcessChange): Promise<void> {
  try {
    console.log(`Mock email for new change #${processChange.id}`);
    
    // For demonstration, always log a mock email
    await mockTransporter.sendMail({
      to: 'mock-supervisor@example.com',
      subject: `New Process Change #${processChange.id}`,
      text: `A new process change "${processChange.title}" has been created and requires your review.`
    });
  } catch (error) {
    console.error('Error sending new change email:', error);
  }
} 