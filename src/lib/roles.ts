export const USER_ROLES = ["user", "student", "teacher", "administrator", "blocked"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const ROLE_LABELS: Record<UserRole, { ru: string; ro: string }> = {
  user: { ru: "Пользователь", ro: "Utilizator" },
  student: { ru: "Ученик", ro: "Elev" },
  teacher: { ru: "Учитель", ro: "Profesor" },
  administrator: { ru: "Администратор", ro: "Administrator" },
  blocked: { ru: "Заблокирован", ro: "Blocat" },
};

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && USER_ROLES.includes(value as UserRole);
}

export function canUseAi(role: UserRole | null | undefined) {
  return role === "student" || role === "teacher" || role === "administrator";
}

export function isAdministrator(role: UserRole | null | undefined) {
  return role === "administrator";
}

export function isBlocked(role: UserRole | null | undefined) {
  return role === "blocked";
}
