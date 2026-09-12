import React, { useState } from "react";
import {
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Stethoscope,
  ChevronRight,
  Filter,
} from "lucide-react";
import { useClinic } from "../../context/ClinicContext";

export const DashboardPage = () => {
  const {
    patients,
    appointments,
    visits,
    navigateTo,
    startConsultationForPatient,
  } = useClinic();

  const [dateFilter, setDateFilter] = useState("today"); // today, yesterday, thisWeek, thisMonth, allTime, custom
  const [customDate, setCustomDate] = useState("");

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

  // Calculated Metrics based on Date Filter
  const filteredAppointments = appointments.filter((apt) => filterByDate(apt.date));
  const filteredConsultationsCount = visits.filter((v) => filterByDate(v.date)).length;
  const totalPatientsCount = patients.length;
  const pendingAppointmentsCount = filteredAppointments.filter(
    (apt) => apt.status === "Scheduled"
  ).length;

  const recentPatients = patients.slice(0, 5);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Scheduled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
            <Clock className="w-3 h-3" /> Scheduled
          </span>
        );
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-teal-50 text-teal-700 border border-teal-200/60">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-700 border border-red-200/60">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Date Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
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

      {/* 1. Summary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Filtered Appointments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Appointments
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {filteredAppointments.length}
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-1 capitalize">
              {dateFilter === "custom" && customDate ? customDate : dateFilter} period
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Consultations Completed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Consultations
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {filteredConsultationsCount}
            </h3>
            <p className="text-[11px] text-teal-600 font-medium mt-1">
              Prescriptions issued
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Stethoscope className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Total Patients */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Patients
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {totalPatientsCount}
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              Registered clinic records
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: Pending Appointments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Appointments
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {pendingAppointmentsCount}
            </h3>
            <p className="text-[11px] text-amber-600 font-medium mt-1">
              Awaiting consultation
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. Main Dashboard Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointments Table (Filtered by Date) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">Appointments List</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Scheduled consultations for selected timeframe (<strong className="capitalize">{dateFilter}</strong>)
                </p>
              </div>
              <button
                onClick={() => navigateTo("appointments")}
                className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 hover:underline"
              >
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {filteredAppointments.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-xl">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-600">No appointments found for selected date filter ({dateFilter})</p>
                <p className="text-xs text-slate-400 mt-1">Try selecting 'All Time' or another timeframe preset</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-3">Patient Name</th>
                      <th className="py-3 px-3">Date & Time</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredAppointments.map((apt) => {
                      const patient = patients.find((p) => p.id === apt.patientId) || {
                        id: apt.patientId,
                        fullName: apt.patientName,
                        age: 35,
                        gender: "Male",
                      };
                      return (
                        <tr key={apt.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3.5 px-3">
                            <div className="font-semibold text-slate-800">{apt.patientName}</div>
                            <div className="text-xs text-slate-400">{apt.reason}</div>
                          </td>
                          <td className="py-3.5 px-3 font-medium text-slate-600 whitespace-nowrap text-xs">
                            {apt.date} • {apt.time}
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            {getStatusBadge(apt.status)}
                          </td>
                          <td className="py-3.5 px-3 text-right whitespace-nowrap">
                            {apt.status === "Scheduled" ? (
                              <button
                                onClick={() => startConsultationForPatient(patient)}
                                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition shadow-xs flex items-center gap-1.5 ml-auto"
                              >
                                <Stethoscope className="w-3.5 h-3.5" />
                                <span>Start Consultation</span>
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400 font-medium italic">
                                {apt.status}
                              </span>
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
        </div>

        {/* Right Side Column: Recent Patients */}
        <div className="space-y-6">
          {/* Recent Patients */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Recent Patients</h3>
              <button
                onClick={() => navigateTo("patients")}
                className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {recentPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-teal-50 text-teal-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {patient.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{patient.fullName}</p>
                      <p className="text-[11px] text-slate-400">
                        Last Visit: {patient.lastVisit}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => startConsultationForPatient(patient)}
                    className="px-2.5 py-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition"
                  >
                    Consult
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
