import { useState, useEffect } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/driverapplications";
import Navbar from "./navbar";
import {
  getApplications,
  updateApplicationStatus,
  type DriverApplication,
  type DriverStatus,
} from "../data/driverStore";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Driver Applications Review | RideCampus Admin" },
    {
      name: "description",
      content: "Review, approve, and manage Redeemer's University campus driver fleet applications and banking payouts.",
    },
  ];
}

export default function DriverApplicationsReview() {
  const [applications, setApplications] = useState<DriverApplication[]>(getApplications);
  const [filter, setFilter] = useState<"all" | DriverStatus>("all");
  const [vehicleFilter, setVehicleFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [inspectingApp, setInspectingApp] = useState<DriverApplication | null>(null);
  const [reviewNoteInput, setReviewNoteInput] = useState("");
  const [actionSuccessMessage, setActionSuccessMessage] = useState("");
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const refreshList = () => {
    setApplications(getApplications());
  };

  useEffect(() => {
    refreshList();
    const handleUpdate = () => refreshList();
    window.addEventListener("driver-applications-updated", handleUpdate);
    return () => window.removeEventListener("driver-applications-updated", handleUpdate);
  }, []);

  const handleCopyAccount = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedAccount(text);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  const handleStatusChange = (id: string, status: DriverStatus, note?: string) => {
    const updated = updateApplicationStatus(id, status, note || reviewNoteInput);
    setApplications(updated);
    if (inspectingApp?.id === id) {
      const found = updated.find((a) => a.id === id) || null;
      setInspectingApp(found);
    }
    const msg =
      status === "approved"
        ? "Driver Approved & ID Issued!"
        : status === "rejected"
        ? "Application Marked as Rejected"
        : "Application Reopened";
    setActionSuccessMessage(msg);
    setReviewNoteInput("");
    setTimeout(() => setActionSuccessMessage(""), 3000);
  };

  const filteredApps = applications.filter((app) => {
    const matchesFilter = filter === "all" ? true : app.status === filter;
    const matchesVehicle =
      vehicleFilter === "all" ? true : app.vehicleType.toLowerCase().includes(vehicleFilter.toLowerCase());
    const matchesSearch =
      app.fullName.toLowerCase().includes(search.toLowerCase()) ||
      app.licensePlate.toLowerCase().includes(search.toLowerCase()) ||
      app.phone.includes(search) ||
      (app.bankName && app.bankName.toLowerCase().includes(search.toLowerCase())) ||
      (app.accountNumber && app.accountNumber.includes(search)) ||
      (app.driverId && app.driverId.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesVehicle && matchesSearch;
  });

  const totalCount = applications.length;
  const pendingCount = applications.filter((a) => a.status === "pending").length;
  const approvedCount = applications.filter((a) => a.status === "approved").length;
  const rejectedCount = applications.filter((a) => a.status === "rejected").length;

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
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Campus Fleet Administration & Payouts
                </span>
                <span className="text-xs text-gray-500">· Redeemer's University</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Driver Applications Review</h1>
              <p className="text-xs text-gray-400">
                Inspect applicant credentials, verify FRSC licenses, and authorize Nigerian bank weekly disbursements.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/drivers"
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <span>+</span> New Driver Form
              </Link>
            </div>
          </div>

          {/* Feedback Toast */}
          {actionSuccessMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fadeIn shadow-lg">
              <span className="flex items-center gap-2">
                <span>✓</span> {actionSuccessMessage}
              </span>
              <button
                onClick={() => setActionSuccessMessage("")}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Applications", value: totalCount, icon: "📋", color: "text-white", sub: "Fleet Database" },
              { label: "Pending Review", value: pendingCount, icon: "⏳", color: "text-amber-400", sub: "Needs Vetting" },
              { label: "Active Fleet Drivers", value: approvedCount, icon: "🛡️", color: "text-emerald-400", sub: "Earning Weekly" },
              { label: "Rejected / Suspended", value: rejectedCount, icon: "✕", color: "text-red-400", sub: "Ineligible" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-4 rounded-xl border"
                style={{
                  background: "var(--color-surface)",
                  borderColor: "var(--color-border)",
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xl">{stat.icon}</span>
                  <span className="text-[10px] text-gray-500 uppercase font-semibold">{stat.sub}</span>
                </div>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Search, Status & Vehicle Filters */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              {/* Status Tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10 w-full sm:w-auto overflow-x-auto">
                {[
                  { id: "all", label: `All (${totalCount})` },
                  { id: "pending", label: `Pending (${pendingCount})` },
                  { id: "approved", label: `Approved (${approvedCount})` },
                  { id: "rejected", label: `Rejected (${rejectedCount})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFilter(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                      filter === tab.id
                        ? "bg-blue-600 text-white shadow-sm font-semibold"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="w-full sm:w-72">
                <input
                  type="text"
                  placeholder="Search name, bank, plate, ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-black/30 border border-white/10 text-white placeholder-gray-500 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Vehicle Type Pills */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500 font-medium text-[11px]">Vehicle:</span>
              {[
                { id: "all", label: "All Vehicles" },
                { id: "shuttle", label: "🚌 Campus Shuttle" },
                { id: "sedan", label: "🚗 School Sedan" },
                { id: "van", label: "🚐 School Van" },
              ].map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVehicleFilter(v.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer border ${
                    vehicleFilter === v.id
                      ? "bg-white/15 text-white border-white/30"
                      : "border-transparent text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Applications List */}
          <div className="space-y-3.5">
            {filteredApps.length === 0 ? (
              <div
                className="p-12 text-center rounded-2xl border space-y-2"
                style={{
                  background: "var(--color-surface)",
                  borderColor: "var(--color-border)",
                }}
              >
                <div className="text-3xl">📭</div>
                <div className="text-sm font-semibold text-white">No driver applications found</div>
                <p className="text-xs text-gray-400">
                  {search ? "Try adjusting your search criteria." : "No applications matching this filter category."}
                </p>
              </div>
            ) : (
              filteredApps.map((app) => (
                <div
                  key={app.id}
                  className="p-5 rounded-2xl border transition-all hover:border-white/20"
                  style={{
                    background: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  {/* Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-xl font-bold shrink-0">
                        {app.vehicleType.includes("Shuttle") ? "🚌" : app.vehicleType.includes("Van") ? "🚐" : "🚗"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-white text-base">
                            {app.fullName}
                          </span>
                          {app.driverId && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                              ID: {app.driverId}
                            </span>
                          )}
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-gray-300 border border-white/10 font-mono">
                            {app.licensePlate}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {app.vehicleType} · 📞 <a href={`tel:${app.phone}`} className="text-blue-400 hover:underline">{app.phone}</a> · Route: {app.preferredRoute || "Campus Zones"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize border ${
                          app.status === "approved"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : app.status === "pending"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : "bg-red-500/10 text-red-400 border-red-500/30"
                        }`}
                      >
                        ● {app.status}
                      </span>
                      <span className="text-[11px] text-gray-500">{app.submittedAt}</span>
                    </div>
                  </div>

                  {/* Middle Row: Banking Payout Information */}
                  <div className="py-3 grid sm:grid-cols-2 gap-3 text-xs border-b border-white/5">
                    {/* Bank account box */}
                    <div className="p-3 rounded-xl bg-black/30 border border-emerald-500/20 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1">
                          <span>🏦</span> Nigerian Banking Payout Details
                        </div>
                        <div className="text-white font-medium mt-1">
                          {app.bankName} · <span className="font-mono font-bold">{app.accountNumber}</span>
                        </div>
                        <div className="text-[11px] text-gray-400">
                          Beneficiary: <strong className="text-gray-200">{app.accountName}</strong>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopyAccount(app.accountNumber)}
                        className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30 transition-all cursor-pointer shrink-0"
                      >
                        {copiedAccount === app.accountNumber ? "Copied! ✓" : "Copy Acct"}
                      </button>
                    </div>

                    {/* Guarantor and Experience Box */}
                    <div className="p-3 rounded-xl bg-black/30 border border-white/10 flex flex-col justify-center space-y-1">
                      <div className="text-[11px] text-gray-400">
                        Experience: <strong className="text-white">{app.experienceYears || "3+ years"}</strong>
                      </div>
                      <div className="text-[11px] text-gray-400">
                        Guarantor: <span className="text-gray-200">{app.guarantorName || "HOD / Clergy Endorsed"}</span>
                        {app.guarantorPhone && (
                          <span className="text-gray-400"> ({app.guarantorPhone})</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Verification Checklist Badges */}
                  <div className="pt-3 flex flex-wrap gap-2 items-center">
                    <span
                      className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                        app.verifiedChecks.license
                          ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/20"
                          : "bg-gray-800 text-gray-500 border-gray-700"
                      }`}
                    >
                      {app.verifiedChecks.license ? "✓" : "○"} FRSC Driver's License
                    </span>
                    <span
                      className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                        app.verifiedChecks.insurance
                          ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/20"
                          : "bg-gray-800 text-gray-500 border-gray-700"
                      }`}
                    >
                      {app.verifiedChecks.insurance ? "✓" : "○"} Comprehensive Insurance
                    </span>
                    <span
                      className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                        app.verifiedChecks.securityClearance
                          ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/20"
                          : "bg-gray-800 text-gray-500 border-gray-700"
                      }`}
                    >
                      {app.verifiedChecks.securityClearance ? "✓" : "○"} Security Marshall Clearance
                    </span>
                    <span
                      className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                        app.verifiedChecks.bankAccount
                          ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/20"
                          : "bg-gray-800 text-gray-500 border-gray-700"
                      }`}
                    >
                      {app.verifiedChecks.bankAccount ? "✓" : "○"} NIBSS Account Verified
                    </span>
                  </div>

                  {/* Review Notes */}
                  {app.reviewNotes && (
                    <div className="mt-3 p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs text-gray-300">
                      <strong className="text-gray-400">Review Note:</strong> {app.reviewNotes}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs text-gray-400">
                      Tracking Code: <span className="font-mono text-gray-300 font-semibold">{app.id}</span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setInspectingApp(app)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10 text-gray-300 hover:bg-white/5 transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span>🔍</span> Inspect Dossier
                      </button>

                      {app.status === "pending" && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(
                                app.id,
                                "rejected",
                                "Declined by Fleet Admin due to missing or invalid documentation."
                              )
                            }
                            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(
                                app.id,
                                "approved",
                                "Approved & Verified by Redeemer's University Transport Marshall."
                              )
                            }
                            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md cursor-pointer"
                          >
                            Approve & Issue Driver ID 🚀
                          </button>
                        </>
                      )}

                      {app.status === "approved" && (
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusChange(app.id, "rejected", "Driver fleet status suspended by Admin.")
                          }
                          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-all cursor-pointer"
                        >
                          Suspend Driver
                        </button>
                      )}

                      {app.status === "rejected" && (
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusChange(app.id, "pending", "Application reopened for reconsideration.")
                          }
                          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-all cursor-pointer"
                        >
                          Reopen Application
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Detailed Dossier Modal */}
      {inspectingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div
            className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border flex flex-col max-h-[90vh]"
            style={{
              background: "var(--color-surface-2)",
              borderColor: "var(--color-border)",
            }}
          >
            <div
              className="p-5 border-b flex items-center justify-between"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-surface)",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-xl font-bold">
                  {inspectingApp.vehicleType.includes("Shuttle") ? "🚌" : inspectingApp.vehicleType.includes("Van") ? "🚐" : "🚗"}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{inspectingApp.fullName}</h3>
                  <div className="text-xs text-gray-400">
                    Dossier #{inspectingApp.id} · {inspectingApp.vehicleType}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setInspectingApp(null)}
                className="text-gray-400 hover:text-white text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                  <div className="text-gray-400">Phone Number:</div>
                  <div className="text-white font-medium text-sm mt-0.5">{inspectingApp.phone}</div>
                </div>
                <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                  <div className="text-gray-400">License Plate:</div>
                  <div className="text-white font-mono font-bold text-sm mt-0.5">{inspectingApp.licensePlate}</div>
                </div>
              </div>

              {/* Bank Payout section */}
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🏦</span> Bank Payout Details
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Bank Name:</span>
                  <span className="text-white font-semibold">{inspectingApp.bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Account Number:</span>
                  <span className="text-white font-mono font-bold">{inspectingApp.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Account Holder Name:</span>
                  <span className="text-emerald-300 font-semibold">{inspectingApp.accountName}</span>
                </div>
              </div>

              {/* Route & Guarantor */}
              <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2">
                <div className="text-gray-400">Preferred Route Zone:</div>
                <div className="text-white font-medium">{inspectingApp.preferredRoute || "All Campus Zones"}</div>

                <div className="pt-2 border-t border-white/5 flex justify-between">
                  <span className="text-gray-400">Campus Guarantor:</span>
                  <span className="text-white">{inspectingApp.guarantorName || "N/A"} ({inspectingApp.guarantorPhone || "N/A"})</span>
                </div>
              </div>

              {/* Add/Edit Marshall Review Note */}
              <div className="space-y-1.5">
                <label className="block text-gray-400 font-medium">Add Security Marshall / Admin Note</label>
                <textarea
                  rows={2}
                  value={reviewNoteInput}
                  onChange={(e) => setReviewNoteInput(e.target.value)}
                  placeholder="e.g. Cleared by Marshall on 18/08/2026. Ready for fleet assignment."
                  className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-blue-500 text-xs"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleStatusChange(inspectingApp.id, "rejected")}
                  className="flex-1 py-2.5 rounded-xl text-xs font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                >
                  Reject Application
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange(inspectingApp.id, "approved")}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md cursor-pointer"
                >
                  Approve & Issue ID 🚀
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
