# JustTry CRM

A comprehensive CRM system built with Next.js for managing leads across Loan, Investment, and Insurance services.

## Features

- ✅ Lead Management with Pipeline Status Tracking
- ✅ User Role Management (Sales, Back-office, Admin)
- ✅ CIBIL Score Checking for Loan Eligibility (Back-office/Admin only)
- ✅ **AI Automated Calling** for Approved Applications
- ✅ **AI Email Automation** with Personalized Messages
- ✅ Document Upload and Management
- ✅ Real-time Status Updates and History

## Setup Instructions

### 1. Environment Configuration

Copy the example environment file and configure your variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Bland AI for Automated Calling (Free tier available)
BLAND_AI_API_KEY=your_bland_ai_api_key

# OpenRouter for AI Email Generation (Free tier available)
OPENROUTER_API_KEY=your_openrouter_api_key

# Choose ONE email service (Gmail is easiest for localhost!):

# Option A: Gmail SMTP (Recommended for localhost - no domain verification!)
GMAIL_USER=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password

# Option B: Mailtrap (Localhost testing - captures emails)
# MAILTRAP_API_KEY=your_mailtrap_api_token

# Option C: Resend (For production deployment)
# RESEND_API_KEY=your_resend_api_key
```

### 2. Get API Keys

#### Supabase (Database):
1. Create account at [https://supabase.com/](https://supabase.com/)
2. Create a new project
3. Go to Settings > API
4. Copy Project URL and API keys

#### Bland AI (AI Calling - Free):
1. Visit [https://www.bland.ai/](https://www.bland.ai/)
2. Sign up for free account (50 minutes/month)
3. Go to [https://app.bland.ai/](https://app.bland.ai/)
4. Copy your API key

#### OpenRouter (AI Email Generation - Free):
1. Visit [https://openrouter.ai/](https://openrouter.ai/)
2. Sign up for free account
3. Go to [https://openrouter.ai/keys](https://openrouter.ai/keys)
4. Create a new API key
5. Copy the key (Free tier available)

#### Gmail SMTP (Recommended - Free & Reliable):
1. **Enable 2-Step Verification** on your Gmail account
   - Go to [https://myaccount.google.com/security](https://myaccount.google.com/security)
   - Under "Signing in to Google", enable 2-Step Verification

2. **Generate App Password:**
   - Go to [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Select "JustTry CRM" as the app name
   - Click "Generate"
   - **Copy the 16-character password** (remove any spaces)

3. **Add to `.env.local`:**
   ```bash
   GMAIL_USER=your_gmail@gmail.com
   GMAIL_APP_PASSWORD=abcd1234efgh5678  # 16 chars, no spaces
   ```

4. **Troubleshooting Gmail Issues:**
   - **Error: "EAUTH"** → Regenerate App Password
   - **Error: "Application-specific password required"** → Use App Password, not regular password
   - **Error: "Invalid login"** → Check email and App Password
   - **Gmail blocks sign-in** → Check Gmail security alerts and allow the app

**✅ Gmail sends real emails to any address!**

#### Mailtrap (Localhost Testing - No Domain Verification):
1. Visit [https://mailtrap.io/](https://mailtrap.io/)
2. Sign up for free account (inbox for 500 emails/month)
3. Go to [https://mailtrap.io/inboxes](https://mailtrap.io/inboxes)
4. Create an inbox and copy the API token
5. Add `MAILTRAP_API_KEY=your_token` to `.env.local`
6. **View sent emails:** Go to your Mailtrap inbox to see captured emails

#### Resend (Production - requires domain verification):
1. Visit [https://resend.com/](https://resend.com/)
2. Sign up for free account (3,000 emails/month)
3. **For Testing:** The system uses `crm@resend.dev` (works immediately)
4. **For Production:** Add and verify your own domain (crm@yourdomain.com)
   - Go to [https://resend.com/domains](https://resend.com/domains)
   - Add your domain
   - Follow DNS verification steps

### 3. Database Setup

Run the SQL schema in your Supabase SQL editor:

```bash
# Copy contents of schema.sql and run in Supabase
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Development Setup (Localhost)

For localhost development without domain verification:

```bash
# In your .env.local, add this line to skip email sending:
SKIP_EMAIL_SENDING=true

# This allows you to test the UI and AI generation without sending actual emails
```

### Payment Gateway Integration

The application includes a test payment gateway for loan disbursements using **Razorpay** (India's leading payment gateway). Razorpay works seamlessly in India and supports bank transfers, payouts, and disbursements.

### Setting up Razorpay for Indian Users

1. **Create a Razorpay Account**:
   - Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
   - Sign up for a free account (works in India!)
   - Complete KYC verification

2. **Get API Keys**:
   - Navigate to "Settings" → "API Keys"
   - Generate Test API Key ID and Secret Key
   - **Keep these secure - never share them publicly**

3. **Configure Environment Variables**:
   - Open `.env.local`
   - Replace the placeholder values:
   ```env
   RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXXXXXXXX
   RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

4. **Test the Integration**:
   - The system will automatically detect valid Razorpay keys
   - Test disbursements will use real Razorpay test payouts
   - Use test bank accounts for testing

### Why Razorpay Instead of Stripe?

- ✅ **India-Ready**: Works perfectly in India (Stripe has restrictions)
- ✅ **Bank Transfers**: Supports direct bank account payouts
- ✅ **IMPS/NEFT/RTGS**: Multiple transfer modes
- ✅ **Low Costs**: Competitive pricing for Indian market
- ✅ **Developer-Friendly**: Excellent documentation and APIs

### Without Razorpay Keys (Mock Mode)

If no valid Razorpay keys are provided, the system runs in mock mode:
- Disbursements are simulated successfully
- All UI flows work normally
- Console shows "Razorpay API keys not configured. Using mock disbursement"
- Toast notifications indicate mock disbursements

### Testing Disbursement Flow

1. **Sales User**: Login → View loan lead → Add bank details
2. **Back-office User**: Login → Verify bank details → Change status to "Approved"
3. **Process Disbursement**: Click "Disburse Loan Amount" → Confirmation dialog
4. **Success**: Lead status changes to "Disbursed" with full audit trail

### Razorpay Payout Features

- **Contact Creation**: Automatically creates customer contacts
- **Fund Accounts**: Links bank accounts for payouts
- **Multiple Modes**: IMPS (fast), NEFT (reliable), RTGS (large amounts)
- **Queue Support**: Handles low balance scenarios
- **Real-time Tracking**: Payout status updates
- **Compliance**: Full audit trail and compliance features

### 6. Run Development Server

```bash
npm run dev
```

### 7. Production Deployment (Vercel)

For Vercel deployment with email sending:

1. **Remove the development skip:**
   ```bash
   # In production, set this to false or remove it:
   SKIP_EMAIL_SENDING=false
   ```

2. **Domain Verification (Optional but Recommended):**
   - Go to [https://resend.com/domains](https://resend.com/domains)
   - Add your custom domain
   - Follow DNS verification steps
   - Update `src/app/api/send-email/route.ts` with your domain

3. **Deploy to Vercel:**
   ```bash
   npm run build
   # Deploy using Vercel CLI or Git integration
   ```

## AI Automation Features

### 🤖 AI Calling
When lead statuses change to approved:
- **Loan**: "Approved" → AI calls customer about loan approval
- **Investment**: "Activated" → AI calls about account activation
- **Insurance**: "Policy Issued" → AI calls about policy activation

The AI can answer customer questions and provide relevant information.

### 📧 AI Email Automation
When lead statuses change to approved, AI automatically:
- **Generates personalized email content** using OpenRouter with Gemini models
- **Sends professional HTML emails** via Resend
- **Includes customer name and specific details**
- **Provides next steps and contact information**

**Email Examples:**
- Loan: "🎉 Congratulations! Your Loan Application Has Been Approved"
- Investment: "🚀 Your Investment Account is Now Active!"
- Insurance: "✅ Your Insurance Policy is Ready!"

Both AI calls and emails are logged in lead history for tracking.

## CIBIL Checking

Only back-office and admin users can run CIBIL checks for loan applications in "Eligibility Check" status.

**Current Implementation:**
- Uses mock data with realistic CIBIL scores (550-850 range)
- Collects PAN, DOB, and address for form validation
- Displays risk categories, credit report dates, and account information
- Provides confidence scores and data source identification

**Note:** Currently uses development mock data. Contact your preferred credit scoring provider for production API integration.

---

Built with Next.js, TypeScript, Supabase, and Tailwind CSS.
