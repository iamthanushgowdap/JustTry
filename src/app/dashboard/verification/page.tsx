
'use client';

import * as React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
  import { Card, CardContent } from '@/components/ui/card';
  import { Badge } from '@/components/ui/badge';
  import { Button } from '@/components/ui/button';
  import { FileCheck2 } from 'lucide-react';
  import { getLeads } from '@/lib/data';
  import type { Lead } from '@/lib/definitions';
  
  export default function VerificationPage() {
    const [verificationQueue, setVerificationQueue] = React.useState<Lead[]>([]);

    React.useEffect(() => {
        const allLeads = getLeads();
        const filteredLeads = allLeads.filter(lead => lead.status !== 'New');
        setVerificationQueue(filteredLeads);
    }, []);

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Verification Queue</h1>
          <p className="text-muted-foreground">
            Leads waiting for document verification and processing.
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            {verificationQueue.length > 0 ? (
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Lead ID</TableHead>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {verificationQueue.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell>{item.id}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.serviceType}</TableCell>
                        <TableCell>
                        <Badge variant="outline">{item.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                        <Button size="sm">Process</Button>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center h-[400px]">
                    <FileCheck2 className="h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-semibold text-muted-foreground">Verification Queue is Empty</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Leads that require verification will appear here.
                    </p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }
  