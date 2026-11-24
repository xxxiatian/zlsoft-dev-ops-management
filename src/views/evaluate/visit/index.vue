<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
      label-width="100px"
    >
      
    
      <el-form-item label="申请人姓名" prop="reqStaffName">
        <el-input
          v-model="queryParams.reqStaffName"
          placeholder="请输入申请人员姓名"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
     
      <el-form-item label="处理人姓名" prop="processStaffName">
        <el-input
          v-model="queryParams.processStaffName"
          placeholder="请输入处理人员姓名"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      
      <el-form-item label="评价时间" prop="evaluateDate">
        <el-date-picker
          clearable
          size="small"
          v-model="queryParams.evaluateDate"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择评价时间"
        >
        </el-date-picker>
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

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:evaluate:add']"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:evaluate:edit']"
          >修改</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:evaluate:remove']"
          >删除</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          :loading="exportLoading"
          @click="handleExport"
          v-hasPermi="['system:evaluate:export']"
          >导出</el-button
        >
      </el-col>
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="evaluateList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <!-- <el-table-column
        label="工单评价id"
        align="center"
        prop="serviceEvaluateId"
      /> -->
      <!-- <el-table-column label="工单id" align="center" prop="serviceId" /> -->
      <!-- <el-table-column label="申请人员id" align="center" prop="reqStaffId" /> -->
      <el-table-column
        label="申请人姓名"
        align="center"
        prop="reqStaffName"
      />
      <!-- <el-table-column
        label="处理人员id"
        align="center"
        prop="processStaffId"
      /> -->
      <el-table-column
        label="处理人姓名"
        align="center"
        prop="processStaffName"
      />
      <el-table-column
        label="总体评价星级"
        align="center"
        prop="evaluateLevel"
      />
      <el-table-column label="评价描述内容" align="center" prop="content" />
      <el-table-column
        label="评价上传附件"
        align="center"
        prop="evaluateFile"
      />
      <el-table-column label="评价标签" align="center" prop="evaluateTag" />
      <el-table-column
        label="评价时间"
        align="center"
        prop="evaluateDate"
        width="180"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.evaluateDate, "{y}-{m}-{d}") }}</span>
        </template>
      </el-table-column>
      <el-table-column label="是否显示" align="center" prop="visible" />
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:evaluate:edit']"
            >修改</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:evaluate:remove']"
            >删除</el-button
          >
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

    <!-- 添加或修改工单评价对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="工单id" prop="serviceId">
          <el-input v-model="form.serviceId" placeholder="请输入工单id" />
        </el-form-item>
        <el-form-item label="申请人id" prop="reqStaffId">
          <el-input v-model="form.reqStaffId" placeholder="请输入申请人员id" />
        </el-form-item>
        <el-form-item label="申请人姓名" prop="reqStaffName">
          <el-input
            v-model="form.reqStaffName"
            placeholder="请输入申请人员姓名"
          />
        </el-form-item>
        <el-form-item label="处理人id" prop="processStaffId">
          <el-input
            v-model="form.processStaffId"
            placeholder="请输入处理人员id"
          />
        </el-form-item>
        <el-form-item label="处理人姓名" prop="processStaffName">
          <el-input
            v-model="form.processStaffName"
            placeholder="请输入处理人员姓名"
          />
        </el-form-item>
        <el-form-item label="总体评价星级" prop="evaluateLevel">
          <el-input
            v-model="form.evaluateLevel"
            placeholder="请输入总体评价星级"
          />
        </el-form-item>
        <el-form-item label="评价描述内容">
          <editor v-model="form.content" :min-height="192" />
        </el-form-item>
        <el-form-item label="评价上传附件">
          <fileUpload v-model="form.evaluateFile" />
        </el-form-item>
        <el-form-item label="评价标签" prop="evaluateTag">
          <el-input
            v-model="form.evaluateTag"
            type="textarea"
            placeholder="请输入内容"
          />
        </el-form-item>
        <el-form-item label="评价时间" prop="evaluateDate">
          <el-date-picker
            clearable
            size="small"
            v-model="form.evaluateDate"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="选择评价时间"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="是否显示" prop="visible">
          <el-input v-model="form.visible" placeholder="请输入是否显示" />
        </el-form-item>
        <el-form-item label="删除标志" prop="delFlag">
          <el-input v-model="form.delFlag" placeholder="请输入删除标志" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listEvaluate,
  getEvaluate,
  delEvaluate,
  addEvaluate,
  updateEvaluate,
  exportEvaluate,
} from "@/api/order/service/evaluate";
import FileUpload from "@/components/FileUpload";
import Editor from "@/components/Editor";

export default {
  name: "Evaluate",
  components: {
    FileUpload,
    Editor,
  },
  data() {
    return {
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
      // 工单评价表格数据
      evaluateList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        serviceId: null,
        reqStaffId: null,
        reqStaffName: null,
        processStaffId: null,
        processStaffName: null,
        evaluateLevel: null,
        content: null,
        evaluateFile: null,
        evaluateTag: null,
        evaluateDate: null,
        visible: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {},
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询工单评价列表 */
    getList() {
      this.loading = true;
      listEvaluate(this.queryParams).then((response) => {
        this.evaluateList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        serviceEvaluateId: null,
        serviceId: null,
        reqStaffId: null,
        reqStaffName: null,
        processStaffId: null,
        processStaffName: null,
        evaluateLevel: null,
        content: null,
        evaluateFile: null,
        evaluateTag: null,
        evaluateDate: null,
        visible: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        delFlag: null,
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
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.serviceEvaluateId);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加工单评价";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const serviceEvaluateId = row.serviceEvaluateId || this.ids;
      getEvaluate(serviceEvaluateId).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改工单评价";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.serviceEvaluateId != null) {
            updateEvaluate(this.form).then((response) => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addEvaluate(this.form).then((response) => {
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
      const serviceEvaluateIds = row.serviceEvaluateId || this.ids;
      this.$confirm(
        '是否确认删除工单评价编号为"' + serviceEvaluateIds + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return delEvaluate(serviceEvaluateIds);
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
      this.$confirm("是否确认导出所有工单评价数据项?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.exportLoading = true;
          return exportEvaluate(queryParams);
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
