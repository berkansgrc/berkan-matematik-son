
import * as admin from 'firebase-admin';

const serviceAccountString = process.env.FIREBASE_ADMIN_SDK_CONFIG;

if (!serviceAccountString) {
  throw new Error('The FIREBASE_ADMIN_SDK_CONFIG environment variable is not set. Please add it to your environment variables.');
}

let serviceAccount;
try {
    serviceAccount = JSON.parse(serviceAccountString);
} catch (error) {
    throw new Error('Failed to parse FIREBASE_ADMIN_SDK_CONFIG. Make sure it is a valid JSON string.');
}


if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error: any) {
    console.error('Firebase admin initialization error', error.stack);
  }
}

export const authAdmin = admin.auth();
export const firestoreAdmin = admin.firestore();
