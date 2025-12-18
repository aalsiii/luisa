import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
    console.log("Upload API called");

    // DEBUG: Check environment variables
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    console.log("Env Check:", {
        cloudName: cloudName ? "Present" : "MISSING",
        apiKey: apiKey ? "Present" : "MISSING",
        apiSecret: apiSecret ? "Present" : "MISSING"
    });

    if (!cloudName || !apiKey || !apiSecret) {
        console.error("CRITICAL: Missing Cloudinary Environment Variables");
        return NextResponse.json(
            { error: 'Server configuration error: Missing Cloudinary credentials' },
            { status: 500 }
        );
    }

    try {
        const formData = await req.formData();
        const file = formData.get('file') as Blob | null;
        console.log("File received:", file ? "Yes" : "No");

        if (!file) {
            return NextResponse.json(
                { error: 'No file uploaded' },
                { status: 400 }
            );
        }

        // DEBUG: Check file size
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        console.log(`File size: ${buffer.length} bytes (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);

        console.log("Starting Cloudinary upload...");
        const uploadResponse = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'luisa_portfolio' },
                (error, result) => {
                    if (error) {
                        console.error("Cloudinary Upload Error Details:", JSON.stringify(error, null, 2));
                        reject(error);
                    } else {
                        console.log("Cloudinary success:", result?.secure_url);
                        resolve(result);
                    }
                }
            );
            uploadStream.end(buffer);
        });

        return NextResponse.json({ success: true, data: uploadResponse });
    } catch (error) {
        console.error('General Upload Error:', error);
        return NextResponse.json(
            { error: 'Something went wrong during upload. Check server logs.' },
            { status: 500 }
        );
    }
}
