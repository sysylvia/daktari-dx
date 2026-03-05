'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';

export async function signInWithCode(code: string) {
  const admin = createAdminClient();

  // Look up participant code
  const { data: profile, error: lookupError } = await admin
    .from('profiles')
    .select('id')
    .eq('participant_code', code.toUpperCase().trim())
    .single();

  if (lookupError || !profile) {
    return { error: 'Invalid participant code. Please check and try again.' };
  }

  // Get the user's email to sign them in
  const { data: userData, error: userError } = await admin.auth.admin.getUserById(profile.id);

  if (userError || !userData.user?.email) {
    return { error: 'Account not found. Please contact your administrator.' };
  }

  // Sign in with OTP (magic link sent to their email)
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithOtp({
    email: userData.user.email,
    options: {
      shouldCreateUser: false,
    },
  });

  if (signInError) {
    return { error: 'Sign-in failed. Please try again.' };
  }

  return { success: true, email: userData.user.email };
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: 'Invalid email or password.' };
  }

  redirect('/');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return data;
}

export async function updateProfile(updates: Record<string, unknown>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', user.id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function completeOnboarding() {
  return updateProfile({ onboarding_completed: true });
}

export async function recordConsent() {
  return updateProfile({ consent_given_at: new Date().toISOString() });
}
