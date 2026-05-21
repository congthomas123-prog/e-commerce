CREATE USER auth_service WITH ENCRYPTED PASSWORD 'auth_service_password';
CREATE DATABASE auth_service OWNER auth_service;
GRANT ALL PRIVILEGES ON DATABASE auth_service TO auth_service;
