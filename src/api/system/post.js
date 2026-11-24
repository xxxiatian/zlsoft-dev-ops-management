import request from "@/utils/request";

// 查询角色列表
export function listPost(query) {
  return request({
    url: "/system/post/list",
    method: "get",
    params: query,
  });
}

// 查询角色详细
export function getPost(postId) {
  return request({
    url: "/system/post/" + postId,
    method: "get",
  });
}

// 新增角色
export function addPost(data) {
  return request({
    url: "/system/post",
    method: "post",
    data: data,
  });
}

// 修改角色
export function updatePost(data) {
  return request({
    url: "/system/post",
    method: "put",
    data: data,
  });
}

// 删除角色
export function delPost(postId) {
  return request({
    url: "/system/post/" + postId,
    method: "delete",
  });
}

// 导出角色
export function exportPost(query) {
  return request({
    url: "/system/post/export",
    method: "get",
    params: query,
  });
}
