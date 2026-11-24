<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <!-- <el-form-item label="人员类别" prop="notificationStaffType">
        <el-select
          v-model="queryParams.notificationStaffType"
          placeholder="请选择通知人员类别"
          clearable
          size="small"
        >
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item> -->

      <!-- <el-form-item>
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
      </el-form-item> -->
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:from:add']"
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
          v-hasPermi="['system:from:edit']"
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
          v-hasPermi="['system:from:remove']"
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
          v-hasPermi="['system:from:export']"
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
      :data="fromList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="通知id" align="center" prop="notificationId" />
      <el-table-column
        label="通知文本"
        align="center"
        prop="notificationText"
      />
      <el-table-column
        label="通知附件"
        align="center"
        prop="notificationEnclosure"
      />
      <el-table-column
        label="通知人员类别"
        align="center"
        prop="notificationStaffType"
      />
      <el-table-column
        label="通知人员范畴"
        align="center"
        prop="notificationStaffCategory"
      />
      <el-table-column
        label="通知人员范畴内容"
        align="center"
        prop="notificationStaffCategoryValue"
      />
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
            v-hasPermi="['system:from:edit']"
            >修改</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:from:remove']"
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

    <!-- 添加或修改通知对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <!-- <el-row>
          <el-col>
            <el-form-item label="人员类别" prop="notificationStaffType">
              <el-select
                v-model="form.notificationStaffType"
                placeholder="请选择通知人员类别"
              >
                <el-option
                  v-for="rce in statusOptions"
                  :key="rce.dictValue"
                  :label="rce.dictLabel"
                  :value="rce.dictValue"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col>
            <el-form-item label="人员范畴" prop="notificationStaffCategory">
              <el-input
                v-model="form.notificationStaffCategory"
                placeholder="请输入通知人员范畴"
              />
            </el-form-item>
          </el-col>
        </el-row> -->

        <el-row>
          <el-col>
            <el-form-item label="通知标题" prop="notificationTitle">
              <el-input
                v-model="form.notificationTitle"
                placeholder="通知标题"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col>
            <el-form-item label="通知文本" prop="notificationText">
              <editor v-model="form.notificationText" :min-height="192" />
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="通知附件" prop="notificationEnclosure">
              <el-upload
                  class="file-upload"
                  style="width: 62%"
                  action="#"
                  :on-remove="handleRemove"
                  multiple
                  :file-list="fileList"
                  :http-request="requestUpload"
                  :on-preview="onPreview"
                >
                  <el-button size="mini" type="primary">点击上传</el-button>
                </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
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
  listFrom,
  getFrom,
  delFrom,
  addFrom,
  updateFrom,
  exportFrom,
} from "@/api/order/service/notification";
import { uploadFile, serverUrl } from "@/api/common/file";
import Editor from "@/components/Editor";

export default {
  name: "From",
  components: {
    Editor,
  },
  data() {
    return {
      //文件上传
      fileList:[],
      //用户类别
      statusOptions: [],
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
      // 通知表格数据
      fromList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,

        notificationText: null,
        notificationEnclosure: null,
        notificationStaffType: null,
        notificationStaffCategory: null,
        notificationStaffCategoryValue: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {},
    };
  },
  created() {
    this.getDicts("sys_users_type").then((response) => {
      this.statusOptions = response.data;
    });
    this.getList();
  },
  methods: {
    /** 查询通知列表 */
    getList() {
      this.loading = true;
      listFrom(this.queryParams).then((response) => {
        this.fromList = response.rows;
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
        notificationId: null,

        notificationText: null,
        notificationEnclosure: null,
        notificationStaffType: null,
        notificationStaffCategory: null,
        notificationStaffCategoryValue: null,
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
      this.ids = selection.map((item) => item.notificationId);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加通知";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const notificationId = row.notificationId || this.ids;
      getFrom(notificationId).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改通知";
      });
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
            alert (this.form.notificationEnclosure)
          this.form.notificationEnclosure = serverUrl + response.fileName;
        
        } else {
          this.$message.error(response.msg);
        }
      });
    },

    handleRemove(file, fileList) {
      this.fileList.splice(this.fileList.indexOf(file), 1);
    },
    //点击文件预览或下载
    onPreview(file) {
      window.open(file.url, "_blank");
    },


    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.notificationId != null) {
            updateFrom(this.form).then((response) => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addFrom(this.form).then((response) => {
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
      const notificationIds = row.notificationId || this.ids;
      this.$confirm(
        '是否确认删除通知编号为"' + notificationIds + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return delFrom(notificationIds);
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
      this.$confirm("是否确认导出所有通知数据项?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.exportLoading = true;
          return exportFrom(queryParams);
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
