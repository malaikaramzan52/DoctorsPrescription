import React from "react";
import { ClinicProvider, useClinic } from "./context/ClinicContext";
import { Sidebar } from "./components/common/Sidebar";
import { Navbar } from "./components/common/Navbar";
import { Toast } from "./components/common/Toast";
import { Login } from "./components/auth/Login";
import { DashboardPage } from "./components/dashboard/DashboardPage";
import { PatientsPage } from "./components/patients/PatientsPage";
import { AppointmentsPage } from "./components/appointments/AppointmentsPage";
import { ConsultationPage } from "./components/consultation/ConsultationPage";
import { MedicalHistoryPage } from "./components/medicalHistory/MedicalHistoryPage";
import { ReportsPage } from "./components/reports/ReportsPage";
import { SettingsPage } from "./components/settings/SettingsPage";

function MainContent() {
  const { isLoggedIn, activeTab } = useClinic();

  if (!isLoggedIn) {
    return <Login />;
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardPage />;
      case "patients":
        return <PatientsPage />;
      case "appointments":
        return <AppointmentsPage />;
      case "consultation":
        return <ConsultationPage />;
      case "medicalHistory":
        return <MedicalHistoryPage />;
      case "reports":
        return <ReportsPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-row">
      {/* 1. Sidebar Navigation */}
      <Sidebar />

      {/* 2. Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto flex-1 overflow-x-hidden">
          {renderActiveTab()}
        </main>
      </div>

      {/* 3. Toast System */}
      <Toast />
    </div>
  );
}

function App() {
  return (
    <ClinicProvider>
      <MainContent />
    </ClinicProvider>
  );
}

export default App;