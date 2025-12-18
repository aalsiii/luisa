import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';

export async function GET() {
    console.log("Test DB route called");
    try {
        console.log("Attempting dbConnect...");
        await dbConnect();
        console.log("dbConnect success!");
        return NextResponse.json({ success: true, message: "DB Connection Successful" });
    } catch (error: any) {
        console.error("Test DB Connection Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
