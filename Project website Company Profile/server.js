const express = require('express');
const sql = require('mssql');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// DATABASE
const config = {
    user: 'sa',
    password: 'Password123!',
    server: '127.0.0.1',
    database: 'BebekCarokDb',
    port: 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

// CONNECT SQL
sql.connect(config)
.then(() => {
    console.log('Connected to SQL Server');
})
.catch(err => {
    console.log(err);
});

// HOME
app.get('/', (req, res) => {
    res.sendFile(
        path.join(__dirname, 'public', 'index2.html')
    );
});

// CUSTOMER LOGIN
app.post('/customer-login', async (req, res) => {

    const { email, password } = req.body;

    try {

        const result = await sql.query(`
            SELECT *
            FROM Customer
            WHERE email='${email}'
            AND password='${password}'
        `);

        if (result.recordset.length > 0) {
            res.send('success');
        } else {
            res.send('failed');
        }

    } catch (err) {

        console.log(err);
        res.send('failed');

    }
});

// MENU
app.get('/menu', async (req, res) => {

    try {

        const result = await sql.query(`
            SELECT * FROM MenuTable
        `);

        res.json(result.recordset);

    } catch (err) {

        console.log(err);
        res.send(err.message);

    }
});

// CART
app.get('/cart', async (req, res) => {

    try {

        const result = await sql.query(`
            SELECT * FROM Cart
        `);

        res.json(result.recordset);

    } catch (err) {

        console.log(err);
        res.send(err.message);

    }
});

// ADD CART
app.post('/add-cart', async (req, res) => {

    const { item_name, price, quantity } = req.body;

    try {

        await sql.query(`
            INSERT INTO Cart(item_name,price,quantity)
            VALUES('${item_name}',${price},${quantity})
        `);

        res.send('success');

    } catch (err) {

        console.log(err);
        res.send(err.message);

    }
});

// DELETE CART
app.delete('/delete-cart/:id', async (req, res) => {

    try {

        await sql.query(`
            DELETE FROM Cart
            WHERE id=${req.params.id}
        `);

        res.send('success');

    } catch (err) {

        console.log(err);
        res.send(err.message);

    }
});

app.post('/admin-login', async (req, res) => {

    console.log("BODY:", req.body);

    const { username, password } = req.body;

    console.log("USERNAME:", username);
    console.log("PASSWORD:", password);

    try {

        const result = await sql.query(`
            SELECT *
            FROM Staff
            WHERE username='${username}'
            AND password='${password}'
        `);

        console.log(result.recordset);

        if(result.recordset.length > 0){
            res.send('success');
        }else{
            res.send('failed');
        }

    } catch(err){
        console.log(err);
        res.send('failed');
    }

});

app.get('/dashboard-data', async (req, res) => {

    try {

        const customer = await sql.query(
            'SELECT COUNT(*) AS total FROM Customer'
        );

        const orders = await sql.query(
            'SELECT COUNT(*) AS total FROM Orders'
        );

        const menus = await sql.query(
            'SELECT COUNT(*) AS total FROM MenuTable'
        );

        res.json({

            customers: customer.recordset[0].total,
            orders: orders.recordset[0].total,
            menus: menus.recordset[0].total

        });

    } catch(err){

        console.log(err);
        res.send(err.message);

    }

});

app.get('/customers', async (req, res) => {

    try {

        const result = await sql.query(
            'SELECT * FROM Customer'
        );

        res.json(result.recordset);

    } catch(err){

        console.log(err);
        res.send(err.message);

    }

});

app.get('/orders', async (req, res) => {

    try {

        const result = await sql.query(
            'SELECT * FROM Orders'
        );

        res.json(result.recordset);

    } catch(err){

        console.log(err);
        res.send(err.message);

    }

});

app.post('/place-order', async (req, res) => {

    try {

        const cart = await sql.query(
            'SELECT * FROM Cart'
        );

        const items = cart.recordset;

        if(items.length === 0){

            return res.send('Cart kosong');

        }

        let total = 0;

        items.forEach(item => {

            total += item.price * item.quantity;

        });

        const nextOrder = await sql.query(`
    SELECT ISNULL(MAX(order_id),0)+1 AS nextId
    FROM Orders
`);

const nextId = nextOrder.recordset[0].nextId;

await sql.query(`
    INSERT INTO Orders
    (
        order_id,
        customer_id,
        staff_id,
        order_date,
        total_price
    )
    VALUES
    (
        ${nextId},
        1,
        1,
        GETDATE(),
        ${total}
    )
`);

        const orderResult = await sql.query(`
            SELECT TOP 1 order_id
            FROM Orders
            ORDER BY order_id DESC
        `);

        const orderId =
            orderResult.recordset[0].order_id;

        for(const item of items){

            await sql.query(`
                INSERT INTO Order_Detail
                (order_id, menu_id, quantity, subtotal)
                VALUES
                (
                    ${orderId},
                    1,
                    ${item.quantity},
                    ${item.price * item.quantity}
                )
            `);

        }

        await sql.query(
            'DELETE FROM Cart'
        );

        res.send('success');

    }
    catch(err){

        console.log(err);
        res.send(err.message);

    }

});

app.post('/payment', (req, res) => {

    res.send(`
        <script>
            alert('Payment Success');
            window.location.href = '/';
        </script>
    `);

});

// START SERVER
app.listen(5000, () => {
    console.log('Server started on port 5000');
});