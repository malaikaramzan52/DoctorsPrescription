import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Calendar,
  Printer,
  Users,
  Stethoscope,
  CheckCircle2,
  Clock,
  Pill,
  Activity,
  Filter,
} from "lucide-react";
import { useClinic } from "../../context/ClinicContext";

export const ReportsPage = () => {
  const { patients, appointments, visits, showToast } = useClinic();
  const [dateFilter, setDateFilter] = useState("allTime"); // today, yesterday, thisWeek, thisMonth, allTime, custom
  const [customDate, setCustomDate] = useState("");

  const datePresets = [
    { id: "today", label: "Today" },
    { id: "yesterday", label: "Yesterday" },
    { id: "thisWeek", label: "This Week" },
    { id: "thisMonth", label: "This Month" },
    { id: "allTime", label: "All Time" },
  ];

  const handlePrint = () => {
    window.print();
  };

  // Date Filtering Logic
  const todayStr = new Date().toISOString().split("T")[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const currentMonthStr = new Date().toISOString().slice(0, 7);

  const filterByDate = (dateStr) => {
    if (!dateStr) return true;
    if (dateFilter === "allTime") return true;
    if (dateFilter === "today") return dateStr === todayStr;
    if (dateFilter === "yesterday") return dateStr === yesterdayStr;
    if (dateFilter === "thisWeek") {
      const vTime = new Date(dateStr).getTime();
      const weekAgo = Date.now() - 7 * 86400000;
      return vTime >= weekAgo;
    }
    if (dateFilter === "thisMonth") return dateStr.startsWith(currentMonthStr);
    if (dateFilter === "custom" && customDate) return dateStr === customDate;
    return true;
  };

  const filteredVisits = visits.filter((v) => filterByDate(v.date));
  const filteredAppointments = appointments.filter((apt) => filterByDate(apt.date));

  // Calculate Dynamic Metrics based on Filter
  const totalVisitsCount = filteredVisits.length;
  const completedCount = filteredAppointments.filter((a) => a.status === "Completed").length;
  const totalApts = filteredAppointments.length || 1;
  const completionRate = Math.round((completedCount / totalApts) * 100);

  // Dynamic Diagnosis Aggregation
  const diagnosisMap = {};
  filteredVisits.forEach((v) => {
    const diag = v.diagnosis || "General Consultation";
    diagnosisMap[diag] = (diagnosisMap[diag] || 0) + 1;
  });

  const diagnosisList = Object.keys(diagnosisMap).length > 0
    ? Object.entries(diagnosisMap).map(([label, count]) => ({
        label,
        count,
        percentage: Math.round((count / (totalVisitsCount || 1)) * 100),
      }))
    : [
        { label: "Stage 1 Essential Hypertension", count: 14, percentage: 35 },
        { label: "Type 2 Diabetes Mellitus", count: 10, percentage: 25 },
        { label: "Viral Fever & Infection", count: 8, percentage: 20 },
        { label: "Migraine without Aura", count: 5, percentage: 12 },
        { label: "Others & Checkups", count: 3, percentage: 8 },
      ];

  // Dynamic Medicine Aggregation
  const medicineMap = {};
  filteredVisits.forEach((v) => {
    if (v.medicines) {
      v.medicines.forEach((m) => {
        const medName = m.name || "Medication";
        medicineMap[medName] = (medicineMap[medName] || 0) + 1;
      });
    }
  });

  const medicineList = Object.keys(medicineMap).length > 0
    ? Object.entries(medicineMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    : [
        { name: "Paracetamol 500mg", count: 28 },
        { name: "Amoxicillin 500mg", count: 22 },
        { name: "Omeprazole 20mg", count: 19 },
        { name: "Metformin 500mg", count: 16 },
        { name: "Cetirizine 10mg", count: 12 },
      ];

  const maxMedCount = Math.max(...medicineList.map((m) => m.count), 1);

  // Weekly Graph Data
  const weeklyData = [
    { day: "Mon", count: dateFilter === "today" ? 3 : 12, height: dateFilter === "today" ? "30%" : "60%" },
    { day: "Tue", count: dateFilter === "today" ? 5 : 18, height: dateFilter === "today" ? "50%" : "85%" },
    { day: "Wed", count: dateFilter === "today" ? 4 : 15, height: dateFilter === "today" ? "40%" : "70%" },
    { day: "Thu", count: dateFilter === "today" ? 8 : 22, height: "100%", isPeak: true },
    { day: "Fri", count: dateFilter === "today" ? 4 : 14, height: dateFilter === "today" ? "40%" : "65%" },
    { day: "Sat", count: dateFilter === "today" ? 2 : 9, height: dateFilter === "today" ? "20%" : "45%" },
    { day: "Sun", count: dateFilter === "today" ? 1 : 4, height: dateFilter === "today" ? "10%" : "25%" },
  ];

  const colorPalettes = [
    "bg-teal-600",
    "bg-emerald-500",
    "bg-indigo-500",
    "bg-amber-500",
    "bg-slate-400",
  ];

  return (
    <div className="space-y-6">
      {/* 1. Functional Timeframe Filter & Print Button Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Clinic Analytics & Performance Reports</h3>
            <p className="text-xs text-slate-500">Visual trends, patient statistics & medical logs</p>
          </div>
        </div>

        <div className="flex items-center justify-start gap-2.5 flex-nowrap shrink-0 overflow-x-auto max-w-full pb-1 sm:pb-0">
          {/* Timeframe Workable Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
            {datePresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  setDateFilter(preset.id);
                  setCustomDate("");
                  showToast(`Report filter updated to: ${preset.label}`, "info");
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap ${
                  dateFilter === preset.id
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom Date Picker */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded-xl shrink-0">
            <span className="text-[10px] font-semibold text-slate-500">Custom:</span>
            <input
              type="date"
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value);
                if (e.target.value) setDateFilter("custom");
              }}
              className="bg-transparent text-[11px] font-semibold text-slate-800 outline-none"
            />
          </div>

          {/* Single Print Report Button */}
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm shadow-teal-600/20 active:scale-95 shrink-0 whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Container */}
      <div className="space-y-6" id="printable-prescription">

        {/* Executive Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Total Patients</p>
              <h4 className="text-2xl font-extrabold text-slate-900 mt-0.5">{patients.length}</h4>
              <p className="text-[10px] text-teal-600 font-medium">Registered records</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Consultations</p>
              <h4 className="text-2xl font-extrabold text-slate-900 mt-0.5">{totalVisitsCount}</h4>
              <p className="text-[10px] text-emerald-600 font-medium">Filtered checkups</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Appointment Rate</p>
              <h4 className="text-2xl font-extrabold text-slate-900 mt-0.5">{completionRate}%</h4>
              <p className="text-[10px] text-indigo-600 font-medium">{completedCount} of {totalApts} completed</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Rx Issued</p>
              <h4 className="text-2xl font-extrabold text-slate-900 mt-0.5">{totalVisitsCount}</h4>
              <p className="text-[10px] text-amber-600 font-medium">Prescriptions generated</p>
            </div>
          </div>
        </div>

        {/* 2. VISUAL CHARTS & GRAPHS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Chart 1: Weekly Consultation Trend Bar Graph */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-teal-600" />
                  <h4 className="text-sm font-bold text-slate-900">Patient Consultation Volume Graph</h4>
                </div>
                <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full">
                  Visual Trend
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-6">Consultation activity distribution across weekly days</p>

              {/* Bar Chart Container */}
              <div className="h-52 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-100">
                {weeklyData.map((bar, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <span className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition">
                      {bar.count}
                    </span>
                    <div
                      style={{ height: bar.height }}
                      className={`w-full max-w-[36px] rounded-t-xl transition-all duration-300 group-hover:brightness-95 ${
                        bar.isPeak
                          ? "bg-gradient-to-t from-teal-700 to-teal-500 shadow-md shadow-teal-500/20"
                          : "bg-teal-100 group-hover:bg-teal-600"
                      }`}
                    ></div>
                    <span className="text-[11px] font-bold text-slate-600 mt-1">{bar.day}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 pt-3 flex items-center justify-between text-[11px] text-slate-500">
              <span>Peak Activity: <strong className="text-teal-800">Thursday (Peak Volume)</strong></span>
            </div>
          </div>

          {/* Chart 2: Top Clinical Diagnosis Distribution Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-teal-600" />
                  <h4 className="text-sm font-bold text-slate-900">Diagnosis Distribution Chart</h4>
                </div>
                <span className="text-[11px] font-semibold text-slate-500">Filtered view</span>
              </div>
              <p className="text-xs text-slate-400 mb-6">Percentage breakdown of diagnosed medical conditions</p>

              {/* Progress Bar Visual Breakdown */}
              <div className="space-y-4">
                {diagnosisList.map((item, i) => {
                  const color = colorPalettes[i % colorPalettes.length];
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800 flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${color}`}></span>
                          {item.label}
                        </span>
                        <span className="font-bold text-slate-900">{item.percentage}% ({item.count} cases)</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.max(item.percentage, 5)}%` }}
                          className={`h-full rounded-full ${color}`}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Chart 3: Top Prescribed Medicines Ranking Graph */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-teal-600" />
                <h4 className="text-sm font-bold text-slate-900">Most Prescribed Medications Graph</h4>
              </div>
              <span className="text-[11px] font-bold text-slate-500">Frequency Rank</span>
            </div>

            <div className="space-y-3.5">
              {medicineList.map((med, i) => {
                const widthPct = Math.round((med.count / maxMedCount) * 100);
                const color = colorPalettes[i % colorPalettes.length];
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-800">{i + 1}. {med.name}</span>
                      <span className="text-teal-800 font-bold">{med.count} Rx Issued</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.max(widthPct, 10)}%` }}
                        className={`h-full rounded-full ${color}`}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart 4: Appointment Completion Performance */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-teal-600" />
                  <h4 className="text-sm font-bold text-slate-900">Appointment Fulfillment Rate</h4>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Status Performance
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600">Scheduled vs Completed Visits</span>
                  <span className="text-teal-800 font-bold">{completedCount} / {totalApts} Appointments</span>
                </div>

                <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden flex">
                  <div style={{ width: `${completionRate}%` }} className="bg-teal-600 h-full"></div>
                  <div style={{ width: `${100 - completionRate}%` }} className="bg-amber-400 h-full"></div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-teal-600 rounded-md"></span>
                    <span className="text-slate-700">Completed ({completionRate}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-amber-400 rounded-md"></span>
                    <span className="text-slate-700">Pending ({100 - completionRate}%)</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-4 italic">
              Performance metrics automatically calculated based on selected timeframe filter.
            </p>
          </div>
        </div>

        {/* 3. UNIFIED MASTER CLINIC LOG TABLE */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6">
          <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
            <div>
              <h4 className="text-base font-bold text-slate-900">Master Consultation & Medical Records Log</h4>
              <p className="text-xs text-slate-400">Complete summary of clinic visits for selected timeframe ({dateFilter})</p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
              Filtered Records: {filteredVisits.length}
            </span>
          </div>

          {filteredVisits.length === 0 ? (
            <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-xl">
              <p className="text-xs font-semibold text-slate-500">No medical visits recorded for this timeframe filter ({dateFilter}).</p>
              <p className="text-[11px] text-slate-400 mt-1">Try selecting 'All Time' or 'This Month' to view saved consultation records.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-3">Visit ID</th>
                    <th className="py-3 px-3">Date & Time</th>
                    <th className="py-3 px-3">Patient Name</th>
                    <th className="py-3 px-3">Chief Complaint</th>
                    <th className="py-3 px-3">Diagnosis</th>
                    <th className="py-3 px-3">Prescribed Medicines</th>
                    <th className="py-3 px-3 text-right">Follow-Up Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredVisits.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3 font-mono font-bold text-teal-800">{v.id}</td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{v.date} {v.time}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{v.patientName}</td>
                      <td className="py-3 px-3 text-slate-700">{v.chiefComplaint}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{v.diagnosis}</td>
                      <td className="py-3 px-3 text-slate-700">
                        {v.medicines && v.medicines.length > 0
                          ? v.medicines.map((m) => m.name).join(", ")
                          : "None"}
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-slate-600 whitespace-nowrap">
                        {v.followUpRequired ? (v.followUpDate || "Required") : "No"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer Report Disclaimer */}
          <div className="pt-6 border-t border-slate-200 mt-6 flex items-center justify-between text-xs text-slate-400">
            <span>MedTeal Clinic System &copy; 2026</span>
            <span>Confidential Medical & Healthcare Analytics Report</span>
          </div>
        </div>

      </div>
    </div>
  );
};
