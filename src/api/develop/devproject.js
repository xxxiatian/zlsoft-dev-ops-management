import request from '@/utils/request'

// 查询开发项目列表
export function listDevproject(query) {
  return request({
    url: "/devops/devproject/list",
    method: "get",
    params: query,
  });
}

// 查询开发项目详情（含联系人）
export function getDevproject(id) {
  return request({
    url: "/devops/devproject/" + id,
    method: "get",
  });
}

// 新增开发项目
export function addDevproject(data) {
  return request({
    url: "/devops/devproject",
    method: "post",
    data: data,
  });
}

// 修改开发项目
export function updateDevproject(data) {
  return request({
    url: "/devops/devproject",
    method: "put",
    data: data,
  });
}

// 删除开发项目
export function delDevproject(data) {
  return request({
    url: "/devops/devproject/del",
    method: "post",
    data: data,
  });
}

// 批量删除开发项目
export function delMDevproject(data) {
  return request({
    url: "/devops/devproject/delM",
    method: "post",
    data: data,
  });
}

// 导出开发项目列表
export function exportDevproject(query) {
  return request({
    url: "/devops/devproject/export",
    method: "get",
    params: query,
  });
}

// 获取已关联开发的合同列表（开发管理-合同列表页签，点击"新增"基于合同登记项目）
export function devLinkContractList() {
  return request({
    url: "/devops/devproject/contractlist",
    method: "get",
  });
}

// 我的项目列表（负责人/实施人员查看派给自己的开发项目，个人管理-待处理列表页展示）
export function listMine(query) {
  return request({
    url: "/devops/devproject/mine/list",
    method: "get",
    params: query,
  });
}

// 项目状态流转：开始实施(未实施→正在实施)/实施完成(正在实施→已实施未验收)/验收登记(已实施未验收→已验收)
export function updateMineStatus(data) {
  return request({
    url: "/devops/devproject/mine/status",
    method: "put",
    data: data,
  });
}
// 我的项目详情（含联系人）
export function getMine(id) {
  return request({
    url: "/devops/devproject/mine/detail/" + id,
    method: "get",
  });
}
