import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import type { Route } from "./+types/myprofile";
import Navbar from "./navbar";
import NigerianPaymentModal from "../components/NigerianPaymentModal";
import {
  getProfile,
  updateAvatarImage,
  removeAvatarImage,
  type UserProfile,
} from "../data/profileStore";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "My Profile | RUN Transport" },
    {
      name: "description",
      content: "Manage your RUN Transport student identity, custom profile image, and ride credits.",
    },
  ];
}

const PRESET_AVATARS = [
  { id: "stud_1", name: "Student Male", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces" },
  { id: "stud_2", name: "Student Female", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop&crop=faces" },
  { id: "stud_3", name: "Tech Scholar", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=faces" },
  { id: "stud_4", name: "Campus Leader", url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=300&fit=crop&crop=faces" },
  { id: "drv_1", name: "Campus Driver", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=faces" },
  { id: "auth_1", name: "School Marshall", url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=faces" },
];

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>(getProfile());
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshProfile = () => {
    setProfile(getProfile());
  };

  useEffect(() => {
    refreshProfile();
    const handleUpdate = () => refreshProfile();
    window.addEventListener("profile-updated", handleUpdate);
    return () => window.removeEventListener("profile-updated", handleUpdate);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handle local image file upload & compression
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (JPEG, PNG, WebP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 320;
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > maxDim) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          }
        } else {
          if (h > maxDim) {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

        updateAvatarImage(dataUrl);
        refreshProfile();
        setShowImageModal(false);
        showToast("Profile image updated successfully!");
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;
    updateAvatarImage(customUrlInput.trim());
    refreshProfile();
    setShowImageModal(false);
    setCustomUrlInput("");
    showToast("Profile image updated from URL!");
  };

  const handleSelectPreset = (url: string) => {
    updateAvatarImage(url);
    refreshProfile();
    setShowImageModal(false);
    showToast("Avatar updated!");
  };

  const handleRemovePhoto = () => {
    removeAvatarImage();
    refreshProfile();
    setShowImageModal(false);
    showToast("Custom photo removed. Default initials restored.");
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        fontFamily: "'DM Sans', sans-serif",
        background: "var(--color-bg)",
      }}
    >
      <Navbar />

      <div
        className="flex-1 overflow-y-auto p-6"
        style={{ background: "var(--color-bg)" }}
      >
        <div className="max-w-xl mx-auto space-y-4">
          {/* Toast alert */}
          {toastMessage && (
            <div className="fixed top-6 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-bold shadow-2xl animate-bounce flex items-center gap-2">
              <span>✓</span>
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Header with Customize Button */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold mb-1 text-white">
                My Profile
              </h1>
              <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                Redeemer's University Student Identity & Wallet
              </p>
            </div>

            <Link
              to="/customize-profile"
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-600/30 ring-1 ring-white/20"
            >
              <span>✏️</span>
              <span>Customize Profile</span>
            </Link>
          </div>

          {/* Avatar section with interactive image upload */}
          <div
            className="flex items-center gap-4 p-5 rounded-2xl relative"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
            }}
          >
            {/* Clickable Avatar Photo */}
            <div
              onClick={() => setShowImageModal(true)}
              className="relative w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0 shadow-lg cursor-pointer overflow-hidden group border-2 border-white/10 hover:border-blue-500 transition-all"
              style={{
                background: profile.avatarGradient,
                color: "#fff",
              }}
              title="Click to put in an image of your choice"
            >
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                profile.avatarInitials || "TF"
              )}

              {/* Hover overlay with camera icon */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[10px] text-white font-medium">
                <span className="text-base">📷</span>
                <span>Change</span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="text-lg font-semibold text-white truncate">
                  {profile.name}
                </div>
                <button
                  onClick={() => setShowImageModal(true)}
                  className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 hover:bg-blue-500/25 transition-all cursor-pointer"
                >
                  📷 Change Photo
                </button>
              </div>

              <div
                className="text-xs truncate mt-0.5"
                style={{ color: "var(--color-muted)" }}
              >
                {profile.department} · Student ID: {profile.studentId} · {profile.level}
              </div>

              {profile.bio && (
                <div className="text-xs text-gray-300 italic mt-1 bg-black/20 px-2 py-0.5 rounded-md border border-white/5 inline-block">
                  "{profile.bio}"
                </div>
              )}

              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background: "rgba(34,197,94,0.1)",
                    color: "var(--color-green)",
                    border: "1px solid rgba(34,197,94,0.2)",
                  }}
                >
                  {profile.status}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    color: "var(--color-muted)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  📞 {profile.phone}
                </span>
              </div>
            </div>
          </div>

          {/* Info cards */}
          <div className="space-y-3">
            {[
              {
                label: `Guardian Contact (${profile.guardianRelationship})`,
                value: `${profile.guardianName} · ${profile.guardianPhone}`,
                icon: "👪",
              },
              {
                label: "Hostel / Hall of Residence",
                value: `${profile.hostel} · ${profile.roomNumber}`,
                icon: "🏠",
              },
              {
                label: "Preferred Campus Transit & Needs",
                value: `${profile.preferredVehicle || "Campus Shuttle"}${profile.specialRequirements ? ` · (${profile.specialRequirements})` : ""}`,
                icon: "🚗",
              },
              {
                label: "Permitted Off-campus",
                value: profile.permittedOffCampus,
                icon: "🗺️",
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <span className="text-xl w-8 text-center">{row.icon}</span>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-xs"
                    style={{ color: "var(--color-subtle)" }}
                  >
                    {row.label}
                  </div>
                  <div className="text-sm font-medium text-white truncate">
                    {row.value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Credits Balance & Top-Up */}
          <div
            className="p-5 rounded-2xl"
            style={{
              background: "rgba(251,191,36,0.06)",
              border: "1px solid rgba(251,191,36,0.15)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs font-medium text-gray-400 block">
                  Ride Credits Balance
                </span>
                <span
                  className="text-2xl font-bold"
                  style={{ color: "var(--color-amber)" }}
                >
                  ₦{profile.balance.toLocaleString()}
                </span>
              </div>

              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <span>💳</span>
                <span>Top Up Wallet</span>
              </button>
            </div>

            <div
              className="h-1.5 rounded-full overflow-hidden mb-3"
              style={{ background: "var(--color-border)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(15, (profile.balance / 5000) * 100))}%`,
                  background: "var(--color-amber)",
                }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-400">
              <span>Instant Nigerian Banking: Transfer, Cards, USSD & OPay</span>
              <span className="text-emerald-400 font-medium">Secured by NIBSS ✓</span>
            </div>
          </div>

          {/* Settings & Customization list */}
          <div className="space-y-1 pt-1">
            {[
              { label: "Customize Profile & Themes", sub: "Edit initials, color gradient, hostel & contacts", icon: "🎨", path: "/customize-profile" },
              { label: "Choose Campus Role", sub: `Currently: ${profile.role?.toUpperCase() || "STUDENT"}`, icon: "👥", path: "/select-role" },
              { label: "Notification & SMS Alerts", sub: profile.preferences.smsNotifications ? "Enabled" : "Disabled", icon: "🔔" },
              { label: "Night Ride Safety Settings", sub: profile.preferences.nightRideAlert ? "Campus Marshall Active" : "Off", icon: "🛡️" },
              { label: "Guardian Trip Sharing", sub: profile.preferences.autoShareGuardian ? "Live ETA SMS Active" : "Off", icon: "📱" },
              { label: "Fleet Applications Portal", sub: "Admin Review & Approvals", icon: "🧑‍✈️", path: "/fleet-reviews" },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => item.path ? navigate(item.path) : navigate("/customize-profile")}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm text-left transition-all cursor-pointer border border-transparent hover:border-white/5"
                style={{
                  color: "var(--color-muted)",
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                <div className="flex items-center gap-3">
                  <span>{item.icon}</span>
                  <div>
                    <div className="text-white text-xs font-medium">{item.label}</div>
                    <div className="text-[11px] text-gray-500">{item.sub}</div>
                  </div>
                </div>
                <span style={{ color: "var(--color-subtle)" }}>›</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CUSTOM IMAGE SELECTION MODAL ── */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div
            className="w-full max-w-md rounded-3xl p-6 border shadow-2xl text-white space-y-5"
            style={{
              background: "#0c1526",
              borderColor: "var(--color-border)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Choose Profile Picture</h3>
                <p className="text-xs text-gray-400">Put in any photo of your choice from your device or online.</p>
              </div>
              <button
                onClick={() => setShowImageModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Current Image Preview */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/40 border border-white/5">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-md overflow-hidden border border-white/10 shrink-0"
                style={{ background: profile.avatarGradient }}
              >
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  profile.avatarInitials || "TF"
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white">Current Picture</div>
                <div className="text-[11px] text-gray-400 truncate">
                  {profile.avatarUrl ? "Custom image active" : "Default gradient initials active"}
                </div>
                {profile.avatarUrl && (
                  <button
                    onClick={handleRemovePhoto}
                    className="mt-1.5 text-[11px] text-red-400 hover:underline cursor-pointer"
                  >
                    Remove Photo & Reset
                  </button>
                )}
              </div>
            </div>

            {/* Option A: Upload from Device */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Option 1: Upload from Computer or Phone
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 rounded-xl border border-dashed border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>📁</span>
                <span>Select Image File from Device</span>
              </button>
            </div>

            {/* Option B: Preset Avatars */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">
                Option 2: Pick from Popular Avatars
              </label>
              <div className="grid grid-cols-6 gap-2">
                {PRESET_AVATARS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPreset(p.url)}
                    className="w-12 h-12 rounded-xl overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all cursor-pointer shadow-md hover:scale-105"
                    title={p.name}
                  >
                    <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Option C: Image URL Input */}
            <form onSubmit={handleApplyCustomUrl}>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Option 3: Or Paste Direct Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:border-blue-500 outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white cursor-pointer transition-all"
                >
                  Apply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Nigerian Payment Gateway Modal */}
      <NigerianPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        defaultAmount="2500"
        onSuccess={() => {
          refreshProfile();
        }}
      />
    </div>
  );
}
