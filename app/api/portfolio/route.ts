import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'luisa_portfolio/',
      max_results: 500,
      context: true,
      tags: true,
    });

    const items = (result.resources || [])
      .map((resource: any) => ({
        _id: resource.public_id,
        src: resource.secure_url,
        category: resource.tags?.[0] || resource.context?.custom?.category || 'Family',
        location: resource.context?.custom?.location || 'Studio Session',
        createdAt: resource.created_at,
        width: resource.width,
        height: resource.height,
      }))
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, data: items });
  } catch (error: any) {
    console.error('Failed to fetch from Cloudinary:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    }

    const result = await cloudinary.uploader.destroy(id);

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
