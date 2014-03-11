# template-cache
cache template files in memory

## Example
files:
```
- app
  - controller
    - ...
  - action
    - ...
  - view
    - foo.js
    - ...
  - tpl
    - foo.tpl
    - bar.tpl
    - ...
  - app.js
  - ...
- ...
```

app/app.js
```
var connect = require('connect');
var app = connect();
var path = require('path');
var templateCache = require('template-cache');
var artTemplate = require('art-template');

// cache template files
templateCache.load(path.join(__dirname, './tpl'), {
  slim: true,
  autocrlf: true,
  extension: '.tpl',
  engine: artTemplate.compile
});

require('./route)(app);

http.createServer(app).listen(3000);
```

app/view/foo.js
```
var template = require('template-cache');
module.exports = function (req, res, next) {
  ...
  var data = {
    somekey: 'somevalue'
  };
  // render the template
  var content = template.require('bar')(data);
  ...
};
```

## Options
the ``load`` method can be set with these options.
### extension
defaults: '.tpl'  
the extension of the files  

### autocrlf
defaults: true  
auto convert the crlf to lf (linux mode)  

### slim
defaults: false  

example.tpl:
```
<% if (foo) { %>
  foo
  <% if (bar) { %>
    bar\n
  <% } %>
<% } %>
<% if (baz) { %>
  baz
<% } %>
```

the value of ``cache.require('example')`` when ``options.slim`` is true:
```
<% if (foo) { %>foo<% if (bar) { %>bar\n<% } %><% } %><% if (baz) { %>baz<% } %>
```

#### Why slim
render without slim:
```
var cache = require('template-cache');
cache.load('./tpl');
console.log(compile(cache.require('example'))({foo: true, bar: true, baz: true});
```
output:
```
  foo
    bar\n
  baz
```

render with slim:
```
var cache = require('template-cache');
cache.load('./tpl', {slim: true});
console.log(compile(cache.require('example'))({foo: true, bar: true, baz: true});
```
output:
```
foobar
baz
```

### engine
defaults: null  
``engine`` should be the compile method of template render engine like artTemplate, ejs, handlebars and so on.  
Or the ``require`` method will return the origin content.

without options.engine:
```
var cache = require('template-cache');
var artTemplate = require('art-template');
cache.load('./tpl');
return artTemplate.compile(cache.require('example'))({foo: true, bar: true, baz: true});
```
with options.engine:
```
var cache = require('template-cache');
var artTemplate = require('art-template');
cache.load('./tpl', {engine: artTemplate.compile});
return cache.require('example'))({foo: true, bar: true, baz: true});
```
they will return the same result.

## Method
### load(basepath, options)
The ``load`` method should be called once before the app start.
### require(filename)

### clear()

### refresh()

### toJSON()