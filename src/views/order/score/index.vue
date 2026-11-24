<template>
  <div class="app-container">
    <el-form  :model="queryParams"  ref="queryForm" :inline="true"  v-show="showSearch"  label-width="68px">
      <el-form-item label="权重分值" prop="scoreLevel">
        <el-select  v-model="queryParams.scoreLevel" placeholder="请选择权重分值"  clearable  size="small" >
          <el-option
            v-for="dict in scoreLevelOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="权重总分" prop="scoreTotal">
        <el-input
          v-model="queryParams.scoreTotal"
          placeholder="请输入权重总分"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item> -->
      <el-form-item>
        <el-button icon="el-icon-search"  size="mini" @click="handleQuery" type="primary" >搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button  type="primary" size="mini" icon="el-icon-plus"  plain  @click="handleAdd"  v-hasPermi="['devops:score:add']"  >
          新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button  type="success" size="mini" icon="el-icon-edit"  plain  @click="handleUpdate" v-hasPermi="['devops:score:edit']" :disabled="single" >
          修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button  type="danger" size="mini" icon="el-icon-delete" plain  @click="handleDelete" v-hasPermi="['devops:score:remove']" :disabled="multiple" >
          删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button  type="warning" size="mini" icon="el-icon-download" plain @click="handleExport" v-hasPermi="['devops:score:export']" :loading="exportLoading">
          导出
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" ></right-toolbar>
    </el-row>

    <el-table  v-loading="loading"  :data="scoreList"  @selection-change="handleSelectionChange" >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="权重ID"    prop="scoreId"    align="center" />
      <el-table-column label="权重分值"  prop="scoreLevel" align="center" :formatter="scoreLevelFormat" />
      <el-table-column label="权重总分"  prop="scoreTotal" align="center" />
      <el-table-column label="备注"      prop="remark"     align="center" />
      <el-table-column label="操作"  align="center"  class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button  size="mini"  type="text"  icon="el-icon-edit"  @click="handleUpdate(scope.row)"  v-hasPermi="['devops:score:edit']" >
            修改
          </el-button>
          <el-button  size="mini"  type="text"  icon="el-icon-delete"  @click="handleDelete(scope.row)"  v-hasPermi="['devops:score:remove']" >
            删除
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

    <!-- 添加或修改权重列表对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="权重分值" prop="scoreLevel">
          <el-select v-model="form.scoreLevel" placeholder="请选择权重分值">
            <el-option
              v-for="dict in scoreLevelOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="权重总分" prop="scoreTotal">
          <el-input v-model="form.scoreTotal" placeholder="请输入权重总分" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="submitForm" type="primary" >确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listScore,
  getScore,
  delScore,
  addScore,
  updateScore,
  exportScore,
} from "@/api/order/score/score";

export default {
  name: "Score",
  components: {},
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
      // 权重列表表格数据
      scoreList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 权重分值(1分，2分，3分……)字典
      scoreLevelOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        scoreLevel: null,
        scoreTotal: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        scoreLevel: [
          {
            required: true,
            message: "权重分值不能为空",
            trigger: "change",
          },
        ],
      },
    };
  },
  created() {
    this.getList();
    this.getDicts("score_level").then((response) => {
      this.scoreLevelOptions = response.data;
    });
  },
  methods: {
    /** 查询权重列表列表 */
    getList() {
      this.loading = true;
      listScore(this.queryParams).then((response) => {
        this.scoreList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 权重分值(1分，2分，3分……)字典翻译
    scoreLevelFormat(row, column) {
      return this.selectDictLabel(this.scoreLevelOptions, row.scoreLevel);
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        scoreId: null,
        scoreLevel: null,
        scoreTotal: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        remark: null,
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
      this.ids = selection.map((item) => item.scoreId);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加权重列表";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const scoreId = row.scoreId || this.ids;
      getScore(scoreId).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改权重列表";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.scoreId != null) {
            updateScore(this.form).then((response) => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addScore(this.form).then((response) => {
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
      const scoreIds = row.scoreId || this.ids;
      this.$confirm(
        '是否确认删除权重列表编号为"' + scoreIds + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return delScore(scoreIds);
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
      this.$confirm("是否确认导出所有权重列表数据项?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.exportLoading = true;
          return exportScore(queryParams);
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
