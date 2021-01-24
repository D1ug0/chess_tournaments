const {pool} = require("../dbConfig");
const bcrypt = require("bcrypt")

//Работа непосредственно с запросами
const getHome = async (req, res) => {
    res.render("index")
}

const getRegister = async (req, res) => {
    res.render("register")
}

const getLogin = async (req, res) => {
    res.render("login")
}

const getDatabase = async function (req, res) {
    const players = await pool.query("SELECT * FROM players")
    const clubs = await pool.query("SELECT * FROM chess_clubs")
    const tournaments = await pool.query("SELECT * FROM tournaments")
    const sponsors = await pool.query("SELECT * FROM list_of_sponsors")
    const matches = await pool.query("SELECT * FROM matches")
    const ref_ranking_codes = await pool.query("SELECT * FROM ref_ranking_codes")
    const history = await pool.query("SELECT * FROM history")
    const ranking = await pool.query("SELECT * FROM ranking")
    const role = await pool.query("SELECT users.id, users.name, user_role.role FROM user_role INNER JOIN users ON users.id = user_role.user_id WHERE id=$1",[req.user.id])

    res.render('dashboard', {
        players: players.rows,
        clubs: clubs.rows,
        tournaments: tournaments.rows,
        sponsors: sponsors.rows,
        matches: matches.rows,
        ref_ranking_codes: ref_ranking_codes.rows,
        history: history.rows,
        ranking: ranking.rows,
        role: role.rows[0].role,
        user: req.user.name
    });
}

const postDatabase = async function(req, res){
    const player_id = req.params.player_id;
    pool.query("DELETE FROM players WHERE player_id=$1;", [player_id], function(err, data) {
        if(err) return console.log(err);
        res.redirect("/users/dashboard");
    });
}

const getCreate = async function(req, res){
    res.render("create.ejs");
}

const postCreate = function (req, res) {

    if(!req.body) return res.sendStatus(400);
    const first_name = req.body.first_name;
    const second_name = req.body.second_name;
    const ranking_code = req.body.ranking_code;
    const phone_number = req.body.phone_number;
    const email_adress = req.body.email_adress;
    pool.query("INSERT INTO players (first_name, second_name, ranking_code, phone_number, email_adress) VALUES ($1,$2,$3,$4,$5)", [first_name, second_name, ranking_code, phone_number, email_adress], function(err, data) {
        if(err) return console.log(err);
        res.redirect("/users/dashboard");
    });
}

const postRoles = async (req,res)=>{
    if(!req.body) return res.sendStatus(400);

    const id = req.body.id;
    const role = req.body.role;
    console.log(id, role)
    pool.query("UPDATE user_role SET role=$1 WHERE user_id=$2", [role, id], function(err, data) {
        if(err) return console.log(err);
        res.redirect("/users/dashboard");
    });
}

const postRegister = async (req, res) => {
    let {name, email, password, password2} = req.body
    console.log({
        name,
        email,
        password,
        password2
    })

    let errors = [];

    if (!name || !email || !password || !password2) {
        errors.push({message: "Пожалуйста, введите все поля"})
    }

    if (password.length < 6) {
        errors.push({message: "Пароль меньше 6 символов"})
    }

    if (password !== password2) {
        errors.push({message: "Пароль не совпадает"})
    }

    if (errors.length > 0) {
        res.render('register', {errors})
    } else {
        let hashedPassword = await bcrypt.hash(password, 10)

        pool.query(
            `SELECT * FROM users
            WHERE email = $1`, [email],
            (err, results) => {
                if (err) {
                    throw err
                }

                console.log(results.rows)
                if (results.rows.length > 0) {
                    errors.push({message: "Email уже зарегистрирован"})
                    res.render('register', {errors})
                } else {
                    pool.query(
                        `INSERT INTO users (name, email, password)
                VALUES ($1, $2, $3)
                RETURNING id, password`,
                        [name, email, hashedPassword],
                        (err, results) => {
                            if (err) {
                                throw err;
                            }
                            console.log(results.rows);
                            req.flash("success_msg", "Вы успешно зарегистрировались, теперь залогиньтесь");
                            res.redirect("/users/login");
                        }
                    );
                }
            }
        )
    }
}

const getLogout = async (req, res) => {
    req.logout();
    req.flash('success_msg',"Вы разлогинились")
    res.redirect("/users/login")
}

const getRoles = async (req,res) => {
    res.render("roles.ejs");
}


module.exports = {
    getHome,
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
}