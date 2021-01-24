const express = require('express')
const app = express()
const PORT = process.env.PORT || 8080

//middlewares
app.use(express.json())
app.use(express.urlencoded({extended: false}));

app.set("view engine", "ejs")

//routes
app.use(require('./routes/index'))

app.listen(PORT,
    () => console.log(`Server started on port ${PORT}`))
