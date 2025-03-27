import nodemailer from 'nodemailer';
import { ProcessChange } from './db/process-changes';
import { getUserByClerkId } from './auth';

// Configure mail transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '25'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  } : undefined,
});

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Send an email
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'process-change@company.com',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Notify a supervisor when a change is proposed or submitted
 */
export async function notifySupervisor(change: ProcessChange, supervisorEmail: string): Promise<boolean> {
  const statusAction = change.status === 'PROPOSED' ? 'proposed' : 'submitted';
  
  return sendEmail({
    to: supervisorEmail,
    subject: `Process Change ${change.id} has been ${statusAction}`,
    text: `
Process Change #${change.id}: "${change.title}" has been ${statusAction}.

Process Area: ${change.processArea}
Proposal Date: ${change.proposalDate}
Target Date: ${change.targetDate}
Reason: ${change.reason}

Please review this change at your earliest convenience.
    `,
    html: `
<h1>Process Change #${change.id} has been ${statusAction}</h1>
<p><strong>Title:</strong> ${change.title}</p>
<p><strong>Process Area:</strong> ${change.processArea}</p>
<p><strong>Proposal Date:</strong> ${change.proposalDate}</p>
<p><strong>Target Date:</strong> ${change.targetDate}</p>
<p><strong>Reason:</strong> ${change.reason}</p>
<p><strong>Change Overview:</strong> ${change.changeOverview}</p>
<p>Please review this change at your earliest convenience.</p>
    `,
  });
}

/**
 * Notify an engineer when their change is accepted or rejected
 */
export async function notifyEngineer(change: ProcessChange, engineerEmail: string): Promise<boolean> {
  return sendEmail({
    to: engineerEmail,
    subject: `Process Change ${change.id} has been ${change.status.toLowerCase()}`,
    text: `
Process Change #${change.id}: "${change.title}" has been ${change.status.toLowerCase()}.

Process Area: ${change.processArea}
Proposal Date: ${change.proposalDate}
Target Date: ${change.targetDate}

${change.generalComments ? `Comments: ${change.generalComments}` : ''}
    `,
    html: `
<h1>Process Change #${change.id} has been ${change.status.toLowerCase()}</h1>
<p><strong>Title:</strong> ${change.title}</p>
<p><strong>Process Area:</strong> ${change.processArea}</p>
<p><strong>Proposal Date:</strong> ${change.proposalDate}</p>
<p><strong>Target Date:</strong> ${change.targetDate}</p>
${change.generalComments ? `<p><strong>Comments:</strong> ${change.generalComments}</p>` : ''}
    `,
  });
} 