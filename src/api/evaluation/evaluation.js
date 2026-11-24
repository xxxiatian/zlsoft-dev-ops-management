import request from '@/utils/request'


export function list(query) {
  return request({
    url: "/contractM/contract/list",
    method: "get",
    params: query,
  });
}
export function addEvaluation(data) {
  return request({
    url: "/Evaluation/Eval/add",
    method: "post",
    data: data,
  });
}


export function getEvaluationBy(ordernum) {
  return request({
    url: "/Evaluation/Eval/ordernum/" + ordernum,
    method: "get",
  });
}

export function getEvaluation(id) {
  return request({
    url: "/Evaluation/Eval/" + id,
    method: "get",
  });
}


export function updateEvaluation(data) {
  return request({
    url: "/Evaluation/Eval/update",
    method: "post",
    data: data,
  });
}

export function delEvaluation(data) {
  return request({
    url: "/Evaluation/Eval/del",
    method: "post",
    data: data,
  });
}

export function delM(data) {
  return request({
    url: "/Evaluation/Eval/delM",
    method: "post",
    data: data,
  });
}

// 查询处理中的订单
export function exportEvaluation(query) {
  return request({
    url: "/Evaluation/Eval/export",
    method: "get",
    params: query,
  });
}
