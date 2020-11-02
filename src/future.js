const chain = action => f =>
  Future((l, r) => {
    try {
      action(e => l(e), d => f(d).cata({ Left: l, Right: r }))
    } catch (e) {
      l(e)
    }
  })

export const Future = action => ({
  map: func => chain(action)(x => Future.of(func(x))),
  chain: chain(action),
  cata: f => action(f.Left, f.Right)
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
  Future((reject, resolve) => Future.promise(promise.then(resolve, reject)))

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
