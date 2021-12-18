var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs')
const util = require('util');
const readdir = util.promisify(fs.readdir);
const { exec } = require('child_process');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
var spawn = require('child_process').spawn

const port = process.env.PORT || 3000

app.set('view engine', 'ejs');
app.use( bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use('/static', express.static('public'))
app.use('/test', express.static('test'))
app.use(cookieParser());
const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false
}));
var session;

app.get(['/admin'],function(req,res){
  try {
  //console.log(req.cookies)
  const data = req.cookies.auth.password
  console.log(data)
  if(data){
   res.render('admin/index',{password:data})
   console.log('ache')
  }else{
   res.render('admin/login',{password:''});
    console.log('login nai')
    }
  } catch (e) {
    res.render('admin/login',{password:''});
    console.log('login nai')
  }
  
  //console.log(req.cookies.auth.password)
  //console.log('Signed Cookies: ', req.signedCookies)
  //res.render('admin/login',{password:''});
})

app.post('/login',function(req,res){
  const password = req.body.password
  if(password == 'fahad'){
    session = req.session
    session.password = req.body.password
    res.cookie('auth',req.session)
    console.log(req.session)
    res.redirect('/')
    //res.end()
  }else{
    res.render('admin/login',{password:password})
  }
  //console.log(password)
})

app.get('/logout',function(req,res){
  res.cookie('auth','')
  res.redirect('/admin')
})


app.get('/',async function(req, res) {
  try {
  //console.log(req.cookies)
  const data = req.cookies.auth.password
  console.log(data)
  if(data){
   
   let names;
  try {
    names = await readdir('playground');
  } catch (err) {
    console.log(err);
  }
  if (names === undefined) {
    console.log('undefined');
  } else {
    res.render('dir',{dir:names});
    //console.log(names);
  }
  
    
    
  }else{
   res.render('admin/login',{password:''});
    console.log('login nai')
    }
  } catch (e) {
    res.render('admin/login',{password:''});
    console.log('login nai')
  }
  
  
  
});

app.get('/file/:filename',async function(req,res){
  
  try {
  console.log(res.statusCode)
  const log = req.cookies.auth.password
  console.log(log)
  if(log){
  const f = req.params.filename
  const fss = fs.promises
  const data = await fss.readFile(`./playground/${f}`);
  res.render('testeditor',{
    filename:f,
    data:data.toString(),
    password:log
  })
    
  }else{
   //res.render('admin/login',{password:''});
   console.log('login nai')
    }
  } catch (e) {
    res.render('admin/login',{password:''});
    console.log('login nai')
  }

  //console.log(data.toString());
  //console.log(req.params.filename)
})

app.post('/send',function(req,res,next){
  const code = req.body.code
  const filename = req.body.file_name
  io.on('connection',(socket)=>{
    console.log('connected')
  })
  
  try{
    
   fs.writeFile(`./playground/${filename}`,`${code}`, function (err) {
    if (err) throw err;
    console.log('Saved!'+filename);
   }) 
   var ls = spawn('node',[`playground/${filename}`]);
   try{
   
   ls.stdout.on('data', function (data) {
    io.sockets.emit("callback", data.toString())
    console.log('stdout: ' + data);
   });
   ls.stderr.on('data', function (data) {
    io.sockets.emit("callback", data.toString())
    console.log('stderr: ' + data);
   });
   ls.on('exit', function (code) {
   //io.sockets.emit("callback",code.toString())
   console.log('child process exited with code ' + code);
  });
   }catch(e){
     io.sockets.emit("callback",e.message)
   }   
   res.end('Saved!'+filename)
   
  }catch(e) {
    res.send(JSON.stringify(e.message))
  }
  
    //res.send('data')
 // next()
  
})

app.post('/delete',function(req,res){
  const filepath = req.body.filepath
  fs.unlinkSync(`./playground/${filepath}`)
  res.end(`deleted ${filepath} :)`)
  console.log(`deleted ${filepath} :)`)
})

app.post('/create',function(req,res){
  try {
  if(req.body.filename){  
  fs.open("./playground/"+req.body.filename,'w',function(err,file){
  if (err) throw err;
  console.log('Saved!');
  res.redirect('/')
  });
  
    
  }else{
    res.redirect('/')
  }
  
  } catch (e) {
    res.end('nai')
  }
})

app.get('/test',async function(req,res){
  names = await readdir('test');
  res.render('testdir',{dir:names})
})

app.post('/testdelete',function(req,res){
  const filepath = req.body.filepath
  console.log(filepath)
  fs.unlinkSync(`./test/${filepath}`)
  res.end(`deleted ${filepath} :)`)
  console.log(`deleted ${filepath} :)`)
})


http.listen(port,()=>{
  console.log(`listening on ${port}`)
})
