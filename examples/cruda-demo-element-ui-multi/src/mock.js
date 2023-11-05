import _ from 'myfx'
import * as qs from 'qs'
import Mock from 'mockjs'
console.log(_)
const Random = Mock.Random
//缓存
let cacheKeySingle = 'cruda-demo-element-ui-multiple_single'
let singleCache = localStorage.getItem(cacheKeySingle)
const singleTableData = singleCache?JSON.parse(singleCache):_.map(_.range(0, 34), () => {
  return {
    id: Random.guid(),
    email: Random.email(),
    uname: Random.cname(),
    ip: Random.ip(),
    domain: Random.domain()
  }
})
localStorage.setItem(cacheKeySingle,JSON.stringify(singleTableData))

let cacheKeyMultiple = 'cruda-demo-element-ui-multiple_multiple'
let multipleCache = localStorage.getItem(cacheKeyMultiple)
const multipleTableData = multipleCache?JSON.parse(multipleCache):_.map(_.range(0, 14), () => {
  return {
    id: Random.guid(),
    email: Random.email(),
    uname: Random.cname(),
    ip: Random.ip(),
    domain: Random.domain()
  }
})
localStorage.setItem(cacheKeyMultiple,JSON.stringify(multipleTableData))
// Query
Mock.mock(/api\/single\/([a-zA-Z0-9-]+)/, 'get', function(options) {
  // query details
  let id = _.last(options.url.split('/'))
  id = id.split('?')[0]
  const data = _.find(singleTableData, { id })
  return data
})
Mock.mock(/api\/single/, 'get', function(options) {
  // 模拟分页
  const search = _.substring(options.url, _.indexOf(options.url, '?') + 1)
  const o = qs.parse(search)
  const keyword = o.keyword

  const start = parseInt(o.pageSize) * (parseInt(o.currentPage) - 1)
  const rs = _.slice(
    _.filter(singleTableData, (d) => {
      if (!keyword) return true
      return (
        _.test(d.email, keyword) ||
        _.test(d.uname, keyword) ||
        _.test(d.ip, keyword) ||
        _.test(d.domain, keyword)
      )
    }),
    start,
    start + parseInt(o.pageSize)
  )

  return { rows: rs, total: singleTableData.length }
})

// Create
Mock.mock(/api\/single/, 'post', function(options) {
  const data = JSON.parse(options.body)
  singleTableData.push({
    id: Random.guid(),
    email: data.email,
    uname: data.uname,
    ip: Random.ip(),
    domain: Random.domain()
  })
})

// Update
Mock.mock(/api\/single/, 'put', function(options) {
  const data = JSON.parse(options.body)
  const item = _.find(singleTableData, { id: data.id })

  item.email = data.email
  item.uname = data.uname
})

// Delete
Mock.mock(/api\/single/, 'delete', function(options) {

  const data = JSON.parse(options.body)
  _.remove(singleTableData, { id: data[0] })
})

/////////////////---------------------------------- multiple

// Query
Mock.mock(/api\/multiple\/([a-zA-Z0-9-]+)/, 'get', function(options) {
  // query details
  let id = _.last(options.url.split('/'))
  id = id.split('?')[0]
  const data = _.find(multipleTableData, { id })
  return data
})
Mock.mock(/api\/multiple/, 'get', function(options) {
  // 模拟分页
  const search = _.substring(options.url, _.indexOf(options.url, '?') + 1)
  const o = qs.parse(search)
  const keyword = o.keyword

  const start = parseInt(o.pageSize) * (parseInt(o.currentPage) - 1)
  const rs = _.slice(
    _.filter(multipleTableData, (d) => {
      if (!keyword) return true
      return (
        _.test(d.email, keyword) ||
        _.test(d.uname, keyword) ||
        _.test(d.ip, keyword) ||
        _.test(d.domain, keyword)
      )
    }),
    start,
    start + parseInt(o.pageSize)
  )

  return { rows: rs, total: multipleTableData.length }
})

// Create
Mock.mock(/api\/multiple/, 'post', function(options) {
  const data = JSON.parse(options.body)
  multipleTableData.push({
    id: Random.guid(),
    email: data.email,
    uname: data.uname,
    ip: Random.ip(),
    domain: Random.domain()
  })
})

// Update
Mock.mock(/api\/multiple/, 'put', function(options) {
  const data = JSON.parse(options.body)
  const item = _.find(multipleTableData, { id: data.id })

  item.email = data.email
  item.uname = data.uname
})

// Delete
Mock.mock(/api\/multiple/, 'delete', function(options) {

  const data = JSON.parse(options.body)
  _.remove(multipleTableData, { id: data[0] })
})
