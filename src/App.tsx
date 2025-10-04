import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth, db } from "@/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { AppUser } from "@/types";
import { useNavigate } from "react-router-dom";

import AppRoutes from "@/routes";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [requireAdminSetup, setRequireAdminSetup] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      // 🔹 1. cek apakah admin sudah ada
      const adminQuery = query(
        collection(db, "users"),
        where("role", "==", "admin")
      );
      const adminSnap = await getDocs(adminQuery);

      if (adminSnap.empty) {
        setRequireAdminSetup(true);
        setLoading(false);
        return;
      }

      // 🔹 2. kalau admin sudah ada → cek user
      if (u) {
        const userRef = doc(db, "users", u.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          setAppUser(snap.data() as AppUser);
        } else {
          setAppUser(null); // bug
        }
      } else {
        setAppUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <AppRoutes
      user={user}
      appUser={appUser}
      loading={loading}
      requireAdminSetup={requireAdminSetup}
      onSignOut={handleSignOut}
    />
  );
}
