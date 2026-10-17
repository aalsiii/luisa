import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';

export function ensureCloudinaryConfig() {
  if (!process.env.CLOUDINARY_API_KEY) {
    try {
      const envPath = path.join(process.cwd(), '.env.local');
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        content.split('\n').forEach((line) => {
          const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
          if (match) {
            let value = match[2] || '';
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            process.env[match[1]] = value.trim();
          }
        });
      }
    } catch (e) {
      // Ignore
    }
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const ORDER_FILE_PATH = path.join(process.cwd(), 'data', 'portfolio-order.json');
const CLOUDINARY_ORDER_PUBLIC_ID = 'luisa_portfolio_config/order.json';

// In-memory fallback if file system is read-only in serverless
let memoryOrderCache: string[] | null = null;

function readLocalOrder(): string[] | null {
  try {
    if (fs.existsSync(ORDER_FILE_PATH)) {
      const content = fs.readFileSync(ORDER_FILE_PATH, 'utf-8');
      const data = JSON.parse(content);
      if (Array.isArray(data?.order)) {
        return data.order;
      }
    }
  } catch (err) {
    console.warn('Failed to read local order file:', err);
  }
  return memoryOrderCache;
}

function writeLocalOrder(order: string[]) {
  memoryOrderCache = order;
  try {
    const dir = path.dirname(ORDER_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(ORDER_FILE_PATH, JSON.stringify({ order, updatedAt: new Date().toISOString() }, null, 2));
  } catch (err) {
    console.warn('Failed to write local order file:', err);
  }
}

/**
 * Fetch the ordered list of photo IDs from Cloudinary with local fallback
 */
export async function getPortfolioOrder(): Promise<string[]> {
  ensureCloudinaryConfig();
  try {
    // Attempt to fetch from Cloudinary
    const resource = await cloudinary.api.resource(CLOUDINARY_ORDER_PUBLIC_ID, {
      resource_type: 'raw',
    });

    if (resource?.secure_url) {
      // Append timestamp query parameter to bypass CDN edge cache
      const fetchUrl = `${resource.secure_url}?t=${Date.now()}`;
      const res = await fetch(fetchUrl, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.order)) {
          writeLocalOrder(data.order);
          return data.order;
        }
      }
    }
  } catch (err: any) {
    // Cloudinary raw file might not exist yet if not saved previously
    // Fallback to local file or memory
  }

  const local = readLocalOrder();
  return local || [];
}

/**
 * Save the ordered list of photo IDs to Cloudinary and local disk
 */
export async function savePortfolioOrder(orderedIds: string[]): Promise<boolean> {
  ensureCloudinaryConfig();
  const cleanOrder = Array.from(new Set(orderedIds.filter(Boolean)));
  writeLocalOrder(cleanOrder);

  try {
    const payload = JSON.stringify({
      order: cleanOrder,
      updatedAt: new Date().toISOString(),
    });

    const base64Data = Buffer.from(payload).toString('base64');
    await cloudinary.uploader.upload(`data:application/json;base64,${base64Data}`, {
      resource_type: 'raw',
      public_id: CLOUDINARY_ORDER_PUBLIC_ID,
      overwrite: true,
      invalidate: true,
    });

    return true;
  } catch (err) {
    console.error('Failed to save portfolio order to Cloudinary:', err);
    // Even if Cloudinary fails, local/memory order was updated
    return true;
  }
}

/**
 * Sorts an array of items according to the saved order.
 * Items present in the order array appear first in that exact sequence.
 * New items not yet in the order appear at the top sorted by createdAt descending.
 */
export function applyPortfolioOrder<T extends { _id: string; createdAt?: string }>(
  items: T[],
  order: string[]
): T[] {
  if (!order || order.length === 0) {
    return [...items].sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  const orderMap = new Map<string, number>();
  order.forEach((id, index) => {
    orderMap.set(id, index);
  });

  const orderedItems: T[] = [];
  const unrankedItems: T[] = [];

  for (const item of items) {
    if (orderMap.has(item._id)) {
      orderedItems.push(item);
    } else {
      unrankedItems.push(item);
    }
  }

  // Sort ranked items by their index in orderMap
  orderedItems.sort((a, b) => (orderMap.get(a._id) ?? 0) - (orderMap.get(b._id) ?? 0));

  // Sort unranked items by createdAt descending (newest first)
  unrankedItems.sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );

  // Unranked (newly uploaded) items go to the front so admin immediately sees them and can position them
  return [...unrankedItems, ...orderedItems];
}
