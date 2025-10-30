import NextAuth from "next-auth";

import { nextAuthOptions } from "../../app/api/auth/[...nextauth]/nextAuthOptions";

export const { auth, handlers, signIn, signOut } = NextAuth(nextAuthOptions);
