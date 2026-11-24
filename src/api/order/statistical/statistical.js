import request from '@/utils/request'

// 查询人员统计列表
export function statisticalList(query) {
  return request({
    url: '/order/statistical/list',
    method: 'get',
    params: query
  })
}

// 查询统计列表
export function listStatistical(query) {
  return request({
    url: '/devops/statistical/list',
    method: 'get',
    params: query
  })
}

// 查询统计列表详细
export function getStatistical(statisticalId) {
  return request({
    url: '/devops/statistical/' + statisticalId,
    method: 'get'
  })
}

// 新增统计列表
export function addStatistical(data) {
  return request({
    url: '/devops/statistical',
    method: 'post',
    data: data
  })
}

// 修改统计列表
export function updateStatistical(data) {
  return request({
    url: '/devops/statistical',
    method: 'put',
    data: data
  })
}

// 删除统计列表
export function delStatistical(statisticalId) {
  return request({
    url: '/devops/statistical/' + statisticalId,
    method: 'delete'
  })
}

// 导出统计列表
export function exportStatistical(query) {
  return request({
    url: '/devops/statistical/export',
    method: 'get',
    params: query
  })
}