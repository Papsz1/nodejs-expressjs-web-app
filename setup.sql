-- Create a 'webprog'@'localhost' user with 'letsgo' password in the database then run this query
-- mysql Ver 8.0.29

DROP DATABASE IF EXISTS webprog;

CREATE DATABASE IF NOT EXISTS webprog;

USE webprog;
GRANT ALL PRIVILEGES ON *.* TO 'webprog'@'localhost';
