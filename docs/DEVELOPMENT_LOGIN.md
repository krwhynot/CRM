# Development Login Credentials

## Authentication Overview
The CRM system uses Supabase Authentication with email/password signup and login.

## Getting Login Credentials

### Option 1: Create New Account
1. Start development server: `npm run dev`
2. Visit: `http://localhost:5173/`
3. Click "Create Account"
4. Enter email and password meeting requirements:
   - At least 8 characters
   - Must contain: uppercase letter, lowercase letter, and number
   - Example: `TestPass123`
5. Check email for verification (if required)
6. Use these credentials to sign in

### Option 2: Use Existing Account
**Email**: `kjramsy@gmail.com` (existing user in database)
**Password**: Contact the account owner for password

### Option 3: Password Reset ✅ WORKING
1. Go to login form
2. Click "Forgot your password?"
3. Enter email address  
4. Check email for reset link
5. Click the link (now works with proper redirect URL configured)
6. Set new password on the reset form
7. Get redirected back to login with new credentials

## Development Server
- **URL**: http://localhost:5173/
- **Start Command**: `npm run dev`
- **Supabase Project**: CRM (ixitjldcdvbazvjsnkao)

## Authentication Flow
- **Signup**: Creates user account with email verification
- **Login**: Authenticates with email/password
- **Session**: Managed by Supabase Auth context
- **Logout**: Available through auth context

## Database Access
Users are stored in `auth.users` table in Supabase project.
Check existing users with:
```sql
SELECT email, created_at FROM auth.users ORDER BY created_at DESC;
```

## Notes
- Email verification may be required for new signups
- Password requirements enforced in frontend validation
- Auth state managed through React Context (`src/contexts/AuthContext.tsx`)