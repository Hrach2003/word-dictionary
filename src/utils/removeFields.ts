import { connectToDB } from './../helpers/DB';
import { WordModel } from "../models/word.model";
import dotenv from 'dotenv'
dotenv.config()

connectToDB(process.env.DB as string).then(async () => {
  try {
    await WordModel.update({}, {$pull: { defenitions: true, relatedWords: true }} , {multi: true})
    console.log('fulfilled')
  } catch (error) { 
    console.log(error)
  }
})

