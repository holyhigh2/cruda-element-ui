/**
 * @author holyhigh
 */
import { each } from 'myfx/collection'
import {closest} from 'myfx/tree'
import {noop} from 'myfx/utils'


import CRUD, { crudError, RestUrl,_newCrud,_newCruds, _onHook} from 'cruda'
import * as packageInfo from '../package.json'

let globalVue: Record<string, any>

/**
 * 创建一个crud单实例入口并绑定指定的vm(需要crud的vue组件)
 * @param {object} vm 需要使用crud的组件实例
 * @param {string | RestUrl} restURL url字符串或包含url属性的配置对象
 * @return {CRUD} $crud
 */
export function useCrud(
  vm: Record<string, any>,
  restURL: string | RestUrl
): CRUD {
  const $crud = globalVue.observable(_newCrud(restURL,vm))

  //crud入口标识
  vm.$isCrudEntry = true

  return $crud as CRUD
}

/**
 * 创建crud多实例入口并绑定指定的vm(需要crud的vue组件)
 * @param {object} vm 需要使用crud的组件实例
 * @param {Record<string, string | RestUrl>} restURL restURL配置对象
 * @return {Record<string, CRUD>} $cruds
 */
export function useCruds(
  vm: Record<string, any>,
  restURL: Record<string, string | RestUrl>
): Record<string, CRUD> {
  const $cruds: Record<string, CRUD> = globalVue.observable(_newCruds(restURL,vm))

  //crud入口标识
  vm.$isCrudEntry = true

  return $cruds
}

/**
 * 用于注册钩子
 * @param {string} hookName 钩子名称
 * @param {Function} hook 回调函数
 * @returns 移除钩子的函数
 */
export function onHook(
  vm: Record<string, any>,
  hookName: string,
  hook: (crud: CRUD, ...args: any[]) => void
): ()=>void {
  let crudVM = closest(vm,(node: Record<any, any>)=>!!node.__crud_nid_,'$parent')
  if(!crudVM)return noop
  return _onHook(crudVM.__crud_nid_,hookName,hook,vm)
}

/**
 * 用于自定义组件向上查找最近的$crud并返回。用于自定义组件封装crud逻辑
 *
 * @param {object} vm 自定义组件实例
 * @param {string} [crudName] 如果使用了cruds就必须指定crudName
 * @return {CRUD | null} $crud 向上查找最近的crud实例或null
 */
export function lookUpCrud(
  vm: Record<string, any>,
  crudName?: string
): CRUD | null {
  let crudVM = closest(vm,(node: Record<any, any>)=>!!node.__crud_nid_,'$parent')
  if(!crudVM)return crudVM

  if(crudVM.__cruds_){
    if (!crudName) {
      crudError(`Must specify 'crudName' when multiple instances detected`)
      return null
    }
    return crudVM.__cruds_[crudName]
  }

  return crudVM.__crud_
}

CRUD.install = function (Vue: Record<string, any>, options) {
  // 使用业务主请求器，避免因跨域或token等导致的异步失败
  if (!options.request) {
    crudError('Cannot find [request] in the installation options')
  }
  CRUD.request = options.request
  globalVue = Vue

  // 注入curd入口。
  // 以此简化在每个使用场景需要引入CRUD的过程
  Vue.mixin({
    beforeCreate() {
      // 具有标记crud的组件认为该组件启用了crud，即可注入$crud属性
      const crud = this.$options.crud
      const cruds = this.$options.cruds
      if (crud || cruds) {
        if (crud) {
          this.$crud = Vue.observable(_newCrud(crud,this))
        } else {
          this.$cruds = Vue.observable(_newCruds(cruds,this))
        }
        //crud入口标识
        this.$isCrudEntry = true

        //onHook
        const methods = this.constructor.options.methods
        each(CRUD.HOOK,hookName=>{
          if(methods[hookName]){
            _onHook(this.__crud_nid_,hookName,methods[hookName],this)
          }
        })
        
      }
    },
  })

  // welcome info
  const ssAry: string[] = []
  ;['220,235,153', '179,208,75', '153,189,37'].forEach((v, i) => {
    const cu = 'background:rgb(' + v + ');'
    if (i < 2) {
      ssAry[i] = ssAry[5 - 1 - i] = cu
    } else {
      ssAry[i] = 'color:#fff;' + cu
    }
  })
  console.info(
    `%c %c %c Cruda/element-ui - ${packageInfo.description} | v${packageInfo.version} %c %c `,
    ...ssAry,
    '\u{1F4E6} https://github.com/holyhigh2/cruda-element-ui'
  )
}

export default CRUD
