const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const publicDir = path.join(process.cwd(), 'public');
const files = fs.readdirSync(publicDir);

const unusedFiles = [];

files.forEach(file => {
    // Skip directories
    if (fs.statSync(path.join(publicDir, file)).isDirectory()) return;

    // Skip system files
    if (file.startsWith('.')) return;

    // Search for usage
    // We use git grep or just grep. grep -r is generally available.
    // Exclude .next, node_modules, .git, and the public folder itself
    try {
        // Using grep. -q is quiet (exit 0 if found, 1 if not). -r recursive.
        // We grep in the current directory, excluding specific dirs.
        // Note: Windows powershell might be tricky with grep if not installed, but the agent environment usually has it or git grep.
        // Let's use 'git grep' if available, otherwise 'findstr' on windows or simple JS recursion.
        // JS recursion is safest across environments if we don't know the shell tools well.

        const count = grepInDir(process.cwd(), file);
        if (count === 0) {
            unusedFiles.push(file);
        }
    } catch (e) {
        console.error(`Error checking ${file}:`, e);
    }
});

// Filter out Next.js magic files
const magicFiles = [
    'favicon.ico', 'favicon.jpg', 'favicon.png',
    'icon.png', 'icon.svg',
    'apple-icon.png', 'apple-icon.jpg',
    'opengraph-image.jpg', 'opengraph-image.png',
    'twitter-image.jpg', 'twitter-image.png',
    'robots.txt', 'sitemap.xml', 'manifest.json'
];

// Also allow icon-dark, icon-light etc
const filteredUnused = unusedFiles.filter(f => {
    if (magicFiles.includes(f)) return false;
    if (f.startsWith('icon-') || f.startsWith('apple-icon-')) return false;
    return true;
});

fs.writeFileSync('unused-list.json', JSON.stringify(filteredUnused, null, 2));
console.log('Done writing unused-list.json');

function grepInDir(dir, term) {
    let count = 0;
    const items = fs.readdirSync(dir);

    for (const item of items) {
        // Excludes
        if (['node_modules', '.next', '.git', 'public', '.gemini'].includes(item)) continue;
        if (item === 'check-unused-images.js') continue; // Skip self

        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            count += grepInDir(fullPath, term);
        } else {
            // Read file content
            try {
                const content = fs.readFileSync(fullPath, 'utf8');
                if (content.includes(term)) {
                    count++;
                    // Optimization: return immediately if we just want to know if it exists
                    return 1;
                }
            } catch (err) {
                // Ignore binary read errors etc
            }
        }
        if (count > 0) return count;
    }
    return count;
}
