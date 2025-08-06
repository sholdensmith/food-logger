# Food Logger Setup Guide

## Overview
This improved food logger now supports cross-device data persistence with real-time synchronization. Data is stored in a Supabase database and automatically syncs across all your devices.

## Key Improvements

### ✅ Cross-Device Sync
- Data is stored in a cloud database (Supabase)
- Real-time synchronization every 30 seconds
- Works across phone, tablet, and computer browsers

### ✅ Daily Reset
- Automatically detects new days
- Resets data at midnight across all devices
- Maintains historical data

### ✅ Better UX
- Loading states and error handling
- Real-time feedback
- Improved visual design
- Keyboard shortcuts (Enter to add)

### ✅ Data Persistence
- No more lost data from browser clearing
- Automatic backups in the cloud
- User identification across devices

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In your Supabase dashboard, go to SQL Editor
3. Run the SQL commands from `database-schema.sql`
4. Go to Settings > API to get your project URL and anon key

### 3. Configure Environment Variables

Create a `.env.local` file in your project root:

```env
# OpenAI API Key for nutrition data
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Get API Keys

**OpenAI API Key:**
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an account and get an API key
3. Add it to your `.env.local` file

**Supabase Keys:**
1. In your Supabase project dashboard
2. Go to Settings > API
3. Copy the Project URL and anon key
4. Add them to your `.env.local` file

### 5. Run the Application

```bash
npm run dev
```

## How It Works

### User Identification
- Each device gets a unique user ID stored in localStorage
- This ID is used to sync data across devices
- No login required - works anonymously

### Data Flow
1. User enters food item
2. OpenAI API provides nutrition data
3. Data is saved to Supabase database
4. All devices automatically sync every 30 seconds
5. Data resets daily at midnight

### Real-Time Features
- Auto-refresh every 30 seconds
- New day detection every minute
- Immediate UI updates
- Error handling and retry logic

## Database Schema

The `food_entries` table stores:
- `id`: Unique entry identifier
- `user_id`: User identifier for cross-device sync
- `description`: Food description
- `date`: Entry date (YYYY-MM-DD)
- `calories`, `protein`, `carbs`, `fats`: Nutrition data
- `created_at`, `updated_at`: Timestamps

## Security Considerations

- Data is stored anonymously (no personal info)
- Row Level Security (RLS) is enabled
- API keys should be kept secure
- Consider adding authentication for production use

## Troubleshooting

### Common Issues

1. **"Failed to load entries"**
   - Check your Supabase configuration
   - Verify environment variables are set correctly

2. **"Failed to add food entry"**
   - Check your OpenAI API key
   - Verify you have API credits

3. **Data not syncing**
   - Check internet connection
   - Verify Supabase project is active
   - Check browser console for errors

### Debug Mode

Add this to your `.env.local` for detailed logging:
```env
NEXT_PUBLIC_DEBUG=true
```

## Production Deployment

For production deployment:

1. Set up environment variables on your hosting platform
2. Consider adding user authentication
3. Set up proper CORS policies
4. Monitor API usage and costs
5. Set up database backups

## Cost Considerations

- **OpenAI API**: ~$0.002 per food entry
- **Supabase**: Free tier includes 500MB database and 50,000 monthly active users
- **Hosting**: Vercel/Netlify free tiers are sufficient

## Future Enhancements

Potential improvements:
- User authentication and accounts
- Food history and favorites
- Nutritional goals and tracking
- Export data functionality
- Mobile app version
- Barcode scanning
- Meal planning features 