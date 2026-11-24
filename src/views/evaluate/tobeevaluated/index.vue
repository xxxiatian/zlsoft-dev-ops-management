<template>
  <div class="app-container">
    <div class="contain-top">
      <el-form
        :model="queryParams"
        ref="queryForm"
        :inline="true"
        v-show="showSearch"
        label-width="68px"
      >
        <el-form-item label="服务单号" prop="documentNo">
          <el-input
            v-model="queryParams.documentNo"
            placeholder="请输入服务单号"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>

        <el-form-item label="科室电话" prop="deptPhone">
          <el-input
            v-model="queryParams.deptPhone"
            placeholder="请输入科室电话"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="申请人员" prop="reqStaff">
          <el-input
            v-model="queryParams.reqStaff"
            placeholder="请输入申请人员"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            size="mini"
            @click="handleQuery"
            >搜索</el-button
          >
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery"
            >重置</el-button
          >
        </el-form-item>
      </el-form>
    </div>
    <div class="contain-cont">
      <el-table
        table-cloumn
        v-loading="loading"
        :data="recList"
        @selection-change="handleSelectionChange"
        height="calc(100% - 50px)"
      >
        <el-table-column type="selection" width="50px" align="center" />
        <el-table-column
          label="服务单号"
          width="150px"
          align="center"
          prop="documentNo"
        />
        <el-table-column
          label="工单状态"
          width="100%"
          align="center"
          prop="documentStatus"
        />
        <el-table-column
          label="医院名称"
          width="100%"
          align="center"
          prop="hospitalName"
        />
        <el-table-column
          label="申请科室"
          width="100%"
          align="center"
          prop="reqDept"
        />
        <el-table-column
          label="科室电话"
          width="110%"
          align="center"
          prop="deptPhone"
        />
        <el-table-column
          label="申请人员"
          width="100%"
          align="center"
          prop="reqStaff"
        />
        <el-table-column
          :show-overflow-tooltip="true"
          label="服务详细描述"
          width="100%"
          align="center"
          prop="serviceDetall"
        />
        <el-table-column
          label="申请时间"
          align="center"
          prop="reqDatetime"
          width="100%"
        >
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.reqDatetime, "{y}-{m}-{d}") }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="服务类型"
          width="100%"
          align="center"
          prop="serviceType"
        />
        <el-table-column
          label="服务类别"
          width="100%"
          align="center"
          prop="serviceClass"
        />
        <el-table-column
          label="严重程度"
          width="100%"
          align="center"
          prop="severity"
        />
        <el-table-column
          label="紧急程度"
          width="100%"
          align="center"
          prop="urgency"
        />

        <el-table-column
          label="操作"
          align="center"
          width="100%"
          fixed="right"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="scope">
            <el-button
              id="btn"
              size="mini"
              type="text"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['system:evaluate:evaluateDocument']"
              >评价</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- 评价 -->
      <el-dialog
        :title="title"
        :visible.sync="open"
        width="500px"
        append-to-body
      >
        <el-form ref="form" :model="form" :rules="rules" label-width="80px">
          <el-row>
            <el-col>
              <el-form-item label="星 级">
                <el-rate style="margin-top: 7px" v-model="value" show-text>
                </el-rate>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col>
              <el-form-item label="评价内容" prop="content">
                <el-input
                  v-model="content"
                  type="textarea"
                  placeholder="请输入评价内容"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="上传附件">
                <el-upload
                  class="file-upload"
                  style="width: 62%"
                  action="#"
                  :file-list="fileList"
                  :http-request="requestUpload"
                  :on-preview="onPreview"
                >
                  <el-button size="mini" type="primary">点击上传</el-button>
                </el-upload>
              </el-form-item>
            </el-col>

            <el-col>
              <el-form-item label="标签">
                <el-tag
                  id="color"
                  style="margin: 5px; cursor: pointer"
                  v-for="item in items"
                  :key="item.tagId"
                  effect="plain"
                  :class="{ tagAlter: evaluateTagId.indexOf(item.tagId) > -1 }"
                  @click="selectTagDesc(item.tagId, item.tagDesc)"
                >
                  {{ item.tagDesc }}
                </el-tag>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" id="hidden" @click="elButton()"
            >确 定</el-button
          >
          <el-button @click="dialogone">取 消</el-button>
        </div>
      </el-dialog>
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </div>
  </div>
</template>

<script>
import {
  getRec,
  delRec,
  addRec,
  updateRecProcess,
  updatedocument,
  selectlist,
  exportRec,
} from "@/api/order/service/rec";
import { listType } from "@/api/order/service/type";
import { getUserProfile } from "@/api/system/user";
import { listDept } from "@/api/system/dept";
import { evaluateDocument } from "@/api/order/service/evaluate";
import { parseTime } from "@/utils/zlsoft";
import { uploadFile, serverUrl } from "@/api/common/file";

import Treeselect from "@riophae/vue-treeselect";

import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "Rec",
  components: {
    Treeselect,
  },

  data() {
    return {
      //文件
      enclosure: [],
      documentId: "",
      //文件上传
      fileList: [],
      //评价标签
      items: [],
      value: 0,
      tagearr: [],
      //处理科室
      deptOptions: [],
      //登录信息
      userInfor: [],
      //用户数据
      userList: [],
      content: "",
      // 遮罩层
      loading: true,
      // 导出遮罩层
      exportLoading: false,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 【请填写功能名称】表格数据
      recList: [],
      statusOptions: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否显示弹出层
      openDown: false,
      // 评价标签
      evaluateTagId: [],
      evaluateTags: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        documentNo: null,
        documentStatus: null,
        reqDept: null,
        deptPhone: null,
        reqStaff: null,
        reqDatetime: null,
        serviceType: null,
        serviceClass: null,
        severity: null,
        urgency: null,
        happenPosition: null,
        serviceDetall: null,
        enclosure: null,
        assignStaff: null,
        assignDatetime: null,
        processDept: null,
        processStaff: null,
        processDatetime: null,
        serviceConfirl: null,
        serviceFinished: null,
        finishedDatetime: null,
        judgeScore: null,
        performanceScore: null,

        Content: "",
        isClear: false,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        documentNo: [
          { required: true, message: "服务单号不能为空", trigger: "blur" },
        ],
        documentStatus: [
          {
            required: true,
            message: "单据状态",
            trigger: "blur",
          },
        ],
        reqDept: [
          { required: true, message: "申请科室不能为空", trigger: "blur" },
        ],
        deptPhone: [
          { required: true, message: "科室电话不能为空", trigger: "blur" },
        ],
        reqStaff: [
          { required: true, message: "申请人员不能为空", trigger: "blur" },
        ],
        reqDatetime: [
          { required: true, message: "申请时间不能为空", trigger: "blur" },
        ],
        serviceDetall: [
          { required: true, message: "服务详细描述不能为空", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getUseruser();

    this.getTreeselect();

    this.getDicts("sys_document_status").then((response) => {
      this.statusOptions = response.data;
    });
  },

  methods: {
    // 取消按钮
    dialogone() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        documentNo: null,
        documentStatus: 0,
        reqDept: null,
        deptPhone: null,
        reqStaff: null,
        reqDatetime: null,
        serviceType: null,
        serviceClass: null,
        severity: null,
        urgency: null,
        happenPosition: null,
        serviceDetall: null,
        enclosure: null,
        assignStaff: null,
        assignDatetime: null,
        processDept: null,
        processStaff: null,
        processDatetime: null,
        serviceConfirl: null,
        serviceFinished: null,
        finishedDatetime: null,
        judgeScore: null,
        performanceScore: null,
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },

    /** 获取登录信息 */
    getUseruser() {
      getUserProfile().then((response) => {
        this.form.processDeptId = response.data.deptId;
        this.form.deptPhone = response.data.phonenumber;
        this.form.procesStaffId = response.data.userId;
        this.form.processStaff = response.data.nickName;
        this.form.processDept = response.data.dept.deptName;
        this.userInfor = response.data;
        this.getList();
      });
    },

    /** 查询【请填写功能名称】列表 */
    getList() {
      this.loading = true;
      this.queryParams.documentStatus = "已处理";
      selectlist(this.queryParams).then((response) => {
        this.recList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },

    selectDept(node) {
      this.form.processDeptId = node.deptId;
      this.form.processDept = node.deptName;
    },

    /** 查询部门下拉树结构 */
    getTreeselect() {
      listDept().then((response) => {
        this.deptOptions = this.handleTree(response.data, "deptId");
      });
    },

    /** 转换部门数据结构 */
    normalizerDept(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.deptId,
        label: node.deptName,
        children: node.children,
      };
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    requesdate() {
      this.form.processDatetime = new Date();
      this.form.finishedDatetime = new Date();
    },

    assign(row) {
      const ids = row.id || this.ids;
      if (row.documentStatus == "待接单") {
        this.$confirm('是否要接"' + row.reqStaff + '"提交的工单?', "", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(function () {
            let obj = {
              documentStatus: "处理中",
              id: row.id,
            };
            return updatedocument(obj);
          })
          .then(() => {
            this.handleUpdate(row);
            this.msgSuccess("处理成功");
            this.getList();
          })
          .catch(() => {});
      } else {
        this.handleUpdate(row);
      }
    },

    /** 查看详情*/
    handlelike(row) {
      this.reset();
      const id = row.id || this.ids;
      getRec(id).then((response) => {
        this.form = response.data;
        this.openDown = true;
        this.title = "查看详情";
      });
    },

    /** 评价*/
    handleUpdate(rows) {
      this.documentId = rows.id;
      this.listTypes();
      this.open = true;
      this.title = "评价";
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id != null) {
            updateRecProcess(this.form).then((response) => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addRec(this.form).then((response) => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm(
        '是否确认删除【请填写功能名称】编号为"' + ids + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return delRec(ids);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        })
        .catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm("是否确认导出所有【请填写功能名称】数据项?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.exportLoading = true;
          return exportRec(queryParams);
        })
        .then((response) => {
          this.download(response.msg);
          this.exportLoading = false;
        })
        .catch(() => {});
    },

    //查询标签
    listTypes() {
      this.loading = true;
      listType().then((response) => {
        console.log(response);
        this.items = response.rows;
        this.loading = false;
      });
    },
    //评价标签
    selectTagDesc(tagId, tagDesc) {
      let arrIndex = this.evaluateTagId.indexOf(tagId);
      if (arrIndex > -1) {
        this.evaluateTagId.splice(arrIndex, 1);
        this.evaluateTags.splice(tagDesc, 1);
      } else {
        this.evaluateTagId.push(tagId);
        this.evaluateTags.push(tagDesc);
      }
    },

    // 覆盖默认的上传行为
    requestUpload(imageData) {
      const file = imageData.file;
      const formData = new FormData();
      formData.append("file", file);

      uploadFile(formData).then((response) => {
        if (response.code == 200) {
          const name = file.name;
          this.fileList.push({
            url: serverUrl + response.fileName,
            name: name,
          });
          var pics = [];
          this.fileList.forEach((ele) => {
            pics.push(ele.url + "::" + ele.name);
          });
          this.enclosure = pics.join(",");
        } else {
          this.$message.error(response.msg);
        }
      });
    },

    //点击文件预览或下载
    onPreview(file) {
      window.open(file.name, "_blank");
    },

    elButton() {
      this.$confirm("是否要提交该工单的评价?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          if (this.content == "" || this.content == null) {
            this.$message("请填写评价描述");
            return;
          }
          var obj = {
            serviceId: this.documentId,
            evaluateDate: parseTime(new Date(), "{y}-{m}-{d} {h}:{i}:{s}"),
            evaluateLevel: this.value,
            content: this.content,
            evaluateFile: this.enclosure,
            evaluateTags: this.evaluateTags,
            evaluateTagId: this.evaluateTagId,
            visible: "1",
          };
          evaluateDocument(obj).then((res) => {
            console.log(res);
            if (res.code == 200) {
              this.$message.success("评价成功");
              this.value = 0;
              this.content = "";
              (this.evaluateTags = []),
                (this.evaluateTagId = []),
                (this.fileList = []),
                this.getList();
              this.open = false;
            } else {
              this.$message.error(res.data.msg);
            }
          });
        })
        .catch(() => {
          // on cancel
        });
    },
  },
};
</script>
<style scoped lang="scss">
.app-container {
  overflow: hidden;
  .contain-top {
    height: 55px;
    .el-form-item {
      margin-bottom: 10px;
    }
  }
  .contain-cont {
    height: calc(100% - 55px);
    overflow-y: auto;
  }
  .pagination-container {
    margin: 0;
  }
  .sss {
    background: #3399ff;
    border-radius: 10px;
    color: #ffffff;
  }
}
.tagAlter {
  background-color: rgb(252, 242, 233);
  color: rgb(216, 122, 62);
  border: 1px solid rgb(216, 122, 62);
}
</style>
