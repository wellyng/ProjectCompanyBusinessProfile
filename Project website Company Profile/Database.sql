CREATE DATABASE BebekCarok;
GO

USE BebekCarok;
GO

CREATE TABLE Customer (
    customer_id INT PRIMARY KEY,
    customer_name VARCHAR(100),
    email VARCHAR(100),
    phone_number VARCHAR(20),
    password VARCHAR(100)
);

CREATE TABLE Menu (
    menu_id INT PRIMARY KEY,
    menu_name VARCHAR(100),
    price INT
);

CREATE TABLE Orders (
    order_id INT PRIMARY KEY,
    customer_id INT,
    order_date DATETIME,
    total_price INT,

    FOREIGN KEY (customer_id)
    REFERENCES Customer(customer_id)
);

CREATE TABLE OrderDetail (
    detail_id INT PRIMARY KEY,
    order_id INT,
    menu_id INT,
    quantity INT,
    subtotal INT,

    FOREIGN KEY (order_id)
    REFERENCES Orders(order_id),

    FOREIGN KEY (menu_id)
    REFERENCES Menu(menu_id)
);

CREATE TABLE Staff (
    staff_id INT PRIMARY KEY,
    staff_name VARCHAR(100),
    position VARCHAR(50),
    phone_number VARCHAR(20),
    username VARCHAR(50),
    password VARCHAR(50)
);