import React, { useState, useEffect, useRef } from "react";
import {
  Stethoscope,
  Bell,
  Search,
  User,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  UserCheck,
  Menu,
  Trash2,
} from "lucide-react";
import { useClinic } from "../../context/ClinicContext";

export const Navbar = () => {
  const {
    activeTab,
    navigateTo,
    doctor,
    clinic,
    logout,
    patients,
    appointments,
    visits,
    toggleMobileSidebar,
    isNotificationsCleared,
    clearAllNotifications,
  } = useClinic();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [hasUnreadNotifs, setHasUnreadNotifs] = useState(true);

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const calendarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setCalendarOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setNotifOpen(false);
        setProfileOpen(false);
        setCalendarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const todayStrISO = new Date().toISOString().split("T")[0];
  const todayStrDisplay = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const tabTitles = {
    dashboard: { title: "Dashboard Overview", subtitle: "Welcome back! Here is today's clinic summary." },
    patients: { title: "Patient Records", subtitle: "Manage patient information, medical history and profiles." },
    appointments: { title: "Appointments Management", subtitle: "Schedule and manage patient consultation appointments." },
    consultation: { title: "Doctor Consultation & Prescription", subtitle: "Conduct patient checkups, record vitals, diagnosis and prescribe medicines." },
    medicalHistory: { title: "Medical History Archives", subtitle: "Search and review past patient consultation records." },
    reports: { title: "Clinic Analytics & Reports", subtitle: "View and filter clinic consultations, diagnosis and patient records." },
    settings: { title: "Clinic & Doctor Settings", subtitle: "Manage doctor profile, clinic letterhead and prescription preferences." },
  };

  const currentTab = tabTitles[activeTab] || tabTitles.dashboard;

  // Mini Calendar Generator
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // REAL-TIME NOTIFICATIONS GENERATOR
  const todayAppointments = appointments.filter((a) => a.date === todayStrISO);
  const todayVisits = visits.filter((v) => v.date === todayStrISO);
  const latestAppointment = appointments[0];
  const latestVisit = visits[0];
  const latestPatient = patients[0];

  const realTimeNotifications = [];

  if (todayAppointments.length > 0) {
    realTimeNotifications.push({
      id: "apt-today-count",
      type: "appointment",
      dotColor: "bg-teal-500",
      title: `${todayAppointments.length} Appointment${todayAppointments.length > 1 ? "s" : ""} scheduled for today`,
      subtitle: `Today's schedule (${todayAppointments.filter((a) => a.status === "Scheduled").length} pending)`,
      targetTab: "appointments",
    });
  }

  if (todayVisits.length > 0) {
    realTimeNotifications.push({
      id: "visit-today-count",
      type: "consultation",
      dotColor: "bg-emerald-500",
      title: `${todayVisits.length} Consultation${todayVisits.length > 1 ? "s" : ""} completed today`,
      subtitle: `Prescriptions issued & saved`,
      targetTab: "medicalHistory",
    });
  }

  if (latestAppointment) {
    realTimeNotifications.push({
      id: `latest-apt-${latestAppointment.id}`,
      type: "latest-apt",
      dotColor: "bg-blue-500",
      title: `Latest Appointment: ${latestAppointment.patientName}`,
      subtitle: `${latestAppointment.date} at ${latestAppointment.time} • ${latestAppointment.reason}`,
      targetTab: "appointments",
    });
  }

  if (latestVisit) {
    realTimeNotifications.push({
      id: `latest-visit-${latestVisit.id}`,
      type: "latest-visit",
      dotColor: "bg-indigo-500",
      title: `Latest Consultation: ${latestVisit.patientName}`,
      subtitle: `Diagnosis: ${latestVisit.diagnosis || "General Consultation"}`,
      targetTab: "medicalHistory",
    });
  }

  if (latestPatient) {
    realTimeNotifications.push({
      id: `latest-patient-${latestPatient.id}`,
      type: "latest-patient",
      dotColor: "bg-amber-500",
      title: `Patient Record: ${latestPatient.fullName}`,
      subtitle: `ID: ${latestPatient.id} • Phone: ${latestPatient.phone}`,
      targetTab: "patients",
    });
  }

  realTimeNotifications.push({
    id: "system-backup",
    type: "system",
    dotColor: "bg-slate-400",
    title: "Realtime Local Storage Active",
    subtitle: `${patients.length} Patients • ${appointments.length} Appointments • ${visits.length} Visits synced`,
    targetTab: "dashboard",
  });

  const handleOpenNotifications = () => {
    setNotifOpen(!notifOpen);
    if (!notifOpen) {
      setHasUnreadNotifs(false);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200/80 px-4 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between sticky top-0 z-30 no-print">
      {/* Left: Mobile Hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileSidebar}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">
            {currentTab.title}
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5 hidden sm:block">
            {currentTab.subtitle}
          </p>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Interactive Calendar Dropdown Button */}
        <div className="relative" ref={calendarRef}>
          <button
            onClick={() => setCalendarOpen(!calendarOpen)}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 text-xs font-semibold text-slate-700 transition shadow-2xs cursor-pointer whitespace-nowrap"
          >
            <CalendarIcon className="w-4 h-4 text-teal-600 shrink-0" />
            <span className="hidden md:inline">{todayStrDisplay}</span>
            <span className="md:hidden text-[11px] font-bold">{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {calendarOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 animate-scale-up">
              {/* Month Navigation */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <button
                  onClick={prevMonth}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-600 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-slate-800">
                  {monthName} {year}
                </span>
                <button
                  onClick={nextMonth}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-600 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Weekday Labels */}
              <div className="grid grid-cols-7 gap-1 text-center my-2 text-[10px] font-bold text-slate-400 uppercase">
                <span>Su</span>
                <span>Mo</span>
                <span>Tu</span>
                <span>We</span>
                <span>Th</span>
                <span>Fr</span>
                <span>Sa</span>
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <span key={`empty-${i}`} className="p-1.5"></span>
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dayDateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                  const isToday = dayDateStr === todayStrISO;
                  const isSelected = dayDateStr === selectedDate;

                  return (
                    <button
                      key={dayNum}
                      onClick={() => {
                        setSelectedDate(dayDateStr);
                      }}
                      className={`p-1.5 rounded-lg font-semibold transition ${
                        isSelected
                          ? "bg-teal-600 text-white shadow-xs font-bold"
                          : isToday
                          ? "bg-teal-50 text-teal-800 font-bold border border-teal-200"
                          : "hover:bg-slate-100 text-slate-700"
                      }`}
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>

              {/* Action Jump to Appointments */}
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">Selected: {selectedDate}</span>
                <button
                  onClick={() => {
                    setCalendarOpen(false);
                    navigateTo("appointments");
                  }}
                  className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold rounded-lg transition"
                >
                  View Appointments
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Real-time Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={handleOpenNotifications}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {!isNotificationsCleared && hasUnreadNotifs && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-teal-500 rounded-full ring-2 ring-white animate-pulse"></span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 animate-scale-up">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span>Realtime Notifications</span>
                  {!isNotificationsCleared && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  )}
                </h4>

                {!isNotificationsCleared ? (
                  <button
                    onClick={clearAllNotifications}
                    className="text-[11px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear All</span>
                  </button>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
                    Cleared
                  </span>
                )}
              </div>

              {/* Dynamic Notification List / Empty State */}
              <div className="py-2 space-y-2.5 max-h-80 overflow-y-auto">
                {isNotificationsCleared || realTimeNotifications.length === 0 ? (
                  <div className="py-8 text-center space-y-1">
                    <CheckCircle2 className="w-8 h-8 text-teal-500 mx-auto mb-1" />
                    <p className="text-xs font-bold text-slate-700">All Notifications Cleared</p>
                    <p className="text-[10px] text-slate-400">No active unread alerts right now</p>
                  </div>
                ) : (
                  realTimeNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        setNotifOpen(false);
                        if (notif.targetTab) navigateTo(notif.targetTab);
                      }}
                      className="p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition cursor-pointer flex items-start gap-2.5 text-xs"
                    >
                      <div className={`w-2 h-2 mt-1.5 rounded-full ${notif.dotColor} shrink-0`}></div>
                      <div>
                        <p className="font-bold text-slate-800 leading-snug">{notif.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{notif.subtitle}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-medium">
                  {isNotificationsCleared
                    ? "Notifications will reappear with new clinic activity"
                    : "Auto-updates in realtime with clinic activity"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Doctor Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
          >
            <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {doctor.name ? doctor.name.split(" ").map(n => n[0]).slice(0, 2).join("") : "DR"}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-tight">
                {doctor.name || "Dr. Sarah Jenkins"}
              </p>
              <p className="text-[10px] text-slate-500 font-medium truncate max-w-[120px]">
                {doctor.specialization || "Consultant"}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-scale-up">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800">{doctor.name}</p>
                <p className="text-[11px] text-slate-500">{doctor.email}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigateTo("settings");
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Profile & Settings</span>
                </button>
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl transition"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
