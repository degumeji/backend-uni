/**
 * Script de seed para crear usuarios iniciales.
 *
 * Uso:
 *   npm run seed:local   → usa .env.local  (MongoDB en localhost)
 *   npm run seed:prod    → usa .env.prod   (MongoDB Atlas)
 */

import 'reflect-metadata';
import * as mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// ─── Detectar entorno desde argumento --env ──────────────────────────────────
const envArg = process.argv.find((a) => a.startsWith('--env='));
const envName = envArg ? envArg.split('=')[1] : 'local';

const envFile = path.resolve(process.cwd(), `.env.${envName}`);

if (!fs.existsSync(envFile)) {
  console.error(`❌ Archivo no encontrado: ${envFile}`);
  console.error(`   Crea el archivo o usa: --env=local | --env=prod`);
  process.exit(1);
}

dotenv.config({ path: envFile });
console.log(`📄 Usando: .env.${envName}`);

// ─── Validar URI ─────────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI no está definido en el archivo .env');
  process.exit(1);
}

// ─── Schema ──────────────────────────────────────────────────────────────────
const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, lowercase: true },
    passwordHash: String,
    role: { type: String, enum: ['admin', 'teacher', 'student'], default: 'student' },
    fcmToken: { type: String, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const User = mongoose.model('UserModel', UserSchema, 'users');

// ─── Datos de prueba ─────────────────────────────────────────────────────────
const seeds = [
  {
    name: 'Administrador',
    email: 'admin@universidad.edu',
    password: 'Admin123!',
    role: 'admin',
  },
  {
    name: 'Prof. García',
    email: 'garcia@universidad.edu',
    password: 'Teacher123!',
    role: 'teacher',
  },
  {
    name: 'Juan Estudiante',
    email: 'juan@universidad.edu',
    password: 'Student123!',
    role: 'student',
  },
];

// ─── Función principal ───────────────────────────────────────────────────────
async function seed() {
  // Oculta credenciales en el log
  const safeUri = MONGO_URI.replace(/:\/\/.*@/, '://****@');
  console.log(`🔌 Conectando a: ${safeUri}`);

  await mongoose.connect(MONGO_URI);
  console.log('✅ Conectado a MongoDB\n');

  for (const item of seeds) {
    const exists = await User.findOne({ email: item.email });
    if (exists) {
      console.log(`⏭️  Ya existe: ${item.email}`);
      continue;
    }

    const passwordHash = await bcrypt.hash(item.password, 10);
    await User.create({ ...item, passwordHash });
    console.log(`✅ Creado [${item.role}]: ${item.email}  /  ${item.password}`);
  }

  await mongoose.disconnect();
  console.log('\n🎉 Seed completado. ¡Ya puedes iniciar sesión!');
}

seed().catch((err) => {
  console.error('Error en seed:', err.message);
  process.exit(1);
});
