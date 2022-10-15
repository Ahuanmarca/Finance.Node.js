-- JUST FOR REFERENCE!!
-- The DB was created manually with MySQL Shell
-- The actual DB may not be exactly the same

CREATE TABLE users(
	user_id SERIAL PRIMARY KEY,
	username VARCHAR(12) NOT NULL,
	hash VARCHAR(255) NOT NULL,
	cash DECIMAL (19, 4) NOT NULL DEFAULT 10000.00,
	first_name VARCHAR(255) NOT NULL,
	last_name VARCHAR(255) NOT NULL,
	email VARCHAR(365) NOT NULL
);
CREATE UNIQUE INDEX username ON users(username);
CREATE TABLE stocks (
	stock_id SERIAL PRIMARY KEY,
	symbol VARCHAR(12) NOT NULL,
	name VARCHAR(255) NOT NULL
);
CREATE TABLE portfolios (
	portfolio_id SERIAL PRIMARY KEY,
	user_id INT REFERENCES users(user_id),
	stock_id INT REFERENCES stocks(stock_id),
	shares INT NOT NULL
);
CREATE TABLE transacciones (
	transacciones_id SERIAL PRIMARY KEY,
	user_id INT REFERENCES users(user_id),
	stock_id INT REFERENCES stocks(stock_id),
	shares INT NOT NULL,
	price FLOAT NOT NULL,
	p_datetime TIMESTAMPTZ NOT NULL
);
