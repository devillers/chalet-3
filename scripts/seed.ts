import { config as loadEnv } from 'dotenv';
import bcrypt from 'bcryptjs';
import type { UserDocument, UserRole } from '@/lib/db/models/user';
import type { PropertyDocument } from '@/lib/db/models/property';

const ENV_PATH = process.env.ENV_FILE ?? '.env.local';
loadEnv({ path: ENV_PATH, override: false });

async function main(): Promise<void> {
  const [{ connectMongo, disconnectMongo }, usersModule, propertyModule, envModule] = await Promise.all([
    import('@/lib/db/mongoose'),
    import('@/lib/db/users'),
    import('@/lib/db/models/property'),
    import('@/env'),
  ]);

  const { createUser, getUserByEmail, updateUser } = usersModule;
  const { PropertyModel } = propertyModule;
  const { env } = envModule;

  interface UpsertUserInput {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    onboardingCompleted?: boolean;
  }

  const upsertUser = async ({
    email,
    password,
    name,
    role,
    onboardingCompleted,
  }: UpsertUserInput): Promise<UserDocument> => {
    const normalizedEmail = email.toLowerCase();
    const existing = await getUserByEmail(normalizedEmail);

    if (existing) {
      const updates: Parameters<typeof updateUser>[1] = {};

      if (existing.name !== name) {
        updates.name = name;
      }

      if (existing.role !== role) {
        updates.role = role;
      }

      if (typeof onboardingCompleted === 'boolean' && existing.onboardingCompleted !== onboardingCompleted) {
        updates.onboardingCompleted = onboardingCompleted;
      }

      if (password) {
        updates.passwordHash = await bcrypt.hash(password, 12);
      }

      const updated = await updateUser(String(existing._id), updates);
      return (updated ?? existing) as UserDocument;
    }

    return createUser({
      email: normalizedEmail,
      name,
      password,
      role,
      onboardingCompleted: onboardingCompleted ?? false, // ✅ Fix: assure toujours un booléen
    });
  };

  interface UpsertPropertyInput {
    title: string;
    slug: string;
    description: string;
    ownerId: string;
    capacity: number;
    city: string;
    country: string;
    line1: string;
    postalCode?: string;
    status?: PropertyDocument['status'];
    publishedAt?: Date;
  }

  const upsertProperty = async ({
    title,
    slug,
    description,
    ownerId,
    capacity,
    city,
    country,
    line1,
    postalCode,
    status = 'published',
    publishedAt = new Date(),
  }: UpsertPropertyInput): Promise<PropertyDocument> => {
    const existing = await PropertyModel.findOne({ slug });
    const payload: Partial<PropertyDocument> = {
      title,
      slug,
      description,
      ownerId,
      capacity,
      status,
      publishedAt,
      address: {
        city,
        country,
        line1,
        postalCode: postalCode ?? '', // ✅ Fix: garantit une string
      },
    };

    if (existing) {
      const updated = await PropertyModel.findByIdAndUpdate(existing._id, payload, { new: true });
      return (updated ?? existing) as PropertyDocument;
    }

    return PropertyModel.create({
      previousSlugs: [],
      images: [],
      externalCalendars: [],
      blocks: [],
      ...payload,
    } as PropertyDocument);
  };

  const seed = async (): Promise<void> => {
    console.info(`🚀 Starting seed (env file: ${ENV_PATH})…`);
    await connectMongo();

    const superAdminEmail = env.ADMIN_SEED_EMAIL ?? 'admin@chaletmanager.fr';
    const superAdminPassword = env.ADMIN_SEED_PASSWORD ?? 'ChangeMe123!';

    const superAdmin = await upsertUser({
      email: superAdminEmail,
      password: superAdminPassword,
      name: env.ADMIN_SEED_NAME ?? 'Super Admin',
      role: 'SUPERADMIN',
      onboardingCompleted: true,
    });

    console.info(`✅ Super admin ready (${superAdmin.email})`);

    const owner = await upsertUser({
      email: 'owner@example.com',
      password: 'OwnerPass123!',
      name: 'Propriétaire Démonstration',
      role: 'OWNER',
      onboardingCompleted: true,
    });

    console.info(`✅ Owner seeded (${owner.email})`);

    const tenant = await upsertUser({
      email: 'tenant@example.com',
      password: 'TenantPass123!',
      name: 'Locataire Démonstration',
      role: 'TENANT',
      onboardingCompleted: false,
    });

    console.info(`✅ Tenant seeded (${tenant.email})`);

    const properties = await Promise.all([
      upsertProperty({
        title: 'Chalet Aiguille Verte',
        slug: 'chalet-aiguille-verte',
        description:
          'Chalet de prestige avec vue panoramique sur le massif du Mont-Blanc. 6 chambres, spa privatif et services haut de gamme.',
        ownerId: String(owner._id),
        capacity: 12,
        city: 'Chamonix-Mont-Blanc',
        country: 'FR',
        line1: '12 Route des Praz',
        postalCode: '74400',
      }),
      upsertProperty({
        title: 'Lodge des Cristaux',
        slug: 'lodge-des-cristaux',
        description:
          'Lodge contemporain niché au cœur des Alpes, combinant design moderne et matériaux nobles. Sauna, cheminée centrale et service de conciergerie.',
        ownerId: String(owner._id),
        capacity: 10,
        city: 'Megève',
        country: 'FR',
        line1: '58 Chemin du Calvaire',
        postalCode: '74120',
      }),
    ]);

    console.info(`🏡 Properties upserted (${properties.length})`);
    console.info('✨ Seed completed successfully!');
  };

  try {
    await seed();
  } finally {
    await disconnectMongo();
  }
}

main().catch(async (error) => {
  console.error('❌ Seed failed:', error);
  process.exitCode = 1;
});
