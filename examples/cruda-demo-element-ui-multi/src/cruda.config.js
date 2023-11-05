import {defaultTo} from 'myfx/utils'
import { Message } from 'element-ui';

// Global defaults
export function initCRUD(CRUD) {
  CRUD.defaults.table.rowKey = 'id'
  CRUD.defaults.pagination.pageSize = 15
  CRUD.defaults.recoverable = true
  // set the table data after query
  CRUD.defaults[CRUD.HOOK.AFTER_QUERY] = function(crud, rs) {
    crud.pagination.total = defaultTo(parseInt(rs.data.total), 0)
    crud.table.data = defaultTo(rs.data.rows, [])
  }
  // validate before submit
  CRUD.defaults[CRUD.HOOK.BEFORE_SUBMIT] = async function(crud,cancel,setForm,form) {
    let rs
    // try {
    //   rs = await form.validate()
    // } catch (error) {
    //   cancel()
    //   throw error
    // }
  }
  // show tip after submit
  CRUD.defaults[CRUD.HOOK.AFTER_SUBMIT] = function(crud, rs) {
    Message.success('submit success')
    crud.toQuery()
    crud.cancel()
  }
  // clear the form before add
  CRUD.defaults[CRUD.HOOK.BEFORE_ADD] = function(crud, ...args) {
    crud.form = {}
  }
  // fill the form before edit view is shown 
  CRUD.defaults[CRUD.HOOK.BEFORE_EDIT] = function(crud, row, cancel,skip) {
    console.log('before_edit', row)
    skip()
    crud.form = row
  }
  CRUD.defaults[CRUD.HOOK.AFTER_DETAILS] = function(crud, rs) {
    crud.form = rs.data
  }
  // reload the table after delete
  CRUD.defaults[CRUD.HOOK.AFTER_DELETE] = function(crud, rs) {
    Message.success('delete success')
    crud.reload()
  }
}
