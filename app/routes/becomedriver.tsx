import { useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/becomedriver";
import Navbar from "./navbar";
import {
  submitApplication,
  type DriverApplication,
  type DriverLicenseDocument,
} from "../data/driverStore";
import { NIGERIAN_BANKS } from "../data/mockData";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Become a Driver | RideCampus" },
    {
      name: "description",
      content: "Register to join the Redeemer's University transport fleet.",
    },
  ];
}

export default function BecomeDriver() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicleType, setVehicleType] = useState("Campus Shuttle (Bus)");
  const [licensePlate, setLicensePlate] = useState("");
  const [driverLicenseDocument, setDriverLicenseDocument] =
    useState<DriverLicenseDocument | null>(null);
  const [licenseUploadError, setLicenseUploadError] = useState("");
  const [experienceYears, setExperienceYears] = useState("3-5 years");
  const [preferredRoute, setPreferredRoute] = useState("All Campus Routes (Dorms, Dining, Faculties)");
  
  // Banking payout fields
  const [bankName, setBankName] = useState("GTBank");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [isVerifyingAccount, setIsVerifyingAccount] = useState(false);

  // Guarantor fields
  const [guarantorName, setGuarantorName] = useState("");
  const [guarantorPhone, setGuarantorPhone] = useState("");

  const [submittedApp, setSubmittedApp] = useState<DriverApplication | null>(null);

  const handleAccountNumberChange = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 10);
    setAccountNumber(clean);
    if (clean.length === 10) {
      setIsVerifyingAccount(true);
      setTimeout(() => {
        setIsVerifyingAccount(false);
        if (!accountName && fullName) {
          setAccountName(fullName.toUpperCase());
        }
      }, 600);
    }
  };

  const handleDriverLicenseUpload = (file?: File) => {
    setLicenseUploadError("");

    if (!file) {
      setDriverLicenseDocument(null);
      return;
    }

    const isAllowedType =
      file.type.startsWith("image/") ||
      file.type === "application/pdf" ||
      file.type === "application/msword" ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    if (!isAllowedType) {
      setDriverLicenseDocument(null);
      setLicenseUploadError("Upload a license photo, PDF, DOC, or DOCX file.");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setDriverLicenseDocument(null);
      setLicenseUploadError("Driver license file must be 4MB or smaller.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = typeof event.target?.result === "string" ? event.target.result : "";
      if (!dataUrl) {
        setLicenseUploadError("Unable to read that driver license file.");
        return;
      }

      setDriverLicenseDocument({
        fileName: file.name,
        fileType: file.type || "application/octet-stream",
        dataUrl,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !licensePlate || !accountNumber || !accountName || !driverLicenseDocument) {
      alert("Please fill in all required driver details, upload your driver's license, and add banking payout information.");
      return;
    }
    const app = submitApplication({
      fullName,
      phone,
      vehicleType,
      licensePlate,
      bankName,
      accountNumber,
      accountName,
      experienceYears,
      guarantorName,
      guarantorPhone,
      preferredRoute,
      driverLicenseDocument,
    });
    setSubmittedApp(app);
    setFullName("");
    setPhone("");
    setLicensePlate("");
    setAccountNumber("");
    setAccountName("");
    setDriverLicenseDocument(null);
    setGuarantorName("");
    setGuarantorPhone("");
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
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Fleet Onboarding 2026/2027
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white">
                Become a Campus Driver
              </h1>
              <p className="text-xs text-gray-400">
                Drive within Redeemer's University campus. Earn weekly payouts directly to your Nigerian bank.
              </p>
            </div>

            <Link
              to="/fleet-reviews"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all flex items-center gap-1.5 self-start sm:self-auto shadow-sm cursor-pointer"
            >
              <span>📋</span>
              <span>Review Applications Portal ↗</span>
            </Link>
          </div>

          {/* Submitted Confirmation Banner */}
          {submittedApp && (
            <div
              className="p-5 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 space-y-3 animate-fadeIn"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Application Received!</h3>
                  <p className="text-xs text-gray-300">
                    Tracking ID: <span className="font-mono font-bold text-emerald-300">{submittedApp.id}</span> for <strong className="text-white">{submittedApp.fullName}</strong>.
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Banking details ({submittedApp.bankName} - {submittedApp.accountNumber}) submitted for NIBSS weekly auto-disbursement.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Link
                  to="/fleet-reviews"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md"
                >
                  View in Review Portal →
                </Link>
                <button
                  type="button"
                  onClick={() => setSubmittedApp(null)}
                  className="px-3 py-2 rounded-xl text-xs text-gray-400 hover:text-white"
                >
                  Submit Another Application
                </button>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-5 gap-6">
            {/* Left Form (3 columns) */}
            <div className="md:col-span-3 space-y-4">
              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {/* 1. Driver & Vehicle Profile */}
                <div
                  className="p-5 rounded-2xl space-y-4 border"
                  style={{
                    background: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                    <span>🧑‍✈️</span> 1. Driver & Vehicle Information
                  </h2>

                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-gray-400">
                      Full Legal Name (as on Driver's License)
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl text-sm bg-black/40 border border-white/10 text-white focus:border-blue-500 outline-none"
                      placeholder="e.g. Sunday Babatunde Balogun"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1.5 text-gray-400">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl text-sm bg-black/40 border border-white/10 text-white focus:border-blue-500 outline-none"
                        placeholder="0803 123 4567"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1.5 text-gray-400">
                        Driving Experience
                      </label>
                      <select
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl text-sm bg-black/40 border border-white/10 text-white focus:border-blue-500 outline-none"
                      >
                        <option value="1-2 years">1-2 years</option>
                        <option value="3-5 years">3-5 years</option>
                        <option value="6-10 years">6-10 years</option>
                        <option value="10+ years">10+ years</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1.5 text-gray-400">
                        Vehicle Type
                      </label>
                      <select
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl text-sm bg-black/40 border border-white/10 text-white focus:border-blue-500 outline-none"
                      >
                        <option value="Campus Shuttle (Bus)">Campus Shuttle (Bus)</option>
                        <option value="School Sedan">School Sedan</option>
                        <option value="School Van">School Van</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1.5 text-gray-400">
                        License Plate Number
                      </label>
                      <input
                        type="text"
                        required
                        value={licensePlate}
                        onChange={(e) => setLicensePlate(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl text-sm bg-black/40 border border-white/10 text-white focus:border-blue-500 outline-none uppercase font-mono"
                        placeholder="EKY-492AA"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-gray-400">
                      Preferred Campus Route Zone
                    </label>
                    <select
                      value={preferredRoute}
                      onChange={(e) => setPreferredRoute(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl text-sm bg-black/40 border border-white/10 text-white focus:border-blue-500 outline-none"
                    >
                      <option value="All Campus Routes (Dorms, Dining, Faculties)">All Campus Routes (Dorms, Dining, Faculties)</option>
                      <option value="Hostel & Chapel Loop Express">Hostel & Chapel Loop Express</option>
                      <option value="Main Gate & Visitor Terminal">Main Gate & Visitor Terminal</option>
                      <option value="Off-Campus Hospital & Exeat Transport">Off-Campus Hospital & Exeat Transport</option>
                    </select>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                    <label className="block text-xs font-semibold text-white">
                      Driver's License Upload
                    </label>
                    <p className="mt-1 text-[11px] text-gray-400">
                      Upload a clear license photo or a PDF/DOC document for review.
                    </p>
                    <input
                      type="file"
                      required
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={(e) => handleDriverLicenseUpload(e.target.files?.[0])}
                      className="mt-3 w-full text-xs text-gray-400 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-emerald-500"
                    />
                    {driverLicenseDocument && (
                      <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2">
                        <div className="min-w-0">
                          <div className="truncate text-xs font-semibold text-emerald-300">
                            {driverLicenseDocument.fileName}
                          </div>
                          <div className="text-[11px] text-gray-400">
                            Ready for school authority review
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDriverLicenseDocument(null)}
                          className="shrink-0 text-[11px] font-semibold text-red-300 hover:text-red-200"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                    {licenseUploadError && (
                      <div className="mt-2 text-[11px] text-red-300">
                        {licenseUploadError}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Banking Payout Information */}
                <div
                  className="p-5 rounded-2xl space-y-4 border"
                  style={{
                    background: "rgba(5,150,105,0.05)",
                    borderColor: "rgba(5,150,105,0.25)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                      <span>🏦</span> 2. Banking & Weekly Payout Details
                    </h2>
                    <span className="text-[10px] uppercase font-bold text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded">
                      NIBSS Auto-Pay
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Enter the Nigerian bank account where your 85% weekly trip earnings will be transferred every Friday.
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1.5 text-gray-400">
                        Select Nigerian Bank
                      </label>
                      <select
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl text-sm bg-black/40 border border-white/10 text-white focus:border-emerald-500 outline-none"
                      >
                        {NIGERIAN_BANKS.map((b) => (
                          <option key={b} value={b} className="bg-gray-900 text-white">
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1.5 text-gray-400">
                        10-Digit Account Number
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={10}
                        value={accountNumber}
                        onChange={(e) => handleAccountNumberChange(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl text-sm bg-black/40 border border-white/10 text-white focus:border-emerald-500 outline-none font-mono tracking-wider"
                        placeholder="0123456789"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-medium text-gray-400">
                        Account Holder Name (Verified NIBSS Name)
                      </label>
                      {isVerifyingAccount && (
                        <span className="text-[11px] text-amber-400 animate-pulse">
                          Resolving Account Name...
                        </span>
                      )}
                      {accountNumber.length === 10 && !isVerifyingAccount && (
                        <span className="text-[11px] text-emerald-400 font-medium">
                          ✓ NIBSS Match
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl text-sm bg-black/40 border border-white/10 text-white focus:border-emerald-500 outline-none"
                      placeholder="e.g. SUNDAY BABATUNDE BALOGUN"
                    />
                  </div>
                </div>

                {/* 3. Guarantor Reference */}
                <div
                  className="p-5 rounded-2xl space-y-4 border"
                  style={{
                    background: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                    <span>🤝</span> 3. Campus Guarantor / Referral
                  </h2>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1.5 text-gray-400">
                        Guarantor Name (Staff / Clergy / Elder)
                      </label>
                      <input
                        type="text"
                        value={guarantorName}
                        onChange={(e) => setGuarantorName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl text-sm bg-black/40 border border-white/10 text-white focus:border-blue-500 outline-none"
                        placeholder="e.g. Pastor M. Adeleke"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1.5 text-gray-400">
                        Guarantor Phone
                      </label>
                      <input
                        type="tel"
                        value={guarantorPhone}
                        onChange={(e) => setGuarantorPhone(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl text-sm bg-black/40 border border-white/10 text-white focus:border-blue-500 outline-none"
                        placeholder="0803 000 0000"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Submit Driver Application & Banking Details</span>
                  <span>🚀</span>
                </button>
              </form>
            </div>

            {/* Right Side Info (2 columns) */}
            <div className="md:col-span-2 space-y-4">
              <div
                className="p-5 rounded-2xl border"
                style={{
                  background: "var(--color-surface)",
                  borderColor: "var(--color-border)",
                }}
              >
                <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <span>📋</span> Driver Checklist
                </h2>
                <ul className="space-y-3.5 text-xs text-gray-300">
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-400 font-bold text-sm">✓</span>
                    <div>
                      <strong className="text-white">FRSC Driver's License</strong>
                      <p className="text-[11px] text-gray-400">Must have at least 6 months validity</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-400 font-bold text-sm">✓</span>
                    <div>
                      <strong className="text-white">Comprehensive Insurance</strong>
                      <p className="text-[11px] text-gray-400">Passenger liability and vehicle roadworthiness</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-400 font-bold text-sm">✓</span>
                    <div>
                      <strong className="text-white">Security Marshall Vetting</strong>
                      <p className="text-[11px] text-gray-400">Redeemer's University Security Marshall stamp</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-400 font-bold text-sm">✓</span>
                    <div>
                      <strong className="text-white">Nigerian Bank Payout Account</strong>
                      <p className="text-[11px] text-gray-400">Weekly automated bank transfer every Friday</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div
                className="p-5 rounded-2xl border space-y-2"
                style={{
                  background: "rgba(29,78,216,0.08)",
                  borderColor: "rgba(29,78,216,0.2)",
                }}
              >
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span>💰</span> Driver Earnings Model
                </h2>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Drivers retain <strong className="text-white">85% of standard trip fares</strong>. Peak morning shuttle loops (07:00 AM - 09:00 AM) and Sunday chapel services carry enhanced campus mobility allowances.
                </p>
                <div className="pt-2 border-t border-white/10 flex justify-between text-xs">
                  <span className="text-gray-400">Average Weekly Pay:</span>
                  <span className="font-bold text-amber-400">₦28,500 – ₦65,000</span>
                </div>
              </div>

              <div
                className="p-5 rounded-2xl border space-y-2"
                style={{
                  background: "var(--color-surface)",
                  borderColor: "var(--color-border)",
                }}
              >
                <h3 className="text-xs font-semibold text-white flex items-center gap-2">
                  <span>📞</span> Fleet Support Desk
                </h3>
                <p className="text-[11px] text-gray-400">
                  Questions regarding vehicle inspection or license renewals? Contact the Transport Unit at Central Admin Block.
                </p>
                <div className="text-xs font-mono text-blue-400">
                  transport@run.edu.ng · ext 4402
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
