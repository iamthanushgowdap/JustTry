'use server';

/**
 * @fileOverview Automatically suggests a list of tasks to complete for each lead in the pipeline.
 *
 * - suggestTasks - A function that suggests tasks based on lead data and status.
 * - SuggestTasksInput - The input type for the suggestTasks function.
 * - SuggestTasksOutput - The return type for the suggestTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTasksInputSchema = z.object({
  leadName: z.string().describe('The name of the lead.'),
  serviceType: z.enum(['Loan', 'Investment', 'Insurance']).describe('The type of service the lead is interested in.'),
  leadStatus: z.string().describe('The current status of the lead in the pipeline.'),
  leadData: z.string().describe('Additional data about the lead, such as income, job, and location.'),
});
export type SuggestTasksInput = z.infer<typeof SuggestTasksInputSchema>;

const SuggestTasksOutputSchema = z.object({
  tasks: z.array(z.string()).describe('A list of suggested tasks for the lead.'),
});
export type SuggestTasksOutput = z.infer<typeof SuggestTasksOutputSchema>;

export async function suggestTasks(input: SuggestTasksInput): Promise<SuggestTasksOutput> {
  return suggestTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTasksPrompt',
  input: {schema: SuggestTasksInputSchema},
  output: {schema: SuggestTasksOutputSchema},
  prompt: `You are an AI assistant helping sales users manage their leads efficiently by suggesting tasks they need to complete. Analyze the lead data and status to suggest a list of tasks the user needs to complete for each lead in the pipeline.

Lead Name: {{{leadName}}}
Service Type: {{{serviceType}}}
Lead Status: {{{leadStatus}}}
Lead Data: {{{leadData}}}

Consider the service type and lead status to tailor the task suggestions. For example, if the service type is 'Loan' and the lead status is 'New', suggest tasks like 'KYC Pending' and 'Documents Needed'. If the service type is 'Investment' and the lead status is 'Risk Profiling', suggest tasks like 'KYC Verification' and 'Investment Planning'. If the service type is 'Insurance' and the lead status is 'KYC Pending', suggest tasks like 'Medical Check (if required)' and 'Underwriting'.

Output a JSON object with a "tasks" array containing a list of suggested tasks.
`,
});

const suggestTasksFlow = ai.defineFlow(
  {
    name: 'suggestTasksFlow',
    inputSchema: SuggestTasksInputSchema,
    outputSchema: SuggestTasksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
