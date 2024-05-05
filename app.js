// Setup server, session and middleware here.

/*
Here is where you'll set up your server as shown in lecture code and worked in previous labs.
Your server this week should not be doing any of the processing! Your server only exists to allow someone to get to the HTML Page and download the associated assets to run the text analyzer page.
*/
// This file should set up the express server as shown in the lecture code
//Here is where you'll set up your server as shown in lecture code
import express from 'express';
import configRoutes from './routes/index.js';
import exphbs from 'express-handlebars';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import * as middleware from './middleware.js';
import fs from 'fs';


const rewriteUnsupportedBrowserMethods = (req, res, next) => {
  // If the user posts to the server with a property called _method, rewrite the request's method
  // To be that method; so if they post _method=PUT you can now allow browsers to POST to a route that gets
  // rewritten in this middleware to a PUT route
  if (req.body && req.body._method) {
    req.method = req.body._method;
    delete req.body._method;
  }

  // let the next middleware run:
  next();
};


const app = express();

app.use(session({
  name: 'AuthenticationState',
  secret: 'some secret string!',
  resave: false,
  saveUninitialized: false,
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 30,} // 30 days
}));


// If the server_images folder doesn't exist, create it.
const server_img_dir = './server_images';
if (!fs.existsSync(server_img_dir)) {
  fs.mkdirSync(server_img_dir);
}

app.use('/public', express.static('public'));
app.use('/server_images', express.static('server_images'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(rewriteUnsupportedBrowserMethods);

// ---------------------------------------
// Middleware Declarations

app.use('/', middleware.root_middleware);
app.use('/', middleware.nav_middleware);
app.use('/', middleware.message_middleware);
app.use('/register', middleware.register_login_middleware);
app.use('/login', middleware.register_login_middleware);
app.use('/logout', middleware.protected_middleware);
app.use('/profile', middleware.protected_middleware);
app.use('/directmsgs', middleware.protected_middleware);
app.use('/trades', middleware.protected_middleware);
app.use('/profiles/:profileId/follow', middleware.protected_middleware);
app.use('/profiles/:profileId/reviews', middleware.protected_middleware);
app.post('/items', middleware.protected_middleware);

// ---------------------------------------

app.engine('handlebars', exphbs.engine({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');
configRoutes(app);

app.listen(3000, () => {
    console.log("BarterBuddy Active!");
    console.log('Routes are running on http://localhost:3000');
});