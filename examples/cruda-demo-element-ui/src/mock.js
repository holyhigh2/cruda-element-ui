import _ from 'myfx'
import * as qs from 'qs'
import Mock from 'mockjs'
console.log(_)
const Random = Mock.Random
const singleTableData = _.map(_.range(0, 34), () => {
  return {
    id: Random.guid(),
    email: Random.email(),
    uname: Random.cname(),
    ip: Random.ip(),
    domain: Random.domain()
  }
})

const multiTableData = _.map(_.range(0, 14), () => {
  return {
    id: Random.guid(),
    email: Random.email(),
    uname: Random.cname(),
    ip: Random.ip(),
    domain: Random.domain()
  }
})

//xApi url
Mock.mock(/api\/single\/live/, 'get', function(options) {
  return 'xApi --> '+options.body
})

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

Mock.mock(/api\/multi/, 'get', function(options) {
  return { rows: multiTableData, total: multiTableData.length }
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
