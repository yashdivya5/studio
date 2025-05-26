// src/components/diagram/export-controls.tsx
"use client";

import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileImage, FileJson, CodeXml } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent } from '@/components/ui/card';

interface ExportControlsProps {
  onExportSVG: () => void;
  onExportPNG: () => void;
  onExportJSON: () => void;
  canExport: boolean;
}

const ExportControls: FC<ExportControlsProps> = ({ 
  onExportSVG, 
  onExportPNG, 
  onExportJSON,
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
              <CodeXml className="mr-2 h-4 w-4" />
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
      </CardContent>
    </Card>
  );
};

export default ExportControls;