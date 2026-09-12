import React from "react";
import ReactDOM from "react-dom";
import { useClinic } from "../../context/ClinicContext";

export const PrescriptionSheet = ({ consultationData }) => {
  const { doctor, clinic } = useClinic();

  if (!consultationData) return null;

  // Helper formatting for vitals
  const vitals = consultationData.vitals || {};
  const weight = vitals.weight ? `${vitals.weight}` : "80";
  const height = vitals.height ? `${vitals.height}` : "170";
  const bmi = vitals.weight && vitals.height
    ? (vitals.weight / ((vitals.height / 100) ** 2)).toFixed(2)
    : "22.50";
  const bp = vitals.bp ? `${vitals.bp}` : "120/80";

  // Date formatting
  const formattedDate = consultationData.date
    ? new Date(consultationData.date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).replace(/ /g, "-")
    : new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).replace(/ /g, "-");

  return ReactDOM.createPortal(
    <div id="printable-prescription-root" className="hidden print:block">
      <div id="printable-prescription" className="max-w-3xl mx-auto text-slate-900 bg-white p-6 font-sans text-xs space-y-3">
        {/* ================= 1. HEADER SECTION ================= */}
        <div className="pb-3 border-b-2 border-slate-300">
          {/* Doctor Info ONLY */}
          <div>
            <h1 className="text-base font-extrabold text-slate-900 leading-tight">
              {doctor.name || "Dr. Akshara"}
            </h1>
            <p className="text-[11px] font-semibold text-slate-700">
              {doctor.qualification || doctor.specialization || "M.S."}
            </p>
            <p className="text-[10px] text-slate-600 font-medium mt-0.5">
              Reg. No: {doctor.regNo || "MMC 2018"}
            </p>
          </div>
        </div>

        {/* ================= 2. PATIENT DEMOGRAPHICS & DATE ================= */}
        <div className="pb-3 border-b border-slate-300">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-900">
                ID: {consultationData.patientId || "11"} - {consultationData.patientName ? consultationData.patientName.toUpperCase() : "PATIENT"} ({consultationData.patientGender === "Female" ? "F" : "M"}) / {consultationData.patientAge || "13"} Y
                <span className="ml-4 font-bold text-slate-900">Mob. No.: {consultationData.patientPhone || "9423380390"}</span>
              </p>
              <p className="text-xs font-semibold text-slate-700">
                Address: {consultationData.patientAddress ? consultationData.patientAddress.toUpperCase() : "PUNE"}
              </p>
              <p className="text-xs font-semibold text-slate-800">
                Weight (Kg): {weight}, Height (Cm): {height} (B.M.I. = {bmi}), BP: {bp} mmHg
              </p>
            </div>
            <div className="text-right whitespace-nowrap">
              <p className="text-xs font-bold text-slate-900">
                Date: {formattedDate}
              </p>
            </div>
          </div>
        </div>

        {/* ================= 3. CHIEF COMPLAINTS & CLINICAL FINDINGS ================= */}
        <div className="border-b border-slate-300 pb-3">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-300 text-left font-bold text-slate-900">
                <th className="py-1 w-1/2">Chief Complaints</th>
                <th className="py-1 w-1/2 pl-4">Clinical Findings</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-1 align-top text-slate-800">
                  {consultationData.chiefComplaint ? (
                    consultationData.chiefComplaint.split("\n").map((line, i) => (
                      <p key={i} className="font-semibold uppercase">* {line.replace(/^\*\s*/, "")}</p>
                    ))
                  ) : (
                    <>
                      <p className="font-semibold uppercase">* FEVER WITH CHILLS (4 DAYS)</p>
                      <p className="font-semibold uppercase">* HEADACHE (2 DAYS)</p>
                    </>
                  )}
                </td>
                <td className="py-1 align-top text-slate-800 pl-4">
                  {consultationData.clinicalFindings ? (
                    consultationData.clinicalFindings.split("\n").map((line, i) => (
                      <p key={i} className="font-semibold uppercase">* {line.replace(/^\*\s*/, "")}</p>
                    ))
                  ) : (
                    <>
                      <p className="font-semibold uppercase">* THESE ARE TEST FINDINGS FOR A TEST PATIENT</p>
                      <p className="font-semibold uppercase">* ENTERING SAMPLE DIAGNOSIS AND SAMPLE PRESCRIPTION</p>
                    </>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ================= 4. DIAGNOSIS SECTION ================= */}
        <div className="border-b border-slate-300 pb-2">
          <h3 className="font-bold text-xs text-slate-900">Diagnosis:</h3>
          <div className="text-xs font-semibold text-slate-800 uppercase mt-0.5">
            {consultationData.diagnosis ? (
              consultationData.diagnosis.split("\n").map((line, i) => (
                <p key={i}>* {line.replace(/^\*\s*/, "")}</p>
              ))
            ) : (
              <p>* MALARIA</p>
            )}
          </div>
        </div>

        {/* ================= 5. PRESCRIPTION MEDICINES TABLE ================= */}
        <div className="border-b border-slate-300 pb-3">
          <div className="text-base font-serif font-extrabold text-slate-900 mb-1">
            Rx
          </div>

          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-300 text-left font-bold text-slate-900">
                <th className="py-1.5 w-1/2">Medicine Name</th>
                <th className="py-1.5 w-1/4">Dosage</th>
                <th className="py-1.5 w-1/4 text-right">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {consultationData.medicines && consultationData.medicines.length > 0 ? (
                consultationData.medicines.map((med, idx) => (
                  <tr key={idx} className="align-top">
                    <td className="py-2 pr-2 font-bold text-slate-900">
                      {idx + 1}) {med.name ? med.name.toUpperCase() : "TAB. MEDICINE"}
                      {med.instructions && (
                        <span className="block text-[10px] font-semibold text-slate-600 uppercase mt-0.5">
                          {med.instructions}
                        </span>
                      )}
                    </td>
                    <td className="py-2 font-semibold text-slate-800">
                      {med.dosage || med.frequency || "1 Morning"}
                    </td>
                    <td className="py-2 text-right font-semibold text-slate-800">
                      {med.duration || "8 Days"}
                      {med.duration && (
                        <span className="block text-[10px] font-normal text-slate-600">
                          (Tot:{med.duration.replace(/[^0-9]/g, "") || "8"} Tab)
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <>
                  <tr className="align-top">
                    <td className="py-2 font-bold text-slate-900">1) TAB. ABCIXIMAB</td>
                    <td className="py-2 font-semibold text-slate-800">1 Morning</td>
                    <td className="py-2 text-right font-semibold text-slate-800">
                      8 Days<span className="block text-[10px] font-normal text-slate-600">(Tot:8 Tab)</span>
                    </td>
                  </tr>
                  <tr className="align-top">
                    <td className="py-2 font-bold text-slate-900">
                      2) TAB. VOMILAST
                      <span className="block text-[10px] font-semibold text-slate-600 uppercase mt-0.5">
                        DOXYLAMINE 10MG + PYRIDOXINE 10 MG + FOLIC ACID 2.5 MG
                      </span>
                    </td>
                    <td className="py-2 font-semibold text-slate-800">
                      1 Morning, 1 Night<span className="block text-[10px] font-normal text-slate-600">(After Food)</span>
                    </td>
                    <td className="py-2 text-right font-semibold text-slate-800">
                      8 Days<span className="block text-[10px] font-normal text-slate-600">(Tot:16 Tab)</span>
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* ================= 6. ADVICE SECTION ================= */}
        <div className="pb-2">
          <h3 className="font-bold text-xs text-slate-900">Advice:</h3>
          <div className="text-xs font-semibold text-slate-800 uppercase mt-0.5">
            {consultationData.advice ? (
              consultationData.advice.split("\n").map((line, i) => (
                <p key={i}>* {line.replace(/^\*\s*/, "")}</p>
              ))
            ) : (
              <>
                <p>* TAKE BED REST</p>
                <p>* DO NOT EAT OUTSIDE FOOD</p>
                <p>* EAT EASY TO DIGEST FOOD LIKE BOILED RICE WITH DAAL</p>
              </>
            )}
          </div>
        </div>

        {/* ================= 7. FOLLOW UP & FOOTER ================= */}
        <div className="pt-3 border-t border-slate-300 space-y-4">
          <p className="text-xs font-bold text-slate-900">
            Follow Up: {consultationData.followUpDate || "04-09-2023"}
          </p>

          <p className="text-[10px] text-center font-medium text-slate-500 italic pt-2">
            Substitute with equivalent Generics as required.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
};
