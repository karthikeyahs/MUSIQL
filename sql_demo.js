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
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';

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


var user_username,user_inst_id,user_fullname;
var boo2=true;
app.post('/auth', function(request, response) {
	user_username = request.body.usrname || null;
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
				boo2=false;
				response.render('F:\\dbms and se\\app\\registration and login\\main\\main.ejs',{boo2:boo2});
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/', function(request, response) {
	if(user_username)
		response.redirect('/user_home');
	else if(inst_username)
		response.redirect('/inst_home');
	else if(judge_username)
		response.redirect('/judge_home');
	else
		response.render('F:\\dbms and se\\app\\registration and login\\main\\main.ejs',{boo2:boo2});
});

app.get('/judge_reg',function(req,res){
	res.render('F:\\dbms and se\\app\\registration and login\\judge_reg\\judge_reg.ejs');
});

app.get('/inst_login',function(req,res){
	res.render('F:\\dbms and se\\app\\registration and login\\inst_login\\inst_login.ejs')
});

app.get('/judge_login',function(req,res){
	res.render('F:\\dbms and se\\app\\registration and login\\judge_login\\judge_login.ejs')
});

app.get('/user_logout',function(req,res){
	boo2=true;
	user_username = null;
	res.render('F:\\dbms and se\\app\\registration and login\\main\\main.ejs',{boo2:boo2});
});

app.get('/inst_logout',function(req,res){
	boo2=true;
	inst_username = null;
	res.render('F:\\dbms and se\\app\\registration and login\\main\\main.ejs',{boo2:boo2});
});

app.get('/judge_logout',function(req,res){
	boo2=true;
	judge_username = null;
	res.render('F:\\dbms and se\\app\\registration and login\\main\\main.ejs',{boo2:boo2});
});

var judge_username,judge_fullname;
app.post('/judge_auth', function(request, response) {
	judge_username = request.body.judge_usrname;
	var password = request.body.judge_psw;
	if (judge_username && password) {
		connection.query('SELECT * FROM judge WHERE username = ? AND password = ?', [judge_username, password], function(error, results, fields) {
			if (results.length > 0) {
				// console.log(results);
				request.session.loggedin = true;
				request.session.username = judge_username;
				judge_fullname = results[0].full_name;
				response.redirect('/judge_home');
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

app.post('/com_portal',function(req,res){
	var c_id = req.body.com_id;
	var com_data,j=0;
	var full_name=[];
	connection.query('select * from participate where com_id=?',[c_id],function(reqq,ress){
		com_data = ress;
		res.render('F:\\dbms and se\\app\\registration and login\\user_com_portal\\user_com_portal.ejs',{com_data:com_data,user_username:user_username});	
	});
});

var comp_jud;
var boo1=[];
app.get('/judge_home', function(request, response) {
	boo1=[];
	connection.query('SELECT * from competition WHERE com_judge=?',[judge_username],function(req,res){
		console.log(judge_username);
		comp_jud = res;
		async.forEachOf(comp_jud,function(com,i,inner_callback){
			var c_id = com.com_id;
			connection.query('select * from participate where com_id = ?',[c_id],function(reqq,ress){
				if(ress.length==0)
					boo1.push(0);
				else
					boo1.push(1);
			});
			inner_callback(null);
		},function(err){
			if(err) throw err;
			else{
				var delayInMilliseconds = 1000; //3 seconds
				setTimeout(function() {
				//your code to be executed after 3 second
				console.log(comp_jud);
				response.render('F:\\dbms and se\\app\\registration and login\\judge_home\\judge_home.ejs',{judge_fullname:judge_fullname,comp_jud:comp_jud,boo1:boo1});
				}, delayInMilliseconds);
			}
		});
	});	
});

app.post('/judge_comp',function(req,res){
	var jud_com_data,part_list,judg_com_id;
	connection.query('select * from compsongs where com_id=?',[req.body.jud_com_id],function(reqq,ress){
		judg_com_id = req.body.jud_com_id;
		console.log(judg_com_id);
		jud_com_data = ress;
		// console.log(ress);
		connection.query('select * from participate where com_id=?',[req.body.jud_com_id],function(reqe,resp){
			part_list = resp;
			var delayInMilliseconds = 2000; //1 seconds
			setTimeout(function() {
				//your code to be executed after 3 second
				console.log(part_list);
				res.render('F:\\dbms and se\\app\\registration and login\\jud_com_portal\\jud_com_portal.ejs',{jud_com_data:jud_com_data,part_list:part_list});
			}, delayInMilliseconds);
		});
	});
});

app.post('/judge_reg_submit',urlencodedParser, function(req, res, next) {
    connection.query("insert into judge values('" 
                                        + req.body.uname + "','"
                                        + req.body.pwd + "','"
                                        + req.body.full_name + "','"
                                        + req.body.email + "','"
                                        + req.body.mobile + "','"
                                        + req.body.address + "','"
                                        + req.body.city + "','"
                                        + req.body.pincode + "')", function(err, result)  {
        if(err) throw err;
        console.log("Data inserted to judge table");
    });
    res.redirect('/');
});

//Logged in and playing song
var ins_id,s_id;
app.get('/user_home', function(request, response) {
	var boo = [];
	var part = [];
	var compe;
	connection.query('SELECT * FROM competition',function(erro,comp,fields){
		compe = comp;
		console.log(comp);
		if(erro) throw erro;
		//Participate button
		async.forEachOf(comp,function(com,i,inner_callback){
			var c_id = com.com_id;
			connection.query('select * from participate where com_id = ? and u_name = ?',[c_id,user_username],function(reqq,ress){
				if(ress.length==0)
					part.push(1);
				else
					part.push(0);
			});
			inner_callback(null);
		},function(err){
			if(err) throw err;
		});
	});
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
						// console.log(rows);
						response.render('F:\\dbms and se\\app\\registration and login\\user_home\\user_home.ejs',{rows:rows,boo:boo,username:user_username,compe:compe,part:part});
					}, delayInMilliseconds);
				}
			});
			app.post('/play_song',function(req,res){
				s_id = req.body.song_no;
				console.log(s_id);
				connection.query('SELECT * FROM audio WHERE audio_id = ?', [s_id],function(error,song,fields){
					if(error) throw error;
					console.log(song);
					res.render('F:\\dbms and se\\app\\registration and login\\play_song\\song_play.ejs',{song:song});
				});
			});
		});
	});
});

app.post('/play_com_song',function(req,res){
	var com_path = req.body.com_path;
	var com_name = req.body.com_name;
	console.log(req.body.com_path);
	var delayInMilliseconds = 1000; //1 second
	setTimeout(function() {
		//your code to be executed after 1 second
		console.log(com_path);
		res.render('F:\\dbms and se\\app\\registration and login\\com_play_song\\com_play_song.ejs',{com_path:com_path,com_name:com_name});
	}, delayInMilliseconds);
});

app.post('/participate',function(req,res){
	connection.query("insert into participate values('" 
						+ user_username + "','"
						+ parseInt(req.body.com_id) + "','"
						+ user_fullname + "')", function(err,reqq,ress){
		if(err) throw err;
		console.log('Data inserted into participate table');
	});
	res.redirect('/user_home');
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
                                        + req.body.address + "','"
                                        + req.body.city + "','"
                                        + req.body.pincode + "','"
                                        + req.body.inst_id + "','"
                                        + req.body.inst_name + "')", function(err, result)  {
        if(err) throw err;
        console.log("Data inserted to table");
    });
});
    res.redirect('/');
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
var jud;
app.get('/inst_home', function(request, response) {
	var rows,s_id1,user;
	connection.query('SELECT * FROM institutions INNER JOIN requests ON institutions.inst_id = ? AND requests.inst_id = ? INNER JOIN users ON requests.username = users.username',[in_id,in_id], function(reqq,ress){
		rows = ress;
		console.log(ress);
		connection.query('SELECT * FROM judge',function(reqe,resp){
			jud = resp;
		});
		if(ress.length==0)
			boole = 0;
		var delayInMilliseconds = 1000; //1 seconds
		setTimeout(function() {
			//your code to be executed after 3 second
			// console.log(rows);
			response.render('F:\\dbms and se\\app\\registration and login\\inst_home\\inst_home.ejs',{rows:rows,boole:boole,jud:jud});
		}, delayInMilliseconds);
	});
});

//Premium grant
app.post('/inst_home/premium_grant',function(req,res){
	s_id1 = req.body.song_no2;
	user = req.body.user;
	console.log(s_id1);
	connection.query('UPDATE requests SET granted=1 WHERE username = ? AND songid = ?',[user,s_id1],function(err,reqq,ress){
		if(err) throw err;
		res.redirect('/inst_home');
	});
});

app.post('/inst_reg_submit',urlencodedParser, function(req, res, next) {
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
	res.redirect('/');
	// alert("Registered successfully!!");
});

// //Competition Audio Upload
app.post('/upload_com_song',function(req,res){
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
		// res.end("File is uploaded");
		// console.log(req.file.path)
		audio_path = req.file.path;
		console.log(audio_path);
		connection.query("insert into compsongs values('"
							+ user_username + "','"
							+ user_fullname + "','"
							+ req.body.com_id + "','"
							+ audio_path + "')", function(err, result)  {
			if(err) throw err;
			console.log("Data inserted to compsongs table");
		});
		res.redirect('/user_home');
	});
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
		// res.end("File is uploaded");
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
			console.log("Data inserted to audio table");
		});
		res.redirect('/inst_home');
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
		res.redirect('/user_home');
		// console.log(s_name);
		// var transporter = nodemailer.createTransport({
		// 	service: 'gmail',
		// 	auth: {
		// 	  user: 'karthikeyahs@gmail.com',
		// 	  pass: '1999violin-'
		// 	},
		// 	tls: {
		// 	  rejectUnauthorized: false
		// 	}
		//   });
		  
		//   var mailOptions = {
		// 	from: 'karthikeyahs@gmail.com',
		// 	to: 'karthikeyahs@gmail.com',
		// 	subject: 'Sending Email using Node.js',
		// 	html: {path: 'F:\\dbms and se\\app\\registration and login\\logged_in.ejs'}
		//   };
		// //   '<h1>MUSIQL</h1><br><h4>Karthikeya has requested for the song <b>{{s_name}}</b></h4>'
		//   transporter.sendMail(mailOptions, function(error, info){
		// 	if (error) {
		// 	  console.log(error);
		// 	} else {
		// 	  res.redirect('/user_home');
		// 	  console.log('Email sent: ' + info.response);
		// 	}
		//   });
	});
});

app.post('/select_winner',function(req,res){
	connection.query('update competition set winner=? where com_id=?',[req.body.winner,req.body.com_id],function(reqq,ress){		
		res.redirect('/judge_home');
	});
});

//MongoDB
app.post('/create_competition',function(req,res){
	const dbName = 'competition';
	MongoClient.connect(url, function(err, client) {
		console.log("Connected successfully to server");
		const db = client.db(dbName);
		console.log(dbName);

		connection.query("INSERT INTO competition (com_title,com_details,com_judge,inst_id) VALUES('"
								+ req.body.com_title + "','"
								+ req.body.com_details + "','"
								+ req.body.com_judge + "','"
								+ in_id + "')", function(request,response){
					console.log('SQL Data inserted into competition table');
				});
		var com_title = req.body.com_title; 
		var com_details = req.body.com_details; 
		var com_date = req.body.com_date; 
		var com_judge1 = req.body.com_judge1; 
		var com_judge2 = req.body.com_judge2; 
		
		var data = { 
			"com_title": com_title, 
			"com_details": com_details, 
			"com_date": com_date, 
			"com_judge1":com_judge1,
			"com_judge2":com_judge2
		} 
		db.collection('competition').insertOne(data,function(err, collection){ 
				if (err) throw err; 
				console.log("Record inserted Successfully");      
		}); 
		res.redirect('/inst_home');
		client.close();
	});

});


app.use('/html', router);

app.listen(3000, function () {
    console.log('Listening on port 3000');
});
