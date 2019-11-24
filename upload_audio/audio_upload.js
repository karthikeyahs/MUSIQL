var mysql = require('mysql');
var express =   require("express");
var multer  =   require('multer');
var app =   express();
var bodyParser = require('body-parser');
const path = require('path');
const debug = require('debug')('myapp:server');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '1999Violin-',
	database : 'musiql'
});


var storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, './')
  },
  filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
});
var upload = multer({ storage : storage}).single('audio');
app.get('/',function(req,res){
      res.sendFile(__dirname + "/upload.html");
});
var audio_path = "F:\\\\dbms and se\\\\app\\\\upload_audio\\\\";
app.post('/api/audio',function(req,res){
  upload(req,res,function(err) {
    if(err) {
        return res.end("Error uploading file.");
    }
    res.end("File is uploaded");
    audio_path =  audio_path + req.file.path;
    console.log(audio_path);

    connection.connect(function(err) {
      if (err) throw  err;
      console.log("connected");
      connection.query("use musiql", function(err, result)  {
          if(err) throw err;
      });
      connection.query("insert into audio (inst_id,song_name,song_raga,song_tala,song_composer,song_path) values('"
                          + req.body.inst_id + "','"
                          + req.body.song_name + "','"
                          + req.body.song_raga + "','"
                          + req.body.song_tala + "','"
                          + req.body.song_composer + "','"
                          + audio_path + "')", function(err, result)  {
          if(err) throw err;
          console.log("Data inserted to table");
      });
    });
  });
});
console.log(audio_path);
app.listen(3000,function(){
    console.log("Working on port 3000");
});

