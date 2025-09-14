import { AppUser } from "@/types";
import { useState, FormEvent } from "react";
import { updateDocById, clearAllCollections } from "@/lib/firestore";

interface SettingsProps {
  appUser: AppUser;
}

export default function Settings({ appUser }: SettingsProps) {
  const [name, setName] = useState(appUser.displayName ?? "");
  const [email] = useState(appUser.email ?? "");
  const [notification, setNotification] = useState(
    appUser.notification ?? false
  );
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateDocById("users", appUser.id, {
        displayName: name ?? "",
        notification: notification ?? false,
      });
      alert("Pengaturan berhasil disimpan!");
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan pengaturan");
    } finally {
      setLoading(false);
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
      setLoading(true);
      await clearAllCollections();
      alert("✅ Semua data berhasil direset!");
    } catch (err) {
      console.error(err);
      alert("Gagal mereset data.");
    } finally {
      setLoading(false);
    }
  };

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
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white md:col-span-2 disabled:opacity-50"
        >
          {loading ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </form>

      {/* Pengaturan Khusus Admin */}
      {appUser.role === "admin" && (
        <div className="bg-white p-4 rounded-2xl shadow border space-y-3">
          <h3 className="text-lg font-medium">Pengaturan Sistem</h3>
          <div className="flex flex-wrap gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-xl">
              Kelola Pengguna
            </button>
            <button
              onClick={handleResetData}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-xl disabled:opacity-50"
            >
              {loading ? "Mereset..." : "Reset Data"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
