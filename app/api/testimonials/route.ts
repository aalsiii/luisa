import { NextResponse } from 'next/server';
import {
  getTestimonials,
  saveTestimonials,
  addTestimonial,
  deleteTestimonial,
  updateTestimonial,
} from '@/lib/testimonials';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const showAll = searchParams.get('all') === 'true';

    const allTestimonials = await getTestimonials();

    const data = showAll
      ? allTestimonials
      : allTestimonials.filter((item) => item.approved !== false);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Failed to get testimonials:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch testimonials' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const author = (body.author || body.name || '').trim();
    const type = (body.type || body.context || 'Client Experience').trim();
    const text = (body.text || body.testimonial || '').trim();
    const approved = body.approved !== undefined ? Boolean(body.approved) : true;

    if (!author) {
      return NextResponse.json(
        { success: false, error: 'Please provide your name.' },
        { status: 400 }
      );
    }

    if (!text) {
      return NextResponse.json(
        { success: false, error: 'Please provide a testimonial message.' },
        { status: 400 }
      );
    }

    const newItem = await addTestimonial({
      author,
      type,
      text,
      approved,
    });

    return NextResponse.json({
      success: true,
      data: newItem,
      message: 'Testimonial submitted and saved successfully.',
    });
  } catch (error: any) {
    console.error('Failed to submit testimonial:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit testimonial' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    // Bulk save if an array of testimonials is provided
    if (Array.isArray(body.testimonials)) {
      await saveTestimonials(body.testimonials);
      return NextResponse.json({
        success: true,
        data: body.testimonials,
        message: 'Testimonials updated successfully',
      });
    }

    const { id, author, type, text, approved } = body;
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing testimonial id' },
        { status: 400 }
      );
    }

    const updates: any = {};
    if (author !== undefined) updates.author = String(author).trim();
    if (type !== undefined) updates.type = String(type).trim();
    if (text !== undefined) updates.text = String(text).trim();
    if (approved !== undefined) updates.approved = Boolean(approved);

    const updated = await updateTestimonial(id, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Testimonial not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Testimonial updated successfully',
    });
  } catch (error: any) {
    console.error('Failed to update testimonial:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update testimonial' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await req.json();
        id = body?.id;
      } catch (e) {
        // no body
      }
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing testimonial id' },
        { status: 400 }
      );
    }

    await deleteTestimonial(id);

    return NextResponse.json({
      success: true,
      message: 'Testimonial deleted successfully',
    });
  } catch (error: any) {
    console.error('Failed to delete testimonial:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete testimonial' },
      { status: 500 }
    );
  }
}

