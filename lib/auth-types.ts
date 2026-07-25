export const USER_ROLES = ["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF", "VIEWER"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
  lastLoginAt: string | null;
};

export type SessionUserRow = {
  session_id: string;
  session_expires_at: Date;
  session_last_seen_at: Date;
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "ACTIVE" | "SUSPENDED";
  created_at: Date;
  last_login_at: Date | null;
};
