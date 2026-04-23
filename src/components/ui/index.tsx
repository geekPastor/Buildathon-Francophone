/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  icon?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  icon: Icon, 
  loading = false, 
  disabled = false, 
  className = "",
  type = 'button'
}: ButtonProps) => {
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 rounded-lg shadow-sm font-semibold",
    secondary: "bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg font-semibold",
    danger: "bg-red-500 text-white hover:bg-red-600 rounded-lg shadow-sm font-semibold",
    outline: "border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg font-semibold"
  };

  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled || loading}
      className={`flex items-center justify-center gap-2 px-6 py-2.5 text-sm transition-all duration-200 disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {loading ? (
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
      ) : Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  className?: string;
}

export const Card = ({ children, title, subtitle, icon: Icon, className = "" }: CardProps) => (
  <div className={`bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col ${className}`}>
    <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{subtitle}</h3>
        <h2 className="text-lg font-bold tracking-tight text-slate-900">{title}</h2>
      </div>
      {Icon && <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Icon size={20} /></div>}
    </div>
    <div className="flex-1">
      {children}
    </div>
  </div>
);

interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}

export const Input = ({ label, value, onChange, placeholder, type = 'text', className = "" }: InputProps) => (
  <div className={`space-y-1.5 ${className}`}>
    <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">
      {label}
    </label>
    <input 
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
    />
  </div>
);
