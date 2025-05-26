// src/app/diagram/page.tsx
"use client";

import type { NextPage } from 'next';
import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import AppHeader from '@/components/layout/app-header';
import DiagramView from '@/components/diagram/diagram-view';
import CodeView from '@/components/diagram/code-view';
import PromptForm from '@/components/diagram/prompt-form';
import ExportControls from '@/components/diagram/export-controls';
import { generateDiagram } from '@/ai/flows/diagram-generation';
import type { DiagramGenerationInput } from '@/ai/flows/diagram-generation';
import { useToast } from '@/hooks/use-toast';
import { renderMermaidDiagram, exportSVG, exportPNG, exportJSON } from '@/lib/mermaid-utils';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Loader2 } from 'lucide-react';

const DiagramPage: NextPage = () => {
  const { currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [diagramCode, setDiagramCode] = useState<string>('');
  const [currentSvgContent, setCurrentSvgContent] = useState<string>('');
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.replace('/login');
    }
  }, [currentUser, authLoading, router]);

  // Debounced rendering for code view changes
  const debouncedRenderDiagram = useCallback(
    debounce((code: string) => {
      startTransition(async () => {
        const svg = await renderMermaidDiagram('mermaid-diagram-container', code);
        if (svg) setCurrentSvgContent(svg);
      });
    }, 500),
    [] 
  );

  const handleCodeChange = (newCode: string) => {
    setDiagramCode(newCode);
    debouncedRenderDiagram(newCode);
  };

  const handlePromptSubmit = async (prompt: string) => {
    startTransition(async () => {
      try {
        const input: DiagramGenerationInput = { prompt };
        const result = await generateDiagram(input);
        setDiagramCode(result.diagramCode);
        const svg = await renderMermaidDiagram('mermaid-diagram-container', result.diagramCode);
        if (svg) setCurrentSvgContent(svg);
        toast({
          title: 'Diagram Generated!',
          description: 'Your diagram has been successfully created from the prompt.',
        });
      } catch (error) {
        console.error('Error generating diagram:', error);
        toast({
          variant: 'destructive',
          title: 'Error Generating Diagram',
          description: (error as Error).message || 'An unexpected error occurred.',
        });
      }
    });
  };

  const handleExportSVG = () => {
    if (currentSvgContent) exportSVG(currentSvgContent);
    else toast({ variant: 'destructive', title: 'Cannot Export', description: 'No diagram content to export as SVG.' });
  };
  const handleExportPNG = () => {
    if (currentSvgContent) exportPNG(currentSvgContent);
    else toast({ variant: 'destructive', title: 'Cannot Export', description: 'No diagram content to export as PNG.' });
  };
  const handleExportJSON = () => {
    if (diagramCode) exportJSON(diagramCode);
    else toast({ variant: 'destructive', title: 'Cannot Export', description: 'No diagram code to export as JSON.' });
  };

  const handleToggleFullScreen = () => setIsFullScreen(!isFullScreen);

  if (authLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!currentUser) return null; // Or a redirect component

  return (
    <div className={`flex flex-col h-screen bg-background ${isFullScreen ? 'fixed inset-0 z-[100]' : ''}`}>
      {!isFullScreen && <AppHeader />}
      <main className="flex-grow flex flex-col p-4 md:p-6 gap-4 md:gap-6 overflow-hidden">
        {!isFullScreen && (
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
             <div className="w-full md:w-auto md:flex-1 md:max-w-xl">
              <PromptForm onSubmit={handlePromptSubmit} isLoading={isPending} />
             </div>
            <ExportControls
              onExportSVG={handleExportSVG}
              onExportPNG={handleExportPNG}
              onExportJSON={handleExportJSON}
              onToggleFullScreen={handleToggleFullScreen}
              isFullScreen={isFullScreen}
              canExport={!!diagramCode}
            />
          </div>
        )}
        
        <ResizablePanelGroup 
          direction="horizontal"
          className={`flex-grow rounded-lg border overflow-hidden ${isFullScreen ? 'h-full' : 'min-h-[400px] md:min-h-0'}`}
        >
          <ResizablePanel defaultSize={isFullScreen ? 100 : 60} minSize={30}>
            <DiagramView diagramCode={diagramCode} isLoading={isPending} className={isFullScreen ? "h-full" : ""} />
          </ResizablePanel>
          {!isFullScreen && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={40} minSize={20}>
                 <CodeView diagramCode={diagramCode} onCodeChange={handleCodeChange} isLoading={isPending} className="h-full"/>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </main>
    </div>
  );
};

// Simple debounce function
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise(resolve => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
}

export default DiagramPage;
