'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { exportAssessments } from '@/lib/assessments/actions';

export default function ExportPage() {
  const [loading, setLoading] = useState(false);

  async function handleExport(format: 'json' | 'csv') {
    setLoading(true);
    try {
      const data = await exportAssessments(format);

      if (format === 'csv') {
        const blob = new Blob([data as string], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `daktari-dx-export-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `daktari-dx-export-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Are you signed in as an admin?');
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Data Export</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Export Assessments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Download all assessment data for research analysis. Includes participant codes,
            scores, component breakdowns, confidence levels, and timestamps.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={() => handleExport('csv')}
              disabled={loading}
              variant="outline"
            >
              {loading ? 'Exporting...' : 'Download CSV'}
            </Button>
            <Button
              onClick={() => handleExport('json')}
              disabled={loading}
              variant="outline"
            >
              {loading ? 'Exporting...' : 'Download JSON'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
