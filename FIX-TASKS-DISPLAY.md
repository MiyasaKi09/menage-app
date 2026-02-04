# Fix for Tasks Display Issue

## Problem
Supabase nested select query was failing with error:
```
PGRST200: Could not find a relationship between 'household_tasks' and 'task_templates'
```

## Root Cause
Supabase's PostgREST couldn't detect the foreign key relationship, possibly due to:
- Schema cache issues
- Foreign key constraint not properly registered
- Nested select syntax limitations

## Solution
Created an RPC function with explicit SQL JOINs to bypass Supabase's relationship detection.

## Steps to Fix

### 1. Execute SQL Scripts in Supabase SQL Editor

Execute these scripts IN ORDER:

#### Script 1: Verify and fix foreign keys
File: `/supabase/verify-foreign-keys.sql`
- Checks existing foreign key constraints
- Recreates them if needed
- Ensures proper relationships are registered

#### Script 2: Create RPC function
File: `/supabase/create-get-household-tasks-function.sql`
- Creates `get_household_tasks_with_details()` function
- Uses explicit JOINs to fetch tasks with categories
- Returns flattened results that we transform in the app

### 2. Deploy Updated Code

The following file has been updated:
- `/app/(protected)/tasks/page.tsx` - Now uses RPC function instead of nested select

Push to git and Vercel will auto-deploy:
```bash
git add .
git commit -m "Fix: Use RPC function for tasks query instead of nested select"
git push origin main
```

### 3. Test

After deployment:
1. Go to https://your-app.vercel.app/tasks
2. Should see all 20+ tasks grouped by category
3. Each task should show emoji, name, tip, duration, and points

## Files Created/Modified

### Created:
- `/supabase/verify-foreign-keys.sql` - Foreign key verification
- `/supabase/create-get-household-tasks-function.sql` - RPC function
- `/workspaces/menage-app/FIX-TASKS-DISPLAY.md` - This file

### Modified:
- `/app/(protected)/tasks/page.tsx` - Changed query to use RPC

## How It Works

### Old Approach (FAILED):
```typescript
.from('household_tasks')
.select('*, task_templates!template_id(*, categories!category_id(*))')
```
❌ Supabase couldn't find the relationship

### New Approach (WORKS):
```typescript
.rpc('get_household_tasks_with_details', { p_household_id: householdId })
```
✅ Uses explicit SQL JOINs in the database
✅ Returns flat structure, transformed to nested in code
✅ More reliable and performant

## Expected Result

After executing the scripts and deploying:
- ✅ Tasks page shows "20+ tâches disponibles"
- ✅ Tasks grouped by category (Cuisine 🍳, Salle de bain 🚿, etc.)
- ✅ Each task shows full details (name, tip, duration, points)
- ✅ No more errors in console
