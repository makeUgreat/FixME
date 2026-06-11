REVOKE CREATE ON SCHEMA "public" FROM PUBLIC;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_roles
    WHERE rolname = 'fixme_corrections_ro'
  ) THEN
    CREATE ROLE "fixme_corrections_ro" NOLOGIN;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_roles
    WHERE rolname = 'fixme_corrections_rw'
  ) THEN
    CREATE ROLE "fixme_corrections_rw" NOLOGIN;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_roles
    WHERE rolname = 'fixme_corrections_ddl'
  ) THEN
    CREATE ROLE "fixme_corrections_ddl" NOLOGIN;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_roles
    WHERE rolname = 'fixme_corrections_app'
  ) THEN
    CREATE ROLE "fixme_corrections_app" LOGIN;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_roles
    WHERE rolname = 'fixme_corrections_worker'
  ) THEN
    CREATE ROLE "fixme_corrections_worker" LOGIN;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_roles
    WHERE rolname = 'fixme_corrections_migrator'
  ) THEN
    CREATE ROLE "fixme_corrections_migrator" LOGIN;
  END IF;
END
$$;

GRANT "fixme_corrections_ro" TO "fixme_corrections_rw";
GRANT "fixme_corrections_rw" TO "fixme_corrections_app";
GRANT "fixme_corrections_ro" TO "fixme_corrections_worker";
GRANT "fixme_corrections_ddl" TO "fixme_corrections_migrator";

ALTER ROLE "fixme_corrections_app" SET search_path = "corrections", pg_catalog;
ALTER ROLE "fixme_corrections_worker" SET search_path = "corrections", pg_catalog;
ALTER ROLE "fixme_corrections_migrator" SET search_path = "corrections", pg_catalog;

DO $$
BEGIN
  EXECUTE format(
    'GRANT CREATE ON DATABASE %I TO %I',
    current_database(),
    'fixme_corrections_ddl'
  );
END
$$;
