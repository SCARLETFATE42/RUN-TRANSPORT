import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import type { Route } from "./+types/customizeprofile";
import Navbar from "./navbar";
import {
  AVATAR_GRADIENTS,
  completeProfileSetup,
  getProfile,
  getProfileAuthMetadata,
  type UserProfile,
} from "../data/profileStore";
import {
  REDEEMERS_COURSE_GROUPS,
  REDEEMERS_COURSES,
} from "../data/redeemersCourses";
import { createClient } from "~/utils/supabase.client";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Customize Profile | RideCampus" },
    {
      name: "description",
      content: "Customize your RideCampus student profile, avatar theme, contact info, and safety preferences.",
    },
  ];
}

const HOSTELS = [
  "Main Hostel Prophet Moses",
  "Engineering Hostel (Male)",
  "Queen Esther Hall",
  "Numbers Hostel",
  "Engineering Hostel (Female)",
  "Postgraduate Quarters",
  "Prophet Moses Extension",
];

async function saveSupabaseProfileMetadata(profile: UserProfile) {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();

  if (!data.session) return;

  const { error } = await supabase.auth.updateUser({
    data: getProfileAuthMetadata(profile),
  });

  if (error) throw error;
}

export default function CustomizeProfile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isSetupMode = searchParams.get("setup") === "1";
  const [profile, setProfile] = useState<UserProfile>(getProfile());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const showSavedDepartment =
    profile.department && !REDEEMERS_COURSES.includes(profile.department);

  useEffect(() => {
    setProfile(getProfile());
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const completedProfile = completeProfileSetup(profile);
    setProfile(completedProfile);

    try {
      await saveSupabaseProfileMetadata(completedProfile);
    } catch (error) {
      console.warn("Unable to update Supabase profile metadata:", error);
    }

    setSavedSuccess(true);
    setIsSaving(false);
    setTimeout(() => {
      setSavedSuccess(false);
      navigate(isSetupMode ? "/select-role" : "/profile");
    }, 1200);
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        fontFamily: "'DM Sans', sans-serif",
        background: "var(--color-bg)",
      }}
    >
      {!isSetupMode && <Navbar />}

      <div
        className="flex-1 overflow-y-auto p-6"
        style={{ background: "var(--color-bg)" }}
      >
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Top navigation & header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link
                  to={isSetupMode ? "/AuthScreen" : "/profile"}
                  className="text-xs text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {isSetupMode ? "Back to Sign In" : "Back to Profile"}
                </Link>
              </div>
              <h1 className="text-2xl font-bold text-white">{isSetupMode ? "Set Up Your Profile" : "Customize Profile"}</h1>
              <p className="text-xs text-gray-400">
                Personalize your campus identity, avatar gradients, transit preferences, and emergency settings before choosing your role.
              </p>
            </div>

            {savedSuccess && (
              <div className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold animate-bounce flex items-center gap-1.5 shadow-lg">
                <span>Saved</span> {isSetupMode ? "Profile Ready!" : "Profile Saved!"}
              </div>
            )}
          </div>

          {/* Live Preview Card */}
          <div
            className="p-5 rounded-2xl border relative overflow-hidden shadow-xl"
            style={{
              background: "var(--color-surface)",
              borderColor: "var(--color-border)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                Live Student Card Preview
              </div>
              <span className="text-[11px] text-amber-400 font-bold">
                Wallet: ₦{profile.balance.toLocaleString()}
              </span>
            </div>

            <div className="flex items-start sm:items-center gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg transition-all shrink-0 overflow-hidden border border-white/10"
                style={{
                  background: profile.avatarGradient,
                  color: "#fff",
                }}
              >
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  profile.avatarInitials || "TF"
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-lg font-bold text-white truncate">
                    {profile.name || "Temi Fashola"}
                  </span>
                  <span
                    className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: "rgba(34,197,94,0.1)",
                      color: "var(--color-green)",
                      border: "1px solid rgba(34,197,94,0.2)",
                    }}
                  >
                    {profile.status}
                  </span>
                </div>

                <div className="text-xs text-gray-400 mt-0.5">
                  {profile.department} · #{profile.studentId} · {profile.level}
                </div>

                {profile.bio && (
                  <div className="text-xs text-gray-300 italic mt-1 bg-black/20 px-2.5 py-1 rounded-lg border border-white/5 inline-block">
                    "{profile.bio}"
                  </div>
                )}

                <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400 flex-wrap">
                  <span>📍 {profile.hostel} ({profile.roomNumber})</span>
                  <span>🚗 {profile.preferredVehicle || "Campus Shuttle"}</span>
                  <span>📞 {profile.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-5">
            {/* Section 1: Avatar & Theme */}
            <div
              className="p-5 rounded-2xl border space-y-4"
              style={{
                background: "var(--color-surface)",
                borderColor: "var(--color-border)",
              }}
            >
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <span>🎨</span> 1. Avatar Theme & Initials
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-gray-400">
                    Avatar Initials (1-3 letters)
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    value={profile.avatarInitials}
                    onChange={(e) =>
                      setProfile({ ...profile, avatarInitials: e.target.value.toUpperCase() })
                    }
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-black/40 border border-white/10 text-white focus:border-blue-500 outline-none uppercase font-bold tracking-wider"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5 text-gray-400">
                    Status Badge
                  </label>
                  <input
                    type="text"
                    value={profile.status}
                    onChange={(e) => setProfile({ ...profile, status: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-black/40 border border-white/10 text-white focus:border-blue-500 outline-none"
                    placeholder="e.g. Active Student"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-2 text-gray-400">
                  Select Avatar Color Theme
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {AVATAR_GRADIENTS.map((gradient) => (
                    <button
                      key={gradient.id}
                      type="button"
                      onClick={() =>
                        setProfile({ ...profile, avatarGradient: gradient.bg })
                      }
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                        profile.avatarGradient === gradient.bg
                          ? "border-white shadow-lg ring-2 ring-blue-500 bg-white/5"
                          : "border-white/10 hover:border-white/30"
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-lg shadow"
                        style={{ background: gradient.bg }}
                      />
                      <span className="text-[10px] text-gray-300 font-medium truncate w-full">
                        {gradient.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Image Upload of Choice */}
              <div className="p-4 rounded-xl bg-black/30 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-semibold text-white">
                      Custom Profile Photo of Your Choice
                    </label>
                    <p className="text-[11px] text-gray-400">
                      Upload any picture from your device or specify an image URL.
                    </p>
                  </div>
                  {profile.avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setProfile({ ...profile, avatarUrl: undefined })}
                      className="text-xs text-red-400 hover:underline cursor-pointer"
                    >
                      Reset to Initials
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Upload File</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
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
                            setProfile({ ...profile, avatarUrl: dataUrl });
                          };
                          img.src = event.target?.result as string;
                        };
                        reader.readAsDataURL(file);
                      }}
                      className="w-full text-xs text-gray-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Or Photo URL</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={profile.avatarUrl || ""}
                      onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5 text-gray-400">
                  Short Bio / Campus Motto
                </label>
                <input
                  type="text"
                  value={profile.bio || ""}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="e.g. Student Developer & Campus Tech Enthusiast"
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-black/40 border border-white/10 text-white focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Section 2: Personal & Academic Info */}
            <div
              className="p-5 rounded-2xl border space-y-4"
              style={{
                background: "var(--color-surface)",
                borderColor: "var(--color-border)",
              }}
            >
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <span>🎓</span> 2. Academic & Student Details
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-gray-400">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-black/40 border border-white/10 text-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5 text-gray-400">
                    Student Matric / ID
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.studentId}
                    onChange={(e) => setProfile({ ...profile, studentId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-black/40 border border-white/10 text-white focus:border-blue-500 outline-none uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5 text-gray-400">
                    Department / Course
                  </label>
                  <select
                    value={profile.department}
                    onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-black/40 border border-white/10 text-white focus:border-blue-500 outline-none"
                  >
                    {showSavedDepartment && (
                      <option value={profile.department} className="bg-gray-900 text-white">
                        {profile.department}
                      </option>
                    )}
                    {REDEEMERS_COURSE_GROUPS.map((group) => (
                      <optgroup
                        key={group.faculty}
                        label={group.faculty}
                        className="bg-gray-900 text-white"
                      >
                        {group.courses.map((course) => (
                          <option key={course} value={course} className="bg-gray-900 text-white">
                            {course}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5 text-gray-400">
                    Academic Level
                  </label>
                  <select
                    value={profile.level}
                    onChange={(e) => setProfile({ ...profile, level: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-black/40 border border-white/10 text-white focus:border-blue-500 outline-none"
                  >
                    {["100 Level", "200 Level", "300 Level", "400 Level", "500 Level", "Postgraduate"].map((lvl) => (
                      <option key={lvl} value={lvl} className="bg-gray-900 text-white">
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium mb-1.5 text-gray-400">
                    Student Mobile Number (for driver pickup calls)
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-black/40 border border-white/10 text-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Residence & Contacts */}
            <div
              className="p-5 rounded-2xl border space-y-4"
              style={{
                background: "var(--color-surface)",
                borderColor: "var(--color-border)",
              }}
            >
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <span>🏠</span> 3. Campus Residence & Guardian Contact
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-gray-400">
                    Hostel / Hall of Residence
                  </label>
                  <select
                    value={profile.hostel}
                    onChange={(e) => setProfile({ ...profile, hostel: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-black/40 border border-white/10 text-white focus:border-blue-500 outline-none"
                  >
                    <option value="" disabled className="bg-gray-900 text-white">
                      Select hostel / hall
                    </option>
                    {HOSTELS.map((h) => (
                      <option key={h} value={h} className="bg-gray-900 text-white">
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5 text-gray-400">
                    Room Number
                  </label>
                  <input
                    type="text"
                    value={profile.roomNumber}
                    onChange={(e) => setProfile({ ...profile, roomNumber: e.target.value })}
                    placeholder="e.g. Rm 14"
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-black/40 border border-white/10 text-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5 text-gray-400">
                    Guardian / Next of Kin Name
                  </label>
                  <input
                    type="text"
                    value={profile.guardianName}
                    onChange={(e) => setProfile({ ...profile, guardianName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-black/40 border border-white/10 text-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5 text-gray-400">
                    Guardian Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profile.guardianPhone}
                    onChange={(e) => setProfile({ ...profile, guardianPhone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-black/40 border border-white/10 text-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5 text-gray-400">
                    Guardian Relationship
                  </label>
                  <select
                    value={profile.guardianRelationship}
                    onChange={(e) => setProfile({ ...profile, guardianRelationship: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-black/40 border border-white/10 text-white focus:border-blue-500 outline-none"
                  >
                    {["Mother", "Father", "Sibling", "Sponsor", "Aunt/Uncle", "Legal Guardian"].map((r) => (
                      <option key={r} value={r} className="bg-gray-900 text-white">
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5 text-gray-400">
                    Permitted Off-Campus Exeat Scope
                  </label>
                  <input
                    type="text"
                    value={profile.permittedOffCampus}
                    onChange={(e) => setProfile({ ...profile, permittedOffCampus: e.target.value })}
                    placeholder="e.g. Hospital visits, Exeat only"
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-black/40 border border-white/10 text-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Ride Preferences & Special Requirements */}
            <div
              className="p-5 rounded-2xl border space-y-4"
              style={{
                background: "var(--color-surface)",
                borderColor: "var(--color-border)",
              }}
            >
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <span>🚗</span> 4. Transit Preferences & Accessibility
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-gray-400">
                    Default Preferred Campus Vehicle
                  </label>
                  <select
                    value={profile.preferredVehicle || "Campus Shuttle (Bus)"}
                    onChange={(e) => setProfile({ ...profile, preferredVehicle: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-black/40 border border-white/10 text-white focus:border-blue-500 outline-none"
                  >
                    <option value="Campus Shuttle (Bus)">Campus Shuttle (Bus) - Free/Shared</option>
                    <option value="School Sedan">School Sedan - Private/Fast</option>
                    <option value="School Van">School Van - Group/Luggage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5 text-gray-400">
                    Special Transit / Accessibility Notes
                  </label>
                  <input
                    type="text"
                    value={profile.specialRequirements || ""}
                    onChange={(e) => setProfile({ ...profile, specialRequirements: e.target.value })}
                    placeholder="e.g. Front seat preference, Sports gear space"
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-black/40 border border-white/10 text-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 5: Safety & Notification Toggles */}
            <div
              className="p-5 rounded-2xl border space-y-3"
              style={{
                background: "var(--color-surface)",
                borderColor: "var(--color-border)",
              }}
            >
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <span>🛡️</span> 5. Safety & Notification Preferences
              </h2>

              <div className="space-y-3 pt-1">
                <label className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/5 cursor-pointer">
                  <div>
                    <div className="text-xs font-semibold text-white">Night Ride Campus Marshall Alerts</div>
                    <div className="text-[11px] text-gray-400">
                      Alert campus security when booking rides past 09:00 PM
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={profile.preferences.nightRideAlert}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        preferences: {
                          ...profile.preferences,
                          nightRideAlert: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/5 cursor-pointer">
                  <div>
                    <div className="text-xs font-semibold text-white">Auto-Share Ride Live ETA with Guardian</div>
                    <div className="text-[11px] text-gray-400">
                      Automatically send trip tracking SMS to {profile.guardianName || "Guardian"} ({profile.guardianPhone})
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={profile.preferences.autoShareGuardian}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        preferences: {
                          ...profile.preferences,
                          autoShareGuardian: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/5 cursor-pointer">
                  <div>
                    <div className="text-xs font-semibold text-white">SMS Ride Notifications</div>
                    <div className="text-[11px] text-gray-400">
                      Receive arrival and driver contact alerts via SMS on {profile.phone}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={profile.preferences.smsNotifications}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        preferences: {
                          ...profile.preferences,
                          smsNotifications: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(isSetupMode ? "/select-role" : "/profile")}
                className="flex-1 py-3 rounded-xl text-sm font-medium border border-white/10 text-gray-300 hover:bg-white/5 transition-all cursor-pointer"
              >
                {isSetupMode ? "Skip for now" : "Cancel"}
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 py-3 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg cursor-pointer disabled:cursor-wait disabled:opacity-60"
              >
                {isSaving
                  ? "Saving..."
                  : isSetupMode
                    ? "Save and Choose Role"
                    : "Save All Profile Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
