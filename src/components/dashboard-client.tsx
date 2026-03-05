'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DomainInfo {
  key: string;
  label: string;
  emoji: string;
  color: string;
}

const DOMAINS: DomainInfo[] = [
  { key: 'respiratory', label: 'Respiratory', emoji: '🫁', color: 'bg-blue-100 text-blue-800' },
  { key: 'infectious', label: 'Infectious', emoji: '🦠', color: 'bg-red-100 text-red-800' },
  { key: 'pediatric', label: 'Pediatric', emoji: '🧒', color: 'bg-green-100 text-green-800' },
  { key: 'maternal', label: 'Maternal', emoji: '👶', color: 'bg-pink-100 text-pink-800' },
  { key: 'ncds', label: 'NCDs', emoji: '💗', color: 'bg-purple-100 text-purple-800' },
  { key: 'emergency', label: 'Emergency', emoji: '🚨', color: 'bg-orange-100 text-orange-800' },
];

interface Props {
  profile: Record<string, unknown> | null;
  stats: { averageScore: number; domainProgress: Array<Record<string, unknown>> } | null;
  achievements: Array<Record<string, unknown>>;
}

export function DashboardClient({ profile, stats, achievements }: Props) {
  const displayName = (profile?.display_name as string) || 'Clinician';
  const totalCases = (profile?.total_cases as number) || 0;
  const currentStreak = (profile?.current_streak as number) || 0;
  const level = (profile?.level as number) || 1;

  const domainProgress = stats?.domainProgress || [];
  const domainMap = new Map(
    domainProgress.map((p) => [p.domain as string, p])
  );

  return (
    <div className="max-w-lg mx-auto px-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--kenya-green)] to-[var(--medical-blue)] text-white p-6 rounded-b-2xl -mx-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold">🩺 Daktari Dx</h1>
            <p className="text-sm opacity-90">Habari, {displayName}!</p>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white">
            Level {level}
          </Badge>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{currentStreak}</div>
            <div className="text-xs opacity-75">Day Streak</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{totalCases}</div>
            <div className="text-xs opacity-75">Cases Done</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{stats?.averageScore || 0}%</div>
            <div className="text-xs opacity-75">Avg Score</div>
          </div>
        </div>
      </div>

      {/* Achievements Preview */}
      {achievements.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Recent Achievements</h2>
            <Link href="/achievements" className="text-sm medical-blue">View All</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {achievements.slice(0, 4).map((a) => (
              <div
                key={a.id as string}
                className="flex-shrink-0 w-16 text-center"
              >
                <div className="w-12 h-12 mx-auto bg-yellow-100 rounded-full flex items-center justify-center text-xl">
                  {a.icon as string}
                </div>
                <p className="text-[10px] mt-1 text-muted-foreground truncate">
                  {(a.title as string).split('(')[0]}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Domain Cards */}
      <div className="mt-6">
        <h2 className="font-semibold mb-3">Clinical Domains</h2>
        <div className="grid grid-cols-2 gap-3">
          {DOMAINS.map((domain) => {
            const progress = domainMap.get(domain.key);
            const completed = (progress?.cases_completed as number) || 0;

            return (
              <Link key={domain.key} href={`/case/${domain.key}`}>
                <Card className="hover:shadow-md transition cursor-pointer h-full">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{domain.emoji}</span>
                      <span className="font-medium text-sm">{domain.label}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={domain.color}>
                        {completed} done
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* CFK Footer */}
      <div className="mt-8 mb-4 text-center text-xs text-muted-foreground">
        <p>A project by CFK Africa &amp; CollectiveGood</p>
      </div>
    </div>
  );
}
