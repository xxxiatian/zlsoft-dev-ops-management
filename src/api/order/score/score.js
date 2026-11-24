import request from '@/utils/request'

// 查询权重列表列表
export function listScore(query) {
  return request({
    url: '/devops/score/list',
    method: 'get',
    params: query
  })
}

// 查询权重列表详细
export function getScore(scoreId) {
  return request({
    url: '/devops/score/' + scoreId,
    method: 'get'
  })
}

// 新增权重列表
export function addScore(data) {
  return request({
    url: '/devops/score',
    method: 'post',
    data: data
  })
}

// 修改权重列表
export function updateScore(data) {
  return request({
    url: '/devops/score',
    method: 'put',
    data: data
  })
}

// 删除权重列表
export function delScore(scoreId) {
  return request({
    url: '/devops/score/' + scoreId,
    method: 'delete'
  })
}

// 导出权重列表
export function exportScore(query) {
  return request({
    url: '/devops/score/export',
    method: 'get',
    params: query
  })
}