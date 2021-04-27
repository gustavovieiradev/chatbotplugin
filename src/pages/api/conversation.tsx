import { NextApiRequest, NextApiResponse } from "next";
import { query as q } from 'faunadb';
import { fauna } from "../../services/fauna";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    try {
      const messages = await fauna.query(
        q.Get(
          q.Match(
            q.Index('ix_intent_text_input'),
            q.Casefold(req.body.message)
          )
        )
      )
      return res.json(messages);
    } catch (err) {
      return res.status(err.requestResult.statusCode).json({meesage: err.message})
    }
  }
}