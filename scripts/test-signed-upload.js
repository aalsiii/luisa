
const fs = require('fs');
const path = require('path');

async function testSignedUpload() {
    const filePath = path.join(__dirname, '..', 'large-test.jpg');
    if (!fs.existsSync(filePath)) {
        console.error("Test file not found:", filePath);
        return;
    }

    console.log("1. Requesting signature...");
    // timestamp is now generated on server
    const paramsToSign = {
        folder: 'luisa_portfolio'
    };

    try {
        const signRes = await fetch('http://localhost:3000/api/sign-cloudinary-params', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paramsToSign }),
        });

        if (!signRes.ok) {
            console.error("Signature request failed:", await signRes.text());
            return;
        }

        const signData = await signRes.json();
        console.log("Signature received. Cloud Name:", signData.cloudName);
        console.log("Server Timestamp:", signData.timestamp);

        console.log("2. Uploading to Cloudinary...");
        const fileBuffer = fs.readFileSync(filePath);
        const blob = new Blob([fileBuffer], { type: 'image/jpeg' });

        const formData = new FormData();
        formData.append('file', blob, 'large-test.jpg');
        formData.append('api_key', signData.apiKey);
        formData.append('timestamp', signData.timestamp.toString()); // Use server timestamp
        formData.append('signature', signData.signature);
        formData.append('folder', 'luisa_portfolio');

        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!uploadRes.ok) {
            console.error("Cloudinary upload failed:", await uploadRes.text());
            return;
        }

        const uploadData = await uploadRes.json();
        console.log("Upload success! URL:", uploadData.secure_url);

    } catch (err) {
        console.error("Test failed:", err);
    }
}

testSignedUpload();
