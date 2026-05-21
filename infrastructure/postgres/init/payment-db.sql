CREATE USER payment_service WITH ENCRYPTED PASSWORD 'payment_service_password';
CREATE DATABASE payment_service OWNER payment_service;
GRANT ALL PRIVILEGES ON DATABASE payment_service TO payment_service;
