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
  limit,
} from "firebase/firestore";
import { db } from "../firebase";
const col = {
  students: () => collection(db, "students"),
  teachers: () => collection(db, "teachers"),
  classes: () => collection(db, "classes"),
  attendance: () => collection(db, "attendance"),
  grades: () => collection(db, "grades"),
  fees: () => collection(db, "fees"),
};
const withTimestamps = (p) => ({
  ...p,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});
export async function createDoc(collectionName, payload) {
  const ref = await addDoc(col[collectionName](), withTimestamps(payload));
  return ref.id;
}
export async function listDocs(collectionName) {
  const q = query(
    col[collectionName](),
    orderBy("createdAt", "desc"),
    limit(200)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
export async function updateDocById(collectionName, id, updates) {
  const r = doc(db, collectionName, id);
  await updateDoc(r, { ...updates, updatedAt: serverTimestamp() });
}
export async function deleteDocById(collectionName, id) {
  const r = doc(db, collectionName, id);
  await deleteDoc(r);
}
