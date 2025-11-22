console.log('data.ts loaded');

import { supabase } from './supabase';
import { Lead, User, UserRole } from './definitions';

export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('crm_users')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  return (data || []).map(item => ({
    id: item.id,
    name: item.name,
    email: item.email,
    role: item.role,
    avatar: item.avatar,
    phone: item.phone,
    department: item.department,
    joinDate: item.join_date,
    manager: item.manager,
  }));
}

export async function getUser(role: UserRole): Promise<User | null> {
  const { data, error } = await supabase
    .from('crm_users')
    .select('*')
    .eq('role', role)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return data;
}

export async function getSalesUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('crm_users')
    .select('*')
    .eq('role', 'sales')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching sales users:', error);
    return [];
  }

  return (data || []).map(item => ({
    id: item.id,
    name: item.name,
    email: item.email,
    role: item.role,
    avatar: item.avatar,
    phone: item.phone,
    department: item.department,
    joinDate: item.join_date,
    manager: item.manager,
    serviceTypes: item.service_types,
  }));
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('crm_users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
    avatar: data.avatar,
    phone: data.phone,
    department: data.department,
    joinDate: data.join_date,
    manager: data.manager,
    serviceTypes: data.service_types,
  };
}

export async function createAuthUser(email: string, password: string): Promise<{ user: any; error: any }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  return { user: data.user, error };
}

export async function saveUsers(users: User[]): Promise<void> {
  const transformed = users.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    phone: user.phone,
    department: user.department,
    join_date: user.joinDate,
    manager: user.manager,
    service_types: user.serviceTypes,
  }));

  const { error } = await supabase
    .from('crm_users')
    .upsert(transformed, { onConflict: 'id' });

  if (error) {
    console.error('Error saving users:', error);
  }
}

export async function getLeads(): Promise<Lead[]> {
  console.log('getLeads called');
  const { data, error } = await supabase
    .from('crm_leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching leads:', error);
    return [];
  }

  const transformed = (data || []).map(item => ({
    id: item.id,
    name: item.name,
    email: item.email,
    phone: item.phone,
    serviceType: item.service_type,
    subCategory: item.sub_category,
    status: item.status,
    value: item.value,
    assignedTo: item.assigned_to,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    documents: item.documents,
    history: item.history,
    bankDetails: item.bank_details,
    disbursements: item.disbursements
  }));

  return transformed;
}

export async function getLeadsByAssignedUser(userId: string): Promise<Lead[]> {
  console.log('getLeadsByAssignedUser called for user:', userId);
  const { data, error } = await supabase
    .from('crm_leads')
    .select('*')
    .eq('assigned_to', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching leads by assigned user:', error);
    return [];
  }

  const transformed = (data || []).map(item => ({
    id: item.id,
    name: item.name,
    email: item.email,
    phone: item.phone,
    serviceType: item.service_type,
    subCategory: item.sub_category,
    status: item.status,
    value: item.value,
    assignedTo: item.assigned_to,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    documents: item.documents,
    history: item.history,
    bankDetails: item.bank_details,
    disbursements: item.disbursements
  }));

  return transformed;
}

export async function saveLeads(leads: Lead[]): Promise<void> {
  console.log('saveLeads called with leads:', leads.length);
  console.log('Lead data structure:', JSON.stringify(leads[0], null, 2));

  const transformed = leads.map(lead => ({
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    service_type: lead.serviceType,
    sub_category: lead.subCategory,
    status: lead.status,
    value: lead.value,
    assigned_to: lead.assignedTo,
    created_at: lead.createdAt,
    updated_at: new Date().toISOString(),
    documents: lead.documents,
    history: lead.history,
    bank_details: lead.bankDetails,
    disbursements: lead.disbursements
  }));

  console.log('Transformed data for Supabase:', JSON.stringify(transformed[0], null, 2));

  const { data, error } = await supabase
    .from('crm_leads')
    .upsert(transformed, { onConflict: 'id' });

  console.log('Supabase response:', { data, error });

  if (error) {
    console.error('Error saving leads:', error);
    console.error('Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    throw error; // Re-throw to allow calling code to handle
  } else {
    console.log('Leads saved successfully');
  }
}

// Document management functions
export async function uploadDocument(file: File, leadId: string): Promise<{ name: string; url: string } | null> {
  console.log('Uploading document for lead:', leadId, 'File:', file.name);

  const fileExt = file.name.split('.').pop();
  const fileName = `${leadId}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('lead-documents')
    .upload(fileName, file);

  if (error) {
    console.error('Error uploading document:', error);
    return null;
  }

  // Get public URL (bucket is public with policy restrictions)
  const { data: urlData } = supabase.storage
    .from('lead-documents')
    .getPublicUrl(fileName);

  if (!urlData?.publicUrl) {
    console.error('Failed to get public URL');
    return null;
  }

  return {
    name: file.name,
    url: urlData.publicUrl
  };
}

export async function deleteDocument(fileName: string): Promise<boolean> {
  console.log('Deleting document:', fileName);

  const { error } = await supabase.storage
    .from('lead-documents')
    .remove([fileName]);

  if (error) {
    console.error('Error deleting document:', error);
    return false;
  }

  return true;
}

export async function getDocumentUrl(fileName: string): Promise<string | null> {
  console.log('Getting public URL for file:', fileName);

  const { data } = supabase.storage
    .from('lead-documents')
    .getPublicUrl(fileName);

  if (!data?.publicUrl) {
    console.error('Failed to get public URL for viewing');
    return null;
  }

  return data.publicUrl;
}