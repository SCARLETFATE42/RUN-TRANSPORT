export interface UserProfile {
  name: string;
  department: string;
  studentId: string;
  level: string;
  status: string;
  bio?: string;
  avatarInitials: string;
  avatarGradient: string;
  avatarUrl?: string;
  role: "student" | "driver" | "authority";
  phone: string;
  guardianName: string;
  guardianPhone: string;
  guardianRelationship: string;
  hostel: string;
  roomNumber: string;
  permittedOffCampus: string;
  preferredVehicle?: string;
  specialRequirements?: string;
  balance: number;
  preferences: {
    nightRideAlert: boolean;
    autoShareGuardian: boolean;
    smsNotifications: boolean;
    emergencyContact: string;
  };
}

export const AVATAR_GRADIENTS = [
  { id: "ocean", name: "Ocean Blue", bg: "linear-gradient(135deg, #1d4ed8, #60a5fa)" },
  { id: "emerald", name: "Emerald Mint", bg: "linear-gradient(135deg, #059669, #34d399)" },
  { id: "amber", name: "Sunset Gold", bg: "linear-gradient(135deg, #d97706, #fbbf24)" },
  { id: "purple", name: "Royal Violet", bg: "linear-gradient(135deg, #7c3aed, #c084fc)" },
  { id: "crimson", name: "Crimson Rose", bg: "linear-gradient(135deg, #e11d48, #fb7185)" },
  { id: "cyber", name: "Cyber Cyan", bg: "linear-gradient(135deg, #0284c7, #22d3ee)" },
];

export const DEFAULT_PROFILE: UserProfile = {
  name: "Temi Fashola",
  department: "Computer Science",
  studentId: "RUN-2847",
  level: "300 Level",
  status: "Active Student",
  bio: "Student Developer & Campus Tech Enthusiast 💻",
  avatarInitials: "TF",
  avatarGradient: "linear-gradient(135deg, #1d4ed8, #60a5fa)",
  avatarUrl: undefined,
  role: "student",
  phone: "0812 345 6789",
  guardianName: "Mrs. Fashola",
  guardianPhone: "0803 456 7890",
  guardianRelationship: "Mother",
  hostel: "Main Dormitory, Block A",
  roomNumber: "Rm 14",
  permittedOffCampus: "Hospital visits, Exeat only",
  preferredVehicle: "Campus Shuttle (Bus)",
  specialRequirements: "Front seat or near exit",
  balance: 2400,
  preferences: {
    nightRideAlert: true,
    autoShareGuardian: true,
    smsNotifications: false,
    emergencyContact: "0803 456 7890",
  },
};

const STORAGE_KEY = "run_transport_user_profile_v2";

export function getProfile(): UserProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROFILE));
      return DEFAULT_PROFILE;
    }
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    window.dispatchEvent(new Event("profile-updated"));
  } catch (err) {
    console.error("Failed to save profile:", err);
  }
}

export function addCredits(amount: number): UserProfile {
  const current = getProfile();
  const updated: UserProfile = {
    ...current,
    balance: current.balance + amount,
  };
  saveProfile(updated);
  return updated;
}

export function updateAvatarImage(avatarUrl: string): UserProfile {
  const current = getProfile();
  const updated: UserProfile = {
    ...current,
    avatarUrl,
  };
  saveProfile(updated);
  return updated;
}

export function removeAvatarImage(): UserProfile {
  const current = getProfile();
  const updated: UserProfile = {
    ...current,
    avatarUrl: undefined,
  };
  saveProfile(updated);
  return updated;
}

export function setCurrentRole(role: "student" | "driver" | "authority"): UserProfile {
  const current = getProfile();
  const updated: UserProfile = {
    ...current,
    role,
  };
  saveProfile(updated);
  return updated;
}

export function getCurrentRole(): "student" | "driver" | "authority" {
  return getProfile().role || "student";
}
