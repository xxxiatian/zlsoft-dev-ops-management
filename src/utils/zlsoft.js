/**
 * 通用js方法封装处理
 * Copyright (c) 2019 zlsoft
 */

const baseURL = process.env.VUE_APP_BASE_API;
// 附件文件服务地址：同域反代（开发环境 /profile 由 vue.config.js 代理，生产环境由 nginx 转发），换域名无需改代码
export const serverUrl = "";
const pinyin = require('pinyin');
// 日期格式化
export function parseTime(time, pattern) {
  if (arguments.length === 0 || !time) {
    return null;
  }
  const format = pattern || "{y}-{m}-{d} {h}:{i}:{s}";
  let date;
  if (typeof time === "object") {
    date = time;
  } else {
    if (typeof time === "string" && /^[0-9]+$/.test(time)) {
      time = parseInt(time);
    } else if (typeof time === "string") {
      time = time.replace(new RegExp(/-/gm), "/");
    }
    if (typeof time === "number" && time.toString().length === 10) {
      time = time * 1000;
    }
    date = new Date(time);
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay(),
  };
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key];
    // Note: getDay() returns 0 on Sunday
    if (key === "a") {
      return ["日", "一", "二", "三", "四", "五", "六"][value];
    }
    if (result.length > 0 && value < 10) {
      value = "0" + value;
    }
    return value || 0;
  });
  return time_str;
}

// 表单重置
export function resetForm(refName) {
  if (this.$refs[refName]) {
    this.$refs[refName].resetFields();
  }
}

// 添加日期范围
export function addDateRange(params, dateRange, propName) {
  var search = params;
  search.params = {};
  if (null != dateRange && "" != dateRange) {
    if (typeof propName === "undefined") {
      search.params["beginTime"] = dateRange[0];
      search.params["endTime"] = dateRange[1];
    } else {
      search.params["begin" + propName] = dateRange[0];
      search.params["end" + propName] = dateRange[1];
    }
  }
  return search;
}

// 回显数据字典
export function selectDictLabel(datas, value) {
  var actions = [];
  Object.keys(datas).some((key) => {
    if (datas[key].dictValue == "" + value) {
      actions.push(datas[key].dictLabel);
      return true;
    }
  });
  return actions.join("");
}

// 回显数据字典（字符串数组）
export function selectDictLabels(datas, value, separator) {
  var actions = [];
  var currentSeparator = undefined === separator ? "," : separator;
  var temp = value.split(currentSeparator);
  Object.keys(value.split(currentSeparator)).some((val) => {
    Object.keys(datas).some((key) => {
      if (datas[key].dictValue == "" + temp[val]) {
        actions.push(datas[key].dictLabel + currentSeparator);
      }
    });
  });
  return actions.join("").substring(0, actions.join("").length - 1);
}

// 通用下载方法
export function download(fileName) {
  window.location.href =
    baseURL +
    "/common/download?fileName=" +
    encodeURI(fileName) +
    "&delete=" +
    true;
}

// 字符串格式化(%s )
export function sprintf(str) {
  var args = arguments,
    flag = true,
    i = 1;
  str = str.replace(/%s/g, function () {
    var arg = args[i++];
    if (typeof arg === "undefined") {
      flag = false;
      return "";
    }
    return arg;
  });
  return flag ? str : "";
}

// 转换字符串，undefined,null等转化为""
export function praseStrEmpty(str) {
  if (!str || str == "undefined" || str == "null") {
    return "";
  }
  return str;
}

/**
 * 构造树型结构数据
 * @param {*} data 数据源
 * @param {*} id id字段 默认 'id'
 * @param {*} parentId 父节点字段 默认 'parentId'
 * @param {*} children 孩子节点字段 默认 'children'
 * @param {*} rootId 根Id 默认 0
 */
export function handleTree(data, id, parentId, children) {
  id = id || "id";
  parentId = parentId || "parentId";
  children = children || "children";
  if (!Array.isArray(data) || data.length === 0) return [];
  const cloneData = JSON.parse(JSON.stringify(data));

  const tree = cloneData.filter(node => {
    // 弱相等匹配父子，解决数字/字符串ID不匹配
    node[children] = cloneData.filter(child => {
      return String(node[id]) === String(child[parentId]);
    });
    const pid = node[parentId];
    // 兼容 0、"0"、null、空字符串、-1 根节点
    return pid == 0 || pid == -1 || pid === null || pid === "";
  });
  return tree.length > 0 ? tree : cloneData;
}
// export function handleTree(data, id, parentId, children, rootId) {
//   id = id || "id";
//   parentId = parentId || "parentId";
//   children = children || "children";
//   rootId =
//     rootId ||
//     Math.min.apply(
//       Math,
//       data.map((item) => {
//         return item[parentId];
//       })
//     ) ||
//     0;
//   //对源数据深度克隆
//   const cloneData = JSON.parse(JSON.stringify(data));
//   //循环所有项
//   const treeData = cloneData.filter((father) => {
//     let branchArr = cloneData.filter((child) => {
//       //返回每一项的子级数组
//       return father[id] === child[parentId];
//     });
//     branchArr.length > 0 ? (father.children = branchArr) : "";
//     //返回第一层
//     return father[parentId] === rootId;
//   });
//   return treeData != "" ? treeData : data;
// }
//js获取日期，获取p_count天后的日期 p_count -3  三天前
export function FunGetDateStr(p_count) {
  var dd = new Date();
  dd.setDate(dd.getDate() + p_count); //获取p_count天后的日期
  var y = dd.getFullYear();
  var m = dd.getMonth() + 1; //获取当前月份的日期
  if (m < 10) {
    m = "0" + m;
  }
  var d = dd.getDate();
  if (d < 10) {
    d = "0" + d;
  }
  return y + "-" + m + "-" + d;
}


 export function generateFirstLetter(chinese) {
    // 将汉字转换为拼音数组
    let pinyinArray = pinyin(chinese, {
        style: pinyin.STYLE_FIRST_LETTER, // 只获取首字母
        heteronymy: false // 不需要多音字
    });

    // 提取每个拼音的首字母并连接成字符串
    let firstLetters = pinyinArray.map(item => item[0].toUpperCase()).join('');

    return firstLetters;
}
export function formatToYYYYMMDDHHMMSS(dateStr) {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月份是从0开始的
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}