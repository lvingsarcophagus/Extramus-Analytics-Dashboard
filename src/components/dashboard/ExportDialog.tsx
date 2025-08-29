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
import { Download, FileText, File, Loader2, Sheet } from 'lucide-react';
import { ExportOptions } from '@/types';

interface ExportDialogProps {
  onExport: (options: ExportOptions) => Promise<void>;
  className?: string;
}

export function ExportDialog({ onExport, className }: ExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'csv' | 'googleSheets'>('pdf');
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
        <Button variant="outline" className={`hover:bg-blue-50 hover:border-blue-200 ${className}`}>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-white border-2 border-gray-200 shadow-2xl">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Analytics Report
          </DialogTitle>
          <DialogDescription>
            Choose the format and sections to include in your report.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 bg-white">
          {/* Quick Export Options */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Quick Export</label>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  setIsExporting(true);
                  try {
                    const options: ExportOptions = {
                      format: 'googleSheets',
                      includeCharts: false,
                      sections: ['interns'],
                      dateRange: {
                        start: new Date(2024, 0, 1),
                        end: new Date(2024, 11, 31),
                      },
                    };
                    await onExport(options);
                    setIsOpen(false);
                  } catch (error) {
                    console.error('Quick export failed:', error);
                  } finally {
                    setIsExporting(false);
                  }
                }}
                disabled={isExporting}
                className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-200 bg-white"
              >
                <Sheet className="h-4 w-4" />
                Export Interns to Sheets
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Quickly export intern data to Google Sheets for collaboration
            </p>
          </div>

          {/* Format Selection */}
          <div className="space-y-3 bg-white">
            <label className="text-sm font-medium">Export Format</label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={selectedFormat === 'pdf' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFormat('pdf')}
                className="flex items-center gap-2 justify-center bg-white hover:bg-gray-50"
              >
                <FileText className="h-4 w-4" />
                PDF Report
              </Button>
              <Button
                variant={selectedFormat === 'csv' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFormat('csv')}
                className="flex items-center gap-2 justify-center bg-white hover:bg-gray-50"
              >
                <File className="h-4 w-4" />
                CSV Data
              </Button>
              <Button
                variant={selectedFormat === 'googleSheets' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFormat('googleSheets')}
                className="flex items-center gap-2 justify-center bg-white hover:bg-gray-50"
              >
                <Sheet className="h-4 w-4" />
                Google Sheets
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedFormat === 'pdf' 
                ? 'Includes charts and formatted layout for presentations'
                : selectedFormat === 'csv'
                ? 'Raw data for analysis in Excel or other tools'
                : 'Export data directly to Google Sheets for collaboration'
              }
            </p>
          </div>

          {/* Section Selection */}
          <div className="space-y-3 bg-white">
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
                  className={`cursor-pointer justify-center p-3 text-sm font-medium transition-all hover:scale-105 bg-white ${
                    selectedSections.includes(section.key) 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => toggleSection(section.key)}
                >
                  {section.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Export Actions */}
          <div className="flex justify-between pt-6 border-t bg-white">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="px-6 bg-white hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleExport} 
              disabled={isExporting || selectedSections.length === 0}
              className="px-6 bg-blue-600 hover:bg-blue-700"
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export {selectedFormat === 'pdf' ? 'PDF' : selectedFormat === 'csv' ? 'CSV' : 'to Google Sheets'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
