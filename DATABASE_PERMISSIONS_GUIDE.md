# Fixing Database Permission Issues

This guide will help you resolve common database permission issues that may occur with the Extramus Analytics Dashboard.

## Common Database Issues

### 1. "Permission denied for table intern_details"

This error indicates your database user does not have sufficient privileges to access the intern_details table.

**Solution:**

1. Connect to your PostgreSQL database as a superuser:

```bash
psql -U postgres -d LatestDB
```

2. Grant necessary permissions to your user:

```sql
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO nayan;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO nayan;
```

3. If you want to grant permissions on future tables:

```sql
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO nayan;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT USAGE, SELECT ON SEQUENCES TO nayan;
```

### 2. "Relation 'occupants' does not exist"

This error occurs when the database query tries to access the 'occupants' table, but it doesn't exist in your database.

**Solution:**

Create the missing table with the proper schema:

```sql
CREATE TABLE IF NOT EXISTS occupants (
  id SERIAL PRIMARY KEY,
  room_id INTEGER,
  intern_id INTEGER,
  check_in_date DATE,
  check_out_date DATE,
  CONSTRAINT fk_room
    FOREIGN KEY(room_id)
    REFERENCES rooms(id),
  CONSTRAINT fk_intern
    FOREIGN KEY(intern_id)
    REFERENCES intern_details(intern_id),
  UNIQUE(room_id, intern_id)
);
```

## Using the Database Diagnostic Tool

We've added a special diagnostic tool to help identify issues with your database configuration.

1. Access the diagnostic tool at: [http://localhost:3000/api/db-diagnostics](http://localhost:3000/api/db-diagnostics)

2. Review the output which will show:
   - Current database connection status
   - List of existing tables
   - Permission issues detected
   - Missing tables
   - Suggested fixes

## Database Schema Requirements

The Extramus Analytics Dashboard expects the following tables:

1. **intern_details**
   - intern_id (primary key)
   - name
   - nationality
   - gender
   - birthdate
   - email
   - phone

2. **internship_info**
   - intern_id (foreign key)
   - department_id
   - start_date
   - end_date
   - supervisor
   - status

3. **departments**
   - id (primary key)
   - department_name

4. **apartments**
   - id (primary key)
   - apartment_name

5. **rooms**
   - id (primary key)
   - apartment_id (foreign key)
   - room_number
   - is_single
   - is_full

6. **occupants**
   - id (primary key)
   - room_id (foreign key)
   - intern_id (foreign key)
   - check_in_date
   - check_out_date

## Advanced Troubleshooting

If you still encounter issues after applying the fixes above:

1. **Check database logs**: PostgreSQL logs can provide more detailed information about permission issues.

2. **Verify database connection**: Make sure your database connection details in `.env.local` are correct:

```
DB_HOST=your_host
DB_PORT=5432
DB_NAME=LatestDB
DB_USER=nayan
DB_PASSWORD=your_password
DB_SSL_MODE=require
```

3. **Use the fallback APIs**: The dashboard automatically uses fallback APIs when it detects database issues. These APIs handle common errors gracefully and provide sample data when needed.

4. **Recreate the database schema**: If your database schema differs significantly from what the dashboard expects, consider creating a new schema that matches the expected structure.
