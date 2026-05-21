CREATE USER product_service WITH ENCRYPTED PASSWORD 'product_service_password';
CREATE DATABASE product_service OWNER product_service;
GRANT ALL PRIVILEGES ON DATABASE product_service TO product_service;
