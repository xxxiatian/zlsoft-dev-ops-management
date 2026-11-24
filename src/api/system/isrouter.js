import request from "@/utils/request";

//查询来源机构
export function getfromOrg(query) {
  return request({
    url: "/system/router/gethospital",
    method: "get",
    params: query,
  });
}
//查询部门
export function getunitList(query) {
  return request({
    url: "/system/router/getunitlist",
    method: "get",
    params: query,
  });
}
//查询路由到小组
export function getgroupList(query) {
  return request({
    url: "/system/router/getgrouplist",
    method: "get",
    params: query,
  });
}
//查询路由到人员
export function getpersonList(query) {
  return request({
    url: "/system/router/getpersonlist",
    method: "get",
    params: query,
  });
}
//新增路由
export function addRouter(data) {
  return request({
    url: "/system/router/addrouter",
    method: "post",
    data: data,
  });
}
//查询列表
export function getrouterList(query) {
  return request({
    url: "/system/router/getrouterlist",
    method: "get",
    params: query,
  });
}
//停用
export function stopStatus(query) {
  return request({
    url: "/system/router/stopstatus",
    method: "put",
    params: query,
  });
}
//修改路由
export function updataRouter(data) {
  return request({
    url: "/system/router/updaterouter",
    method: "put",
    data: data,
  });
}
//修改查询
export function getRouter(id) {
  return request({
    url: "/system/router/" + id,
    method: "get",
  });
}
//删除
export function delRouter(id) {
  return request({
    url: "/system/router/" + id,
    method: "delete",
  });
}
