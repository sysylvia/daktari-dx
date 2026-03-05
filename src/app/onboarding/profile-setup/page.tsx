'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateProfile } from '@/lib/auth/actions';

const PROFESSIONS = [
  { value: 'physician', label: 'Physician' },
  { value: 'clinical_officer', label: 'Clinical Officer' },
  { value: 'nurse', label: 'Nurse' },
  { value: 'other', label: 'Other' },
];

export default function ProfileSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    display_name: '',
    profession: '',
    facility: '',
    years_experience: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    await updateProfile({
      display_name: form.display_name,
      profession: form.profession,
      facility: form.facility,
      years_experience: form.years_experience ? parseInt(form.years_experience) : null,
    });

    router.push('/onboarding/consent');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Professional Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              placeholder="How should we call you?"
              value={form.display_name}
              onChange={(e) => setForm({ ...form, display_name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Profession</Label>
            <div className="grid grid-cols-2 gap-2">
              {PROFESSIONS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setForm({ ...form, profession: p.value })}
                  className={`p-3 rounded-lg border text-sm font-medium transition ${
                    form.profession === p.value
                      ? 'border-[var(--kenya-green)] bg-green-50 kenya-green'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="facility">Health Facility</Label>
            <Input
              id="facility"
              placeholder="e.g., Kibera South Health Centre"
              value={form.facility}
              onChange={(e) => setForm({ ...form, facility: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="years">Years of Experience</Label>
            <Input
              id="years"
              type="number"
              min="0"
              max="50"
              placeholder="e.g., 5"
              value={form.years_experience}
              onChange={(e) => setForm({ ...form, years_experience: e.target.value })}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-kenya-green hover:opacity-90"
            disabled={loading || !form.profession}
          >
            {loading ? 'Saving...' : 'Continue'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
