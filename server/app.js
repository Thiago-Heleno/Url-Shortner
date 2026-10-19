const express = require('express')
const helmet = require('helmet')
const morgan = require('morgan')
const cors = require('cors')
const yup = require('yup')
const { nanoid } = require('nanoid')
const { DatabaseSync } = require('node:sqlite') // needs Node 22.5+

const db = new DatabaseSync(process.env.DB_PATH || __dirname + '/urls.db')
db.exec('CREATE TABLE IF NOT EXISTS urls (slug TEXT PRIMARY KEY, url TEXT NOT NULL)')
const findUrl = db.prepare('SELECT slug, url FROM urls WHERE slug = ?')
const insertUrl = db.prepare('INSERT INTO urls (slug, url) VALUES (?, ?)')


const app = express()
// Keep db reachable: on Node < 22.13 a garbage-collected db finalizes its statements.
app.locals.db = db
//app.use(helmet())
app.use(morgan('tiny'))
app.use(cors())
app.use(express.json())
app.use(express.static(__dirname + '/public'))


const schema = yup.object().shape({
  slug: yup.string().trim().matches(/[\w\-]/i).nullable(),
  url: yup.string().trim().url().required(),
})
app.post('/url', async (req, res, next)=>{
  let {slug, url} = req.body;
  try {
    await schema.validate({
      slug,
      url
    })
    slug = (slug || nanoid(5)).toLowerCase()
    if(findUrl.get(slug)){
      throw new Error('Slug in use!')
    }
    insertUrl.run(slug, url)
    res.json({ slug, url })
  } catch (error) {
    next(error)
  }
})

app.get('/:id', async (req, res, next)=>{
  const { id: slug } = req.params;
  try {
    const row = findUrl.get(slug)
    if(row){
      return res.redirect(row.url);
    }
    res.redirect('/?error=${slug} not found')
  } catch (error) {
    res.redirect('/?error=Link not found')
    next(error)
  }
})

app.use((error, req, res, then)=>{
  if(error.status){
    res.status(error.status)
  }else{
    res.status(500)
  }
  res.json({
    message: error.message,
    stack: process.env.NODE_ENV === 'production' ? '🥧' : error.stack,
  })
})

const port = process.env.PORT || 1337
app.listen(port, ()=>{
  console.log(`Listening at ${port}`);
})