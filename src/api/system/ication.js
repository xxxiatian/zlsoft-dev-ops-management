import request from "@/utils/request";
import { data } from "jquery";

//产品列表查询
export function icamodList(query) {
  return request({
    url: "/system/ication/icationlist",
    method: "get",
    params: query,
  });
}
//新增
export function addIcamod(data) {
  return request({
    url: "/system/ication/addication",
    method: "post",
    data: data,
  });
}
//修改详情
export function getIcation(id) {
  return request({
    url: "/system/ication/" + id,
    method: "get",
  });
}
//修改产品
export function updateIcamod(data) {
  return request({
    url: "/system/ication/updateication",
    method: "put",
    data: data,
  });
}
//停用
export function stopStatus(query) {
  return request({
    url: "/system/ication/stopstatus",
    method: "put",
    params: query,
  });
}
//删除
export function delIcation(id) {
  return request({
    url: "/system/ication/" + id,
    method: "delete",
  });
}
// 模块新增
export function addMod(data) {
  return request({
    url: "/system/ication/addmod",
    method: "post",
    data: data,
  });
}
//模块列表
export function getmodList(query) {
  return request({
    url: "/system/ication/modlist",
    method: "get",
    params: query,
  });
}

//修改模块
export function updateMod(data) {
  return request({
    url: "/system/ication/updatemod",
    method: "put",
    data: data,
  });
}
//产品管理模块下拉框
export function icaList(query) {
  return request({
    url: "/system/ication/icalist",
    method: "get",
    params: query,
  });
}
