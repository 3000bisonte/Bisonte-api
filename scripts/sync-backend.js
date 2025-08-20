// Simple sync helper: commits and pushes backend-api subrepo
const { execSync } = require('child_process');

function run(cmd) {
  execSync(cmd, { stdio: 'inherit', cwd: process.cwd(), shell: true });
}

try {
  console.log('🔄 Sync backend-api...');
  run('git -C backend-api status');
  // Stage and commit if there are changes
  try {
    run('git -C backend-api add -A');
    run('git -C backend-api diff --cached --quiet || git -C backend-api commit -m "chore(api): sync from app repo"');
  } catch (_) {}
  // Push to its origin (assumes remote already set)
  run('git -C backend-api push');
  console.log('✅ backend-api sincronizado');
} catch (e) {
  console.error('❌ No se pudo sincronizar backend-api:', e.message);
  process.exit(1);
}
