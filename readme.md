# datamining
[![Build Status][travis-image]][travis-url]
[![Coveralls Status][coveralls-image]][coveralls-url]
[![Dependency Status][depstat-image]][depstat-url]

> Description

## Installation

```
$ npm install --save datamining
or run  '$ npm link'  if you are in dev mode
```

## Usage
```
this repo contains command line utilities
run $ topic [args] to get facebook topic data forexample
'$ topic museveni uganda' will get you museveni topic data, the data will be 
placed in the data folder, this operation wwill take a while look at the set time 
out variable to adjust the time for which we do the data mining
run $ pages [args] to get data on a page forexample $ pages MTNUG gets you mtn's facebook
data

```
## Todo
- need to expose the time out variables as command line args, for now they are the optimal values
after many tests.
- need to write tests
- the facbook code has repitions
- set up npm build and linting scripts
- set up travis

## API

### `dataMining(data, [options])`
Description

#### Parameters
- **Array** `data`: An array of data
- **Object** `options`: An object containing the following fields:

#### Return
- **Array** - Result

## License
MIT © [Allan](http://github.com/epicallan)

[travis-url]: https://travis-ci.org/epicallan/datamining
[travis-image]: https://img.shields.io/travis/epicallan/datamining.svg?style=flat-square

[coveralls-url]: https://coveralls.io/r/epicallan/datamining
[coveralls-image]: https://img.shields.io/coveralls/epicallan/datamining.svg?style=flat-square

[depstat-url]: https://david-dm.org/epicallan/datamining
[depstat-image]: https://david-dm.org/epicallan/datamining.svg?style=flat-square
