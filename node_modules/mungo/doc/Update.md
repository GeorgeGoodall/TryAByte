# Update

## Update by ids

    Model.updateByIds([ObjectID], {Setter}, {options});

Shortcut to update documents identified by an **array of _ids**

```js
Model
  .updateByIds([id1, id2, id3], { foo : 'barz' })
  .then(documents => {}, error => {});
```
