import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function WelcomePage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <span className="text-5xl">🩺</span>
        <h1 className="text-2xl font-bold mt-4 kenya-green">Karibu Daktari Dx!</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to your clinical diagnostic training platform
        </p>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardContent className="flex items-start gap-3 pt-4">
            <span className="text-2xl">📋</span>
            <div>
              <h3 className="font-medium">Real Clinical Cases</h3>
              <p className="text-sm text-muted-foreground">
                Practice with Kenya-contextualized clinical vignettes from Kibera and Nairobi
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-start gap-3 pt-4">
            <span className="text-2xl">🧠</span>
            <div>
              <h3 className="font-medium">Adaptive Learning</h3>
              <p className="text-sm text-muted-foreground">
                Cases adapt to your skill level using advanced psychometric models
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-start gap-3 pt-4">
            <span className="text-2xl">🏆</span>
            <div>
              <h3 className="font-medium">Track Your Growth</h3>
              <p className="text-sm text-muted-foreground">
                Earn achievements, build streaks, and see your diagnostic skills improve
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Link href="/onboarding/profile-setup">
        <Button className="w-full bg-kenya-green hover:opacity-90">Get Started</Button>
      </Link>
    </div>
  );
}
