'use client';

import { usePathname } from 'next/navigation';

const STEPS = [
  { path: '/onboarding/welcome', label: 'Welcome', num: 1 },
  { path: '/onboarding/profile-setup', label: 'Profile', num: 2 },
  { path: '/onboarding/consent', label: 'Consent', num: 3 },
  { path: '/onboarding/complete', label: 'Complete', num: 4 },
];

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentIdx = STEPS.findIndex((s) => pathname.startsWith(s.path));

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((step, i) => (
            <div key={step.path} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  i <= currentIdx
                    ? 'bg-kenya-green text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {i < currentIdx ? '✓' : step.num}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`w-12 sm:w-16 h-0.5 mx-1 ${
                    i < currentIdx ? 'bg-kenya-green' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        {children}
      </div>
    </div>
  );
}
