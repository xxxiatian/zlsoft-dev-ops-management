import request from '@/utils/request'

// 查询工单评价列表
export function listEvaluate(query) {
    return request({
        url: '/system/evaluate/list',
        method: 'get',
        params: query
    })
}

// 查询工单评价详细
export function getEvaluate(serviceEvaluateId) {
    return request({
        url: '/system/evaluate/' + serviceEvaluateId,
        method: 'get'
    })
}

// 新增工单评价
export function addEvaluate(data) {
    return request({
        url: '/system/evaluate',
        method: 'post',
        data: data
    })
}


// 客户工单评价
export function evaluateDocument(data) {
    return request({
        url: '/system/evaluate/evaluateDocument',
        method: 'post',
        data: data
    })
}

// 修改工单评价
export function updateEvaluate(data) {
    return request({
        url: '/system/evaluate',
        method: 'put',
        data: data
    })
}

// 删除工单评价
export function delEvaluate(serviceEvaluateId) {
    return request({
        url: '/system/evaluate/' + serviceEvaluateId,
        method: 'delete'
    })
}

// 导出工单评价
export function exportEvaluate(query) {
    return request({
        url: '/system/evaluate/export',
        method: 'get',
        params: query
    })
}