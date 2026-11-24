<template>
  <div class="app-container">
    <div class="contain-top">
      <el-form :model="queryParams"  ref="queryForm" :inline="true"  v-show="showSearch" label-width="68px" >
        <el-form-item label="服务单号" prop="documentNo">
          <el-input  v-model="queryParams.documentNo" placeholder="请输入服务单号"  clearable  size="small"  @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item label="科室电话" prop="deptPhone">
          <el-input  v-model="queryParams.deptPhone"  placeholder="请输入科室电话"  clearable  size="small"  @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item label="申请人员" prop="reqStaff">
          <el-input  v-model="queryParams.reqStaff"   placeholder="请输入申请人员"  clearable  size="small"  @keyup.enter.native="handleQuery" />
        </el-form-item>

        <el-form-item>
          <el-button icon="el-icon-search"  size="mini"  @click="handleQuery" type="primary">
            搜索
          </el-button>
          <el-button icon="el-icon-refresh" size="mini"  @click="resetQuery">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="contain-cont">
      <el-table :data="recList" table-cloumn v-loading="loading"  @selection-change="handleSelectionChange" height="calc(100% - 50px)">
        <el-table-column type="selection" width="50px" align="center" />
        <el-table-column  label="服务单号" prop="documentNo"      width="160px" align="center" />
        <el-table-column  label="工单状态" prop="documentStatus"  width="100%"  align="center" />
        <el-table-column  label="医院名称" prop="hospitalName"    width="100%"  align="center" />
        <el-table-column  label="申请科室" prop="reqDept"         width="100%"  align="center" />
        <el-table-column  label="科室电话" prop="deptPhone"       width="110%"  align="center"/>
        <el-table-column  label="申请人员" prop="reqStaff"        width="100%"  align="center" />
        <el-table-column  label="服务详细描述" prop="serviceDetall"  width="100%" align="center" :show-overflow-tooltip="true" />
        <el-table-column  label="申请时间" prop="reqDatetime"     width="100%"  align="center">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.reqDatetime, "{y}-{m}-{d}") }}</span>
          </template>
        </el-table-column>
        <el-table-column  label="服务类型" prop="serviceType"     width="100%"  align="center"/>
        <el-table-column  label="服务类别" prop="serviceClass"    width="100%"  align="center" />
        <el-table-column  label="严重程度" prop="severity"        width="100%"  align="center" />
        <el-table-column  label="紧急程度" prop="urgency"         width="100%"  align="center" />
        <!-- <el-table-column
          label="发生位置"
          width="100%"
          align="center"
          prop="happenPosition"
        /> -->
        <!-- <el-table-column
          label="分配人"
          width="100%"
          align="center"
          prop="assignStaff"
        /> -->
        <!-- <el-table-column
          label="分配时间"
          align="center"
          prop="assignDatetime"
          width="100%"
        >
          <template slot-scope="scope">
            <span>{{
              parseTime(scope.row.assignDatetime, "{y}-{m}-{d}")
            }}</span>
          </template>
        </el-table-column> -->
        <!-- <el-table-column
          label="处理科室"
          width="100%"
          align="center"
          prop="processDept"
        /> -->
        <!-- <el-table-column
          label="处理人"
          width="100%"
          align="center"
          prop="processStaff"
        />
        <el-table-column
          label="处理时间"
          align="center"
          prop="processDatetime"
          width="100%"
        >
          <template slot-scope="scope">
            <span>{{
              parseTime(scope.row.processDatetime, "{y}-{m}-{d} {h}:{i}:{s}")
            }}</span>
          </template>
        </el-table-column> -->
        <!-- <el-table-column
          label="是否构成问题"
          width="100%"
          align="center"
          prop="serviceConfirl"
        />
        <el-table-column
          label="服务是否完成"
          width="100%"
          align="center"
          prop="serviceFinished"
        />
        <el-table-column
          label="服务完成时间"
          align="center"
          prop="finishedDatetime"
          width="100%"
        >
          <template slot-scope="scope">
            <span>{{
              parseTime(scope.row.finishedDatetime, "{y}-{m}-{d}")
            }}</span>
          </template>
        </el-table-column> -->
        <!-- <el-table-column
          label="评价得分"
          width="100%"
          align="center"
          prop="judgeScore"
        />
        <el-table-column
          label="绩效得分"
          width="100%"
          align="center"
          prop="performanceScore"
        /> -->
        <el-table-column  label="操作"  align="center" width="100%" fixed="right"  class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button  id="btn"  size="mini"  type="text"  icon="el-icon-edit" @click="assign(scope.row)"  v-hasPermi="['system:select:document']">
              接单
            </el-button>
          </template>
        </el-table-column>
      </el-table>

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

import { getUserProfile } from "@/api/system/user";
import { listDept } from "@/api/system/dept";
import Treeselect from "@riophae/vue-treeselect";

import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "Select",
  components: {
    Treeselect,
  },

  data() {
    return {
      //处理科室
      deptOptions: [],
      //登录信息
      userInfor: [],
      //用户数据
      userList: [],
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
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        id: null,
        orderstatus: null,
        unitname: null,
        tel: null,
        createBy: null,
        describe: null,
        createAt: null,
        desiretime: null,
        currentusername: null,
        arrangetime: null,
        processing: null,
        servicetype: null,
        stopter: null,
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
      if (this.userInfor.usersTypeValue == "系统管理员") {
        this.queryParams.documentStatus = "待接单";
      } else if (this.userInfor.usersTypeValue == "员工") {
        this.queryParams.documentStatus = "待接单";
      }
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
            this.msgSuccess("接单成功");
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

    /** 开始处理 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;

      this.requesdate();
      getRec(id).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "处理";
      });
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
            }).catch(() => {});
          } else {
            addRec(this.form).then((response) => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            }).catch(() => {});
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
}
</style>
