'use server';

import { createClient } from '@/lib/supabase/server';
import { scoreAssessment } from '@/lib/scoring/irt-engine';
import { checkAndAwardAchievements } from '@/lib/achievements/actions';

interface SubmitAssessmentInput {
  caseId: string;
  userDifferential: Array<{ diagnosis: string }>;
  userNotToMiss: string[];
  confidenceLevel: number;
  timeSpent: number;
}

export async function submitAssessment(input: SubmitAssessmentInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get the case data
  const { data: caseData, error: caseError } = await supabase
    .from('cases')
    .select('*')
    .eq('id', input.caseId)
    .single();

  if (caseError || !caseData) throw new Error('Case not found');

  // Score the assessment
  const result = scoreAssessment(
    input.userDifferential,
    input.userNotToMiss,
    input.confidenceLevel,
    {
      expert_differential: caseData.expert_differential as Array<{ diagnosis: string; likelihood: number; reasoning: string }>,
      not_to_miss: caseData.not_to_miss,
      difficulty: caseData.difficulty ?? 0,
      discrimination: caseData.discrimination ?? 1,
      guessing: caseData.guessing ?? 0.15,
    }
  );

  // Insert assessment
  const { data: assessment, error: assessmentError } = await supabase
    .from('assessments')
    .insert({
      user_id: user.id,
      case_id: input.caseId,
      user_differential: input.userDifferential,
      user_not_to_miss: input.userNotToMiss,
      confidence_level: input.confidenceLevel,
      time_spent: input.timeSpent,
      raw_score: result.rawScore,
      ability_estimate: result.abilityEstimate,
      standard_error: result.standardError,
      component_scores: result.componentScores,
      feedback: result.feedback,
    })
    .select()
    .single();

  if (assessmentError) throw new Error(assessmentError.message);

  // Update user profile stats
  const { data: profile } = await supabase
    .from('profiles')
    .select('total_cases, total_points, current_streak, longest_streak, current_ability')
    .eq('id', user.id)
    .single();

  if (profile) {
    const newTotalCases = (profile.total_cases || 0) + 1;
    const points = Math.round(result.rawScore);
    const newStreak = (profile.current_streak || 0) + 1;

    await supabase.from('profiles').update({
      total_cases: newTotalCases,
      total_points: (profile.total_points || 0) + points,
      current_streak: newStreak,
      longest_streak: Math.max(profile.longest_streak || 0, newStreak),
      current_ability: result.abilityEstimate,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id);
  }

  // Update domain progress
  await updateDomainProgress(user.id, caseData.domain, result.rawScore, input.timeSpent);

  // Check achievements
  const newAchievements = await checkAndAwardAchievements(user.id);

  return { assessment, newAchievements };
}

async function updateDomainProgress(
  userId: string,
  domain: string,
  score: number,
  timeSpent: number
) {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('domain', domain)
    .single();

  if (existing) {
    const newCompleted = (existing.cases_completed || 0) + 1;
    const newAccuracy =
      ((existing.accuracy || 0) * (existing.cases_completed || 0) + score) / newCompleted;
    const newAvgTime =
      ((existing.average_time || 0) * (existing.cases_completed || 0) + timeSpent) / newCompleted;

    await supabase
      .from('user_progress')
      .update({
        cases_completed: newCompleted,
        accuracy: newAccuracy,
        average_time: newAvgTime,
        last_practiced: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('domain', domain);
  } else {
    await supabase.from('user_progress').insert({
      user_id: userId,
      domain,
      cases_completed: 1,
      accuracy: score,
      average_time: timeSpent,
      last_practiced: new Date().toISOString(),
    });
  }
}

export async function getUserAssessments() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('assessments')
    .select('*, cases(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return data || [];
}

export async function getUserStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: progress } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', user.id);

  const { data: recentAssessments } = await supabase
    .from('assessments')
    .select('raw_score, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10);

  const avgScore = recentAssessments?.length
    ? recentAssessments.reduce((sum, a) => sum + (a.raw_score || 0), 0) / recentAssessments.length
    : 0;

  return {
    profile,
    domainProgress: progress || [],
    averageScore: Math.round(avgScore),
    recentAssessments: recentAssessments || [],
  };
}

export async function exportAssessments(format: 'json' | 'csv' = 'json') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    throw new Error('Unauthorized');
  }

  const { data } = await supabase
    .from('assessments')
    .select('*, profiles!assessments_user_id_fkey(display_name, participant_code, profession), cases(title, domain)')
    .order('created_at', { ascending: false });

  if (format === 'csv') {
    if (!data || data.length === 0) return '';
    const headers = [
      'participant_code', 'display_name', 'profession', 'case_title', 'domain',
      'raw_score', 'ability_estimate', 'confidence_level', 'time_spent',
      'inclusion_score', 'ranking_score', 'ntm_score', 'calibration_score',
      'created_at'
    ];
    const rows = data.map((d) => {
      const scores = d.component_scores as Record<string, number> | null;
      const p = d.profiles as Record<string, string> | null;
      const c = d.cases as Record<string, string> | null;
      return [
        p?.participant_code || '', p?.display_name || '', p?.profession || '',
        c?.title || '', c?.domain || '',
        d.raw_score, d.ability_estimate, d.confidence_level, d.time_spent,
        scores?.inclusion || '', scores?.ranking || '', scores?.notToMiss || '', scores?.calibration || '',
        d.created_at
      ].join(',');
    });
    return [headers.join(','), ...rows].join('\n');
  }

  return data;
}
