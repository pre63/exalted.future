import { id } from './exalted'

const chain = action => f =>
  Future((l, r) => {
    try {
      action(e => l(e), d => f(d).cata({ Left: l, Right: r }))
    } catch (e) {
      l(e)
    }
  })

const alt = action => alt =>
  Future((l, r) =>
    Future(action).cata({
      Left: a => {
        const b = alt(a)
        b.chain ? b.chain(r) : l(b)
      },
      Right: r
    }))

export const Future = action => ({
  ap: () => Future(action),
  alt: alt(action),
  bimap: () => Future(action),
  map: func => chain(action)(x => Future.of(func(x))),
  cata: f => action(f.Left, f.Right),
  chain: chain(action),
  equals: () => false,
  fold: f => action(f, f),
  foldl: f => action(f, id),
  foldr: f => action(id, f),
  inspect: () => 'Future(?)',
  of: a => Future.of(a),
  swap: () => Future(action)
})

Future.encase = f => {
  try {
    const a = f()
    return Future((_, r) => r(a))
  } catch (e) {
    return Future(l => l(e))
  }
}

Future.of = x => Future((_, resolve) => resolve(x))

Future.promise = promise =>
  Future((reject, resolve) => Future.promise(promise.then(resolve, reject).catch(reject)))

const all = futures =>
  Future((left, right, errored = false) =>
    futures.reduce(
      (results, future, i) => (
        future.cata({
          Left: error => !errored && ((errored = true), left(error)),
          Right: result => (
            (results[i] = result),
            !errored &&
              results.filter(a => a !== undefined).length === futures.length &&
              right(results))
        }),
        results
      ),
      []
    ))

Future.all = (...futures) => all([].concat(...futures))
