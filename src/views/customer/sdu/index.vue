<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--部门数据-->
      <el-col :span="4" :xs="24">
        <div class="head-container">
          <el-input  v-model="deptName"  placeholder="请输入部门名称"  size="small" prefix-icon="el-icon-search" style="margin-bottom: 20px" clearable />
        </div>
        <div class="head-container">
          <el-tree
            class="dept-tree"
            :data="deptOptions"
            :props="defaultProps"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            ref="tree"
            default-expand-all
            @node-click="handleNodeClick"
          />
        </div>
      </el-col>
      <!--用户数据-->
      <el-col :span="20" :xs="24">
        <el-form :model="queryParams"  ref="queryForm" v-show="showSearch"  :inline="true"  label-width="68px" >
          <el-form-item label="用户名称" prop="userName">
            <el-input  v-model="queryParams.userName"  placeholder="请输入用户名称" @keyup.enter.native="handleQuery"  size="small"  style="width: 240px" clearable />
          </el-form-item>
          <el-form-item label="手机号码" prop="phonenumber">
            <el-input  v-model="queryParams.phonenumber" placeholder="请输入手机号码" @keyup.enter.native="handleQuery"  size="small" style="width: 240px" clearable />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="用户状态"  size="small"  style="width: 240px" clearable>
              <el-option
                v-for="dict in statusOptions"
                :key="dict.dictValue"
                :label="dict.dictLabel"
                :value="dict.dictValue"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间">
            <el-date-picker  v-model="dateRange" start-placeholder="开始日期" end-placeholder="结束日期" range-separator="-" type="daterange" value-format="yyyy-MM-dd"  size="small" style="width: 240px"></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button  type="primary" size="mini" icon="el-icon-search" @click="handleQuery">搜索</el-button>
            <el-button  size="mini" icon="el-icon-refresh"  @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button  type="primary" size="mini" icon="el-icon-plus"  @click="handleAdd" v-hasPermi="['system:user:add']"  plain>
              新增
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button  type="success" size="mini" icon="el-icon-edit"  @click="handleUpdate" v-hasPermi="['system:user:edit']" :disabled="single"  plain>
              修改
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button  type="danger" size="mini"  icon="el-icon-delete" @click="handleDelete" v-hasPermi="['system:user:remove']" :disabled="multiple" plain >
              删除
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button  type="info"  size="mini"   icon="el-icon-upload2" @click="handleImport" v-hasPermi="['system:user:import']" plain >
              导入
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button  type="warning" size="mini" icon="el-icon-download" @click="handleExport" v-hasPermi="['system:user:export']" :loading="exportLoading"  plain>
              导出
            </el-button>
          </el-col>
          <!--右侧刷新组件-->
          <right-toolbar
            :showSearch.sync="showSearch"
            @queryTable="getList"
            :columns="columns"
          >
          </right-toolbar>
        </el-row>

        <el-table  v-loading="loading"  :data="userList"  @selection-change="handleSelectionChange" >
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="用户编号"  prop="userId" key="userId"  align="center" v-if="columns[0].visible" />
          <el-table-column label="用户名称"  prop="userName" key="userName"  align="center"  v-if="columns[1].visible"  :show-overflow-tooltip="true"/>
          <el-table-column label="用户昵称"  prop="nickName" key="nickName"  align="center"  v-if="columns[2].visible"  :show-overflow-tooltip="true"/>
          <el-table-column label="部门"      prop="dept.deptName" key="deptName"  align="center"  v-if="columns[3].visible"  :show-overflow-tooltip="true" />
          <el-table-column label="手机号码"  prop="phonenumber"   key="phonenumber"  align="center"  v-if="columns[4].visible" width="120" />
          <el-table-column label="状态"      key="status"  align="center"  v-if="columns[5].visible">
            <template slot-scope="scope">
              <el-switch  v-model="scope.row.status" @change="handleStatusChange(scope.row)"
                active-value="0"
                inactive-value="1"               
              ></el-switch>
            </template>
          </el-table-column>
          <el-table-column  label="创建时间" prop="createTime"  align="center"  v-if="columns[6].visible"  width="160">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column  label="操作"  align="center"  width="160"  class-name="small-padding fixed-width">
            <template slot-scope="scope" v-if="scope.row.userId !== 1">
              <el-button type="text"  size="mini"  icon="el-icon-edit"  @click="handleUpdate(scope.row)"  v-hasPermi="['system:user:edit']">
                修改
              </el-button>
              <el-button type="text"  size="mini"  icon="el-icon-delete"  @click="handleDelete(scope.row)"  v-hasPermi="['system:user:remove']" >
                删除
              </el-button>
              <el-dropdown  size="mini"  @command="(command) => handleCommand(command, scope.row)">
                <span class="el-dropdown-link">
                  <i class="el-icon-d-arrow-right el-icon--right"></i>更多
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item icon="el-icon-key"  command="handleResetPwd"  v-hasPermi="['system:user:resetPwd']">
                    重置密码
                  </el-dropdown-item>
                  <el-dropdown-item icon="el-icon-circle-check"  command="handleAuthRole"  v-hasPermi="['system:user:edit']">
                    分配角色
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
        <!--分页-->
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="queryParams.pageNum"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />
      </el-col>
    </el-row>

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog  :title="title"  :visible.sync="open"  width="600px"  :close-on-click-modal="false"  append-to-body  >
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col>
            <el-form-item label="用户昵称" prop="nickName">
              <el-input  v-model="form.nickName"  placeholder="请输入用户昵称"  maxlength="30"  />
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="归属部门" prop="deptId">
              <treeselect
                v-model="form.deptId"
                :options="deptOptions"
                :show-count="true"
                placeholder="请选择归属部门"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col>
            <el-form-item label="手机号码" prop="phonenumber">
              <el-input  v-model="form.phonenumber"  placeholder="请输入手机号码"  maxlength="11" />
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="邮箱" prop="email">
              <el-input  v-model="form.email"  placeholder="请输入邮箱"  maxlength="50"  />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <el-form-item label="用户名称" prop="userName"  v-if="form.userId == undefined">
              <el-input  v-model="form.userName"  placeholder="请输入用户名称"  maxlength="30"  />
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="用户密码" prop="password"  v-if="form.userId == undefined" >
              <el-input  v-model="form.password"  placeholder="请输入用户密码"  type="password"  maxlength="20"  />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <el-form-item label="用户类型" prop="usersType">
              <el-select  v-model="form.usersType"  @change="depttypeasd" placeholder="请选择用户类型" size="small"  clearable>
                <el-option
                  v-for="rce in usersTypeoptions"
                  :key="rce.dictValue"
                  :label="rce.dictLabel"
                  :value="rce.dictValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户性别">
              <el-select v-model="form.sex" placeholder="请选择">
                <el-option
                  v-for="dict in sexOptions"
                  :key="dict.dictValue"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in statusOptions"
                  :key="dict.dictValue"
                  :label="dict.dictValue"
                >
                  {{ dict.dictLabel }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="角色">
              <el-select v-model="form.postIds"  placeholder="请选择" multiple>
                <el-option
                  v-for="item in postOptions"
                  :key="item.postId"
                  :label="item.postName"
                  :value="item.postId"
                  :disabled="item.status == 1"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色">
              <el-select v-model="form.roleIds"  placeholder="请选择" multiple>
                <el-option
                  v-for="item in roleOptions"
                  :key="item.roleId"
                  :label="item.roleName"
                  :value="item.roleId"
                  :disabled="item.status == 1"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input  v-model="form.remark"  placeholder="请输入内容" type="textarea"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 用户导入对话框 -->
    <el-dialog  :title="upload.title"  :visible.sync="upload.open"  width="400px"  append-to-body>
      <el-upload
        ref="upload"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">
          将文件拖到此处，或
          <em>点击上传</em>
        </div>
        <div class="el-upload__tip" slot="tip">
          <el-checkbox v-model="upload.updateSupport" />是否更新已经存在的用户数据
          <el-link type="info" style="font-size: 12px" @click="importTemplate">下载模板</el-link>
        </div>
        <div class="el-upload__tip" style="color: red" slot="tip">
          提示：仅允许导入“xls”或“xlsx”格式文件！
        </div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFileForm">确 定</el-button>
        <el-button @click="upload.open = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listUser,
  getUser,
  delUser,
  addUser,
  updateUser,
  exportUser,
  resetUserPwd,
  changeUserStatus,
  importTemplate,
} from "@/api/system/user";
import { getToken } from "@/utils/auth";
import { listsysdept } from "@/api/order/service/rec";

import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "User",
  components: { Treeselect },
  data() {
    return {
      // 遮罩层
      loading: true,
      //用户类别
      usersTypeoptions: [],
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
      // 用户表格数据
      userList: null,
      // 弹出层标题
      title: "",
      // 部门树选项
      deptOptions: undefined,
      // 是否显示弹出层
      open: false,
      // 部门名称
      deptName: undefined,
      // 默认密码
      initPassword: undefined,
      // 日期范围
      dateRange: [],
      // 状态数据字典
      statusOptions: [],
      // 性别状态字典
      sexOptions: [],
      // 角色选项
      postOptions: [],
      // 角色选项
      roleOptions: [],
      // 表单参数
      form: {},
      defaultProps: {
        children: "children",
        label: "label",
      },
      // 用户导入参数
      upload: {
        // 是否显示弹出层（用户导入）
        open: false,
        // 弹出层标题（用户导入）
        title: "",
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的用户数据
        updateSupport: 0,
        // 设置上传的请求头部
        headers: { Authorization: "Bearer " + getToken() },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + "/system/user/importData",
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userName: undefined,
        phonenumber: undefined,
        status: undefined,
        deptId: undefined,
      },
      // 列信息
      columns: [
        { key: 0, label: `用户编号`, visible: true },
        { key: 1, label: `用户名称`, visible: true },
        { key: 2, label: `用户昵称`, visible: true },
        { key: 3, label: `部门`, visible: true },
        { key: 4, label: `手机号码`, visible: true },
        { key: 5, label: `状态`, visible: true },
        { key: 6, label: `创建时间`, visible: true },
      ],
      // 表单校验
      rules: {
        userName: [{ required: true, message: "用户名称不能为空", trigger: "blur" }],
        nickName: [{ required: true, message: "用户昵称不能为空", trigger: "blur" }],
        // deptId: [
        //   { required: true, message: "归属部门不能为空", trigger: "change" }
        // ],
        password: [{ required: true, message: "用户密码不能为空", trigger: "blur" },
                   { min: 5,  max: 20,  message: "用户密码长度必须介于 5 和 20 之间", trigger: "blur"},
        ],
        email: [{  type: "email", message: "'请输入正确的邮箱地址", trigger: ["blur", "change"]}],
        phonenumber: [ { pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,  message: "请输入正确的手机号码", trigger: "blur"} ],
      },
    };
  },
  watch: {
    // 根据名称筛选部门树
    deptName(val) {
      this.$refs.tree.filter(val);
    },
  },
  created() {
    this.getList();
    this.getTreeselect();
    this.getDicts("sys_normal_disable").then((response) => {
      this.statusOptions = response.data;
    });
    this.getDicts("sys_user_sex").then((response) => {
      this.sexOptions = response.data;
    });
    // this.getConfigKey('sys.user.initPassword').then((response) => {
    this.initPassword = "123456";
    // })
    //查询用户类别
    this.getDicts("sys_users_type").then((response) => {
      this.usersTypeoptions = response.data;
    });
  },
  methods: {
    //**********【1-筛选区】 查询用户列表方法 */
    getList() {
      this.loading = true;
      listUser(this.addDateRange(this.queryParams, this.dateRange)).then(
        (response) => {
          this.userList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
    },
    //**********【1-筛选区】 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    //**********【1-筛选区】 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    //===========【2-列表区】 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.getTreeselect();
      getUser().then((response) => {
        this.postOptions = response.posts;
        this.roleOptions = response.roles;
        this.open = true;
        this.title = "添加用户";
        this.form.password = this.initPassword;
      });
    },
    //===========【2-列表区】 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.getTreeselect();
      const userId = row.userId || this.ids;
      getUser(userId).then((response) => {
        this.form = response.data;
        this.postOptions = response.posts;
        this.roleOptions = response.roles;
        this.form.postIds = response.postIds;
        this.form.roleIds = response.roleIds;
        this.open = true;
        this.title = "修改用户";
        this.form.password = "";
      });
    },
    //===========【2-列表区】 右上角 重置密码 */
    handleResetPwd(row) {
      this.$prompt('请输入"' + row.userName + '"的新密码', "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        closeOnClickModal: false,
        inputPattern: /^.{5,20}$/,
        inputErrorMessage: "用户密码长度必须介于 5 和 20 之间",
      })
        .then(({ value }) => {
          resetUserPwd(row.userId, value).then((response) => {
            this.msgSuccess("修改成功，新密码是：" + value);
          });
        })
        .catch(() => {});
    }, 
    //===========【2-列表区】 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.userId);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },   
    //===========【2-列表区】 更多操作触发
    handleCommand(command, row) {
      switch (command) {
        case "handleResetPwd":
          this.handleResetPwd(row);
          break;
        case "handleAuthRole":
          this.handleAuthRole(row);
          break;
        default:
          break;
      }
    }, 
    //===========【2-列表区】 删除按钮操作 */
    handleDelete(row) {
      const userIds = row.userId || this.ids;
      this.$confirm(
        '是否确认删除用户编号为"' + userIds + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return delUser(userIds);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        })
        .catch(() => {});
    },
    //===========【2-列表区】  导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm("是否确认导出所有用户数据项?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.exportLoading = true;
          return exportUser(queryParams);
        })
        .then((response) => {
          this.download(response.msg);
          this.exportLoading = false;
        })
        .catch(() => {});
    },
    //===========【2-列表区】  导入按钮操作 */
    handleImport() {
      this.upload.title = "用户导入";
      this.upload.open = true;
    },                 
    //===========【3-表单】 查询部门下拉树结构 */
    getTreeselect() {
      listsysdept().then((response) => {
        this.deptOptions = response.data;
      });
    },
    //===========【3-表单】 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    //===========【3-表单】 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.userId != undefined) {
            updateUser(this.form).then((response) => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addUser(this.form).then((response) => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },    
    //===========【3-1表单】 表单重置
    reset() {
      this.form = {
        userId: undefined,
        deptId: undefined,
        userName: undefined,
        nickName: undefined,
        password: undefined,
        phonenumber: undefined,
        email: undefined,
        sex: undefined,
        status: "0",
        remark: undefined,
        postIds: [],
        roleIds: [],
      };
      this.resetForm("form");
    },
    //===========【3-2表单】获取用户·类型的值
    depttypeasd(value) {
      var users = this.usersTypeoptions.find((item) => {
        return item.dictValue == value;
      });
      this.form.usersType = users.dictValue;
      this.form.usersTypeValue = users.dictLabel;

      // this.deptPhone=user.phone
    },
    //===========【3-3表单】 下载模板操作 */
    importTemplate() {
      importTemplate().then((response) => {
        this.download(response.msg);
      });
    },
    //===========【3-3表单】 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true;
    },
    //===========【3-3表单】 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      this.upload.open = false;
      this.upload.isUploading = false;
      this.$refs.upload.clearFiles();
      this.$alert(response.msg, "导入结果", { dangerouslyUseHTMLString: true });
      this.getList();
    },
    //===========【3-3表单】 提交上传文件
    submitFileForm() {
      this.$refs.upload.submit();
    },         
  },
};
</script>

<style lang="scss" scoped>
::v-deep .dept-tree {
  padding: 15px;
}
</style>
