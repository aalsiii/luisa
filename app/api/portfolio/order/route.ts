import { NextResponse } from 'next/server';
import { getPortfolioOrder, savePortfolioOrder } from '@/lib/portfolio-order';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const order = await getPortfolioOrder();
    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderedIds } = body;

    if (!Array.isArray(orderedIds)) {
      return NextResponse.json(
        { success: false, error: 'orderedIds must be an array of photo IDs' },
        { status: 400 }
      );
    }

    await savePortfolioOrder(orderedIds);
    return NextResponse.json({
      success: true,
      message: 'Portfolio order saved successfully',
      order: orderedIds,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save order' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  return POST(req);
}
