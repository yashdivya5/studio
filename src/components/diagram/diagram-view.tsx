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
  // This ref is attached to the div that should contain the Mermaid diagram.
  // It will be null if React hasn't rendered that div (e.g., when diagramCode is empty).
  const diagramContainerRef = useRef<HTMLDivElement>(null);
  const prevCodeRef = useRef<string | undefined>();
  const prevIsLoadingRef = useRef<boolean | undefined>();

  useEffect(() => {
    const containerElement = diagramContainerRef.current;

    if (!isLoading) {
      if (diagramCode && containerElement) {
        // Condition to (re)render: code changed, or loading finished with code present.
        if (diagramCode !== prevCodeRef.current || (prevIsLoadingRef.current === true && !isLoading)) {
          renderMermaidDiagram(diagramContainerId, diagramCode);
        }
      } else if (!diagramCode && containerElement) {
        // This case handles when diagramCode becomes empty after being non-empty,
        // and React, for some reason, hasn't removed the containerElement from the DOM
        // (which it should, based on the conditional rendering below).
        // Clear the diagram content.
        renderMermaidDiagram(diagramContainerId, "");
      }
      // If !diagramCode AND !containerElement:
      // React shows the placeholder. The effect does nothing related to Mermaid rendering, which is correct.
    }

    // Update previous values for the next render's comparison.
    prevCodeRef.current = diagramCode;
    prevIsLoadingRef.current = isLoading;

  }, [diagramCode, isLoading]); // diagramContainerId is stable

  return (
    <div className={`relative flex-grow bg-card p-4 md:p-6 rounded-lg shadow-lg overflow-auto ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/80 backdrop-blur-sm z-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-3 text-lg text-foreground">Generating Diagram...</p>
        </div>
      )}

      {/* Placeholder: Shown by React when not loading and no diagram code */}
      {!isLoading && !diagramCode && (
        <div className="min-h-[300px] w-full flex items-center justify-center text-center flex-col text-muted-foreground">
          <ImageIcon className="w-24 h-24 mb-4" />
          <p className="text-lg">Your diagram will appear here.</p>
          <p className="text-sm">Use the prompt or code editor to get started.</p>
        </div>
      )}

      {/* Mermaid Container: Shown by React when not loading and diagram code exists. */}
      {/* This is the div that renderMermaidDiagram will target. */}
      {!isLoading && diagramCode && (
        <div
          ref={diagramContainerRef}
          id={diagramContainerId}
          className="min-h-[300px] w-full flex items-center justify-center"
        />
      )}
    </div>
  );
};

export default DiagramView;
