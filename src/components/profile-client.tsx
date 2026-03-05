'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { signOut } from '@/lib/auth/actions';

interface Props {
  profile: Record<string, unknown> | null;
}

const LEVEL_NAMES = [
  '', 'Mwanafunzi', 'Msaidizi', 'Tabibu', 'Mganga', 'Daktari',
  'Bingwa', 'Mtaalam', 'Profesa', 'Mkuu', 'Shujaa',
];

export function ProfileClient({ profile }: Props) {
  if (!profile) return null;

  const level = (profile.level as number) || 1;
  const levelName = LEVEL_NAMES[level] || `Level ${level}`;

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      <h1 className="text-xl font-bold">Profile</h1>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center mb-4">
            <div className="w-16 h-16 rounded-full bg-kenya-green text-white flex items-center justify-center text-2xl font-bold mx-auto">
              {(profile.display_name as string)?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <h2 className="text-lg font-bold mt-2">{profile.display_name as string}</h2>
            <p className="text-sm text-muted-foreground capitalize">{profile.profession as string}</p>
            <Badge className="mt-1 bg-kenya-green text-white">{levelName}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold">{profile.total_cases as number || 0}</div>
              <div className="text-xs text-muted-foreground">Cases Completed</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold">{profile.total_points as number || 0}</div>
              <div className="text-xs text-muted-foreground">Total Points</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold">{profile.current_streak as number || 0}</div>
              <div className="text-xs text-muted-foreground">Current Streak</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold">{profile.longest_streak as number || 0}</div>
              <div className="text-xs text-muted-foreground">Best Streak</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Details</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          {profile.facility ? <p><span className="text-muted-foreground">Facility:</span> {String(profile.facility)}</p> : null}
          {profile.years_experience ? <p><span className="text-muted-foreground">Experience:</span> {String(profile.years_experience)} years</p> : null}
          {profile.region ? <p><span className="text-muted-foreground">Region:</span> {String(profile.region)}</p> : null}
          {profile.participant_code ? <p><span className="text-muted-foreground">Code:</span> {String(profile.participant_code)}</p> : null}
        </CardContent>
      </Card>

      <form action={signOut}>
        <Button type="submit" variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
          Sign Out
        </Button>
      </form>
    </div>
  );
}
