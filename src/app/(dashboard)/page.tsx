import { getProfile } from '@/lib/auth/actions';
import { getUserStats } from '@/lib/assessments/actions';
import { getUserAchievements } from '@/lib/achievements/actions';
import { DashboardClient } from '@/components/dashboard-client';

export default async function DashboardPage() {
  const profile = await getProfile();
  const stats = await getUserStats();
  const achievements = await getUserAchievements();

  return (
    <DashboardClient
      profile={profile}
      stats={stats}
      achievements={achievements}
    />
  );
}
