import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, pan, dob, address } = await request.json();

    console.log('CIBIL Request:', {
      name,
      email,
      phone,
      pan: pan ? '[PRESENT]' : '[MISSING]',
      dob,
      address
    });

    // Generate mock CIBIL data
    return getMockCibilData();

  } catch (error) {
    console.error('CIBIL API error:', error);
    return NextResponse.json({
      error: 'Failed to generate CIBIL score',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Mock data for development/testing
function getMockCibilData() {
  // Mock CIBIL score generation (typically 550-850 range)
  const baseScore = 700;
  const variation = Math.floor(Math.random() * 150) - 75; // -75 to +75
  const score = Math.max(550, Math.min(850, baseScore + variation));

  // Mock additional details
  const creditReportDate = new Date().toISOString().split('T')[0];
  const totalAccounts = Math.floor(Math.random() * 10) + 1;
  const overdueAccounts = Math.floor(Math.random() * totalAccounts * 0.3);

  const cibilData = {
    score,
    creditReportDate,
    totalAccounts,
    overdueAccounts,
    riskCategory: score >= 750 ? 'Low Risk' : score >= 650 ? 'Medium Risk' : 'High Risk',
    generatedAt: new Date().toISOString(),
    dataSource: 'Mock Data (Development)',
    confidenceScore: Math.floor(Math.random() * 30) + 70 // 70-100%
  };

  return NextResponse.json(cibilData);
}

function calculateRiskCategory(score: number): string {
  if (score >= 750) return 'Low Risk';
  if (score >= 650) return 'Medium Risk';
  return 'High Risk';
}
