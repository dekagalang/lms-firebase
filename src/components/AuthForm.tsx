import { useState } from "react";
import { auth, googleProvider } from "@/firebase";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { useNavigate } from "react-router-dom";

const AuthForm: React.FC = () => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/dashboard");
    } catch (err) {
      const firebaseErr = err as FirebaseError;
      setError(firebaseErr.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate("/dashboard");
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

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <button
            type="submit"
            className={`w-full px-4 py-2 rounded-xl text-white ${
              isRegister
                ? "bg-yellow-600 hover:bg-yellow-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isRegister ? "Daftar" : "Masuk"}
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
          className="w-full px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
        >
          Masuk dengan Google
        </button>
      </div>
    </div>
  );
};

export default AuthForm;
