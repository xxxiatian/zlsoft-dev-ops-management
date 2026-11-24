import request from "@/utils/request";
import qs from "qs";
// 查询【请填写功能名称】列表
export function listRec(query) {
  return request({
    url: "/system/rec/list",
    method: "get",
    params: query,
  });
}

// 查询用户列表
export function listUser(query) {
  return request({
    url: "/system/rec/userList",
    method: "get",
    params: query,
  });
}

// 查询部门列表
export function listDept(query) {
  return request({
    url: "system/rec/deptsList",
    method: "get",
    params: query,
  });
}

// 根据科室查询员工
export function distributiond(query) {
  return request({
    url: "/system/rec/distributiond",
    method: "get",
    params: query,
  });
}

// 首页查询总数
export function selectotal(query) {
  return request({
    url: "/system/rec/selectotal",
    method: "get",
    params: query,
  });
}

// 首页查询总数
export function selectOrderCount(query) {
  return request({
    url: "/system/rec/selectOrderCount",
    method: "get",
    params: query,
  });
}

//客户列表的部门
export function deptList(query) {
  return request({
    url: "/system/rec/deptList",
    method: "get",
    params: query,
  });
}

// 客户账号菜单下拉部门
export function listsysdept(query) {
  return request({
    url: "/system/rec/sysdeptlist",
    method: "get",
    params: query,
  });
}

// 查询【请填写功能名称】详细
export function getRec(id) {
  return request({
    url: "/system/rec/" + id,
    method: "get",
  });
}

// 查询【部门】详细
export function getsysdept(id) {
  return request({
    url: "/system/rec/sysdept",
    method: "get",
  });
}

// 查询【医院负责人】详细
export function getsysStaff(deptId) {
  return request({
    url: "/system/rec/selectStaff?deptId=" + deptId,

    method: "get",
  });
}

// 新增【请填写功能名称】
export function addRec(data) {
  return request({
    url: "/system/rec",
    method: "post",
    data: data,
  });
}

// 修改【请填写功能名称】
export function updateRec(data) {
  return request({
    url: "/system/rec",
    method: "put",
    data: data,
  });
}

// 修改【处理人】
export function updateRecProcess(data) {
  return request({
    url: "/system/rec/process",
    method: "put",
    data: data,
  });
}

//修改【状态】
export function updatedocument(data) {
  return request({
    url: "/system/rec/document",
    method: "put",
    data: data,
  });
}

//修改【评价】
export function updateevaluate(data) {
  return request({
    url: "/system/rec/evaluate",
    method: "put",
    data: data,
  });
}

// 删除【请填写功能名称】
export function delRec(id) {
  return request({
    url: "/system/rec/" + id,
    method: "delete",
  });
}

// 导出工单
export function exportRec(query) {
  return request({
    url: "/system/rec/export",
    method: "get",
    params: query,
  });
}

// 导出人员工单统计
export function exportOrderNumCount(query) {
  return request({
    url: "/system/rec/exportOrderNumCount",
    method: "get",
    params: query,
  });
}

// 查询工程师处理中的列表
export function listvisit(query) {
  return request({
    url: "/system/rec/selectVisitList",
    method: "get",
    params: query,
  });
}

// 首页的工单
export function selectlist(query) {
  return request({
    url: "/system/rec/selectlist",
    method: "get",
    params: query,
  });
}

// 查询待接单的工单
export function selectlistdjd(query) {
  return request({
    url: "/system/rec/selectlistdjd",
    method: "get",
    params: query,
  });
}

// 查询项目名称
export function listDataDict(query) {
  return request({
    url: "/system/dict/data/listDataDict",
    method: "get",
    params: query,
  });
}

// 查询员工信息,首页使用
export function EmployeeInformation(query) {
  return request({
    url: "/system/rec/EmployeeInformation",
    method: "get",
    params: query,
  });
}

// 查询员工循环列表,首页使用
export function EngineerInformation(query) {
  return request({
    url: "/system/rec/EngineerInformation",
    method: "get",
    params: query,
  });
}

// 删除【请填写功能名称】
export function staffdel(deptId, userId) {
  return request({
    url: "/system/users/" + deptId + "/" + userId,
    method: "delete",
  });
}
// 获取处理人信息
export function personList(query) {
  return request({
    url: "/system/user/personlist",
    method: "get",
    params: query,
  });
}

//工单派单
export function orderDo(data) {
  return request({
    url: "/system/rec/ordertodo",
    method: "put",
    data: data,
  });
}
//工单详情--进度条
export function DisposalList(query) {
  return request({
    url: "/system/rec/orderdolist",
    method: "get",
    params: query,
  });
}
//工单修改
export function gdUpdata(data) {
  return request({
    url: "/system/rec/update",
    method: "put",
    data: data,
  });
}
//工单终止
export function stopOrder(data) {
  return request({
    url: "/system/rec/stoporder",
    method: "put",
    data: data,
  });
}
//订单转交
export function deLiver(data) {
  return request({
    url: "/system/rec/deliver",
    method: "put",
    data: data,
  });
}

// 查询待处理列表
export function pendingList(query) {
  return request({
    url: "/system/rec/pendinglist",
    method: "get",
    params: query,
  });
}

//完成工单
export function ovEr(data) {
  return request({
    url: "/system/rec/over",
    method: "put",
    data: data,
  });
}
//工单转交
export function tranSfer(data) {
  return request({
    url: "/system/rec/transfer",
    method: "put",
    data: data,
  });
}
// 查询待处理列表
export function overList(query) {
  return request({
    url: "/system/rec/overlist",
    method: "get",
    params: query,
  });
}
// 查询待处理列表
export function backOrder(data) {
  return request({
    url: "/system/rec/backorder",
    method: "put",
    data: data,
  });
}

// 首页列表
export function homepage(query) {
  return request({
    url: "/system/rec/homepage",
    method: "get",
    params: query,
  });
}
// 服务客户
export function customerList(query) {
  return request({
    url: "/system/rec/customerlist",
    method: "get",
    params: query,
  });
}
// 人员情况
export function unitordersumList(query) {
  return request({
    url: "/system/rec/unitordersum",
    method: "get",
    params: query,
  });
}
// 人员列表
export function unitordersumsList(query) {
  return request({
    url: "/system/rec/unitordersums",
    method: "get",
    params: query,
  });
}
// 人员列表
export function customersLists(query) {
  return request({
    url: "/system/rec/customerlists",
    method: "get",
    params: query,
  });
}

// 统计列表
export function statisticalList(data) {
  return request({
    url: "/system/rec/statistical",
    method: "get",
    params: data,
  });
}
//超时工单
export function timeoutList(params) {
  return request({
    url: "/system/rec/timeoutlist?" +
      qs.stringify(params, {
        arrayFormat: "repeat"
      }),
    method: "get",
  });
}
//转交部门
export function deprtList(data) {
  return request({
    url: "/system/rec/deprt",
    method: "put",
    data: data,
  });
}
//接单
export function recordList(query) {
  return request({
    url: "/system/rec/record",
    method: "get",
    params: query,
  });
}
//部门工单列表
export function postorderList(query) {
  return request({
    url: "/system/rec/postorderlist",
    method: "get",
    params: query,
  });
}
//本人登记
export function myworkorderList(query) {
  return request({
    url: "/system/rec/myworkorder",
    method: "get",
    params: query,
  });
}
//新增订单查询产品
export function departmenticationList(query) {
  return request({
    url: "/system/rec/departmenticationlist",
    method: "get",
    params: query,
  });
}
// 通用移除方法
export function remove(query) {
  return request({
    url: "common/deletefile",
    method: "get",
    params: query,
  });
}
// 首页查询列表
export function toorderList(params) {
  return request({
    url: "/system/rec/toorderlist?" +
      qs.stringify(params, {
        arrayFormat: "repeat"
      }),
    method: "get",
  });
}
//处理人
export function unitPersonlist(query) {
  return request({
    url: "system/user/unitpersonlist",
    method: "get",
    params: query,
  });
}
//机构列表 
export function orgHospitallist(query) {
  return request({
    url: "system/dept/orghospitallist",
    method: "get",
    params: query,
  });
}
//机构列表 
export function personAlstats(query) {
  return request({
    url: "system/rec/personalstats",
    method: "get",
    params: query,
  });
}

//机构列表 
export function getOrgList(query) {
  return request({
    url: "system/dept/getOrgList",
    method: "get",
    params: query,
  });
}
