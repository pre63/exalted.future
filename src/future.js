const fork2 = action => (error, success) => action(error, success)

const chain = action => func =>
  Future((reject, resolve) =>
    fork2(action)(e => reject(e), data => func(data).fork(reject, resolve)))

export const Future = action => ({
  map: func => chain(action)(x => Future.of(func(x))),
  chain: chain(action),
  fork: fork2(action),
  cata: f => action(f, f)
})

Future.of = x => Future((reject, resolve) => resolve(x))

Future.fromPromise = promise =>
  Future((reject, resolve) => Future.fromPromise(promise.then(resolve, reject)))

const countSparse = arr => arr.filter(x => x !== undefined).length

const all = futures =>
  Future((left, right, errored = false) =>
    futures.reduce(
      (results, future, i) => (
        future.fork(
          error => !errored && ((errored = true), left(error)),
          result => (
            (results[i] = result),
            !errored && countSparse(results) === futures.length && right(results))),
        results
      ),
      []
    ))

Future.all = (...futures) => all([].concat(...futures))
