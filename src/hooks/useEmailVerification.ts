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

export const useEmailVerification = () => {
  const verifyEmail = async (email: string): Promise<EmailVerificationResult> => {
    try {
      const { data, error } = await supabase.functions.invoke<EmailVerificationResult>(
        'verify-email',
        {
          body: { email: email.trim().toLowerCase() }
        }
      );

      if (error) {
        console.error('Email verification error:', error);
        // Fail open - allow the email if verification service fails
        return {
          valid: true,
          email,
          warning: 'Email verification service temporarily unavailable'
        };
      }

      return data as EmailVerificationResult;
    } catch (error) {
      console.error('Email verification exception:', error);
      // Fail open - allow the email if verification service fails
      return {
        valid: true,
        email,
        warning: 'Email verification service temporarily unavailable'
      };
    }
  };

  return { verifyEmail };
};
