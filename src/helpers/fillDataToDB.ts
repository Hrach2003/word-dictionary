import { IWordSchema, WordModel } from './../models/word.model';
import { connectToDB } from './DB';
import fetch from 'node-fetch'
import dotenv from 'dotenv'
import { LanguageModel } from '../models/language.model';
import { resolve } from 'path';
dotenv.config()

type ResWords = { 
  id: number, word: string 
}

const wordsToAdd: IWordSchema[] = []

connectToDB(process.env.DB as string).then(connection => {
  async function getWords() {
    const response = await fetch(`https://api.wordnik.com/v4/words.json/randomWords?limit=200&api_key=${process.env.WORDNIK_API_KEY}`) 
    const data: ResWords[] = await response.json()

    const lang = await LanguageModel.findOne({ name: "English" })
    console.log("lang", lang)
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
  }
  async function getExamples() {
    const words = await WordModel.find({ 
      'examples.0': { $exists: false } 
    }).limit(100)
    let count = 0
    words.map(async ({ word, examples }) => {
      if(!examples.length) {
        const response = await fetch(`https://api.wordnik.com/v4/word.json/${word}/examples?includeDuplicates=false&useCanonical=false&limit=5&api_key=${process.env.WORDNIK_API_KEY}`)
        const res_examples = await response.json()
        if(res_examples.examples) {
          try {
            await WordModel.findOneAndUpdate({ word }, { 
              $addToSet: {
                examples: {
                  $each: res_examples.examples.map((ex: any) => ({ text: ex.text, year: ex.year})) 
                }
              }
            }, { new: true })
            count++
          } catch (error) {
            console.log(error)
          }
        }
        console.log("count ", count)
      }
    }) 
  } 
  // getExamples()

  async function getSynonyms() {
    console.log('called')
    const language = await LanguageModel.findOne({ name: "English" })
    const words = await WordModel.find({ 
      'synonyms.1': { $exists: false } 
    })
    words.map(async (word) => {
      try {
        const response = await fetch(`http://api.datamuse.com/words?rel_syn=${word.word}&max=10`)
        const synonyms: { word: string }[] = await response.json()


        async function* getSyn() {
          let synonymTo: IWordSchema["_id"][] = []
          for (let i = 0; i < synonyms.length; i++) {
            const { word } = synonyms[i];            
            const w = await WordModel.findOne({ word })
            if(!w) {
              const newWord = new WordModel({
                word,
                language
              } as IWordSchema)
              await newWord.save()
              yield newWord._id
            } else {
              synonymTo = [...synonymTo, w?._id]
              console.log("id from gen", w?._id);

              yield w?._id
            }
          }
        }


        const synonymsGen = getSyn();

        (async () => {
          for await (const _id of synonymsGen) {
            console.log('id', _id)
            const w = await WordModel.findById(_id) as IWordSchema
            
            await WordModel.findOneAndUpdate({ word: word.word }, { 
              $addToSet: {
                synonyms: {
                  $each: [w]
                } 
              }
            })
          }
        })()
      } catch (error) {
        console.log('api hang')
      }      
    })
  }

  getSynonyms()

}).catch(err => {
  console.log(err)
  process.exit(-1)
})

