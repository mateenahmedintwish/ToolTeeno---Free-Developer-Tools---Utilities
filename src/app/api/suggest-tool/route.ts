// app/api/suggest-tool/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      toolName,
      toolDescription,
      useCase,
      features,
      userName,
      userEmail,
      githubUrl,
      twitterUrl,
      linkedinUrl,
      websiteUrl,
    } = body;

    // Validate required fields
    if (!toolName || !toolDescription || !userName || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Email configuration - using Resend API (you'll need to set this up)
    // For now, we'll use a simple email service or just log the data
    const emailContent = `
New Tool Suggestion Received!

TOOL INFORMATION:
================
Tool Name: ${toolName}
Description: ${toolDescription}
Use Case: ${useCase || 'Not provided'}
Key Features:
${features || 'Not provided'}

SUGGESTED BY:
============
Name: ${userName}
Email: ${userEmail}
GitHub: ${githubUrl || 'Not provided'}
Twitter: ${twitterUrl || 'Not provided'}
LinkedIn: ${linkedinUrl || 'Not provided'}
Website: ${websiteUrl || 'Not provided'}

Submitted at: ${new Date().toLocaleString()}
    `.trim();

    // Try to send email using Resend if API key is configured
    const resendApiKey = process.env.RESEND_API_KEY;
    const recipientEmail = process.env.ADMIN_EMAIL || 'ma3ahmed@gmail.com';

    if (resendApiKey) {
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'ToolTeeno Suggestions <noreply@toolteeno.com>',
            to: [recipientEmail],
            subject: `🔧 New Tool Suggestion: ${toolName}`,
            text: emailContent,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #4F46E5;">🔧 New Tool Suggestion</h1>
                
                <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h2 style="color: #1F2937; margin-top: 0;">Tool Information</h2>
                  <p><strong>Tool Name:</strong> ${toolName}</p>
                  <p><strong>Description:</strong><br/>${toolDescription}</p>
                  ${useCase ? `<p><strong>Use Case:</strong><br/>${useCase}</p>` : ''}
                  ${features ? `<p><strong>Key Features:</strong><br/><pre style="white-space: pre-wrap;">${features}</pre></p>` : ''}
                </div>
                
                <div style="background: #EEF2FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h2 style="color: #1F2937; margin-top: 0;">Suggested By</h2>
                  <p><strong>Name:</strong> ${userName}</p>
                  <p><strong>Email:</strong> <a href="mailto:${userEmail}">${userEmail}</a></p>
                  ${githubUrl ? `<p><strong>GitHub:</strong> <a href="${githubUrl}">${githubUrl}</a></p>` : ''}
                  ${twitterUrl ? `<p><strong>Twitter:</strong> <a href="${twitterUrl}">${twitterUrl}</a></p>` : ''}
                  ${linkedinUrl ? `<p><strong>LinkedIn:</strong> <a href="${linkedinUrl}">${linkedinUrl}</a></p>` : ''}
                  ${websiteUrl ? `<p><strong>Website:</strong> <a href="${websiteUrl}">${websiteUrl}</a></p>` : ''}
                </div>
                
                <p style="color: #6B7280; font-size: 14px;">Submitted at: ${new Date().toLocaleString()}</p>
              </div>
            `,
          }),
        });

        if (!emailResponse.ok) {
          console.error('Failed to send email via Resend:', await emailResponse.text());
        }
      } catch (emailError) {
        console.error('Error sending email via Resend:', emailError);
      }
    }

    // Always log to console as backup
    console.log('=== NEW TOOL SUGGESTION ===');
    console.log(emailContent);
    console.log('===========================');

    // Store in a database (optional - add your database logic here)
    // await db.toolSuggestions.create({ data: body });

    return NextResponse.json({
      success: true,
      message: 'Tool suggestion received successfully',
    });

  } catch (error) {
    console.error('Error processing tool suggestion:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
