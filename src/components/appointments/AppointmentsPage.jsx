import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Search,
  Plus,
  Stethoscope,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Edit,
  Eye,
  Filter,
  User,
  UserPlus,
} from "lucide-react";
import { useClinic } from "../../context/ClinicContext";
import { Modal } from "../common/Modal";

export const AppointmentsPage = () => {
  const {
    appointments,
    patients,
    addPatient,
    addAppointment,
    updateAppointmentStatus,
    cancelAppointment,
    startConsultationForPatient,
    showToast,
  } = useClinic();

  const [activeFilter, setActiveFilter] = useState("All"); // All, Scheduled, Completed, Cancelled
  const [dateFilter, setDateFilter] = useState("allTime"); // today, yesterday, thisWeek, thisMonth, allTime, custom
  const [customDate, setCustomDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAppointmentForView, setSelectedAppointmentForView] = useState(null);

  // Patient Selection Mode inside Modal: "select" or "new"
  const [patientMode, setPatientMode] = useState("select");

  // Inline New Patient Form State
  const initialNewPatientForm = {
    fullName: "",
    gender: "Male",
    age: "",
    phone: "",
    emergencyContact: "",
    address: "",
    bloodGroup: "A+",
    allergies: "",
  };
  const [newPatientForm, setNewPatientForm] = useState(initialNewPatientForm);

  // Form state for creating appointment
  const initialForm = {
    patientId: "",
    date: new Date().toISOString().split("T")[0],
    time: "10:00 AM",
    reason: "",
    notes: "",
  };
  const [formData, setFormData] = useState(initialForm);

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

  // Filtered Appointments (Matches Status, Date, Name, Reason, Patient ID, Appointment ID, and last 3 digits)
  const cleanTerm = searchTerm.trim().toLowerCase();
  const digitsOnlyTerm = cleanTerm.replace(/\D/g, "");

  const filteredAppointments = appointments.filter((apt) => {
    const matchesStatus =
      activeFilter === "All" ? true : apt.status === activeFilter;
    const matchesDate = filterByDate(apt.date);

    if (!cleanTerm) return matchesStatus && matchesDate;

    const pName = (apt.patientName || "").toLowerCase();
    const pId = (apt.patientId || "").toLowerCase();
    const aptId = (apt.id || "").toLowerCase();
    const reason = (apt.reason || "").toLowerCase();

    const pIdDigits = pId.replace(/\D/g, "");
    const aptIdDigits = aptId.replace(/\D/g, "");

    const matchesText =
      pName.includes(cleanTerm) ||
      pId.includes(cleanTerm) ||
      aptId.includes(cleanTerm) ||
      reason.includes(cleanTerm);

    const matchesDigits =
      digitsOnlyTerm.length > 0 &&
      (pIdDigits.includes(digitsOnlyTerm) ||
        aptIdDigits.includes(digitsOnlyTerm) ||
        pIdDigits.slice(-3).includes(digitsOnlyTerm) ||
        aptIdDigits.slice(-3).includes(digitsOnlyTerm));

    return matchesStatus && matchesDate && (matchesText || matchesDigits);
  });

  // Selected patient preview object
  const selectedPatientObj = patients.find((p) => p.id === formData.patientId);

  // Quick Register New Patient Button Handler inside inline form
  const handleQuickRegisterPatient = (e) => {
    e.preventDefault();
    if (!newPatientForm.fullName.trim() || !newPatientForm.phone.trim()) {
      showToast("Please enter Patient Full Name and Phone Number", "error");
      return;
    }
    const registered = addPatient({
      ...newPatientForm,
      age: Number(newPatientForm.age) || 30,
    });
    if (registered) {
      setFormData({ ...formData, patientId: registered.id });
      setPatientMode("select");
      setNewPatientForm(initialNewPatientForm);
      showToast(`✓ Patient ${registered.fullName} (${registered.id}) registered & selected!`, "success");
    }
  };

  // Main Appointment Form Submit Handler
  const handleCreateAppointment = (e) => {
    e.preventDefault();

    let targetPatient = null;

    if (patientMode === "new") {
      if (!newPatientForm.fullName.trim() || !newPatientForm.phone.trim()) {
        showToast("Please enter Patient Full Name and Phone Number", "error");
        return;
      }
      targetPatient = addPatient({
        ...newPatientForm,
        age: Number(newPatientForm.age) || 30,
      });
    } else {
      targetPatient = patients.find((p) => p.id === formData.patientId);
    }

    if (!targetPatient) {
      showToast("Please select or register a patient for this appointment", "error");
      return;
    }

    if (!formData.reason.trim()) {
      showToast("Please enter reason for visit", "error");
      return;
    }

    addAppointment({
      ...formData,
      patientId: targetPatient.id,
      patientName: targetPatient.fullName,
    });

    setIsAddModalOpen(false);
    setFormData(initialForm);
    setPatientMode("select");
    setNewPatientForm(initialNewPatientForm);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Scheduled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
            <Clock className="w-3 h-3" /> Scheduled
          </span>
        );
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-teal-50 text-teal-700 border border-teal-200/60">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-red-50 text-red-700 border border-red-200/60">
            <XCircle className="w-3 h-3" /> Cancelled
          </span>
        );
      case "No Show":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200/60">
            <AlertCircle className="w-3 h-3" /> No Show
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        {/* Top Row: Date Filter & Status Filter */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-3">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full lg:w-auto overflow-x-auto shrink-0">
            {["All", "Scheduled", "Completed", "Cancelled"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  activeFilter === tab
                    ? "bg-teal-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Date Filter Bar */}
          <div className="flex items-center justify-start gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 shrink-0">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
              {datePresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setDateFilter(preset.id);
                    setCustomDate("");
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                    dateFilter === preset.id
                      ? "bg-white text-teal-800 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom Date Picker */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded-xl shrink-0">
              <span className="text-[10px] font-bold text-slate-400">Date:</span>
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
        </div>

        {/* Bottom Row: Search & Add Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, Name or last 3 digits..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            />
          </div>

          <button
            onClick={() => {
              setPatientMode("select");
              setIsAddModalOpen(true);
            }}
            className="w-full sm:w-auto px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      {/* Appointment Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {filteredAppointments.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-slate-100 m-6 rounded-2xl">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-700">No appointments found</h4>
            <p className="text-xs text-slate-400 mt-1">
              No appointments match your status, date ({dateFilter}), or search filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Patient Name</th>
                  <th className="py-3.5 px-4">Reason for Visit</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredAppointments.map((apt) => {
                  const patient = patients.find((p) => p.id === apt.patientId) || {
                    id: apt.patientId,
                    fullName: apt.patientName,
                    age: 35,
                    gender: "Male",
                  };
                  return (
                    <tr key={apt.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">{apt.date}</div>
                        <div className="text-[11px] text-teal-700 font-mono">{apt.time}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{apt.patientName}</div>
                        <div className="text-[10px] text-slate-400">ID: {apt.patientId}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium max-w-xs truncate">
                        {apt.reason}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(apt.status)}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                        {apt.status === "Scheduled" && (
                          <button
                            onClick={() => startConsultationForPatient(patient)}
                            className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl transition inline-flex items-center gap-1 shadow-xs"
                          >
                            <Stethoscope className="w-3.5 h-3.5" />
                            <span>Start Consultation</span>
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedAppointmentForView(apt)}
                          className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition text-xs inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        {apt.status === "Scheduled" && (
                          <button
                            onClick={() => cancelAppointment(apt.id)}
                            className="px-2 py-1 text-red-600 hover:bg-red-50 rounded-lg transition text-xs font-medium"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Appointment Modal with Dual Mode (Select Existing vs Add New Patient) */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Schedule New Appointment"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateAppointment} className="space-y-4">
          {/* Patient Selection Toggle Box */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <User className="w-4 h-4 text-teal-600" />
                <span>Patient Selection *</span>
              </label>

              {/* Mode Switch Buttons */}
              <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPatientMode("select")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                    patientMode === "select"
                      ? "bg-white text-teal-800 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Select Existing Patient
                </button>

                <button
                  type="button"
                  onClick={() => setPatientMode("new")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition flex items-center gap-1 ${
                    patientMode === "new"
                      ? "bg-teal-600 text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Patient</span>
                </button>
              </div>
            </div>

            {/* Mode 1: Select Existing Patient Dropdown */}
            {patientMode === "select" ? (
              <div className="space-y-3">
                <select
                  required={patientMode === "select"}
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="">-- Select Registered Patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.id} • {p.phone})
                    </option>
                  ))}
                </select>

                {/* Selected Patient Preview Card */}
                {selectedPatientObj && (
                  <div className="p-3 bg-teal-50/80 rounded-xl border border-teal-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                        {selectedPatientObj.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{selectedPatientObj.fullName}</p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          ID: {selectedPatientObj.id} • {selectedPatientObj.age} Yrs • {selectedPatientObj.gender} • {selectedPatientObj.phone}
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-white text-teal-800 font-bold text-[11px] rounded-full border border-teal-100">
                      {selectedPatientObj.bloodGroup || "Blood Group N/A"}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              /* Mode 2: Inline Short Registration Form for New Patient */
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-teal-800 flex items-center gap-1.5">
                    <UserPlus className="w-3.5 h-3.5 text-teal-600" />
                    New Patient Registration
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Auto-saves to Patients database</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required={patientMode === "new"}
                      value={newPatientForm.fullName}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, fullName: e.target.value })}
                      placeholder="e.g. Ayesha Khan"
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:bg-white focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Gender *
                    </label>
                    <select
                      value={newPatientForm.gender}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, gender: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:bg-white focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Age (Years) *
                    </label>
                    <input
                      type="number"
                      required={patientMode === "new"}
                      value={newPatientForm.age}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, age: e.target.value })}
                      placeholder="e.g. 28"
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:bg-white focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      required={patientMode === "new"}
                      value={newPatientForm.phone}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, phone: e.target.value })}
                      placeholder="e.g. 0300-1234567"
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:bg-white focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Emergency Contact
                    </label>
                    <input
                      type="text"
                      value={newPatientForm.emergencyContact}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, emergencyContact: e.target.value })}
                      placeholder="e.g. 0321-9876543"
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:bg-white focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Blood Group
                    </label>
                    <select
                      value={newPatientForm.bloodGroup}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, bloodGroup: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:bg-white focus:ring-1 focus:ring-teal-500"
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

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={newPatientForm.address}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, address: e.target.value })}
                      placeholder="e.g. Gulberg III, Lahore"
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:bg-white focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Allergies / Warning
                    </label>
                    <input
                      type="text"
                      value={newPatientForm.allergies}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, allergies: e.target.value })}
                      placeholder="e.g. Penicillin, Dust, None"
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:bg-white focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleQuickRegisterPatient}
                    className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-lg transition border border-teal-200 flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>Save Patient & Select</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Appointment Timing & Reason */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Appointment Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Appointment Time *
              </label>
              <select
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
              >
                <option value="09:00 AM">09:00 AM</option>
                <option value="09:30 AM">09:30 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="10:30 AM">10:30 AM</option>
                <option value="11:00 AM">11:00 AM</option>
                <option value="11:30 AM">11:30 AM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="02:30 PM">02:30 PM</option>
                <option value="03:00 PM">03:00 PM</option>
                <option value="03:30 PM">03:30 PM</option>
                <option value="04:00 PM">04:00 PM</option>
                <option value="04:30 PM">04:30 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason for Visit *
            </label>
            <input
              type="text"
              required
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="e.g. Routine checkup, Fever, Headache, Lab report review"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Internal Notes (Optional)
            </label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes for receptionist or doctor..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none resize-none"
            ></textarea>
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
              className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition shadow-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Schedule Appointment</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* View Appointment Details Modal */}
      {selectedAppointmentForView && (
        <Modal
          isOpen={Boolean(selectedAppointmentForView)}
          onClose={() => setSelectedAppointmentForView(null)}
          title={`Appointment Details — ${selectedAppointmentForView.id}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 text-sm">
                  {selectedAppointmentForView.patientName}
                </p>
                <p className="text-slate-400">ID: {selectedAppointmentForView.patientId}</p>
              </div>
              {getStatusBadge(selectedAppointmentForView.status)}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 font-medium block">Date</span>
                <span className="font-semibold text-slate-800">{selectedAppointmentForView.date}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 font-medium block">Time</span>
                <span className="font-semibold text-slate-800">{selectedAppointmentForView.time}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 font-medium block">Reason for Visit</span>
              <span className="font-semibold text-slate-800">{selectedAppointmentForView.reason}</span>
            </div>

            {selectedAppointmentForView.notes && (
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 font-medium block">Notes</span>
                <span className="text-slate-700">{selectedAppointmentForView.notes}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedAppointmentForView(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Close
              </button>
              {selectedAppointmentForView.status === "Scheduled" && (
                <button
                  onClick={() => {
                    const apt = selectedAppointmentForView;
                    const patient = patients.find((p) => p.id === apt.patientId) || {
                      id: apt.patientId,
                      fullName: apt.patientName,
                    };
                    setSelectedAppointmentForView(null);
                    startConsultationForPatient(patient);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition shadow-xs flex items-center gap-1.5"
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Start Consultation</span>
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
