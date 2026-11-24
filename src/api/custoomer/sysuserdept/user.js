import request from '@/utils/request'

// 查询用户部门关系列表
export function listUser(query) {
    return request({
        url: '/system/users/list',
        method: 'get',
        params: query
    })
}


// 查询员工信息
export function userList(query) {
    return request({
        url: '/system/users/sysUser',
        method: 'get',
        params: query
    })
}


// 查询客户信息信息
export function deptList(query) {
    return request({
        url: '/system/users/sysDept',
        method: 'get',
        params: query
    })
}
// 查询用户部门关系详细
export function getUser(deptId) {
    return request({
        url: '/system/users/' + deptId,
        method: 'get'
    })
}

// 新增用户部门关系
export function addUser(data) {
    return request({
        url: '/system/users',
        method: 'post',
        data: data
    })
}

// 修改用户部门关系
export function updateUser(data) {
    return request({
        url: '/system/users',
        method: 'put',
        data: data
    })
}

// 删除用户部门关系
export function delUser(deptId) {
    return request({
        url: '/system/users/' + deptId,
        method: 'delete'
    })
}

// 导出用户部门关系
export function exportUser(query) {
    return request({
        url: '/system/users/export',
        method: 'get',
        params: query
    })
}