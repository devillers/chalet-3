import { createUser, getUserByEmail } from '../lib/db/users';

async function initAdmin() {
  try {
    const adminEmail = 'admin@chaletmanager.fr';

    const existingUser = getUserByEmail(adminEmail);

    if (existingUser) {
      console.log('✅ Admin user already exists');
      console.log(`Email: ${adminEmail}`);
      console.log(`Role: ${existingUser.role}`);
      return;
    }

    const adminUser = await createUser({
      name: 'Administrateur',
      email: adminEmail,
      password: 'admin123',
      role: 'superadmin',
    });

    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('Login credentials:');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: admin123`);
    console.log('');
    console.log('⚠️  IMPORTANT: Change this password after first login!');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

initAdmin();
