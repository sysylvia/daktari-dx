'use server';

import { createClient } from '@/lib/supabase/server';

interface AchievementDef {
  type: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  check: (stats: UserStats) => boolean;
}

interface UserStats {
  totalCases: number;
  currentStreak: number;
  totalPoints: number;
  level: number;
  domainCount: number;
  avgScore: number;
}

// Swahili-named achievements
const ACHIEVEMENTS: AchievementDef[] = [
  {
    type: 'mwanzo', title: 'Mwanzo (Beginning)',
    description: 'Complete your first clinical case',
    icon: '🌱', points: 10,
    check: (s) => s.totalCases >= 1,
  },
  {
    type: 'bidii', title: 'Bidii (Diligence)',
    description: 'Complete 5 clinical cases',
    icon: '📚', points: 25,
    check: (s) => s.totalCases >= 5,
  },
  {
    type: 'hodari', title: 'Hodari (Skilled)',
    description: 'Complete 10 clinical cases',
    icon: '⭐', points: 50,
    check: (s) => s.totalCases >= 10,
  },
  {
    type: 'bingwa', title: 'Bingwa (Expert)',
    description: 'Complete 25 clinical cases',
    icon: '🏆', points: 100,
    check: (s) => s.totalCases >= 25,
  },
  {
    type: 'moto', title: 'Moto (Fire)',
    description: 'Achieve a 3-day streak',
    icon: '🔥', points: 30,
    check: (s) => s.currentStreak >= 3,
  },
  {
    type: 'nguvu', title: 'Nguvu (Strength)',
    description: 'Achieve a 7-day streak',
    icon: '💪', points: 75,
    check: (s) => s.currentStreak >= 7,
  },
  {
    type: 'msalaba', title: 'Msalaba (Precision)',
    description: 'Score 80% or higher on average',
    icon: '🎯', points: 40,
    check: (s) => s.avgScore >= 80 && s.totalCases >= 3,
  },
  {
    type: 'daktari', title: 'Daktari (Doctor)',
    description: 'Practice across all 6 clinical domains',
    icon: '🩺', points: 60,
    check: (s) => s.domainCount >= 6,
  },
  {
    type: 'shujaa', title: 'Shujaa (Hero)',
    description: 'Reach level 5',
    icon: '🦸', points: 100,
    check: (s) => s.level >= 5,
  },
  {
    type: 'elimu', title: 'Elimu (Knowledge)',
    description: 'Earn 500 total points',
    icon: '📖', points: 50,
    check: (s) => s.totalPoints >= 500,
  },
];

export async function checkAndAwardAchievements(userId: string) {
  const supabase = await createClient();

  // Get user stats
  const { data: profile } = await supabase
    .from('profiles')
    .select('total_cases, current_streak, total_points, level')
    .eq('id', userId)
    .single();

  const { data: progress } = await supabase
    .from('user_progress')
    .select('domain')
    .eq('user_id', userId);

  const { data: assessments } = await supabase
    .from('assessments')
    .select('raw_score')
    .eq('user_id', userId);

  const { data: existingAchievements } = await supabase
    .from('achievements')
    .select('type')
    .eq('user_id', userId);

  if (!profile) return [];

  const avgScore = assessments?.length
    ? assessments.reduce((sum, a) => sum + (a.raw_score || 0), 0) / assessments.length
    : 0;

  const stats: UserStats = {
    totalCases: profile.total_cases || 0,
    currentStreak: profile.current_streak || 0,
    totalPoints: profile.total_points || 0,
    level: profile.level || 1,
    domainCount: new Set(progress?.map((p) => p.domain)).size,
    avgScore,
  };

  const earned = new Set(existingAchievements?.map((a) => a.type) || []);
  const newAchievements: Array<{ type: string; title: string; icon: string; points: number }> = [];

  for (const achievement of ACHIEVEMENTS) {
    if (!earned.has(achievement.type) && achievement.check(stats)) {
      await supabase.from('achievements').insert({
        user_id: userId,
        type: achievement.type,
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        points: achievement.points,
      });

      // Add points
      await supabase.from('profiles').update({
        total_points: (profile.total_points || 0) + achievement.points,
      }).eq('id', userId);

      newAchievements.push({
        type: achievement.type,
        title: achievement.title,
        icon: achievement.icon,
        points: achievement.points,
      });
    }
  }

  // Update level based on total points
  const totalPoints = (profile.total_points || 0) + newAchievements.reduce((s, a) => s + a.points, 0);
  const newLevel = Math.min(10, Math.floor(totalPoints / 100) + 1);
  if (newLevel !== profile.level) {
    await supabase.from('profiles').update({ level: newLevel }).eq('id', userId);
  }

  return newAchievements;
}

export async function getUserAchievements() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', user.id)
    .order('earned_at', { ascending: false });

  return data || [];
}

// ALL_ACHIEVEMENTS is exported from ./definitions.ts (non-server file)
