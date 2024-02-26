/**
 * @author holyhigh
 */
import { each } from "myfx/collection";
import { closest } from "myfx/tree";
import { noop } from "myfx/utils";
import { get, set } from "myfx/object";

import CRUD, { crudError, RestUrl, _newCrud, _newCruds, _onHook,_setUpdater,_setSnapshot, FormValidator, callHook } from "cruda";
import * as packageInfo from "../package.json";
import { isArrayLike } from "myfx";
import { size } from "myfx";

let globalVue: Record<string, any>;

set(
  CRUD.prototype,
  "submitForm",
  async function (
    form:
      | FormValidator
      | FormValidator[]
      | (() => Promise<FormValidator | FormValidator[]>),
    ...args: unknown[]
  ): Promise<unknown> {
    let validators = form;
    if (form instanceof Function) {
      validators = await form();
    } else {
      validators = form;
    }
    if (!isArrayLike(validators)) {
      validators = [validators];
    }

    const invalidBreak = this.invalidBreak;

    let invalidFields = [];
    let isValid = true;
    for (let i = 0; i < validators.length; i++) {
      try {
        await validators[i].validate(...args);
      } catch (error) {
        isValid = false;
        invalidFields.push(error);
        if (invalidBreak) {
          break;
        }
      }
    }

    callHook(CRUD.HOOK.ON_VALIDATE, this, isValid, invalidFields);

    if (size(invalidFields) > 0) {
      return Promise.reject(invalidFields);
    }

    return this.submit(...args);
  }
);

function watchCrud(
  crudInstances: CRUD | Record<string, CRUD>,
  vm: Record<string, any>
) {
  let crud = globalVue.observable(crudInstances);

    if (crudInstances instanceof CRUD) {
      vm.$watch(
        () => {
          return crud.form;
        },
        (nv:any) => {
          if (!crudInstances.recoverable) return;
          if(crudInstances.formStatus !== 1 && crudInstances.formStatus !== 2){
            return
          }

          _setSnapshot(crud,nv)
        },
        { deep: true }
      );
    }else {
      each(crudInstances,(crud,k)=>{
        vm.$watch(
          () => {
            return crud.form;
          },
          (nv:any) => {
            if (!crud.recoverable) return;
            if(crud.formStatus !== 1 && crud.formStatus !== 2){
              return
            }
  
            _setSnapshot(crud,nv)
          },
          { deep: true }
        );
      })
    }

  return crud;
}

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
  const $crud = watchCrud(_newCrud(restURL, vm), vm);

  //crud入口标识
  vm.$isCrudEntry = true;

  return $crud as CRUD;
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
  const $cruds: Record<string, CRUD> = watchCrud(_newCruds(restURL, vm), vm);

  //crud入口标识
  vm.$isCrudEntry = true;

  return $cruds;
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
): () => void {
  let crudVM = closest(
    vm,
    (node: Record<any, any>) => !!node.__crud_nid_,
    "$parent"
  );
  if (!crudVM) return noop;
  return _onHook(crudVM.__crud_nid_, hookName, hook, vm);
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
  let crudInstance = closest(
    vm,
    (node: Record<any, any>) => node.$crud || node.$cruds,
    "$parent"
  );
  if (!crudInstance) return crudInstance;

  let crudEntry = closest(
    vm,
    (node: Record<any, any>) => !!node.__crud_nid_,
    "$parent"
  );

  //onHook
  const methods = get<Record<string, any>>(vm, "constructor.options.methods");
  methods && each(CRUD.HOOK, (hookName) => {
    if (methods[hookName]) {
      _onHook(crudEntry!.__crud_nid_, hookName, methods[hookName], vm);
    }
  });

  if (crudInstance.$cruds) {
    if (!crudName) {
      crudError(`Must specify 'crudName' when multiple instances detected`);
      return null;
    }
    return crudInstance.$cruds[crudName];
  }

  return crudInstance.$crud;
}

CRUD.install = function (Vue: Record<string, any>, options) {
  // 使用业务主请求器，避免因跨域或token等导致的异步失败
  if (!options.request) {
    crudError("Cannot find [request] in the installation options");
  }
  CRUD.request = options.request;
  globalVue = Vue;

  _setUpdater((form:Record<string, any>, props:Record<string, any>)=>{
    each(props,(v,k)=>{
      Vue.set(form,k,v)
    })    
  })

  // 注入curd入口。
  // 以此简化在每个使用场景需要引入CRUD的过程
  Vue.mixin({
    beforeCreate() {
      // 具有标记crud的组件认为该组件启用了crud，即可注入$crud属性
      const crud = this.$options.crud;
      const cruds = this.$options.cruds;
      if (crud || cruds) {
        if (crud) {
          this.$crud = watchCrud(_newCrud(crud, this), this);
        } else {
          this.$cruds = watchCrud(_newCruds(cruds, this), this);
        }
        //crud入口标识
        this.$isCrudEntry = true;

        //onHook
        const methods = this.constructor.options.methods;
        methods && each(CRUD.HOOK, (hookName) => {
          if (methods[hookName]) {
            _onHook(this.__crud_nid_, hookName, methods[hookName], this);
          }
        });
      }
    },
  });

  // welcome info
  const ssAry: string[] = [];
  ["220,235,153", "179,208,75", "153,189,37"].forEach((v, i) => {
    const cu = "background:rgb(" + v + ");";
    if (i < 2) {
      ssAry[i] = ssAry[5 - 1 - i] = cu;
    } else {
      ssAry[i] = "color:#fff;" + cu;
    }
  });
  console.info(
    `%c %c %c Cruda/element-ui - ${packageInfo.description} | v${packageInfo.version} %c %c `,
    ...ssAry,
    "\u{1F4E6} https://github.com/holyhigh2/cruda-element-ui"
  );
};

export default CRUD;
