"use client";

import React, { useState } from "react";
import { X, Mail, Lock, User, GraduationCap, ArrowRight } from "lucide-react";
import { UserProfile } from "@/lib/types/pwa";
import { DEFAULT_USER, GUEST_USER, pwaStorage } from "@/lib/pwaStore";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserChange: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onUserChange }) => {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleDemoLogin = (userToSet: UserProfile) => {
    setIsLoading(true);
    setTimeout(() => {
      pwaStorage.setUser(userToSet);
      onUserChange(userToSet);
      setIsLoading(false);
      onClose();
    }, 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      const newUser: UserProfile = {
        id: `user_${Date.now()}`,
        name: name.trim() || (email ? email.split("@")[0] : "Docente"),
        email: email || "profe@colegio.edu",
        role: "Docente de Educación",
        school: school || "Centro Educativo",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        isLoggedIn: true,
        isPro: true,
        joinedDate: "Hoy",
        stats: {
          savedCount: 4,
          publishedCount: 1,
          downloadsReceived: 0,
        },
      };
      pwaStorage.setUser(newUser);
      onUserChange(newUser);
      setIsLoading(false);
      onClose();
    }, 450);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 text-slate-900 shadow-2xl relative space-y-5 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Brand Header */}
        <div className="text-center pt-1">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm mx-auto shadow-md font-mono mb-3">
            GA
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 font-heading tracking-tight">
            {tab === "login" ? "Acceso Docente GenAct" : "Crear Cuenta de Profesor"}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Guarda tus fichas en la nube y compártelas con la comunidad educativa.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setTab("login")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              tab === "login"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => setTab("register")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              tab === "register"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Registrarse Gratis
          </button>
        </div>

        {/* Quick Google Workspace One-Click */}
        <button
          type="button"
          onClick={() => handleDemoLogin(DEFAULT_USER)}
          disabled={isLoading}
          className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-2xs cursor-pointer active:scale-98"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Acceder con Google Workspace Edu</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="h-px bg-slate-200 flex-1" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            o con correo
          </span>
          <div className="h-px bg-slate-200 flex-1" />
        </div>

        {/* Email Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {tab === "register" && (
            <>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Prof. Carlos Méndez"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Colegio o Instituto
                </label>
                <div className="relative">
                  <GraduationCap size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="Ej: CEIP Miguel de Cervantes"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Correo Institucional o Personal
            </label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="profesor@colegio.edu"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-98 disabled:opacity-50 mt-1"
          >
            {isLoading ? (
              <span>Cargando...</span>
            ) : (
              <>
                <span>{tab === "login" ? "Ingresar al Estudio" : "Crear mi Cuenta Docente"}</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Switcher */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <button
            type="button"
            onClick={() => handleDemoLogin(DEFAULT_USER)}
            className="text-blue-600 hover:underline font-semibold cursor-pointer"
          >
            Probar Demo: Profe Valentina
          </button>
          <button
            type="button"
            onClick={() => handleDemoLogin(GUEST_USER)}
            className="text-slate-500 hover:underline cursor-pointer"
          >
            Continuar como Invitado
          </button>
        </div>
      </div>
    </div>
  );
};
