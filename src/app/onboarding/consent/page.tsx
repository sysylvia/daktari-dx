'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { recordConsent } from '@/lib/auth/actions';

export default function ConsentPage() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConsent() {
    setLoading(true);
    await recordConsent();
    router.push('/onboarding/complete');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Research Consent</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg text-sm space-y-3">
          <h3 className="font-semibold">About This Study</h3>
          <p>
            Daktari Dx is part of a research pilot conducted by CFK Africa and CollectiveGood
            to evaluate AI-adaptive clinical training tools for healthcare workers in Kibera.
          </p>
          <h3 className="font-semibold">What We Collect</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Your diagnostic responses and scores</li>
            <li>Time spent on each case</li>
            <li>Self-assessed confidence levels</li>
            <li>Professional background information</li>
          </ul>
          <h3 className="font-semibold">Your Rights</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Participation is voluntary</li>
            <li>You can stop at any time without penalty</li>
            <li>Your data will be de-identified in any publications</li>
            <li>You may request deletion of your data</li>
          </ul>
        </div>

        <div className="flex items-start gap-3 p-3 border rounded-lg">
          <Checkbox
            id="consent"
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(checked === true)}
          />
          <label htmlFor="consent" className="text-sm cursor-pointer">
            I have read and understand the above information. I voluntarily agree to
            participate in this study and consent to the collection of my training data
            for research purposes.
          </label>
        </div>

        <Button
          onClick={handleConsent}
          className="w-full bg-kenya-green hover:opacity-90"
          disabled={!agreed || loading}
        >
          {loading ? 'Recording consent...' : 'I Agree & Continue'}
        </Button>
      </CardContent>
    </Card>
  );
}
