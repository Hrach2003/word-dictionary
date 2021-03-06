import mongoose from 'mongoose';
import express, {Request, Response} from "express";
import http from 'http'
import socket from 'socket.io'
import bodyParser from 'body-parser'
import passport from "passport";
import dotenv from 'dotenv'
import cors from 'cors'
import cron from 'node-cron'

import { registerAdminPanel } from './admin/admin.routes'
import { connectToDB } from "./helpers/DB";

import './passport-setup'
import { MailService } from "./helpers/sendEmails";


import { getWordsWithoutDefenitions } from './utils/getWordDefenitions';
import { getWordsWithoutExamples } from './utils/getWordExamples';
import { getWordsWithoutSynonyns } from './utils/getWordSynonyms';
import session from 'express-session'
import connectMongoStore from 'connect-mongo'
import { UserModel } from './models/user.model';
import { WordModel } from './models/word.model';
const MongoStore = connectMongoStore(session)
dotenv.config()

const app = express()
const server = http.createServer(app);
const io = socket(http)

;(async () => {
  try {
    const DB_connection = await connectToDB(process.env.DB as string)

    app.use(session({
      cookie: { maxAge: 24 * 60 * 60 * 1000},
      secret: process.env.COOKIE_SECRET as string || 'asdfsgaddfvdrvawefzsdfchbsae',
      resave: false,
      saveUninitialized: false,
      store: new MongoStore({
        mongooseConnection: mongoose.connection 
      }),
    }))

    app.use(cors())   
    app.use(express.json())
    app.use(bodyParser.json()) 

    app.use(passport.initialize());
    app.use(passport.session());
    

    const { router: Words } = await import('./routes/word.routes')
    app.use("/words", Words)

    const { router: Auth } = await import('./routes/auth.routes')
    app.use("/auth", Auth)

    const { router: Language } = await import('./routes/language.routes')
    app.use("/language", Language)

    const { router: User } = await import('./routes/user.routes')
    app.use('/user', User)



    const { router: Admin, url = '/admin' } = registerAdminPanel(DB_connection)
    app.use(url, Admin) 

    app.get('/', async (req: Request, res: Response) => res.json({ message: "Hello World" }))

    console.log(process.env.NODE_ENV)
    
    

    if (process.env.NODE_ENV === "production") {
      // getWordsWithoutDefenitions()
      // getWordsWithoutExamples()
      // getWordsWithoutSynonyns()
      cron.schedule('0 8 * * *', async () => {
        MailService.emit('send_words', await WordModel.find({}).limit(10))
      })
    } else {
      // MailService.emit('send_words', await WordModel.find({}).limit(10))
    }

     
  } catch (error) {
    console.log("error", error)
  }
})()

// io.on('connection', (_socket) => {
//   console.log('a user connected');
// });

const PORT = process.env.PORT || 4000 as number 
server.listen(PORT, () => console.log(`server started on http://localhost:${PORT}`))

