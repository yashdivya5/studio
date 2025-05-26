// src/components/diagram/diagram-view.tsx
"use client";

import type { FC } from 'react';
import React, { useEffect, useRef } from 'react';
import { renderMermaidDiagram } from '@/lib/mermaid-utils';
import { Loader2, Image as ImageIcon } from 'lucide-react';

interface DiagramViewProps {
  diagramCode: string;
  isLoading: boolean;
  className?: string;
}

const DiagramView: FC<DiagramViewProps> = ({ diagramCode, isLoading, className = "" }) => {
  const diagramContainerId = 'mermaid-diagram-container';
  const prevCodeRef = useRef<string>();

  useEffect(() => {
    // Only re-render if code actually changes or loading state finishes
    if (diagramCode !== prevCodeRef.current || (prevCodeRef.current && isLoading === false)) {
       if(!isLoading) { // Don't render if currently loading new diagram
        renderMermaidDiagram(diagramContainerId, diagramCode);
        prevCodeRef.current = diagramCode;
       }
    }
  }, [diagramCode, isLoading]);

  return (
    <div className={`relative flex-grow bg-card p-4 md:p-6 rounded-lg shadow-lg overflow-auto ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/80 backdrop-blur-sm z-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-3 text-lg text-foreground">Generating Diagram...</p>
        </div>
      )}
      <div 
        id={diagramContainerId} 
        className="min-h-[300px] w-full flex items-center justify-center"
        // Apply Tailwind prose for better default styling of text within SVG if any
        // className="prose prose-sm dark:prose-invert max-w-none" 
      >
        {!diagramCode && !isLoading && (
           <div className="flex flex-col items-center text-muted-foreground">
            <ImageIcon className="w-24 h-24 mb-4" />
            <p className="text-lg">Your diagram will appear here.</p>
            <p className="text-sm">Use the prompt or code editor to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagramView;
