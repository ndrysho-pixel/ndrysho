import { supabase } from '@/integrations/supabase/client';

export interface EmailVerificationResult {
  valid: boolean;
  email: string;
  error?: string;
  suggestion?: string;
  message?: string;
  deliverability?: string;
  quality_score?: number;
  warning?: string;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useEmailVerification = () => {
  const verifyEmail = async (email: string): Promise<EmailVerificationResult> => {
    const maxRetries = 3;
    const baseDelay = 1000; // 1 second

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const { data, error } = await supabase.functions.invoke<EmailVerificationResult>(
          'verify-email',
          {
            body: { email: email.trim().toLowerCase() }
          }
        );

        if (error) {
          // If it's the last attempt, fail open
          if (attempt === maxRetries) {
            console.error('Email verification error after all retries:', error);
            return {
              valid: true,
              email,
              warning: 'Email verification service temporarily unavailable'
            };
          }
          
          // Otherwise, retry with exponential backoff
          const delay = baseDelay * Math.pow(2, attempt);
          console.warn(`Email verification attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
          await sleep(delay);
          continue;
        }

        return data as EmailVerificationResult;
      } catch (error) {
        // If it's the last attempt, fail open
        if (attempt === maxRetries) {
          console.error('Email verification exception after all retries:', error);
          return {
            valid: true,
            email,
            warning: 'Email verification service temporarily unavailable'
          };
        }
        
        // Otherwise, retry with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        console.warn(`Email verification attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }

    // Fallback (should never reach here)
    return {
      valid: true,
      email,
      warning: 'Email verification service temporarily unavailable'
    };
  };

  return { verifyEmail };
};
