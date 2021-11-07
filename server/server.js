const express = require('express');
const app = express();
app.use(express.json());
let jwt = require("jsonwebtoken");
var server = require('http').createServer(app);
const mysql = require('mysql');
const cors = require('cors');
app.use(cors())

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    port: 3306,
    password: 'dongseopfuck1',
    database: "color"
})

db.connect();

app.post('/signup', function(req, res){
    db.query(`SELECT * from user where name=${req.body.name}`, function(err, rows){
        if(rows){
            res.json("중복");
        }
        else{
            db.query(`INSERT INTO user (name, password) VALUES (?, ?);`, [req.body.name, req.body.password], function(error, results, fields){
                if(error){
                    res.json(error);
                }
                else{
                    res.json("성공");
                }
            });
        }
    });
})

app.post('/login', function(req, res){
    console.log(req.body);
    db.query(`SELECT * FROM user WHERE name=? and password=?`, [req.body.name, req.body.password], function(err, rows){
        if(err){
            res.status(406);
        }
        else{
            const name = rows[0].name;
            const password = rows[0].password;
            const token = jwt.sign({name: name, password: password}, "apple")
            res.json(token);
        }
    })
})

function checklogin(){
    return new Promise((resolve, reject) => {
        var user = jwt.verify(token, 'apple');
        resolve(user);
    })
}

app.get('/pallete', function(req, res){
    db.query(`SELECT * from pallet`, function(err, rows){
        res.json(rows);
    })
})

app.post('/pallete', async(req, res) => {
    let check = await checklogin(req.headers.authorization);
    if(check){
        db.query(`INSERT INTO pallet (name, color, master) VALUES (${req.body.name}, ${req.body.color}, ${req.body.master})`)
    }
})

app.delete('/pallete', async(req, res) => {
    let check = await checklogin(req.headers.authorization);
    if(check){
        if(check.master === req.body.master){
            db.query(`DELETE FROM pallet where name=${req.body.name} and master=${req.body.master}`, function(err, rows){
                if(err){
                    res.json("권한이 없습니다.")
                }
                else{
                    res.json("삭제")
                }
            })
        }
    }
})

server.listen(1312, function () {
    console.log('Example app listening on port', 1234);
});