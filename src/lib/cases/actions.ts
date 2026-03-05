'use server';

import { createClient } from '@/lib/supabase/server';
import { selectNextCase } from '@/lib/scoring/irt-engine';

export async function getCases(domain?: string) {
  const supabase = await createClient();

  let query = supabase.from('cases').select('*').eq('is_active', true);
  if (domain) query = query.eq('domain', domain);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function getCaseById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getAdaptiveCase(domain: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get user's ability
  const { data: profile } = await supabase
    .from('profiles')
    .select('current_ability')
    .eq('id', user.id)
    .single();

  // Get available cases
  const { data: cases } = await supabase
    .from('cases')
    .select('id, difficulty, discrimination, guessing')
    .eq('domain', domain)
    .eq('is_active', true);

  // Get completed case IDs
  const { data: assessments } = await supabase
    .from('assessments')
    .select('case_id')
    .eq('user_id', user.id);

  if (!cases || cases.length === 0) return null;

  const completedIds = (assessments || []).map((a) => a.case_id);
  const nextCaseId = selectNextCase(
    cases.map((c) => ({
      id: c.id,
      difficulty: c.difficulty ?? 0,
      discrimination: c.discrimination ?? 1,
      guessing: c.guessing ?? 0.15,
    })),
    completedIds,
    profile?.current_ability || 0
  );

  if (!nextCaseId) return null;
  return getCaseById(nextCaseId);
}

export async function getCaseDomainCounts() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('cases')
    .select('domain')
    .eq('is_active', true);

  if (error) throw new Error(error.message);

  const counts: Record<string, number> = {};
  for (const c of data || []) {
    counts[c.domain] = (counts[c.domain] || 0) + 1;
  }
  return counts;
}
