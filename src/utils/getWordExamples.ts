import { WordModel } from './../models/word.model';
import { connectToDB } from '../helpers/DB';
import fetch from 'node-fetch'
import dotenv from 'dotenv'
dotenv.config()

export function getWordsWithoutExamples() {
  connectToDB(process.env.DB as string).then((_connection) => {
    async function* wordExamplesGenerator() {
      const words = await WordModel.find({ 
        examples: { $size: 0 } 
      })
      console.log('starting...')
      while (words.length > 0) {
        yield words.shift()
      }
    } 

    ;(async () => {
      const wordsGen = wordExamplesGenerator()
      try {
        for await (const word of wordsGen) {
          try {
            const response = await fetch(`https://api.wordnik.com/v4/word.json/${word?.word}/examples?includeDuplicates=false&useCanonical=true&limit=10&api_key=${process.env.WORDNIK_API_KEY}`)
            const res_examples = await response.json()
            console.log(res_examples?.examples?.length)
            if(res_examples.examples) {
              try {
                await WordModel.findByIdAndUpdate(word?._id, { 
                  $addToSet: {
                    examples: {
                      $each: res_examples.examples.map((ex: any) => ({ text: ex.text, year: ex.year})) 
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
          'examples.0': { $exists: false } 
        })
        if(words.length) {
          getWordsWithoutExamples()
        } else {

          return 'done'
          // process.exit(-1)
        }
      }
    })()
  
  }).catch(err => {
    console.log(err)
    process.exit(-1)
  })
}
getWordsWithoutExamples();


