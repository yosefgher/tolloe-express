import { PrismaClient, Role, ServiceType, ShipmentStatus, VehicleType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Service Areas ─────────────────────────────────────────────────────────
  const serviceAreas = [
    { cityName: 'Addis Ababa', region: 'Addis Ababa', lat: 9.0320, lng: 38.7469 },
    { cityName: 'Dire Dawa', region: 'Dire Dawa', lat: 9.5930, lng: 41.8661 },
    { cityName: 'Mekelle', region: 'Tigray', lat: 13.4967, lng: 39.4753 },
    { cityName: 'Gondar', region: 'Amhara', lat: 12.6030, lng: 37.4521 },
    { cityName: 'Bahir Dar', region: 'Amhara', lat: 11.5936, lng: 37.3900 },
    { cityName: 'Hawassa', region: 'Sidama', lat: 7.0621, lng: 38.4768 },
    { cityName: 'Jimma', region: 'Oromia', lat: 7.6784, lng: 36.8344 },
    { cityName: 'Dessie', region: 'Amhara', lat: 11.1333, lng: 39.6333 },
    { cityName: 'Jijiga', region: 'Somali', lat: 9.3500, lng: 42.8000 },
    { cityName: 'Shashamane', region: 'Oromia', lat: 7.2000, lng: 38.6000 },
    { cityName: 'Bishoftu', region: 'Oromia', lat: 8.7500, lng: 38.9833 },
    { cityName: 'Adama', region: 'Oromia', lat: 8.5400, lng: 39.2700 },
    { cityName: 'Harar', region: 'Harari', lat: 9.3100, lng: 42.1200 },
    { cityName: 'Arba Minch', region: 'SNNPR', lat: 6.0333, lng: 37.5500 },
    { cityName: 'Nekemte', region: 'Oromia', lat: 9.0847, lng: 36.5478 },
  ];

  for (const area of serviceAreas) {
    await prisma.serviceArea.upsert({
      where: { cityName: area.cityName },
      update: {},
      create: area,
    });
  }
  console.log(`✅ Created ${serviceAreas.length} service areas`);

  // ─── Admin User ────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@123456', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@toloeexpress.com' },
    update: {},
    create: {
      email: 'admin@toloeexpress.com',
      passwordHash: adminPassword,
      role: Role.ADMIN,
      phone: '+251911000000',
      isActive: true,
      isEmailVerified: true,
      profile: {
        create: {
          firstName: 'System',
          lastName: 'Admin',
        },
      },
    },
  });
  console.log(`✅ Admin user: ${admin.email}`);

  // ─── Staff User ────────────────────────────────────────────────────────────
  const staffPassword = await bcrypt.hash('Staff@123456', 12);
  const staff = await prisma.user.upsert({
    where: { email: 'staff@toloeexpress.com' },
    update: {},
    create: {
      email: 'staff@toloeexpress.com',
      passwordHash: staffPassword,
      role: Role.STAFF,
      phone: '+251922000000',
      isActive: true,
      isEmailVerified: true,
      profile: {
        create: {
          firstName: 'Meron',
          lastName: 'Tadesse',
        },
      },
    },
  });
  console.log(`✅ Staff user: ${staff.email}`);

  // ─── Driver ────────────────────────────────────────────────────────────────
  const driverPassword = await bcrypt.hash('Driver@123456', 12);
  const driverUser = await prisma.user.upsert({
    where: { email: 'driver@toloeexpress.com' },
    update: {},
    create: {
      email: 'driver@toloeexpress.com',
      passwordHash: driverPassword,
      role: Role.STAFF,
      phone: '+251933000000',
      isActive: true,
      isEmailVerified: true,
      profile: {
        create: {
          firstName: 'Abebe',
          lastName: 'Bekele',
        },
      },
    },
  });

  await prisma.driver.upsert({
    where: { userId: driverUser.id },
    update: {},
    create: {
      userId: driverUser.id,
      vehicleType: VehicleType.MOTORCYCLE,
      licenseNumber: 'ET-DL-12345',
      vehiclePlate: 'AA-1234-ET',
      isAvailable: true,
      currentLat: 9.0320,
      currentLng: 38.7469,
    },
  });
  console.log(`✅ Driver user: ${driverUser.email}`);

  // ─── Sample Customer ───────────────────────────────────────────────────────
  const customerPassword = await bcrypt.hash('Customer@123456', 12);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      passwordHash: customerPassword,
      role: Role.CUSTOMER,
      phone: '+251944000000',
      isActive: true,
      isEmailVerified: true,
      profile: {
        create: {
          firstName: 'Selam',
          lastName: 'Haile',
        },
      },
      addresses: {
        create: {
          label: 'Home',
          street: 'Bole Road, House 42',
          city: 'Addis Ababa',
          region: 'Addis Ababa',
          lat: 9.0143,
          lng: 38.7998,
          isDefault: true,
        },
      },
    },
  });
  console.log(`✅ Customer user: ${customer.email}`);

  // ─── Business Client ───────────────────────────────────────────────────────
  const bizPassword = await bcrypt.hash('Business@123456', 12);
  const bizUser = await prisma.user.upsert({
    where: { email: 'business@etrade.com' },
    update: {},
    create: {
      email: 'business@etrade.com',
      passwordHash: bizPassword,
      role: Role.BUSINESS_CLIENT,
      phone: '+251955000000',
      isActive: true,
      isEmailVerified: true,
      profile: {
        create: {
          firstName: 'Tsegaye',
          lastName: 'Alemu',
        },
      },
    },
  });

  await prisma.businessClient.upsert({
    where: { userId: bizUser.id },
    update: {},
    create: {
      userId: bizUser.id,
      companyName: 'E-Trade Ethiopia PLC',
      taxId: 'ETH-TAX-001234',
      contractType: 'premium',
      creditLimit: 50000,
      billingCycle: 'monthly',
      isApproved: true,
    },
  });
  console.log(`✅ Business client: ${bizUser.email}`);

  // ─── Promo Codes ───────────────────────────────────────────────────────────
  await prisma.promoCode.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      maxUses: 1000,
      isActive: true,
    },
  });

  await prisma.promoCode.upsert({
    where: { code: 'FLAT50' },
    update: {},
    create: {
      code: 'FLAT50',
      discountType: 'FIXED',
      discountValue: 50,
      maxUses: 500,
      isActive: true,
    },
  });
  console.log('✅ Promo codes created');

  // ─── Sample Blog Post ──────────────────────────────────────────────────────
  await prisma.blogPost.upsert({
    where: { slug: 'welcome-to-tolloe-express' },
    update: {},
    create: {
      title: 'Welcome to TOLLOE EXPRESS',
      slug: 'welcome-to-tolloe-express',
      excerpt: 'Introducing Ethiopia\'s most reliable courier service, now available online.',
      content: `# Welcome to TOLLOE EXPRESS

We are proud to announce the launch of our new online platform. Now you can book shipments, track packages, and manage your deliveries all from the comfort of your browser.

## What We Offer

- **Same-Day Delivery** — Within Addis Ababa
- **Express Delivery** — Major cities in 24–48 hours
- **Standard Delivery** — Nationwide coverage in 3–5 days
- **Economy** — Budget-friendly option for non-urgent shipments

Stay tuned for more updates!`,
      authorId: admin.id,
      publishedAt: new Date(),
      tags: ['news', 'launch', 'announcements'],
    },
  });
  console.log('✅ Sample blog post created');

  // ─── Branch & Counter ──────────────────────────────────────────────────────
  const mainBranch = await prisma.branch.upsert({
    where: { id: 'branch-main' },
    update: {},
    create: {
      id: 'branch-main',
      name: 'Main Branch — Bole',
      address: 'Bole Road, House 12',
      city: 'Addis Ababa',
      region: 'Addis Ababa',
      isActive: true,
    },
  });

  await prisma.counter.upsert({
    where: { id: 'counter-1' },
    update: {},
    create: {
      id: 'counter-1',
      branchId: mainBranch.id,
      name: 'Counter 1',
      isActive: true,
    },
  });

  await prisma.counter.upsert({
    where: { id: 'counter-2' },
    update: {},
    create: {
      id: 'counter-2',
      branchId: mainBranch.id,
      name: 'Counter 2',
      isActive: true,
    },
  });
  console.log('✅ Branch and counters created');

  // ─── Site Content (CMS defaults) ──────────────────────────────────────────
  const cmsDefaults = [
    // Homepage
    { key: 'home.hero.badge',          label: 'Hero Badge Text',        group: 'homepage', type: 'text',     value: "Ethiopia's Trusted Courier" },
    { key: 'home.hero.title',          label: 'Hero Main Title',        group: 'homepage', type: 'text',     value: 'Fast. Reliable. Nationwide Delivery' },
    { key: 'home.hero.subtitle',       label: 'Hero Subtitle',          group: 'homepage', type: 'textarea', value: 'From Addis Ababa to every corner of Ethiopia — we deliver what matters most. Book online in minutes.' },
    { key: 'home.stats',               label: 'Stats Bar (JSON)',        group: 'homepage', type: 'json',     value: JSON.stringify([{ value: '15+', label: 'Cities Covered' }, { value: '5,000+', label: 'Monthly Deliveries' }, { value: '98%', label: 'On-Time Rate' }, { value: '24/7', label: 'Customer Support' }]) },
    { key: 'home.services.heading',    label: 'Services Section Title', group: 'homepage', type: 'text',     value: 'Our Services' },
    { key: 'home.services.subheading', label: 'Services Subtitle',      group: 'homepage', type: 'text',     value: 'Choose the delivery speed that fits your needs' },
    { key: 'home.features.heading',    label: 'Features Section Title', group: 'homepage', type: 'text',     value: 'Why Choose TOLLOE EXPRESS?' },
    { key: 'home.features.body',       label: 'Features Body Text',     group: 'homepage', type: 'textarea', value: 'We combine technology with local expertise to provide the most reliable delivery experience in Ethiopia.' },
    { key: 'home.features.list',       label: 'Features List (JSON)',   group: 'homepage', type: 'json',     value: JSON.stringify(['Real-time package tracking', 'Proof of delivery with photos', 'Cash on delivery (COD) support', 'Business bulk shipping API', 'Door-to-door pickup & delivery', 'SMS & email notifications']) },
    { key: 'home.cta.title',           label: 'CTA Heading',            group: 'homepage', type: 'text',     value: 'Ready to Ship?' },
    { key: 'home.cta.subtitle',        label: 'CTA Subtext',            group: 'homepage', type: 'textarea', value: 'Join thousands of Ethiopians who trust TOLLOE EXPRESS every day.' },
    // Company Info
    { key: 'company.name',         label: 'Company Name',       group: 'company', type: 'text',     value: 'TOLLOE EXPRESS' },
    { key: 'company.tagline',      label: 'Tagline',            group: 'company', type: 'text',     value: "Ethiopia's Trusted Courier Service" },
    { key: 'company.phone',        label: 'Phone Number',       group: 'company', type: 'text',     value: '+251 911 000 000' },
    { key: 'company.email',        label: 'Contact Email',      group: 'company', type: 'text',     value: 'info@toloeexpress.com' },
    { key: 'company.address',      label: 'Office Address',     group: 'company', type: 'text',     value: 'Bole Road, Addis Ababa, Ethiopia' },
    { key: 'company.reg_number',   label: 'Registration No.',   group: 'company', type: 'text',     value: 'ETH-BUS-2020-04521' },
    { key: 'company.working_hours',label: 'Working Hours',      group: 'company', type: 'text',     value: 'Mon–Sat: 8AM–8PM' },
    { key: 'company.about',        label: 'About Text',         group: 'company', type: 'textarea', value: 'TOLLOE EXPRESS is a leading courier and logistics company serving Ethiopia since 2020. We connect businesses and individuals with fast, reliable, and affordable delivery solutions across all major cities.' },
    { key: 'company.whatsapp',     label: 'WhatsApp Number',    group: 'company', type: 'text',     value: '+251911000000' },
    // SEO
    { key: 'seo.home.title',       label: 'Homepage Meta Title',       group: 'seo', type: 'text',     value: "TOLLOE EXPRESS — Ethiopia's Trusted Courier Service" },
    { key: 'seo.home.description', label: 'Homepage Meta Description', group: 'seo', type: 'textarea', value: 'Fast, reliable nationwide delivery across Ethiopia. Book online, track in real-time.' },
    { key: 'seo.site.name',        label: 'Site Name (OG)',            group: 'seo', type: 'text',     value: 'TOLLOE EXPRESS' },
    // Media / Branding
    { key: 'company.logo_url',    label: 'Company Logo',   group: 'media', type: 'image', value: '' },
    { key: 'company.favicon_url', label: 'Favicon',        group: 'media', type: 'image', value: '' },
    { key: 'company.og_image',    label: 'Social Share Image (OG)', group: 'media', type: 'image', value: '' },
    // Social
    { key: 'social.facebook',  label: 'Facebook URL',  group: 'social', type: 'text', value: 'https://facebook.com/toloeexpress' },
    { key: 'social.twitter',   label: 'Twitter/X URL', group: 'social', type: 'text', value: 'https://twitter.com/toloeexpress' },
    { key: 'social.instagram', label: 'Instagram URL', group: 'social', type: 'text', value: 'https://instagram.com/toloeexpress' },
    { key: 'social.linkedin',  label: 'LinkedIn URL',  group: 'social', type: 'text', value: 'https://linkedin.com/company/toloeexpress' },
  ];

  for (const item of cmsDefaults) {
    await prisma.siteContent.upsert({
      where: { key: item.key },
      update: {},
      create: item,
    });
  }
  console.log(`✅ CMS defaults seeded (${cmsDefaults.length} items)`);

  console.log('\n🎉 Database seeded successfully!');
  console.log('\nTest credentials:');
  console.log('  Admin:    admin@toloeexpress.com / Admin@123456');
  console.log('  Staff:    staff@toloeexpress.com / Staff@123456');
  console.log('  Driver:   driver@toloeexpress.com / Driver@123456');
  console.log('  Customer: customer@example.com / Customer@123456');
  console.log('  Business: business@etrade.com / Business@123456');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
