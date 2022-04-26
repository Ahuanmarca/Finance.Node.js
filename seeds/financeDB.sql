-- For reference, the DB was created manually via the MySQL Shell

CREATE TABLE users(
	id INT NOT NULL AUTO_INCREMENT,
	username VARCHAR(12) NOT NULL, 
	hash VARCHAR(255) NOT NULL, 
	cash DECIMAL (19, 4) NOT NULL DEFAULT 10000.00, 
	PRIMARY KEY (id)
);
CREATE UNIQUE INDEX username ON users(username);
CREATE TABLE stocks (
	id INT NOT NULL AUTO_INCREMENT,
	symbol VARCHAR(12) NOT NULL,
	name VARCHAR(255) NOT NULL,
	PRIMARY KEY(id)
);
CREATE TABLE portfolios (
	id INT NOT NULL AUTO_INCREMENT,
	user_id INT NOT NULL,
	stock_id INT NOT NULL,
	shares INT NOT NULL,
	FOREIGN KEY (user_id) REFERENCES users(id),
	FOREIGN KEY (stock_id) REFERENCES stocks(id),
	PRIMARY KEY(id)
);
CREATE TABLE transacciones (
	id INT NOT NULL AUTO_INCREMENT,
	user_id INT NOT NULL,
	stock_id INT NOT NULL,
	shares INT NOT NULL,
	price FLOAT NOT NULL,
	p_datetime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
	PRIMARY KEY(id),
	FOREIGN KEY(user_id) REFERENCES users(id),
	FOREIGN KEY(stock_id) REFERENCES stocks(id)
);
