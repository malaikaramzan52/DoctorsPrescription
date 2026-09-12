import React, { useState, useEffect } from "react";
import {
  Search,
  User,
  AlertTriangle,
  Stethoscope,
  Plus,
  Trash2,
  Save,
  Printer,
  History,
  CheckCircle2,
  FileText,
  X,
  BookOpen,
} from "lucide-react";
import { useClinic } from "../../context/ClinicContext";
import { commonMedicines, commonTests } from "../../data/mockData";
import { PrescriptionSheet } from "./PrescriptionSheet";
import { PrescriptionModal } from "./PrescriptionModal";
import { Modal } from "../common/Modal";

export const ConsultationPage = () => {
  const {
    patients,
    visits,
    consultationPatient,
    saveConsultation,
    startConsultationForPatient,
    navigateTo,
    showToast,
  } = useClinic();

  // Patient Search State
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Form Fields
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [vitals, setVitals] = useState({
    bp: "120/80",
    temp: "98.6",
    pulse: "72",
    spo2: "98",
    weight: "70",
  });
  const [diagnosis, setDiagnosis] = useState("");
  const [medicines, setMedicines] = useState([
    { name: "", dosage: "", frequency: "1-0-1", duration: "5 Days", instructions: "After meals" },
  ]);
  const [tests, setTests] = useState([]);
  const [advice, setAdvice] = useState("");
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpNotes, setFollowUpNotes] = useState("");

  // Modal / Preview state
  const [isRxModalOpen, setIsRxModalOpen] = useState(false);
  const [lastSavedVisit, setLastSavedVisit] = useState(null);
  const [viewingPastVisit, setViewingPastVisit] = useState(null);

  // Auto select patient if passed from other views
  useEffect(() => {
    if (consultationPatient) {
      setSelectedPatient(consultationPatient);
      setPatientSearch(consultationPatient.fullName);
    } else if (patients.length > 0 && !selectedPatient) {
      setSelectedPatient(patients[0]);
      setPatientSearch(patients[0].fullName);
    }
  }, [consultationPatient, patients]);

  // Handle Search Input Change
  const handleSearchChange = (e) => {
    const term = e.target.value;
    setPatientSearch(term);
    if (term.trim().length > 0) {
      const filtered = patients.filter(
        (p) =>
          p.fullName.toLowerCase().includes(term.toLowerCase()) ||
          p.id.toLowerCase().includes(term.toLowerCase()) ||
          p.phone.includes(term)
      );
      setSearchResults(filtered);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setPatientSearch(patient.fullName);
    setShowDropdown(false);
  };

  // Medicine Table Handlers
  const handleAddMedicineRow = (preset = null) => {
    if (preset) {
      setMedicines((prev) => [
        ...prev.filter((m) => m.name.trim() !== ""),
        {
          name: preset.name,
          dosage: preset.dosage,
          frequency: preset.frequency,
          duration: preset.duration,
          instructions: preset.instructions,
        },
      ]);
    } else {
      setMedicines((prev) => [
        ...prev,
        { name: "", dosage: "", frequency: "1-0-1", duration: "5 Days", instructions: "After meals" },
      ]);
    }
  };

  const handleRemoveMedicineRow = (index) => {
    setMedicines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    setMedicines((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  };

  // Tests Handlers
  const handleAddTestRow = (preset = null) => {
    if (preset) {
      setTests((prev) => [
        ...prev,
        { name: preset.name, instructions: preset.instructions },
      ]);
    } else {
      setTests((prev) => [...prev, { name: "", instructions: "" }]);
    }
  };

  const handleRemoveTestRow = (index) => {
    setTests((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTestChange = (index, field, value) => {
    setTests((prev) =>
      prev.map((t, i) => (i === index ? { ...t, [field]: value } : t))
    );
  };

  // Quick Diagnosis Tags
  const quickDiagnosisTags = [
    "Acute Upper Respiratory Tract Infection",
    "Viral Fever",
    "Essential Hypertension Stage 1",
    "Type 2 Diabetes Mellitus",
    "Acute Gastroenteritis",
    "Migraine without Aura",
    "Allergic Rhinitis",
    "Acid Peptic Disease / GERD",
  ];

  // Quick Advice Chips
  const quickAdviceChips = [
    "Drink plenty of warm water.",
    "Avoid oily, fried & spicy foods.",
    "Complete bed rest for 3 days.",
    "Strict low-salt diabetic diet.",
    "Steam inhalation twice daily.",
  ];

  // Save Helper
  const handleSave = (shouldPrint = false) => {
    if (!selectedPatient) {
      showToast("Please search and select a patient first.", "error");
      return;
    }
    if (!chiefComplaint.trim() && !diagnosis.trim()) {
      showToast("Please enter Chief Complaint or Clinical Diagnosis.", "warning");
      return;
    }

    const cleanMedicines = medicines.filter((m) => m.name.trim() !== "");
    const cleanTests = tests.filter((t) => t.name.trim() !== "");

    const consultationData = {
      patientId: selectedPatient.id,
      patientName: selectedPatient.fullName,
      patientAge: selectedPatient.age,
      patientGender: selectedPatient.gender,
      patientBloodGroup: selectedPatient.bloodGroup,
      chiefComplaint,
      symptoms,
      vitals,
      diagnosis,
      medicines: cleanMedicines,
      tests: cleanTests,
      advice,
      followUpRequired,
      followUpDate,
      followUpNotes,
    };

    const savedVisit = saveConsultation(consultationData);
    setLastSavedVisit(savedVisit);

    if (shouldPrint) {
      setTimeout(() => {
        window.print();
      }, 150);
    }
  };

  // Past visits for selected patient
  const patientPastVisits = selectedPatient
    ? visits.filter((v) => v.patientId === selectedPatient.id)
    : [];

  return (
    <div className="space-y-6">
      {/* 1. Patient Selection Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 relative" ref={searchRef}>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Select Patient for Consultation
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={patientSearch}
                onChange={handleSearchChange}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search patient by ID, Name or Phone..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition"
              />
            </div>

            {/* Autocomplete Dropdown */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-2xl shadow-xl border border-slate-200 z-30 max-h-60 overflow-y-auto">
                {searchResults.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => handleSelectPatient(patient)}
                    className="w-full text-left p-3 hover:bg-teal-50/60 border-b border-slate-100 last:border-0 flex items-center justify-between text-xs transition"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{patient.fullName}</span>
                      <span className="text-slate-400 ml-2 font-mono">({patient.id})</span>
                      <p className="text-[11px] text-slate-500">
                        {patient.age} Yrs • {patient.gender} • {patient.phone}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 bg-slate-100 font-bold text-[10px] text-slate-700 rounded-md">
                      {patient.bloodGroup}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>


        </div>

        {/* Selected Patient Overview Box */}
        {selectedPatient && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-100/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
                  {selectedPatient.fullName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {selectedPatient.fullName}
                  </h4>
                  <p className="text-slate-600 font-medium">
                    ID: <span className="font-mono text-teal-800">{selectedPatient.id}</span> • {selectedPatient.age} Yrs • {selectedPatient.gender} • Blood: <span className="font-bold">{selectedPatient.bloodGroup}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-slate-600 font-medium">
                <div>Phone: <span className="font-mono text-slate-800">{selectedPatient.phone}</span></div>
                <div>Total Visits: <span className="font-bold text-teal-800">{selectedPatient.totalVisits}</span></div>
              </div>
            </div>

            {/* Allergy Alert Banner */}
            {selectedPatient.allergies && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>
                  <strong className="font-bold">KNOWN ALLERGIES:</strong> {selectedPatient.allergies}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Previous Visit Preview / First Visit Empty State */}
      {selectedPatient && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-teal-600" />
              <span>Previous Medical History</span>
            </h3>
            {patientPastVisits.length > 0 && (
              <button
                onClick={() => navigateTo("medicalHistory")}
                className="text-xs font-bold text-teal-600 hover:underline flex items-center gap-1"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>View Full Medical History</span>
              </button>
            )}
          </div>

          {patientPastVisits.length === 0 ? (
            <div className="p-4 bg-slate-50 border border-slate-200/70 rounded-xl text-center">
              <span className="inline-block px-2.5 py-0.5 bg-amber-100 text-amber-800 font-bold text-[11px] rounded-md mb-1">
                First Visit
              </span>
              <p className="text-xs font-medium text-slate-600">
                No previous medical history available. This is the patient's first consultation.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {patientPastVisits.slice(0, 3).map((visit) => (
                <div
                  key={visit.id}
                  className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/70 transition flex flex-col justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
                      <span>{visit.date}</span>
                      <span className="text-[10px] text-teal-700 font-mono">{visit.id}</span>
                    </div>
                    <p className="font-semibold text-slate-900 truncate">
                      Diagnosis: {visit.diagnosis || "Checkup"}
                    </p>
                    <p className="text-slate-500 text-[11px] mt-1 line-clamp-1">
                      Symptoms: {visit.chiefComplaint || "Routine"}
                    </p>
                  </div>
                  <button
                    onClick={() => setViewingPastVisit(visit)}
                    className="mt-3 text-left text-[11px] font-bold text-teal-700 hover:underline"
                  >
                    View Visit Details &rarr;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. CURRENT CONSULTATION FORM */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-teal-600" />
            <span>Current Consultation Form</span>
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            Date: {new Date().toLocaleDateString()}
          </span>
        </div>

        {/* Section A: Chief Complaint & Symptoms */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Chief Complaint *
            </label>
            <input
              type="text"
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="e.g. High fever, headache, sore throat for 2 days"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Detailed Symptoms
            </label>
            <textarea
              rows="1"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Associated symptoms, onset, severity, triggers..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none resize-none"
            ></textarea>
          </div>
        </div>

        {/* Section B: Patient Vitals */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Vitals & Measurements
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
              <label className="block text-[10px] font-bold text-slate-400 uppercase">
                Blood Pressure
              </label>
              <input
                type="text"
                value={vitals.bp}
                onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
                placeholder="120/80"
                className="w-full mt-1 bg-transparent font-bold text-xs text-slate-800 outline-none"
              />
              <span className="text-[10px] text-slate-400">mmHg</span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
              <label className="block text-[10px] font-bold text-slate-400 uppercase">
                Temperature
              </label>
              <input
                type="text"
                value={vitals.temp}
                onChange={(e) => setVitals({ ...vitals, temp: e.target.value })}
                placeholder="98.6"
                className="w-full mt-1 bg-transparent font-bold text-xs text-slate-800 outline-none"
              />
              <span className="text-[10px] text-slate-400">°F</span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
              <label className="block text-[10px] font-bold text-slate-400 uppercase">
                Pulse Rate
              </label>
              <input
                type="text"
                value={vitals.pulse}
                onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
                placeholder="72"
                className="w-full mt-1 bg-transparent font-bold text-xs text-slate-800 outline-none"
              />
              <span className="text-[10px] text-slate-400">bpm</span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
              <label className="block text-[10px] font-bold text-slate-400 uppercase">
                SpO₂ Level
              </label>
              <input
                type="text"
                value={vitals.spo2}
                onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                placeholder="98"
                className="w-full mt-1 bg-transparent font-bold text-xs text-slate-800 outline-none"
              />
              <span className="text-[10px] text-slate-400">%</span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
              <label className="block text-[10px] font-bold text-slate-400 uppercase">
                Weight
              </label>
              <input
                type="text"
                value={vitals.weight}
                onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                placeholder="70"
                className="w-full mt-1 bg-transparent font-bold text-xs text-slate-800 outline-none"
              />
              <span className="text-[10px] text-slate-400">kg</span>
            </div>
          </div>
        </div>

        {/* Section C: Clinical Diagnosis & Quick Tags */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Clinical Diagnosis *
          </label>
          <input
            type="text"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="Enter clinical diagnosis..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none mb-2"
          />


        </div>

        {/* Section D: PRESCRIPTION / MEDICINES DYNAMIC TABLE */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Rx — Prescribed Medicines</h4>
              <p className="text-xs text-slate-400">Add medications, dosage, frequency and instructions</p>
            </div>
            <button
              type="button"
              onClick={() => handleAddMedicineRow()}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl transition shadow-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Medicine Row</span>
            </button>
          </div>



          {/* Dynamic Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase">
                  <th className="py-2.5 px-3">Medicine Name *</th>
                  <th className="py-2.5 px-3">Dosage</th>
                  <th className="py-2.5 px-3">Frequency</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Instructions</th>
                  <th className="py-2.5 px-2 text-center">Remove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {medicines.map((med, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60">
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={med.name}
                        onChange={(e) => handleMedicineChange(idx, "name", e.target.value)}
                        placeholder="e.g. Paracetamol 500mg"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-800 focus:ring-1 focus:ring-teal-500 outline-none"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={med.dosage}
                        onChange={(e) => handleMedicineChange(idx, "dosage", e.target.value)}
                        placeholder="500mg tablet"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-medium text-slate-700 focus:ring-1 focus:ring-teal-500 outline-none"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <select
                        value={med.frequency}
                        onChange={(e) => handleMedicineChange(idx, "frequency", e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-semibold text-teal-800 focus:ring-1 focus:ring-teal-500 outline-none"
                      >
                        <option value="1-0-1">1-0-1 (Twice daily)</option>
                        <option value="1-1-1">1-1-1 (Thrice daily)</option>
                        <option value="1-0-0">1-0-0 (Once Morning)</option>
                        <option value="0-0-1">0-0-1 (Once Night)</option>
                        <option value="1-1-1-1">1-1-1-1 (4 times daily)</option>
                        <option value="As needed">As needed (PRN)</option>
                      </select>
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={med.duration}
                        onChange={(e) => handleMedicineChange(idx, "duration", e.target.value)}
                        placeholder="5 Days"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-medium text-slate-700 focus:ring-1 focus:ring-teal-500 outline-none"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={med.instructions}
                        onChange={(e) => handleMedicineChange(idx, "instructions", e.target.value)}
                        placeholder="After meals with water"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 focus:ring-1 focus:ring-teal-500 outline-none"
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicineRow(idx)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section E: INVESTIGATIONS / TESTS SECTION */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Investigations & Laboratory Tests Advised
              </h4>
            </div>
            <button
              type="button"
              onClick={() => handleAddTestRow()}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Test Row</span>
            </button>
          </div>



          {tests.length > 0 && (
            <div className="space-y-2">
              {tests.map((test, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={test.name}
                    onChange={(e) => handleTestChange(idx, "name", e.target.value)}
                    placeholder="Test Name (e.g. Complete Blood Count)"
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                  />
                  <input
                    type="text"
                    value={test.instructions}
                    onChange={(e) => handleTestChange(idx, "instructions", e.target.value)}
                    placeholder="Instructions (e.g. Fasting 12 hrs)"
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveTestRow(idx)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section F: DOCTOR'S ADVICE & FOLLOW-UP */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Doctor's Advice & Guidelines
            </label>
            <textarea
              rows="3"
              value={advice}
              onChange={(e) => setAdvice(e.target.value)}
              placeholder="Lifestyle modifications, dietary restrictions, general care advice..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none resize-none mb-2"
            ></textarea>
            

          </div>

          <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Follow-up Required?</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={followUpRequired}
                  onChange={(e) => setFollowUpRequired(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
            </div>

            {followUpRequired && (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Follow-up Notes
                  </label>
                  <input
                    type="text"
                    value={followUpNotes}
                    onChange={(e) => setFollowUpNotes(e.target.value)}
                    placeholder="e.g. Review BP log, bring lab reports"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 outline-none"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigateTo("dashboard")}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={() => handleSave(false)}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl transition shadow-xs flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Consultation</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave(true)}
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl transition shadow-md shadow-teal-600/20 flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Save & Print Prescription</span>
          </button>
        </div>
      </div>

      {/* Prescription Print Modal */}
      {lastSavedVisit && (
        <PrescriptionModal
          isOpen={isRxModalOpen}
          onClose={() => setIsRxModalOpen(false)}
          consultationData={lastSavedVisit}
        />
      )}

      {/* View Past Visit Details Modal */}
      {viewingPastVisit && (
        <Modal
          isOpen={Boolean(viewingPastVisit)}
          onClose={() => setViewingPastVisit(null)}
          title={`Past Visit Details — ${viewingPastVisit.date}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="font-bold text-slate-400 block text-[10px] uppercase">Diagnosis</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{viewingPastVisit.diagnosis}</p>
            </div>
            
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="font-bold text-slate-400 block text-[10px] uppercase">Chief Complaint</span>
              <p className="font-medium text-slate-800 mt-0.5">{viewingPastVisit.chiefComplaint}</p>
            </div>

            {viewingPastVisit.medicines && viewingPastVisit.medicines.length > 0 && (
              <div>
                <span className="font-bold text-slate-700 block mb-1">Prescribed Medicines:</span>
                <ul className="space-y-1">
                  {viewingPastVisit.medicines.map((m, i) => (
                    <li key={i} className="p-2 bg-slate-50 rounded-lg flex items-center justify-between">
                      <span className="font-bold text-slate-900">{m.name}</span>
                      <span className="text-teal-700 font-medium">{m.dosage} • {m.frequency}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setViewingPastVisit(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const visitToPrint = viewingPastVisit;
                  setViewingPastVisit(null);
                  setLastSavedVisit(visitToPrint);
                  setTimeout(() => {
                    window.print();
                  }, 150);
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

      {/* Background Offscreen Prescription Sheet */}
      <PrescriptionSheet consultationData={lastSavedVisit} />
    </div>
  );
};
