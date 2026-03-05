import { getAdaptiveCase, getCaseById } from '@/lib/cases/actions';
import { ClinicalVignetteClient } from '@/components/cases/clinical-vignette';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CasePage({ params }: Props) {
  const { id } = await params;

  // If id is a domain name, use adaptive selection; otherwise load case by ID
  const isDomain = ['respiratory', 'infectious', 'pediatric', 'maternal', 'ncds', 'emergency'].includes(id);
  const caseData = isDomain ? await getAdaptiveCase(id) : await getCaseById(id);

  if (!caseData) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <span className="text-5xl">✅</span>
        <h2 className="text-xl font-bold mt-4">All Cases Complete!</h2>
        <p className="text-muted-foreground mt-2">
          You&apos;ve completed all available cases in this domain. Check back soon for new cases!
        </p>
      </div>
    );
  }

  return <ClinicalVignetteClient caseData={caseData} />;
}
