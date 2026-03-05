import { getUserStats } from '@/lib/assessments/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const DOMAIN_META: Record<string, { emoji: string; label: string }> = {
  respiratory: { emoji: '🫁', label: 'Respiratory' },
  infectious: { emoji: '🦠', label: 'Infectious' },
  pediatric: { emoji: '🧒', label: 'Pediatric' },
  maternal: { emoji: '👶', label: 'Maternal' },
  ncds: { emoji: '💗', label: 'NCDs' },
  emergency: { emoji: '🚨', label: 'Emergency' },
};

export default async function AnalyticsPage() {
  const stats = await getUserStats();
  const progress = stats?.domainProgress || [];

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      <h1 className="text-xl font-bold">Performance Analytics</h1>

      {/* Overview */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Overall Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold kenya-green">{stats?.averageScore || 0}%</div>
              <div className="text-xs text-muted-foreground">Average Score</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold medical-blue">{stats?.profile?.total_cases || 0}</div>
              <div className="text-xs text-muted-foreground">Total Cases</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Domain Breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Domain Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(DOMAIN_META).map(([key, meta]) => {
            const dp = progress.find((p: Record<string, unknown>) => p.domain === key);
            const completed = (dp?.cases_completed as number) || 0;
            const accuracy = (dp?.accuracy as number) || 0;

            return (
              <div key={key}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>{meta.emoji} {meta.label}</span>
                  <span className="text-muted-foreground">
                    {completed} cases • {Math.round(accuracy)}%
                  </span>
                </div>
                <Progress value={Math.min(accuracy, 100)} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Recent Scores</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.recentAssessments && stats.recentAssessments.length > 0 ? (
            <div className="space-y-2">
              {stats.recentAssessments.map((a, i) => (
                <div key={i} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                  <span className="text-muted-foreground">
                    {new Date(a.created_at).toLocaleDateString()}
                  </span>
                  <span className="font-medium">{Math.round(a.raw_score)}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Complete cases to see your analytics
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
