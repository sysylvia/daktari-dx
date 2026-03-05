'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { signInWithCode, signInWithEmail } from '@/lib/auth/actions';

export default function LoginPage() {
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCodeLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const result = await signInWithCode(code);
    if (result.error) {
      setError(result.error);
    } else if (result.email) {
      setMessage(`Magic link sent to ${result.email}. Check your email to sign in.`);
    }
    setLoading(false);
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signInWithEmail(email, password);
    if (result?.error) {
      setError(result.error);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex items-center gap-2">
            <span className="text-3xl">🩺</span>
            <CardTitle className="text-2xl font-bold kenya-green">Daktari Dx</CardTitle>
          </div>
          <CardDescription>
            Clinical Diagnostic Training for Healthcare Workers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="code" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="code">Participant Code</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
            </TabsList>

            <TabsContent value="code">
              <form onSubmit={handleCodeLogin} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Participant Code</Label>
                  <Input
                    id="code"
                    placeholder="Enter your code (e.g., CFK-001)"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="text-center text-lg tracking-widest uppercase"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the code provided at your onboarding session
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-kenya-green hover:opacity-90"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="email">
              <form onSubmit={handleEmailLogin} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-kenya-green hover:opacity-90"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {error && (
            <p className="mt-4 text-sm text-center text-red-600 bg-red-50 p-2 rounded">{error}</p>
          )}
          {message && (
            <p className="mt-4 text-sm text-center text-green-700 bg-green-50 p-2 rounded">{message}</p>
          )}

          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p>A project by CFK Africa &amp; CollectiveGood</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
