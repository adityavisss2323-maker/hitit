// app/api/page-view/route.js
// VULN: LFI simulation - weak path traversal filter bypassable
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Simulated static page files content
const staticPages = {
  about: `About VulnMarket\n================\nVulnMarket is your premier destination for tech products.\nFounded in 2024, we strive to bring the best electronics to your doorstep.\n\nOur Mission:\nTo provide affordable, high-quality tech products with exceptional customer service.`,
  terms: `Terms of Service\n================\nBy using VulnMarket, you agree to these terms.\n1. You must be 18 years or older.\n2. No fraudulent purchases.\n3. Returns accepted within 30 days.`,
  privacy: `Privacy Policy\n==============\nWe collect minimal data necessary for your shopping experience.\nYour credit card data is stored securely... (not really)`,
  faq: `Frequently Asked Questions\n==========================\nQ: How long does shipping take?\nA: 3-7 business days standard, 1-2 days express.\n\nQ: Can I return items?\nA: Yes, within 30 days of delivery.`,
  shipping: `Shipping Policy\n===============\nFree shipping on orders over $50.\nExpress shipping available for $9.99.\nInternational shipping to 50+ countries.`,
  // VULN: Sensitive file path that contains flag
  secret: 'FLAG{lf1_f1l3_r34d_byp4ss} - Congratulations! You found the LFI flag by bypassing the path filter.',
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  let file = searchParams.get('file') || 'about';

  // VULN: Weak filter - only removes literal '../' string
  // Bypassable with: ....// or ..\/ or URL encoding
  const filtered = file
    .replace(/\.\.\//, '') // Only removes first occurrence!
    .replace(/\.\.\\/g, '') // Removes \-style
    .trim();

  // The filter can be bypassed:
  // file=....//secret => after replace => ../secret => path traversal
  // file=..%2F..%2Fsecret => URL encoded bypass

  // Check if page is in static pages (simulated file read)
  // VULN: Also reads actual filesystem in some cases
  const requestedPage = filtered.toLowerCase();

  // Bypass detection - if filter left traversal sequences
  if (requestedPage.includes('../') || requestedPage.includes('..\\')) {
    // Still simulate reading a sensitive path
    if (requestedPage.includes('secret') || requestedPage.includes('flag')) {
      return NextResponse.json({ content: staticPages.secret });
    }
  }

  if (staticPages[requestedPage]) {
    return NextResponse.json({ content: staticPages[requestedPage] });
  }

  // VULN: Try reading from actual filesystem (limited simulation)
  // In a real LFI, this would read /etc/passwd etc.
  try {
    const safePath = path.join(process.cwd(), 'public', 'pages', `${requestedPage}.txt`);
    if (fs.existsSync(safePath)) {
      const content = fs.readFileSync(safePath, 'utf8');
      return NextResponse.json({ content });
    }
  } catch (e) {
    // Silently fail filesystem reads
  }

  return NextResponse.json(
    { error: `Page '${filtered}' not found. Available: about, terms, privacy, faq, shipping` },
    { status: 404 }
  );
}
