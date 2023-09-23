const express = require('express');
const app = express();
const User = require('./models/user');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');


main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/loginDemo');
    console.log(" mongo connection open!");

    // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}
// session({
//     store: new MongoStore({ mongoose_connection: conn }),
//     secret: config.cookie_secret,
//     resave: true,
//     saveUninitialized: true
// });


app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: "notgoodsecret" }));

const requireLogin = (req, res, next) => {
    if (!req.session.user_id) {
        return res.redirect('login');
    }
    next();
};


app.get('/', (req, res) => {
    res.send("This is home page");
});


app.get('/register', (req, res) => {
    res.render('register');
});


app.get('/login', (req, res) => {
    res.render("login");
});

app.post('/login', async (req, res) => {
    // res.send(req.body);
    const { username, password } = req.body;
    // const user = await User.findOne({ username: username });
    // const validPassword = await bcrypt.compare(password, user.password);
    const foundUser = await User.findAndValidate(username, password);
    if (foundUser) {
        req.session.user_id = foundUser._id;
        // res.send("you are welcome");
        res.redirect('/secret');
    }
    else {
        // res.send('Login or Password is not correct')
        res.redirect('/login');
    }
});

app.post('/register', async (req, res) => {
    // res.send(req.body);
    const { username, password } = req.body;
    // const hash = await bcrypt.hash(password, 12);
    // res.send(hash);
    const user = new User({ username, password, });
    await user.save();
    req.session.user_id = user._id;
    res.redirect('/');
});

app.post('/logout', (req, res) => {
    // req.session.user_id = null;
    req.session.destroy();
    res.redirect('/login');
});

app.get('/secret', requireLogin, (req, res) => {
    res.render('secret');
    // res.send("You cannot see me unless you are logging in ")
});


app.listen(3000, () => {
    console.log('Serving porrt 3000');
});