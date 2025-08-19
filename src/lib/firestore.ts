// src/lib/firestore.ts
import {
  collection,
  addDoc,
  getDocs,
  setDoc,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  where,
  limit,
  startAfter,
  DocumentData,
  CollectionReference,
  QueryDocumentSnapshot,
  WhereFilterOp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { AppUser } from "@/types";

/* -------------------- COLLECTION NAMES -------------------- */
export type CollectionName =
  | "students"
  | "teachers"
  | "classes"
  | "attendance"
  | "grades"
  | "fees";

interface Collections {
  students: () => CollectionReference<DocumentData>;
  teachers: () => CollectionReference<DocumentData>;
  classes: () => CollectionReference<DocumentData>;
  attendance: () => CollectionReference<DocumentData>;
  grades: () => CollectionReference<DocumentData>;
  fees: () => CollectionReference<DocumentData>;
}

const col: Collections = {
  students: () => collection(db, "students"),
  teachers: () => collection(db, "teachers"),
  classes: () => collection(db, "classes"),
  attendance: () => collection(db, "attendance"),
  grades: () => collection(db, "grades"),
  fees: () => collection(db, "fees"),
};

/* -------------------- BASE PAYLOAD -------------------- */
export interface BasePayload {
  [key: string]:
    | string
    | number
    | boolean
    | Date
    | null
    | undefined
    | Timestamp
    | Record<string, unknown>
    | Array<
        | string
        | number
        | boolean
        | Date
        | null
        | undefined
        | Record<string, unknown>
      >;
}

const withTimestamps = (p: BasePayload) => ({
  ...p,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});

/* -------------------- CREATE -------------------- */
export async function createDoc<T extends BasePayload>(
  collectionName: CollectionName,
  payload: T
): Promise<string> {
  const ref = await addDoc(col[collectionName](), withTimestamps(payload));
  return ref.id;
}

/* -------------------- READ -------------------- */
// List all docs (ordered by createdAt desc)
export async function listDocs<T extends object>(
  collectionName: CollectionName
): Promise<(T & { id: string })[]> {
  const q = query(col[collectionName](), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() } as T & { id: string })
  );
}

// Get doc by ID
export async function getDocById<T extends object>(
  collectionName: CollectionName,
  id: string
): Promise<(T & { id: string }) | null> {
  const ref = doc(db, collectionName, id);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as T & { id: string };
}

// Query with filters
export async function queryDocs<T extends object>(
  collectionName: CollectionName,
  filters: [string, WhereFilterOp, unknown][]
): Promise<(T & { id: string })[]> {
  let q = query(col[collectionName]());
  filters.forEach(([field, op, value]) => {
    q = query(q, where(field, op, value));
  });
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() } as T & { id: string })
  );
}

// List docs with pagination
export async function listDocsPaginated<T extends object>(
  collectionName: CollectionName,
  pageSize: number,
  lastDoc?: QueryDocumentSnapshot<DocumentData>
): Promise<{
  data: (T & { id: string })[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
}> {
  let q = query(
    col[collectionName](),
    orderBy("createdAt", "desc"),
    limit(pageSize)
  );
  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }
  const snapshot = await getDocs(q);
  return {
    data: snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() } as T & { id: string })
    ),
    lastDoc:
      snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null,
  };
}

/* -------------------- UPDATE -------------------- */
export async function updateDocById<T extends BasePayload>(
  collectionName: CollectionName,
  id: string,
  payload: Partial<T>
): Promise<void> {
  const ref = doc(db, collectionName, id);
  await updateDoc(ref, { ...payload, updatedAt: serverTimestamp() });
}

/* -------------------- DELETE -------------------- */
export async function deleteDocById(
  collectionName: CollectionName,
  id: string
): Promise<void> {
  const ref = doc(db, collectionName, id);
  await deleteDoc(ref);
}

/* -------------------- USERS -------------------- */
export async function getUser(uid: string) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as AppUser) : null;
}

export async function createUser(user: AppUser) {
  const ref = doc(db, "users", user.uid);
  await setDoc(ref, {
    ...user,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
