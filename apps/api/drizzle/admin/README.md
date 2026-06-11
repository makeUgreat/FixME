# Admin Database Bootstrap

Run these SQL files once with a database role that can manage roles before
running Drizzle migrations.

Application runtime credentials should use context-specific login roles, such as
`fixme_corrections_app` or `fixme_corrections_worker`, not admin credentials.
Migration credentials should use the context-specific migrator login role, such
as `fixme_corrections_migrator`.

Permission roles such as `fixme_corrections_ro`, `fixme_corrections_rw`, and
`fixme_corrections_ddl` are `NOLOGIN` group roles. Do not use them directly as
connection users.
