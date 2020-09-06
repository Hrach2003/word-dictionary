import { Schema, model, Document } from 'mongoose';
import { ILanguage } from './language.model';

interface IWordDefinitionsSchema extends Document {
  definition: string,
  language: ILanguage['_id']  
}

interface IWordExamplesSchema extends Document {
  text: string
  year: number  
}


export interface IWordSchema extends Document {
  word: string,
  language: ILanguage['_id'],
  examples?: IWordExamplesSchema[],
  definitions?: IWordDefinitionsSchema[],
  synonyms: IWordSchema[],
  date?: Date
}



const wordDefenitionSchema = new Schema<IWordDefinitionsSchema>({
  definition: {
    type: String,
    required: true
  },
  language: {
    type: Schema.Types.ObjectId,
    ref: "Language"
  }
}, { _id: false })


const wordExamplesSchema = new Schema<IWordExamplesSchema>({
  text: {
    type: String,
    required: true,
    maxlength: 2048
  },
  year: { 
    type: Number,
    default: 2020
  }
}, { _id: false })


const wordSchema = new Schema({
  word: {
    type: String,
    required: true,
    unique: true,
    maxlength: 128,
    set: (word: string) => word.toLowerCase() 
  }, 
  language: {
    type: Schema.Types.ObjectId,
    ref: 'Language',
    required: true
  }, 
  examples: [wordExamplesSchema],
  synonyms: [{
    type: Schema.Types.ObjectId,
    ref: "Word"
  }],
  definitions: [wordDefenitionSchema],
  date: {
    type: Date,
    default: Date.now
  }
})

const WordModel = model<IWordSchema>("Word", wordSchema)
export { WordModel }

//kill -9 $(lsof -t -i:4000)