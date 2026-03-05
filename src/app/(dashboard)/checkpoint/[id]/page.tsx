'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';

export default function CheckpointPage() {
  const router = useRouter();
  const params = useParams();
  const caseId = params.id as string;

  const [form, setForm] = useState({
    information_gaps: '',
    alternative_diagnoses: '',
    cant_miss_considered: '',
    red_flags: '',
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      await supabase.from('cognitive_checkpoints').insert({
        user_id: user.id,
        case_id: caseId,
        ...form,
      });
    }

    router.push(`/diagnosis/${caseId}`);
  }

  const prompts = [
    {
      key: 'information_gaps',
      icon: '🔍',
      title: 'Information Gaps',
      question: 'What information is missing that would help narrow the diagnosis?',
      placeholder: 'e.g., Lab results, imaging, travel history...',
    },
    {
      key: 'alternative_diagnoses',
      icon: '🔀',
      title: 'Alternative Diagnoses',
      question: 'What diagnoses might you be overlooking?',
      placeholder: 'e.g., Less common conditions, atypical presentations...',
    },
    {
      key: 'cant_miss_considered',
      icon: '⚠️',
      title: "Can't-Miss Diagnoses",
      question: 'What life-threatening conditions must be ruled out?',
      placeholder: 'e.g., Conditions that could be fatal if missed...',
    },
    {
      key: 'red_flags',
      icon: '🚩',
      title: 'Red Flags',
      question: 'What clinical features are most concerning?',
      placeholder: 'e.g., Vital sign abnormalities, danger signs...',
    },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      <div className="text-center mb-6">
        <span className="text-3xl">🧠</span>
        <h1 className="text-xl font-bold mt-2">Cognitive Checkpoint</h1>
        <p className="text-sm text-muted-foreground">
          Before making your diagnosis, pause and think through these questions
        </p>
      </div>

      {prompts.map((prompt) => (
        <Card key={prompt.key}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <span>{prompt.icon}</span>
              {prompt.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">{prompt.question}</p>
            <Textarea
              placeholder={prompt.placeholder}
              value={form[prompt.key as keyof typeof form]}
              onChange={(e) => setForm({ ...form, [prompt.key]: e.target.value })}
              rows={2}
            />
          </CardContent>
        </Card>
      ))}

      <Button
        onClick={handleSubmit}
        className="w-full bg-medical-blue hover:opacity-90"
        size="lg"
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Continue to Differential Diagnosis'}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        These responses are optional but help reduce diagnostic bias
      </p>
    </div>
  );
}
