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
*default: '.tpl'*  
only the files with this extension will be cached

### recursive
*default: false*
the program will cache the files in all subpaths when this option is true.    

### autocrlf
*default: true*  
auto convert the crlf (windows mode) to lf (linux mode)  

### slim
*default: false*  
cleaning the **indents** and **line feeds** in the files.  
It's useful for simplifing the content.  

**tip: You can type ``\n`` when you need a line feed with slim mode.**

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

the value of ``cache.require('example')`` with **slim**:
```
<% if (foo) { %>foo<% if (bar) { %>bar\n<% } %><% } %><% if (baz) { %>baz<% } %>
```

#### Why slim
render example.tpl without slim mode:
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

render example.tpl with slim mode:
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

If you want to get the same result as above one without slim mode, you should write a example.tpl like it:
```
<%
if (foo) { 
  %>foo<%
  if (bar) {
    %>bar\n<%
  } %><%
} %><%
if (baz) {
  %>baz<%
} %>
```
What a suffering!


### engine
*default: null*  
``engine`` should be the compile method of the template render engine like artTemplate, ejs, handlebars and so on.  
If you keep this value null, the ``require`` method will return the origin content.  
Here is a simple example:  

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
The ``load`` method should be called once at least before the app launch.

### require(filename)
The ``require`` method will return the origin content without ``options.engine``, otherwise return the compiled template rendering function.

### clear()
clear cache

### refresh()
refresh the cache

### toJSON()
return a json style object which has key that means filename and value means content

### namespace(ns)
``namespace`` method allow you cache different groups of templates by returning a new cache box  
example:
```
var cache = require('template-cache');
cache.namespace('yelo').load('./tpl');
console.log(cache.namespace('yelo').require('example')({foo: true, bar: true, baz: true}));

var tests = cache.namespace('test');
tests.loda('./test/tpl');
console.log(test.require('foobar')({foo: bar}));
```

## LICENSE
the MIT license