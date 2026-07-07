// prisma/seed.js
// VulnMarket Seed Script - populates sample data and CTF flags
const { PrismaClient } = require('@prisma/client');
const md5 = require('md5');

const prisma = new PrismaClient();

// VULN: Passwords stored as MD5 hashes (weak hashing)
const hashPassword = (password) => md5(password);

const users = [
  {
    username: 'admin',
    // Default admin credentials - intentionally weak (admin/admin123)
    password: hashPassword('admin123'),
    email: 'admin@vulnmarket.local',
    role: 'admin',
    creditCard: '4111-1111-1111-1111', // VULN: plaintext credit card
    resetToken: Buffer.from('admin@vulnmarket.local').toString('base64'), // VULN: predictable token
  },
  {
    username: 'alice',
    password: hashPassword('password123'),
    email: 'alice@example.com',
    role: 'user',
    creditCard: '5500-0000-0000-0004',
    resetToken: Buffer.from('alice@example.com').toString('base64'),
  },
  {
    username: 'bob',
    password: hashPassword('qwerty123'),
    email: 'bob@example.com',
    role: 'user',
    creditCard: '3714-496353-98431',
    resetToken: Buffer.from('bob@example.com').toString('base64'),
  },
  {
    username: 'test',
    password: hashPassword('test123'),
    email: 'test@example.com',
    role: 'user',
    creditCard: '6011-1111-1111-1117',
    resetToken: Buffer.from('test@example.com').toString('base64'),
  },
];

const products = [
  {
    name: 'Wireless Noise-Cancelling Headphones',
    description:
      'Premium over-ear headphones with 30-hour battery life, advanced noise cancellation, and crystal-clear audio. Perfect for travel and work-from-home.',
    price: 249.99,
    image: 'https://picsum.photos/seed/headphones/400/300',
    stock: 50,
    category: 'Electronics',
    rating: 4.7,
  },
  {
    name: 'Mechanical Gaming Keyboard',
    description:
      'RGB backlit mechanical keyboard with Cherry MX switches, anti-ghosting, and programmable macros. Ideal for competitive gaming.',
    price: 129.99,
    image: 'https://picsum.photos/seed/keyboard/400/300',
    stock: 75,
    category: 'Electronics',
    rating: 4.5,
  },
  {
    name: 'Smart Fitness Tracker Pro',
    description:
      'Track your health 24/7 with heart rate monitoring, sleep analysis, GPS, and 7-day battery. Water-resistant up to 50m.',
    price: 89.99,
    image: 'https://picsum.photos/seed/fitness/400/300',
    stock: 120,
    category: 'Wearables',
    rating: 4.3,
  },
  {
    name: '4K Webcam Ultra HD',
    description:
      'Professional-grade 4K webcam with auto-focus, ring light, and noise-cancelling microphone. Perfect for streaming and video calls.',
    price: 179.99,
    image: 'https://picsum.photos/seed/webcam/400/300',
    stock: 40,
    category: 'Electronics',
    rating: 4.6,
  },
  {
    name: 'Portable SSD 1TB',
    description:
      'Ultra-fast portable solid-state drive with USB-C connectivity, 1050MB/s read speed, and shock-resistant design.',
    price: 99.99,
    image: 'https://picsum.photos/seed/ssd/400/300',
    stock: 85,
    category: 'Storage',
    rating: 4.8,
  },
  {
    name: 'Smart LED Desk Lamp',
    description:
      'Adjustable color temperature and brightness with wireless charging pad and USB charging port built in.',
    price: 49.99,
    image: 'https://picsum.photos/seed/lamp/400/300',
    stock: 200,
    category: 'Home',
    rating: 4.2,
  },
  {
    name: 'Ergonomic Office Chair',
    description:
      'Lumbar support, adjustable armrests, breathable mesh back, and 360-degree swivel. Designed for all-day comfort.',
    price: 399.99,
    image: 'https://picsum.photos/seed/chair/400/300',
    stock: 25,
    category: 'Furniture',
    rating: 4.4,
  },
  {
    name: 'USB-C Hub 12-in-1',
    description:
      'Expand your laptop ports with HDMI 4K, SD card reader, 3x USB-A, 2x USB-C, ethernet, and more.',
    price: 59.99,
    image: 'https://picsum.photos/seed/hub/400/300',
    stock: 150,
    category: 'Electronics',
    rating: 4.5,
  },
  {
    name: 'Wireless Charging Pad',
    description:
      'Fast 15W Qi wireless charger compatible with all Qi-enabled devices. Sleek glass design with LED indicator.',
    price: 29.99,
    image: 'https://picsum.photos/seed/charger/400/300',
    stock: 300,
    category: 'Electronics',
    rating: 4.1,
  },
  {
    name: 'Laptop Stand Adjustable',
    description:
      'Aluminum alloy stand with 6 height settings, foldable design, and non-slip padding. Compatible with 10-17 inch laptops.',
    price: 39.99,
    image: 'https://picsum.photos/seed/stand/400/300',
    stock: 180,
    category: 'Accessories',
    rating: 4.3,
  },
  {
    name: 'Gaming Mouse 12000 DPI',
    description:
      'Optical gaming mouse with 12000 DPI, 7 programmable buttons, RGB lighting, and ergonomic grip design.',
    price: 69.99,
    image: 'https://picsum.photos/seed/mouse/400/300',
    stock: 90,
    category: 'Electronics',
    rating: 4.6,
  },
  {
    name: 'Noise-Cancelling Earbuds',
    description:
      'True wireless earbuds with active noise cancellation, 6-hour battery life, and IPX5 water resistance.',
    price: 149.99,
    image: 'https://picsum.photos/seed/earbuds/400/300',
    stock: 60,
    category: 'Electronics',
    rating: 4.5,
  },
];

// CTF Flags
const flags = [
  {
    flagName: 'flag_1_html_source',
    flagValue: 'FLAG{html_c0mm3nts_4r3_n0t_s3cr3ts}',
    hint: 'Sometimes developers leave notes in places they think no one will look.',
  },
  {
    flagName: 'flag_2_sqli',
    flagValue: 'FLAG{sql_1nj3ct10n_byp4ss3d_4uth}',
    hint: 'Classic authentication bypass using SQL injection.',
  },
  {
    flagName: 'flag_3_idor',
    flagValue: 'FLAG{1d0r_3xp0s3d_us3r_d4t4}',
    hint: "Access another user's profile data through an insecure direct object reference.",
  },
  {
    flagName: 'flag_4_xss',
    flagValue: 'FLAG{st0r3d_xss_1n_c0mm3nts}',
    hint: 'Inject a script into a product comment and wait for an admin to view it.',
  },
  {
    flagName: 'flag_5_backup',
    flagValue: 'FLAG{uns3cur3d_b4ckup_3ndp01nt}',
    hint: 'Some backup endpoints are left unprotected. Check the robots.txt for clues.',
  },
  {
    flagName: 'flag_6_lfi',
    flagValue: 'FLAG{lf1_f1l3_r34d_byp4ss}',
    hint: 'The page-view feature uses a file parameter. Simple filters can be bypassed.',
  },
  {
    flagName: 'flag_7_cmd_injection',
    flagValue: 'FLAG{c0mm4nd_1nj3ct10n_d14gn0st1cs}',
    hint: 'The admin diagnostics tool runs system commands. Weak input filters can be bypassed.',
  },
  {
    flagName: 'flag_8_upload',
    flagValue: 'FLAG{f4k3_sh3ll_upl04d_byp4ss}',
    hint: 'Client-side validation only. Try uploading a file with a specific naming pattern.',
  },
  {
    flagName: 'flag_9_ssrf',
    flagValue: 'FLAG{ssrf_1nt3rn4l_s3rv1c3_4cc3ss}',
    hint: 'The URL preview tool fetches external URLs. What about internal ones?',
  },
  {
    flagName: 'flag_10_jwt',
    flagValue: 'FLAG{jwt_w34k_s3cr3t_4dm1n_f0rg3d}',
    hint: 'The JWT secret is weak. Forge a token with an admin role to unlock the flag.',
  },
];

const adminNotes = [
  {
    note: 'TODO: Change default admin password before production deployment (admin/admin123)',
  },
  {
    note: 'API key for analytics service: vm_analytics_key_8f3a2b1c9d4e5f6g7h8i9j0k',
  },
  {
    note: 'Remember to disable /api/debug endpoint before going live',
  },
  {
    note: 'Database backup runs nightly to /api/backup - should add authentication',
  },
];

async function main() {
  console.log('🌱 Seeding VulnMarket database...');

  // Clear existing data
  await prisma.comment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.adminNote.deleteMany();
  await prisma.flag.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Seed users
  console.log('👤 Creating users...');
  const createdUsers = await Promise.all(users.map((u) => prisma.user.create({ data: u })));

  // Seed products
  console.log('📦 Creating products...');
  const createdProducts = await Promise.all(
    products.map((p) => prisma.product.create({ data: p }))
  );

  // Seed orders
  console.log('🛒 Creating orders...');
  await prisma.order.createMany({
    data: [
      {
        userId: createdUsers[1].id, // alice
        productId: createdProducts[0].id,
        quantity: 1,
        total: 249.99,
        status: 'delivered',
      },
      {
        userId: createdUsers[1].id, // alice
        productId: createdProducts[2].id,
        quantity: 2,
        total: 179.98,
        status: 'shipped',
      },
      {
        userId: createdUsers[2].id, // bob
        productId: createdProducts[4].id,
        quantity: 1,
        total: 99.99,
        status: 'pending',
      },
      {
        userId: createdUsers[3].id, // test
        productId: createdProducts[1].id,
        quantity: 1,
        total: 129.99,
        status: 'delivered',
      },
      {
        userId: createdUsers[0].id, // admin
        productId: createdProducts[6].id,
        quantity: 1,
        total: 399.99,
        status: 'delivered',
      },
    ],
  });

  // Seed comments (one contains a stored XSS payload referencing flag_4)
  console.log('💬 Creating comments...');
  await prisma.comment.createMany({
    data: [
      {
        userId: createdUsers[1].id,
        productId: createdProducts[0].id,
        comment:
          'Absolutely love these headphones! The noise cancellation is incredible for long flights.',
        rating: 5,
      },
      {
        userId: createdUsers[2].id,
        productId: createdProducts[0].id,
        comment: 'Great sound quality but a bit heavy for extended use.',
        rating: 4,
      },
      {
        userId: createdUsers[3].id,
        productId: createdProducts[1].id,
        comment: 'The RGB lighting is stunning. Typing feels satisfying on Cherry MX reds.',
        rating: 5,
      },
      {
        userId: createdUsers[1].id,
        productId: createdProducts[2].id,
        comment:
          'Battery life is impressive. GPS tracking works flawlessly during morning runs.',
        rating: 4,
      },
      {
        userId: createdUsers[2].id,
        productId: createdProducts[4].id,
        comment: 'Transfer speeds are insane. Best portable SSD I have ever owned.',
        rating: 5,
      },
    ],
  });

  // Seed admin notes
  console.log('📝 Creating admin notes...');
  await prisma.adminNote.createMany({ data: adminNotes });

  // Seed flags
  console.log('🚩 Creating CTF flags...');
  await Promise.all(flags.map((f) => prisma.flag.create({ data: f })));

  // Seed support tickets
  console.log('🎫 Creating support tickets...');
  await prisma.supportTicket.createMany({
    data: [
      {
        userId: createdUsers[1].id,
        subject: 'Order not received',
        email: 'alice@example.com',
        message: 'My order #3 has not arrived yet. Please help.',
      },
      {
        userId: createdUsers[2].id,
        subject: 'Product question',
        email: 'bob@example.com',
        message: 'Does the SSD work with older USB-A ports using an adapter?',
      },
    ],
  });

  console.log('✅ Seeding complete!');
  console.log('');
  console.log('Default credentials:');
  console.log('  admin / admin123 (role: admin)');
  console.log('  alice / password123 (role: user)');
  console.log('  bob / qwerty123 (role: user)');
  console.log('  test / test123 (role: user)');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
