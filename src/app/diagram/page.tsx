
// src/app/diagram/page.tsx
"use client";

import type { NextPage } from 'next';
import React, { useState, useEffect, useCallback, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import AppHeader from '@/components/layout/app-header';
import DiagramView from '@/components/diagram/diagram-view';
import CodeView from '@/components/diagram/code-view';
import ChatInput from '@/components/diagram/prompt-form'; // Renamed to ChatInput conceptually
import ExportControls from '@/components/diagram/export-controls';
import { generateDiagram } from '@/ai/flows/diagram-generation';
import type { DiagramGenerationInput } from '@/ai/flows/diagram-generation';
import { useToast } from '@/hooks/use-toast';
import { renderMermaidDiagram, exportSVG, exportPNG, exportJSON } from '@/lib/mermaid-utils';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Dialog, DialogContent, DialogClose, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Network, XIcon, Bot, User } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import FigmaticLogo from '@/components/logo';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

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
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! Describe the diagram you'd like to create, or ask me to modify the current one." }
  ]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

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
      if (svg && containerId === 'mermaid-diagram-container') {
        setCurrentSvgContent(svg);
      }
      return svg;
    }, 300),
    []
  );

  useEffect(() => {
    if (isDiagramModalOpen && diagramCode) {
      startTransition(async () => {
        await new Promise(resolve => setTimeout(resolve, 0)); 
        await debouncedRenderDiagram(diagramCode, 'mermaid-modal-diagram-container');
      });
    }
  }, [isDiagramModalOpen, diagramCode, debouncedRenderDiagram]);

  useEffect(() => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);


  const handleCodeChange = (newCode: string) => {
    setDiagramCode(newCode);
    startTransition(async () => {
      await debouncedRenderDiagram(newCode);
    });
  };

  const handleSendMessage = async (promptText: string) => {
    setMessages(prev => [...prev, { role: 'user', content: promptText }]);
    
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
          setDocumentFile(null); // Reset after sending
        }

        const input: DiagramGenerationInput = {
          prompt: `Using the diagram type '${diagramTypes.find(d => d.value === diagramType)?.label || 'flowchart'}', apply the following instruction: ${promptText}`,
          previousDiagramCode: diagramCode || undefined,
          documentDataUri,
        };
        const result = await generateDiagram(input);
        setDiagramCode(result.diagramCode);
        await debouncedRenderDiagram(result.diagramCode);
        toast({
          title: 'Diagram Updated!',
          description: 'Your diagram has been successfully updated.',
        });
      } catch (error) {
        console.error('Error generating diagram:', error);
        toast({
          variant: 'destructive',
          title: 'Error Generating Diagram',
          description: (error as Error).message || 'An unexpected error occurred.',
        });
        setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I ran into an error. Please try refining your instruction." }]);
      }
    });
  };

  const handleOpenDiagramModal = () => {
    if (diagramCode) setIsDiagramModalOpen(true);
  };
  const handleExportSVG = () => currentSvgContent && exportSVG(currentSvgContent);
  const handleExportPNG = () => currentSvgContent && exportPNG(currentSvgContent);
  const handleExportJSON = () => diagramCode && exportJSON(diagramCode);

  if (authLoading || !currentUser) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <AppHeader />
      <main className="flex-grow p-2 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full rounded-lg border">
          <ResizablePanel defaultSize={35} minSize={25} className="flex flex-col p-2 gap-2">
                <Card className="flex-grow flex flex-col min-h-0 shadow-md">
                    <CardHeader className="py-3 px-4 border-b">
                        <CardTitle className="text-lg flex items-center text-primary">
                            <Bot className="mr-2 h-5 w-5" />
                            Conversation
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow p-0 overflow-hidden">
                        <ScrollArea className="h-full p-4" ref={chatContainerRef}>
                            <div className="flex flex-col gap-4">
                                {messages.map((message, index) => (
                                    <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                                        {message.role === 'assistant' && (
                                            <Avatar className="h-8 w-8 border-2 border-primary">
                                              <div className="bg-primary/20 h-full w-full flex items-center justify-center">
                                                <Bot className="h-5 w-5 text-primary"/>
                                              </div>
                                            </Avatar>
                                        )}
                                        <div className={`rounded-lg px-3 py-2 max-w-[85%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                        </div>
                                        {message.role === 'user' && (
                                            <Avatar className="h-8 w-8 border-2 border-accent">
                                                 <AvatarImage src={currentUser.photoURL || undefined} alt={currentUser.displayName || "User"} />
                                                <AvatarFallback className="bg-accent text-accent-foreground">
                                                    <User className="h-5 w-5"/>
                                                </AvatarFallback>
                                            </Avatar>
                                        )}
                                    </div>
                                ))}
                                {isPending && (
                                    <div className="flex items-start gap-3">
                                        <Avatar className="h-8 w-8 border-2 border-primary">
                                            <div className="bg-primary/20 h-full w-full flex items-center justify-center">
                                                <Bot className="h-5 w-5 text-primary"/>
                                            </div>
                                        </Avatar>
                                        <div className="rounded-lg px-3 py-2 bg-muted flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin"/>
                                            <p className="text-sm">Thinking...</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                    <div className="p-2 border-t">
                       <ChatInput onSubmit={handleSendMessage} isLoading={isPending} documentFile={documentFile} setDocumentFile={setDocumentFile} />
                    </div>
                </Card>
                <Card className="shadow-md flex-shrink-0">
                    <CardHeader className="py-3 px-4 border-b">
                        <CardTitle className="text-lg flex items-center text-primary">
                            <Network className="mr-2 h-5 w-5" />
                            Diagram Controls
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                        <Select value={diagramType} onValueChange={setDiagramType}>
                            <SelectTrigger id="diagram-type-select" className="w-full bg-input focus-visible:ring-accent">
                                <SelectValue placeholder="Select diagram type..." />
                            </SelectTrigger>
                            <SelectContent>
                                {diagramTypes.map((type) => ( <SelectItem key={type.value} value={type.value}> {type.label} </SelectItem> ))}
                            </SelectContent>
                        </Select>
                         <ExportControls onExportSVG={handleExportSVG} onExportPNG={handleExportPNG} onExportJSON={handleExportJSON} canExport={!!diagramCode} />
                    </CardContent>
                </Card>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={65} minSize={30}>
            <ResizablePanelGroup direction="vertical" className="h-full">
              <ResizablePanel defaultSize={65} minSize={20}>
                <DiagramView diagramCode={diagramCode} isLoading={isPending} onViewFullScreen={handleOpenDiagramModal} className="h-full" />
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={35} minSize={15}>
                <CodeView diagramCode={diagramCode} onCodeChange={handleCodeChange} isLoading={isPending} className="h-full" />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

        </ResizablePanelGroup>
      </main>

      <Dialog open={isDiagramModalOpen} onOpenChange={setIsDiagramModalOpen}>
        <DialogContent className="p-0 m-0 w-[calc(100vw-2rem)] h-[calc(100vh-2rem)] max-w-none max-h-none rounded-lg flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm">
          <DialogTitle className="sr-only">Fullscreen Diagram View</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="absolute top-3 left-3 z-50 text-foreground hover:bg-muted/50" aria-label="Close fullscreen diagram">
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
            <div id="mermaid-modal-diagram-container" className="min-w-full min-h-full flex items-center justify-center" />
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
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
}

export default DiagramPage;
