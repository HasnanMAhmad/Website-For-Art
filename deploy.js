/**
 * MISHIS ARTWORK — Production FTP Deployment Bridge (Node.js)
 * Executes the automated production deployment pipeline.
 */
const { spawn } = require('child_process');
const path = require('path');

console.log('[DEPLOY] Launching Mishis Artwork automated deployment pipeline...');

const pythonProcess = spawn('python', [path.join(__dirname, 'deploy.py')], {
  stdio: 'inherit'
});

pythonProcess.on('error', (err) => {
  console.error('[DEPLOY ERROR] Failed to start deployment process:', err.message);
  console.log('[DEPLOY TIP] You can directly run: python deploy.py');
  process.exit(1);
});

pythonProcess.on('close', (code) => {
  if (code === 0) {
    console.log('[DEPLOY SUCCESS] Pipeline completed successfully.');
    process.exit(0);
  } else {
    console.error(`[DEPLOY FAILED] Deployment exited with code ${code}.`);
    process.exit(code);
  }
});
