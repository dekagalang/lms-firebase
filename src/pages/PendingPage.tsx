import { useNavigate } from "react-router-dom";
import { auth } from "@/firebase";

export default function PendingPage() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await auth.signOut();
    navigate("/", { replace: true });
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-2xl font-bold mb-4">Menunggu Persetujuan Admin</h1>
      <p className="text-gray-700">
        Akun Anda sedang menunggu approval dari admin. Anda tidak dapat
        mengakses website sampai akun diaktifkan.
      </p>
      <button
        onClick={handleSignOut}
        className="mt-6 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Keluar
      </button>
    </div>
  );
}
