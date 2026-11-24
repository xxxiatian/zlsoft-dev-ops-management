import request from '@/utils/request'

// 查询知识库记录列表
export function listBase(query) {
    return request({
        url: '/system/base/list',
        method: 'get',
        params: query
    })
}

// 查询知识库记录详细
export function getBase(id) {
    return request({
        url: '/system/base/' + id,
        method: 'get'
    })
}

// 新增知识库记录
export function addBase(data) {
    return request({
        url: '/system/base',
        method: 'post',
        data: data
    })
}

// 修改知识库记录
export function updateBase(data) {
    return request({
        url: '/system/base',
        method: 'put',
        data: data
    })
}

// 删除知识库记录
export function delBase(id) {
    return request({
        url: '/system/base/' + id,
        method: 'delete'
    })
}

// 导出知识库记录
export function exportBase(query) {
    return request({
        url: '/system/base/export',
        method: 'get',
        params: query
    })
}