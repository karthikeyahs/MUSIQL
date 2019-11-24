var express = require('express');
var session = require('express-session');
var multer  =   require('multer');
var app = express();
var mysql = require('mysql');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var jsdom = require("jsdom");
var JSDOM = jsdom.JSDOM;
var nodemailer = require('nodemailer');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const path = require('path');
var router = express.Router();
var async = require('async');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '1999Violin-',
	database : 'musiql'
});

app.get('/', function(request, response) {
	response.sendFile('F:\\dbms and se\\app\\registration and login\\main\\main.html');
});

app.listen(3000, function () {
    console.log('Listening on port 3000');
});