import { getUserAchievements } from '@/lib/achievements/actions';
import { ALL_ACHIEVEMENTS } from '@/lib/achievements/definitions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AchievementsPage() {
  const earned = await getUserAchievements();
  const earnedTypes = new Set(earned.map((a) => a.type));

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      <h1 className="text-xl font-bold">Achievements</h1>
      <p className="text-sm text-muted-foreground">
        {earned.length} of {ALL_ACHIEVEMENTS.length} earned
      </p>

      <div className="grid grid-cols-2 gap-3">
        {ALL_ACHIEVEMENTS.map((achievement) => {
          const isEarned = earnedTypes.has(achievement.type);
          return (
            <Card
              key={achievement.type}
              className={isEarned ? 'border-[var(--kenya-green)]' : 'opacity-50'}
            >
              <CardContent className="p-4 text-center">
                <div className={`text-3xl mb-2 ${isEarned ? '' : 'grayscale'}`}>
                  {achievement.icon}
                </div>
                <h3 className="text-sm font-medium">{achievement.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {achievement.description}
                </p>
                <p className="text-xs mt-2 font-medium kenya-green">
                  +{achievement.points} pts
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
