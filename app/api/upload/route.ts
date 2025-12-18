import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
    console.log("Upload API called");
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

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        console.log("Starting Cloudinary upload...");
        const uploadResponse = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'luisa_portfolio' },
                (error, result) => {
                    if (error) {
                        console.error("Cloudinary error:", error);
                        reject(error);
                    } else {
                        console.log("Cloudinary success");
                        resolve(result);
                    }
                }
            );
            uploadStream.end(buffer);
        });

        return NextResponse.json({ success: true, data: uploadResponse });
    } catch (error) {
        console.error('Upload Error:', error);
        return NextResponse.json(
            { error: 'Something went wrong during upload' },
            { status: 500 }
        );
    }
}
