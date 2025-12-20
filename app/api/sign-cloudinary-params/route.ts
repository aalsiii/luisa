import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { paramsToSign } = body;

        // Generate timestamp on server to avoid client clock skew issues
        const timestamp = Math.round((new Date()).getTime() / 1000);

        // Merge timestamp into params to sign
        const paramsWithTimestamp = {
            ...paramsToSign,
            timestamp
        };

        const signature = cloudinary.utils.api_sign_request(paramsWithTimestamp, process.env.CLOUDINARY_API_SECRET as string);

        return NextResponse.json({
            signature,
            timestamp, // Return timestamp so client can use it
            apiKey: process.env.CLOUDINARY_API_KEY,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME
        });
    } catch (error) {
        console.error("Signing error:", error);
        return NextResponse.json({ error: "Failed to sign request" }, { status: 500 });
    }
}
