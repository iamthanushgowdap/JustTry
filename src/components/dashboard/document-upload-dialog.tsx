'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Lead, Document } from '@/lib/definitions';
import { Upload, File, X } from 'lucide-react';

interface DocumentUploadDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  lead: Lead;
  onUpload: (leadId: string, documents: Document[]) => void;
}

export function DocumentUploadDialog({
  isOpen,
  setIsOpen,
  lead,
  onUpload,
}: DocumentUploadDialogProps) {
  const { toast } = useToast();
  const [files, setFiles] = React.useState<File[]>([]);
  const [existingDocuments, setExistingDocuments] = React.useState<Document[]>(lead.documents || []);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles((prev) => [...prev, ...Array.from(event.target.files!)]);
    }
  };

  const handleUpload = () => {
    // This is a simulation. In a real app, you'd upload to a server/storage.
    const newDocuments: Document[] = files.map((file) => ({
      name: file.name,
      url: `simulated-path/${lead.id}/${file.name}`,
    }));

    const allDocuments = [...existingDocuments, ...newDocuments];
    onUpload(lead.id, allDocuments);

    toast({
      title: 'Upload Successful',
      description: `${files.length} document(s) have been uploaded for ${lead.name}.`,
    });

    setFiles([]);
    setIsOpen(false);
  };
  
  const removeNewFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingFile = (index: number) => {
    const updatedDocuments = existingDocuments.filter((_, i) => i !== index);
    setExistingDocuments(updatedDocuments);
    onUpload(lead.id, updatedDocuments); // Update immediately
    toast({
        title: "Document Removed",
        description: "The document has been removed."
    })
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Documents for {lead.name}</DialogTitle>
          <DialogDescription>
            Upload the required documents to proceed with the KYC process.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div>
                <Label htmlFor="file-upload" className="sr-only">Choose files</Label>
                <Input id="file-upload" type="file" multiple onChange={handleFileChange} ref={fileInputRef} className="hidden"/>
                <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Choose Files
                </Button>
            </div>
            
            {(existingDocuments.length > 0 || files.length > 0) && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium">Files</h4>
                    <div className="space-y-2 rounded-md border p-2">
                        {existingDocuments.map((doc, index) => (
                            <div key={`existing-${index}`} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <File className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{doc.name}</span>
                                </div>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeExistingFile(index)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        {files.map((file, index) => (
                            <div key={`new-${index}`} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <File className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{file.name}</span>
                                </div>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeNewFile(index)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
        <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handleUpload} disabled={files.length === 0}>
                Upload {files.length > 0 && `(${files.length})`}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
