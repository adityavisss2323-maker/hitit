// app/api/admin/url-preview/route.js
// VULN: SSRF - fetches any URL including internal Vercel metadata
import { NextResponse } from 'next/server';
import fetch from 'node-fetch';
import { getCurrentUser } from '../../../../lib/auth';

export async function POST(request) {
  const user = getCurrentUser(request);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL parameter required' }, { status: 400 });
    }

    // VULN: No URL validation or allowlist
    // Allows: file://, http://169.254.169.254, http://localhost, internal endpoints
    // Example SSRF: http://169.254.169.254/latest/meta-data/
    // Example SSRF: http://localhost:3000/api/internal/secret

    const response = await fetch(url, {
      timeout: 5000,
      headers: {
        // VULN: Forwards internal token in requests
        'X-Internal-Token': process.env.INTERNAL_TOKEN || 'vm_admin_internal_token_xK9pL2mN',
      },
    });

    const contentType = response.headers.get('content-type') || '';
    let content;

    if (contentType.includes('json')) {
      const json = await response.json();
      content = JSON.stringify(json, null, 2);
    } else {
      content = await response.text();
    }

    return NextResponse.json({
      url,
      status: response.status,
      contentType,
      content: content.substring(0, 5000), // Limit response size
    });
  } catch (error) {
    // VULN: Error message may expose internal details
    return NextResponse.json(
      { error: `Fetch error: ${error.message}` },
      { status: 500 }
    );
  }
}
