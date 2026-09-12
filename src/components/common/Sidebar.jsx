import React from "react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Stethoscope,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
  Cross,
  X,
} from "lucide-react";
import { useClinic } from "../../context/ClinicContext";

export const Sidebar = () => {
  const {
    activeTab,
    navigateTo,
    appointments,
    logout,
    clinic,
    doctor,
    mobileSidebarOpen,
    closeMobileSidebar,
    isNotificationsCleared,
  } = useClinic();

  const todayStr = new Date().toISOString().split("T")[0];
  const pendingAppointmentsCount = appointments.filter(
    (apt) => apt.date === todayStr && apt.status === "Scheduled"
  ).length;

  const showAppointmentBadge = !isNotificationsCleared && pendingAppointmentsCount > 0;

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "patients", label: "Patients", icon: Users },
    {
      id: "appointments",
      label: "Appointments",
      icon: Calendar,
      badge: showAppointmentBadge ? pendingAppointmentsCount : null,
    },
    { id: "consultation", label: "Consultation", icon: Stethoscope },
    { id: "medicalHistory", label: "Medical History", icon: BookOpen },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const SidebarContent = () => (
    <div className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between h-full no-print">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20">
              <Cross className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-base leading-tight tracking-tight">
                DocCare Clinic
              </h1>
              <p className="text-xs text-slate-500 font-medium truncate max-w-[130px]">
                {clinic.name || "Single Doctor Panel"}
              </p>
            </div>
          </div>

          {/* Close button for Mobile Drawer */}
          <button
            onClick={closeMobileSidebar}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Main Menu
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? "bg-teal-600 text-white shadow-sm shadow-teal-600/20"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive
                        ? "text-white"
                        : "text-slate-400 group-hover:text-teal-600"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-teal-100 text-teal-800"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Doctor Account Info */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="p-3 rounded-xl bg-white border border-slate-100 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs shrink-0">
              {doctor.name ? doctor.name.split(" ").map((n) => n[0]).slice(0, 2).join("") : "DR"}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-800 truncate">
                {doctor.name || "Dr. Sarah Ahmed"}
              </p>
              <p className="text-[10px] text-slate-500 truncate">Consultant M.D.</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 h-screen sticky top-0 z-30">
        <SidebarContent />
      </aside>

      {/* 2. Mobile Drawer Overlay Sidebar */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            onClick={closeMobileSidebar}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          ></div>
          <div className="relative flex-1 max-w-xs w-full bg-white shadow-2xl z-10 animate-slide-in">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
};
