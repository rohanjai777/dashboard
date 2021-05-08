const express = require('express');
require('./src/db/mongoose');
const passport = require('passport');
const bodyParser = require('body-parser');
const LocalStrategy = require('passport-local');
const userRouter = require('./src/routers/user');
const appRouter = require('./src/routers/app');
const User = require('./src/models/user');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const moment = require('moment');
const compression = require('compression');
const { SecretKey } = require('./src/config/keys');
const authRouter = require('./src/routers/auth');
const GoogleStrategy = require('./src/config/googlePassportSetup');

const port = process.env.PORT || 3000;

const app = express();
app.use(compression());
app.set('view engine', 'ejs');
app.use(
  require('express-session')({
    secret: SecretKey,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(flash());
app.use(methodOverride('_method'));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  res.locals.moment = moment;
  next();
});

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
    },
    User.authenticate()
  )
);

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(express.json());
app.use(userRouter);
app.use(appRouter);
app.use('/auth', authRouter);
app.use(express.static(__dirname + '/public'));

app.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
