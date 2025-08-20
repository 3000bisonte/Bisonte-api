// Sync helper for api-server subrepo
const { execSync } = require('child_process');

function run(cmd) {
  execSync(cmd, { stdio: 'inherit', cwd: process.cwd(), shell: true });
}

try {
  console.log('🔄 Sync api-server...');
  run('git -C api-server status');
  // Stage and commit if there are changes
  try {
    run('git -C api-server add -A');
    run('git -C api-server diff --cached --quiet || git -C api-server commit -m "chore(api-server): sync from app repo"');
  } catch (_) {}
  // Push to its origin
  run('git -C api-server push');
  console.log('✅ api-server sincronizado');
} catch (e) {
  console.error('❌ No se pudo sincronizar api-server:', e.message);
  process.exit(1);
}
