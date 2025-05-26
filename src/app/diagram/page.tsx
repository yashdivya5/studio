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
import { Loader2, Network } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


const DiagramPage: NextPage = () => {
  const { currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [diagramCode, setDiagramCode] = useState<string>('');
  const [currentSvgContent, setCurrentSvgContent] = useState<string>('');
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [diagramType, setDiagramType] = useState<string>('flowchart');

  const diagramTypes = [
    { value: 'flowchart', label: 'Flowchart' },
    { value: 'classDiagram', label: 'UML Class Diagram' },
    { value: 'sequenceDiagram', label: 'UML Sequence Diagram' },
    { value: 'stateDiagram', label: 'UML State Diagram' },
    { value: 'erDiagram', label: 'ER Diagram' },
    { value: 'gantt', label: 'Gantt Chart' },
    { value: 'mindmap', label: 'Mind Map' },
    { value: 'timeline', label: 'Timeline' },
    // Mermaid also supports C4, Sankey, XYChart, Pie, Quadrant charts which could be added
  ];

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.replace('/login');
    }
  }, [currentUser, authLoading, router]);

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

  const handlePromptSubmit = async (promptText: string) => {
    startTransition(async () => {
      try {
        // Future: Could incorporate diagramType into the prompt, e.g., by prefixing or contextualizing.
        // For now, diagramType is a UI element and the AI prompt for diagram generation is generic.
        // Example: const fullPrompt = `Create a ${diagramTypes.find(d => d.value === diagramType)?.label || 'diagram'} for: ${promptText}`;
        const input: DiagramGenerationInput = { prompt: promptText };
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
  
  if (!currentUser) return null;

  return (
    <div className={`flex flex-col h-screen bg-background ${isFullScreen ? 'fixed inset-0 z-[100]' : ''}`}>
      {!isFullScreen && <AppHeader />}
      <main className="flex-grow flex flex-col p-4 md:p-6 gap-4 md:gap-6 overflow-hidden">
        {!isFullScreen && (
          <div className="flex flex-col lg:flex-row items-start gap-4">
            <div className="flex flex-col gap-4 w-full lg:flex-grow-[2] lg:basis-0"> {/* Prompt + Type (takes more space) */}
              <PromptForm onSubmit={handlePromptSubmit} isLoading={isPending} />
              <Card className="shadow-md">
                <CardHeader className="py-3 px-4 border-b">
                  <CardTitle className="text-lg flex items-center text-primary">
                    <Network className="mr-2 h-5 w-5" />
                    Diagram Type
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <Select value={diagramType} onValueChange={setDiagramType}>
                    <SelectTrigger id="diagram-type-select" className="w-full bg-input focus-visible:ring-accent">
                      <SelectValue placeholder="Select diagram type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {diagramTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>

            <div className="w-full lg:flex-grow-[1] lg:basis-0 lg:sticky lg:top-[calc(var(--header-height,64px)+1.5rem)]"> {/* Export Controls (takes less space and can be sticky) */}
              <ExportControls
                onExportSVG={handleExportSVG}
                onExportPNG={handleExportPNG}
                onExportJSON={handleExportJSON}
                onToggleFullScreen={handleToggleFullScreen}
                isFullScreen={isFullScreen}
                canExport={!!diagramCode}
              />
            </div>
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
