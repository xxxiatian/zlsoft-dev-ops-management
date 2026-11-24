import request from "@/utils/request";
import { praseStrEmpty } from "@/utils/zlsoft";

// 查询用户列表
export function listUser(query) {
  return request({
    url: "/system/user/list",
    method: "get",
    params: query,
  });
}

// 查询用户详细
export function getUser(numid) {
  return request({
    url: "/system/user/" + praseStrEmpty(numid),
    method: "get",
  });
}

// 查询用户详细
export function getPerson(data) {
  return request({
    url: "/system/user/personVo",
    method: "get",
    params: data,
  });
}
// 新增用户
export function addUser(data) {
  return request({
    url: "/system/user",
    method: "post",
    data: data,
  });
}

// 修改用户
export function updateUser(data) {
  return request({
    url: "/system/user/update",
    method: "put",
    data: data,
  });
}

// 删除用户
export function delUser(data) {
  return request({
    url: "/system/user/",
    method: "delete",
    params: data,
  });
}

// 导出用户
export function exportUser(query) {
  return request({
    url: "/system/user/export",
    method: "get",
    params: query,
  });
}

// 用户密码重置
export function resetUserPwd(password, id, orgid) {
  const data = {
    password,
    id,
    orgid,
  };
  return request({
    url: "/system/user/resetPwd",
    method: "put",
    params: data,
  });
}

// 用户状态修改
export function changeUserStatus(data) {
  return request({
    url: "/system/user/changeStatus",
    method: "put",
    params: data,
  });
}

// 查询用户个人信息
export function getUserProfile(data) {
  return request({
    url: "/system/user/profile",
    method: "get",
    params: data,
  });
}

// 修改用户个人信息
export function updateUserProfile(data) {
  return request({
    url: "/system/user/profile",
    method: "put",
    data: data,
  });
}

// 用户密码重置
export function updateUserPwd(oldPassword, newPassword) {
  const data = {
    oldPassword,
    newPassword,
  };
  return request({
    url: "/system/user/updatePwd",
    method: "put",
    params: data,
  });
}

// 用户头像上传
export function uploadAvatar(data) {
  return request({
    url: "/system/user/profile/avatar",
    method: "post",
    data: data,
  });
}

// 下载用户导入模板
export function importTemplate() {
  return request({
    url: "/system/user/importTemplate",
    method: "get",
  });
}

// 查询授权角色
export function getAuthRole(numid) {
  return request({
    url: "/system/user/authRole/" + numid,
    method: "get",
  });
}

// 保存授权角色
export function updateAuthRole(data) {
  return request({
    url: "/system/user/authRole",
    method: "put",
    params: data,
  });
}

