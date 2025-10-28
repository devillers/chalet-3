import bcrypt from 'bcryptjs';
import { createUser, getUserByEmail, updateUser } from '../lib/db/users';

async function initAdmin() {
  try {
    const adminEmail = (process.env.ADMIN_SEED_EMAIL ?? 'admin@chaletmanager.fr').toLowerCase();
    const adminPassword = process.env.ADMIN_SEED_PASSWORD ?? 'admin123';
    const adminName = process.env.ADMIN_SEED_NAME ?? 'Administrateur';

    const existingUser = await getUserByEmail(adminEmail);

    if (existingUser) {
      console.log('✅ Admin user already exists');

      if (process.env.ADMIN_SEED_PASSWORD || process.env.ADMIN_SEED_NAME) {
        const updates: Parameters<typeof updateUser>[1] = {
          role: 'SUPERADMIN',
          onboardingCompleted: true,
        };

        if (process.env.ADMIN_SEED_NAME) {
          updates.name = adminName;
        }

        if (process.env.ADMIN_SEED_PASSWORD) {
          updates.passwordHash = await bcrypt.hash(adminPassword, 12);
        }

        const updatedUser = await updateUser(String(existingUser._id), updates);

        if (updatedUser) {
          console.log('🔁 Credentials refreshed from environment variables.');
          console.log(`Email: ${updatedUser.email}`);
          if (process.env.ADMIN_SEED_PASSWORD) {
            console.log(`Password: ${adminPassword}`);
          }
          console.log(`Role: ${updatedUser.role}`);
        } else {
          console.log('⚠️  Unable to refresh credentials. User update returned null.');
        }
      } else {
        console.log(`Email: ${existingUser.email}`);
        console.log(`Role: ${existingUser.role}`);
      }
      return;
    }

    const adminUser = await createUser({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'SUPERADMIN',
      onboardingCompleted: true,
    });

    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('Login credentials:');
    console.log(`Email: ${adminUser.email}`);
    console.log(`Password: ${adminPassword}`);
    console.log('');
    console.log('⚠️  IMPORTANT: Change this password after first login!');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

initAdmin();
