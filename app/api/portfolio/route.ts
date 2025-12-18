import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PortfolioItem, { IPortfolioItem } from '@/models/PortfolioItem';

export async function GET() {
    await dbConnect();
    try {
        const items = await PortfolioItem.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: items });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch items' }, { status: 400 });
    }
}

export async function POST(req: Request) {
    console.log("Portfolio POST called");
    await dbConnect();
    try {
        const body: IPortfolioItem = await req.json();
        console.log("Creating item:", body);
        const item = await PortfolioItem.create(body);
        console.log("Item created");
        return NextResponse.json({ success: true, data: item }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to create item' }, { status: 400 });
    }
}

export async function DELETE(req: Request) {
    await dbConnect();
    try {
        const { searchParams } = new URL(req.url); // Use URL API directly
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
        }

        const deletedItem = await PortfolioItem.findByIdAndDelete(id);

        if (!deletedItem) {
            return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: deletedItem });

    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to delete item' }, { status: 400 });
    }
}
