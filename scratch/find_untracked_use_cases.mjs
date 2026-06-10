import fs from 'fs';
import path from 'path';

const modulesDir = '/Users/jon/DEV/repos/fabra/src/modules';

function findUseCases(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      findUseCases(filePath, fileList);
    } else if (file.endsWith('.use-case.ts')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const useCases = findUseCases(modulesDir);
const untracked = [];

for (const file of useCases) {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('async execute') || content.includes('execute(')) {
    // Check if it calls any tracking recording logic
    const hasTracking = 
      content.includes('tracker.record') || 
      content.includes('.record(') ||
      content.includes('recordReceivedFeedbackEvent') ||
      content.includes('recordCommitmentEvent') ||
      content.includes('recordFeedbackEvent');
      
    if (!hasTracking) {
      untracked.push(file);
    }
  }
}

console.log('\nUse cases not recording events:');
for (const file of untracked) {
  console.log(`- ${path.relative(modulesDir, file)}`);
}
