import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
  import { Badge } from '@/components/ui/badge';
  import { Button } from '@/components/ui/button';
  
  const verificationQueue = [
    { id: 'LEAD-003', name: 'Peter Jones', service: 'Insurance', status: 'KYC Pending' },
    { id: 'LEAD-004', name: 'Mary Williams', service: 'Loan', status: 'Documents Needed' },
  ];
  
  export default function VerificationPage() {
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
                    <TableCell>{item.service}</TableCell>
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
          </CardContent>
        </Card>
      </div>
    );
  }
  