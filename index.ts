import * as express from 'express'
import type { Request, Response } from 'express'
import { CommonParams, ResourceParams } from './types'
import * as t from 'io-ts'
import { pipe } from 'fp-ts/function'
import * as E from 'fp-ts/Either'
import * as Ap from 'fp-ts/Apply'
import { failure } from 'io-ts/PathReporter'
import { IncomingHttpHeaders } from 'node:http'

const app = express()
app.use(express.json())

const decodeRequestWith =
  <P extends t.Mixed, B extends t.Mixed>(paramsCodec?: P, bodyCodec?: B) =>
    (handler: (
        req: { headers: IncomingHttpHeaders; params?: t.TypeOf<P>; body?: t.TypeOf<B> },
        res: Response
      ) => Response<any, Record<string, any>>
    ) => 
      (eReq: Request, eRes: Response) =>
        pipe(
          Ap.sequenceS(E.either)({
            params: paramsCodec ? paramsCodec.decode(eReq.params) : E.right(eReq.params),
            body: bodyCodec ? bodyCodec.decode(eReq.body) : E.right(eReq.body),
          }),
          E.fold(
            errors => eRes.status(400).send(failure(errors)),
            ({ params, body }) => handler({ headers: eReq.headers, params, body }, eRes)
          )
        )

app.get('/', (req: Request, res: Response) => {
  res.send(req.headers)
})

app.post(
  '/resource/:resourceId',
  decodeRequestWith(ResourceParams, CommonParams)
  // decodeRequestWith(t.unknown, CommonParams)
  // decodeRequestWith(ResourceParams, t.unknown)
  // decodeRequestWith(t.unknown, t.unknown)
  ((req, res) => {
    return res.send(req)
  })
)

app.listen(3000, () =>
  console.log('Example app listening at http://localhost:3000')
)
