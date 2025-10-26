"use client";

import { LoginForm, LoginHero } from "./components";

export default function AuthPage() {
  return (
    <div className="flex h-screen">
      <LoginForm />
      <LoginHero />
    </div>
  );
}
