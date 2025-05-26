
// src/components/diagram/prompt-form.tsx
"use client";

import type { FC } from 'react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Wand2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface PromptFormProps {
  onSubmit: (prompt: string) => Promise<void>;
  isLoading: boolean;
}

const PromptForm: FC<PromptFormProps> = ({ onSubmit, isLoading }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    await onSubmit(prompt);
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-lg flex items-center text-primary">
            <Wand2 className="mr-2 h-5 w-5"/>
            Describe Your Diagram
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="p-4">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A flowchart for user login process with success and failure paths."
            rows={2} // Reduced from 3 to 2
            className="resize-none bg-input focus-visible:ring-accent"
            disabled={isLoading}
            aria-label="Diagram Prompt Input"
          />
        </CardContent>
        <CardFooter className="px-4 pb-4">
          <Button type="submit" disabled={isLoading || !prompt.trim()} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-5 w-5" /> Generate Diagram
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default PromptForm;

    