/**
 * Extremely light validation for email to ensure it contains at least one '@' symbol.
 * We will never risk being more demanding on FE than BE.
 */
export function isValidEmail(email: string): boolean {
  return email.trim().includes("@");
}

/**
 * Extremely light validation for password to ensure it is not empty.
 * We will never risk being more demanding on FE than BE.
 */
export function isValidPassword(password: string): boolean {
  return password.length > 0;
}
