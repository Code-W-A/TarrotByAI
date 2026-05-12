const ADMIN_EMAILS = new Set([
  "webdynamicx@gmail.com",
  "mobitoolsro@gmail.com",
]);

export const normalizeEmail = (email?: string | null): string => {
  if (!email || typeof email !== "string") {
    return "";
  }

  return email.trim().toLowerCase();
};

export const isAdminEmail = (email?: string | null): boolean => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return false;
  }

  return ADMIN_EMAILS.has(normalizedEmail);
};

export const getAuthEmailForAdminCheck = (
  currentUserEmail?: string | null,
  userDataEmail?: string | null
): string => {
  return normalizeEmail(currentUserEmail) || normalizeEmail(userDataEmail);
};
