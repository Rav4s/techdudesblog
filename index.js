const express = require('express')
const app = express()
const router = express.Router();
const path = require('path');
const moment = require('moment-timezone');
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
app.set('view engine', 'ejs');
const fs = require('fs')
const http = require('http')
const https = require('https')
// const privateKey = fs.readFileSync('/etc/letsencrypt/live/techdudesblog.serveblog.net/privkey.pem', 'utf8');
// const certificate = fs.readFileSync('/etc/letsencrypt/live/techdudesblog.serveblog.net/fullchain.pem', 'utf8');
// const ca = fs.readFileSync('/etc/letsencrypt/live/techdudesblog.serveblog.net/chain.pem', 'utf8');

// const credentials = {
// 	key: privateKey,
// 	cert: certificate,
// 	ca: ca
// };
app.use(session({
    secret: 'faeb4453e5d14fe6f6d04637f78077c76c73d1b4',
    proxy: true,
    resave: true,
    saveUninitialized: true,
  })
);
var bodyParser = require('body-parser')

	const mysql = require('mysql');
		const connection = mysql.createConnection({
			host: 'localhost',
			user: 'root',
			password: 'latehome4',
			database:'blog',
			charset : 'utf8mb4',
		});
		app.use(express.urlencoded({extended: true}));
		app.use(express.json()) // To parse the incoming requests with JSON payloads
		app.use(cookieParser());
		app.use(require('prerender-node').set('prerenderToken', 'Lar7mgj02Zb2yBS6JFn7'));

		app.get('/', function(req, res){
			
			let obj = {}
			let html = []
			connection.query('SELECT * FROM articles order by id desc', function(err, result) {

				if(err){
					throw err;
				} else {
					var marked = require ('marked');
				result.forEach(async item => {
					html.push(marked(item.text))

				});

					// html = {item: html}
					// console.log(html)
					// obj = {print: result};
					res.render('index', {item: html, print: result});
				}
			});

		})
		app.get('/storage', function(req, res){
			let obj = {}
			let html = []
			connection.query('SELECT * FROM articles', function(err, result) {

				if(err){
					throw err;
				} else {
					var marked = require ('marked');
				result.forEach(async item => {
					html.push(marked(item.text))

				});

					// html = {item: html}
					// console.log(html)
					// obj = {print: result};
					res.render('storage', {item: html, print: result});
				}
			})
		})
app.get('/.well-known/acme-challenge/SEiPWJnSMpWe5BssIJWOSEMhMu4MIwC3SUV8rznJnbI', (req,res)=> 
    res.sendFile(path.join(__dirname + '/cert.html'))

    )
	app.get('/newarticle', (req,res)=> 
    res.sendFile(path.join(__dirname + '/newarticle.html'))

    )
	app.get('/newarticle.html', (req,res)=> 
    res.sendFile(path.join(__dirname + '/newarticle.html'))

    )
    app.post('/new', async function(request, response) {
	var name = await request.body.name;
	var article = await request.body.article;
	var author = await request.body.author;

	if (name && article) {
		await connection.query('insert into articles(name, text, author, date) values(?,?,?,?)', [name, article, author, moment().tz('America/Chicago').format('dddd, MMMM Do YYYY')], function (error, results, fields) {
		});
		
		response.redirect('/storage')
	} else {
		response.send('Please enter the information!');
		response.end();
	}
	
});
app.post('/editpost', async function(request, response) {
	var article = await request.body.article;
	var name = await decodeURIComponent(request.body.hidden);
	console.log(name)


	if (name && article) {
		await connection.query('update articles set text=? where name = ?', [article, name], function (error, results, fields) {
		});
		
		response.redirect('/storage')
	} else {
		response.send('Please enter the information!');
		response.end();
	}
	
});
app.get('/delete', async function(request, response) {
	let article = request.query.article;
	console.log(article)
	if (article) {
		 connection.query('delete from articles where name like ?', [article], function (error, results, fields) {
		});
		response.redirect('/storage')

	}
	
})
app.get('/edit', async function(request, response) {
	let article = request.query.article;
	console.log(article)
	if (article) {
		 connection.query('select * from articles where name = ?', [article], function (error, results, fields) {
			response.render('edit', {item: results});

		});

	}
	
})
app.get('/login', (req,res)=> 
    res.sendFile(path.join(__dirname + '/login.html'))

    )
    app.post('/auth', function(request, response) {
		var username = request.body.username;
		var password = request.body.password;
		if (username && password) {
			connection.query('SELECT * FROM credentials', [username, password], function(error, results, fields) {
				results.forEach(result => {

					if(result.username == username && result.password == password){
						request.session.loggedin = true;
						request.session.username = username;
						response.cookie('hi', 'session', { maxAge: 900000, httpOnly: false });
						response.redirect('/newarticle.html');
						return
					}
				});
				if(request.session.loggedin != true){
				response.send('Incorrect Username and/or Password!');
				response.end();
				}
			});
		} else {
			response.send('Please enter Username and Password!');
			response.end();
		}
	});
// app.listen(80, () => console.log('Server is live on port 80!'))
const httpServer = http.createServer(app);
// const httpsServer = https.createServer(credentials, app);

httpServer.listen(process.env.PORT, () => {
	console.log('HTTP Server running on port 80');
});

// httpsServer.listen(443, () => {
// 	console.log('HTTPS Server running on port 443');
// });
