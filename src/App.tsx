// src/App.tsx
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { AppUser } from "./types";

import AuthForm from "@/components/AuthForm";
import RoleSelectionModal from "@/components/RoleSelectionModal";
import Routes from "@/routes";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (u) {
        const userRef = doc(db, "users", u.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          setAppUser(snap.data() as AppUser);
          setShowRoleModal(false);
        } else {
          setShowRoleModal(true);
        }
      } else {
        setAppUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSelectRole = async (role: AppUser["role"]) => {
    if (!user) return;
    const newUser: AppUser = {
      id: user.uid,
      email: user.email || "",
      displayName: user.displayName,
      role,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(doc(db, "users", user.uid), newUser);
    setAppUser(newUser);
    setShowRoleModal(false);
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">Memuat...</div>
    );
  if (!user) return <AuthForm />;
  if (showRoleModal) return <RoleSelectionModal onSelect={handleSelectRole} />;
  if (!appUser)
    return (
      <div className="h-screen flex items-center justify-center">
        Memuat data pengguna...
      </div>
    );

  return <Routes user={user} appUser={appUser} onSignOut={handleSignOut} />;
}
