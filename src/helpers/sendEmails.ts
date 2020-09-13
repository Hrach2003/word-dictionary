import { EventEmitter } from 'events'
import { IWordSchema } from '../models/word.model'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import { UserModel } from '../models/user.model'

dotenv.config()



interface Events {
  send_words: IWordSchema[],
}

interface TypedEventEmitter<T> {
  on<K extends keyof T>(s: K, listener: (v: T[K]) => void): void;
  emit<S extends keyof T>(s: S, payload: T[S]): void;
}
let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASSWORD,
  },
});


const MailService: TypedEventEmitter<Events> = new EventEmitter() 



MailService.on('send_words', async (words: IWordSchema[]) => {
  let users = await UserModel.find({})
  let info = await transporter.sendMail({
    from: '"✉️ Translate Words 📨" <hr.ovakimyan.03@gmail.com>', // sender address
    to: users.map(u => u.email).join(' '), 
    subject: "Did you remember words?📰💭", // Subject line
    text: `Words to repeat \n ${words.length}`, // plain text body
    html: 
      /*html*/
    `<div style="background-color: #f7fafc; color: #2d3748; padding-left: 5px; padding-top: 5px;  padding-bottom: 15px; border-radius: 5px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
        ${words.map(w => 
          /*html*/
          `<div style="text-align: center;">
            <h3 style="text-transform: uppercase;">${w.word}</h3> 
            <div>
              <h4 style="margin-bottom: 0px">Example</h4> 
              ${(w?.examples && w.examples[0] && w.examples[0].text) ? w.examples[0].text : ''}
            </div>
            <div> 
              <h4 style="margin-bottom: 0px">Definition</h4> 
              ${(w?.definitions && w.definitions[0] && w.definitions[0].definition) ? w.definitions[0].definition : '' }
            </div>
          </div>`)}
      </div>`
  }); 
  console.log("Message sent: %s", info.messageId);
})





export { MailService }