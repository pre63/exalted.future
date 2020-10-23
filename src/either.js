const isNull = value => value === null || value === undefined

const identity = a => a

export const Right = a => ({
  ap: app => (app.isLeft ? app : app.map((b = identity) => b(a))),
  bimap: (left = identity, right = identity) => right(a),
  cata: (f = { Right: identity }) => f.Right(a),
  chain: (f = identity) => f(a),
  equals: r => r.cata({ Right: b => a === b, Left: b => a === b }),
  fold: (f = identity) => f(a),
  foldl: (f = identity) => f(null),
  foldr: (f = identity) => f(a),
  inspect: () => `Right(${a})`,
  isLeft: false,
  map: (f = identity) => Right(f(a)),
  of: a => Right(a),
  swap: () => Left(a)
})

Right.of = a => Right(a)

export const Left = a => ({
  ap: app => (app.isLeft ? app : Left(a)),
  bimap: (left = identity, right = identity) => left(a),
  cata: (f = { Left: identity }) => f.Left(a),
  chain: () => Left(a),
  map: () => Left(a),
  equals: l => l.cata({ Left: b => a === b, Right: b => a === b }),
  fold: (f = identity) => f(a),
  foldl: (f = identity) => f(a),
  foldr: (f = identity) => f(null),
  inspect: () => `Left(${a})`,
  isLeft: true,
  of: a => Left(a),
  swap: () => Right(a)
})

Left.of = a => Left(a)

export const nullable = x => (isNull(x) ? Left(x) : Right(x))

export const Either = (l, r) => [Left(l), Right(r)]

const encase = (f = identity) => {
  try {
    return Right(f(null))
  } catch (err) {
    return Left(err)
  }
}

Either.encase = encase

Right.encase = encase

Left.encase = encase
