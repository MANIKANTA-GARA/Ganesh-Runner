/**
 * Automatic GitHub Repository Creator & Committer for 3D Ganesha Runner
 * Uses GitHub REST API v3 via Node.js native fetch (zero dependencies, works without git.exe)
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans.trim());
  }));
}

async function main() {
  console.log('================================================================');
  console.log('       Connect 3D Ganesha & Shiva Runner to GitHub             ');
  console.log('================================================================\n');

  let token = process.argv[2] || process.env.GITHUB_TOKEN;
  let repoName = process.argv[3] || process.env.GITHUB_REPO || 'ganesh-runner';

  if (!token) {
    console.log('A GitHub Personal Access Token (classic or fine-grained with "repo" scope) is required.');
    console.log('You can generate one in 30 seconds at: https://github.com/settings/tokens\n');
    token = await askQuestion('Enter your GitHub Personal Access Token: ');
  }

  if (!token) {
    console.error('Error: Token cannot be empty. Aborted.');
    process.exit(1);
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'User-Agent': 'Ganesha-Runner-Deployer',
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json'
  };

  async function apiRequest(url, method = 'GET', body = null) {
    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);
    const res = await fetch(url, options);
    const data = await res.json().catch(() => ({}));
    return { status: res.status, ok: res.ok, data };
  }

  // 1. Authenticate user
  console.log('\n[1/4] Verifying GitHub token...');
  const userRes = await apiRequest('https://api.github.com/user');
  if (!userRes.ok) {
    console.error(`Authentication failed (${userRes.status}): ${userRes.data?.message || 'Invalid token'}`);
    process.exit(1);
  }
  const username = userRes.data.login;
  console.log(`  ✓ Authenticated as @${username} (${userRes.data.name || username})`);

  // 2. Check / Create Repository
  console.log(`\n[2/4] Checking repository "${repoName}"...`);
  let repoRes = await apiRequest(`https://api.github.com/repos/${username}/${repoName}`);
  if (repoRes.ok) {
    console.log(`  ✓ Found existing repository: ${repoRes.data.html_url}`);
  } else {
    console.log(`  Creating new repository "https://github.com/${username}/${repoName}"...`);
    repoRes = await apiRequest('https://api.github.com/user/repos', 'POST', {
      name: repoName,
      description: '3D Bal Ganesha & Lord Shiva Endless Runner game with realistic running animation and 3D Motichoor Laddus',
      homepage: `https://${username}.github.io/${repoName}/`,
      private: false,
      auto_init: true
    });

    if (!repoRes.ok) {
      console.error(`Failed to create repository: ${repoRes.data?.message || repoRes.status}`);
      process.exit(1);
    }
    console.log(`  ✓ Created repository: ${repoRes.data.html_url}`);
    // Brief pause to allow GitHub to initialize branch
    await new Promise(r => setTimeout(r, 2000));
  }

  // 3. Scan project files
  console.log('\n[3/4] Scanning project files...');
  const IGNORE_PATTERNS = [
    'node_modules',
    '.git',
    '.system_generated',
    'dist',
    '.DS_Store',
    'Thumbs.db',
    'deploy_to_vercel.js'
  ];

  async function getAllFiles(dir, baseDir = dir) {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
      if (IGNORE_PATTERNS.includes(entry.name)) continue;
      if (entry.name.endsWith('.log')) continue;

      const fullPath = path.join(dir, entry.name);
      const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');

      if (entry.isDirectory()) {
        const sub = await getAllFiles(fullPath, baseDir);
        files.push(...sub);
      } else {
        files.push({ fullPath, relPath });
      }
    }
    return files;
  }

  const allFiles = await getAllFiles(__dirname);
  console.log(`  ✓ Found ${allFiles.length} files to commit and upload.`);

  // 4. Upload files
  console.log('\n[4/4] Uploading files to GitHub...');
  let successCount = 0;
  for (const file of allFiles) {
    const contentBuffer = await fs.promises.readFile(file.fullPath);
    const base64Content = contentBuffer.toString('base64');

    // Check if file already exists to get SHA
    const checkRes = await apiRequest(`https://api.github.com/repos/${username}/${repoName}/contents/${file.relPath}`);
    const sha = checkRes.ok ? checkRes.data.sha : undefined;

    const body = {
      message: `Sync: ${file.relPath}`,
      content: base64Content,
      branch: 'main'
    };
    if (sha) body.sha = sha;

    const putRes = await apiRequest(
      `https://api.github.com/repos/${username}/${repoName}/contents/${file.relPath}`,
      'PUT',
      body
    );

    if (putRes.ok) {
      successCount++;
      console.log(`  ✓ [${successCount}/${allFiles.length}] ${file.relPath}`);
    } else {
      console.warn(`  ✗ Failed: ${file.relPath} - ${putRes.data?.message || putRes.status}`);
    }
  }

  // 5. Try enabling GitHub Pages
  try {
    await apiRequest(`https://api.github.com/repos/${username}/${repoName}/pages`, 'POST', {
      source: {
        branch: 'main',
        path: '/'
      }
    });
  } catch (e) {
    // Pages might need workflow or be enabled already
  }

  console.log('\n================================================================');
  console.log('  🎉 SUCCESS! Your repository is live on GitHub:');
  console.log(`  📂 Repository URL: https://github.com/${username}/${repoName}`);
  console.log(`  🌐 GitHub Pages:  https://${username}.github.io/${repoName}/`);
  console.log('================================================================\n');
}

main().catch(err => {
  console.error('\nUnexpected Error:', err);
  process.exit(1);
});
