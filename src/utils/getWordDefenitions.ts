import { WordModel } from './../models/word.model';
import { connectToDB } from '../helpers/DB';
import fetch from 'node-fetch'
import dotenv from 'dotenv'
import { LanguageModel } from '../models/language.model';
dotenv.config()

export function getWordsWithoutDefenitions() {
  connectToDB(process.env.DB as string).then((_connection) => {
    async function* wordDefenitionsGenerator() {
      console.time('query defenition')
      const words = await WordModel.find({ 
        definitions: { $size: 0 } 
      })
      console.timeEnd('query defenition')
      console.log('definition len', words.length)
      console.log('starting...')
      while (words.length > 0) {
        yield words.shift()
      }
    } 

    ;(async () => {
      const wordsGen = wordDefenitionsGenerator()
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
                      $each: res_examples.map((ex: any) => ({ definition: ex.text, language })) 
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
        const words = await WordModel.find({ 
          'defenitions.0': { $exists: false } 
        })
        if(words.length) {
          getWordsWithoutDefenitions()
        } else {
        // process.exit(-1)
          return 'done '
        }
      }
    })()
  
  }).catch(err => {
    console.log(err)
    process.exit(-1)
  })
}

// getWordsWithoutDefenitions();

