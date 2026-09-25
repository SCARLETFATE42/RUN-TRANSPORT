import type { User } from "@supabase/supabase-js";

export interface UserProfile {
  supabaseUserId?: string;
  email?: string;
  profileSetupComplete?: boolean;
  registeredAsAuthority?: boolean;
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
  supabaseUserId: undefined,
  email: undefined,
  profileSetupComplete: false,
  registeredAsAuthority: false,
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
const USER_PROFILE_STORAGE_PREFIX = "run_transport_user_profile_identity_v2:";

function getIdentityStorageKeys(profile: Pick<UserProfile, "supabaseUserId" | "email">) {
  return [profile.supabaseUserId, profile.email]
    .filter((value): value is string => Boolean(value?.trim()))
    .map((value) => `${USER_PROFILE_STORAGE_PREFIX}${value.toLowerCase()}`);
}

function normalizeProfile(profile: Partial<UserProfile>): UserProfile {
  return {
    ...DEFAULT_PROFILE,
    ...profile,
    registeredAsAuthority: Boolean(profile.registeredAsAuthority),
    preferences: {
      ...DEFAULT_PROFILE.preferences,
      ...(profile.preferences ?? {}),
    },
  };
}

function getStoredProfileForIdentity(user: Pick<User, "id" | "email">): UserProfile | null {
  if (typeof window === "undefined") return null;

  const keys = getIdentityStorageKeys({
    supabaseUserId: user.id,
    email: user.email ?? undefined,
  });

  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return normalizeProfile(JSON.parse(raw) as Partial<UserProfile>);
    } catch {
      // Ignore malformed per-user profile backups and keep checking.
    }
  }

  return null;
}

export function getProfile(): UserProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROFILE));
      return DEFAULT_PROFILE;
    }
    const stored = JSON.parse(raw) as Partial<UserProfile>;
    return normalizeProfile(stored);
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    getIdentityStorageKeys(profile).forEach((key) => {
      localStorage.setItem(key, JSON.stringify(profile));
    });
    window.dispatchEvent(new Event("profile-updated"));
  } catch (err) {
    console.error("Failed to save profile:", err);
  }
}

function getStringMetadataValue(
  metadata: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = metadata[key];
  return typeof value === "string" && value.trim() ? value : undefined;
}

function getBooleanMetadataValue(
  metadata: Record<string, unknown>,
  key: string,
): boolean | undefined {
  const value = metadata[key];
  return typeof value === "boolean" ? value : undefined;
}

function getObjectMetadataValue(
  metadata: Record<string, unknown>,
  key: string,
): Record<string, unknown> | undefined {
  const value = metadata[key];
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }
  return value as Record<string, unknown>;
}

function getProfileRole(value: unknown): UserProfile["role"] | undefined {
  return value === "student" || value === "driver" || value === "authority"
    ? value
    : undefined;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function isUnclaimedDefaultProfile(profile: UserProfile): boolean {
  return (
    !profile.supabaseUserId &&
    !profile.email &&
    profile.name === DEFAULT_PROFILE.name &&
    profile.studentId === DEFAULT_PROFILE.studentId &&
    profile.profileSetupComplete === DEFAULT_PROFILE.profileSetupComplete
  );
}

function createStarterProfile(user: User, name: string): UserProfile {
  const initials = getInitials(name) || "RU";

  return {
    ...DEFAULT_PROFILE,
    supabaseUserId: user.id,
    email: user.email ?? undefined,
    name,
    department: "Computer Science",
    studentId: "",
    level: "100 Level",
    status: "Active Student",
    bio: "",
    avatarInitials: initials,
    avatarUrl: undefined,
    role: "student",
    phone: "",
    guardianName: "",
    guardianPhone: "",
    guardianRelationship: "",
    hostel: "",
    roomNumber: "",
    permittedOffCampus: "",
    preferredVehicle: "Campus Shuttle (Bus)",
    specialRequirements: "",
    balance: 0,
    profileSetupComplete: false,
    registeredAsAuthority: false,
    preferences: {
      nightRideAlert: true,
      autoShareGuardian: true,
      smsNotifications: false,
      emergencyContact: "",
    },
  };
}

export function syncProfileFromSupabaseUser(user: User): UserProfile {
  const current = getProfile();
  const metadata = user.user_metadata ?? {};
  const savedProfile = getObjectMetadataValue(metadata, "run_transport_profile");
  const localProfile = getStoredProfileForIdentity(user);
  const savedPreferences = savedProfile
    ? getObjectMetadataValue(savedProfile, "preferences")
    : undefined;
  const isDifferentUser =
    Boolean(current.supabaseUserId) && current.supabaseUserId !== user.id;
  const metadataName =
    getStringMetadataValue(metadata, "full_name") ??
    getStringMetadataValue(metadata, "name") ??
    user.email ??
    DEFAULT_PROFILE.name;
  const starterProfile = createStarterProfile(user, metadataName);
  const baseProfile = localProfile
    ? localProfile
    : isDifferentUser || isUnclaimedDefaultProfile(current)
      ? starterProfile
      : current;
  const name =
    (savedProfile && getStringMetadataValue(savedProfile, "name")) ??
    metadataName ??
    baseProfile.name;
  const avatarUrl =
    (savedProfile && getStringMetadataValue(savedProfile, "avatarUrl")) ??
    getStringMetadataValue(metadata, "avatar_url") ??
    getStringMetadataValue(metadata, "picture") ??
    baseProfile.avatarUrl;
  const registeredAsAuthority =
    (savedProfile &&
      getBooleanMetadataValue(savedProfile, "registeredAsAuthority")) ??
    getBooleanMetadataValue(metadata, "registered_as_authority") ??
    baseProfile.registeredAsAuthority ??
    false;
  const savedRole =
    (savedProfile && getProfileRole(savedProfile.role)) ?? baseProfile.role;
  const role =
    savedRole === "authority" && !registeredAsAuthority ? "student" : savedRole;

  const updated: UserProfile = {
    ...baseProfile,
    supabaseUserId: user.id,
    email: user.email ?? baseProfile.email,
    name,
    department:
      (savedProfile && getStringMetadataValue(savedProfile, "department")) ??
      baseProfile.department,
    studentId:
      (savedProfile && getStringMetadataValue(savedProfile, "studentId")) ??
      baseProfile.studentId,
    level:
      (savedProfile && getStringMetadataValue(savedProfile, "level")) ??
      baseProfile.level,
    status:
      (savedProfile && getStringMetadataValue(savedProfile, "status")) ??
      baseProfile.status,
    bio:
      (savedProfile && getStringMetadataValue(savedProfile, "bio")) ??
      baseProfile.bio,
    avatarInitials:
      ((savedProfile && getStringMetadataValue(savedProfile, "avatarInitials")) ??
        getInitials(name)) || baseProfile.avatarInitials,
    avatarGradient:
      (savedProfile && getStringMetadataValue(savedProfile, "avatarGradient")) ??
      baseProfile.avatarGradient,
    avatarUrl,
    role,
    phone:
      (savedProfile && getStringMetadataValue(savedProfile, "phone")) ??
      baseProfile.phone,
    guardianName:
      (savedProfile && getStringMetadataValue(savedProfile, "guardianName")) ??
      baseProfile.guardianName,
    guardianPhone:
      (savedProfile && getStringMetadataValue(savedProfile, "guardianPhone")) ??
      baseProfile.guardianPhone,
    guardianRelationship:
      (savedProfile &&
        getStringMetadataValue(savedProfile, "guardianRelationship")) ??
      baseProfile.guardianRelationship,
    hostel:
      (savedProfile && getStringMetadataValue(savedProfile, "hostel")) ??
      baseProfile.hostel,
    roomNumber:
      (savedProfile && getStringMetadataValue(savedProfile, "roomNumber")) ??
      baseProfile.roomNumber,
    permittedOffCampus:
      (savedProfile &&
        getStringMetadataValue(savedProfile, "permittedOffCampus")) ??
      baseProfile.permittedOffCampus,
    preferredVehicle:
      (savedProfile && getStringMetadataValue(savedProfile, "preferredVehicle")) ??
      baseProfile.preferredVehicle,
    specialRequirements:
      (savedProfile &&
        getStringMetadataValue(savedProfile, "specialRequirements")) ??
      baseProfile.specialRequirements,
    preferences: {
      ...baseProfile.preferences,
      nightRideAlert:
        (savedPreferences &&
          getBooleanMetadataValue(savedPreferences, "nightRideAlert")) ??
        baseProfile.preferences.nightRideAlert,
      autoShareGuardian:
        (savedPreferences &&
          getBooleanMetadataValue(savedPreferences, "autoShareGuardian")) ??
        baseProfile.preferences.autoShareGuardian,
      smsNotifications:
        (savedPreferences &&
          getBooleanMetadataValue(savedPreferences, "smsNotifications")) ??
        baseProfile.preferences.smsNotifications,
      emergencyContact:
        (savedPreferences &&
          getStringMetadataValue(savedPreferences, "emergencyContact")) ??
        baseProfile.preferences.emergencyContact,
    },
    profileSetupComplete:
      Boolean(
        (savedProfile &&
          getBooleanMetadataValue(savedProfile, "profileSetupComplete")) ||
          baseProfile.profileSetupComplete,
      ),
    registeredAsAuthority,
  };

  saveProfile(updated);
  return updated;
}

export function completeProfileSetup(profile: UserProfile): UserProfile {
  const updated: UserProfile = {
    ...profile,
    role:
      profile.role === "authority" && !profile.registeredAsAuthority
        ? "student"
        : profile.role,
    avatarInitials:
      profile.avatarInitials.trim().toUpperCase() ||
      getInitials(profile.name) ||
      DEFAULT_PROFILE.avatarInitials,
    profileSetupComplete: true,
    preferences: {
      ...profile.preferences,
      emergencyContact:
        profile.preferences.emergencyContact || profile.guardianPhone,
    },
  };

  saveProfile(updated);
  return updated;
}

export function shouldCompleteProfile(profile = getProfile()): boolean {
  return !profile.profileSetupComplete;
}

export function getPostAuthRedirectPath(profile = getProfile()): string {
  return shouldCompleteProfile(profile)
    ? "/customize-profile?setup=1"
    : "/select-role";
}

export function getProfileAuthMetadata(profile: UserProfile) {
  const avatarUrl =
    profile.avatarUrl && !profile.avatarUrl.startsWith("data:")
      ? profile.avatarUrl
      : undefined;

  return {
    full_name: profile.name,
    name: profile.name,
    avatar_url: avatarUrl,
    registered_as_authority: Boolean(profile.registeredAsAuthority),
    run_transport_profile: {
      name: profile.name,
      department: profile.department,
      studentId: profile.studentId,
      level: profile.level,
      status: profile.status,
      bio: profile.bio,
      avatarInitials: profile.avatarInitials,
      avatarGradient: profile.avatarGradient,
      avatarUrl,
      role: profile.role,
      phone: profile.phone,
      guardianName: profile.guardianName,
      guardianPhone: profile.guardianPhone,
      guardianRelationship: profile.guardianRelationship,
      hostel: profile.hostel,
      roomNumber: profile.roomNumber,
      permittedOffCampus: profile.permittedOffCampus,
      preferredVehicle: profile.preferredVehicle,
      specialRequirements: profile.specialRequirements,
      profileSetupComplete: Boolean(profile.profileSetupComplete),
      registeredAsAuthority: Boolean(profile.registeredAsAuthority),
      preferences: profile.preferences,
    },
  };
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
  const safeRole =
    role === "authority" && !current.registeredAsAuthority
      ? current.role || "student"
      : role;
  const updated: UserProfile = {
    ...current,
    role: safeRole,
  };
  saveProfile(updated);
  return updated;
}

export function getCurrentRole(): "student" | "driver" | "authority" {
  return getProfile().role || "student";
}

export function canUseAuthorityRole(profile = getProfile()): boolean {
  return Boolean(profile.registeredAsAuthority);
}
