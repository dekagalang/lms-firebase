import { useState } from "react";
import { auth, googleProvider, db } from "@/firebase";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { useNavigate } from "react-router-dom";
import type { AppUser } from "@/types";

const AuthForm: React.FC = () => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 Sign in / Sign up with Google
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // 🔹 Cek apakah user sudah ada di Firestore
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        const newUser: AppUser = {
          id: user.uid,
          email: user.email || "",
          firstName: user.displayName ?? "",
          role: "student",
          studentStatus: "inactive",
          teacherStatus: "inactive",
          accountStatus: "pending",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(userRef, newUser);
      }

      navigate("/dashboard");
    } catch (err) {
      const firebaseErr = err as FirebaseError;
      setError(firebaseErr.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Handle Email/Password Login & Register
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        // ✅ Daftar akun baru
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        // 🔹 Update display name (nama lengkap)
        await updateProfile(user, { displayName: fullName });

        // 🔹 Buat dokumen user di Firestore
        const userRef = doc(db, "users", user.uid);
        const newUser: AppUser = {
          id: user.uid,
          email: user.email || "",
          firstName: fullName,
          role: "student",
          studentStatus: "inactive",
          teacherStatus: "inactive",
          accountStatus: "pending",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(userRef, newUser);
      } else {
        // ✅ Login
        await signInWithEmailAndPassword(auth, email, password);
      }

      navigate("/dashboard");
    } catch (err) {
      const firebaseErr = err as FirebaseError;
      setError(firebaseErr.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow border w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">SchoolMS v2</h1>
        <p className="text-sm text-gray-600 text-center">
          {isRegister ? "Daftar akun baru" : "Masuk untuk melanjutkan"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <input
              type="text"
              placeholder="Nama Lengkap"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />

          <input
            type="password"
            placeholder="Kata Sandi"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-2 rounded-xl text-white flex items-center justify-center gap-2 ${
              isRegister
                ? "bg-yellow-600 hover:bg-yellow-700"
                : "bg-green-600 hover:bg-green-700"
            } ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                <span>Memproses...</span>
              </>
            ) : isRegister ? (
              "Daftar"
            ) : (
              "Masuk"
            )}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500">
          {isRegister ? "Sudah punya akun? " : "Belum punya akun? "}
          <span
            className="text-blue-600 cursor-pointer"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? "Masuk" : "Daftar"}
          </span>
        </p>

        <hr className="my-2" />

        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className={`w-full px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-2 ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              <span>Memproses...</span>
            </>
          ) : (
            "Masuk dengan Google"
          )}
        </button>
      </div>
    </div>
  );
};

export default AuthForm;
