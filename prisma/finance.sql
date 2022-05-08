-- JUST FOR REFERENCE!!
-- The DB was created manually with MySQL Shell
-- The actual DB may not be exactly the same

CREATE TABLE users(
	user_id INT NOT NULL AUTO_INCREMENT,
	username VARCHAR(12) NOT NULL, 
	hash VARCHAR(255) NOT NULL, 
	cash DECIMAL (19, 4) NOT NULL DEFAULT 10000.00,
	first_name VARCHAR(255) NOT NULL,
	last_name VARCHAR(255) NOT NULL,
	email VARCHAR(365) NOT NULL,
	PRIMARY KEY (user_id)
);
CREATE UNIQUE INDEX username ON users(username);
CREATE TABLE stocks (
	stock_id INT NOT NULL AUTO_INCREMENT,
	symbol VARCHAR(12) NOT NULL,
	name VARCHAR(255) NOT NULL,
	PRIMARY KEY(stock_id)
);
CREATE TABLE portfolios (
	portfolio_id INT NOT NULL AUTO_INCREMENT,
	user_id INT NOT NULL,
	stock_id INT NOT NULL,
	shares INT NOT NULL,
	FOREIGN KEY (user_id) REFERENCES users(id),
	FOREIGN KEY (stock_id) REFERENCES stocks(id),
	PRIMARY KEY(portfolio_id)
);
CREATE TABLE transacciones (
	transacciones_id INT NOT NULL AUTO_INCREMENT,
	user_id INT NOT NULL,
	stock_id INT NOT NULL,
	shares INT NOT NULL,
	price FLOAT NOT NULL,
	p_datetime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
	PRIMARY KEY(transacciones_id),
	FOREIGN KEY(user_id) REFERENCES users(id),
	FOREIGN KEY(stock_id) REFERENCES stocks(id)
);
