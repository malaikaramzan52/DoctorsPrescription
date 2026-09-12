import React from "react";
import { CheckCircle2, AlertCircle, Info, XCircle } from "lucide-react";
import { useClinic } from "../../context/ClinicContext";

export const Toast = () => {
  const { toast } = useClinic();

  if (!toast.show) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />,
    error: <XCircle className="w-5 h-5 text-red-600 shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
  };

  const borders = {
    success: "border-teal-200 bg-teal-50 text-teal-900",
    error: "border-red-200 bg-red-50 text-red-900",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    info: "border-blue-200 bg-blue-50 text-blue-900",
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-bounce-short transition-all duration-300">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-md ${
          borders[toast.type] || borders.success
        }`}
      >
        {icons[toast.type] || icons.success}
        <span className="text-sm font-medium">{toast.message}</span>
      </div>
    </div>
  );
};
