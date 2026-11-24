<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--部门数据-->
      <el-col :span="4" :xs="24">
        <div class="head-container">
          <el-input v-model="deptName"  placeholder="请输入部门名称" size="small" prefix-icon="el-icon-search" style="margin-bottom: 20px" clearable />
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
        <el-form :model="queryParams" ref="queryForm"  :inline="true"  v-show="showSearch"  label-width="68px">
          <el-form-item label="用户名称" prop="name">
            <el-input  v-model="queryParams.name"  placeholder="请输入用户名称"  size="small" style="width: 240px" @keyup.enter.native="handleQuery"  clearable />
          </el-form-item>
          <el-form-item label="手机号码" prop="tel">
            <el-input  v-model="queryParams.tel"   placeholder="请输入手机号码"  size="small" style="width: 240px" @keyup.enter.native="handleQuery"  clearable />
          </el-form-item>
          <el-form-item label="部门" prop="unitid">
            <el-select  v-model="queryParams.unitName"  placeholder="请选择处理部门">
              <el-option
                v-for="dict in unitdeptList"
                :key="dict.id"
                :label="dict.name"
                :value="dict.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select  v-model="queryParams.status"  placeholder="用户状态"  size="small"  style="width: 240px"  clearable >
              <el-option
                v-for="dict in statusOptions"
                :key="dict.dictValue"
                :label="dict.dictLabel"
                :value="dict.dictValue"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间">
            <el-date-picker  v-model="dateRange"  size="small"  style="width: 240px"  value-format="yyyy-MM-dd"
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            ></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button  type="primary"  size="mini" icon="el-icon-search"  @click="handleQuery">
              搜索
            </el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">
              重置
            </el-button>
          </el-form-item>
        </el-form>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" size="mini" icon="el-icon-plus"  @click="handleAdd"  v-hasPermi="['system:user:add']" plain >
              新增
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button  type="info"  size="mini"  icon="el-icon-upload2" @click="handleImport"  v-hasPermi="['system:user:import']" plain>
              导入
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button  type="warning" size="mini" icon="el-icon-download" @click="handleExport" :loading="exportLoading" v-hasPermi="['system:user:export']"  plain>
              导出
            </el-button>
          </el-col>
          <right-toolbar
            :showSearch.sync="showSearch"
            @queryTable="getList"
            :columns="columns"
          ></right-toolbar>
        </el-row>

        <el-table :data="userList"  v-loading="loading"  element-loading-text="拼命加载中"  @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column  label="用户账号" prop="account"    align="center"  key="account" v-if="columns[1].visible"    :show-overflow-tooltip="true" min-width="12%"  />
          <el-table-column  label="用户名称"  prop="name"      align="center"  key="name"  v-if="columns[2].visible"      :show-overflow-tooltip="true"  min-width="15%"  />
          <el-table-column  label="部门"      prop="unitname"  align="center"  key="unitname"  v-if="columns[3].visible"  :show-overflow-tooltip="true"  min-width="12%"  />
          <el-table-column  label="手机号码"  prop="tel"       align="center"  key="tel"    v-if="columns[4].visible"  min-width="12%"  />
          <el-table-column  label="状态"  align="center"  key="status"  v-if="columns[5].visible"  min-width="10%">
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.status"
                active-value="0"
                inactive-value="1"
                @change="handleStatusChange(scope.row)"
              ></el-switch>
            </template>
          </el-table-column>
          <el-table-column  label="创建时间"  align="center"  prop="createAt"  v-if="columns[6].visible"  min-width="18%">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.createAt) }}</span>
            </template>
          </el-table-column>
          <el-table-column  label="操作"  align="center"  class-name="small-padding fixed-width"  min-width="20%">
            <template slot-scope="scope" v-if="scope.row.isadmin !== 1||orgType==='0'">
              <el-button  size="mini"  type="text"  icon="el-icon-edit"    @click="handleUpdate(scope.row)"  v-hasPermi="['system:user:edit']">
                修改
              </el-button>
              <el-button  size="mini"  type="text"  icon="el-icon-delete"  @click="handleDelete(scope.row)"  v-hasPermi="['system:user:delete']">
                删除
              </el-button>
              <el-dropdown size="mini" @command="(command) => handleCommand(command, scope.row)">
                <span class="el-dropdown-link">
                  <i class="el-icon-d-arrow-right el-icon--right"></i>更多
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="handleResetPwd"  icon="el-icon-key"  v-hasPermi="['system:user:resetPwd']" >
                    重置密码
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="total > 0" :total="total"  :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"  @pagination="getList" />
      </el-col>
    </el-row>

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog  :title="title"  :visible.sync="open"  width="600px" :close-on-click-modal="false" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col>
            <el-form-item label="用户名称" prop="name">
              <el-input  v-model="form.name"  placeholder="请输入用户昵称"  maxlength="30"  />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <el-form-item label="手机号码" prop="tel">
              <el-input  v-model="form.tel"  placeholder="请输入手机号码"  maxlength="11"  />
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="邮箱" prop="email">
              <el-input  v-model="form.email" placeholder="请输入邮箱" maxlength="50"  />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
        </el-row>
        <el-row>
          <el-col>
            <el-form-item  label="所属机构"  prop="orgid"  v-if="this.admintf.length == 1">
              <el-select  v-model="form.orgid" placeholder="请选择所属机构" size="small"  @change="depttypeasd"  clearable >
                <el-option
                  v-for="rce in deptList"
                  :key="rce.orgid"
                  :label="rce.orgname"
                  :value="rce.orgid"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户性别" prop="gender">
              <el-select v-model="form.gender" placeholder="请选择">
                <el-option
                  v-for="dict in sexOptions"
                  :key="dict.dictValue"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="归属部门" prop="unitid">
              <treeselect  v-model="form.unitid" placeholder="请选择上级部门名称"
                :options="unitOptions"
                :normalizer="normalizer"
                :show-count="true"
                :default-expand-level="2"               
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色" prop="postid">
              <el-select  v-model="form.postid"  placeholder="请选择角色" size="small" clearable  multiple>
                <el-option
                  v-for="item in roleOptions"
                  :key="item.postid"
                  :label="item.postname"
                  :value="item.postid"
                ></el-option>
              </el-select>
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
      <el-upload ref="upload" :limit="1" accept=".xlsx, .xls" drag
        :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"    
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">
          将文件拖到此处，或
          <em>点击上传</em>
        </div>
        <div class="el-upload__tip" slot="tip">
          <!-- <el-checkbox v-model="upload.updateSupport" />
          是否更新已经存在的用户数据 -->
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
  getPerson,
  delUser,
  addUser,
  updateUser,
  exportUser,
  resetUserPwd,
  changeUserStatus,
  importTemplate,
} from "@/api/system/user";
import { orgList } from "@/api/system/dept";
import { listRole } from "@/api/system/role";
import { getToken } from "@/utils/auth";
import {
  unittreeselect,
  unittreeselectt,
  orderunitDept,
} from "@/api/system/dept";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import store from "@/store";
import md5 from "js-md5";
export default {
  name: "User",
  components: { Treeselect },
  data() {
    return {
      orgType:store.getters.roles.organizationtype,//当前机构类型 0-root 1-管理机构 2-服务商 3-医疗机构
      // 遮罩层
      loading: true,
      // //用户类别
      // usersTypeoptions: [],
      // 导出遮罩层
      exportLoading: false,
      // 选中数组
      ids: [],
      orgids: [],
      // // 非单个禁用
      // single: true,
      // // 非多个禁用
      // multiple: true,
      showSearch: true,// 显示搜索条件
      total: 0,// 总条数
      admintf: "",//权限
      userList: null,// 用户表格数据
      title: "",// 弹出层标题     
      deptOptions: undefined,// 部门树数据
      unitOptions: [],//上级部门
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
      deptList: [],
      unitdeptList: [],
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
        name: undefined,
        tel: undefined,
        status: undefined,
        unitid: undefined,
        orgid: undefined,
        unitName:undefined
      },
      // 列信息
      columns: [
        { key: 0, label: `用户编号`, visible: true },
        { key: 1, label: `用户账号`, visible: true },
        { key: 2, label: `用户昵称`, visible: true },
        { key: 3, label: `部门`, visible: true },
        { key: 4, label: `手机号码`, visible: true },
        { key: 5, label: `状态`, visible: true },
        { key: 6, label: `创建时间`, visible: true },
      ],
      // 表单校验
      rules: {
        name: [ { required: true, message: "用户名称不能为空", trigger: "blur" } ],
        unitid: [ { required: true, message: "归属部门不能为空", trigger: "blur" } ],
        // idno: [
        //   { required: true, message: "身份证号不能为空", trigger: "blur" },
        // ],
        gender: [ { required: true, message: "性别不能为空", trigger: "change" } ],
        postid: [ { required: true, message: "角色不能为空", trigger: "change" } ],
        orgid: [{ required: true, message: "机构不能为空", trigger: "change" }],
        // password: [
        //   { required: true, message: "用户密码不能为空", trigger: "blur" },
        //   {
        //     min: 5,
        //     max: 20,
        //     message: "用户密码长度必须介于 5 和 20 之间",
        //     trigger: "blur",
        //   },
        // ],

        email: [
          // { required: true, message: '邮箱地址不能为空', trigger: 'blur' },
          {
            type: "email",
            message: "'请输入正确的邮箱地址",
            trigger: ["blur", "change"],
          },
        ],
        tel: [ { required: true, message: "手机号码不能为空", trigger: "blur" },
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: "请输入正确的手机号码",
            trigger: "blur",
          },
        ],
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
    //左侧导航树
    this.getTreeselect();

    //用户列表
    if (store.getters.roles.organizationtype != 0) {
      this.getList();
    } else {
      this.loading = false;
    }
    //用户状态 停用 正常
    this.getDicts("sys_normal_disable").then((response) => {
      this.statusOptions = response.data;
    });
    //用户性别
    this.getDicts("sys_user_sex").then((response) => {
      this.sexOptions = response.data;
    });
    // this.getConfigKey('sys.user.initPassword').then((response) => {
    // this.initPassword = "123456";
    // })
//    //查询用户类别
//    this.getDicts("sys_users_type").then((response) => {
//      this.usersTypeoptions = response.data;
//    });

    // orderunitDept(this.queryParams).then((response) => {
    //   this.unitdeptList = response.data;
    // });

  },
  methods: {
    /** 查询用户列表 */
    getList() {
      this.loading = true;
      this.userList = []
      listUser(this.addDateRange(this.queryParams, this.dateRange)).then(
        (response) => {
          if(response){
            this.userList = response.rows;
            this.total = response.total;
            this.loading = false;
          }
        }
      );
    },
    /** 查询部门下拉树结构 */
    getTreeselect() {
      unittreeselect().then((response) => {
        this.deptOptions = response.data;
      });
    },

    //所有角色
    onChangedept() {
      listRole().then((response) => {
        this.roleOptions = response.rows;
      });
    },
    //左侧导航树筛选节点
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    //左侧导航树节点单击事件
    handleNodeClick(data) {
      this.queryParams.unitid = data.id;
      this.queryParams.unitName = data.label;
      this.getList();
    },
    // 用户状态修改
    handleStatusChange(row) {
      let text = row.status === "0" ? "启用" : "停用";
      this.$confirm('确认要"' + text + '""' + row.name + '"用户吗?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          let obj = {
            personid: row.pid,
            status: row.status,
            unitid: row.unitid,
          };
          return changeUserStatus(obj);
        })
        .then(() => {
          this.msgSuccess(text + "成功");
        })
        .catch(function () {
          row.status = row.status === "0" ? "1" : "0";
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
        numid: undefined,
        name: undefined,
        password: undefined,
        tel: undefined,
        email: undefined,
        gender: undefined,
        status: "0",
        postid: undefined,
        orgid: undefined,
        unitid: undefined,
        idno: undefined,
        postname: [],
        mark: undefined,
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
      this.dateRange = [];
      this.resetForm("queryForm");
      this.queryParams.unitid = null;
      this.queryParams.unitName = null;
      console.log(this.unitdeptList)
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.orgids = selection.map((item) => item.orgid);
      // this.single = selection.length != 1;
      // this.multiple = !selection.length;
    },
    // 更多操作触发
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
    /** 新增按钮操作 */
    async handleAdd() {
      this.reset(); //初始化对话框
      // await this.getTreeselect();
      // await this.onChangedept();
      this.admintf = store.getters.permissions;
      if (this.admintf.length > 1) { //非admin
        unittreeselectt({ orgid: store.getters.roles.orgaccount.orgid }).then(
          (response) => {
            this.unitOptions = response.data;
          }
        );
        await this.onChangedept();
      } else if(this.admintf.length == 1){ //admin管理员
        orgList().then((response) => {
          this.deptList = response.data;
        });
      }

      this.open = true;
      this.title = "添加用户";
    },
    /** 修改按钮操作 */
    async handleUpdate(row) {
      this.reset();
      // await this.getTreeselect();
      if (row.orgid !== null && row.orgid !== undefined) {
        await this.depttypeasd(row.orgid);
      } else {
        await this.depttypeasd(this.orgids[0]);
      }

      // await this.onChangedept();

      this.admintf = store.getters.permissions;
      if(this.admintf.length == 1){
          await orgList().then((response) => {
            this.deptList = response.data;
          });
      }else if(this.admintf.length > 1){
        await this.onChangedept();
      }

      // const userId = row.id || this.ids;
      this.form.mark = row.mark;
      getPerson({ pid: row.pid, unitid: row.unitid }).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改用户";
        this.form.password = "";
      });
    },
    /** 重置密码按钮操作 */
    handleResetPwd(row) {
      this.$prompt('请输入"' + row.name + '"的新密码', "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        closeOnClickModal: false,
        inputPattern: /^.{5,20}$/,
        inputErrorMessage: "用户密码长度必须介于 5 和 20 之间",
      })
        .then(({ value }) => {
          const Value = md5(value);
          resetUserPwd(Value, row.pid, row.orgid).then((response) => {
            this.msgSuccess("修改成功，新密码是：" + value);
          });
        })
        .catch(() => {});
    },

    //管理员登陆，机构选择change事件,部门和角色变更
    depttypeasd(value) {
      this.unitOptions = [];
      this.roleOptions = [];
      this.form.unitid= null;
      this.form.postid = null;
      unittreeselectt({ orgid: value }).then((response) => {
        this.unitOptions = response.data;
      });
      listRole({ orgid: value }).then((response) => {
        this.roleOptions = response.rows;
      });
    },
    /** 分配角色操作 */
    handleAuthRole: function (row) {
      const userId = row.numid;
      this.$router.push("/auth/role/" + userId);
    },
    /** 提交按钮 */
    submitForm: function () {
      // this.form.unitname = "";
      // this.form.postname = "";
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.pid != undefined) {
            updateUser(this.form).then((response) => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            }).catch(() => {});
          } else {
            if (this.form.email == null && this.form.email == undefined) {
              this.form.email = "";
            }
            addUser(this.form).then((response) => {
              this.$alert(response.msg, "用户账号", {
                confirmButtonText: "确定",
                callback: (action) => {},
              });
              this.open = false;
              this.getList();
            }).catch(() => {});
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const userIds = row.id || this.ids;
      let obj = {
        pid: row.pid,
        unitid: row.unitid,
      };
      this.$confirm(
        '是否确认删除用户编号为"' + row.numid + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return delUser(obj);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        })
        .catch(() => {});
    },
    /** 转换部门数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.id,
        label: node.label,
        children: node.children,
      };
    },
    /** 导出按钮操作 */
    handleExport() {
      this.queryParams.orgid = store.getters.roles.orgaccount.orgid;
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
    /** 导入按钮操作 */
    handleImport() {
      this.upload.title = "用户导入";
      this.upload.open = true;
    },
    /** 下载模板操作 */
    importTemplate() {
      importTemplate().then((response) => {
        this.download(response.msg);
      });
    },
    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true;
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      this.upload.open = false;
      this.upload.isUploading = false;
      this.$refs.upload.clearFiles();
      this.$alert(response.msg, "导入结果", { dangerouslyUseHTMLString: true });
      this.getList();
    },
    // 提交上传文件
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
