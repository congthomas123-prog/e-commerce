CREATE USER notification_service WITH ENCRYPTED PASSWORD 'notification_service_password';
CREATE DATABASE notification_service OWNER notification_service;
GRANT ALL PRIVILEGES ON DATABASE notification_service TO notification_service;
