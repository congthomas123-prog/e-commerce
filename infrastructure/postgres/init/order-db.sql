CREATE USER order_service WITH ENCRYPTED PASSWORD 'order_service_password';
CREATE DATABASE order_service OWNER order_service;
GRANT ALL PRIVILEGES ON DATABASE order_service TO order_service;
