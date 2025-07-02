
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

  **Critical Rules for Node Text:**
  - **ALWAYS enclose node text (labels) in double quotes.** This is a strict requirement.
  - **Correct format:** \`nodeId["This is my node text"]\`
  - **Incorrect format:** \`nodeId[This is my node text]\`
  - This rule applies to all node shapes. For example: \`id["Rectangle"]\`, \`id("Rounded")\`, \`id(("Circle"))\`.
  - For multi-line text, use \`<br>\` tags INSIDE the quotes: \`id["First line<br>Second line"]\`. Do NOT create actual newlines in the code for multi-line text within a single node definition.

  **Other Important Rules:**
  - Start directly with the diagram type declaration (e.g., 'graph TD', 'classDiagram', 'sequenceDiagram').
  - For links/edges:
    - Use correct arrow syntax: \`A --> B\` (directed), \`A --- B\` (undirected).
    - Link text MUST be in double quotes: \`A-- "Link Label" -->B\`.
    - Ensure links connect valid node IDs and are complete.
  - Ensure all blocks (like subgraphs) are correctly opened and closed.
  - **Crucially, do NOT include any external image URLs or links (e.g., \`![alt](http://...)\` or HTML \`<img>\` tags) within the diagram code.** The diagram should be self-contained vector graphics.

  **Output Format:**
  - IMPORTANT: Do NOT wrap the diagram code in Markdown code fences (e.g., \`\`\`mermaid ... \`\`\` or \`\`\` ... \`\`\`).
  - The output must be only the raw diagram code itself, starting with the diagram type.
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
        } else {
            // Also trim if no fences were found, just in case of leading/trailing whitespace from AI
            output.diagramCode = output.diagramCode.trim();
        }
    }
    return output!;
  }
);
