# Email Templates for BudgetAI

This directory contains professional email templates for Supabase authentication flows, designed with the Corporate Blues theme.

## 📧 Available Templates

### 1. **Confirm Signup** (`confirm-signup.html` & `confirm-signup.txt`)
- **Purpose**: Email confirmation for new user registrations
- **Features**: 
  - Welcome message with feature highlights
  - Security notice about link expiration
  - Troubleshooting section
  - Mobile-responsive design

### 2. **Reset Password** (`reset-password.html`)
- **Purpose**: Password reset requests
- **Features**:
  - Clear security warnings
  - Password strength tips
  - Troubleshooting section
  - Mobile-responsive design

### 3. **Magic Link** (`magic-link.html` & `magic-link.txt`)
- **Purpose**: Passwordless authentication and email verification
- **Features**:
  - Explains what magic links are
  - Benefits of passwordless authentication
  - Alternative login options
  - Security notices and troubleshooting
  - Mobile-responsive design

## 🚀 How to Set Up in Supabase

### Step 1: Access Supabase Dashboard
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Email Templates**

### Step 2: Configure Confirm Signup Template
1. Click on **"Confirm signup"** template
2. Copy the content from `confirm-signup.html`
3. Paste it into the **HTML** field
4. Copy the content from `confirm-signup.txt`
5. Paste it into the **Plain text** field
6. Click **Save**

### Step 3: Configure Reset Password Template
1. Click on **"Reset password"** template
2. Copy the content from `reset-password.html`
3. Paste it into the **HTML** field
4. Click **Save**

### Step 4: Configure Magic Link Template
1. Click on **"Magic Link"** template
2. Copy the content from `magic-link.html`
3. Paste it into the **HTML** field
4. Copy the content from `magic-link.txt`
5. Paste it into the **Plain text** field
6. Click **Save**

### Step 5: Configure Email Settings
1. Go to **Authentication** → **Settings**
2. Set your **Site URL** to your production domain
3. Configure **Redirect URLs**:
   - Add `https://yourdomain.com/auth/callback` for email confirmation and OAuth
   - Add `https://yourdomain.com/auth/confirm-email` for email confirmation status
   - Add `https://yourdomain.com/dashboard` for post-login redirect

### Step 6: Configure Redirect URLs for Development
For local development, add these URLs to your Supabase project:
- `http://localhost:3000/auth/callback`
- `http://localhost:3000/auth/confirm-email`

## 📧 Email Confirmation Flow

### How Email Confirmation Works
When users sign up, they receive a confirmation email with a link:

1. **User signs up** → Receives confirmation email
2. **User clicks link** → Redirected to `/auth/callback`
3. **Callback processes** → Verifies email and creates session
4. **Success redirect** → User goes to dashboard
5. **Error handling** → Shows appropriate error messages

### Callback Page Features
- ✅ **Automatic processing** of email confirmation
- ✅ **Success/error handling** with user-friendly messages
- ✅ **Loading states** during verification
- ✅ **Automatic redirect** to dashboard on success
- ✅ **Resend functionality** for failed confirmations
- ✅ **Corporate Blues theme** consistent with your app

### Manual Confirmation Check
Users can also visit `/auth/confirm-email` to:
- Check their email confirmation status
- Resend confirmation emails if needed
- Get help with confirmation issues

## 🔗 Magic Link Authentication

### How Magic Links Work
Magic links provide a secure, passwordless way for users to sign in:

1. **User requests magic link**: User enters email on login page
2. **Email sent**: Supabase sends magic link email using your template
3. **User clicks link**: Link contains encrypted authentication token
4. **Automatic sign-in**: User is signed in and redirected to dashboard
5. **Link expires**: Link becomes invalid after 1 hour for security

### Benefits of Magic Links
- **Enhanced Security**: No passwords to compromise
- **Better UX**: One-click sign-in experience
- **Reduced Support**: No password reset requests
- **Mobile Friendly**: Works seamlessly on all devices
- **Automatic Expiration**: Links expire for security

### Implementation in Your App
To enable magic link authentication in your login page:

```typescript
// In your login component
const handleMagicLink = async () => {
  const { error } = await supabase.auth.signInWithOtp({
    email: formData.email,
    options: {
      emailRedirectTo: `${window.location.origin}/dashboard`,
    },
  });
  
  if (error) {
    setSupabaseError(error);
  } else {
    // Show success message
    setMessage("Check your email for the magic link!");
  }
};
```

## 🎨 Template Features

### Design Elements
- **Corporate Blues Theme**: Consistent with your app's color scheme
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Professional Layout**: Clean, modern design
- **Brand Consistency**: Matches your app's visual identity

### Security Features
- **Link Expiration Warnings**: Clear messaging about security
- **Troubleshooting Sections**: Help users if buttons don't work
- **Fallback Links**: Plain text URLs as backup
- **Security Notices**: Clear warnings about unauthorized access

### User Experience
- **Clear Call-to-Actions**: Prominent buttons for main actions
- **Feature Highlights**: Shows value proposition for new users
- **Helpful Tips**: Password strength guidance, etc.
- **Support Links**: Easy access to help and policies

## 🔧 Customization

### Template Variables
Supabase provides these variables you can use:
- `{{ .SiteURL }}` - Your site's base URL
- `{{ .ConfirmationURL }}` - The confirmation/reset link
- `{{ .Email }}` - User's email address
- `{{ .Token }}` - The confirmation token (if needed)

### Color Customization
To change colors, update these CSS variables in the HTML:
```css
/* Primary colors */
#003366  /* Dark blue */
#00509e  /* Medium blue */
#007acc  /* Light blue */
#cce0ff  /* Very light blue */

/* Background colors */
#f8fafc  /* Light gray background */
#ffffff  /* White */
```

### Content Customization
- Update the company name "BudgetAI" throughout
- Modify feature lists to match your app
- Adjust support links and contact information
- Update copyright year and company details

## 📱 Mobile Optimization

The templates are fully responsive and include:
- **Mobile-first CSS**: Optimized for small screens
- **Touch-friendly buttons**: Large, easy-to-tap CTAs
- **Readable fonts**: Appropriate sizes for mobile
- **Proper spacing**: Adequate padding and margins

## 🧪 Testing

### Test Your Templates
1. **Send Test Emails**: Use Supabase's test email feature
2. **Check Different Clients**: Test in Gmail, Outlook, Apple Mail
3. **Mobile Testing**: Verify on mobile devices
4. **Link Testing**: Ensure all links work correctly

### Common Issues
- **Images not loading**: Use absolute URLs for images
- **Styling issues**: Some email clients strip CSS
- **Link problems**: Ensure URLs are properly formatted
- **Spam filters**: Test deliverability

## 🔒 Security Best Practices

1. **Link Expiration**: Templates mention 24-hour expiration
2. **Clear Warnings**: Users know what to do if they didn't request the email
3. **No Sensitive Data**: Templates don't expose user information
4. **HTTPS Links**: All links use secure protocols

## 📊 Analytics (Optional)

Consider adding tracking to your email templates:
- **UTM Parameters**: Track email campaign performance
- **Pixel Tracking**: Monitor open rates (if compliant with privacy laws)
- **Click Tracking**: Measure button click rates

## 🆘 Support

If you need help with email templates:
1. Check Supabase documentation
2. Test with different email clients
3. Verify SMTP settings
4. Contact Supabase support if needed

---

**Note**: Remember to test your email templates thoroughly before going live. Email rendering can vary significantly between different email clients and devices.
