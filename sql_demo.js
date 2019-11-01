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

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.get('/', function(request, response) {
	response.render(path.join('F:\\dbms and se\\app\\registration and login\\main\\main.ejs'));
});
var user_username,user_inst_id,user_fullname;
app.post('/auth', function(request, response) {
	user_username = request.body.usrname;
	var password = request.body.psw;
	if (user_username && password) {
		connection.query('SELECT * FROM users WHERE username = ? AND password = ?', [user_username, password], function(error, results, fields) {
			if (results.length > 0) {
				// console.log(results);
				request.session.loggedin = true;
				request.session.username = user_username;
				user_inst_id = results[0].institution_id;
				user_fullname = results[0].full_name;
				response.redirect('/user_home');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

//Logged in and playing song
var ins_id,s_id;
app.get('/user_home', function(request, response) {
	var boo = [];
	connection.query('SELECT institution_id FROM users WHERE username = ?', [user_username], function(error,results,fields){
		if(error) throw error;
		ins_id = results[0].institution_id;
		connection.query('SELECT * FROM audio WHERE inst_id = ?', [ins_id], function(error,rows,fields){
			if(error) throw error;
			//Enabling button
			async.forEachOf(rows,function(row,i,inner_callback){
				var a_id = row.audio_id;
				if(row.premium==1){
					connection.query('SELECT * from requests WHERE songid = ? AND username = ? AND inst_id = ?',[a_id,user_username,ins_id],function(err,ress){
						if(err) throw err;
						else{
							if(ress.length!=0){
								if(ress[0].granted == 1)
									boo.push(1);
								else 
									boo.push(2);
							}
							else
								boo.push(0);
						}
					});
				}
				inner_callback(null); 
			},function(err){
				if(err){
					throw err;
				}else{
					var delayInMilliseconds = 3000; //3 seconds
					setTimeout(function() {
						//your code to be executed after 3 second
						console.log(rows);
						response.render('F:\\dbms and se\\app\\registration and login\\user_home\\user_home.ejs',{rows:rows,boo:boo,username:user_username});
					}, delayInMilliseconds);
				}
			});
			app.post('/play_song',function(req,res){
				s_id = req.body.song_no;
				console.log(s_id);
				connection.query('SELECT * FROM audio WHERE audio_id = ?', [s_id],function(error,song,fields){
					if(error) throw error;
					console.log(song);
					res.render('F:\\dbms and se\\app\\registration and login\\song_play.ejs',{song:song});
				});
			});
		});
	});
});

app.use(express.static('F:\\dbms and se\\app\\registration and login'));
app.get('/user_reg',function(req,res){
	res.render('F:\\dbms and se\\app\\registration and login\\user_reg\\user_reg.ejs')
});

app.post('/submit',urlencodedParser, function(req, res, next) {
    connection.connect(function(err) {
    if (err) throw  err;
    console.log("connected");
    connection.query("use musiql", function(err, result)  {
        if(err) throw err;
    });
    connection.query("insert into users values('" 
                                        + req.body.uname + "','"
                                        + req.body.pwd + "','"
                                        + req.body.full_name + "','"
                                        + req.body.email + "','"
                                        + req.body.mobile + "','"
                                        + req.body.dob + "','"
                                        + req.body.age + "','"
                                        + req.body.gender + "','"
                                        + req.body.year + "','"
                                        + req.body.address + "','"
                                        + req.body.city + "','"
                                        + req.body.pincode + "','"
                                        + req.body.inst_id + "','"
                                        + req.body.inst_name + "')", function(err, result)  {
        if(err) throw err;
        console.log("Data inserted to table");
    });
});
    res.render('F:\\dbms and se\\app\\registration and login\\dabba.ejs');
});

//Institution registration and login
app.get('/insti_reg',function(req,res){
	res.render('F:\\dbms and se\\app\\registration and login\\inst_reg\\inst_reg.ejs')
});
var inst_username,in_id;
app.post('/inst_auth', function(request, response) {
	inst_username = request.body.inst_usrname;
	var inst_password = request.body.inst_psw;
	if (inst_username && inst_password) {
		connection.query('SELECT * FROM institutions WHERE inst_username = ? AND inst_password = ?', [inst_username, inst_password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.inst_username = inst_username;
				in_id = results[0].inst_id;
				response.redirect('/inst_home');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});
var boole=1;
app.get('/inst_home', function(request, response) {
	var rows,s_id1,user;
	connection.query('SELECT * FROM institutions INNER JOIN requests ON institutions.inst_id = ? AND requests.inst_id = ? INNER JOIN users ON requests.username = users.username',[in_id,in_id], function(reqq,ress){
		rows = ress;
		console.log(ress);
		if(ress.length==0)
			boole = 0;
		response.render('F:\\dbms and se\\app\\registration and login\\inst_home\\inst_home.ejs',{rows:rows,boole:boole});
	});
});

//Premium grant
app.post('/inst_home/premium_grant',function(req,res){
	s_id1 = req.body.song_no2;
	user = req.body.user;
	console.log(s_id1);
	connection.query('UPDATE requests SET granted=1 WHERE username = ? AND songid = ?',[user,s_id1],function(err,reqq,ress){
		if(err) throw err;
		res.render('F:\\dbms and se\\app\\registration and login\\dabba.ejs');
	});
});

app.post('/inst_reg_submit',urlencodedParser, function(req, res, next) {
    connection.connect(function(err) {
    if (err) throw  err;
    console.log("connected");
    connection.query("use musiql", function(err, result)  {
        if(err) throw err;
    });
    connection.query("insert into institutions values('" 
                                        + req.body.insti_id + "','"
                                        + req.body.inst_name + "','"
                                        + req.body.inst_uname + "','"
                                        + req.body.inst_pwd + "','"
										+ req.body.inst_email + "','"
										+ req.body.inst_head + "','"
                                        + req.body.inst_address + "','"
                                        + req.body.inst_pincode + "','"
                                        + req.body.inst_phone + "')", function(err, result)  {
        if(err) throw err;
        console.log("Data inserted to table");
    });
});
    res.render('F:\\dbms and se\\app\\registration and login\\dabba.ejs');
});

//Audio Upload
app.post('/api/audio',function(req,res){
	var storage = multer.diskStorage({
		destination: (req, file, cb) => {
			cb(null, './')
		},
		filename: (req, file, cb) => {
			cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
		}
	});
	var upload = multer({ storage : storage}).single('audio');
	var audio_path;
	upload(req,res,function(err) {
		if(err) {
			return res.end("Error uploading file.");
		}
		res.end("File is uploaded");
		audio_path = req.file.path;
		console.log(audio_path);
		connection.query("insert into audio (inst_id,song_name,song_raga,song_tala,song_composer,song_path,premium) values('"
							+ in_id + "','"
							+ req.body.song_name + "','"
							+ req.body.song_raga + "','"
							+ req.body.song_tala + "','"
							+ req.body.song_composer + "','"
							+ audio_path + "','"
							+ req.body.premium + "')", function(err, result)  {
			if(err) throw err;
			console.log("Data inserted to table");
		});
	});
});

//Audio premium request
var ps_id,s_name;
app.post('/premium_request',function(req,res){
	ps_id = req.body.song_no1;
	console.log(ps_id);
	connection.query('SELECT * FROM audio WHERE audio_id = ?', [ps_id],function(error,song,fields){
		if(error) throw error;
		s_name = song[0].song_name;
		connection.query("insert into requests (username,inst_id,songname,songid,granted) values('"
							+ user_username + "','"
							+ user_inst_id + "','"
							+ s_name + "','"
							+ ps_id + "','"
							+ 0 + "')", function(err, result){
			if(err) throw err;
			console.log("Data inserted to requests table");
		});
		console.log(s_name);
		var transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
			  user: 'karthikeyahs@gmail.com',
			  pass: '1999violin-'
			},
			tls: {
			  rejectUnauthorized: false
			}
		  });
		  
		  var mailOptions = {
			from: 'karthikeyahs@gmail.com',
			to: 'karthikeyahs@gmail.com',
			subject: 'Sending Email using Node.js',
			html: {path: 'F:\\dbms and se\\app\\registration and login\\logged_in.ejs'}
		  };
		//   '<h1>MUSIQL</h1><br><h4>Karthikeya has requested for the song <b>{{s_name}}</b></h4>'
		  transporter.sendMail(mailOptions, function(error, info){
			if (error) {
			  console.log(error);
			} else {
			  res.render('F:\\dbms and se\\app\\registration and login\\dabba.ejs');
			  console.log('Email sent: ' + info.response);
			}
		  });
	});
});

console.log('Adithya');
app.use('/html', router);

app.listen(3000, function () {
    console.log('Listening on port 3000');
});
