import React, { useEffect } from "react";
import { Printer, X, Stethoscope } from "lucide-react";
import { useClinic } from "../../context/ClinicContext";
import { PrescriptionSheet } from "./PrescriptionSheet";

export const PrescriptionModal = ({ isOpen, onClose, consultationData, autoPrint = false }) => {
  const { doctor, clinic } = useClinic();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
      if (autoPrint) {
        const timer = setTimeout(() => {
          window.print();
        }, 300);
        return () => clearTimeout(timer);
      }
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, autoPrint]);

  if (!isOpen || !consultationData) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* 1. Interactive Preview Modal on Screen */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto no-print">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-up">
          {/* Top Control Header Bar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-800">
                Prescription Print Preview — {consultationData.id || "Rx Sheet"}
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print Prescription</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200 transition"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Screen Preview Container */}
          <div className="p-6 overflow-y-auto flex-1 bg-white text-slate-900">
            <div className="max-w-2xl mx-auto space-y-4 border border-slate-200 p-6 rounded-2xl shadow-xs">
              <div className="pb-3 border-b-2 border-slate-300">
                <h1 className="text-base font-extrabold text-slate-900">
                  {doctor.name || "Dr. Akshara"}
                </h1>
                <p className="text-xs font-semibold text-slate-700">
                  {doctor.qualification || doctor.specialization || "M.S."}
                </p>
                <p className="text-[11px] text-slate-500">
                  Reg. No: {doctor.regNo || "MMC 2018"}
                </p>
              </div>

              <div className="pb-3 border-b border-slate-200 text-xs space-y-1">
                <p className="font-bold text-slate-900">
                  ID: {consultationData.patientId} — {consultationData.patientName} ({consultationData.patientGender === "Female" ? "F" : "M"}) / {consultationData.patientAge} Y
                </p>
                <p className="font-semibold text-slate-700">
                  Phone: {consultationData.patientPhone || "N/A"} • Date: {consultationData.date}
                </p>
                <p className="font-semibold text-slate-800">
                  Diagnosis: <span className="uppercase text-teal-800">{consultationData.diagnosis}</span>
                </p>
              </div>

              {consultationData.medicines && consultationData.medicines.length > 0 && (
                <div className="space-y-2">
                  <span className="font-serif font-extrabold text-lg text-teal-800">Rx</span>
                  <table className="w-full text-xs border-collapse border border-slate-200">
                    <thead>
                      <tr className="bg-slate-100 text-left font-bold text-slate-700">
                        <th className="p-2 border-b border-r border-slate-200">Medicine Name</th>
                        <th className="p-2 border-b border-r border-slate-200">Dosage</th>
                        <th className="p-2 border-b text-right">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {consultationData.medicines.map((med, idx) => (
                        <tr key={idx}>
                          <td className="p-2 font-bold text-slate-900 border-r border-slate-200">
                            {idx + 1}) {med.name}
                          </td>
                          <td className="p-2 font-semibold text-slate-800 border-r border-slate-200">
                            {med.dosage || med.frequency}
                          </td>
                          <td className="p-2 text-right font-semibold text-slate-800">
                            {med.duration}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Official Printable Sheet */}
      <PrescriptionSheet consultationData={consultationData} />
    </>
  );
};
