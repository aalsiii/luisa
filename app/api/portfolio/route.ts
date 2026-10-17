import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import {
  getPortfolioOrder,
  savePortfolioOrder,
  applyPortfolioOrder,
  ensureCloudinaryConfig,
} from '@/lib/portfolio-order';

ensureCloudinaryConfig();

export const dynamic = 'force-dynamic';

export async function GET() {
  ensureCloudinaryConfig();
  try {
    // Fetch photos and saved order concurrently
    const [result, order] = await Promise.all([
      cloudinary.api.resources({
        type: 'upload',
        prefix: 'luisa_portfolio/',
        max_results: 500,
        context: true,
        tags: true,
      }),
      getPortfolioOrder(),
    ]);

    const rawItems = (result.resources || []).map((resource: any) => ({
      _id: resource.public_id,
      src: resource.secure_url,
      category: resource.tags?.[0] || resource.context?.custom?.category || 'Family',
      location: resource.context?.custom?.location || 'Studio Session',
      createdAt: resource.created_at,
      width: resource.width,
      height: resource.height,
    }));

    // Apply custom order chosen by the admin
    const orderedItems = applyPortfolioOrder(rawItems, order);

    return NextResponse.json({
      success: true,
      data: orderedItems,
      order,
    });
  } catch (error: any) {
    console.error('Failed to fetch from Cloudinary:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
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
      message: 'Portfolio display order saved successfully',
      order: orderedIds,
    });
  } catch (error: any) {
    console.error('Failed to save portfolio order:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save order' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  ensureCloudinaryConfig();
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    }

    const result = await cloudinary.uploader.destroy(id);

    // Clean up deleted photo ID from stored order
    try {
      const currentOrder = await getPortfolioOrder();
      if (currentOrder.includes(id)) {
        const updatedOrder = currentOrder.filter((item) => item !== id);
        await savePortfolioOrder(updatedOrder);
      }
    } catch (orderErr) {
      console.warn('Could not clean order on delete:', orderErr);
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Failed to delete from Cloudinary:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete item' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  ensureCloudinaryConfig();
  try {
    const body = await req.json();
    const { id, category, location } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing photo id' }, { status: 400 });
    }

    const cleanCategory = (category || 'Family').trim();
    const cleanLocation = (location !== undefined ? location : 'Studio Session').trim() || 'Studio Session';

    // Update tags and context metadata on Cloudinary
    const result = await cloudinary.uploader.explicit(id, {
      type: 'upload',
      tags: [cleanCategory],
      context: `category=${cleanCategory}|location=${cleanLocation}`,
    });

    return NextResponse.json({
      success: true,
      data: {
        _id: id,
        category: cleanCategory,
        location: cleanLocation,
        tags: result.tags,
        context: result.context,
      },
    });
  } catch (error: any) {
    console.error('Failed to update in Cloudinary:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update photo' },
      { status: 500 }
    );
  }
}
