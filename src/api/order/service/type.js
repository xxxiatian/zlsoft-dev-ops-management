import request from '@/utils/request'

// 查询标签类别列表
export function listType(query) {
    return request({
        url: '/system/type/list',
        method: 'get',
        params: query
    })
}

// 查询标签类别详细
export function getType(tagId) {
    return request({
        url: '/system/type/' + tagId,
        method: 'get'
    })
}

// 新增标签类别
export function addType(data) {
    return request({
        url: '/system/type',
        method: 'post',
        data: data
    })
}

// 修改标签类别
export function updateType(data) {
    return request({
        url: '/system/type',
        method: 'put',
        data: data
    })
}

// 删除标签类别
export function delType(tagId) {
    return request({
        url: '/system/type/' + tagId,
        method: 'delete'
    })
}

// 导出标签类别
export function exportType(query) {
    return request({
        url: '/system/type/export',
        method: 'get',
        params: query
    })
}