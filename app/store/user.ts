"use client";
import { create } from "zustand";

export type UserProfile = {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | { id: string; name: string; description?: string } | null;
};

type State = {
  user: UserProfile | null;
};

type Actions = {
  setUser: (user: UserProfile | null) => void;
  clearUser: () => void;
};

export const useUserStore = create<State & Actions>((set) => ({
  user: null,
  setUser: (user: UserProfile | null) => set({ user }),
  clearUser: () => set({ user: null }),
}));
