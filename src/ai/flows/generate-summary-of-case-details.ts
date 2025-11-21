'use server';
/**
 * @fileOverview An AI agent that generates a summary of a corruption case.
 *
 * - generateCaseSummary - A function that handles the generation of a case summary.
 * - GenerateCaseSummaryInput - The input type for the generateCaseSummary function.
 * - GenerateCaseSummaryOutput - The return type for the generateCaseSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCaseSummaryInputSchema = z.object({
  caseDetails: z.string().describe('Información detallada sobre el caso de corrupción.'),
});
export type GenerateCaseSummaryInput = z.infer<typeof GenerateCaseSummaryInputSchema>;

const GenerateCaseSummaryOutputSchema = z.object({
  summary: z.string().describe('Un resumen conciso del caso de corrupción.'),
});
export type GenerateCaseSummaryOutput = z.infer<typeof GenerateCaseSummaryOutputSchema>;

export async function generateCaseSummary(input: GenerateCaseSummaryInput): Promise<GenerateCaseSummaryOutput> {
  return generateCaseSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCaseSummaryPrompt',
  input: {schema: GenerateCaseSummaryInputSchema},
  output: {schema: GenerateCaseSummaryOutputSchema},
  prompt: `Eres un experto en resumir casos complejos de corrupción.

  Dados los siguientes detalles de un caso de corrupción, proporciona un resumen conciso e informativo.

  Detalles del caso: {{{caseDetails}}}`,
});

const generateCaseSummaryFlow = ai.defineFlow(
  {
    name: 'generateCaseSummaryFlow',
    inputSchema: GenerateCaseSummaryInputSchema,
    outputSchema: GenerateCaseSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
