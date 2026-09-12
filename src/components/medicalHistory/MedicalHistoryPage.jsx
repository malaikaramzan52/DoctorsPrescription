import React, { useState } from "react";
import {
  BookOpen,
  Search,
  Printer,
  Eye,
  FileText,
  Calendar,
  User,
  Filter,
} from "lucide-react";
import { useClinic } from "../../context/ClinicContext";
import { Modal } from "../common/Modal";
import { PrescriptionSheet } from "../consultation/PrescriptionSheet";

export const MedicalHistoryPage = () => {
  const { visits } = useClinic();
  const [dateFilter, setDateFilter] = useState("allTime"); // today, yesterday, thisWeek, thisMonth, allTime, custom
  const [customDate, setCustomDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVisitForModal, setSelectedVisitForModal] = useState(null);
  const [selectedVisitForPrint, setSelectedVisitForPrint] = useState(null);

  const datePresets = [
    { id: "today", label: "Today" },
    { id: "yesterday", label: "Yesterday" },
    { id: "thisWeek", label: "This Week" },
    { id: "thisMonth", label: "This Month" },
    { id: "allTime", label: "All Time" },
  ];

  const todayStr = new Date().toISOString().split("T")[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const currentMonthStr = new Date().toISOString().slice(0, 7);

  const filterByDate = (dateStr) => {
    if (!dateStr) return true;
    if (dateFilter === "allTime") return true;
    if (dateFilter === "today") return dateStr === todayStr;
    if (dateFilter === "yesterday") return dateStr === yesterdayStr;
    if (dateFilter === "thisWeek") {
      const dTime = new Date(dateStr).getTime();
      const weekAgo = Date.now() - 7 * 86400000;
      return dTime >= weekAgo;
    }
    if (dateFilter === "thisMonth") return dateStr.startsWith(currentMonthStr);
    if (dateFilter === "custom" && customDate) return dateStr === customDate;
    return true;
  };

  const handleTriggerPrint = (visit) => {
    setSelectedVisitForPrint(visit);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Search & Filter (Matches Date, Patient Name, ID, Diagnosis, Chief Complaint, and last 3 digits)
  const cleanTerm = searchTerm.trim().toLowerCase();
  const digitsOnlyTerm = cleanTerm.replace(/\D/g, "");

  const filteredVisits = visits.filter((v) => {
    const matchesDate = filterByDate(v.date);
    if (!matchesDate) return false;
    if (!cleanTerm) return true;

    const pName = (v.patientName || "").toLowerCase();
    const pId = (v.patientId || "").toLowerCase();
    const vId = (v.id || "").toLowerCase();
    const diag = (v.diagnosis || "").toLowerCase();
    const complaint = (v.chiefComplaint || "").toLowerCase();

    const pIdDigits = pId.replace(/\D/g, "");
    const vIdDigits = vId.replace(/\D/g, "");

    const matchesText =
      pName.includes(cleanTerm) ||
      pId.includes(cleanTerm) ||
      vId.includes(cleanTerm) ||
      diag.includes(cleanTerm) ||
      complaint.includes(cleanTerm);

    const matchesDigits =
      digitsOnlyTerm.length > 0 &&
      (pIdDigits.includes(digitsOnlyTerm) ||
        vIdDigits.includes(digitsOnlyTerm) ||
        pIdDigits.slice(-3).includes(digitsOnlyTerm) ||
        vIdDigits.slice(-3).includes(digitsOnlyTerm));

    return matchesText || matchesDigits;
  });

  return (
    <div className="space-y-6">
      {/* Offscreen Printable Prescription Sheet */}
      <PrescriptionSheet consultationData={selectedVisitForPrint} />

      {/* Header Search & Date Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-3">
          {/* Left: Days Filter Presets */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 overflow-x-auto w-full sm:w-auto">
            {datePresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  setDateFilter(preset.id);
                  setCustomDate("");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  dateFilter === preset.id
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Right: Custom Date Picker */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shrink-0">
            <span className="text-[11px] font-bold text-slate-500">Custom Date:</span>
            <input
              type="date"
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value);
                if (e.target.value) setDateFilter("custom");
              }}
              className="bg-transparent text-xs font-semibold text-slate-800 outline-none"
            />
          </div>
        </div>

        {/* Search & Records Count Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search history by Patient Name, ID or Diagnosis..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Matching Visit Records: <strong className="text-slate-900">{filteredVisits.length}</strong>
          </div>
        </div>
      </div>

      {/* Visits Chronological Cards / Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {filteredVisits.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-slate-100 m-6 rounded-2xl">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-700">No medical history records found</h4>
            <p className="text-xs text-slate-400 mt-1">
              No medical visits match your date filter (<strong className="capitalize">{dateFilter}</strong>) or search query.
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {filteredVisits.map((visit) => (
              <div
                key={visit.id}
                className="p-5 rounded-2xl bg-slate-50/70 hover:bg-slate-100/60 border border-slate-200/70 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-teal-600 text-white font-bold text-xs rounded-xl shadow-2xs">
                      {visit.date}
                    </span>
                    <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-100">
                      {visit.id}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      Time: {visit.time || "10:00 AM"}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-900">
                      {visit.patientName} <span className="text-xs text-slate-400 font-mono font-normal">({visit.patientId})</span>
                    </h4>
                    <p className="text-xs font-semibold text-teal-800 mt-0.5">
                      Diagnosis: {visit.diagnosis || "General Consultation"}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Chief Complaint: {visit.chiefComplaint || "Routine Checkup"}
                    </p>
                  </div>

                  {/* Vitals Bar */}
                  {visit.vitals && (
                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-slate-600 pt-1">
                      <span><strong>BP:</strong> {visit.vitals.bp || "N/A"}</span>
                      <span><strong>Temp:</strong> {visit.vitals.temp || "N/A"}°F</span>
                      <span><strong>Pulse:</strong> {visit.vitals.pulse || "N/A"}bpm</span>
                      <span><strong>SpO₂:</strong> {visit.vitals.spo2 || "N/A"}%</span>
                      <span><strong>Weight:</strong> {visit.vitals.weight || "N/A"}kg</span>
                    </div>
                  )}

                  {/* Prescribed Medicines Preview */}
                  {visit.medicines && visit.medicines.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Medicines:</span>
                      {visit.medicines.map((m, i) => (
                        <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 text-slate-800 text-[11px] font-bold rounded-md">
                          {m.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                  <button
                    onClick={() => setSelectedVisitForModal(visit)}
                    className="px-3.5 py-2 bg-slate-200/80 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Full Visit</span>
                  </button>

                  <button
                    onClick={() => handleTriggerPrint(visit)}
                    className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-2xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Rx</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Full Visit Modal */}
      {selectedVisitForModal && (
        <Modal
          isOpen={Boolean(selectedVisitForModal)}
          onClose={() => setSelectedVisitForModal(null)}
          title={`Visit Record — ${selectedVisitForModal.id} (${selectedVisitForModal.date})`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-teal-50/70 border border-teal-100 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{selectedVisitForModal.patientName}</h4>
                <p className="text-slate-500 font-mono">Patient ID: {selectedVisitForModal.patientId}</p>
              </div>
              <span className="px-3 py-1 bg-white font-bold text-teal-800 rounded-lg text-xs border border-teal-100">
                {selectedVisitForModal.date}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Chief Complaint</span>
                <span className="font-semibold text-slate-800">{selectedVisitForModal.chiefComplaint}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Diagnosis</span>
                <span className="font-bold text-slate-900">{selectedVisitForModal.diagnosis}</span>
              </div>
            </div>

            {selectedVisitForModal.vitals && (
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">Vitals Recorded</span>
                <div className="flex items-center gap-4 text-slate-700 font-medium">
                  <span>BP: {selectedVisitForModal.vitals.bp}</span>
                  <span>Temp: {selectedVisitForModal.vitals.temp}°F</span>
                  <span>Pulse: {selectedVisitForModal.vitals.pulse} bpm</span>
                  <span>SpO₂: {selectedVisitForModal.vitals.spo2}%</span>
                </div>
              </div>
            )}

            {selectedVisitForModal.medicines && selectedVisitForModal.medicines.length > 0 && (
              <div className="p-3 bg-slate-50 rounded-xl space-y-2">
                <span className="font-bold text-slate-700 uppercase text-[10px] block">Prescribed Medicines</span>
                <div className="space-y-1.5">
                  {selectedVisitForModal.medicines.map((m, idx) => (
                    <div key={idx} className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                      <span className="font-bold text-slate-900">{m.name} ({m.dosage})</span>
                      <span className="text-teal-800 font-semibold">{m.frequency} • {m.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedVisitForModal.tests && selectedVisitForModal.tests.length > 0 && (
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="font-bold text-slate-700 uppercase text-[10px] block mb-1">Tests Advised</span>
                <ul className="list-disc list-inside font-semibold text-slate-800">
                  {selectedVisitForModal.tests.map((t, i) => (
                    <li key={i}>{t.name}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedVisitForModal.advice && (
              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl">
                <span className="font-bold text-amber-900 uppercase text-[10px] block">Doctor Advice</span>
                <p className="text-slate-800 font-medium whitespace-pre-line mt-1">{selectedVisitForModal.advice}</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedVisitForModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const v = selectedVisitForModal;
                  setSelectedVisitForModal(null);
                  handleTriggerPrint(v);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Prescription</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
