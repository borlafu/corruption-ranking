'use server';

/**
 * @fileOverview This file defines a Genkit flow for automatically extracting and categorizing corruption case data from various sources.
 *
 * - `extractAndCategorizeCaseData`:  The main function that initiates the data extraction and categorization process.
 * - `ExtractedCaseData`: The output type for the `extractAndCategorizeCaseData` function, representing the extracted and categorized case data.
 * - `SourceDocument`: Represents the structure of a source document from which information is extracted.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SourceDocumentSchema = z.object({
  url: z.string().url().describe('URL del documento fuente (p. ej., artículo de noticias, documento legal).'),
  content: z.string().describe('El contenido textual extraído del documento fuente.'),
});

export type SourceDocument = z.infer<typeof SourceDocumentSchema>;

const ExtractedCaseDataSchema = z.object({
  mainSuspect: z.string().describe('El nombre del principal sospechoso en el caso de corrupción.'),
  numberOfAccusations: z
    .number()
    .int()
    .min(0)
    .describe('El número de acusaciones contra el sospechoso.'),
  numberOfSentences: z
    .number()
    .int()
    .min(0)
    .describe('El número de sentencias que ha recibido el sospechoso.'),
  politicalAllegianceCategory: z
    .enum([
      'miembro del gobierno',
      'miembro de la familia',
      'servidor publico',
      'institución',
    ])
    .describe(
      'La categoría de afiliación política del sospechoso (p. ej., miembro del gobierno, miembro de la familia, servidor público, institución).'
    ),
  sourceUrls: z.array(z.string().url()).describe('URLs de las fuentes utilizadas para extraer los datos.'),
});

export type ExtractedCaseData = z.infer<typeof ExtractedCaseDataSchema>;

const AutomateDataExtractionInputSchema = z.array(
  SourceDocumentSchema
).describe('Una matriz de documentos fuente de los que extraer datos de casos de corrupción.');

export type AutomateDataExtractionInput = z.infer<typeof AutomateDataExtractionInputSchema>;

export async function extractAndCategorizeCaseData(
  input: AutomateDataExtractionInput
): Promise<ExtractedCaseData[]> {
  return automateDataExtractionFlow(input);
}

const automateDataExtractionPrompt = ai.definePrompt({
  name: 'automateDataExtractionPrompt',
  input: {schema: AutomateDataExtractionInputSchema},
  output: {schema: z.array(ExtractedCaseDataSchema)},
  prompt: `Eres un asistente de IA especializado en extraer y categorizar datos relacionados con casos de corrupción en España.

  Dada una lista de documentos fuente, tu tarea es extraer la siguiente información para cada caso mencionado:

  - Principal sospechoso: El nombre del principal sospechoso involucrado en el caso de corrupción.
  - Número de acusaciones: El número total de acusaciones contra el sospechoso.
  - Número de sentencias: El número total de sentencias que ha recibido el sospechoso.
  - Categoría de afiliación política: La categoría que mejor describe la afiliación política del sospechoso (miembro del gobierno, miembro de la familia, servidor público o institución).
  - URLs de las fuentes: Una lista de URLs de los documentos fuente que respaldan la información extraída.

  Presenta los datos extraídos en un formato estructurado, garantizando la precisión y la coherencia.

  Aquí están los documentos fuente:
  {{#each this}}
  URL de la fuente: {{{url}}}
  Contenido: {{{content}}}
  {{/each}}

  Asegúrate de que los datos extraídos sean completos y reflejen con precisión la información disponible en los documentos fuente. Enumera todas las URLs de las fuentes utilizadas para extraer la información.
  La salida debe ser una matriz JSON.`,
});

const automateDataExtractionFlow = ai.defineFlow(
  {
    name: 'automateDataExtractionFlow',
    inputSchema: AutomateDataExtractionInputSchema,
    outputSchema: z.array(ExtractedCaseDataSchema),
  },
  async input => {
    const {output} = await automateDataExtractionPrompt(input);
    return output!;
  }
);
