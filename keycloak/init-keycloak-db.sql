-- Run once on the LAN PostgreSQL server to create the Keycloak database.
-- psql -h 192.168.1.65 -p 34155 -U infotitans -f keycloak/init-keycloak-db.sql
CREATE DATABASE keycloak_db;
