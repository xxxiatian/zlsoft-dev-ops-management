import request from "@/utils/request";

// 查询部门列表
export function listDept(query) {
  return request({
    url: "/system/dept/list",
    method: "get",
    params: query,
  });
}
// 查询部门列表
export function unitDept(query) {
  return request({
    url: "/system/unit/list",
    method: "get",
    params: query,
  });
}
// 查询部门列表（排除节点）
export function listDeptExcludeChild(id) {
  return request({
    url: "/system/dept/list/exclude/" + id,
    method: "get",
  });
}

// 查询部门详细
export function getDept(id) {
  return request({
    url: "/system/dept/" + id,
    method: "get",
  });
}
// 查询部门详细
export function getUnit(id) {
  return request({
    url: "/system/unit/" + id,
    method: "get",
  });
}
// 查询部门下拉树结构
export function treeselect() {
  return request({
    url: "/system/dept/treeselect",
    method: "get",
  });
}
// 查询部门列表
export function unittreeselect() {
  return request({
    url: "/system/unit/treeselect",
    method: "get",
  });
}

// 查询部门列表
export function unittreeselectt(data) {
  return request({
    url: "/system/unit/treeselect1",
    method: "get",
    params: data,
  });
}

// 根据角色ID查询部门树结构
export function roleDeptTreeselect(roleid) {
  return request({
    url: "/system/dept/roleDeptTreeselect/" + roleid,
    method: "get",
  });
}

// 新增部门
export function addDept(data) {
  return request({
    url: "/system/dept",
    method: "post",
    data: data,
  });
}

// 修改部门
export function updateUnit(data) {
  return request({
    url: "/system/unit",
    method: "put",
    data: data,
  });
}

// 新增部门
export function addUnit(data) {
  return request({
    url: "/system/unit",
    method: "post",
    data: data,
  });
}
// 删除部门
export function delUnit(id) {
  return request({
    url: "/system/unit/" + id,
    method: "delete",
  });
}
// 修改部门
export function updateDept(data) {
  return request({
    url: "/system/dept",
    method: "put",
    data: data,
  });
}
// 删除部门
export function delDept(id) {
  return request({
    url: "/system/dept/" + id,
    method: "delete",
  });
}

// 用户新建查询机构
export function orgList(query) {
  return request({
    url: "/system/dept/orglist",
    method: "get",
    params: query,
  });
}
//授权机构日期
export function empOwer(data) {
  return request({
    url: "/system/dept/empower",
    method: "post",
    data: data,
  });
}
//查询切换部门
export function changeunitList(query) {
  return request({
    url: "/system/unit/getunitlist",
    method: "get",
    params: query,
  });
}
//机构到期时间
export function expirationTime(query) {
  return request({
    url: "/system/dept/expirationtime",
    method: "get",
    params: query,
  });
}
// 工单部门列表
export function orderunitDept(query) {
  return request({
    url: "/system/unit/unitlist",
    method: "get",
    params: query,
  });
}
// 转部门列表
export function unitList(query) {
  return request({
    url: "/system/unit/unitlist",
    method: "get",
    params: query,
  });
}
