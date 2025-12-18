const fs = require('fs');
const path = require('path');

async function testUpload() {
    const filePath = path.join(__dirname, '..', 'public', 'yoga-1.jpg');

    if (!fs.existsSync(filePath)) {
        console.error("Test file not found:", filePath);
        return;
    }

    const fileBuffer = fs.readFileSync(filePath);
    const blob = new Blob([fileBuffer], { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('file', blob, 'test-upload.jpg');

    console.log("Sending upload request...");
    try {
        const res = await fetch('http://localhost:3000/api/upload', {
            method: 'POST',
            body: formData,
        });

        console.log("Response status:", res.status);
        const data = await res.json();
        console.log("Response data:", data);
    } catch (err) {
        console.error("Upload failed:", err);
    }
}

testUpload();
