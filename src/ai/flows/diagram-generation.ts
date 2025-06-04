
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

  The diagram code MUST be in **Mermaid format**. Do NOT use Graphviz or other formats.
  Ensure the code is valid and complete.
  - Start directly with the diagram type declaration (e.g., 'graph TD', 'classDiagram', 'sequenceDiagram').
  - For node definitions:
    - Use standard Mermaid syntax (e.g., \`id[Text]\`, \`id(Text)\`, \`id((Text))\`, etc.).
    - If node text contains special characters (like \`(\`, \`)\`, \`[\`, \`]\`, \`#\`, \`;\`) or spaces, enclose the text in double quotes: \`id["Text with (special) characters"]\`.
    - For multi-line text within a node, use \`<br>\` tags for line breaks: \`id["First line<br>Second line"]\`. Do NOT create newlines in the code for multi-line text within a single node definition.
  - For links:
    - Use correct arrow syntax: \`A --> B\` (directed), \`A --- B\` (undirected), \`A -- Text --> B\` (directed with text), \`A -- Text --- B\` (undirected with text).
    - Ensure links connect valid node IDs.
    - Do not use incomplete link syntax like 'A -' or 'A --'.
  - Ensure all blocks (like subgraphs, classes, sequence diagram participants) are correctly opened and closed.

  IMPORTANT: Do NOT wrap the diagram code in Markdown code fences (e.g., \`\`\`mermaid ... \`\`\` or \`\`\` ... \`\`\`).
  The output must be only the raw diagram code itself.
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

