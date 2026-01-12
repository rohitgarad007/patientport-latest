# Security Configuration Guide

## Environment Variables Setup

This project uses environment variables to securely manage API keys and sensitive configuration data. **Never commit actual API keys to version control.**

### Development Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Fill in your actual API keys in the `.env` file:
   ```env
   VITE_API_KEY=your_actual_openai_api_key
   VITE_API_KEY_DEEPSEEK=your_actual_deepseek_api_key
   VITE_FIREBASE_API_KEY=your_actual_firebase_api_key
   VITE_AES_SECRET_KEY=your_actual_aes_secret_key
   ```

3. The `.env` file is automatically ignored by git and will not be committed.

### Production Deployment

**IMPORTANT**: For production deployments, set environment variables directly on your hosting platform:

#### Vercel
```bash
vercel env add VITE_API_KEY
vercel env add VITE_API_KEY_DEEPSEEK
vercel env add VITE_FIREBASE_API_KEY
vercel env add VITE_AES_SECRET_KEY
```

#### Netlify
Set environment variables in your Netlify dashboard:
1. Go to Site settings > Environment variables
2. Add each variable with its value

#### Other Hosting Platforms
Consult your hosting platform's documentation for setting environment variables.

### Security Features

1. **Environment Variable Validation**: The application validates that all required environment variables are present
2. **Production Mode Protection**: Additional security checks in production mode
3. **Secure Configuration Service**: Centralized configuration management with error handling
4. **Build-time Security**: API keys are not embedded in the built JavaScript files

### File Structure

- `.env` - Your local environment variables (never commit this)
- `.env.example` - Template file with placeholder values (safe to commit)
- `src/services/configService.ts` - Secure configuration service
- `src/components/Config.js` - Application configuration using the secure service

### Best Practices

1. **Never commit `.env` files** - They are in `.gitignore` for a reason
2. **Use different API keys for development and production**
3. **Regularly rotate your API keys**
4. **Monitor API key usage** for unusual activity
5. **Set up proper CORS policies** for your APIs
6. **Use HTTPS in production** always

### Troubleshooting

#### Missing Environment Variables
If you see errors about missing environment variables:
1. Check that your `.env` file exists and has the correct variable names
2. Ensure variable names start with `VITE_` (required by Vite)
3. Restart your development server after adding new variables

#### Production Issues
If the app doesn't work in production:
1. Verify all environment variables are set on your hosting platform
2. Check the hosting platform's build logs for errors
3. Ensure the variables are available during the build process

### Migration from Hardcoded Keys

If you're migrating from hardcoded API keys:
1. Move all sensitive keys to `.env`
2. Update imports to use the configuration service
3. Test thoroughly in development
4. Set up environment variables on your hosting platform
5. Deploy and verify functionality

## Security Checklist

- [ ] `.env` file created with actual API keys
- [ ] `.env` file is in `.gitignore`
- [ ] `.env.example` created with placeholder values
- [ ] Production environment variables configured on hosting platform
- [ ] Application tested with environment variables
- [ ] Old hardcoded keys removed from codebase
- [ ] API key rotation schedule established