'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/icons';
import { InteractiveTutorial } from '@/components/interactive-tutorial';
import { useTheme } from 'next-themes';
import {
  User,
  Briefcase,
  Shield,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Sparkles,
  Layers,
  FileCheck2,
  TrendingUp,
  CreditCard,
  PieChart,
  ShieldCheck,
  CalendarCheck,
  Database,
  Moon,
  Sun,
  ChevronRight,
  HelpCircle,
  ExternalLink,
  Lock,
} from 'lucide-react';

export default function LandingPage() {
  const [loadingRole, setLoadingRole] = React.useState<string | null>(null);
  const [isTutorialOpen, setIsTutorialOpen] = React.useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  // Safety timer to clear loading state if navigation is interrupted
  React.useEffect(() => {
    if (loadingRole) {
      const timer = setTimeout(() => {
        setLoadingRole(null);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [loadingRole]);

  const handleLogin = (role: 'sales' | 'back-office' | 'admin') => {
    setLoadingRole(role);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('justtry_active_role', role);
      }
      login(role).catch(() => {});
    } catch (e) {
      console.error(e);
    }
    // Instant client navigation without waiting for server action roundtrip
    window.location.href = '/dashboard';
  };

  const scrollToRoles = () => {
    const el = document.getElementById('workspace-roles');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Interactive Onboarding Tutorial Dialog */}
      <InteractiveTutorial
        isOpen={isTutorialOpen}
        onOpenChange={setIsTutorialOpen}
        onSelectRole={handleLogin}
      />

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-card/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <AppLogo />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight">JustTry</span>
                <Badge variant="outline" className="text-[10px] uppercase font-bold text-primary border-primary/30 py-0">
                  FinTech CRM
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground hidden sm:block">Advisory & Lending Operating System</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#verticals" className="hover:text-foreground transition-colors">Solutions</a>
            <a href="#workflow" className="hover:text-foreground transition-colors">Workflow</a>
            <a href="#workspace-roles" className="hover:text-foreground transition-colors">Workspaces</a>
          </nav>

          <div className="flex items-center gap-2">
            {/* Quick Tutorial Trigger */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTutorialOpen(true)}
              className="text-xs border-primary/30 hover:bg-primary/10 text-primary font-medium"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary" />
              Quick Tutorial
            </Button>

            {/* Dark / Light Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title="Toggle Theme"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            <Button size="sm" onClick={scrollToRoles} className="text-xs hidden sm:inline-flex">
              Launch App
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-6">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span>100% Offline • LocalStorage Engine • Zero External Keys Required</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            The Intelligent Operating System for{' '}
            <span className="bg-gradient-to-r from-primary via-indigo-500 to-sky-500 bg-clip-text text-transparent">
              FinTech Lending & Advisory
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-4 sm:mt-6 text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Originate retail loans, allocate mutual fund SIP portfolios, and underwrite insurance policies.
            Features multi-role governance, KYC document compliance, and smart pipeline actions.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" onClick={scrollToRoles} className="h-11 px-6 text-sm font-semibold shadow-md">
              Choose Workspace Role
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsTutorialOpen(true)}
              className="h-11 px-6 text-sm font-medium border-primary/30 hover:bg-primary/5"
            >
              <HelpCircle className="mr-2 h-4 w-4 text-primary" />
              Interactive Tutorial Tour
            </Button>
          </div>

          {/* Live Micro-Stats Strip */}
          <div className="mt-12 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-left">
            <div className="p-4 rounded-2xl border bg-card/80 backdrop-blur-xs shadow-xs">
              <p className="text-xs text-muted-foreground font-medium">Pipeline Volume</p>
              <p className="text-2xl font-extrabold mt-1 text-primary">$1.78M</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Active retail deals</p>
            </div>
            <div className="p-4 rounded-2xl border bg-card/80 backdrop-blur-xs shadow-xs">
              <p className="text-xs text-muted-foreground font-medium">KYC Queue Status</p>
              <p className="text-2xl font-extrabold mt-1 text-emerald-500">100% Digital</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">1-click approve/reject</p>
            </div>
            <div className="p-4 rounded-2xl border bg-card/80 backdrop-blur-xs shadow-xs">
              <p className="text-xs text-muted-foreground font-medium">Role Personas</p>
              <p className="text-2xl font-extrabold mt-1 text-sky-500">3 Workspaces</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Sales, Ops & Admin</p>
            </div>
            <div className="p-4 rounded-2xl border bg-card/80 backdrop-blur-xs shadow-xs">
              <p className="text-xs text-muted-foreground font-medium">Offline Engine</p>
              <p className="text-2xl font-extrabold mt-1 text-amber-500">0 API Keys</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Self-contained browser DB</p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Selection / Interactive Workspaces Section */}
      <section id="workspace-roles" className="py-12 sm:py-16 bg-muted/20 border-y scroll-mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <Badge variant="outline" className="text-xs uppercase font-bold tracking-wider text-primary border-primary/30 mb-2">
              Instant RBAC Access
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Select Your Team Workspace Role
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Experience the platform from three specialized perspectives. Click any role to instantly enter.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {/* Sales Advisor Role Card */}
            <Card
              onClick={() => handleLogin('sales')}
              className="flex flex-col justify-between border-sky-500/30 hover:border-sky-500 hover:shadow-xl transition-all duration-200 group bg-card cursor-pointer active:scale-[0.99]"
            >
              <CardHeader className="pb-4">
                <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 w-fit mb-3 group-hover:scale-105 transition-transform">
                  <User className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold flex items-center justify-between">
                  <span>Sales & Advisory</span>
                  <Badge variant="outline" className="text-xs font-semibold text-sky-600 border-sky-400/40">
                    Front Office
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  Persona: <span className="font-semibold text-foreground">Alex Sales</span> (Retail Lending & Wealth)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 flex-1 text-xs text-muted-foreground">
                <p className="leading-relaxed">
                  Originate loan inquiries, build customized mutual fund SIP proposals, schedule client calls, and run AI pipeline checklists.
                </p>
                <div className="space-y-1.5 pt-2 text-[11px] font-medium text-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-sky-500" />
                    <span>Create & manage active client leads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-sky-500" />
                    <span>Generate AI next-step action items</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-sky-500" />
                    <span>Phone & meeting follow-up scheduler</span>
                  </div>
                </div>
              </CardContent>
              <div className="p-4 pt-0">
                <Button
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs h-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLogin('sales');
                  }}
                >
                  {loadingRole === 'sales' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entering Sales Workspace...
                    </>
                  ) : (
                    <>
                      Enter Sales Workspace
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Back Office & KYC Role Card */}
            <Card
              onClick={() => handleLogin('back-office')}
              className="flex flex-col justify-between border-purple-500/30 hover:border-purple-500 hover:shadow-xl transition-all duration-200 group bg-card cursor-pointer active:scale-[0.99]"
            >
              <CardHeader className="pb-4">
                <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 w-fit mb-3 group-hover:scale-105 transition-transform">
                  <Briefcase className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold flex items-center justify-between">
                  <span>Back Office & KYC</span>
                  <Badge variant="outline" className="text-xs font-semibold text-purple-600 border-purple-400/40">
                    Operations
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  Persona: <span className="font-semibold text-foreground">Betty Office</span> (Risk & Compliance Lead)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 flex-1 text-xs text-muted-foreground">
                <p className="leading-relaxed">
                  Verify customer identity proofs, audit balance sheets and salary slips, approve/reject KYC files, and clear underwriting queues.
                </p>
                <div className="space-y-1.5 pt-2 text-[11px] font-medium text-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-purple-500" />
                    <span>Real-time verification queue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-purple-500" />
                    <span>1-click document approval & stamping</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-purple-500" />
                    <span>Underwriting & risk qualification</span>
                  </div>
                </div>
              </CardContent>
              <div className="p-4 pt-0">
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs h-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLogin('back-office');
                  }}
                >
                  {loadingRole === 'back-office' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entering Operations...
                    </>
                  ) : (
                    <>
                      Enter Operations Workspace
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Admin Role Card */}
            <Card
              onClick={() => handleLogin('admin')}
              className="flex flex-col justify-between border-emerald-500/30 hover:border-emerald-500 hover:shadow-xl transition-all duration-200 group bg-card cursor-pointer active:scale-[0.99]"
            >
              <CardHeader className="pb-4">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-fit mb-3 group-hover:scale-105 transition-transform">
                  <Shield className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold flex items-center justify-between">
                  <span>Executive Admin</span>
                  <Badge variant="outline" className="text-xs font-semibold text-emerald-600 border-emerald-400/40">
                    Management
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  Persona: <span className="font-semibold text-foreground">Charlie Admin</span> (Managing Director)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 flex-1 text-xs text-muted-foreground">
                <p className="leading-relaxed">
                  Full system oversight, advisor conversion leaderboards, deal volume analytics, user management, and storage controls.
                </p>
                <div className="space-y-1.5 pt-2 text-[11px] font-medium text-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Advisor quota attainment leaderboard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Portfolio charts across all verticals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>User management & demo reset tools</span>
                  </div>
                </div>
              </CardContent>
              <div className="p-4 pt-0">
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLogin('admin');
                  }}
                >
                  {loadingRole === 'admin' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entering Admin Suite...
                    </>
                  ) : (
                    <>
                      Enter Admin Suite
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Solutions / Financial Verticals Section */}
      <section id="verticals" className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="outline" className="text-xs uppercase font-bold tracking-wider text-primary border-primary/30 mb-2">
            Complete Product Coverage
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Tailored Pipelines for Tri-Vertical FinTech
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Each asset class enforces its own compliance milestones, document requirements, and status stages.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Vertical 1: Lending */}
          <div className="p-6 rounded-2xl border bg-card shadow-xs hover:border-primary/40 transition-colors">
            <div className="p-3 rounded-xl bg-sky-500/10 text-sky-500 w-fit mb-4">
              <CreditCard className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold">Retail & Corporate Loans</h3>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Originate home loans, personal credit lines, and corporate working capital. Integrated with salary slip verification, property agreements, and credit eligibility underwriting.
            </p>
            <div className="mt-4 pt-4 border-t space-y-1.5 text-xs text-muted-foreground">
              <div className="font-semibold text-foreground">Pipeline Stages:</div>
              <p className="text-[11px]">New → KYC Verification → Documents Needed → Eligibility Check → Underwriting → Approved → Disbursed</p>
            </div>
          </div>

          {/* Vertical 2: Investments */}
          <div className="p-6 rounded-2xl border bg-card shadow-xs hover:border-primary/40 transition-colors">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 w-fit mb-4">
              <PieChart className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold">Wealth & Mutual Fund SIPs</h3>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Customer risk appetite profiling, mutual fund scheme allocation, Demat account opening, and automated bank mandate setups for long-term compounding.
            </p>
            <div className="mt-4 pt-4 border-t space-y-1.5 text-xs text-muted-foreground">
              <div className="font-semibold text-foreground">Pipeline Stages:</div>
              <p className="text-[11px]">New → Risk Profiling → KYC Verification → Portfolio Creation → Activated</p>
            </div>
          </div>

          {/* Vertical 3: Insurance */}
          <div className="p-6 rounded-2xl border bg-card shadow-xs hover:border-primary/40 transition-colors">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500 w-fit mb-4">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold">Life & Health Insurance</h3>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Family floater health covers and pure term life proposals. Integrated with medical diagnostic report review, underwriter approval, and policy bond dispatch.
            </p>
            <div className="mt-4 pt-4 border-t space-y-1.5 text-xs text-muted-foreground">
              <div className="font-semibold text-foreground">Pipeline Stages:</div>
              <p className="text-[11px]">New → Medical Check → Document Verification → Underwriting → Policy Issued</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Workflow Section */}
      <section id="workflow" className="py-14 sm:py-20 bg-muted/20 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="outline" className="text-xs uppercase font-bold tracking-wider text-primary border-primary/30 mb-2">
              Operational Stepper
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              From Inquiry to Settlement in 4 Steps
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Collaborative handoff between Sales Advisors, Compliance Reviewers, and Managing Officers.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            <div className="p-5 rounded-2xl border bg-card relative">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center mb-3">
                01
              </div>
              <h4 className="font-bold text-sm">Lead Origination</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Advisors log incoming client requests, capture annual income, PAN/Tax IDs, and financial targets.
              </p>
            </div>

            <div className="p-5 rounded-2xl border bg-card relative">
              <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-600 font-bold text-xs flex items-center justify-center mb-3">
                02
              </div>
              <h4 className="font-bold text-sm">KYC & Proof Audit</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Back office reviews uploaded salary slips, tax returns, and agreements with 1-click approvals.
              </p>
            </div>

            <div className="p-5 rounded-2xl border bg-card relative">
              <div className="w-8 h-8 rounded-full bg-sky-500/10 text-sky-600 font-bold text-xs flex items-center justify-center mb-3">
                03
              </div>
              <h4 className="font-bold text-sm">Underwriting & Planning</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Risk profiling, credit score verification, and AI-suggested task checklists advance the file.
              </p>
            </div>

            <div className="p-5 rounded-2xl border bg-card relative">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-xs flex items-center justify-center mb-3">
                04
              </div>
              <h4 className="font-bold text-sm">Settlement & Disbursal</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Sanction letter issuance, mutual fund SIP portfolio activation, or insurance policy bond dispatch.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="outline" className="text-xs uppercase font-bold tracking-wider text-primary border-primary/30 mb-2">
            Platform Capabilities
          </Badge>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Engineered for Modern Financial Teams
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Everything your advisory team needs without external database overhead.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="p-5 rounded-2xl border bg-card">
            <Sparkles className="h-6 w-6 text-amber-500 mb-3" />
            <h4 className="font-bold text-sm">Contextual AI Task Assistant</h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Analyzes active leads and automatically generates stage-specific checklist items and missing document reminders.
            </p>
          </div>

          <div className="p-5 rounded-2xl border bg-card">
            <FileCheck2 className="h-6 w-6 text-emerald-500 mb-3" />
            <h4 className="font-bold text-sm">1-Click KYC Approval Queue</h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Back-office reviewers can audit uploaded PDF proofs, stamp verified status, or request missing files with instant feedback.
            </p>
          </div>

          <div className="p-5 rounded-2xl border bg-card">
            <CalendarCheck className="h-6 w-6 text-sky-500 mb-3" />
            <h4 className="font-bold text-sm">Follow-up Call & Meeting Scheduler</h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Schedule client interactions with direct phone dialing (`tel:`) and email links (`mailto:`) built right into cards.
            </p>
          </div>

          <div className="p-5 rounded-2xl border bg-card">
            <TrendingUp className="h-6 w-6 text-primary mb-3" />
            <h4 className="font-bold text-sm">Advisor Quota & Win-Rate Leaderboard</h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Recharts powered performance analytics show converted volume, won deals, and team quota attainment in real time.
            </p>
          </div>

          <div className="p-5 rounded-2xl border bg-card">
            <Database className="h-6 w-6 text-indigo-500 mb-3" />
            <h4 className="font-bold text-sm">100% Offline LocalStorage Engine</h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Zero dependency on Supabase, Firebase, or external API keys. Data persists reliably in the browser.
            </p>
          </div>

          <div className="p-5 rounded-2xl border bg-card">
            <ShieldCheck className="h-6 w-6 text-teal-500 mb-3" />
            <h4 className="font-bold text-sm">One-Click Demo Data Reset</h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Restore a clean, benchmark 4-customer dataset anytime from Settings or Dashboard for flawless live demonstrations.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-14 sm:py-16 bg-gradient-to-r from-primary/10 via-primary/5 to-background border-t">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Ready to Explore JustTry FinTech CRM?
          </h2>
          <p className="text-sm text-muted-foreground mt-3 max-w-xl mx-auto leading-relaxed">
            Choose any of the 3 workspace roles to start originating loans, verifying KYC documents, or exploring advisor analytics.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" onClick={scrollToRoles} className="h-11 px-6 text-sm font-semibold">
              Select Workspace Role
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsTutorialOpen(true)}
              className="h-11 px-6 text-sm font-medium border-primary/30"
            >
              <Sparkles className="mr-2 h-4 w-4 text-primary" />
              Open Interactive Tutorial
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-card text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1 rounded-lg bg-primary/10 text-primary">
              <AppLogo />
            </div>
            <div>
              <span className="font-bold text-foreground">JustTry FinTech CRM</span>
              <span className="mx-2">•</span>
              <span>100% Offline Architecture</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsTutorialOpen(true)}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              Interactive Tour
            </button>
            <a href="#workspace-roles" className="hover:text-foreground transition-colors">
              Workspaces
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              <span>GitHub</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
