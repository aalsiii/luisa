const fs = require('fs');
const path = require('path');

const unusedFiles = JSON.parse(fs.readFileSync('unused-list.json', 'utf8'));
const publicDir = path.join(process.cwd(), 'public');

let deletedCount = 0;

unusedFiles.forEach(file => {
    // Safety filters
    if (file.includes('logo')) return;
    if (file.includes('placeholder')) return;
    if (file.includes('favicon')) return;
    if (file.includes('icon')) return;

    // Explicitly target the portfolio categories to be sure
    const isTargetCategory =
        file.startsWith('couple-') ||
        file.startsWith('family-') ||
        file.startsWith('lifestyle-') ||
        file.startsWith('pet-') ||
        file.startsWith('solo-') ||
        file.startsWith('cover3');

    if (!isTargetCategory) {
        console.log(`Skipping potential safety risk: ${file}`);
        return;
    }

    const filePath = path.join(publicDir, file);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Deleted: ${file}`);
        deletedCount++;
    }
});

console.log(`Total deleted: ${deletedCount}`);
