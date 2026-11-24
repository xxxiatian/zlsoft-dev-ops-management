<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <!-- <el-form-item label="服务单号" prop="documentNo">
        <el-input
          v-model="queryParams.documentNo"
          placeholder="请输入服务单号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item> -->
      <!-- <el-form-item label="处理人" prop="processStaff">
        <el-input
          v-model="queryParams.processStaff"
          placeholder="请输入处理人"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item> -->
      <!-- <el-form-item label="处理人id" prop="processStaffId">
        <el-input
          v-model="queryParams.processStaffId"
          placeholder="请输入处理人id"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item> -->
      <!-- <el-form-item label="申请人id" prop="reqStaffId">
        <el-input
          v-model="queryParams.reqStaffId"
          placeholder="请输入申请人id"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item> -->
      <!-- <el-form-item label="申请人" prop="reqStaff">
        <el-input
          v-model="queryParams.reqStaff"
          placeholder="请输入申请人"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item> -->
      <!-- <el-form-item label="服务详细" prop="serviceDetall">
        <el-input
          v-model="queryParams.serviceDetall"
          placeholder="请输入服务详细"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item> -->
      <!-- <el-form-item label="附件" prop="enclosure">
        <el-input
          v-model="queryParams.enclosure"
          placeholder="请输入附件"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item> -->
      <!-- <el-form-item label="富文本" prop="richText">
        <el-input
          v-model="queryParams.richText"
          placeholder="请输入富文本"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item> -->
      <!-- <el-form-item label="处理方法" prop="processMethod">
        <el-input
          v-model="queryParams.processMethod"
          placeholder="请输入处理方法"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item> -->
      <el-form-item label="标题" prop="richTitle">
        <el-input
          v-model="queryParams.richTitle"
          placeholder="请输入知识库标题"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="类型" prop="kenowledgeType">
        <el-select
          v-model="queryParams.kenowledgeType"
          placeholder="请选择知识库类型"
        >
          <el-option
            v-for="dict in knowledgeOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          ></el-option>
        </el-select>
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
          v-hasPermi="['system:base:add']"
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
          v-hasPermi="['system:base:edit']"
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
          v-hasPermi="['system:base:remove']"
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
          v-hasPermi="['system:base:export']"
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
      :data="baseList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="知识库id" align="center" prop="id" />
      <!-- <el-table-column label="服务单号" align="center" prop="documentNo" />
      <el-table-column label="处理人" align="center" prop="processStaff" />
      <el-table-column label="处理人id" align="center" prop="processStaffId" />
      <el-table-column label="申请人id" align="center" prop="reqStaffId" />
      <el-table-column label="申请人" align="center" prop="reqStaff" />
      <el-table-column label="服务详细" align="center" prop="serviceDetall" /> -->
      <el-table-column label="处理方法" align="center" prop="richText" />
      <el-table-column label="附件" align="center" prop="enclosure" />
      <!-- <el-table-column label="处理方法" align="center" prop="processMethod" /> -->
      <el-table-column label="知识库标题" align="center" prop="richTitle" />
      <el-table-column
        label="知识库类型"
        align="center"
        prop="kenowledgeType"
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
            v-hasPermi="['system:base:edit']"
            >修改</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:base:remove']"
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

    <!-- 添加或修改知识库记录对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <!-- <el-form-item label="服务单号" prop="documentNo">
          <el-input v-model="form.documentNo" placeholder="请输入服务单号" />
        </el-form-item> -->
        <!-- <el-form-item label="处理人" prop="processStaff">
          <el-input v-model="form.processStaff" placeholder="请输入处理人" />
        </el-form-item> -->
        <!-- <el-form-item label="处理人id" prop="processStaffId">
          <el-input
            v-model="form.processStaffId"
            placeholder="请输入处理人id"
          />
        </el-form-item> -->
        <!-- <el-form-item label="申请人id" prop="reqStaffId">
          <el-input v-model="form.reqStaffId" placeholder="请输入申请人id" />
        </el-form-item> -->
        <!-- <el-form-item label="申请人" prop="reqStaff">
          <el-input v-model="form.reqStaff" placeholder="请输入申请人" />
        </el-form-item> -->
        <!-- <el-form-item label="服务详细" prop="serviceDetall">
          <el-input v-model="form.serviceDetall" placeholder="请输入服务详细" />
        </el-form-item> -->
        <el-form-item label="标题" prop="richTitle">
          <el-input v-model="form.richTitle" placeholder="请输入知识库标题" />
        </el-form-item>
        <el-form-item label="类型" prop="kenowledgeType">
          <el-select
            v-model="form.kenowledgeType"
            placeholder="请选择知识库类型"
          >
            <el-option
              v-for="dict in knowledgeOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="处理方法" prop="richText">
          <editor v-model="form.richText" :min-height="192" />
        </el-form-item>
        <el-form-item label="附件" prop="enclosure">
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
        <!-- <el-form-item label="处理方法" prop="processMethod">
          <el-input v-model="form.processMethod" placeholder="请输入处理方法" />
        </el-form-item> -->
        <!-- <el-form-item label="0存在2删除" prop="delFlag">
          <el-input v-model="form.delFlag" placeholder="请输入0存在2删除" />
        </el-form-item> -->
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
  listBase,
  getBase,
  delBase,
  addBase,
  updateBase,
  exportBase,
} from "@/api/order/service/base";
import { uploadFile, serverUrl } from "@/api/common/file";
import Editor from "@/components/Editor";

export default {
  name: "Display",
  components: {
    Editor,
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      //文件上传
      fileList: [],
      // 导出遮罩层
      exportLoading: false,
      //知识库类别
      knowledgeOptions: [],
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
      // 知识库记录表格数据
      baseList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        documentNo: null,
        processStaff: null,
        processStaffId: null,
        reqStaffId: null,
        reqStaff: null,
        serviceDetall: null,
        enclosure: null,
        richText: null,
        processMethod: null,
        richTitle: null,
        kenowledgeType: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        documentNo: [
          { required: true, message: "服务单号不能为空", trigger: "blur" },
        ],
        delFlag: [
          { required: true, message: "0存在2删除不能为空", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getDicts("knowledge_type").then((response) => {
      this.knowledgeOptions = response.data;
    });
    this.getList();
  },
  methods: {
    /** 查询知识库记录列表 */
    getList() {
      this.loading = true;
      listBase(this.queryParams).then((response) => {
        this.baseList = response.rows;
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
        id: null,
        documentNo: null,
        processStaff: null,
        processStaffId: null,
        reqStaffId: null,
        reqStaff: null,
        serviceDetall: null,
        enclosure: null,
        richText: null,
        processMethod: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        delFlag: null,
        richTitle: null,
        kenowledgeType: null,
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
      this.ids = selection.map((item) => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加知识库记录";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getBase(id).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改知识库记录";
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

          this.form.enclosure = serverUrl + response.fileName;
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
          if (this.form.id != null) {
            updateBase(this.form).then((response) => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addBase(this.form).then((response) => {
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
        '是否确认删除知识库记录编号为"' + ids + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return delBase(ids);
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
      this.$confirm("是否确认导出所有知识库记录数据项?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.exportLoading = true;
          return exportBase(queryParams);
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
