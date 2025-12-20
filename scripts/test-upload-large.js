
const fs = require('fs');
const path = require('path');

async function testUploadLarge() {
    const filePath = path.join(__dirname, '..', 'large-test.jpg');

    if (!fs.existsSync(filePath)) {
        console.error("Test file not found:", filePath);
        return;
    }

    const stats = fs.statSync(filePath);
    console.log(`Uploading file ${filePath} (${stats.size} bytes)...`);

    const fileBuffer = fs.readFileSync(filePath);
    const blob = new Blob([fileBuffer], { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('file', blob, 'large-test.jpg');

    console.log("Sending upload request...");
    try {
        const res = await fetch('http://localhost:3000/api/upload', {
            method: 'POST',
            body: formData,
        });

        console.log("Response status:", res.status);
        const text = await res.text();
        console.log("Response text:", text);
    } catch (err) {
        console.error("Upload failed details:", err);
    }
}

testUploadLarge();
