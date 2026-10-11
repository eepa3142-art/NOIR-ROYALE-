import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDocs, collection } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.resolve(__dirname, 'firebase-applet-config.json');
const storePath = path.resolve(__dirname, 'data/store.json');

const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const store = JSON.parse(fs.readFileSync(storePath, 'utf-8'));

const app = initializeApp({
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId,
});

const db = getFirestore(app, config.firestoreDatabaseId);

async function migrate() {
  console.log('--- STARTING NOIR ROYALE CLOUD MIGRATION ---');

  // 1. Migrate Menu Dishes
  console.log(`Migrating ${store.menu.length} menu items...`);
  for (const dish of store.menu) {
    const dishDoc = {
      ...dish,
      // Normalize image path if needed to ensure public availability
      image: dish.image.replace('/src/assets/images/', '/images/'),
    };
    await setDoc(doc(db, 'menu', dish.id), dishDoc);
    console.log(`  ✓ Migrated dish: ${dish.id} (${dish.name.en || dish.name.ar})`);
  }

  // 2. Migrate Settings
  if (store.settings) {
    console.log('Migrating restaurant settings...');
    await setDoc(doc(db, 'settings', 'general'), store.settings);
    console.log('  ✓ Migrated settings doc "general"');
  }

  // 3. Migrate Orders
  if (store.orders && store.orders.length > 0) {
    console.log(`Migrating ${store.orders.length} orders...`);
    for (const order of store.orders) {
      await setDoc(doc(db, 'orders', order.id), order);
      console.log(`  ✓ Migrated order: ${order.id} (${order.code})`);
    }
  }

  // 4. Migrate Reservations
  if (store.reservations && store.reservations.length > 0) {
    console.log(`Migrating ${store.reservations.length} reservations...`);
    for (const res of store.reservations) {
      await setDoc(doc(db, 'reservations', res.id), res);
      console.log(`  ✓ Migrated reservation: ${res.id} (${res.code})`);
    }
  }

  // 5. Migrate Owner Auth info (salt & hash for server authentication)
  if (store.owner) {
    console.log('Migrating owner credential store...');
    await setDoc(doc(db, 'system', 'owner_profile'), {
      email: store.owner.email,
      passwordHash: store.owner.passwordHash,
      salt: store.owner.salt,
      resetExpires: store.owner.resetExpires || null,
      updatedAt: new Date().toISOString(),
    });
    console.log('  ✓ Migrated owner auth credentials');
  }

  console.log('--- VERIFYING MIGRATED DATA ---');
  const menuSnap = await getDocs(collection(db, 'menu'));
  console.log(`Verification: Menu count in Firestore is ${menuSnap.size}`);

  const ordersSnap = await getDocs(collection(db, 'orders'));
  console.log(`Verification: Orders count in Firestore is ${ordersSnap.size}`);

  const resSnap = await getDocs(collection(db, 'reservations'));
  console.log(`Verification: Reservations count in Firestore is ${resSnap.size}`);

  console.log('--- MIGRATION COMPLETED SUCCESSFULLY ---');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
