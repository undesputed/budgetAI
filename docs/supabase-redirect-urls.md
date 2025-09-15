# Supabase Redirect URLs Configuration

## Required Redirect URLs

To enable email confirmation and OAuth authentication, you need to configure the following redirect URLs in your Supabase project:

### 1. Site URL
```
http://localhost:3000 (for development)
https://yourdomain.com (for production)
```

### 2. Redirect URLs
Add these URLs to your Supabase project settings:

#### Development URLs:
```
http://localhost:3000/auth/callback
http://localhost:3000/auth/confirm-email
```

#### Production URLs:
```
https://yourdomain.com/auth/callback
https://yourdomain.com/auth/confirm-email
```

### 3. OAuth Redirect URLs (if using Google/Facebook)
```
http://localhost:3000/auth/callback
https://yourdomain.com/auth/callback
```

## How to Configure in Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. Set the **Site URL** to your domain
5. Add all the redirect URLs listed above to the **Redirect URLs** section
6. Save the configuration

## Email Templates Configuration

Make sure your email templates are configured with the correct redirect URLs:

### Confirm Signup Template
- **Redirect URL**: `{{ .SiteURL }}/auth/callback?type=signup`

### Reset Password Template  
- **Redirect URL**: `{{ .SiteURL }}/auth/callback?type=recovery`

### Magic Link Template
- **Redirect URL**: `{{ .SiteURL }}/auth/callback?type=magiclink`

## Testing Email Confirmation

1. Sign up with a new email address
2. Check your email for the confirmation link
3. Click the confirmation link
4. You should be redirected to `/auth/callback`
5. The callback page will handle the confirmation and redirect you to the dashboard

## Troubleshooting

### Common Issues:

1. **"Invalid redirect URL" error**
   - Make sure the redirect URL is added to your Supabase project settings
   - Check that the URL matches exactly (including protocol and port)

2. **Email confirmation not working**
   - Verify the email template is using the correct redirect URL
   - Check that the callback page is accessible
   - Ensure the Site URL is set correctly in Supabase

3. **OAuth not working**
   - Make sure OAuth providers are enabled in Supabase
   - Verify redirect URLs are configured for each OAuth provider
   - Check that client IDs and secrets are set correctly

## Security Notes

- Never expose your Supabase service role key in client-side code
- Use environment variables for all sensitive configuration
- Regularly rotate your API keys
- Monitor authentication logs in Supabase dashboard
