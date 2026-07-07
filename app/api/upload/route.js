// app/api/upload/route.js
// VULN: No server-side file type validation, allows any file type
import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getCurrentUser } from '../../../lib/auth';

export async function POST(request) {
  const user = getCurrentUser(request);
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const filename = file.name;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // VULN: No server-side file type validation
    // Only client-side check was done - easily bypassed
    // Allows upload of: shell.php.jpg, malware.exe.png, etc.

    // VULN: Double extension bypass
    // If filename is shell.php.jpg, it still gets uploaded

    // Upload to Vercel Blob Storage
    const blob = await put(filename, buffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    // VULN: Flag 8 hint - mention that php files would be served with wrong content type
    const isDoubleExtension = filename.split('.').length > 2;

    return NextResponse.json({
      url: blob.url,
      filename: filename,
      size: file.size,
      contentType: file.type,
      hint: isDoubleExtension
        ? 'FLAG{f4k3_sh3ll_upl04d_byp4ss} - Nice try! Double extension detected but uploaded anyway.'
        : 'File uploaded successfully to Vercel Blob Storage',
    });
  } catch (error) {
    // VULN: Verbose error
    return NextResponse.json({ error: `Upload error: ${error.message}` }, { status: 500 });
  }
}
