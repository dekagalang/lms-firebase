import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  DocumentData,
  CollectionReference,
} from "firebase/firestore";
import { db } from "../firebase";

type CollectionName = "students" | "teachers" | "classes" | "attendance" | "grades" | "fees";

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

interface BasePayload {
  [key: string]: string | number | boolean | Date | null | undefined | Record<string, unknown> | Array<string | number | boolean | Date | null | undefined | Record<string, unknown>>;
}

const withTimestamps = (p: BasePayload) => ({
  ...p,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});

export async function createDoc(collectionName: CollectionName, payload: BasePayload): Promise<string> {
  const ref = await addDoc(col[collectionName](), withTimestamps(payload));
  return ref.id;
}

export async function listDocs<T>(collectionName: CollectionName): Promise<T[]> {
  const q = query(col[collectionName](), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as T[];
}

export async function updateDocById(
  collectionName: CollectionName,
  id: string,
  payload: Partial<BasePayload>
): Promise<void> {
  const ref = doc(db, collectionName, id);
  await updateDoc(ref, { ...payload, updatedAt: serverTimestamp() });
}

export async function deleteDocById(collectionName: CollectionName, id: string): Promise<void> {
  const ref = doc(db, collectionName, id);
  await deleteDoc(ref);
}
