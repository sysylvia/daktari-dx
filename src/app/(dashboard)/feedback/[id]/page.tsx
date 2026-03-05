import { createClient } from '@/lib/supabase/server';
import { FeedbackClient } from '@/components/feedback/feedback-client';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function FeedbackPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: assessment } = await supabase
    .from('assessments')
    .select('*, cases(*)')
    .eq('id', id)
    .single();

  if (!assessment) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-bold">Assessment not found</h2>
      </div>
    );
  }

  return <FeedbackClient assessment={assessment} />;
}
