import React, { useState } from "react";
import { User, Save } from "lucide-react";
import { useClinic } from "../../context/ClinicContext";

export const SettingsPage = () => {
  const { doctor, updateDoctorProfile } = useClinic();

  // Doctor Form State
  const [doctorForm, setDoctorForm] = useState({ ...doctor });

  const handleSaveDoctor = (e) => {
    e.preventDefault();
    updateDoctorProfile(doctorForm);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
          <User className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Doctor Profile Settings</h3>
          <p className="text-xs text-slate-500">Manage practitioner details, PMDC license and contact info</p>
        </div>
      </div>

      {/* Main Doctor Profile Form Body */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6">
        <form onSubmit={handleSaveDoctor} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Doctor Full Name *
              </label>
              <input
                type="text"
                required
                value={doctorForm.name}
                onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                placeholder="e.g. Dr. Sarah Ahmed"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                PMDC / License Number *
              </label>
              <input
                type="text"
                required
                value={doctorForm.licenseNumber}
                onChange={(e) => setDoctorForm({ ...doctorForm, licenseNumber: e.target.value })}
                placeholder="e.g. PMDC-84920-P"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Qualification & Degrees
              </label>
              <input
                type="text"
                value={doctorForm.qualification}
                onChange={(e) => setDoctorForm({ ...doctorForm, qualification: e.target.value })}
                placeholder="e.g. MBBS, FCPS, MD (Internal Medicine)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Specialization Title
              </label>
              <input
                type="text"
                value={doctorForm.specialization}
                onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
                placeholder="e.g. Consultant Physician & Specialist"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={doctorForm.phone}
                onChange={(e) => setDoctorForm({ ...doctorForm, phone: e.target.value })}
                placeholder="e.g. +92 300 1234567"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={doctorForm.email}
                onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                placeholder="e.g. dr.sarah@tealcareclinic.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Digital Signature Placeholder Text
              </label>
              <input
                type="text"
                value={doctorForm.signatureText}
                onChange={(e) => setDoctorForm({ ...doctorForm, signatureText: e.target.value })}
                placeholder="e.g. Dr. Sarah Ahmed, M.D."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition shadow-sm shadow-teal-600/20 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Doctor Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
