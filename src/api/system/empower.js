import request from "@/utils/request";

//医院列表
export function orghospitalList(query) {
  return request({
    url: "/system/dept/orghospitallist",
    method: "get",
    params: query,
  });
}
//授权
export function authOrize(data) {
  return request({
    url: "system/authorize/addauthorize",
    method: "post",
    data: data,
  });
}
//产品

export function icaList(query) {
  return request({
    url: "/system/ication/icalist",
    method: "get",
    params: query,
  });
}
//查询列表
export function authorizeList(query) {
  return request({
    url: "/system/authorize/authorizelist",
    method: "get",
    params: query,
  });
}
//停用
export function stopStatus(data) {
  return request({
    url: "/system/authorize/stopstatus",
    method: "put",
    params: data,
  });
}
//部门产品下拉框
export function authorizeicaList(query) {
  return request({
    url: "/system/authorize/authorizeicalist",
    method: "get",
    params: query,
  });
}
//授权修改
export function authUpdate(data) {
  return request({
    url: "/system/authorize/updatetime",
    method: "put",
    data: data,
  });
}