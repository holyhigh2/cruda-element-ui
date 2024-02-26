# cruda-element-ui
A Cruda adapter for element-ui.

## Demo
- [element-ui](https://stackblitz.com/edit/cruda-element-ui?file=src%2FApp.vue)

## Usage
### 1. Install
```js
// Usually init cruda in main.js
import request from 'axios'
import CRUD from 'cruda-element-ui'
// set requester
Vue.use(CRUD, { request: request })
```
### 2. Activate
- Options mode
```js
// Add crud/cruds(Multi-instance) tag into root of the vue
export default {
  crud: 'auth/users',
  // crud: {url:'auth/users'} object way
  mounted() {
    // The Cruda instance called '$crud' will be injected after activation 
    this.$crud.reload()
    // And a entry flag you can use to confirm if the crud entry is
    this.$isCrudEntry
  }
  ...
}
```

You can pass custom parameters to Cruda besides the URL when you activate it in object form. Such as below
```js
export default {
  crud: {url:'auth/users',permission:'a_b_c'}
  ...
}
```

then you can read it via `params`

```js
this.$crud.params.permission
```

that's very useful if you want to do additional UI control like Auth

- API mode
```js
const $crud = useCrud(vm, restURLMap)
```
### 3. Multi-instance
- Options mode
```js
export default {
  cruds: {//Note: it's 'cruds' not 'crud'
    user: '/api/users',// user: {url:'/api/users'} object way
    log: '/api/logs'
  },
  mounted() {
    //Note: it's '$cruds' not '$crud'
    this.$cruds.user.reload()
  }
  ...
}
```
- API mode
```js
const $cruds = useCruds(vm, restURL)
```
### 4. HOOKs
```js
import CRUD from 'cruda-element-ui'
export default {
  crud: '/api/users',
  methods:{
    [CRUD.HOOK.AFTER_QUERY](crud, rs) {
      crud.pagination.total = rs.data.total
      crud.table.data = rs.data.records || []
    }
  }
  ...
  onMounted(){
    //Add an extra hook
    onHook(this,CRUD.HOOK.AFTER_QUERY,(crud, rs)=>{...})
  }
}
```
### 5. CRUD component
The first thing you create a CRUD component is to get `$crud`. Use `lookUpCrud()` to get that then you can do other business like do queries, toggle views and so on

```html
<!--
   toggle show/hidden via $crud.view
   toggle loading via $crud.loading
   do query via $crud.query
-->
<template>
  <div v-show="$crud.view.queryShow" class="...">
    <slot />
    <el-button
      class="..."
      :loading="$crud.loading.query"
      @click="$crud.reload()"
      >查询</el-button
    >
    <el-button v-if="$crud.view.queryReset" class="..." @click="reset()"
      >重置</el-button
    >
  </div>
</template>
<script>
  import CRUD, { lookUpCrud } from 'cruda-element-ui'
  import { each } from '@holyhigh/func.js/collection'

  export default {
    beforeCreate() {
      //Get $crud of the page
      this.$crud = lookUpCrud(this)
    },
    methods: {
      reset() {
        each(this.$crud.query, (v, k) => {
          this.$crud.query[k] = this.$crud.defaults.query[k]
          this.$crud.reload()
        })
      },
      //This hook will register automaticly when 'lookUpCrud' method invoded
      [CRUD.HOOK.AFTER_QUERY](crud, rs) {
        ...
      }
    },
  }
</script>
```
### 6. URL params
Cruda supports URL param by **`:varName`** which makes you can build dynamic URLs. See below 

```js
//param 'orgId' is used in 'user' instance
export default {
  cruds: {
    org: '/api/orgs',
    user: '/api/orgs/:orgId/users'
  },
  ...
  methods:{
    //fill the param
    setOrg(orgId){
      this.$cruds.user.setURLParams({orgId})
      this.$cruds.user.toQuery()
    }
  }
}
```

## Exportable

```js
import CRUD,{...} from 'cruda-element-ui'
```

- CRUD 
  > crud namespace, can bind global defaults, hooks
- useCrud(vm, restURL) : CRUD
  > return a single instance 
- useCruds(vm, restURLMap) : Record<string, CRUD>
  > return a multi instance map 
- lookUpCrud(vm, crudName?) : CRUD | null
  > look up the nearest crud instance then return
- onHook(vm,hookName,hook) : ()=>void
  > add an extra hook

## Cruda
CRUD API please to [Cruda](https://github.com/holyhigh2/cruda)
