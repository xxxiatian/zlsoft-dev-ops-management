import request from '@/utils/request'


export function list(query) {
  return request({
    url: "/contractM/contract/list",
    method: "get",
    params: query,
  });
}
export function addContract(data) {
  return request({
    url: "/contractM/contract/add",
    method: "post",
    data: data,
  });
}


export function getContractInfo(id) {
  return request({
    url: "/contractM/contract/getContractInfo/" + id,
    method: "get",
  });
}


export function updateContract(data) {
  return request({
    url: "/contractM/contract/update",
    method: "post",
    data: data,
  });
}

export function delContract(data) {
  return request({
    url: "/contractM/contract/del",
    method: "post",
    data: data,
  });
}

export function delM(data) {
  return request({
    url: "/contractM/contract/delM",
    method: "post",
    data: data,
  });
}

export function addQrCode(data) {
  return request({
    url: "/contractM/contract/addQrCode",
    method: "post",
    data: data,
  });
}

export function getQrCodeList(id) {
  return request({
    url: "/contractM/contract/selectQrCodeList/" + id,
    method: "get",
  });
}

export function updateQrCode(data) {
  return request({
    url: "/contractM/contract/updateQrCode",
    method: "post",
    data: data,
  });
}

// 查询处理中的订单
export function exportContract(query) {
  return request({
    url: "/contractM/contract/export",
    method: "get",
    params: query,
  });
}

// 下载用户导入模板
export function importTemplate() {
  return request({
    url: "/contractM/contract/importTemplate",
    method: "get",
  });
}