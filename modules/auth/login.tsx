"use client";

import { LoginForm, LoginHero } from "./components";

export default function AuthPage() {
  return (
    <div className="flex min-h-screen bg-white">
      <LoginForm />
      <LoginHero />
    </div>
  );
}
