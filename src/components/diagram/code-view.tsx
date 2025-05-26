// src/components/diagram/code-view.tsx
"use client";

import type { FC } from 'react';
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileCode2 } from 'lucide-react';

interface CodeViewProps {
  diagramCode: string;
  onCodeChange: (newCode: string) => void;
  isLoading: boolean;
  className?: string;
}

const CodeView: FC<CodeViewProps> = ({ diagramCode, onCodeChange, isLoading, className = "" }) => {
  return (
    <Card className={`flex flex-col shadow-lg ${className}`}>
      <CardHeader className="py-3 px-4 border-b">
        <CardTitle className="text-lg flex items-center text-primary">
          <FileCode2 className="mr-2 h-5 w-5" />
          Diagram Code (Mermaid)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-grow flex">
        <Textarea
          value={diagramCode}
          onChange={(e) => onCodeChange(e.target.value)}
          placeholder="graph TD; A-->B;"
          className="h-full w-full resize-none border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 font-mono text-sm bg-background"
          disabled={isLoading}
          aria-label="Diagram Code Editor"
        />
      </CardContent>
    </Card>
  );
};

export default CodeView;
