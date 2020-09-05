import { Request, Response } from 'express'
import { WordModel } from '../models/word.model'

async function searchInWords(page = 0, limit = 4, query = {}) {
  try {
    const words = await WordModel.find(query)
      .skip(page * limit)
      .limit(limit)
      .populate('synonyms', 'word')
      .populate('language')
    return { words }   
  } catch (error) {
    return { message: error.message }
  }
}


export const wordQueryByLang = async (req: Request, res: Response) => {
  const _id = req.params._id
  const pageOptions = {
    page: parseInt(req.query.page as string, 10) || 0,
    limit: parseInt(req.query.limit as string, 10) || 10
  }
  return res.json(await searchInWords(pageOptions.page, pageOptions.limit, { language: _id }))
}

export const wordQuery = async (req: Request, res: Response) => {
  const pageOptions = {
    page: parseInt(req.query.page as string, 10) || 0,
    limit: parseInt(req.query.limit as string, 10) || 10
  }
  return res.json(await searchInWords(pageOptions.page, pageOptions.limit))
}


