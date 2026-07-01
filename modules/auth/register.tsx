"use client";

import { RegisterForm, RegisterHero } from "./components";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen bg-white">
      <RegisterForm />
      <RegisterHero />
    </div>
  );
}

