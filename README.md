![](https://badgen.net/bundlephobia/minzip/exalted.future)
![](https://badgen.net/bundlephobia/tree-shaking/exalted.future)
![](https://badgen.net/bundlephobia/dependency-count/exalted.future)

*Experimental The api can change between versions.*

# exalted.future

A javascript monadic library & functional fun. [fantasy-land](https://github.com/fantasyland/fantasy-land) compliant, mostly.

The style of monad object is inspired by [DrBoolean](https://github.com/DrBoolean) course on [egghead.io](https://egghead.io/courses/professor-frisby-introduces-composable-functional-javascript) and his book [Mostly adequate guide to FP](https://github.com/MostlyAdequate/mostly-adequate-guide).

The choice for `cata`, `encase`, `head`, `tail`, `last` is inspired by rametta's take on monads in [pratica](https://github.com/rametta/pratica).

This is, in many ways, an evolution of [oncha](https://www.npmjs.com/package/oncha) which I wrote with other people many years ago and is no longer maintained.

# Natural Transformation
One of the main goals of the exalted.future is to make it possible to rely on natural transformation when composing Monads. So that you can write in one continuous flow your program, agnostic of the Monad you are working with. That is why `flatMap`, `mapReduce`, `reduce`, `fold`, and `fork` use the same language, `cata`. You can always call cata on an object, and it will compute your results. The following example attempts to illustrate that. Regardless that the fetch succeeds or fails the outcome will be the same, indifferent to calling `cata` on Maybe, Either (Left|Right), or Future.
```javascript
Future.promise(fetch('https://jsonplaceholder.typicode.com/todos/1'))
  .chain(response => Either.encase(() => response.json()))
  .chain(Future.promise)
  .chain(Maybe)
  .map(todo => todo.title)
  .map(t => t.toUpperCase())
  .cata({
    Left: e => console.log('oops', e),
    Right: json => console.log(json)
  })
```

# Install
``` bash
yarn add exalted.future
```

# Types

| Name              | [Apply][8]   | [Applicative][4] | [Setoid][1]  | [Foldable][6]| [Functor][3] | [Monad][5] | [Chain][7]    |
| ----------------- | :----------: | :--------------: | :----------: | :----------: | :----------: | :--------: | :-----------: |
| [Either](#either) |    **✔︎**     |      **✔︎**       |    **✔︎**     |     **✔︎**    |     **✔︎**    |   **✔︎**    |     **✔︎**     |
| [Future](#future) |    **✔︎**     |        —         |    **✔︎**     |     **✔︎**    |     **✔︎**    |     —      |     **✔︎**     |
| [Identity](#id)   |    **✔︎**     |      **✔︎**       |    **✔︎**     |     **✔︎**    |     **✔︎**    |   **✔︎**    |     **✔︎**     |
| [Maybe](#maybe)   |    **✔︎**     |      **✔︎**       |    **✔︎**     |     **✔︎**    |     **✔︎**    |   **✔︎**    |     **✔︎**     |

* There is a divergence from fantasy-land where `reduce` is named `cata` and loosely based on [daggy](https://github.com/fantasyland/daggy)'s union types.
* `fold` always folds on identity `a => a`, except when it does not like with the `Future`.
* `Maybe.map` will return Nothing if the callback function returns null. In other words `Just(null)` is impossible, unless you call the 'static' constructor like this `Just.of(null)`. See [this pr](https://github.com/rametta/pratica/issues/15) for some explanation.
* Left is not 100% applicative.
* Not all functions are documented, so you are encouraged to read the source code, you'll find `bimap`, `swap`, `fold`, `foldr`, `foldf`.


## Future
A Future monad for async computation. `Left` is reject and `Right` is resolve. Because `Right` is always right and Left is not.

``` javascript
// Basic usage
Future((err, ok) => ok('Yay'))
  .map(res => res.toUpperString())
  .cata({
    Left: err => log(`Err: ${err}`),
    Right: res => log(`Res: ${res}`)
  })
//=> 'YAY'

// Handle promises
Future.promise(fetch('https://api.awesome.com/catOfTheDay'))
  .cata({
    Left: err => log('There was an error fetching the cat of the day :('),
    Right: cat => log('Cat of the day: ' + cat)
  })
//=> 'Cat of the day: Garfield'

// Chain http calls
Future.promise(fetch('https://api.awesome.com/catOfTheDay'))
  .chain(cat => Future.promise(fetch(`https://api.catfacts.com/${cat}`)))
  .cata({
    Left: err => log('There was an error fetching the cat of the day :('),
    Right: facts => log('Facts for cat of the day: ' + facts)
  })
//=> 'Facts for cat of the day: Garfield is awesome.'
```

### Future.all
Concats all the results form the list of futures.
```
all :: ([Futures]) -> b
```
```javascript
Future.all(
  Future.of('apple'),
  Future((left, right) => setTimeout(() => right('orange'), 1000)),
  Future.of('lemon')
).cata({
    Left: () => (),
    Right: ([ apple, orange, lemon ]) => console.log(apple, orange, lemon)
  }) //=> apple, orange, lemon
```

## Id
Identity monad.

``` javascript
Id(5)
  .map(num => num * 7)
  .map(num => num - 1)
  .cata({
    Right: a => a
  })
//=> 34
```

## Maybe
Maybe monad.

``` javascript
// Maybe of a string
Maybe('Hello exalted one')
  .map(sentence => sentence.toUpperString())
  .map(sentence => `${sentence}!`)
  .cata({
    Right: console.log
  })
//=> 'HELLO EXALTED ONE!'

// Maybe of nothing
Maybe(null)
  .map(sentence => sentence.toUpperString())
  .alt(() => 'Maybe received a null')
  .cata({
    Right: console.log
  })
//=> 'Maybe received a null'
```

## Either
An Either monad and nullable, Left, Right.

``` javascript
nullable('Hello') // this will return a Right('Hello')
  .cata({
    Left: () => 'Oops',
    Right: val => `${val} world!`
  })
//=> 'Hello world!'

nullable(null) // this will return a Left()
  .cata({
    Left: () => 'Oops',
    Right: val => `${val} world!`
  })
//=> 'Oops'

const extractEmail = obj => obj.email ? Right(obj.email) : Left()
extractEmail({ email: 'test@example.com' }
  .map(extractDomain)
  .cata({
    Left: () => 'No email found!',
    Right:x => x
  })
//=> 'example.com'

extractEmail({ name: 'user' }
  .map(extractDomain) // this will not get executed
  .cata({
    Left: () => 'No email found!',
    Right: x => x
  })
//=> 'No email found!'
```

# Functions
The following functions are common to all monads types.

### alt
Sets the value to cata on.
```
alt :: Any -> Nothing of Any
```
```javascript
Maybe(1).alt(5).cata({
    Right: a => a
  })
//=> 1

Maybe(null).alt(5).cata({
    Right: a => a
  })
//=> 5
```

### ap
[Apply][8]
```
chain :: (a -> b) -> b
```
```javascript
Id(5).chain(a => Id(a))
//=> Id(5)

// You can use chain to join the monads.
Id(Id(5)).chain(a => a)
//=> Id(5)
```

### cata
[Foldable][6]
```
cata :: ({ Left: () -> b, Right -> a -> a }) -> a | b
```
```javascript
Id(5).cata({
    Right: a => a
  })
//=> 5

Id(5).cata({
    Right: a => a + 1
  })
//=> 6

Right(5).cata({
    Left: a => 8 // ignored 
    Right: a => a + 1
  })
//=> 6

Left(5).cata({
    Left: a => a + 1 
    Right: a => 8 // ignored
  })
//=> 6

Maybe(5).cata({
    Right: a => a
  })
//=> 5

Maybe(5).cata({
    Left: () => { } // not called
    Right: a => a + 1
  })
//=> 6

Maybe(null).cata({
    Left: () => 'there was a null'
    Right: a => a + 1 // not called
  })
//=> there was a null

Right(5).cata({
    Left: () => 1,
    Right: a => a + 2
  })
//=> 7

Left(5).cata(a => a + 1)
//=> 6
```

### chain
[Chain][7]
```
chain :: (a -> b) -> b
```
```javascript
Id(5).chain(a => Id(a))
//=> Id(5)

// You can use chain to join the monads.
Id(Id(5)).chain(a => a)
//=> Id(5)
```

### compose
Compose takes n functions as arguments and return a function.

``` javascript
const transform = compose(sentence => sentence.toUpperString(), sentence => `${sentence}!`)
const logTransform = compose(log, transform)

logTransform('Hello exalted one')
//=> 'HELLO EXALTED ONE!'

// supports miltiple arguments
compose(path.normalize, path.join)('./exalted', '/one')
//=> './exalted/one'
```

### equals
[Setoid][1]
```
equals :: Id -> Boolean
```
```javascript
Id(1).equals(Id(1))
//=> true

Id(2).equals(Id(1))
//=> false

Id(2).equals(Id(1)) === Id(1).equals(Id(1))
//=> false
```

### inspect
```
inspect :: () -> String
```
```javascript
Id(5).inspect()
//=> Id(5)
```

### map
[Functor][3]
```
map :: (a -> b) -> Id of b
```
```javascript
Id(7).map(a => a * 2)
//=> Id(14)
```

### map (first class)
Map as partial application and first class with arity support.

``` javascript
map(a => a + 1, a => a * 3)([1, 2, 3])
//=> [4, 7, 10]
```

### of
[Applicative][4]
```
of :: a -> Id of a
```
```javascript
Id(5).of(6)
//=> Id(6)

Id(5).of(Id(6))
//=> Id(Id(6))
```

### head, tail, last
Returns a Maybe.
``` javascript
head([1,2])
//=> Just(1)

head([])
//=> Nothing()

tail([1,2,3])
//=> Just([2,3])

tail([])
//=> Nothing()

last([1,2,3])
//=> Just(3)

last([])
//=> Nothing()
```

### Maybe.encase, Either.encase
Returns `Left | Right`.
``` javascript
Maybe.encase(() => JSON.parse('["foo","bar","baz"]'))
//=> Just(['foo','bar','baz'])

Maybe.encase(() => JSON.parse('['))
//=> Nothing()

Either.encase(() => JSON.parse('["foo","bar","baz"]'))
//=> Right(['foo','bar','baz'])

Either.encase(() => JSON.parse('['))
//=> Left(new SyntaxError ('Unexpected end of JSON input'))
```

[1]: https://github.com/fantasyland/fantasy-land#setoid
[2]: https://github.com/fantasyland/fantasy-land#semigroup
[3]: https://github.com/fantasyland/fantasy-land#functor
[4]: https://github.com/fantasyland/fantasy-land#applicative
[5]: https://github.com/fantasyland/fantasy-land#monad
[6]: https://github.com/fantasyland/fantasy-land#foldable
[7]: https://github.com/fantasyland/fantasy-land#chain
[8]: https://github.com/fantasyland/fantasy-land#apply
