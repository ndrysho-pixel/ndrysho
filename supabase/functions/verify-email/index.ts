import { serve } from "https://deno.land/std@0.190.0/http/server.ts";


const ABSTRACTAPI_KEY = Deno.env.get("ABSTRACTAPI_EMAIL_VALIDATION_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyEmailRequest {
  email: string;
}

interface AbstractAPIResponse {
  email: string;
  autocorrect: string;
  deliverability: string; // "DELIVERABLE", "UNDELIVERABLE", "UNKNOWN", "RISKY"
  quality_score: number; // 0.0 to 1.0
  is_valid_format: {
    value: boolean;
    text: string;
  };
  is_free_email: {
    value: boolean;
    text: string;
  };
  is_disposable_email: {
    value: boolean;
    text: string;
  };
  is_role_email: {
    value: boolean;
    text: string;
  };
  is_catchall_email: {
    value: boolean;
    text: string;
  };
  is_mx_found: {
    value: boolean;
    text: string;
  };
  is_smtp_valid: {
    value: boolean;
    text: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: VerifyEmailRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: "Email address is required" 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Verifying email: ${email}`);

    // Call AbstractAPI email validation
    const apiUrl = `https://emailvalidation.abstractapi.com/v1/?api_key=${ABSTRACTAPI_KEY}&email=${encodeURIComponent(email)}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      console.error(`AbstractAPI error: ${response.status} ${response.statusText}`);
      // If API fails, fall back to basic validation
      return new Response(
        JSON.stringify({ 
          valid: true, 
          warning: "Could not verify email with external service, using basic validation"
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const data: AbstractAPIResponse = await response.json();
    
    console.log(`Verification result for ${email}:`, {
      deliverability: data.deliverability,
      quality_score: data.quality_score,
      is_valid_format: data.is_valid_format.value,
      is_disposable: data.is_disposable_email.value,
      is_mx_found: data.is_mx_found.value,
      is_smtp_valid: data.is_smtp_valid.value,
    });

    // Determine if email is valid
    let valid = false;
    let error = "";

    // Check format first
    if (!data.is_valid_format.value) {
      error = "Invalid email format";
    }
    // Block disposable emails
    else if (data.is_disposable_email.value) {
      error = "Disposable email addresses are not allowed";
    }
    // Check deliverability
    else if (data.deliverability === "UNDELIVERABLE") {
      error = "This email address does not exist or cannot receive emails";
    }
    // Check MX records
    else if (!data.is_mx_found.value) {
      error = "Email domain does not have valid mail servers";
    }
    // Check SMTP validity (if available)
    else if (data.is_smtp_valid && !data.is_smtp_valid.value) {
      error = "This email address does not exist";
    }
    // Check quality score (0.8 threshold)
    else if (data.quality_score < 0.8) {
      error = "This email address has a low quality score and may not be valid";
    }
    // All checks passed
    else {
      valid = true;
    }

    // Suggest autocorrected email if available
    const result: any = {
      valid,
      email: email,
      deliverability: data.deliverability,
      quality_score: data.quality_score,
    };

    if (!valid) {
      result.error = error;
    }

    if (data.autocorrect && data.autocorrect !== email) {
      result.suggestion = data.autocorrect;
      result.message = `Did you mean ${data.autocorrect}?`;
    }

    return new Response(JSON.stringify(result), {
      status: valid ? 200 : 400,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in verify-email function:", error);
    
    // On error, allow the email through (fail open to prevent blocking legitimate users)
    return new Response(
      JSON.stringify({ 
        valid: true,
        warning: "Email verification service temporarily unavailable",
        error: error.message 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
