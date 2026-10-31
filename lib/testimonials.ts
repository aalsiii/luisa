import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { ensureCloudinaryConfig } from '@/lib/portfolio-order';

export interface TestimonialItem {
  id: string;
  author: string;
  type: string;
  text: string;
  createdAt: string;
  approved?: boolean;
}

export const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'default-1',
    author: 'Akshat',
    type: 'Nada Yoga School, Rishikesh',
    text: "I met Luisa at Nada Yoga School, where she was translating for the Spanish yoga course. When she mentioned she was a professional photographer, it felt perfectly timed because I needed to learn photography for the school’s marketing work. Luisa patiently taught me how to use a professional camera and shared so much practical knowledge about photography. She’s an amazing teacher, very generous with her skills, and truly a great photographer. I’m really grateful for everything I learned from her.",
    createdAt: '2025-01-01T00:00:00.000Z',
    approved: true,
  },
];

const TESTIMONIALS_FILE_PATH = path.join(process.cwd(), 'data', 'testimonials.json');
const CLOUDINARY_TESTIMONIALS_PUBLIC_ID = 'luisa_portfolio_config/testimonials.json';

// In-memory fallback if file system is read-only in serverless
let memoryTestimonialsCache: TestimonialItem[] | null = null;

function readLocalTestimonials(): TestimonialItem[] | null {
  try {
    if (fs.existsSync(TESTIMONIALS_FILE_PATH)) {
      const content = fs.readFileSync(TESTIMONIALS_FILE_PATH, 'utf-8');
      const data = JSON.parse(content);
      if (Array.isArray(data?.testimonials)) {
        return data.testimonials;
      }
    }
  } catch (err) {
    console.warn('Failed to read local testimonials file:', err);
  }
  return memoryTestimonialsCache;
}

function writeLocalTestimonials(testimonials: TestimonialItem[]) {
  memoryTestimonialsCache = testimonials;
  try {
    const dir = path.dirname(TESTIMONIALS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(
      TESTIMONIALS_FILE_PATH,
      JSON.stringify({ testimonials, updatedAt: new Date().toISOString() }, null, 2)
    );
  } catch (err) {
    console.warn('Failed to write local testimonials file:', err);
  }
}

/**
 * Fetch testimonials list from Cloudinary with local/default fallback
 */
export async function getTestimonials(): Promise<TestimonialItem[]> {
  ensureCloudinaryConfig();
  try {
    const resource = await cloudinary.api.resource(CLOUDINARY_TESTIMONIALS_PUBLIC_ID, {
      resource_type: 'raw',
    });

    if (resource?.secure_url) {
      const fetchUrl = `${resource.secure_url}?t=${Date.now()}`;
      const res = await fetch(fetchUrl, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.testimonials)) {
          writeLocalTestimonials(data.testimonials);
          return data.testimonials;
        }
      }
    }
  } catch (err: any) {
    // Cloudinary raw file might not exist yet if not saved previously
  }

  const local = readLocalTestimonials();
  if (local && local.length > 0) {
    return local;
  }

  // First run: save DEFAULT_TESTIMONIALS to Cloudinary and local
  writeLocalTestimonials(DEFAULT_TESTIMONIALS);
  try {
    await saveTestimonials(DEFAULT_TESTIMONIALS);
  } catch (e) {
    // Non-fatal
  }
  return DEFAULT_TESTIMONIALS;
}

/**
 * Save testimonials array to Cloudinary and local disk
 */
export async function saveTestimonials(testimonials: TestimonialItem[]): Promise<boolean> {
  ensureCloudinaryConfig();
  writeLocalTestimonials(testimonials);

  try {
    const payload = JSON.stringify({
      testimonials,
      updatedAt: new Date().toISOString(),
    });

    const base64Data = Buffer.from(payload).toString('base64');
    await cloudinary.uploader.upload(`data:application/json;base64,${base64Data}`, {
      resource_type: 'raw',
      public_id: CLOUDINARY_TESTIMONIALS_PUBLIC_ID,
      overwrite: true,
      invalidate: true,
    });

    return true;
  } catch (err) {
    console.error('Failed to save testimonials to Cloudinary:', err);
    return true;
  }
}

/**
 * Add a new testimonial, save to Cloudinary, and return it
 */
export async function addTestimonial(input: {
  author: string;
  type?: string;
  text: string;
  approved?: boolean;
}): Promise<TestimonialItem> {
  const currentList = await getTestimonials();
  const newItem: TestimonialItem = {
    id: `testim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    author: input.author.trim(),
    type: (input.type || 'Client Experience').trim(),
    text: input.text.trim(),
    createdAt: new Date().toISOString(),
    approved: input.approved !== undefined ? input.approved : true,
  };

  const updatedList = [newItem, ...currentList];
  await saveTestimonials(updatedList);
  return newItem;
}

/**
 * Delete a testimonial by ID
 */
export async function deleteTestimonial(id: string): Promise<boolean> {
  const currentList = await getTestimonials();
  const updatedList = currentList.filter((item) => item.id !== id);
  return await saveTestimonials(updatedList);
}

/**
 * Update an existing testimonial
 */
export async function updateTestimonial(
  id: string,
  updates: Partial<TestimonialItem>
): Promise<TestimonialItem | null> {
  const currentList = await getTestimonials();
  const index = currentList.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const updatedItem: TestimonialItem = {
    ...currentList[index],
    ...updates,
    id: currentList[index].id, // preserve ID
  };

  currentList[index] = updatedItem;
  await saveTestimonials(currentList);
  return updatedItem;
}

