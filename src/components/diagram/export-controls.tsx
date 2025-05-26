// src/components/diagram/export-controls.tsx
"use client";

import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileImage, FileJson, Expand, Minimize } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ExportControlsProps {
  onExportSVG: () => void;
  onExportPNG: () => void;
  onExportJSON: () => void;
  onToggleFullScreen: () => void;
  isFullScreen: boolean;
  canExport: boolean;
}

const ExportControls: FC<ExportControlsProps> = ({ 
  onExportSVG, 
  onExportPNG, 
  onExportJSON,
  onToggleFullScreen,
  isFullScreen,
  canExport
}) => {
  return (
    <div className="flex items-center space-x-2 p-2 bg-card rounded-lg shadow-md">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={!canExport} className="border-accent text-accent hover:bg-accent/10 hover:text-accent">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onExportSVG} disabled={!canExport}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><path d="m22 18-6 6M2 6l6-6"/><path d="M6 18v-5a3 3 0 0 1 3-3h5"/><path d="M18 6v5a3 3 0 0 1-3 3h- conformidad"/><circle cx="12" cy="12" r="3"/><path d="M10 10v4M14 10v4"/></svg> {/* Custom SVG icon */}
            Export as SVG
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onExportPNG} disabled={!canExport}>
            <FileImage className="mr-2 h-4 w-4" />
            Export as PNG
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onExportJSON} disabled={!canExport}>
            <FileJson className="mr-2 h-4 w-4" />
            Export as JSON (Code)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant="outline" onClick={onToggleFullScreen} className="border-primary text-primary hover:bg-primary/10 hover:text-primary">
        {isFullScreen ? <Minimize className="mr-2 h-4 w-4" /> : <Expand className="mr-2 h-4 w-4" />}
        {isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
      </Button>
    </div>
  );
};

export default ExportControls;
