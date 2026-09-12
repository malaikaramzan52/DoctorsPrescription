import React, { createContext, useContext, useState, useEffect } from "react";
import {
  defaultDoctor,
  defaultClinic,
  defaultRxSettings,
  initialPatients,
  initialAppointments,
  initialVisits,
} from "../data/mockData";

const ClinicContext = createContext();

export const ClinicProvider = ({ children }) => {
  // Authentication State (Persisted in localStorage)
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const saved = localStorage.getItem("medteal_is_logged_in");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem("medteal_is_logged_in", JSON.stringify(isLoggedIn));
  }, [isLoggedIn]);

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("medteal_user");
    return savedUser ? JSON.parse(savedUser) : { email: defaultDoctor.email, name: defaultDoctor.name };
  });

  // Active Tab State (Persisted in localStorage)
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem("medteal_active_tab");
    return savedTab || "dashboard";
  });

  // Consultation pre-selected patient state
  const [consultationPatient, setConsultationPatient] = useState(null);

  // Main Persistent Data Collections
  const [patients, setPatients] = useState(() => {
    const saved = localStorage.getItem("medteal_patients");
    return saved ? JSON.parse(saved) : initialPatients;
  });

  const [appointments, setAppointments] = useState(() => {
    const saved = localStorage.getItem("medteal_appointments");
    return saved ? JSON.parse(saved) : initialAppointments;
  });

  const [visits, setVisits] = useState(() => {
    const saved = localStorage.getItem("medteal_visits");
    return saved ? JSON.parse(saved) : initialVisits;
  });

  const [doctor, setDoctor] = useState(() => {
    const saved = localStorage.getItem("medteal_doctor");
    return saved ? JSON.parse(saved) : defaultDoctor;
  });

  const [clinic, setClinic] = useState(() => {
    const saved = localStorage.getItem("medteal_clinic");
    return saved ? JSON.parse(saved) : defaultClinic;
  });

  const [rxSettings, setRxSettings] = useState(() => {
    const saved = localStorage.getItem("medteal_rx_settings");
    return saved ? JSON.parse(saved) : defaultRxSettings;
  });

  // Toast Notification System
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000);
  };

  // Sync with LocalStorage

  useEffect(() => {
    localStorage.setItem("medteal_active_tab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem("medteal_user", JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem("medteal_patients", JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem("medteal_appointments", JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem("medteal_visits", JSON.stringify(visits));
  }, [visits]);

  useEffect(() => {
    localStorage.setItem("medteal_doctor", JSON.stringify(doctor));
  }, [doctor]);

  useEffect(() => {
    localStorage.setItem("medteal_clinic", JSON.stringify(clinic));
  }, [clinic]);

  useEffect(() => {
    localStorage.setItem("medteal_rx_settings", JSON.stringify(rxSettings));
  }, [rxSettings]);

  // Auth Methods
  const login = (email, password) => {
    if (email && password) {
      const loggedUser = { email, name: doctor.name || "Dr. Sarah Jenkins" };
      setUser(loggedUser);
      setIsLoggedIn(true);
      showToast("Successfully logged in! Welcome back.", "success");
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("medteal_is_logged_in");
    showToast("Logged out successfully.", "info");
  };

  // Notifications Cleared State
  const [isNotificationsCleared, setIsNotificationsCleared] = useState(false);
  const clearAllNotifications = () => {
    setIsNotificationsCleared(true);
    showToast("All notifications cleared.", "info");
  };

  // Mobile Sidebar Drawer State
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const toggleMobileSidebar = () => setMobileSidebarOpen((prev) => !prev);
  const closeMobileSidebar = () => setMobileSidebarOpen(false);

  // Navigation Methods
  const navigateTo = (tab) => {
    setActiveTab(tab);
    setMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startConsultationForPatient = (patient) => {
    setConsultationPatient(patient);
    setActiveTab("consultation");
    showToast(`Started consultation for ${patient.fullName}`, "info");
  };

  // Patient Actions
  const addPatient = (patientData) => {
    const newId = `PAT-2026-${String(patients.length + 1).padStart(3, "0")}`;
    const newPatient = {
      ...patientData,
      id: newId,
      totalVisits: 0,
      lastVisit: "Never",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setPatients((prev) => [newPatient, ...prev]);
    setIsNotificationsCleared(false);
    showToast(`Patient ${newPatient.fullName} (${newId}) added successfully!`, "success");
    return newPatient;
  };

  const updatePatient = (updatedPatient) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === updatedPatient.id ? { ...p, ...updatedPatient } : p))
    );
    // Also update consultationPatient if it's currently open
    if (consultationPatient && consultationPatient.id === updatedPatient.id) {
      setConsultationPatient(updatedPatient);
    }
    showToast("Patient record updated successfully.", "success");
  };

  // Appointment Actions
  const addAppointment = (appointmentData) => {
    const newId = `APT-${Math.floor(100 + Math.random() * 900)}`;
    const newAppointment = {
      ...appointmentData,
      id: newId,
      status: "Scheduled",
    };
    setAppointments((prev) => [newAppointment, ...prev]);
    setIsNotificationsCleared(false);
    showToast(`Appointment scheduled for ${newAppointment.patientName}`, "success");
    return newAppointment;
  };

  const updateAppointmentStatus = (id, newStatus) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
    );
    showToast(`Appointment status updated to ${newStatus}`, "info");
  };

  const cancelAppointment = (id) => {
    updateAppointmentStatus(id, "Cancelled");
  };

  // Consultation / Visit Actions
  const saveConsultation = (consultationData) => {
    const currentDate = new Date().toISOString().split("T")[0];
    const visitId = `VST-2026-${String(visits.length + 1).padStart(3, "0")}`;

    const newVisit = {
      ...consultationData,
      id: visitId,
      date: currentDate,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      createdAt: new Date().toISOString(),
    };

    // Add to visits
    setVisits((prev) => [newVisit, ...prev]);

    // Update patient total visits & last visit
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === consultationData.patientId) {
          return {
            ...p,
            totalVisits: (p.totalVisits || 0) + 1,
            lastVisit: currentDate,
          };
        }
        return p;
      })
    );

    // If there is an appointment scheduled for this patient today, mark it as Completed automatically
    setAppointments((prev) =>
      prev.map((apt) => {
        if (
          apt.patientId === consultationData.patientId &&
          apt.status === "Scheduled"
        ) {
          return { ...apt, status: "Completed" };
        }
        return apt;
      })
    );

    showToast(`Consultation saved & medical history updated for ${consultationData.patientName}!`, "success");
    return newVisit;
  };

  // Settings Actions
  const updateDoctorProfile = (data) => {
    setDoctor((prev) => ({ ...prev, ...data }));
    showToast("Doctor profile settings saved.", "success");
  };

  const updateClinicInfo = (data) => {
    setClinic((prev) => ({ ...prev, ...data }));
    showToast("Clinic information updated.", "success");
  };

  const updateRxSettings = (data) => {
    setRxSettings((prev) => ({ ...prev, ...data }));
    showToast("Prescription layout settings updated.", "success");
  };

  const resetToDemoData = () => {
    setPatients(initialPatients);
    setAppointments(initialAppointments);
    setVisits(initialVisits);
    setDoctor(defaultDoctor);
    setClinic(defaultClinic);
    setRxSettings(defaultRxSettings);
    showToast("System reset to default demo data.", "info");
  };

  return (
    <ClinicContext.Provider
      value={{
        isLoggedIn,
        user,
        login,
        logout,
        activeTab,
        navigateTo,
        mobileSidebarOpen,
        toggleMobileSidebar,
        closeMobileSidebar,
        isNotificationsCleared,
        clearAllNotifications,
        consultationPatient,
        setConsultationPatient,
        startConsultationForPatient,
        patients,
        addPatient,
        updatePatient,
        appointments,
        addAppointment,
        updateAppointmentStatus,
        cancelAppointment,
        visits,
        saveConsultation,
        doctor,
        updateDoctorProfile,
        clinic,
        updateClinicInfo,
        rxSettings,
        updateRxSettings,
        resetToDemoData,
        toast,
        showToast,
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error("useClinic must be used within a ClinicProvider");
  }
  return context;
};
