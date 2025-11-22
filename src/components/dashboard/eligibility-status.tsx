'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';
import type { Lead } from '@/lib/definitions';

interface EligibilityStatusProps {
  lead: Lead;
  onRunCheck?: () => void;
}

export function EligibilityStatus({ lead, onRunCheck }: EligibilityStatusProps) {
  // Find the latest CIBIL data from history
  const latestCibilEntry = lead.history
    ?.filter(entry => entry.cibilData)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

  const cibilData = latestCibilEntry?.cibilData;

  if (!cibilData) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center text-orange-800">
            <Clock className="mr-2 h-5 w-5" />
            Eligibility Check Pending
          </CardTitle>
          <CardDescription className="text-orange-700">
            CIBIL score check is required to proceed with loan approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          {onRunCheck && (
            <Button onClick={onRunCheck} className="w-full">
              <CheckCircle className="mr-2 h-4 w-4" />
              Run CIBIL Check
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const getEligibilityStatus = (score: number) => {
    if (score >= 750) return { status: 'Excellent', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle };
    if (score >= 650) return { status: 'Good', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: CheckCircle };
    if (score >= 550) return { status: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: AlertTriangle };
    return { status: 'Poor', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: XCircle };
  };

  const eligibility = getEligibilityStatus(cibilData.score);
  const StatusIcon = eligibility.icon;

  return (
    <Card className={`${eligibility.bg} ${eligibility.border} border-2`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center">
            <StatusIcon className={`mr-2 h-5 w-5 ${eligibility.color}`} />
            Credit Eligibility: {eligibility.status}
          </span>
          <Badge variant="outline" className={eligibility.color}>
            {cibilData.score}
          </Badge>
        </CardTitle>
        <CardDescription>
          CIBIL Score: {cibilData.score} | Risk: {cibilData.riskCategory}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Total Accounts:</span>
            <div className="font-semibold">{cibilData.totalAccounts}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Overdue:</span>
            <div className="font-semibold text-red-600">{cibilData.overdueAccounts}</div>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Last checked: {new Date(latestCibilEntry.timestamp).toLocaleDateString()}
        </div>
        {onRunCheck && (
          <Button variant="outline" size="sm" onClick={onRunCheck} className="w-full">
            <CheckCircle className="mr-2 h-4 w-4" />
            Re-run Check
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
