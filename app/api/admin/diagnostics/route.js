// app/api/admin/diagnostics/route.js
// VULN: Command injection via child_process.exec with weak filter
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { getCurrentUser } from '../../../../lib/auth';

// VULN: Weak filter - blocks semicolons but not other bypass methods
function weakFilter(input) {
  // Blocks ; but NOT: | && || ` $(cmd) \n newline
  return input
    .replace(/;/g, '') // Blocks semicolons
    .trim()
    .substring(0, 100); // Length limit
}

const FLAG_7 = 'FLAG{c0mm4nd_1nj3ct10n_d14gn0st1cs}';

export async function POST(request) {
  // VULN: Admin check uses JWT role (forgeable)
  const user = getCurrentUser(request);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { host } = body;

    if (!host) {
      return NextResponse.json({ error: 'Host parameter required' }, { status: 400 });
    }

    // VULN: Weak filter applied but bypassable
    const sanitized = weakFilter(host);

    // VULN: Command injection - exec with unsanitized input
    // Bypass: host = "google.com | whoami" or "google.com && cat /etc/passwd"
    // Note: On Vercel (serverless), many commands may not be available
    // The flag is simulated in the output
    const command = process.platform === 'win32'
      ? `ping -n 1 ${sanitized}`
      : `ping -c 1 ${sanitized}`;

    return new Promise((resolve) => {
      exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
        let output = stdout || stderr || '';

        // Simulate command injection result
        if (sanitized.includes('|') || sanitized.includes('&&') || sanitized.includes('`') || sanitized.includes('$(')) {
          output += `\n\n[INJECTION DETECTED - Simulated output]\n${FLAG_7}\nuid=1000(vulnmarket) gid=1000(vulnmarket) groups=1000(vulnmarket)\n/app/vulnmarket`;
        }

        resolve(NextResponse.json({
          output: output || `Ping to ${sanitized} completed`,
          command: `ping ${sanitized}`, // VULN: Command exposed in response
          host: sanitized,
        }));
      });
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  const user = getCurrentUser(request);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  return NextResponse.json({
    message: 'Diagnostics API. POST with {host} to run ping.',
    note: 'Input is sanitized - semicolons are removed for security',
    // VULN: Reveals what IS blocked (hint for bypass)
    blocked: [';'],
    allowed: ['alphanumeric', 'dots', 'hyphens', 'and more...'],
  });
}
