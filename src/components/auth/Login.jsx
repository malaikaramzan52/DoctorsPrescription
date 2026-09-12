import React, { useState } from "react";
import { Stethoscope, Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useClinic } from "../../context/ClinicContext";
import { defaultDoctor } from "../../data/mockData";

export const Login = () => {
  const { login } = useClinic();
  const [email, setEmail] = useState("dr.sarah@tealcareclinic.com");
  const [password, setPassword] = useState("doctor123");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }
    setError("");
    login(email, password);
  };

  const handleDemoLogin = () => {
    setEmail(defaultDoctor.email);
    setPassword("doctor123");
    login(defaultDoctor.email, "doctor123");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-teal-500 selection:text-white">
      {/* Background Graphic Accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-100/60 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-200/40 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/80 border border-slate-100 overflow-hidden relative z-10 animate-scale-up">
        {/* Top Header Card */}
        <div className="bg-gradient-to-br from-teal-700 to-teal-800 p-8 text-white text-center relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 opacity-10">
            <Stethoscope className="w-48 h-48 text-white" />
          </div>
          <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-inner">
            <Stethoscope className="w-8 h-8 text-white stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">DocCare Clinic Panel</h1>
          <p className="text-xs text-teal-100/90 font-medium mt-1">
            Single-Doctor Management & Prescription Portal
          </p>
        </div>

        {/* Login Form Body */}
        <div className="p-8">
          <div className="mb-6 text-center">
            <h2 className="text-lg font-bold text-slate-800">Doctor Access Sign In</h2>
            <p className="text-xs text-slate-500 mt-1">Enter your practitioner credentials to proceed</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Doctor Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="dr.jenkins@tealcareclinic.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl transition shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 mt-2"
            >
              <span>Sign In to Panel</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>



          <div className="mt-6 text-center">
            <p className="text-[11px] text-slate-400">
              DocCare Clinic System &copy; 2026. Secure Local Doctor Workspace.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
