import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, enableIndexedDbPersistence } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); 

// Enable offline persistence
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support all of the features required to enable persistence');
    }
  });
}

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export interface FirebaseErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  }
}

export function handleFirestoreError(error: any, operation: FirebaseErrorInfo['operationType'], path: string | null = null): never {
  const info: FirebaseErrorInfo = {
    error: error.message || 'Unknown Firestore error',
    operationType: operation,
    path,
    authInfo: {
      userId: auth.currentUser?.uid || 'guest',
      email: auth.currentUser?.email || '',
      emailVerified: auth.currentUser?.emailVerified || false,
      isAnonymous: auth.currentUser?.isAnonymous || true,
      providerInfo: auth.currentUser?.providerData.map(p => ({
        providerId: p.providerId,
        displayName: p.displayName || '',
        email: p.email || '',
      })) || [],
    }
  };
  throw new Error(JSON.stringify(info));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error: any) {
    if (error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();
