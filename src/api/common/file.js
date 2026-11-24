import request from "@/utils/request";

/**
 * 文件服务地址（附件预览/下载统一拼接用）。
 * 兼容方案：固定为 ""（同域）——上传接口和附件文件都通过当前访问域名反代到后端：
 *   开发环境：vue.config.js 已把 /profile 代理到本地 8088
 *   生产环境：nginx 需将 /profile/ 转发到后端服务（如 https://djwt.zzqjia.com/profile/ → 8088）
 * 好处：新附件只存相对路径，换域名无需迁移数据；历史绝对地址附件由 resolveFileUrl 剥离域名后同样走当前域名
 */
export const serverUrl = "";

/**
 * 从任意文件地址中提取相对路径（剥离 http(s)://域名、代理前缀），用于统一存储与跨域名兼容。
 * 历史数据中存的是绝对地址（如 http://182.92.156.234:8088/profile/...），剥离后同样得到 /profile/...
 */
export function toFilePath(url) {
  if (!url) return "";
  let p = String(url);
  if (/^https?:\/\//i.test(p)) {
    try {
      p = new URL(p).pathname;
    } catch (e) {
      p = p.replace(/^https?:\/\/[^/]+/i, "");
    }
  }
  if (p.indexOf("/dev-api/") === 0) {
    p = p.substring("/dev-api".length);
  }
  return p;
}

/**
 * 相对路径（或历史绝对地址）→ 当前文件服务的完整预览地址。
 * 兼容旧数据：无论存的是老域名还是新相对路径，都用当前 serverUrl 拼接，换域名后旧附件仍可下载
 */
export function resolveFileUrl(url) {
  return serverUrl + toFilePath(url);
}

// 文件上传
export function uploadFile(data) {
  return request({
    url: "/common/upload",
    method: "post",
    data: data,
  });
}

export function uploadFileOne(data) {
  return request({
    url: "/common/uploadFileOne",
    method: "post",
    data: data,
  });
}
