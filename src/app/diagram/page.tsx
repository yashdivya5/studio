
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
import { Dialog, DialogContent, DialogClose, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Network, XIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle as UiCardTitle } from '@/components/ui/card';


const DiagramPage: NextPage = () => {
  const { currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [diagramCode, setDiagramCode] = useState<string>('');
  const [currentSvgContent, setCurrentSvgContent] = useState<string>('');
  const [diagramType, setDiagramType] = useState<string>('flowchart');
  const [isDiagramModalOpen, setIsDiagramModalOpen] = useState<boolean>(false);
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const diagramTypes = [
    { value: 'flowchart', label: 'Flowchart' },
    { value: 'classDiagram', label: 'UML Class Diagram' },
    { value: 'sequenceDiagram', label: 'UML Sequence Diagram' },
    { value: 'stateDiagram', label: 'UML State Diagram' },
    { value: 'erDiagram', label: 'ER Diagram' },
    { value: 'gantt', label: 'Gantt Chart' },
    { value: 'mindmap', label: 'Mind Map' },
    { value: 'timeline', label: 'Timeline' },
    { value: 'networkDiagram', label: 'Network Diagram' },
  ];

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.replace('/login');
    }
  }, [currentUser, authLoading, router]);

  const debouncedRenderDiagram = useCallback(
    debounce(async (code: string, containerId: string = 'mermaid-diagram-container') => {
      const svg = await renderMermaidDiagram(containerId, code);
      if (svg && containerId === 'mermaid-diagram-container') { // Only update main view's SVG content
        setCurrentSvgContent(svg);
      }
      return svg;
    }, 300),
    []
  );

  useEffect(() => {
    if (isDiagramModalOpen && diagramCode) {
      startTransition(async () => {
        // Ensure the modal container is definitely in the DOM before rendering
        await new Promise(resolve => setTimeout(resolve, 0)); 
        await debouncedRenderDiagram(diagramCode, 'mermaid-modal-diagram-container');
      });
    }
  }, [isDiagramModalOpen, diagramCode, debouncedRenderDiagram]);

  const handleCodeChange = (newCode: string) => {
    setDiagramCode(newCode);
    startTransition(async () => {
      await debouncedRenderDiagram(newCode);
    });
  };

  const handlePromptSubmit = async (promptText: string) => {
    startTransition(async () => {
      try {
        let documentDataUri: string | undefined = undefined;
        if (documentFile) {
          documentDataUri = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(documentFile);
          });
        }

        const fullPrompt = `Create a ${diagramTypes.find(d => d.value === diagramType)?.label || 'diagram'} for: ${promptText}. If a document is uploaded, base the diagram primarily on the document's content, using the text prompt for additional instructions.`;

        const input: DiagramGenerationInput = {
          prompt: fullPrompt,
          documentDataUri,
        };
        const result = await generateDiagram(input);
        setDiagramCode(result.diagramCode);
        await debouncedRenderDiagram(result.diagramCode);
        toast({
          title: 'Diagram Generated!',
          description: 'Your diagram has been successfully created.',
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

  const handleOpenDiagramModal = () => {
    if (diagramCode) {
      setIsDiagramModalOpen(true);
    } else {
      toast({
        variant: 'destructive',
        title: 'No Diagram',
        description: 'There is no diagram to view in fullscreen.',
      });
    }
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


  if (authLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentUser) return null;

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <AppHeader />
      <main className="flex-grow flex flex-col p-2 gap-2 overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start gap-2 flex-shrink-0">
            <div className="flex flex-col gap-2 w-full lg:flex-grow-[2] lg:basis-0">
              <PromptForm 
                onSubmit={handlePromptSubmit} 
                isLoading={isPending}
                documentFile={documentFile}
                setDocumentFile={setDocumentFile}
              />
            </div>

             <div className="w-full lg:flex-grow-[1] lg:basis-0 flex flex-col gap-2 lg:sticky lg:top-[calc(var(--header-height,64px)+0.5rem)]">
                <Card className="shadow-md">
                    <CardHeader className="py-3 px-4 border-b">
                    <UiCardTitle className="text-lg flex items-center text-primary">
                        <Network className="mr-2 h-5 w-5" />
                        Diagram Type
                    </UiCardTitle>
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
                <ExportControls
                    onExportSVG={handleExportSVG}
                    onExportPNG={handleExportPNG}
                    onExportJSON={handleExportJSON}
                    canExport={!!diagramCode}
                />
            </div>
          </div>

        <ResizablePanelGroup
          direction="horizontal"
          className="flex-1 min-h-0 rounded-lg border" 
        >
          <ResizablePanel defaultSize={50} minSize={30}> 
            <DiagramView
              diagramCode={diagramCode}
              isLoading={isPending}
              onViewFullScreen={handleOpenDiagramModal}
              className="h-full"
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50} minSize={20}>
             <CodeView diagramCode={diagramCode} onCodeChange={handleCodeChange} isLoading={isPending} className="h-full"/>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>

      <Dialog open={isDiagramModalOpen} onOpenChange={setIsDiagramModalOpen}>
        <DialogContent className="p-0 m-0 w-[calc(100vw-2rem)] h-[calc(100vh-2rem)] max-w-none max-h-none rounded-lg flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm">
          <DialogTitle className="sr-only">Fullscreen Diagram View</DialogTitle>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 left-3 z-50 text-foreground hover:bg-muted/50"
              aria-label="Close fullscreen diagram"
            >
              <XIcon className="h-6 w-6" />
            </Button>
          </DialogClose>
          <div className="w-full h-full p-8 overflow-auto flex items-center justify-center">
            {isPending && isDiagramModalOpen && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/80 backdrop-blur-sm z-10">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="mt-3 text-lg text-foreground">Loading Diagram...</p>
                </div>
            )}
            <div id="mermaid-modal-diagram-container" className="min-w-full min-h-full flex items-center justify-center">
              {/* Diagram will be rendered here by useEffect */}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: NodeJS.Timeout | undefined;
  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise(resolve => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
}

export default DiagramPage;
