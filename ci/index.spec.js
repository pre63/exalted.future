const assert = require('assert')
const { Id, Maybe, Future, compose, map, Right, Left, nullable, get } = require('../')

const toUpperCase = s => s.toUpperCase()

const identity = of => eq => x => eq(of(x).map(x => x), of(x))

const fid = { Right: a => a, Left: () => 'left' }
const lrid = { Right: a => a, Left: a => a }

const composition = of => eq => f => g => x =>
  eq(
    of(x).map(x => f(g(x))),
    of(x)
      .map(g)
      .map(f))

const associativity = t => eq => x =>
  eq(
    t
      .of(x)
      .chain(t.of)
      .chain(t.of),
    t.of(x).chain(x => t.of(x).chain(t.of)))

describe('A compose', () => {
  it('will compose one function', () => assert.equal(compose(a => a)('exalted'), 'exalted'))

  it('will compose two function', () =>
    assert.equal(
      compose(
        a => a,
        a => a
      )('exalted'),
      'exalted'
    ))

  it('will compose three function', () =>
    assert.equal(
      compose(
        a => a,
        a => a,
        a => a
      )('exalted'),
      'exalted'
    ))

  it('will compose two function that add 1', () =>
    assert.equal(
      compose(
        a => a + 1,
        a => a + 1
      )(1),
      3
    ))

  it('will compose three function that add 1', () =>
    assert.equal(
      compose(
        a => a + 1,
        a => a + 1,
        a => a + 1
      )(1),
      4
    ))

  it('will compose three function that multiply', () =>
    assert.equal(
      compose(
        a => a * 7,
        a => a * 4,
        a => a * 5
      )(3),
      420
    ))

  it('will compose one function with 2 arguments', () =>
    assert.equal(compose((a, b) => a + b)(1, 2), 3))

  it('will compose two functions with 2 arguments', () =>
    assert.equal(
      compose(
        a => a,
        (a, b) => a + b
      )(1, 2),
      3
    ))

  it('will compose three functions with 3 arguments', () =>
    assert.equal(
      compose(
        a => a,
        (a, b, c) => a + b + c
      )(1, 2, 3),
      6
    ))
})

describe('A map', () => {
  it('will compose map 1 function with 1 arguments', () =>
    assert.deepEqual(map(a => a * 2)([1, 2, 3]), [2, 4, 6]))

  it('will compose map 2 function with 1 arguments', () =>
    assert.deepEqual(map(a => a * 7, a => a * 2)([1, 2, 3]), [14, 28, 42]))
})

describe('A Id', () => {
  describe('as a monad', () => {
    const eq = (a, b) => assert(a.inspect() === b.inspect())

    it('is an identity', () => identity(Id.of)(eq)('Functional fun!'))

    it('is composable', () => composition(Id.of)(eq)(x => x)(x => x)('Functional fun!'))

    it('can do maths', () => composition(Id.of)(eq)(x => x * 2)(x => x * 7)(3))

    it('is associative', () => associativity(Id)(eq)(7))
  })

  describe('as a applicative', () => {
    const add = a => b => a + b
    const mul = a => b => a * b
    const a = Id(mul(10))
    const u = Id(add(7))
    const v = Id(10)

    it('is an Apply', () =>
      assert.deepEqual(
        v.ap(u.ap(a.map(f => g => x => f(g(x))))).inspect(),
        v
          .ap(u)
          .ap(a)
          .inspect()))

    it('is an Apply solves to 170', () =>
      assert.deepEqual(v.ap(u.ap(a.map(f => g => x => f(g(x))))).cata(fid), 170))

    it('is an Apply solves to 170', () =>
      assert.deepEqual(
        v
          .ap(u)
          .ap(a)
          .cata(fid),
        170
      ))

    it('is an Applicative identity', () => assert.equal(v.ap(Id.of(x => x)).inspect(), v.inspect()))

    it('is an Applicative homomorphism', () =>
      assert.equal(
        Id.of(10)
          .ap(Id.of(add(78)))
          .inspect(),
        Id.of(add(78)(10)).inspect()))

    it('is an Applicative interchange', () =>
      assert.equal(
        Id.of(10)
          .ap(u)
          .inspect(),
        u.ap(Id.of(f => f(10))).inspect()))
  })

  it('will map to uppercase', () => {
    Id('Exalted')
      .map(x => x.toUpperCase())
      .cata({ Right: x => assert.equal(x, 'EXALTED') })
  })

  it('of will return a new Id', () => {
    assert.equal(Id.of('Exalted').inspect(), Id('Exalted').inspect())
  })

  it('inspect will format a correct Id', () => {
    assert.equal(Id('Exalted').inspect(), 'Id(Exalted)')
  })

  it('will be exactly 11', () => assert(Id(11).cata(fid) === 11))

  it('will be exactly 12 when map is called', () => {
    const value = Id(11)
      .map(value => value + 1)
      .cata(fid)
    assert(value === 12)
  })

  it('will be exactly 13 when bind is called', () => {
    const value = Id(12)
      .chain(value => Id(value + 1))
      .cata(fid)
    assert(value === 13)
  })

  it('will be exactly 12 when chain is called', () => {
    const value = Id(12)
      .chain(value => Id(value))
      .cata(fid)
    assert(value === 12)
  })

  it('will be exactly 12 after chain', () => {
    const value = Id(12)
      .chain(value => Id(value))
      .cata(fid)
    assert(value === 12)
  })

  it('Id.of || pure, should be 12', () => {
    const value = Id(17)
      .of(12)
      .cata(fid)
    assert(value === 12)
  })

  it('Id.chain, should be 12', () => {
    const value = Id(Id(12))
      .chain(x => x)
      .cata(fid)
    assert(value === 12)
  })

  describe('as a Setoid', () => {
    const a = Id(2)
    const b = Id(2)
    const c = Id(2)

    it('should equal another right of the same value (reflexivity)', () =>
      assert.equal(a.equals(a), true))

    it('should equal the result of another equal (symmetry)', () =>
      assert.equal(a.equals(b), b.equals(a)))

    it('should equal the result of another equal (transitivity)', () =>
      assert.equal((a.equals(b) === b.equals(c)) === a.equals(c), true))
  })
})

describe('A Future', () => {
  it('should map over the data', () =>
    Future((reject, resolve) => resolve('hello exalted one'))
      .map(toUpperCase)
      .fork(error => assert(false, error), data => assert(data === 'HELLO EXALTED ONE')))

  it("should return 'this worked' after fork", () =>
    assert(
      Future((reject, resolve) => (resolve(true), 'this worked')).fork(
        error => assert(false, error),
        data => data
      ),
      'this worked'
    ))

  it('should not execute untill fork is called', () => {
    /**
     * I'm using assignment here because I
     * have to track as a side effect, the
     * map function call.
     */
    let executed = false
    const f = Future((reject, resolve) => {
      executed = true
      resolve(true)
    })

    assert(!executed)

    f.fork(
      () => assert(false, 'should not get here'),
      data => {
        assert(data === true)
        assert(executed === true)
      })
  })

  it('should not execute map untill fork is called', () => {
    /**
     * I'm using assignment here because I
     * have to track as a side effect, the
     * map function call.
     */
    let executed = false
    const f = Future((reject, resolve) => {
      executed = true
      resolve(true)
    })

    f.map(a => {
      executed = false
      return a
    })

    assert(!executed, 'should not execute')

    f.fork(
      () => assert(false, 'should not get here'),
      data => {
        assert(data === true)
        assert(executed === true)
      })
  })

  it('should handle promise fulfill', () => {
    const data = { fulfill: true }
    const promise = new Promise((fulfill, reject) => fulfill(data))

    Future.fromPromise(promise).fork(
      () => assert(false, 'promise should have fulfilled'),
      val => assert(val === data))
  })

  it('should handle promise reject', () => {
    const data = { fulfill: false }
    const promise = new Promise((fulfill, reject) => reject(data))
    const f = Future.fromPromise(promise)

    Future.fromPromise(promise).fork(
      val => assert(val === data),
      () => assert(false, 'promise should have rejected'))
  })

  it('should chain futures from promises', () => {
    Future.fromPromise(new Promise((fulfill, reject) => fulfill('1')))
      .chain(data => Future.fromPromise(new Promise((fulfill, reject) => fulfill(data + '2'))))
      .fork(() => assert(false, 'promise should have fulfilled'), val => assert(val === '12'))
  })

  describe('all', () => {
    it('should wait for all fututes to execute', done => {
      Future.all(
        Future.of('apple'),
        Future((left, right) => setTimeout(() => right('orange'), 1000)),
        Future.of('lemon')
      ).fork(
        () => done('something very bad has happened'),
        ([apple, orange, lemon]) =>
          apple === 'apple' && orange === 'orange' && lemon === 'lemon'
            ? done()
            : done(`fruits not are as expected; ${apple}, ${orange}, ${lemon}`))
    })

    it('should fail becuase a future left is called', done => {
      Future.all(
        Future.of('no no no no no'),
        Future(left => setTimeout(() => left('oops'), 500)),
        Future(left => setTimeout(() => left('noo'), 1000))
      ).fork(
        oops => (oops === 'oops' ? done() : done(`${oops} is not oops`)),
        () => done(`oops should not get here`))
    })

    it('should handle an array as arguments', done => {
      Future.all([
        Future.of('apple'),
        Future((left, right) => setTimeout(() => right('orange'), 1000)),
        Future.of('lemon')
      ]).fork(
        () => done('something very bad has happened'),
        ([apple, orange, lemon]) =>
          apple === 'apple' && orange === 'orange' && lemon === 'lemon'
            ? done()
            : done(`fruits not are as expected; ${apple}, ${orange}, ${lemon}`))
    })
  })
})

describe('A Maybe', () => {
  it('assert inspect will return a formatted maybe', () =>
    assert.equal(Maybe('Exalted').inspect(), 'Just(Exalted)'))

  it('assert alt is ignored', () =>
    Maybe('Exalted')
      .map(toUpperCase)
      .alt(() => 'null value')
      .cata({ Right: x => assert(x, 'EXALTED') }))

  it('assert alt is executed', () =>
    Maybe()
      .map(toUpperCase)
      .alt(() => 'null value')
      .map(toUpperCase)
      .cata({ Right: x => assert(x, 'NULL VALUE') }))

  const helloBill = Maybe('Hello Bill')
  const nothing = Maybe()

  describe('with a value', () => {
    it('will be transformed by a map', () =>
      helloBill.map(value => value.length).cata({ Right: x => assert(x === 10) }))

    it('will be transformed by a chain', () =>
      helloBill.chain(() => Maybe('Hello')).cata({ Right: x => assert(x === 'Hello') }))

    it('will be transformed by a map', () =>
      assert(helloBill.map(() => 'Hello').cata({ Right: x => x === 'Hello' })))

    it('will be transformed by a chain', () =>
      assert(helloBill.chain(() => Maybe('Hello')).cata(fid) === 'Hello'))

    it('will return the value when alt() is called', () => {
      assert(helloBill.alt(() => 'no no!').cata(fid) === 'Hello Bill')
      assert(helloBill.alt(() => 'no no!').cata(fid) === 'Hello Bill')
    })

    it('will return the first monad on alt', () =>
      helloBill.alt(() => undefined).cata({ Right: x => assert(x === 'Hello Bill') }))
  })

  describe('complies with FantasyLand spec for', () => {
    it("'of'", () =>
      Maybe()
        .of('hello')
        .cata({ Right: x => assert(x === 'hello') }))

    it("'chain'", () => {
      Maybe('a')
        .of('hello')
        .chain(a => Maybe().of(`${a} world`))
        .cata({ Right: x => assert(x === 'hello world') })
    })
  })

  describe('as a Setoid', () => {
    const a = Maybe(2)
    const b = Maybe(2)
    const c = Maybe(2)

    it('should equal another right of the same value (reflexivity)', () =>
      assert.equal(a.equals(a), true))

    it('should equal the result of another equal (symmetry)', () =>
      assert.equal(a.equals(b), b.equals(a)))

    it('should equal the result of another equal (transitivity)', () =>
      assert.equal((a.equals(b) === b.equals(c)) === a.equals(c), true))
  })

  describe('as a applicative', () => {
    const add = a => b => a + b
    const mul = a => b => a * b
    const a = Maybe(mul(10))
    const u = Maybe(add(7))
    const v = Maybe(10)

    it('is an Apply', () =>
      assert.deepEqual(
        v.ap(u.ap(a.map(f => g => x => f(g(x))))).inspect(),
        v
          .ap(u)
          .ap(a)
          .inspect()))

    it('is an Apply solves to 170', () =>
      assert.deepEqual(v.ap(u.ap(a.map(f => g => x => f(g(x))))).cata(fid), 170))

    it('is an Apply solves to 170', () =>
      assert.deepEqual(
        v
          .ap(u)
          .ap(a)
          .cata(fid),
        170
      ))

    it('is an Applicative identity', () =>
      assert.equal(v.ap(Maybe.of(x => x)).inspect(), v.inspect()))

    it('is an Applicative homomorphism', () =>
      assert.equal(
        Maybe.of(10)
          .ap(Maybe.of(add(78)))
          .inspect(),
        Maybe.of(add(78)(10)).inspect()))

    it('is an Applicative interchange', () =>
      assert.equal(
        Maybe.of(10)
          .ap(u)
          .inspect(),
        u.ap(Maybe.of(f => f(10))).inspect()))
  })

  describe('cata', () => {
    it('will call Right on object', () =>
      Right('hello bill').cata({ Right: x => assert(x === 'hello bill') }))

    it('will call Left on object', () => Left('asdasdasd').cata({ Left: () => assert(true) }))
  })
})

describe('A Either', () => {
  it('should not call the map function when created from nullable', () => (
    nullable(null)
      .map(() => assert(false))
      .map(() => assert(false))
      .map(() => assert(true)),
    undefined
  ))

  it('should return x with code 200', () =>
    nullable({ ok: true, code: 200, body: 'yay!' }).cata({
      Left: x => x,
      Right: x => assert.equal(x.code, 200)
    }))

  it('should cata left', () =>
    nullable(null).cata({
      Left: x => assert.equal(x, null),
      Right: () => assert(false)
    }))

  it('should build right', () => assert.equal(Right('Exalted').inspect(), 'Right(Exalted)'))

  it('should build left', () => assert.equal(Left('Exalted').inspect(), 'Left(Exalted)'))

  it('should default cata right to identity', () =>
    assert.equal(nullable('identity').cata(lrid), 'identity'))

  it('should default cata left to identity', () => assert.equal(nullable(null).cata(lrid), null))

  describe('as a Setoid', () => {
    const rightA = Right(2)
    const rightB = Right(2)
    const rightC = Right(2)

    it('should equal another right of the same value (reflexivity)', () =>
      assert.equal(rightA.equals(rightA), true))

    it('should equal the result of another equal (symmetry)', () =>
      assert.equal(rightA.equals(rightB), rightB.equals(rightA)))

    it('should equal the result of another equal (transitivity)', () =>
      assert.equal(
        (rightA.equals(rightB) === rightB.equals(rightC)) === rightA.equals(rightC),
        true
      ))

    const leftA = Left(2)
    const leftB = Left(2)
    const leftC = Left(2)

    it('should equal another left of the same value (reflexivity)', () =>
      assert.equal(leftA.equals(leftA), true))

    it('should equal the result of another equal (symmetry)', () =>
      assert.equal(leftA.equals(leftB), leftB.equals(leftA)))

    it('should equal the result of another equal (transitivity)', () =>
      assert.strictEqual(
        (leftA.equals(leftB) === leftB.equals(leftC)) === rightA.equals(leftC),
        true
      ))
  })

  describe('as a Right and as a applicative', () => {
    const add = a => b => a + b
    const mul = a => b => a * b
    const a = Right(mul(10))
    const u = Right(add(7))
    const v = Right(10)

    it('is an Apply', () =>
      assert.deepStrictEqual(
        v.ap(u.ap(a.map(f => g => x => f && f(g(x))))).inspect(),
        v
          .ap(u)
          .ap(a)
          .inspect()))

    it('is an Apply solves to 170 a', () =>
      assert.deepStrictEqual(v.ap(u.ap(a.map(f => g => x => f && f(g(x))))).cata(fid), 170))

    it('is an Apply solves to 170 b', () =>
      assert.deepStrictEqual(
        v
          .ap(u)
          .ap(a)
          .cata(fid),
        170
      ))

    it('is an Applicative identity', () =>
      assert.equal(v.ap(Right.of(x => x)).inspect(), v.inspect()))

    it('is an Applicative homomorphism', () =>
      assert.equal(
        Right.of(10)
          .ap(Right.of(add(78)))
          .inspect(),
        Right.of(add(78)(10)).inspect()))

    it('is an Applicative interchange', () =>
      assert.equal(
        Right.of(10)
          .ap(u)
          .inspect(),
        u.ap(Right.of(f => f(10))).inspect()))
  })

  describe('get', () => {
    it('gets a number', () =>
      assert.strictEqual(
        get('apple', 'orange', 'potato', 0)({ apple: { orange: { potato: [1] } } }).inspect(),
        `Just(1)`
      ))

    it('gets nothing', () =>
      assert.strictEqual(
        get('apple', 'orange', 'potato', 0)({ apple: { orange: { pota2to: [1] } } }).inspect(),
        `Nothing()`
      ))

    it('gets an array', () =>
      assert.strictEqual(
        get('apple', 1, 'microsoft')({ apple: ['not', { microsoft: [1, 2, 3, 4] }] }).inspect(),
        `Just(1,2,3,4)`
      ))
  })
})
