import { WordModel } from './../models/word.model';
import { connectToDB } from '../helpers/DB';
import fetch from 'node-fetch'
import dotenv from 'dotenv'
import { LanguageModel } from '../models/language.model';
dotenv.config()

connectToDB(process.env.DB as string).then((_connection) => {
  async function* getWordsWithoutDefenitions() {
    const words = await WordModel.find({ 
      'defenitions.0': { $exists: false } 
    })
    console.log('called')
    while (words.length > 0) {
      yield words.shift()
    }
  } 

  ;(async () => {
    const wordsGen = getWordsWithoutDefenitions()
    const language = await LanguageModel.findOne({ name: "English" })
    try {
      for await (const word of wordsGen) {
        try {
          const response = await fetch(`https://api.wordnik.com/v4/word.json/${word?.word}/definitions?limit=10&includeRelated=false&useCanonical=true&includeTags=false&api_key=${process.env.WORDNIK_API_KEY}`)
          const res_examples = await response.json()
          console.log(res_examples.length)
          if(res_examples.length) {
            try {
              await WordModel.findByIdAndUpdate(word?._id, { 
                $addToSet: {
                  definitions: {
                    $each: res_examples.map((ex: any) => ({ definition: ex.text, language: language?._id})) 
                  }
                }
              }, { new: true })
            } catch (error) {
              console.log('err: didn\'t update ', error.message)
            }
          }
        } catch (error) {
          console.log('err ', error.message)
        }
      }
    } finally {
      console.log('done successfully')
      process.exit(-1)
    }
  })()
 
}).catch(err => {
  console.log(err)
  process.exit(-1)
})

