'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface CaseData {
  id: string;
  domain: string;
  title: string;
  difficulty: number;
  demographics: Record<string, string>;
  presentation: {
    chiefComplaint: { english: string; kiswahili: string };
    vitals: Record<string, number | string>;
  };
  history: { presentingIllness: string[] };
  physical_exam: Record<string, string>;
}

function getDifficultyBadge(d: number) {
  if (d < -0.3) return { label: 'Easy', className: 'bg-success-green text-white' };
  if (d < 0.3) return { label: 'Moderate', className: 'bg-warning-orange text-white' };
  return { label: 'Hard', className: 'bg-error-red text-white' };
}

const DOMAIN_EMOJI: Record<string, string> = {
  respiratory: '🫁', infectious: '🦠', pediatric: '🧒',
  maternal: '👶', ncds: '💗', emergency: '🚨',
};

export function ClinicalVignetteClient({ caseData }: { caseData: CaseData }) {
  const diff = getDifficultyBadge(caseData.difficulty);
  const demo = caseData.demographics;
  const vitals = caseData.presentation.vitals;
  const cc = caseData.presentation.chiefComplaint;
  const hpi = caseData.history.presentingIllness;
  const exam = caseData.physical_exam;

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{DOMAIN_EMOJI[caseData.domain] || '📋'}</span>
          <h1 className="text-lg font-bold">{caseData.title}</h1>
        </div>
        <Badge className={diff.className}>{diff.label}</Badge>
      </div>

      {/* Patient Demographics */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Patient</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-muted-foreground">Age:</span> {demo.age}</div>
            <div><span className="text-muted-foreground">Sex:</span> {demo.sex}</div>
            <div className="col-span-2"><span className="text-muted-foreground">Location:</span> {demo.location}</div>
            {demo.context && (
              <div className="col-span-2"><span className="text-muted-foreground">Context:</span> {demo.context}</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chief Complaint (bilingual) */}
      <Card className="border-l-4 border-l-[var(--kenya-green)]">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Chief Complaint</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="font-medium">{cc.english}</p>
          <p className="text-sm text-muted-foreground italic">🇰🇪 {cc.kiswahili}</p>
        </CardContent>
      </Card>

      {/* Vitals */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Vital Signs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {vitals.temperature && (
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-muted-foreground text-xs">Temp</div>
                <div className="font-medium">{vitals.temperature}°C</div>
              </div>
            )}
            {vitals.heartRate && (
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-muted-foreground text-xs">HR</div>
                <div className="font-medium">{vitals.heartRate} bpm</div>
              </div>
            )}
            {vitals.respiratoryRate && (
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-muted-foreground text-xs">RR</div>
                <div className="font-medium">{vitals.respiratoryRate}/min</div>
              </div>
            )}
            {vitals.bloodPressure && (
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-muted-foreground text-xs">BP</div>
                <div className="font-medium">{vitals.bloodPressure}</div>
              </div>
            )}
            {vitals.weight && (
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-muted-foreground text-xs">Weight</div>
                <div className="font-medium">{vitals.weight} kg</div>
              </div>
            )}
            {vitals.oxygenSaturation && (
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-muted-foreground text-xs">SpO2</div>
                <div className="font-medium">{vitals.oxygenSaturation}%</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">History of Present Illness</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {hpi.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-muted-foreground mt-1">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Physical Exam */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Physical Examination</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            {Object.entries(exam).map(([system, finding]) => (
              <div key={system}>
                <div className="font-medium capitalize text-muted-foreground text-xs">
                  {system.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div>{finding}</div>
                <Separator className="mt-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action */}
      <Link href={`/checkpoint/${caseData.id}`}>
        <Button className="w-full bg-kenya-green hover:opacity-90" size="lg">
          Proceed to Diagnostic Thinking
        </Button>
      </Link>
    </div>
  );
}
