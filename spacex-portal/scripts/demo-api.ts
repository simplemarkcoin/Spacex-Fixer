/**
 * Demo Script: Test API Functions
 * 
 * This script demonstrates the full API workflow:
 * 1. Create 5 dummy members
 * 2. Delete 2 of them
 * 3. Update 2 of them
 * 4. List all remaining members
 * 
 * Run: npx ts-node scripts/demo-api.ts
 */

import { supabase } from '@/lib/supabase';
import {
  createMember,
  deleteMember,
  updateMember,
  listMembers,
  isSuccess,
} from '@/lib/api/members';

async function runDemo() {
  console.log('='.repeat(80));
  console.log('API DEMO: Create, Delete, Update Members');
  console.log('='.repeat(80));

  try {
    // ========================================================================
    // STEP 1: Create 5 dummy members
    // ========================================================================
    console.log('\n📝 STEP 1: Creating 5 dummy members...\n');

    const dummyMembers = [
      {
        email: 'demo1@example.com',
        name: 'Demo User One',
        tier: 'Explorer' as const,
        status: 'ACTIVE' as const,
        title: 'Test Engineer',
        location: 'Demo City, ST',
      },
      {
        email: 'demo2@example.com',
        name: 'Demo User Two',
        tier: 'Pioneer' as const,
        status: 'ACTIVE' as const,
        title: 'Demo Developer',
        location: 'Test Valley, CA',
      },
      {
        email: 'demo3@example.com',
        name: 'Demo User Three',
        tier: 'Vanguard' as const,
        status: 'PENDING' as const,
        title: 'Demo Manager',
        location: 'Sandbox, TX',
      },
      {
        email: 'demo4@example.com',
        name: 'Demo User Four',
        tier: 'Pioneer' as const,
        status: 'ACTIVE' as const,
        title: 'Demo Analyst',
        location: 'Test Lab, NY',
      },
      {
        email: 'demo5@example.com',
        name: 'Demo User Five',
        tier: 'Explorer' as const,
        status: 'SUSPENDED' as const,
        title: 'Demo Intern',
        location: 'Demo HQ, CA',
      },
    ];

    const createdIds: string[] = [];

    for (const member of dummyMembers) {
      const result = await createMember(member);
      if (isSuccess(result)) {
        const memberId = result.data.id;
        createdIds.push(memberId);
        console.log(`✅ Created: ${member.name} (${member.email}) - ID: ${memberId}`);
      } else {
        console.log(`❌ Failed to create ${member.name}: ${result.error.message}`);
      }
    }

    console.log(`\n✓ Total created: ${createdIds.length} members`);

    // ========================================================================
    // STEP 2: List all members (before deletions)
    // ========================================================================
    console.log('\n📋 STEP 2: Listing all members (before deletions)...\n');

    const listResult = await listMembers();
    if (isSuccess(listResult)) {
      console.log(`Total members in database: ${listResult.data.length}`);
      listResult.data.forEach((m) => {
        console.log(`  • ${m.name} (${m.email}) - ${m.status}`);
      });
    }

    // ========================================================================
    // STEP 3: Delete 2 members
    // ========================================================================
    if (createdIds.length >= 2) {
      console.log('\n🗑️  STEP 3: Deleting 2 members...\n');

      const toDelete = createdIds.slice(0, 2);

      for (const id of toDelete) {
        const result = await deleteMember(id);
        if (isSuccess(result)) {
          console.log(`✅ Deleted member ID: ${id}`);
        } else {
          console.log(`❌ Failed to delete ${id}: ${result.error.message}`);
        }
      }

      console.log(`\n✓ Total deleted: 2 members`);
    }

    // ========================================================================
    // STEP 4: Update 2 members
    // ========================================================================
    if (createdIds.length >= 4) {
      console.log('\n✏️  STEP 4: Updating 2 members...\n');

      const toUpdate = [
        {
          id: createdIds[2],
          updates: {
            name: 'Updated Demo User Three',
            tier: 'Explorer' as const,
            status: 'ACTIVE' as const,
            title: 'Updated Manager',
          },
        },
        {
          id: createdIds[3],
          updates: {
            name: 'Updated Demo User Four',
            title: 'Senior Demo Analyst',
            location: 'San Francisco, CA',
          },
        },
      ];

      for (const { id, updates } of toUpdate) {
        const result = await updateMember(id, updates);
        if (isSuccess(result)) {
          console.log(`✅ Updated member ID: ${id}`);
          console.log(`   Name: ${updates.name || 'unchanged'}`);
          console.log(`   Title: ${updates.title || 'unchanged'}`);
          console.log(`   Status: ${updates.status || 'unchanged'}`);
        } else {
          console.log(`❌ Failed to update ${id}: ${result.error.message}`);
        }
      }

      console.log(`\n✓ Total updated: 2 members`);
    }

    // ========================================================================
    // STEP 5: Final list (after deletions and updates)
    // ========================================================================
    console.log('\n📋 STEP 5: Final member list (after changes)...\n');

    const finalListResult = await listMembers();
    if (isSuccess(finalListResult)) {
      console.log(`Total members in database: ${finalListResult.data.length}`);
      console.log('\nAll members:');
      finalListResult.data.forEach((m) => {
        const isDemoUser = m.email.startsWith('demo');
        const marker = isDemoUser ? '★' : '•';
        console.log(`  ${marker} ${m.name} (${m.email}) - ${m.status} [${m.tier}]`);
      });
      console.log('\n(★ = demo user, • = original member)');
    }

    // ========================================================================
    // SUMMARY
    // ========================================================================
    console.log('\n' + '='.repeat(80));
    console.log('DEMO SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Created: 5 dummy members`);
    console.log(`✅ Deleted: 2 members`);
    console.log(`✅ Updated: 2 members`);
    console.log(`✅ Remaining demo members: ${createdIds.length - 2}`);
    console.log('='.repeat(80));
    console.log('\n✨ API Demo Complete!\n');

  } catch (error) {
    console.error('\n❌ Demo Error:', error);
    process.exit(1);
  }
}

// Run the demo
runDemo();
