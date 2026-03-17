import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      memberId?: string;
      role?: string;       // "admin" | "member"
      memberType?: string; // "candidate" | "employer" | "influencer"
      status?: string;     // "new" | "pending" | "approved" | "rejected"
      firstName?: string;
      lastName?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role?: string;
    memberType?: string;
    status?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    memberId?: string;
    role?: string;
    memberType?: string;
    status?: string;
    firstName?: string;
    lastName?: string;
  }
}
