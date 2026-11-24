import request from '@/utils/request'

// 查询通知列表
export function listFrom(query) {
    return request({
        url: '/system/from/list',
        method: 'get',
        params: query
    })
}

// 查询通知详细
export function getFrom(notificationId) {
    return request({
        url: '/system/from/' + notificationId,
        method: 'get'
    })
}

// 新增通知
export function addFrom(data) {
    return request({
        url: '/system/from',
        method: 'post',
        data: data
    })
}

// 修改通知
export function updateFrom(data) {
    return request({
        url: '/system/from',
        method: 'put',
        data: data
    })
}

// 删除通知
export function delFrom(
    notificationId) {
    return request({
        url: '/system/from/' + notificationId,
        method: 'delete'
    })
}

// 导出通知
export function exportFrom(query) {
    return request({
        url: '/system/from/export',
        method: 'get',
        params: query
    })
}