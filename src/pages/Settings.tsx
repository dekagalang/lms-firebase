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

  // Modal untuk reset data
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");

  // Modal setelah reset sukses
  const [showPostResetModal, setShowPostResetModal] = useState(false);

  const currentUid = auth.currentUser?.uid;

  const fetchUser = async () => {
    if (!currentUid) return;
    setLoadingUser(true);
    try {
      const data = await getDocById<AppUser>("users", currentUid);
      if (data) {
        setUser(data);
        setName(data.firstName ?? "");
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
        firstName: name,
        notification,
      });
      alert("Pengaturan berhasil disimpan!");
      fetchUser();
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan pengaturan");
    } finally {
      setLoadingForm(false);
    }
  };

  const handleResetData = async () => {
    if (resetConfirmText !== "reset") return;

    try {
      setLoadingReset(true);
      await clearAllCollections();

      // Tutup modal konfirmasi dan tampilkan modal sukses
      setShowResetModal(false);
      setResetConfirmText("");
      setShowPostResetModal(true);
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
    <>
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Pengaturan</h2>

        {/* Form Pengaturan */}
        <form
          onSubmit={handleSave}
          className="bg-white p-4 rounded-2xl shadow border grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          <div>
            <label className="text-sm text-gray-600">Nama</label>
            <input
              type="text"
              className="mt-1 w-full border rounded-xl px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Email</label>
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

        {/* Admin Reset */}
        {user.role === "admin" && (
          <div className="bg-white p-4 rounded-2xl shadow border space-y-3">
            <h3 className="text-lg font-medium">Pengaturan Sistem</h3>
            <div>
              <button
                onClick={() => setShowResetModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-xl"
              >
                Reset Data
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Konfirmasi Reset */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-10">
          <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-lg space-y-4 mx-2">
            <h3 className="text-lg font-semibold">Konfirmasi Reset Data</h3>
            <p className="text-sm text-gray-700">
              ⚠️ Ketik <strong>reset</strong> untuk menghapus SEMUA data.
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <input
              type="text"
              placeholder="reset"
              value={resetConfirmText}
              onChange={(e) => setResetConfirmText(e.target.value)}
              className="w-full border rounded-xl px-3 py-2"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowResetModal(false);
                  setResetConfirmText("");
                }}
                className="px-3 py-2 rounded-xl border"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleResetData}
                disabled={resetConfirmText !== "reset" || loadingReset}
                className="px-3 py-2 rounded-xl bg-red-600 text-white disabled:opacity-50"
              >
                {loadingReset ? "Mereset..." : "Reset"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Setelah Reset Sukses */}
      {showPostResetModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-20">
          <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-lg space-y-4 text-center">
            <h3 className="text-xl font-semibold text-green-700">
              Reset Berhasil!
            </h3>
            <p className="text-gray-700 text-sm">
              Semua data telah dihapus. Anda perlu membuat ulang akun admin
              utama untuk memulai sistem kembali.
            </p>
            <div className="flex justify-center gap-3 mt-4">
              <button
                onClick={() => setShowPostResetModal(false)}
                className="px-4 py-2 rounded-xl border"
              >
                Tutup
              </button>
              <button
                onClick={() => (window.location.href = "/setup-admin")}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white"
              >
                Mulai Ulang Setup Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
