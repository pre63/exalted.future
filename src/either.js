import { isNull, iff } from './id'

const eq = (a, r) => r.cata({ Right: b => a === b, Left: b => a === b })

export const Right = a => ({
  ap: app => (app.isLeft ? app : app.map(b => iff(b, a))),
  bimap: (_, r) => iff(r, a),
  cata: (f = Identity) => f.Right(a),
  chain: f => iff(f, a),
  equals: r => eq(a, r),
  fold: f => iff(f, a),
  foldl: f => iff(f, null),
  foldr: f => iff(f, a),
  inspect: () => 'Right(' + a + ')',
  isLeft: false,
  map: f => Right(iff(f, a)),
  of: a => Right(a),
  swap: () => Left(a)
})

Right.of = a => Right(a)

export const Left = a => ({
  ap: app => (app.isLeft ? app : Left(a)),
  bimap: (l, _) => iff(l, a),
  cata: (f = Identity) => f.Left(a),
  chain: () => Left(a),
  map: () => Left(a),
  equals: l => eq(a, l),
  fold: f => iff(f, a),
  foldl: f => iff(f, a),
  foldr: f => iff(f, null),
  inspect: () => 'Left(' + a + ')',
  isLeft: true,
  of: a => Left(a),
  swap: () => Right(a)
})

Left.of = a => Left(a)

export const nullable = x => (isNull(x) ? Left(x) : Right(x))

export const Either = (l, r) => [Left(l), Right(r)]

const encase = f => {
  try {
    return Right(iff(f, null))
  } catch (err) {
    return Left(err)
  }
}

Either.encase = encase

Right.encase = encase

Left.encase = encase

Either.error = error => right => (isNull(error) ? Right(right) : Left(error))
