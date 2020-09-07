import { connectToDB } from './../helpers/DB';
import { WordModel } from "../models/word.model";
import dotenv from 'dotenv'
import { LanguageModel } from '../models/language.model';
dotenv.config()

connectToDB(process.env.DB as string).then(async () => {
  try {
    const language = await LanguageModel.findOne({ name: "English" })
    const p = await WordModel.update(
      { 'definitions.language': '5f53be40d7a5a307586b1963' },
      { $set: { 'definitions.$.language': language } },
      // { multi: true }
    )
    console.log('fulfilled', p)
  } catch (error) { 
    console.log(error.message)
  }
})

