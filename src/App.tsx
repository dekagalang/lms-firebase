import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { AppUser } from "./types";
import { useNavigate } from "react-router-dom";

import AuthForm from "@/components/AuthForm";
import AppRoutes from "@/routes";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (u) {
        const userRef = doc(db, "users", u.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          setAppUser(snap.data() as AppUser);
        } else {
          const newUser: AppUser = {
            id: u.uid,
            email: u.email || "",
            firstName: u.displayName ?? "",
            role: "student",
            studentStatus: "pending",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          await setDoc(userRef, newUser);
          setAppUser(newUser);
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

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">Memuat...</div>
    );

  if (!user) return <AuthForm />;
  if (!appUser)
    return (
      <div className="h-screen flex items-center justify-center">
        Memuat data pengguna...
      </div>
    );

  return <AppRoutes user={user} appUser={appUser} onSignOut={handleSignOut} />;
}
