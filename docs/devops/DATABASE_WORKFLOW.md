# Database Migration Workflow

This project uses version-controlled SQL migrations stored in [`supabase/migrations/`](../../supabase/migrations/).

---

## How to Make Database Changes

Whenever you need to create a table, add/modify a column, or update Row Level Security (RLS) policies:

### 1. Create a Migration File
Add a new `.sql` file inside `supabase/migrations/` prefixed with a timestamp and a short descriptive name:

```text
supabase/migrations/YYYYMMDDHHMMSS_short_description.sql
```

Example:
```sql
-- Migration: Add status column to appointments
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'scheduled';
```

### 2. Test Your Migration
Verify your SQL changes against your development database to confirm syntax, foreign keys, and RLS policies behave as expected.

### 3. Commit and Open a Pull Request
Commit the migration file alongside your application code:

```bash
git add supabase/migrations/
git commit -m "feat(db): add status column to appointments"
git push origin feature-branch
```

Once reviewed and merged to `main`, migrations are tracked and applied automatically during deployment.
