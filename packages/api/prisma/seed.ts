import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create API key
  const apiKey = await prisma.apiKey.upsert({
    where: { key: 'dev-secret-key-change-in-production' },
    update: {},
    create: {
      key: 'dev-secret-key-change-in-production',
      name: 'Development Key',
      active: true,
    },
  });
  console.log('✅ API Key created');

  // Create test users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'john@example.com' },
      update: {},
      create: { email: 'john@example.com' },
    }),
    prisma.user.upsert({
      where: { email: 'jane@example.com' },
      update: {},
      create: { email: 'jane@example.com' },
    }),
  ]);
  console.log('✅ Test users created');

  // Generate realistic test sessions
  const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
  const devices = ['desktop', 'mobile', 'tablet'];
  const oses = ['Windows', 'macOS', 'Linux', 'iOS', 'Android'];
  const urls = [
    'https://example.com/',
    'https://example.com/products',
    'https://example.com/checkout',
    'https://example.com/dashboard',
    'https://example.com/profile',
    'https://example.com/settings',
  ];

  const eventTypes = [
    'dom_mutation',
    'mouse_move',
    'mouse_click',
    'scroll',
    'navigation',
    'console_log',
    'console_error',
    'network_request',
    'network_response',
  ];

  const now = Date.now();
  const sessions: any[] = [];

  // Create 25 sessions
  for (let i = 0; i < 25; i++) {
    const hasErrors = Math.random() > 0.7; // 30% chance of errors
    const eventCount = Math.floor(Math.random() * 500) + 50; // 50-550 events
    const daysAgo = Math.floor(Math.random() * 7); // Last 7 days
    const hoursAgo = Math.floor(Math.random() * 24);
    const startedAt = new Date(now - daysAgo * 24 * 60 * 60 * 1000 - hoursAgo * 60 * 60 * 1000);
    const lastActive = new Date(startedAt.getTime() + Math.random() * 60 * 60 * 1000); // Up to 1 hour session length

    const user = i % 3 === 0 ? null : users[i % 2]; // 1/3 anonymous

    const session = await prisma.session.create({
      data: {
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user?.id,
        userEmail: user?.email,
        userAgent: `Mozilla/5.0 (${oses[i % oses.length]}; rv:100.0) Gecko/20100101 ${browsers[i % browsers.length]}/100.0`,
        url: urls[i % urls.length],
        browser: browsers[i % browsers.length],
        device: devices[i % devices.length],
        os: oses[i % oses.length],
        hasErrors,
        startedAt,
        lastActive,
        eventCount,
        events: {
          create: Array.from({ length: Math.min(eventCount, 100) }, (_, j) => {
            const timestamp = startedAt.getTime() + j * 5000; // Events every 5 seconds
            const isError = hasErrors && Math.random() > 0.9; // Random errors

            return {
              type: isError ? 'console_error' : eventTypes[Math.floor(Math.random() * eventTypes.length)],
              timestamp: BigInt(timestamp),
              data: isError
                ? {
                    level: 'error',
                    message: `TypeError: Cannot read property 'data' of undefined`,
                    stack: 'Error: at handleClick (app.js:234:15)',
                  }
                : {
                    x: Math.floor(Math.random() * 1920),
                    y: Math.floor(Math.random() * 1080),
                    target: 'button.primary',
                  },
            };
          }),
        },
      },
    });

    sessions.push(session);
    console.log(`✅ Created session ${i + 1}/25 (${session.sessionId.substring(0, 20)}...)`);
  }

  console.log('\n🎉 Seeding complete!');
  console.log(`   - ${users.length} users`);
  console.log(`   - ${sessions.length} sessions`);
  console.log(`   - ~${sessions.reduce((sum, s) => sum + s.eventCount, 0)} events`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
