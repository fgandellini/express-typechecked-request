import * as t from 'io-ts'

const NumberCodec = new t.Type<number, string, string>(
  'NumberCodec',
  t.number.is,
  (s, c) => {
    const n = parseFloat(s)
    return isNaN(n) ? t.failure(s, c) : t.success(n)
  },
  String
)

const NumberFromString = t.string.pipe(NumberCodec, 'NumberFromString')

export const CommonParams = t.readonly(
  t.type({
    userId: t.number,
    token: t.string,
  })
)
export type CommonParams = t.TypeOf<typeof CommonParams>

export const ResourceParams = t.readonly(
  t.type({
    resourceId: NumberFromString,
  })
)
export type ResourceParams = t.TypeOf<typeof ResourceParams>
