import { useState } from "react";
import { auth, googleProvider } from "@/firebase";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";

const AuthForm: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const firebaseErr = err as FirebaseError;
      setError(firebaseErr.message);
    }
  };

  const signInWithEmail = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const firebaseErr = err as FirebaseError;
      setError(firebaseErr.message);
    }
  };

  const registerWithEmail = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const firebaseErr = err as FirebaseError;
      setError(firebaseErr.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow border w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">SchoolMS v2</h1>
        <p className="text-sm text-gray-600 text-center">
          {isRegister ? "Daftar akun baru" : "Masuk untuk melanjutkan"}
        </p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="password"
          placeholder="Kata Sandi"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {isRegister ? (
          <>
            <button
              onClick={registerWithEmail}
              className="w-full px-4 py-2 rounded-xl bg-yellow-600 text-white hover:bg-yellow-700"
            >
              Daftar
            </button>
            <p className="text-sm text-center text-gray-500">
              Sudah punya akun?{" "}
              <span
                className="text-blue-600 cursor-pointer"
                onClick={() => setIsRegister(false)}
              >
                Masuk
              </span>
            </p>
          </>
        ) : (
          <>
            <button
              onClick={signInWithEmail}
              className="w-full px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700"
            >
              Masuk
            </button>
            <p className="text-sm text-center text-gray-500">
              Belum punya akun?{" "}
              <span
                className="text-blue-600 cursor-pointer"
                onClick={() => setIsRegister(true)}
              >
                Daftar
              </span>
            </p>
          </>
        )}

        <hr className="my-2" />
        <button
          onClick={signInWithGoogle}
          className="w-full px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
        >
          Masuk dengan Google
        </button>
      </div>
    </div>
  );
};

export default AuthForm;
