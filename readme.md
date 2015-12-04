# datamining
[![Build Status][travis-image]][travis-url]
[![Coveralls Status][coveralls-image]][coveralls-url]
[![Dependency Status][depstat-image]][depstat-url]

> Description

## Installation

```
These scripts have been tested on unix environments and found to function fine
Install phantomjs if you dont have it on your computer and make sure its available
as an environment variable 

'$ npm install --save datamining'
or run  '$ npm link'  if you are in dev mode within the repo directory

```

## Usage
```
Before you can start mining facebook, please first login so that we can have access
to a facebook login cook.

'$ login <email> <password>' eg '$ login allan@gmail.com myawesommepassword'

this repo contains command line utilities for data mining
run $ topic <args> to get facebook topic data forexample
'$ topic museveni uganda' will get you museveni json topic data on museveni this 
operation will take a while  to execute look at the set time out variables to adjust the time
duraion in the src/facebook/topic.js file.
run $ pages <args> to get data on a page forexample '$ pages MTNUG' gets you mtn's facebook page
data

if you are running these scripts on windows please note we are using unix shebangs at the top of 
the scripts which tell the parent shell which interpreter should be used to execute the script 
I am not sure of the windows eqivalents, please switch them up accordinfly with the windows eqivalent

```
## Todo
- need to expose the set time out variables as command line args, for now they are the optimal values
  after many tests.
- need to write tests
- the facbook code has repitions
- set up npm build and linting scripts
- set up travis

## API
### $ login <email> <password>
### $ topic <search_term>
### $ pages <page_name>
Description

#### Parameters
-**strings** email and password : enter your facebook login details
- **strings** `search_term`: a string of search terms eg mtn uganda
- **string** `page_name`: a page name eg MTNUG

#### Return
- **JSON** - Json file with data is returned with time stap in the data folder

## License
MIT © [Allan](http://github.com/epicallan)

[travis-url]: https://travis-ci.org/epicallan/datamining
[travis-image]: https://img.shields.io/travis/epicallan/datamining.svg?style=flat-square

[coveralls-url]: https://coveralls.io/r/epicallan/datamining
[coveralls-image]: https://img.shields.io/coveralls/epicallan/datamining.svg?style=flat-square

[depstat-url]: https://david-dm.org/epicallan/datamining
[depstat-image]: https://david-dm.org/epicallan/datamining.svg?style=flat-square
