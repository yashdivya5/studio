
// src/components/diagram/prompt-form.tsx
"use client";

import type { FC } from 'react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wand2, Paperclip, XCircle } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface PromptFormProps {
  onSubmit: (prompt: string) => Promise<void>;
  isLoading: boolean;
  documentFile: File | null;
  setDocumentFile: (file: File | null) => void;
}

const PromptForm: FC<PromptFormProps> = ({ onSubmit, isLoading, documentFile, setDocumentFile }) => {
  const [prompt, setPrompt] = useState('');
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          variant: 'destructive',
          title: 'File too large',
          description: 'Please upload a file smaller than 5MB.',
        });
        setDocumentFile(null);
        event.target.value = ''; // Reset file input
      } else {
        setDocumentFile(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!prompt.trim() && !documentFile) || isLoading) return;
    await onSubmit(prompt || "Summarize the uploaded document into a diagram.");
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
        <CardContent className="p-4 pb-2 space-y-3">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A flowchart for user login process. Or, upload a document or image below."
            rows={3}
            className="resize-none bg-input focus-visible:ring-accent"
            disabled={isLoading}
            aria-label="Diagram Prompt Input"
          />
          {documentFile && (
            <div className="flex items-center justify-between p-2.5 bg-muted rounded-md text-sm">
                <div className="flex items-center gap-2 overflow-hidden">
                <Paperclip className="h-4 w-4 flex-shrink-0" />
                <span className="truncate text-foreground" title={documentFile.name}>
                    {documentFile.name}
                </span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full"
                    onClick={() => setDocumentFile(null)}
                    aria-label="Remove file"
                >
                    <XCircle className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="px-4 pb-4 flex items-center justify-between gap-2">
            <div>
                <Input
                    id="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                    accept=".pdf,.txt,.md,.json,.doc,.docx,.png,.jpg,.jpeg,.webp"
                    disabled={isLoading}
                />
                <Label
                    htmlFor="file-upload"
                    className="cursor-pointer"
                >
                    <Button variant="outline" asChild className="pointer-events-none border-primary text-primary hover:bg-primary/10 hover:text-primary">
                        <span>
                            <Paperclip className="mr-2 h-4 w-4" />
                            {documentFile ? 'Replace File' : 'Attach File'}
                        </span>
                    </Button>
                </Label>
            </div>
          <Button type="submit" disabled={isLoading || (!prompt.trim() && !documentFile)} className="w-full flex-grow bg-accent hover:bg-accent/90 text-accent-foreground">
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
