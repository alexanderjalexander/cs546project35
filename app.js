// Setup server, session and middleware here.

/*
Here is where you'll set up your server as shown in lecture code and worked in previous labs.
Your server this week should not be doing any of the processing! Your server only exists to allow someone to get to the HTML Page and download the associated assets to run the text analyzer page.
*/
// This file should set up the express server as shown in the lecture code
//Here is where you'll set up your server as shown in lecture code
import express from 'express';
const app = express();
import configRoutes from './routes/index.js';
import exphbs from 'express-handlebars';
import session from 'express-session';
import bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';


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

app.use('/public', express.static('public'));
app.use(cookieParser());

app.use(express.json());
app.use(session({
    name: 'AuthenticationState',
    secret: 'some secret string!',
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 60000}
  }));
app.use(express.urlencoded({extended: true}));
app.use(rewriteUnsupportedBrowserMethods);
app.engine('handlebars', exphbs.engine({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

configRoutes(app);

app.listen(3000, () => {
    console.log("BarterBuddy Active!");
    console.log('Routes are running on http://localhost:3000');
});