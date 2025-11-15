import { z } from 'zod';

// List of disposable/temporary email domains to block
const DISPOSABLE_DOMAINS = [
  'tempmail.com', 'guerrillamail.com', '10minutemail.com', 'throwaway.email',
  'mailinator.com', 'trashmail.com', 'fakeinbox.com', 'yopmail.com',
  'getnada.com', 'temp-mail.org', 'maildrop.cc', 'sharklasers.com',
  'spam4.me', 'mintemail.com', 'emailondeck.com', 'dispostable.com'
];

// Enhanced email validation schema
export const emailValidationSchema = z.string()
  .email({ message: "Please enter a valid email address" })
  .trim()
  .toLowerCase()
  .refine((email) => {
    // Check email length
    if (email.length > 254) return false;
    
    const [localPart, domain] = email.split('@');
    
    // Validate local part
    if (!localPart || localPart.length > 64) return false;
    if (localPart.startsWith('.') || localPart.endsWith('.')) return false;
    if (localPart.includes('..')) return false;
    
    // Validate domain
    if (!domain || domain.length > 253) return false;
    if (domain.startsWith('.') || domain.endsWith('.')) return false;
    if (domain.includes('..')) return false;
    
    // Must have valid TLD
    const parts = domain.split('.');
    if (parts.length < 2) return false;
    const tld = parts[parts.length - 1];
    if (tld.length < 2 || tld.length > 63) return false;
    
    // Check for disposable email domains
    if (DISPOSABLE_DOMAINS.some(d => domain.endsWith(d))) return false;
    
    // Check for common typos in popular domains
    const commonTypos = ['gmial.com', 'gmai.com', 'yahooo.com', 'hotmial.com'];
    if (commonTypos.some(d => domain === d)) return false;
    
    return true;
  }, { message: "Please use a valid, non-disposable email address" })
  .refine((email) => {
    // Additional check: no suspicious patterns
    const localPart = email.split('@')[0];
    
    // Block emails with excessive numbers or random characters
    const numbersCount = (localPart.match(/\d/g) || []).length;
    if (numbersCount > localPart.length * 0.7) return false;
    
    // Block common test patterns
    const testPatterns = /^(test|demo|fake|spam|noreply|example)[\d]*@/i;
    if (testPatterns.test(email)) return false;
    
    return true;
  }, { message: "This email address appears to be invalid or for testing only" });

export function validateEmail(email: string): { valid: boolean; error?: string } {
  try {
    emailValidationSchema.parse(email);
    return { valid: true };
  } catch (error: any) {
    const errorMessage = error.errors?.[0]?.message || "Invalid email address";
    return { valid: false, error: errorMessage };
  }
}
