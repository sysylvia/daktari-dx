/**
 * Seed test users for development/staging.
 *
 * Usage:
 *   npx tsx scripts/seed-test-users.ts
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TEST_USERS = [
  {
    email: 'pilot-001@daktari-dx.test',
    password: 'test-pilot-001',
    participant_code: 'CFK-001',
    display_name: 'Test Clinician 1',
    profession: 'clinical_officer',
    facility: 'Kibera Health Centre',
    region: 'Kibera',
    years_experience: 5,
  },
  {
    email: 'pilot-002@daktari-dx.test',
    password: 'test-pilot-002',
    participant_code: 'CFK-002',
    display_name: 'Test Clinician 2',
    profession: 'physician',
    facility: 'Kibera South Health Centre',
    region: 'Kibera',
    years_experience: 8,
  },
  {
    email: 'admin@daktari-dx.test',
    password: 'test-admin-001',
    participant_code: 'CFK-ADMIN',
    display_name: 'Admin User',
    profession: 'physician',
    facility: 'CFK Africa',
    region: 'Nairobi',
    years_experience: 10,
  },
];

async function seedUsers() {
  for (const user of TEST_USERS) {
    const { email, password, ...profileData } = user;

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      if (authError.message.includes('already been registered')) {
        console.log(`  Skipping ${email} (already exists)`);
        continue;
      }
      console.error(`  Failed to create ${email}:`, authError.message);
      continue;
    }

    const userId = authData.user.id;

    // Update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        ...profileData,
        onboarding_completed: true,
        consent_given_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (profileError) {
      console.error(`  Failed to update profile for ${email}:`, profileError.message);
    } else {
      console.log(`  Created ${email} (${profileData.participant_code})`);
    }
  }

  // Set admin role
  const { data: adminUser } = await supabase
    .from('profiles')
    .select('id')
    .eq('participant_code', 'CFK-ADMIN')
    .single();

  if (adminUser) {
    await supabase.auth.admin.updateUserById(adminUser.id, {
      app_metadata: { role: 'admin' },
    });
    console.log('  Set admin role for CFK-ADMIN');
  }

  console.log('\nDone. Test credentials:');
  for (const user of TEST_USERS) {
    console.log(`  ${user.participant_code}: ${user.email} / ${user.password}`);
  }
}

seedUsers().catch(console.error);
