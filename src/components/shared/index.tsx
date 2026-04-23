/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  status?: 'normal' | 'danger' | 'warning' | 'success';
}

export const StatCard = ({ label, value, icon: Icon, status = 'normal' }: StatCardProps) => {
  const styles = {
    normal: "text-slate-400 bg-slate-50",
    danger: "text-red-600 bg-red-50",
    warning: "text-orange-500 bg-orange-50",
    success: "text-emerald-600 bg-emerald-50"
  };
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
      <div className="flex items-center justify-between relative z-10">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
        <div className={`p-2 rounded-lg ${styles[status]}`}>
          <Icon size={16} />
        </div>
      </div>
      <p className="text-3xl font-black tracking-tight text-slate-900 relative z-10">{value}</p>
      {status === 'danger' && <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />}
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  label: string;
}

export const NavButton = ({ active, onClick, icon: Icon, label }: NavButtonProps) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 w-full px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-all duration-200 rounded-lg ${
      active 
      ? "bg-slate-100 text-slate-900 border border-slate-200 shadow-sm" 
      : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
    }`}
  >
    <Icon size={16} />
    {label}
  </button>
);
