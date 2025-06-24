# Clerk Redirect Configuration for loansphere.world

## Required Clerk Dashboard Settings

### User Redirects
Configure these URLs in your Clerk Dashboard → User & Authentication → Settings:

**After sign-up fallback:**
```
https://loansphere.world/role-selector
```

**After sign-in fallback:**
```
https://loansphere.world/role-selector
```

**After logo click:**
```
https://loansphere.world
```

### Organization Redirects

**After create organization:**
```
https://loansphere.world/lender-dashboard
```

**After leave organization:**
```
https://loansphere.world/sign-in
```

## Role-Based Dashboard Routes
After role selection, users will be redirected to:

- **Lender**: `https://loansphere.world/lender-dashboard`
- **Borrower**: `https://loansphere.world/borrower-dashboard`
- **Investor**: `https://loansphere.world/investor-dashboard`
- **Distributor**: `https://loansphere.world/distributor-dashboard`
- **Super Admin**: `https://loansphere.world/admin/dashboard`

## Development vs Production
- Development: Use `localhost:5000` URLs for testing
- Production: Use `loansphere.world` URLs as shown above

## Quick Setup Instructions
1. Go to Clerk Dashboard
2. Navigate to User & Authentication → Settings
3. Update the redirect URLs as specified above
4. Save changes
5. Test authentication flow

This configuration ensures all users are properly redirected to the role selector after authentication, then to their appropriate dashboards based on their selected role.