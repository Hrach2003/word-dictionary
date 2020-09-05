import { EventEmitter } from 'events'
import { IWordSchema } from '../models/word.model'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import { UserModel } from '../models/user.model'
dotenv.config()

const MailService = new EventEmitter()

let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL, // generated ethereal user
    pass: process.env.APP_PASSWORD, // generated ethereal password
  },
});

MailService.on('send_words', async (words: IWordSchema[]) => {
  let users = await UserModel.find({})
  let info = await transporter.sendMail({
    from: '"✉️ Translate Words 📨" <hr.ovakimyan.03@gmail.com>', // sender address
    to: users.map(u => u.email).join(' '), 
    subject: "Did you remember words?📰💭", // Subject line
    text: `Words to repeat \n ${words.join('\n')}`, // plain text body
    html: `${words.map(w => `<b>${w.word}</b>: <span>${w._id}\n</span>`)}`, // html body
  });
  console.log("Message sent: %s", info.messageId);
})

setInterval(() => {
  MailService.emit('send_word')
}, 12 * 60 * 60 * 1000)


export { MailService }