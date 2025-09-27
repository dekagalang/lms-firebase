import { useEffect, useState, FormEvent } from "react";
import { auth } from "@/firebase";
import {
  getDocById,
  updateDocById,
  clearAllCollections,
} from "@/lib/firestore";
import type { AppUser } from "@/types";

export default function Settings() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notification, setNotification] = useState(false);

  const [loadingForm, setLoadingForm] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);

  const currentUid = auth.currentUser?.uid;

  // Fetch user dari Firestore by id
  const fetchUser = async () => {
    if (!currentUid) return;
    setLoadingUser(true);
    try {
      const data = await getDocById<AppUser>("users", currentUid);
      if (data) {
        setUser(data);
        setName(data.displayName ?? "");
        setEmail(data.email ?? "");
        setNotification(data.notification ?? false);
      }
    } catch (err) {
      console.error(err);
      alert("Gagal memuat data user");
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [currentUid]);

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.id) return;
    try {
      setLoadingForm(true);
      await updateDocById("users", user.id, {
        displayName: name,
        notification,
      });
      alert("Pengaturan berhasil disimpan!");
      fetchUser(); // refresh data
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan pengaturan");
    } finally {
      setLoadingForm(false);
    }
  };

  const handleResetData = async () => {
    if (
      !confirm(
        "⚠️ Yakin ingin menghapus SEMUA data? Tindakan ini tidak dapat dibatalkan."
      )
    )
      return;
    try {
      setLoadingReset(true);
      await clearAllCollections();
      alert("✅ Semua data berhasil direset!");
    } catch (err) {
      console.error(err);
      alert("Gagal mereset data.");
    } finally {
      setLoadingReset(false);
    }
  };

  if (loadingUser) {
    return <div className="text-gray-500">Memuat data user...</div>;
  }

  if (!user) {
    return <div className="text-red-500">User tidak ditemukan</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Pengaturan</h2>

      {/* Form Pengaturan */}
      <form
        onSubmit={handleSave}
        className="bg-white p-4 rounded-2xl shadow border grid grid-cols-1 md:grid-cols-2 gap-3"
      >
        <div>
          <label className="text-sm">Nama</label>
          <input
            type="text"
            className="mt-1 w-full border rounded-xl px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm">Email</label>
          <input
            type="email"
            className="mt-1 w-full border rounded-xl px-3 py-2 bg-gray-100"
            value={email}
            disabled
          />
        </div>

        <div className="md:col-span-2 flex items-center gap-2">
          <input
            id="notification"
            type="checkbox"
            checked={notification}
            onChange={() => setNotification(!notification)}
            className="h-4 w-4"
          />
          <label htmlFor="notification" className="text-sm cursor-pointer">
            Aktifkan notifikasi
          </label>
        </div>

        <button
          type="submit"
          disabled={loadingForm}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white md:col-span-2 disabled:opacity-50"
        >
          {loadingForm ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </form>

      {/* Pengaturan Khusus Admin */}
      {user.role === "admin" && (
        <div className="bg-white p-4 rounded-2xl shadow border space-y-3">
          <h3 className="text-lg font-medium">Pengaturan Sistem</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleResetData}
              disabled={loadingReset}
              className="px-4 py-2 bg-red-600 text-white rounded-xl disabled:opacity-50"
            >
              {loadingReset ? "Mereset..." : "Reset Data"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
