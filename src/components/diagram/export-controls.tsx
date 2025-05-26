// src/components/diagram/export-controls.tsx
"use client";

import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileImage, FileJson, Expand, Minimize, CodeXml } from 'lucide-react'; // Added CodeXml
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent } from '@/components/ui/card'; // Added Card for better grouping

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
    <Card className="shadow-md">
      <CardContent className="p-3 flex flex-col sm:flex-row items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={!canExport} className="w-full sm:w-auto border-accent text-accent hover:bg-accent/10 hover:text-accent flex-grow">
              <Download className="mr-2 h-4 w-4" /> Export Diagram
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[220px]">
            <DropdownMenuItem onClick={onExportSVG} disabled={!canExport}>
              <CodeXml className="mr-2 h-4 w-4" /> {/* Replaced custom SVG with Lucide icon */}
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
        <Button variant="outline" onClick={onToggleFullScreen} className="w-full sm:w-auto border-primary text-primary hover:bg-primary/10 hover:text-primary flex-grow">
          {isFullScreen ? <Minimize className="mr-2 h-4 w-4" /> : <Expand className="mr-2 h-4 w-4" />}
          {isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ExportControls;
