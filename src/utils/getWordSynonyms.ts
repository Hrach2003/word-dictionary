import { IWordSchema, WordModel } from './../models/word.model';
import { connectToDB } from '../helpers/DB';
import fetch from 'node-fetch'
import { LanguageModel } from '../models/language.model';

import dotenv from 'dotenv'
dotenv.config()

export function getWordsWithoutSynonyns() {
  connectToDB(process.env.DB as string).then((_connection) => {

    async function* synonynsGenerator() {
      const words = await WordModel.find({ 

        synonyms: { $size: 0 } 
      })
      console.log('starting...')
      while (words.length > 0) {
        yield words.shift()
      }
    } 

    ;(async () => {
      const wordsGen = synonynsGenerator()
      
      try {
        const language = await LanguageModel.findOne({ name: "English" })
        for await (const word of wordsGen) {
          try {
            const wordsCount = word?.word.trim().split(' ').length || 1
            const response = await fetch(`http://api.datamuse.com/words?${ wordsCount > 1 ? 'ml' : 'rel_syn' }=${word?.word}&max=10`)
            const res_synonyms: { word: string }[] = await response.json()

            console.log(res_synonyms)
          
            res_synonyms.forEach(({ word: wordToAdd }) => {
              try {
                WordModel.findOne({ word: wordToAdd }, async (err, findedWord) => {
                  if(err) return console.log(err.message)
                  if(findedWord) {
                    console.log('findedWord', findedWord.word)
                    await WordModel.findByIdAndUpdate(word?._id, {
                      $addToSet: {
                        synonyms: findedWord
                      }
                    }, { new: true })
                  } else {
                    const newWord: IWordSchema = new WordModel({
                      word: wordToAdd,
                      language 
                    } as IWordSchema)
                    newWord.save().then(async () => {
                      console.log('new word added')
                      await WordModel.findByIdAndUpdate({ _id: word?._id }, {
                        $addToSet: {  
                          synonyms: newWord
                        }
                      }, { new: true })
                    }).catch(err => console.log(err.message))
                  }
                })
              } catch (error) {
                
              }
            })

          } catch (error) {
            console.log('api hang', error.message)
          }
        } 
      } finally {
        console.log('done successfully')
        const words = await WordModel.find({ 
          "synonyms.0": { $exists: false } 
        })
        if(words.length) {
          getWordsWithoutSynonyns()
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

getWordsWithoutSynonyns();
