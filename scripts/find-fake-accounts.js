const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('../lib/utils/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'drafted-6c302'
});

const db = admin.firestore();

async function findFakeAccounts() {
  console.log('Querying drafted-accounts collection...\n');

  const accountsToRemove = [];

  try {
    const snapshot = await db.collection('drafted-accounts').get();

    console.log(`Total accounts found: ${snapshot.size}\n`);

    snapshot.forEach(doc => {
      const data = doc.data();
      const accountId = doc.id;

      // Check for fake accounts based on criteria
      let reason = '';
      let shouldRemove = false;

      // 1. Check for video duration < 10 seconds
      if (data.videoDuration && data.videoDuration < 10) {
        reason = `Video duration too short (${data.videoDuration}s)`;
        shouldRemove = true;
      }

      // 2. Check for Rodrigo Pecchio (except pecchio@alumni.usc.edu)
      if (data.name && data.name.toLowerCase().includes('rodrigo pecchio')) {
        if (data.email !== 'pecchio@alumni.usc.edu') {
          reason = 'Rodrigo Pecchio account (not alumni)';
          shouldRemove = true;
        }
      }

      // 3. Check for Andrew Kozlovski
      if (data.name && data.name.toLowerCase().includes('andrew kozlovski')) {
        reason = 'Andrew Kozlovski account';
        shouldRemove = true;
      }

      if (shouldRemove) {
        accountsToRemove.push({
          id: accountId,
          email: data.email || 'N/A',
          name: data.name || 'N/A',
          videoDuration: data.videoDuration || 'N/A',
          createdAt: data.createdAt?.toDate?.()?.toISOString() || 'N/A',
          reason: reason
        });
      }
    });

    // Sort by reason, then by name
    accountsToRemove.sort((a, b) => {
      if (a.reason !== b.reason) return a.reason.localeCompare(b.reason);
      return a.name.localeCompare(b.name);
    });

    console.log(`Found ${accountsToRemove.length} accounts to remove:\n`);

    // Create CSV content
    const csvHeaders = 'ID,Email,Name,Video Duration,Created At,Reason\n';
    const csvRows = accountsToRemove.map(account => {
      return `"${account.id}","${account.email}","${account.name}","${account.videoDuration}","${account.createdAt}","${account.reason}"`;
    }).join('\n');

    const csvContent = csvHeaders + csvRows;

    // Save to CSV file
    const csvPath = path.join(__dirname, '..', 'fake-accounts-to-remove.csv');
    fs.writeFileSync(csvPath, csvContent, 'utf8');

    console.log(`✓ Saved ${accountsToRemove.length} accounts to: fake-accounts-to-remove.csv\n`);

    // Display summary by reason
    const reasonCounts = {};
    accountsToRemove.forEach(account => {
      reasonCounts[account.reason] = (reasonCounts[account.reason] || 0) + 1;
    });

    console.log('Summary by reason:');
    Object.entries(reasonCounts).forEach(([reason, count]) => {
      console.log(`  - ${reason}: ${count} accounts`);
    });

    console.log('\nFirst 10 accounts:');
    accountsToRemove.slice(0, 10).forEach((account, index) => {
      console.log(`  ${index + 1}. ${account.name} (${account.email}) - ${account.reason}`);
    });

  } catch (error) {
    console.error('Error querying accounts:', error);
    process.exit(1);
  }
}

findFakeAccounts()
  .then(() => {
    console.log('\n✓ Done!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
