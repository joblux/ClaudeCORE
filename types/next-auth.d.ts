import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      memberId?: string;
      role?: string;
      status?: string;
      firstName?: string;
      lastName?: string;
    } & DefaultSession["user"];
  }
  interface User extends DefaultUser {
    role?: string;
    status?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    memberId?: string;
    role?: string;
    status?: string;
    firstName?: string;
    lastName?: string;
  }
}
