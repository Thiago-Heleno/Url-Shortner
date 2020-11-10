const express = require('express')
const helmet = require('helmet')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
//app.use(helmet())
app.use(morgan('tiny'))
//app.use(cors())
app.use(express.json())
app.use(express.static(__dirname + '/public'))


const port = process.env.PORT || 1337
app.listen(port, ()=>{
  console.log(`Listening at ${port}`);
})