# vue-element-table

> A simple, customizable and pageable table, based on vue2 and element-ui@2.x.

[中文文档](README.CN.md)

## Install

```bash
yarn add @spring/vue-element-table
```

## Usage

### Fully import

In main.js:

```js
import VeTable from '@spring/vue-element-table'
import '@spring/vue-element-table/dist/VeTable.css';

Vue.use(VeTable);
```

The above imports Element entirely. Note that CSS file needs to be imported separately.

Now, just use it:

```vue
<ve-table :data="data"></ve-table>

<ve-table-sync :http-request="request"></ve-table-sync>

<ve-tree-table :data="data"></ve-tree-table>
```

### On demand

<b>Todo.</b>

## Dev Setup

``` bash

# install dependencies
yarn

# build for production with minification
yarn run build

# run eslint and fix code style
npm run lint

# run all tests
yarn run test

```

For a detailed explanation on how things work, contact us <www.389055604@qq.com>.
