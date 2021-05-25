const mongoose = require('mongoose')
const dotenv = require('dotenv')

process.on('uncaughtException', (err) => {
    console.log(err)
    console.log('UNCAUGHT EXCEPTION. Server will be stopped')
    process.exit(1)
})

const app = require('./app')

dotenv.config({ path: './config.env' })
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
})
    .then(() => console.log('DB connection successful'))


const port = process.env.PORT || 3000

const server = app.listen(port, () => {
    console.log(`Server started at port ${ port }`)
})

process.on('unhandledRejection', (err) => {
    console.log(err.name, err.message)
    console.log('UNHANDLED REJECTION. Server will be stopped')
    server.close(() => {
        process.exit(1)
    })
})

