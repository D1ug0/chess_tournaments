const { Router } = require('express')
const flash = require("express-flash")
const session = require("express-session")
const passport = require("passport")
const router = Router()

const initializePassport = require('../passportConfig')
initializePassport(passport)

const { getHome,
    getRegister,
    getLogin,
    getDatabase,
    postRegister,
    getLogout,
    postDatabase,
    getCreate,
    postCreate,
    getRoles,
    postRoles,
} = require('../controllers/index.controller')

router.use(
    session({
        secret: 'secret',

        resave: false,

        saveUninitialized: false
    })
)

router.use(passport.initialize())
router.use(passport.session())

router.use(flash())

//Маршруты, по которым отправляются запросы
router.get('/', getHome)
router.get("/users/register", checkAuthenticated, getRegister)
router.get("/users/login", checkAuthenticated, getLogin)
router.get('/users/dashboard', checkNotAuthenticated, getDatabase)
router.post('/users/register', postRegister)
router.get("/users/logout", getLogout)
router.post("/users/dashboard/:player_id", postDatabase)
router.get("/create", getCreate)
router.post("/create", postCreate)
router.get("/users/roles", getRoles)
router.post("/users/roles", postRoles)
router.post(
    "/users/login",
    passport.authenticate("local", {
        successRedirect: "/users/dashboard",
        failureRedirect: "/users/login",
        failureFlash: true
    })
);

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/users/dashboard");
    }
    next();
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/users/login");
}

module.exports = router