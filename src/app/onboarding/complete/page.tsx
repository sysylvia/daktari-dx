'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { completeOnboarding } from '@/lib/auth/actions';

export default function CompletePage() {
  const router = useRouter();

  async function handleStart() {
    await completeOnboarding();
    router.push('/');
  }

  return (
    <Card>
      <CardContent className="text-center py-8 space-y-6">
        <span className="text-6xl">🎉</span>
        <h1 className="text-2xl font-bold kenya-green">You&apos;re All Set!</h1>
        <p className="text-muted-foreground">
          Your profile is complete. You&apos;re ready to start practicing clinical
          diagnostic reasoning with real Kenya-contextualized cases.
        </p>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold kenya-green">6</div>
            <div className="text-xs text-muted-foreground">Clinical Domains</div>
          </div>
          <div>
            <div className="text-2xl font-bold medical-blue">IRT</div>
            <div className="text-xs text-muted-foreground">Adaptive Engine</div>
          </div>
          <div>
            <div className="text-2xl font-bold warning-orange">10</div>
            <div className="text-xs text-muted-foreground">Achievements</div>
          </div>
        </div>

        <Button
          onClick={handleStart}
          className="w-full bg-kenya-green hover:opacity-90"
          size="lg"
        >
          Start Practicing
        </Button>
      </CardContent>
    </Card>
  );
}
