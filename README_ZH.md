# cruda-element-ui
Cruda element-ui适配器。

## Demo
- [element-ui](https://stackblitz.com/edit/cruda-element-ui?file=src%2FApp.vue)

## 使用
### 1. 安装
```js
// 安装CRUD
import request from 'axios'
import CRUD from 'cruda-element-ui'
// 通常request总是会使用封装后的axios实例
Vue.use(CRUD, { request: request })
```
### 2. 激活
- Options方式
```js
//在vue对象的根属性中标记crud/cruds(多实例)属性
export default {
  crud: 'auth/users',
  // crud: {url:'auth/users'} 对象方式
  mounted() {
    // 激活后业务组件会被注入一个名为“$crud”的CRUD实例
    this.$crud.reload()
    // 以及一个入口标识。标识可以用于区分入口或自定义组件
    this.$isCrudEntry
  }
  ...
}
```

通过对象方式激活 CRUD 时，可以传递除 url及其他内置属性 外的其他自定义参数。比如

```js
export default {
  crud: {url:'auth/users',permission:'a_b_c'}
  ...
}
```
> 其他内置属性包括
> - query
> - restApi
> - autoResponse 

之后可通过 VM 属性`params`(read only)来获取激活参数

```js
this.$crud.params.permission
```

params 参数在创建自定义 CRUD 组件时非常有用，比如通过 permission 参数可以实现组件自动权限管理，控制组件视图展示

- API方式
```js
// 使用useCrud动态创建crud实例
const $crud = useCrud(vm, restURLMap)
```
### 3. 多实例
- Options方式
```js
//在一个页面上需要同时处理多CRUD业务时可以通过修改激活方式来处理
export default {
  cruds: {//注意，激活标识与单实例不同，多了一个 "s"
    user: '/api/users',// user: {url:'/api/users'} 对象方式
    log: '/api/logs'
  },
  mounted() {
    // 多实例激活时注入变量会变成“$cruds”,且必须通过明确的实例标识来调用API
    this.$cruds.user.reload()
  }
  ...
}
```
- API方式
```js
//element-ui 也可以使用userCruds动态创建cruds实例
const $cruds = useCruds(vm, restURL)
```
### 4. HOOK
```js
//CRUD提供多种回调钩子以满足不同的业务场景
import CRUD,{onHook} from 'cruda-element-ui'

export default {
  crud: '/api/users',
  methods:{
    [CRUD.HOOK.AFTER_QUERY](crud, rs) {
	  //根据查询结果设置分页值与表格数据
      crud.pagination.total = rs.data.total
      crud.table.data = rs.data.records || []
    }
  }
  ...
  onMounted(){
    //添加额外钩子
    onHook(this,CRUD.HOOK.AFTER_QUERY,(crud, rs)=>{...})
  }
}
```
### 5. 自定义组件
自定义组件的核心是封装 crud 页面的数据及操作，比如 CrudTable，而前提就是获取$crud实例。通过`lookUpCrud`方法可以拿到页面入口的$crud 实例。下面以一个查询框为例展示自定义组件需要关注的几个方面

```html
<!--
   通过$crud.view控制视图显示/隐藏
   通过$crud.loading控制按钮/视图的锁定
   通过$crud.query/table/form/pagination/...实现视图映射
   通过内置API实现UI交互
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
      //通过lookUpCrud方法获取组件所在crud入口页面的$crud实例
      //如果启用了多实例，必须指定第二个参数`crudName`
      this.$crud = lookUpCrud(this)
    },
    methods: {
      reset() {
        each(this.$crud.query, (v, k) => {
          this.$crud.query[k] = this.$crud.defaults.query[k]
          this.$crud.reload()
        })
      },
      //使用lookUpCrud时会自动注册context的methods中的CRUD钩子
      [CRUD.HOOK.AFTER_QUERY](crud, rs) {
        ...
      }
    },
  }
</script>
```
### 6. URL 参数
CRUD 激活时，REST 地址支持 URL 参数来动态构建。通过 **`:varName`** 来声明变量，如下例

```js
//user实例的地址使用了orgId参数
export default {
  cruds: {
    org: '/api/orgs',
    user: '/api/orgs/:orgId/users'
  },
  ...
  methods:{
    //切换org时调用该方法
    setOrg(orgId){
      this.$cruds.user.setURLParams({orgId})
      this.$cruds.user.toQuery()
    }
  }
}
```

如你所见，动态 URL 最典型的使用场景就是关联业务(_当然，非动态 URL 也可实现相同功能_)。通过`setURLParams`方法可以动态修改请求地址，之后进行 C/R/U/D 操作

## 可导出

```js
import CRUD,{...} from 'cruda-element-ui'
```

- CRUD 
  > crud 命名空间，可设置全局默认值、调用钩子等
- useCrud(vm,restURL) : CRUD
  > 创建一个 crud 单实例入口并绑定指定的 vm(vue 组件)
- useCruds(vm,restURLMap) : Record<string, CRUD>
  > 创建一个 crud 多实例入口并绑定指定的 vm(vue 组件)
- lookUpCrud(vm,crudName?) : CRUD | null
  > 向上查找最近的 crud 实例
- onHook(vm,hookName,hook) : ()=>void
  > 添加一个额外钩子，返回取消函数

## Cruda
CRUD相关API请前往[Cruda](https://github.com/holyhigh2/cruda)
