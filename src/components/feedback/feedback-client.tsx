'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Check, AlertTriangle, Flag } from 'lucide-react';

interface Assessment {
  id: string;
  raw_score: number;
  component_scores: {
    inclusion: number;
    ranking: number;
    notToMiss: number;
    calibration: number;
  };
  feedback: {
    overallScore: number;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
  user_differential: Array<{ diagnosis: string }>;
  user_not_to_miss: string[];
  confidence_level: number;
  time_spent: number;
  cases: {
    id: string;
    domain: string;
    title: string;
    expert_differential: Array<{ diagnosis: string; likelihood: number; reasoning: string }>;
    not_to_miss: string[];
    explanations: { keyFeatures: string[] };
    clinical_pearls: string[];
    next_steps: string[];
  };
}

function getScoreColor(score: number) {
  if (score >= 70) return 'kenya-green';
  if (score >= 50) return 'warning-orange';
  return 'error-red';
}

export function FeedbackClient({ assessment }: { assessment: Assessment }) {
  const { component_scores: scores, feedback, cases: caseData } = assessment;
  const overallScore = Math.round(assessment.raw_score);

  const expertDiff = caseData.expert_differential;
  const expertNTM = caseData.not_to_miss;
  const userDiags = assessment.user_differential.map((d) => d.diagnosis);
  const userNTM = assessment.user_not_to_miss || [];

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      {/* Score Banner */}
      <div className="bg-gradient-to-r from-[var(--kenya-green)] to-[var(--medical-blue)] text-white p-6 rounded-xl text-center">
        <p className="text-sm opacity-75">Your Score</p>
        <div className="text-5xl font-bold my-2">{overallScore}</div>
        <p className="text-sm opacity-75">out of 100</p>
      </div>

      {/* Component Scores */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Score Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'Completeness', score: scores.inclusion, max: 10, weight: '40%' },
            { label: 'Ranking', score: scores.ranking, max: 10, weight: '30%' },
            { label: 'Critical ID', score: scores.notToMiss, max: 10, weight: '30%' },
            { label: 'Calibration', score: scores.calibration, max: 5, weight: 'bonus' },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-sm mb-1">
                <span>{item.label} ({item.weight})</span>
                <span className={`font-medium ${getScoreColor(item.score * 10)}`}>
                  {item.score.toFixed(1)}/{item.max}
                </span>
              </div>
              <Progress value={(item.score / item.max) * 100} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Expert Comparison */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Expert Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {expertDiff.map((expert, idx) => {
              const userIncluded = userDiags.includes(expert.diagnosis);
              const isNTM = expertNTM.includes(expert.diagnosis);
              const userFlagged = userNTM.includes(expert.diagnosis);

              return (
                <div key={idx} className={`p-3 rounded-lg border ${userIncluded ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                  <div className="flex items-center gap-2">
                    {userIncluded ? (
                      <Check size={16} className="text-green-600" />
                    ) : (
                      <AlertTriangle size={16} className="text-yellow-600" />
                    )}
                    <span className="font-medium text-sm flex-1">{expert.diagnosis}</span>
                    <div className="flex items-center gap-1">
                      {isNTM && (
                        <Badge variant="destructive" className="text-[10px] px-1.5">
                          <Flag size={10} className="mr-0.5" />
                          NTM
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[10px]">
                        #{idx + 1}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{expert.reasoning}</p>
                  {isNTM && !userFlagged && (
                    <p className="text-xs text-red-600 mt-1">You did not flag this as not-to-miss</p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Feedback */}
      {(feedback.strengths.length > 0 || feedback.weaknesses.length > 0) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {feedback.strengths.length > 0 && (
              <div className="bg-green-50 p-3 rounded-lg">
                <h4 className="text-xs font-semibold text-green-800 mb-1">Strengths</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  {feedback.strengths.map((s, i) => <li key={i}>• {s}</li>)}
                </ul>
              </div>
            )}
            {feedback.weaknesses.length > 0 && (
              <div className="bg-yellow-50 p-3 rounded-lg">
                <h4 className="text-xs font-semibold text-yellow-800 mb-1">Areas to Improve</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {feedback.weaknesses.map((w, i) => <li key={i}>• {w}</li>)}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Clinical Pearls */}
      {caseData.clinical_pearls && caseData.clinical_pearls.length > 0 && (
        <Card className="border-l-4 border-l-[var(--medical-blue)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Clinical Pearls</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-2">
              {caseData.clinical_pearls.map((pearl, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span>💡</span>
                  <span>{pearl}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Key Features */}
      {caseData.explanations?.keyFeatures && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Key Diagnostic Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1">
              {caseData.explanations.keyFeatures.map((f, i) => (
                <li key={i}>• {f}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      {caseData.next_steps && caseData.next_steps.length > 0 && (
        <Card className="border-l-4 border-l-[var(--kenya-green)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Recommended Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1">
              {caseData.next_steps.map((step, i) => (
                <li key={i}>
                  <span className="font-medium">{i + 1}.</span> {step}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href={`/case/${caseData.domain}`}>
          <Button variant="outline" className="w-full">
            Next Case
          </Button>
        </Link>
        <Link href="/">
          <Button className="w-full bg-kenya-green hover:opacity-90">
            Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
