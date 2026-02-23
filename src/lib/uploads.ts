import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function saveUploadedImages(files: File[]) {
  const validFiles = files.filter((file) => file.size > 0 && ALLOWED_IMAGE_TYPES.has(file.type));

  if (validFiles.length === 0) {
    return [] as string[];
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');
  await mkdir(uploadDir, { recursive: true });

  const urls: string[] = [];

  for (const file of validFiles) {
    const ext = file.type === 'image/png' ? 'png' : 'jpg';
    const fileName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;
    const filePath = path.join(uploadDir, fileName);
    const bytes = await file.arrayBuffer();

    await writeFile(filePath, Buffer.from(bytes));
    urls.push(`/uploads/products/${fileName}`);
  }

  return urls;
}
