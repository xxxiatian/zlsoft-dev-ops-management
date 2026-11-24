import Vue from "vue";

import Cookies from "js-cookie";

import Element from "element-ui";
import "./assets/styles/element-variables.scss";

import "@/assets/styles/index.scss"; // global css
import "@/assets/styles/zlsoft.scss"; // zlsoft css
import App from "./App";
import store from "./store";
import router from "./router";
import permission from "./directive/permission";

import "./assets/icons"; // icon
import "./permission"; // permission control
import { getDicts } from "@/api/system/dict/data";
import { getConfigKey } from "@/api/system/config";
import {
  parseTime,
  resetForm,
  addDateRange,
  selectDictLabel,
  selectDictLabels,
  download,
  handleTree,
} from "@/utils/zlsoft";
import Pagination from "@/components/Pagination";
// 自定义表格工具组件
import RightToolbar from "@/components/RightToolbar";

// 字典标签组件
import DictTag from "@/components/DictTag";
// 头部标签组件

// 全局方法挂载
Vue.prototype.getDicts = getDicts;
Vue.prototype.getConfigKey = getConfigKey;
Vue.prototype.parseTime = parseTime;
Vue.prototype.resetForm = resetForm;
Vue.prototype.addDateRange = addDateRange;
Vue.prototype.selectDictLabel = selectDictLabel;
Vue.prototype.selectDictLabels = selectDictLabels;
Vue.prototype.download = download;
Vue.prototype.handleTree = handleTree;

// 全局消息去重：2秒内相同内容只弹一次（防止重复点击/事件重复触发导致堆叠多个相同提示）
const _msgTimeMap = {};
function _dedupMsg(key) {
  const now = Date.now();
  if (_msgTimeMap[key] && now - _msgTimeMap[key] < 2000) {
    return false;
  }
  _msgTimeMap[key] = now;
  // 清理过期key，防止Map无限增长
  const keys = Object.keys(_msgTimeMap);
  if (keys.length > 50) {
    keys.forEach((k) => {
      if (now - _msgTimeMap[k] >= 2000) {
        delete _msgTimeMap[k];
      }
    });
  }
  return true;
}

Vue.prototype.msgSuccess = function (msg) {
  if (!_dedupMsg("s:" + msg)) return;
  this.$message({ showClose: true, message: msg, type: "success" });
};

Vue.prototype.msgError = function (msg) {
  if (!_dedupMsg("e:" + msg)) return;
  this.$message({ showClose: true, message: msg, type: "error" });
};

Vue.prototype.msgInfo = function (msg) {
  if (!_dedupMsg("i:" + msg)) return;
  this.$message.info(msg);
};

// 全局组件挂载
Vue.component("DictTag", DictTag);
Vue.component("Pagination", Pagination);
Vue.component("RightToolbar", RightToolbar);

Vue.use(permission);

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online! ! !
 */

Vue.use(Element, {
  size: Cookies.get("size") || "medium", // set element-ui default size
});

Vue.config.productionTip = false;

new Vue({
  el: "#app",
  router,
  store,
  render: (h) => h(App),
});
