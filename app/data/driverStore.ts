export type DriverStatus = "pending" | "approved" | "rejected";

export interface DriverLicenseDocument {
  fileName: string;
  fileType: string;
  dataUrl: string;
}

export interface DriverApplication {
  id: string;
  fullName: string;
  phone: string;
  vehicleType: string;
  licensePlate: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: DriverStatus;
  submittedAt: string;
  driverId?: string;
  experienceYears?: string;
  guarantorName?: string;
  guarantorPhone?: string;
  preferredRoute?: string;
  driverLicenseDocument?: DriverLicenseDocument;
  reviewNotes?: string;
  verifiedChecks: {
    license: boolean;
    insurance: boolean;
    securityClearance: boolean;
    bankAccount: boolean;
  };
}

export const INITIAL_APPLICATIONS: DriverApplication[] = [
  {
    id: "APP-2026-042",
    fullName: "Sunday Balogun",
    phone: "0802 345 8899",
    vehicleType: "School Sedan",
    licensePlate: "EKY-492AA",
    bankName: "GTBank",
    accountNumber: "0123984712",
    accountName: "Sunday Balogun",
    status: "approved",
    driverId: "RUN-DRV-007",
    experienceYears: "6 years",
    guarantorName: "Elder J. Adeyemi",
    guarantorPhone: "0803 771 9922",
    preferredRoute: "Main Gate, Academic Block A & Sports Complex",
    submittedAt: "Yesterday, 09:30 AM",
    reviewNotes: "Security verification completed by Campus Marshall. Background check cleared.",
    verifiedChecks: {
      license: true,
      insurance: true,
      securityClearance: true,
      bankAccount: true,
    },
  },
  {
    id: "APP-2026-043",
    fullName: "Emmanuel Okonkwo",
    phone: "0813 902 1144",
    vehicleType: "School Van",
    licensePlate: "APP-781DE",
    bankName: "Zenith Bank",
    accountNumber: "2081947291",
    accountName: "Emmanuel Chuka Okonkwo",
    status: "approved",
    driverId: "RUN-DRV-012",
    experienceYears: "8 years",
    guarantorName: "Dr. K. Williams",
    guarantorPhone: "0802 445 6677",
    preferredRoute: "Hospital Visits, Off-Campus Exeats & Chapel",
    submittedAt: "2 days ago",
    reviewNotes: "Assigned to hospital & off-campus exeat runs. Vehicle passed mechanical inspection.",
    verifiedChecks: {
      license: true,
      insurance: true,
      securityClearance: true,
      bankAccount: true,
    },
  },
  {
    id: "APP-2026-044",
    fullName: "Babatunde Alabi",
    phone: "0805 112 3344",
    vehicleType: "Campus Shuttle (Bus)",
    licensePlate: "OSN-302XY",
    bankName: "Access Bank",
    accountNumber: "0091827364",
    accountName: "Babatunde T. Alabi",
    status: "pending",
    experienceYears: "4 years",
    guarantorName: "Pastor M. Ogundipe",
    guarantorPhone: "0806 333 4455",
    preferredRoute: "Hostel Loop (Queen Esther / Daniel Hall to Dining)",
    submittedAt: "Today, 10:15 AM",
    reviewNotes: "Awaiting final biometric security stamp from Student Affairs Office.",
    verifiedChecks: {
      license: true,
      insurance: true,
      securityClearance: false,
      bankAccount: true,
    },
  },
  {
    id: "APP-2026-045",
    fullName: "Chinedu Eze",
    phone: "0703 881 2299",
    vehicleType: "School Sedan",
    licensePlate: "ABJ-512CD",
    bankName: "OPay",
    accountNumber: "8038812299",
    accountName: "Chinedu Francis Eze",
    status: "pending",
    experienceYears: "3 years",
    guarantorName: "Mrs. N. Eze",
    guarantorPhone: "0802 119 4488",
    preferredRoute: "All Campus Routes & Night Shifts",
    submittedAt: "Today, 11:40 AM",
    reviewNotes: "Submitted OPay wallet account. Vehicle insurance certificate requires renewal.",
    verifiedChecks: {
      license: true,
      insurance: false,
      securityClearance: false,
      bankAccount: true,
    },
  },
  {
    id: "APP-2026-046",
    fullName: "Oluwaseun Adeleke",
    phone: "0901 223 8844",
    vehicleType: "Campus Shuttle (Bus)",
    licensePlate: "LND-883AA",
    bankName: "First Bank",
    accountNumber: "3081948290",
    accountName: "Oluwaseun Peter Adeleke",
    status: "approved",
    driverId: "RUN-DRV-019",
    experienceYears: "10 years",
    guarantorName: "Chief S. Adeleke",
    guarantorPhone: "0803 222 1100",
    preferredRoute: "Auditorium & Library Express",
    submittedAt: "3 days ago",
    reviewNotes: "Cleared by Security Marshall. High student rating on shuttle runs.",
    verifiedChecks: {
      license: true,
      insurance: true,
      securityClearance: true,
      bankAccount: true,
    },
  },
];

const STORAGE_KEY = "run_transport_driver_applications_v2";

function parseStoredApplications(raw: string): DriverApplication[] {
  const parsed = JSON.parse(raw) as unknown;
  return Array.isArray(parsed) ? (parsed as DriverApplication[]) : INITIAL_APPLICATIONS;
}

function generateApplicationId(applications: DriverApplication[]): string {
  const usedIds = new Set(applications.map((app) => app.id));
  for (let attempt = 0; attempt < 900; attempt += 1) {
    const id = `APP-2026-${Math.floor(100 + Math.random() * 900)}`;
    if (!usedIds.has(id)) return id;
  }
  return `APP-2026-${Date.now()}`;
}

function generateDriverId(applications: DriverApplication[]): string {
  const usedIds = new Set(
    applications
      .map((app) => app.driverId)
      .filter((value): value is string => Boolean(value)),
  );
  for (let attempt = 0; attempt < 900; attempt += 1) {
    const id = `RUN-DRV-${Math.floor(100 + Math.random() * 900)}`;
    if (!usedIds.has(id)) return id;
  }
  return `RUN-DRV-${Date.now()}`;
}

export function getApplications(): DriverApplication[] {
  if (typeof window === "undefined") return INITIAL_APPLICATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_APPLICATIONS));
      return INITIAL_APPLICATIONS;
    }
    return parseStoredApplications(raw);
  } catch {
    return INITIAL_APPLICATIONS;
  }
}

export function submitApplication(data: {
  fullName: string;
  phone: string;
  vehicleType: string;
  licensePlate: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  experienceYears?: string;
  guarantorName?: string;
  guarantorPhone?: string;
  preferredRoute?: string;
  driverLicenseDocument?: DriverLicenseDocument;
}): DriverApplication {
  const current = getApplications();
  const newApp: DriverApplication = {
    id: generateApplicationId(current),
    fullName: data.fullName,
    phone: data.phone,
    vehicleType: data.vehicleType,
    licensePlate: data.licensePlate.toUpperCase(),
    bankName: data.bankName,
    accountNumber: data.accountNumber,
    accountName: data.accountName,
    experienceYears: data.experienceYears || "3+ years",
    guarantorName: data.guarantorName || "Pastor / HOD Referral",
    guarantorPhone: data.guarantorPhone || "0803 000 0000",
    preferredRoute: data.preferredRoute || "All Campus Zones",
    driverLicenseDocument: data.driverLicenseDocument,
    status: "pending",
    submittedAt: "Just now",
    verifiedChecks: {
      license: Boolean(data.driverLicenseDocument),
      insurance: true,
      securityClearance: false,
      bankAccount: true,
    },
  };
  const updated = [newApp, ...current];
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("driver-applications-updated"));
  }
  return newApp;
}

export function updateApplicationStatus(
  id: string,
  status: DriverStatus,
  notes?: string
): DriverApplication[] {
  const current = getApplications();
  const updated = current.map((app) => {
    if (app.id === id) {
      const driverId =
        status === "approved"
          ? app.driverId || generateDriverId(current)
          : undefined;
      return {
        ...app,
        status,
        driverId,
        reviewNotes: notes || app.reviewNotes,
        verifiedChecks:
          status === "approved"
            ? {
                license: true,
                insurance: true,
                securityClearance: true,
                bankAccount: true,
              }
            : app.verifiedChecks,
      };
    }
    return app;
  });
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("driver-applications-updated"));
  }
  return updated;
}
