'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { ChevronUp, ChevronDown, Flag, X, Clock } from 'lucide-react';
import { submitAssessment } from '@/lib/assessments/actions';

interface Diagnosis {
  id: number;
  diagnosis: string;
  isNotToMiss: boolean;
}

const SUGGESTED_DIAGNOSES = [
  'Pneumonia', 'Malaria', 'Typhoid Fever', 'Tuberculosis', 'Bronchitis',
  'Preeclampsia', 'STEMI', 'Sepsis', 'Meningitis', 'Gastroenteritis',
  'Dehydration', 'HIV/AIDS', 'Asthma', 'Heart Failure', 'Anemia',
  'UTI', 'Diabetes', 'Hypertension', 'Opioid Overdose', 'HELLP Syndrome',
  'Eclampsia', 'Rotavirus', 'Strep Throat', 'Tonsillitis', 'Aortic Dissection',
];

export default function DiagnosisPage() {
  const router = useRouter();
  const params = useParams();
  const caseId = params.id as string;

  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [confidence, setConfidence] = useState(3);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [startTime] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [nextId, setNextId] = useState(1);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  function addDiagnosis(name: string) {
    if (diagnoses.some((d) => d.diagnosis === name)) return;
    setDiagnoses([...diagnoses, { id: nextId, diagnosis: name, isNotToMiss: false }]);
    setNextId(nextId + 1);
    setSearchTerm('');
  }

  function removeDiagnosis(id: number) {
    setDiagnoses(diagnoses.filter((d) => d.id !== id));
  }

  function toggleNotToMiss(id: number) {
    setDiagnoses(
      diagnoses.map((d) => (d.id === id ? { ...d, isNotToMiss: !d.isNotToMiss } : d))
    );
  }

  function moveUp(idx: number) {
    if (idx === 0) return;
    const arr = [...diagnoses];
    [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    setDiagnoses(arr);
  }

  function moveDown(idx: number) {
    if (idx === diagnoses.length - 1) return;
    const arr = [...diagnoses];
    [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
    setDiagnoses(arr);
  }

  const handleSubmit = useCallback(async () => {
    if (diagnoses.length === 0 || submitting) return;
    setSubmitting(true);

    const timeSpent = Math.round((Date.now() - startTime) / 1000);

    try {
      const result = await submitAssessment({
        caseId,
        userDifferential: diagnoses.map((d) => ({ diagnosis: d.diagnosis })),
        userNotToMiss: diagnoses.filter((d) => d.isNotToMiss).map((d) => d.diagnosis),
        confidenceLevel: confidence,
        timeSpent,
      });

      router.push(`/feedback/${result.assessment.id}`);
    } catch (err) {
      console.error('Submit error:', err);
      setSubmitting(false);
    }
  }, [diagnoses, submitting, startTime, caseId, confidence, router]);

  const filteredSuggestions = SUGGESTED_DIAGNOSES.filter(
    (s) =>
      s.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !diagnoses.some((d) => d.diagnosis === s)
  );

  const confidenceLabels = ['Very Low', 'Low', 'Moderate', 'High', 'Very High'];

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      {/* Timer */}
      <div className={`flex items-center justify-between p-3 rounded-lg ${
        timeLeft < 60 ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
      }`}>
        <div className="flex items-center gap-2">
          <Clock size={16} />
          <span className="text-sm font-medium">Time Remaining</span>
        </div>
        <span className="font-mono font-bold text-lg">{formatTime(timeLeft)}</span>
      </div>

      {/* Search & Add */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Add Diagnoses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Search diagnoses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchTerm.trim()) {
                addDiagnosis(searchTerm.trim());
              }
            }}
          />
          {searchTerm && (
            <div className="flex flex-wrap gap-2">
              {filteredSuggestions.slice(0, 8).map((s) => (
                <Badge
                  key={s}
                  variant="outline"
                  className="cursor-pointer hover:bg-green-50"
                  onClick={() => addDiagnosis(s)}
                >
                  + {s}
                </Badge>
              ))}
              {searchTerm && !filteredSuggestions.includes(searchTerm) && (
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-blue-50 border-dashed"
                  onClick={() => addDiagnosis(searchTerm.trim())}
                >
                  + &quot;{searchTerm.trim()}&quot;
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diagnosis List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">
            Your Differential ({diagnoses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {diagnoses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Search and add diagnoses above, ranked by likelihood
            </p>
          ) : (
            <div className="space-y-2">
              {diagnoses.map((dx, idx) => (
                <div
                  key={dx.id}
                  className="flex items-center gap-2 p-2 rounded-lg border bg-white hover:shadow-sm transition"
                >
                  <div className="w-7 h-7 rounded-full bg-kenya-green text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <span className="flex-1 text-sm font-medium">{dx.diagnosis}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => moveUp(idx)} className="p-1 hover:bg-gray-100 rounded" aria-label="Move up">
                      <ChevronUp size={14} />
                    </button>
                    <button onClick={() => moveDown(idx)} className="p-1 hover:bg-gray-100 rounded" aria-label="Move down">
                      <ChevronDown size={14} />
                    </button>
                    <button
                      onClick={() => toggleNotToMiss(dx.id)}
                      className={`p-1 rounded ${dx.isNotToMiss ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100 text-gray-400'}`}
                      aria-label="Flag as not-to-miss"
                    >
                      <Flag size={14} />
                    </button>
                    <button onClick={() => removeDiagnosis(dx.id)} className="p-1 hover:bg-gray-100 rounded text-gray-400" aria-label="Remove">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confidence */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Confidence Level</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Slider
            value={[confidence]}
            onValueChange={([v]) => setConfidence(v)}
            min={1}
            max={5}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Low</span>
            <span className="font-medium kenya-green">
              {confidenceLabels[confidence - 1]}
            </span>
            <span>High</span>
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        className="w-full bg-kenya-green hover:opacity-90"
        size="lg"
        disabled={diagnoses.length === 0 || submitting}
      >
        {submitting ? 'Submitting...' : 'Submit Differential Diagnosis'}
      </Button>
    </div>
  );
}
