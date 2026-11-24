import request from "@/utils/request";

// 新增小组
export function addGroup(data) {
  return request({
    url: "/system/group/addgroup",
    method: "post",
    data: data,
  });
}
// 列表查询
export function listGroup(query) {
  return request({
    url: "/system/group/list",
    method: "get",
    params: query,
  });
}

// 新增小组人员
export function addPerson(data) {
  return request({
    url: "/system/group/addperson",
    method: "post",
    data: data,
  });
}

// 获取小组人员
export function getGroupPerson(data) {
  return request({
    url: "/system/group/getGroupPerson",
    method: "post",
    data: data,
  });
}

// 获取小组
export function getUnitGroup(query) {
  return request({
    url: "/system/group/getUnitGroup",
    method: "get",
    params: query,
  });
}

// 删除小组
export function delUnitGroup(query) {
  return request({
    url: "/system/group/delUnitGroup",
    method: "get",
    params: query,
  });
}

//人员查询
export function unitpersonList(query) {
  return request({
    url: "/system/user/unitpersonlist",
    method: "get",
    params: query,
  });
}
//修改详情
export function getGroup(id) {
  return request({
    url: "/system/group/" + id,
    method: "get",
  });
}
//修改
export function updateGroup(data) {
  return request({
    url: "/system/group/updategroup",
    method: "put",
    data: data,
  });
}
