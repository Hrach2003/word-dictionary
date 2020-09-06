import { IWordSchema, WordModel } from './../models/word.model';
import { connectToDB } from '../helpers/DB';
import fetch from 'node-fetch'
import dotenv from 'dotenv'
import { LanguageModel } from '../models/language.model';
dotenv.config()

type ResWords = { 
  id: number, word: string 
};

connectToDB(process.env.DB as string).then((_connection) => {
  async function getWords(limit: string | number = 10) {
    try {
      const response = await fetch(`https://api.wordnik.com/v4/words.json/randomWords?hasDictionaryDef=true&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=5&maxLength=-1&limit=${limit}&api_key=${process.env.WORDNIK_API_KEY}`) 
      const data: ResWords[] = await response.json()

      const lang = await LanguageModel.findOne({ name: "English" })
      if(data.length) {
        data.map(async ({ word }) => {
          if(!await WordModel.findOne({ word })) {
            const newWord = new WordModel({
              word,
              language: lang?._id
            } as IWordSchema)
            await newWord.save() 
          }
        })
      }
      console.log(data)
    } catch (error) {
      console.log('error occurred ', error.message)
    }
  }

  getWords()

}).catch(err => {
  console.log('could not connect to DB ', err.message)
  process.exit(-1)
})

