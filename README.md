# kPromise
kPromise is a wrapper library around JavaScript promises. It was written to conform to my personal preferences and whims for the projects I was working on at the time. Your mileage may vary *extremely*.

## Getting Started

Published to NPM for ease. You know how it goes; first, just:
```bash
npm install --save kpromise
```

Just import and use the functions you want.
```javascript
const k = require('kpromise');
const startWith = k.startWith;
const get = k.get;
const forEach = k.forEach;
const print = K.print;
//... and so on...

startWith([
    {name: "letters", contents: ["a","b"]},
    {name: "numbers", contents: ["1", "2"]}])
    .then(forEach(item =>
        startWith(item)
            .then(print(`Starting upload for ${item.name}`))
            .then(get('contents'))
            .then(forEach(upload))
            .then(print(`Completed upload for ${item.name}`))
    ))
;

```

## Running the tests

Tests are written in [jest](https://facebook.github.io/jest/) and can be run via npm:
```bash
npm test
```

There's also a [Wallaby](https://wallabyjs.com/) config in the project for others who spend too much money on such things.

## Versioning or lack thereof

I use [SemVer](http://semver.org/) for versioning, but I also don't pay too much attention to it, so tread carefully. For the versions available, see the [releases page](https://github.com/kengeorge/kPromise/releases).

## Who to blame

* [Ken George](https://github.com/kengeorge)
* [Other Contributors](https://github.com/kengeorge/kPromise/graphs/contributors)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
