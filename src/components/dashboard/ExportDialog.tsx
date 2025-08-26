"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Download, FileText, File, Loader2 } from 'lucide-react';
import { ExportOptions } from '@/types';

interface ExportDialogProps {
  onExport: (options: ExportOptions) => Promise<void>;
  className?: string;
}

export function ExportDialog({ onExport, className }: ExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'csv'>('pdf');
  const [selectedSections, setSelectedSections] = useState<Array<'overview' | 'interns' | 'projects' | 'housing'>>(['overview']);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const options: ExportOptions = {
        format: selectedFormat,
        includeCharts: selectedFormat === 'pdf',
        sections: selectedSections,
        dateRange: {
          start: new Date(2024, 0, 1),
          end: new Date(2024, 11, 31),
        },
      };
      await onExport(options);
      setIsOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const toggleSection = (section: 'overview' | 'interns' | 'projects' | 'housing') => {
    setSelectedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Analytics Report</DialogTitle>
          <DialogDescription>
            Choose the format and sections to include in your report.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Export Format</label>
            <div className="flex gap-2">
              <Button
                variant={selectedFormat === 'pdf' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFormat('pdf')}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                PDF Report
              </Button>
              <Button
                variant={selectedFormat === 'csv' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFormat('csv')}
                className="flex items-center gap-2"
              >
                <File className="h-4 w-4" />
                CSV Data
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedFormat === 'pdf' 
                ? 'Includes charts and formatted layout for presentations'
                : 'Raw data for analysis in Excel or other tools'
              }
            </p>
          </div>

          {/* Section Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Include Sections</label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { key: 'overview', label: 'Overview' },
                { key: 'interns', label: 'Intern Data' },
                { key: 'projects', label: 'Projects' },
                { key: 'housing', label: 'Housing' },
              ] as const).map(section => (
                <Badge
                  key={section.key}
                  variant={selectedSections.includes(section.key) ? 'default' : 'outline'}
                  className="cursor-pointer justify-center p-2"
                  onClick={() => toggleSection(section.key)}
                >
                  {section.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Export Actions */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={isExporting || selectedSections.length === 0}>
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export {selectedFormat.toUpperCase()}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
