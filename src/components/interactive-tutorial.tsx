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
import { Badge } from '@/components/ui/badge';
import { AppLogo } from '@/components/icons';
import {
  Sparkles,
  Shield,
  User,
  Briefcase,
  Layers,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  FileCheck2,
  CalendarCheck,
  RotateCcw,
  Zap,
  ArrowRight,
  Database,
} from 'lucide-react';
import { login } from '@/lib/actions';

interface InteractiveTutorialProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectRole?: (role: 'sales' | 'back-office' | 'admin') => void;
}

const tutorialSteps = [
  {
    step: 1,
    title: 'Welcome to JustTry FinTech CRM',
    tag: 'Architecture & Overview',
    icon: Sparkles,
    color: 'text-primary',
    bg: 'bg-primary/10',
    description:
      'A multi-tier financial advisory and credit underwriting CRM designed for modern banking, wealth management, and insurance distribution.',
    highlights: [
      {
        icon: Database,
        title: '100% Offline Resilience',
        desc: 'Runs entirely in your browser using self-contained LocalStorage. Zero external API keys, Supabase, or Firebase required.',
      },
      {
        icon: Zap,
        title: 'Instant Production Speed',
        desc: 'Zero network latency for lead updates, pipeline transitions, and document approvals.',
      },
      {
        icon: RotateCcw,
        title: 'One-Click Demo Reset',
        desc: 'Restore a clean 4-client benchmark dataset anytime from Settings or Dashboard during hackathon presentations.',
      },
    ],
  },
  {
    step: 2,
    title: 'Multi-Role Workspaces (RBAC)',
    tag: 'Persona Switching',
    icon: Shield,
    color: 'text-indigo-500',
    bg: 'bg-indigo-500/10',
    description:
      'JustTry adapts its navigation, data views, and action privileges based on the logged-in team persona.',
    highlights: [
      {
        icon: User,
        title: 'Sales & Advisory (Alex Sales)',
        desc: 'Originate retail loans, mutual fund SIPs, health insurance proposals, customer follow-up calls, and AI checklists.',
      },
      {
        icon: Briefcase,
        title: 'Back Office & KYC (Betty Office)',
        desc: 'Audit uploaded customer proofs (Salary slips, Tax IDs, Balance sheets), approve/reject documents, and underwrite files.',
      },
      {
        icon: Shield,
        title: 'Executive Admin (Charlie Admin)',
        desc: 'Analyze closed deal volume ($1.78M), conversion funnels, quota attainment leaderboards, and user permissions.',
      },
    ],
  },
  {
    step: 3,
    title: 'Tailored Financial Pipelines',
    tag: 'Workflow Steppers',
    icon: Layers,
    color: 'text-sky-500',
    bg: 'bg-sky-500/10',
    description:
      'Each financial product follows regulatory compliance milestones with interactive visual progress tracking.',
    highlights: [
      {
        icon: CheckCircle2,
        title: 'Loan Pipeline',
        desc: 'New → KYC Verification → Documents Needed → Eligibility Check → Underwriting → Approved → Disbursed.',
      },
      {
        icon: CheckCircle2,
        title: 'Investment Pipeline',
        desc: 'New → Risk Profiling → KYC Verification → Portfolio Creation → Activated.',
      },
      {
        icon: CheckCircle2,
        title: 'Insurance Pipeline',
        desc: 'New → Medical Check → Document Verification → Underwriting → Policy Issued.',
      },
    ],
  },
  {
    step: 4,
    title: 'KYC Verification & Smart Checklist',
    tag: 'Core Operations',
    icon: FileCheck2,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    description:
      'Empower back-office officers and advisors to collaborate seamlessly without paper delays.',
    highlights: [
      {
        icon: FileCheck2,
        title: 'Document Compliance Queue',
        desc: 'Inspect customer documents with 1-click "Approve" (stamps verified with officer name) or "Reject" with audit logs.',
      },
      {
        icon: Sparkles,
        title: 'Stage-Aware Task Assistant',
        desc: 'Automatically recommends next action items based on current stage and missing compliance files.',
      },
      {
        icon: CalendarCheck,
        title: 'Client Communication & Follow-ups',
        desc: 'Schedule calls, video meets, and emails with direct one-click dialer and mail triggers.',
      },
    ],
  },
  {
    step: 5,
    title: 'You are Ready to Explore!',
    tag: 'Quick Launch',
    icon: CheckCircle2,
    color: 'text-emerald-600',
    bg: 'bg-emerald-600/10',
    description:
      'Choose a role below to jump directly into the live workspace with clean benchmark data ready.',
    highlights: [
      {
        icon: User,
        title: 'Explore as Sales Advisor',
        desc: 'Recommended for inspecting lead capture, pipeline stepper, and follow-up scheduling.',
      },
      {
        icon: Briefcase,
        title: 'Explore as KYC Officer',
        desc: 'Recommended for testing document verification and compliance queues.',
      },
      {
        icon: Shield,
        title: 'Explore as Executive Admin',
        desc: 'Recommended for reviewing revenue analytics and advisor win-rate leaderboards.',
      },
    ],
  },
];

export function InteractiveTutorial({
  isOpen,
  onOpenChange,
  onSelectRole,
}: InteractiveTutorialProps) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [loadingRole, setLoadingRole] = React.useState<string | null>(null);

  const stepData = tutorialSteps[currentStep];
  const IconComponent = stepData.icon;

  const handleRoleClick = (role: 'sales' | 'back-office' | 'admin') => {
    if (onSelectRole) {
      onSelectRole(role);
      onOpenChange(false);
      return;
    }
    setLoadingRole(role);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('justtry_active_role', role);
      }
      login(role).catch(() => {});
    } catch {
      // ignore
    }
    window.location.href = '/dashboard';
  };

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleRoleClick('sales');
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-primary/20 shadow-2xl">
        {/* Header Ribbon */}
        <div className="p-5 border-b bg-gradient-to-r from-card via-muted/30 to-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${stepData.bg} ${stepData.color}`}>
              <IconComponent className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider text-primary border-primary/30">
                  {stepData.tag}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Step {stepData.step} of {tutorialSteps.length}
                </span>
              </div>
              <DialogTitle className="text-lg font-bold mt-0.5">
                {stepData.title}
              </DialogTitle>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4">
          <DialogDescription className="text-sm text-foreground/90 leading-relaxed">
            {stepData.description}
          </DialogDescription>

          <div className="space-y-2.5 pt-1">
            {stepData.highlights.map((item, idx) => {
              const ItemIcon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-background border shadow-2xs mt-0.5 shrink-0 text-primary">
                    <ItemIcon className="h-4 w-4" />
                  </div>
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-semibold text-foreground">
                      {item.title}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Role Selection on Step 5 */}
          {currentStep === 4 && (
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-auto py-2.5 flex flex-col items-center gap-1 border-sky-400/40 hover:bg-sky-500/10 text-xs"
                onClick={() => handleRoleClick('sales')}
                disabled={loadingRole !== null}
              >
                <User className="h-4 w-4 text-sky-500" />
                <span className="font-bold">Sales Advisor</span>
                <span className="text-[10px] text-muted-foreground">Leads & SIPs</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-auto py-2.5 flex flex-col items-center gap-1 border-purple-400/40 hover:bg-purple-500/10 text-xs"
                onClick={() => handleRoleClick('back-office')}
                disabled={loadingRole !== null}
              >
                <Briefcase className="h-4 w-4 text-purple-500" />
                <span className="font-bold">KYC Operations</span>
                <span className="text-[10px] text-muted-foreground">Proof Audits</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-auto py-2.5 flex flex-col items-center gap-1 border-emerald-400/40 hover:bg-emerald-500/10 text-xs"
                onClick={() => handleRoleClick('admin')}
                disabled={loadingRole !== null}
              >
                <Shield className="h-4 w-4 text-emerald-500" />
                <span className="font-bold">Executive Admin</span>
                <span className="text-[10px] text-muted-foreground">Analytics Suite</span>
              </Button>
            </div>
          )}
        </div>

        {/* Stepper Dots & Navigation Footer */}
        <DialogFooter className="p-4 border-t bg-muted/20 flex flex-row items-center justify-between sm:justify-between w-full">
          {/* Indicator dots */}
          <div className="flex items-center gap-1.5">
            {tutorialSteps.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentStep(i)}
                className={`h-2 rounded-full transition-all ${
                  i === currentStep
                    ? 'w-6 bg-primary'
                    : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                title={`Go to step ${i + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePrev}
                className="text-xs"
              >
                <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                Back
              </Button>
            )}

            <Button
              type="button"
              size="sm"
              onClick={handleNext}
              className="text-xs"
              disabled={loadingRole !== null}
            >
              {currentStep === tutorialSteps.length - 1 ? (
                <>
                  Enter Workspace
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  Next Step
                  <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
