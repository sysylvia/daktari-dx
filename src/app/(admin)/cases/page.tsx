import { getCases } from '@/lib/cases/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const DOMAIN_EMOJI: Record<string, string> = {
  respiratory: '🫁', infectious: '🦠', pediatric: '🧒',
  maternal: '👶', ncds: '💗', emergency: '🚨',
};

export default async function AdminCasesPage() {
  const cases = await getCases();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Clinical Cases ({cases?.length || 0})</h1>
      </div>

      <div className="grid gap-3">
        {cases?.map((c) => (
          <Card key={c.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{DOMAIN_EMOJI[c.domain] || '📋'}</span>
                  <div>
                    <h3 className="font-medium">{c.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      Difficulty: {c.difficulty} | Discrimination: {c.discrimination}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="capitalize">{c.domain}</Badge>
                  <Badge variant={c.is_active ? 'default' : 'secondary'}>
                    {c.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
