
// diagram-generation.ts
'use server';

/**
 * @fileOverview Diagram generation from a text prompt.
 *
 * - generateDiagram - A function that takes a text prompt and returns a diagram code.
 * - DiagramGenerationInput - The input type for the generateDiagram function.
 * - DiagramGenerationOutput - The return type for the generateDiagram function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DiagramGenerationInputSchema = z.object({
  prompt: z.string().describe('A text prompt describing the diagram to generate.'),
});
export type DiagramGenerationInput = z.infer<typeof DiagramGenerationInputSchema>;

const DiagramGenerationOutputSchema = z.object({
  diagramCode: z.string().describe('The code representation of the diagram (e.g., Mermaid, Graphviz).'),
});
export type DiagramGenerationOutput = z.infer<typeof DiagramGenerationOutputSchema>;

export async function generateDiagram(input: DiagramGenerationInput): Promise<DiagramGenerationOutput> {
  return diagramGenerationFlow(input);
}

const diagramGenerationPrompt = ai.definePrompt({
  name: 'diagramGenerationPrompt',
  input: {schema: DiagramGenerationInputSchema},
  output: {schema: DiagramGenerationOutputSchema},
  prompt: `You are a diagram generation expert. You will generate diagram code based on the user's prompt.

  Prompt: {{{prompt}}}

  The diagram code should be in Mermaid or Graphviz format.
  Ensure the code is valid and complete. Pay close attention to link and arrow syntax. For example, use 'A --> B' for a simple directed link, 'A --- B' for an undirected link, or 'A -- text --- B' for a link with text. Do not use incomplete link syntax like 'A -'.
  IMPORTANT: Do NOT wrap the diagram code in Markdown code fences (e.g., \`\`\`mermaid ... \`\`\` or \`\`\` ... \`\`\`).
  The output should be only the raw diagram code itself, starting directly with the diagram type (e.g., 'graph TD', 'classDiagram').
  `,
});

const diagramGenerationFlow = ai.defineFlow(
  {
    name: 'diagramGenerationFlow',
    inputSchema: DiagramGenerationInputSchema,
    outputSchema: DiagramGenerationOutputSchema,
  },
  async input => {
    const {output} = await diagramGenerationPrompt(input);
    // Additional check to remove fences if AI still includes them, though the prompt should prevent it.
    if (output && output.diagramCode) {
        const fenceRegex = /^\s*```(?:mermaid)?\s*\n?([\s\S]*?)\n?\s*```\s*$/;
        const match = output.diagramCode.match(fenceRegex);
        if (match && match[1]) {
            output.diagramCode = match[1].trim();
        }
    }
    return output!;
  }
);

