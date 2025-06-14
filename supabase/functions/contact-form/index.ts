
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactFormRequest {
  name: string;
  email: string;
  company?: string;
  message: string;
}

// Google Sheets API helper functions
const getGoogleAccessToken = async () => {
  const serviceAccountKey = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_KEY");
  if (!serviceAccountKey) {
    throw new Error("Google Service Account key not found");
  }

  const credentials = JSON.parse(serviceAccountKey);
  
  // Create JWT for Google API
  const header = {
    alg: "RS256",
    typ: "JWT"
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: credentials.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now
  };

  // Import the key for signing
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    new TextEncoder().encode(credentials.private_key.replace(/\\n/g, '\n')),
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  // Create JWT
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    privateKey,
    new TextEncoder().encode(unsignedToken)
  );
  
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  const jwt = `${unsignedToken}.${encodedSignature}`;

  // Exchange JWT for access token
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
};

const addToGoogleSheet = async (formData: ContactFormRequest) => {
  try {
    console.log("Adding contact to Google Sheet...");
    const accessToken = await getGoogleAccessToken();
    const spreadsheetId = "16brbAVXZVvOap4KGH7_l67_QlHX_TCKrD_GzlGvR5LU";
    
    // Prepare the row data: name, email, company, message, submitted_at
    const rowData = [
      formData.name,
      formData.email,
      formData.company || "",
      formData.message,
      new Date().toISOString()
    ];

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/ContactForm:append?valueInputOption=RAW`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values: [rowData]
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google Sheets API error:", errorText);
      throw new Error(`Google Sheets API error: ${response.status}`);
    }

    const result = await response.json();
    console.log("Successfully added to Google Sheet:", result);
    return true;
  } catch (error) {
    console.error("Error adding to Google Sheet:", error);
    return false;
  }
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Contact form function called");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  try {
    const { name, email, company, message }: ContactFormRequest = await req.json();
    console.log("Received form data:", { name, email, company: company || 'N/A' });

    // Validate required fields
    if (!name || !email || !message) {
      console.log("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log("Storing submission in database...");
    // Store contact submission in database
    const { data: submission, error: dbError } = await supabase
      .from('contact_submissions')
      .insert({
        name,
        email,
        company: company || null,
        message,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: "Failed to save submission" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Database submission successful:", submission.id);

    // Add to Google Sheet (don't let this fail the main process)
    const googleSheetSuccess = await addToGoogleSheet({ name, email, company, message });
    console.log("Google Sheet integration:", googleSheetSuccess ? "success" : "failed");

    // Initialize Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not found");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const resend = new Resend(resendApiKey);
    console.log("Resend initialized successfully");

    // Send confirmation email to user
    console.log("Sending confirmation email to user...");
    const userEmailResponse = await resend.emails.send({
      from: "Nodematics <noreply@nodematics.com>",
      to: [email],
      subject: "Thank you for contacting Nodematics",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; margin-bottom: 20px;">Thank you for reaching out!</h1>
          <p>Dear ${name},</p>
          <p>We have received your message and will get back to you within 2-4 hours during business hours.</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Your Message:</h3>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <p>Best regards,<br>The Nodematics Team</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">
            Nodematics - Transforming content strategy with AI<br>
            Email: hello@nodematics.com
          </p>
        </div>
      `,
    });

    console.log("User confirmation email response:", userEmailResponse);

    // Send notification email to company team
    console.log("Sending notification emails to team...");
    const notificationEmailResponse = await resend.emails.send({
      from: "Nodematics Contact Form <noreply@nodematics.com>",
      to: ["hello@nodematics.com", "engageperfect@gmail.com", "pkadima1@gmail.com"],
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; margin-bottom: 20px;">New Contact Form Submission</h1>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
            <p><strong>Submission ID:</strong> ${submission.id}</p>
            <p><strong>Submitted at:</strong> ${new Date(submission.created_at).toLocaleString()}</p>
            <p><strong>Google Sheet:</strong> ${googleSheetSuccess ? 'Added successfully' : 'Failed to add'}</p>
          </div>
          <div style="background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h3 style="margin-top: 0;">Message:</h3>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <p style="margin-top: 20px;">
            <a href="mailto:${email}" style="background-color: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reply to ${name}</a>
          </p>
        </div>
      `,
    });

    console.log("Team notification email response:", notificationEmailResponse);

    // Check for email sending errors
    if (userEmailResponse.error) {
      console.error("User email error:", userEmailResponse.error);
    }
    
    if (notificationEmailResponse.error) {
      console.error("Notification email error:", notificationEmailResponse.error);
    }

    console.log("All operations completed successfully");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Contact form submitted successfully",
        submissionId: submission.id,
        googleSheet: googleSheetSuccess,
        emails: {
          userEmail: userEmailResponse.error ? "failed" : "sent",
          notificationEmail: notificationEmailResponse.error ? "failed" : "sent"
        }
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in contact-form function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
