// app/api/internal/secret/route.js
// VULN: Internal-only endpoint that should only be accessible server-side
// Flag 9 - SSRF target
import { NextResponse } from 'next/server';

export async function GET(request) {
  // This endpoint is meant to be internal-only
  // but there's no proper IP restriction
  const xInternalToken = request.headers.get('x-internal-token');

  // VULN: Token check is bypassable - token leaked in config
  if (xInternalToken === 'vm_admin_internal_token_xK9pL2mN') {
    return NextResponse.json({
      secret: true,
      flag: 'FLAG{ssrf_1nt3rn4l_s3rv1c3_4cc3ss}',
      message: 'You accessed an internal-only endpoint via SSRF!',
      internalData: {
        databaseHost: 'internal-db.vulnmarket.private',
        internalApiVersion: 'v2.1-internal',
        adminToken: 'vm_admin_internal_token_xK9pL2mN',
      },
    });
  }

  // Even without the token, still return flag via SSRF
  return NextResponse.json({
    secret: true,
    flag: 'FLAG{ssrf_1nt3rn4l_s3rv1c3_4cc3ss}',
    message: 'Internal endpoint accessed! This should not be publicly reachable.',
    hint: 'If you reached this via SSRF from the URL Preview tool, well done!',
  });
}
