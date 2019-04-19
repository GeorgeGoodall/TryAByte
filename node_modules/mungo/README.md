Mungo
===

`Mungo` is a library to create models for MongoDB.

# Install

```bash
npm install mungo
```

# Usage

```js
import Mungo from 'mungo';

class User extends Mungo.Model {
  static schema = { username : String };
}

// Connect to MongoDB
Mungo.connect('mongodb://@localhost');

User.create({ username : 'dude' });

User.find({ username : 'dude' });

User.update({ username : 'dude' }, { username : 'mate' });

User.remove({ username : 'dude' });
```

# Syntax

All operations are promises:

```js
Foo.find()
  .then(found => { /*...*/ })
  .catch(error => { /*...*/ });
```

Some methods are chainable:

```js
Foo
  .find({ foo : 1 })
  .limit(25)
  .then(found => {});
```

# Connect

```js
Mungo.connect(url);
```

Connecting by entering an url. Connect emits so you can listen to it:

```js
Mungo.connect(url)
  .on('error', error => console.log(error.stack))
  .on('connected', connection => {
    console.log(connection.db)
  });
```

Connections are stacked in `Mungo.connections`. When you try to do a op, the first alive connection in array will be chosen.

You can force a connection to be used:

```js
Mungo.connect(url1);
Mungo.connect(url2);

Foo.find().connection(0);
Foo2.find().connection(1);
```

Or specify the connection directly:

```js
Mungo
  .connect(url)
  .on('connected', connection => Foo.find().connection(connection));
```

# Methods

| Method | Arguments | About |
|--------|-----------|-------|
| `count`| - `<object> query` default `{}`<br/>- `<object> projection` default `{}` <br/>- `<object> options` default `{}`| Count documents in collection


# Schema

## Type

```js
class User extends Mungo.Model {
  static schema = { username : String, score : Number };
}
```

### Types allowed

- `String`
- `Number`
- `Boolean`
- `Date`
- `Array` *for a better array control, see below*
- `Object` *for a better subdocument control, see below*
- `Subdocument` *see below*
- `ObjectID` *MongoDB's object id*
- `Mixed` *accepts any type*

### Array of types

You can enclose types inside arrays:

```js
// { numbers : [1, 2, 3] }

static schema = { numbers : [Number] }
```

### Sudocuments

Use the `Subdocument` to embed a document:

```js
// { foo : { bar : true } }

static schema = { "foo" : new (Mungo.Subdocument)({ "bar" : Boolean }) }
```

You could also use directly the object notation such as:

```js
// { foo : { bar : true } }

static schema = { "foo" : { "bar" : Boolean } }
```

But **you have to make sure your subdocument does not contain a `type` property** - otherwise it will be mistaken with a field description.

### References to other model

Use the name of the model you want to refer :

```js
class Team extends Mungo.Model {
  static schema = { "name" : String };
}

class Player extends Mungo.Model {
  static schema = { "team" : Team };
}
```

### Cyclic dependencies

If your model uses references to other models that also refer it (cyclic dependency), you can use the getter syntax to make sure referred models do not end up null.

```js
static get schema () {
  return { "team" : Team };
}
```

### Type declaration

You can use the sugar syntax or the type attribute in the field description:

```js
static schema = { "name" : String }
// Or...
static schema = {
  name : { "type" : String }
}
```

### Default type

If you don't declare a type for a field, `Mixed` is used.

## Required

Require a fill to be set when inserting to DB

```js
static schema = { "name" : { required : true } }
```

## Default

Fill empty field values with default when inserting to DB

```js
static schema = { "score" : { default : 0 } }
```
