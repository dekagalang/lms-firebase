import { AppUser } from "@/types";

interface RoleSelectionModalProps {
  onSelect: (role: AppUser["role"]) => void;
}

const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({ onSelect }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold text-center">Pilih Peran Anda</h2>
        <p className="text-sm text-gray-600 text-center">
          Silakan pilih peran Anda untuk melanjutkan.
        </p>
        <div className="flex gap-3 justify-center">
          {["student", "teacher", "admin"].map((r) => (
            <button
              key={r}
              onClick={() => onSelect(r as AppUser["role"])}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 capitalize"
            >
              {r === "student" ? "Siswa" : r === "teacher" ? "Guru" : "Admin"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionModal;
