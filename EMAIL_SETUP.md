# Email Setup Guide for Tool Suggestions

The "Suggest a Tool" feature sends email notifications when users submit tool suggestions.

## Current Setup

The API is configured to send emails to: **ma3ahmed@gmail.com**

You can change this by setting the `ADMIN_EMAIL` environment variable.

## Email Service: Resend (Recommended)

### Why Resend?
- Free tier: 3,000 emails/month
- Simple API
- No credit card required for free tier
- Great for transactional emails

### Setup Steps:

1. **Create a Resend Account**
   - Go to [resend.com](https://resend.com)
   - Sign up for a free account

2. **Get Your API Key**
   - Go to API Keys section
   - Create a new API key
   - Copy the key (starts with `re_`)

3. **Add to Environment Variables**
   
   Create or update `.env.local` file in your project root:
   ```bash
   RESEND_API_KEY=re_your_api_key_here
   ADMIN_EMAIL=ma3ahmed@gmail.com
   ```

4. **Verify Domain (Optional but Recommended)**
   - For production, verify your domain in Resend
   - This allows you to send from your own domain (e.g., noreply@toolteeno.com)
   - Without verification, emails send from `onboarding@resend.dev`

### Testing

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Click "Suggest a Tool" button
3. Fill out the form
4. Submit
5. Check your email at ma3ahmed@gmail.com

## Alternative: Console Logging

If you don't set up Resend, the API will still work and log suggestions to the console. You'll see them in your terminal when running `npm run dev` or in your production logs.

## Production Deployment

When deploying to production (Vercel, etc.), add the environment variables:

### Vercel:
1. Go to your project settings
2. Navigate to Environment Variables
3. Add:
   - `RESEND_API_KEY` = your_api_key
   - `ADMIN_EMAIL` = ma3ahmed@gmail.com

### Other Platforms:
Add the same environment variables in your platform's dashboard.

## Features

✅ Email notifications with full suggestion details  
✅ Fallback to console logging if email fails  
✅ User attribution with social links  
✅ HTML formatted emails  
✅ Mobile-responsive form  
✅ Form validation  
✅ Success/error feedback  
✅ Auto-close on success  

## Email Content

The email includes:
- Tool name and description
- Use case and key features
- Suggester's name and email
- Social media links (GitHub, Twitter, LinkedIn, Website)
- Submission timestamp

## Cost

- **Development**: Free (console logging)
- **Production with Resend Free Tier**: Free up to 3,000 emails/month
- **Beyond Free Tier**: $20/month for 50,000 emails

For most use cases, the free tier is more than enough!
