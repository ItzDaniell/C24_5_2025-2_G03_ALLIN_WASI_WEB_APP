"use client";

import { RegisterForm, RegisterHero } from "./components";

export default function RegisterPage() {
  return (
    <div className="flex h-screen">
      <RegisterForm />
      <RegisterHero />
    </div>
  );
}

