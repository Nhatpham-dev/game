import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  collection,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  getDocFromServer,
  writeBatch,
  updateDoc,
  arrayUnion
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserAccount, Character, BuildingZone, LogMessage, NegotiationSession, NegotiationMessage, GameSessionState } from '../types/game';

// Initialize Firebase App & Firestore with databaseId as required
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Error Handling Specification
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Notice: ', JSON.stringify(errInfo));
}

// Test Connection on Initial Boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline. Local synchronization fallback active.');
    }
    return false;
  }
}

// Google Authentication
export async function loginWithGoogle(): Promise<User | null> {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (err) {
    console.error('Google Sign In Error:', err);
    return null;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.error('Logout Error:', err);
  }
}

// Real-Time Listeners across Devices
export function subscribeToRemoteAccounts(callback: (accounts: UserAccount[]) => void): () => void {
  const path = 'accounts';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: UserAccount[] = [];
      snapshot.forEach(docSnap => {
        const d = docSnap.data() as UserAccount;
        if (d && d.id && d.username) {
          list.push(d);
        }
      });
      if (list.length > 0) {
        callback(list);
      }
    },
    (error) => handleFirestoreError(error, OperationType.GET, path)
  );
}

export function subscribeToRemoteCharacters(callback: (characters: Character[]) => void): () => void {
  const path = 'characters';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: Character[] = [];
      snapshot.forEach(docSnap => {
        const d = docSnap.data() as Character;
        if (d && d.id && d.name) {
          list.push(d);
        }
      });
      if (list.length > 0) {
        callback(list);
      }
    },
    (error) => handleFirestoreError(error, OperationType.GET, path)
  );
}

export function subscribeToRemoteBuildings(callback: (buildings: BuildingZone[]) => void): () => void {
  const path = 'buildings';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: BuildingZone[] = [];
      snapshot.forEach(docSnap => {
        const d = docSnap.data() as BuildingZone;
        if (d && d.id && d.name) {
          list.push(d);
        }
      });
      if (list.length > 0) {
        callback(list);
      }
    },
    (error) => handleFirestoreError(error, OperationType.GET, path)
  );
}

export function subscribeToRemoteLogs(callback: (logs: LogMessage[]) => void): () => void {
  const path = 'logs';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: LogMessage[] = [];
      snapshot.forEach(docSnap => {
        const d = docSnap.data() as LogMessage;
        if (d && d.id && d.text) {
          list.push(d);
        }
      });
      if (list.length > 0) {
        list.sort((a, b) => b.timestamp - a.timestamp);
        callback(list.slice(0, 50));
      }
    },
    (error) => handleFirestoreError(error, OperationType.GET, path)
  );
}

// Push mutations to Firestore
export async function syncAccountToCloud(account: UserAccount): Promise<void> {
  const path = `accounts/${account.id}`;
  try {
    await setDoc(doc(db, 'accounts', account.id), account, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteAccountFromCloud(accountId: string): Promise<void> {
  const path = `accounts/${accountId}`;
  try {
    await deleteDoc(doc(db, 'accounts', accountId));
    await deleteDoc(doc(db, 'characters', `char_${accountId}`));
    await deleteDoc(doc(db, 'buildings', `stall_acc_${accountId}`));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function syncCharacterToCloud(char: Character): Promise<void> {
  const path = `characters/${char.id}`;
  try {
    await setDoc(doc(db, 'characters', char.id), char, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function syncBuildingToCloud(building: BuildingZone): Promise<void> {
  const path = `buildings/${building.id}`;
  try {
    await setDoc(doc(db, 'buildings', building.id), building, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function syncLogToCloud(logMsg: LogMessage): Promise<void> {
  const path = `logs/${logMsg.id}`;
  try {
    await setDoc(doc(db, 'logs', logMsg.id), logMsg);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Real-time Negotiations Sync across Devices (for both Customer and Store Owner)
export function subscribeToNegotiations(callback: (sessions: NegotiationSession[]) => void): () => void {
  const path = 'negotiations';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: NegotiationSession[] = [];
      snapshot.forEach(docSnap => {
        const d = docSnap.data() as NegotiationSession;
        if (d && d.id && d.status) {
          list.push(d);
        }
      });
      callback(list);
    },
    (error) => handleFirestoreError(error, OperationType.GET, path)
  );
}

export async function syncNegotiationToCloud(session: NegotiationSession): Promise<void> {
  const path = `negotiations/${session.id}`;
  try {
    // Strip all undefined properties to ensure Firestore NEVER rejects the write
    const cleanSession = JSON.parse(JSON.stringify(session));
    await setDoc(doc(db, 'negotiations', session.id), cleanSession, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function addNegotiationMessageToCloud(
  sessionId: string,
  message: NegotiationMessage,
  proposedPrice?: number
): Promise<void> {
  const path = `negotiations/${sessionId}`;
  try {
    const cleanMsg = JSON.parse(JSON.stringify(message));
    const updates: Record<string, any> = {
      messages: arrayUnion(cleanMsg),
      updatedAt: Date.now()
    };
    if (proposedPrice && proposedPrice > 0) {
      updates.currentAgreedPrice = proposedPrice;
    }
    await updateDoc(doc(db, 'negotiations', sessionId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function deleteNegotiationFromCloud(sessionId: string): Promise<void> {
  const path = `negotiations/${sessionId}`;
  try {
    await deleteDoc(doc(db, 'negotiations', sessionId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Sync entire city state to Cloud Firestore in bulk (useful on first boot or when seeding 40 players)
 */
export async function bulkUploadCityToCloud(
  accounts: UserAccount[],
  characters: Character[],
  buildings: BuildingZone[]
): Promise<void> {
  try {
    const batch = writeBatch(db);
    accounts.slice(0, 50).forEach(acc => {
      batch.set(doc(db, 'accounts', acc.id), acc, { merge: true });
    });
    characters.slice(0, 50).forEach(char => {
      batch.set(doc(db, 'characters', char.id), char, { merge: true });
    });
    buildings.slice(0, 50).forEach(b => {
      batch.set(doc(db, 'buildings', b.id), b, { merge: true });
    });
    await batch.commit();
  } catch (err) {
    console.warn('Batch upload notice: ', err);
  }
}

/**
 * Real-time listener for Global Game Session (Host presence, 7-min round status & timer)
 */
export function subscribeToGameSession(callback: (session: GameSessionState) => void) {
  const path = 'game_session/global_session';
  return onSnapshot(
    doc(db, 'game_session', 'global_session'),
    (snap) => {
      if (snap.exists()) {
        const data = snap.data() as GameSessionState;
        callback(data);
      } else {
        const defaultSession: GameSessionState = {
          id: 'global_session',
          hostId: null,
          hostName: null,
          isHostPresent: false,
          status: 'waiting_for_host',
          roundDurationSeconds: 420,
          startedAt: null,
          endsAt: null,
          roundNumber: 1,
          updatedAt: Date.now()
        };
        callback(defaultSession);
      }
    },
    (error) => handleFirestoreError(error, OperationType.GET, path)
  );
}

export async function syncGameSessionToCloud(session: GameSessionState): Promise<void> {
  const path = 'game_session/global_session';
  try {
    const cleanSession = JSON.parse(JSON.stringify(session));
    await setDoc(doc(db, 'game_session', 'global_session'), cleanSession, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
