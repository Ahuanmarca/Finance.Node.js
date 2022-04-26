var mysql = require('mysql');

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "f0ggyStuff.learn()",
    database: "finance"
});

let query = "SELECT name FROM stocks WHERE"

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    con.query(query, function (err, result, fields) {
        if (err) throw err;
        console.log(result);
    });
});