
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
  const diagramContainerRef = useRef<HTMLDivElement>(null);
  const prevCodeRef = useRef<string | undefined>();
  const prevIsLoadingRef = useRef<boolean | undefined>();

  useEffect(() => {
    const containerElement = diagramContainerRef.current;

    if (!isLoading) {
      if (diagramCode && containerElement) {
        if (diagramCode !== prevCodeRef.current || (prevIsLoadingRef.current === true && !isLoading)) {
          renderMermaidDiagram(diagramContainerId, diagramCode);
        }
      } else if (!diagramCode && containerElement) {
        renderMermaidDiagram(diagramContainerId, "");
      }
    }

    prevCodeRef.current = diagramCode;
    prevIsLoadingRef.current = isLoading;

  }, [diagramCode, isLoading]);

  return (
    <div className={`relative flex-grow bg-card p-2 md:p-3 rounded-lg shadow-lg ${className}`}> {/* Removed overflow-auto, reduced padding */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/80 backdrop-blur-sm z-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-3 text-lg text-foreground">Generating Diagram...</p>
        </div>
      )}

      {!isLoading && !diagramCode && (
        <div className="min-h-[300px] w-full flex items-center justify-center text-center flex-col text-muted-foreground">
          <ImageIcon className="w-24 h-24 mb-4" />
          <p className="text-lg">Your diagram will appear here.</p>
          <p className="text-sm">Use the prompt or code editor to get started.</p>
        </div>
      )}

      {!isLoading && diagramCode && (
        <div
          ref={diagramContainerRef}
          id={diagramContainerId}
          className="min-h-[300px] w-full flex items-center justify-center" // Mermaid will control height of its SVG
        />
      )}
    </div>
  );
};

export default DiagramView;
