import React, { useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  Eye,
  Stethoscope,
  BookOpen,
  AlertTriangle,
  Phone,
  MapPin,
  Calendar,
  HeartPulse,
  Edit,
  X,
} from "lucide-react";
import { useClinic } from "../../context/ClinicContext";
import { Modal } from "../common/Modal";

export const PatientsPage = () => {
  const {
    patients,
    addPatient,
    updatePatient,
    startConsultationForPatient,
    navigateTo,
    visits,
  } = useClinic();

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPatientForView, setSelectedPatientForView] = useState(null);
  const [editingPatient, setEditingPatient] = useState(null);

  // Form State for Add / Edit
  const initialForm = {
    fullName: "",
    guardianName: "",
    gender: "Male",
    age: "",
    dob: "",
    phone: "",
    address: "",
    bloodGroup: "O+",
    allergies: "",
    existingDiseases: "",
    previousMedicalHistory: "",
    emergencyContact: "",
  };

  const [formData, setFormData] = useState(initialForm);

  // Search Filter (Matches Name, ID, Phone, and last 3 digits)
  const cleanTerm = searchTerm.trim().toLowerCase();
  const digitsOnlyTerm = cleanTerm.replace(/\D/g, "");

  const filteredPatients = patients.filter((p) => {
    if (!cleanTerm) return true;

    const pName = (p.fullName || "").toLowerCase();
    const pId = (p.id || "").toLowerCase();
    const phone = (p.phone || "").toLowerCase();
    const gName = (p.guardianName || "").toLowerCase();

    const pIdDigits = pId.replace(/\D/g, "");
    const phoneDigits = phone.replace(/\D/g, "");

    const matchesText =
      pName.includes(cleanTerm) ||
      pId.includes(cleanTerm) ||
      phone.includes(cleanTerm) ||
      gName.includes(cleanTerm);

    const matchesDigits =
      digitsOnlyTerm.length > 0 &&
      (pIdDigits.includes(digitsOnlyTerm) ||
        phoneDigits.includes(digitsOnlyTerm) ||
        pIdDigits.slice(-3).includes(digitsOnlyTerm) ||
        phoneDigits.slice(-3).includes(digitsOnlyTerm));

    return matchesText || matchesDigits;
  });

  const handleOpenAddModal = () => {
    setEditingPatient(null);
    setFormData(initialForm);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (patient) => {
    setEditingPatient(patient);
    setFormData({
      fullName: patient.fullName || "",
      guardianName: patient.guardianName || "",
      gender: patient.gender || "Male",
      age: patient.age || "",
      dob: patient.dob || "",
      phone: patient.phone || "",
      address: patient.address || "",
      bloodGroup: patient.bloodGroup || "O+",
      allergies: patient.allergies || "",
      existingDiseases: patient.existingDiseases || "",
      previousMedicalHistory: patient.previousMedicalHistory || "",
      emergencyContact: patient.emergencyContact || "",
    });
    setIsAddModalOpen(true);
  };

  const handleSubmitPatient = (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) return;

    if (editingPatient) {
      updatePatient({
        ...editingPatient,
        ...formData,
      });
    } else {
      addPatient(formData);
    }
    setIsAddModalOpen(false);
    setFormData(initialForm);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID, Name or Phone..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
          />
        </div>

        {/* Add Patient Button */}
        <button
          onClick={handleOpenAddModal}
          className="w-full sm:w-auto px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Patient</span>
        </button>
      </div>

      {/* Patient Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {filteredPatients.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-slate-100 m-6 rounded-2xl">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-700">No patients found</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No patient matches your search filter or no patient records have been added yet.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="mt-4 px-4 py-2 bg-teal-600 text-white text-xs font-semibold rounded-xl hover:bg-teal-700 transition"
            >
              + Add Patient Now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Patient ID</th>
                  <th className="py-3.5 px-4">Patient Name</th>
                  <th className="py-3.5 px-4">Age / Gender</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Blood Group</th>
                  <th className="py-3.5 px-4">Last Visit</th>
                  <th className="py-3.5 px-4">Total Visits</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-700">
                      {patient.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{patient.fullName}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {patient.age} Yrs • {patient.gender}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">
                      {patient.phone}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-slate-100 text-slate-700">
                        {patient.bloodGroup}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                      {patient.lastVisit}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-semibold">
                      <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[11px]">
                        {patient.totalVisits} visits
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => setSelectedPatientForView(patient)}
                        className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition font-medium text-xs inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(patient)}
                        className="px-2 py-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                        title="Edit Patient"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Patient Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingPatient ? `Edit Patient — ${editingPatient.id}` : "Add New Patient Record"}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmitPatient} className="space-y-6">
          {/* Section 1: Personal Information */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50/80 px-3 py-1.5 rounded-lg mb-4">
              1. Personal Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Emergency Contact
                </label>
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  placeholder="e.g. 0300-1234567 (Spouse/Relative)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gender *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Age (Years) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="120"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="e.g. 42"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0300-1234567 / +92 300 1234567"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Blood Group
                </label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street address, City, State"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Medical Information */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50/80 px-3 py-1.5 rounded-lg mb-4">
              2. Medical Information & History
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Known Allergies
                </label>
                <input
                  type="text"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  placeholder="e.g. Penicillin, Sulfa drugs, Dust"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Existing Diseases / Conditions
                </label>
                <input
                  type="text"
                  value={formData.existingDiseases}
                  onChange={(e) => setFormData({ ...formData, existingDiseases: e.target.value })}
                  placeholder="e.g. Diabetes, Hypertension, Asthma"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Previous Medical History
                </label>
                <textarea
                  rows="2"
                  value={formData.previousMedicalHistory}
                  onChange={(e) => setFormData({ ...formData, previousMedicalHistory: e.target.value })}
                  placeholder="Prior surgeries, hospitalizations, or chronic conditions..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                ></textarea>
              </div>


            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition shadow-xs"
            >
              {editingPatient ? "Save Changes" : "Save Patient Record"}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Patient Profile Modal */}
      {selectedPatientForView && (
        <Modal
          isOpen={Boolean(selectedPatientForView)}
          onClose={() => setSelectedPatientForView(null)}
          title={`Patient Profile — ${selectedPatientForView.fullName}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6">
            {/* Header Badge Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white font-bold text-lg flex items-center justify-center shadow-xs">
                  {selectedPatientForView.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedPatientForView.fullName}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    ID: {selectedPatientForView.id} • {selectedPatientForView.age} Yrs • {selectedPatientForView.gender}
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-teal-100 text-teal-800 font-bold text-xs rounded-full">
                {selectedPatientForView.bloodGroup}
              </span>
            </div>

            {/* Allergy Warning Alert Banner if allergies exist */}
            {selectedPatientForView.allergies && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">ALLERGY WARNING: </span>
                  <span>{selectedPatientForView.allergies}</span>
                </div>
              </div>
            )}

            {/* Overview Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-medium block">Phone</span>
                <span className="font-mono font-semibold text-slate-800">{selectedPatientForView.phone}</span>
              </div>
              <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-medium block">Emergency Contact</span>
                <span className="font-semibold text-slate-800">{selectedPatientForView.emergencyContact || "N/A"}</span>
              </div>
              <div className="col-span-2 p-3 bg-slate-50/60 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-medium block">Address</span>
                <span className="font-medium text-slate-800">{selectedPatientForView.address || "N/A"}</span>
              </div>
              <div className="col-span-2 p-3 bg-slate-50/60 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-medium block">Existing Diseases / Conditions</span>
                <span className="font-semibold text-slate-800">{selectedPatientForView.existingDiseases || "None Reported"}</span>
              </div>
              <div className="col-span-2 p-3 bg-slate-50/60 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-medium block">Previous Medical History</span>
                <span className="text-slate-700">{selectedPatientForView.previousMedicalHistory || "No prior history specified."}</span>
              </div>

            </div>

            {/* Visit Summary Box */}
            <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-teal-800 font-bold block">Visit Summary</span>
                <span className="text-teal-600">Total Visits: {selectedPatientForView.totalVisits} • Last Visit: {selectedPatientForView.lastVisit}</span>
              </div>
              <button
                onClick={() => {
                  setSelectedPatientForView(null);
                  navigateTo("medicalHistory");
                }}
                className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>View Full Medical History</span>
              </button>
            </div>

            {/* Profile Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedPatientForView(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition shadow-xs"
              >
                Close Profile
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
