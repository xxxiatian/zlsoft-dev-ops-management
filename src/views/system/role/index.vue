<template>
  <div class="app-container">
    <el-form  :model="queryParams"  ref="queryForm"  v-show="showSearch"  :inline="true" >
      <el-form-item label="角色名称" prop="postname">
        <el-input v-model="queryParams.postname"  placeholder="请输入角色名称" size="small" style="width: 240px" @keyup.enter.native="handleQuery" clearable />
      </el-form-item>
      <!-- <el-form-item label="权限字符" prop="roleKey">
        <el-input
          v-model="queryParams.roleKey"
          placeholder="请输入权限字符"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item> -->
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="角色状态" size="small" style="width: 240px" clearable >
          <el-option
            v-for="dict in statusOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间">
        <el-date-picker v-model="dateRange" size="small" style="width: 240px" value-format="yyyy-MM-dd" type="daterange" 
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="mini" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" size="mini" icon="el-icon-plus" @click="handleAdd" v-hasPermi="['system:role:add']"  plain>
          新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" size="mini" icon="el-icon-download" @click="handleExport" v-hasPermi="['system:role:export']" :loading="exportLoading" v-show="false"  plain>
          导出
        </el-button>
      </el-col>
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table :data="roleList"  v-loading="loading"  element-loading-text="拼命加载中"  @selection-change="handleSelectionChange" >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="角色编号" prop="roleid" min-width="12%" />
      <el-table-column label="隶属机构" prop="orgname" min-width="18%" />
      <!-- <el-table-column label="隶属部门" prop="unitname" width="150" /> -->
      <el-table-column label="角色名称" prop="postname" min-width="20%" :show-overflow-tooltip="true" />
      <el-table-column label="状态" align="center" min-width="10%">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            active-value="0"
            inactive-value="1"
            @change="handleStatusChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" min-width="20%" align="center">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="20%" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope" v-if="scope.row.roleid !== 0">
          <el-button size="mini" type="text" icon="el-icon-edit"   @click="handleUpdate(scope.row)"   v-hasPermi="['system:role:edit']" >
            修改
          </el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"   v-hasPermi="['system:role:delete']" >
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

    <!-- 添加或修改角色配置对话框 -->
    <el-dialog  :title="title"  :visible.sync="open"  width="600px"  :close-on-click-modal="false"  append-to-body >
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="隶属机构" prop="orgid">
          <el-select  v-model="form.orgid"  placeholder="隶属机构" size="small"  style="width: 240px" clearable >
            <el-option
              v-for="dict in deptList"
              :key="dict.id"
              :label="dict.name"
              :value="dict.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="角色名称" prop="postname">
          <el-input  v-model="form.postname"  placeholder="请输入角色名称" size="small" clearable  />
        </el-form-item>
        <el-form-item label="角色类型" prop="adminmark">
          <el-select v-model="form.adminmark" placeholder="角色类型"  size="small"  style="width: 240px" clearable >
            <el-option
              v-for="dict in roletypeOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in statusOptions"
              :key="dict.dictValue"
              :label="dict.dictValue"
              >{{ dict.dictLabel }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="角色模版">
          <template>
            <el-button
              v-for="(btn, index) in findmoderoleInfo"
              :key="index"
              type="primary"
              size="mini"
              plain
              @click="handleRole(btn.roleid)"
              >{{ btn.name }}</el-button
            >
          </template>
        </el-form-item>
        <el-form-item label="菜单权限">
          <el-checkbox  v-model="menuExpand" @change="handleCheckedTreeExpand($event, 'menu')">
            展开/折叠
          </el-checkbox>
          <el-checkbox  v-model="menuNodeAll"  @change="handleCheckedTreeNodeAll($event, 'menu')">
            全选/全不选
          </el-checkbox>
          <el-checkbox  v-model="form.menuCheckStrictly" @change="handleCheckedTreeConnect($event, 'menu')">
            父子联动
          </el-checkbox>
          <el-tree  :data="menuOptions" ref="menu" :props="defaultProps"
            class="tree-border"           
            show-checkbox          
            node-key="id"
            :check-strictly="!form.menuCheckStrictly"
            empty-text="加载中，请稍后"           
          ></el-tree>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 分配角色数据权限对话框
    <el-dialog  :title="title"  :visible.sync="openDataScope"  width="800px"  :close-on-click-modal="false"  append-to-body  >
      <el-form :model="form" label-width="80px">
        <el-form-item label="角色名称">
          <el-input v-model="form.roleName" :disabled="true" />
        </el-form-item>
        <el-form-item label="权限字符">
          <el-input v-model="form.roleKey" :disabled="true" />
        </el-form-item>
        <el-form-item label="权限范围">
          <el-select v-model="form.dataScope" @change="dataScopeSelectChange">
            <el-option
              v-for="item in dataScopeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="数据权限" v-show="form.dataScope == 2">
          <el-checkbox v-model="deptExpand"  @change="handleCheckedTreeExpand($event, 'dept')">
            展开/折叠
          </el-checkbox>
          <el-checkbox v-model="deptNodeAll" @change="handleCheckedTreeNodeAll($event, 'dept')">
            全选/全不选
          </el-checkbox>
          <el-checkbox v-model="form.deptCheckStrictly"  @change="handleCheckedTreeConnect($event, 'dept')">
            父子联动
          </el-checkbox>
          <el-tree  :data="deptOptions" ref="dept" :props="defaultProps"
            class="tree-border"          
            show-checkbox
            default-expand-all         
            node-key="id"
            :check-strictly="!form.deptCheckStrictly"
            empty-text="加载中，请稍后"           
          ></el-tree>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitDataScope">确 定</el-button>
        <el-button @click="cancelDataScope">取 消</el-button>
      </div>
    </el-dialog> -->
  </div>
</template>

<script>
import {
  listRole,
  getRole,
  delRole,
  addRole,
  updateRole,
  exportRole,
  dataScope,
  changeRoleStatus,
  findmodeRole,
} from "@/api/system/role";
import {
  treeselect as menuTreeselect,
  roleMenuTreeselect,
} from "@/api/system/menu";
import {
  treeselect as deptTreeselect,
  roleDeptTreeselect,
  unittreeselect,
  listDept,
} from "@/api/system/dept";

import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
// import store from "@/store";
export default {
  name: "Role",
  components: { Treeselect },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 导出遮罩层
      exportLoading: false,
      // 选中数组
      ids: [],
      // // 非单个禁用
      // single: true,
      // // 非多个禁用
      // multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 角色表格数据
      roleList: [],
      // orgOptions: [],
      findmoderoleInfo: [],//角色模板
      
      title: "",  // 弹出层标题
      open: false,// 添加或修改角色对话框
      openDataScope: false,//分配角色是否显示
      menuExpand: false,//展开折叠
      menuNodeAll: false,//全选/不选
      deptExpand: true, //数据权限 绑定的model

      deptNodeAll: false,//全选/不选 绑定的model
      // 日期范围
      dateRange: [],
      // 状态数据字典
      statusOptions: [],  
      menuOptions: [],// 菜单列表
      deptOptions: [],// 部门列表
      roletypeOptions: [],//角色类型下拉
      deptList: {},//机构下拉
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        postname: undefined,
        // roleKey: undefined,
        status: undefined,
      },
      // 表单参数
      form: {},
      defaultProps: {
        children: "children",
        label: "label",
      },
      // 表单校验
      rules: {
        postname: [ { required: true, message: "角色名称不能为空", trigger: "blur" } ],
        // unitid: [{ required: true, message: "隶属部门不能为空", trigger: "blur" } // ],
        roleSort: [ { required: true, message: "角色顺序不能为空", trigger: "blur" }, ],
        orgid: [ { required: true, message: "隶属机构不能为空", trigger: "blur" } ],
      },
      // addOptions: [],
      // // 数据范围选项
      // dataScopeOptions: [
      //   {
      //     value: "1",
      //     label: "全部数据权限",
      //   },
      //   {
      //     value: "2",
      //     label: "自定数据权限",
      //   },
      //   {
      //     value: "3",
      //     label: "本部门数据权限",
      //   },
      //   {
      //     value: "4",
      //     label: "本部门及以下数据权限",
      //   },
      //   {
      //     value: "5",
      //     label: "仅本人数据权限",
      //   },
      // ],       
    };
  },
  created() {
    // this.getDicts("sys_role_tj").then((response) => {
    //   this.addOptions = response.data;
    // });  
    this.getDicts("sys_normal_disable").then((response) => {
      this.statusOptions = response.data;
    });
    this.getDicts("sys_role_type").then((response) => {
      this.roletypeOptions = response.data;
    });  
    this.getList();

    findmodeRole().then((response) => {
      this.findmoderoleInfo = response.data;
    });
  },
  methods: {
    /** 查询角色列表 */
    getList() {
      this.loading = true;
      listRole(this.addDateRange(this.queryParams, this.dateRange)).then(
        (response) => {
          this.roleList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
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
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.roleid);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    async handleAdd() {
      this.reset();
      await this.getMenuTreeselect();
      this.form.orgname = "";
      listDept().then((response) => { 
          this.title = "添加角色";
          this.deptList = response.rows;
          this.loading = false;
          this.open = true;            
      });
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const roleid = row.roleid || this.ids;
      const roleMenu = this.getRoleMenuTreeselect(roleid);
      getRole(roleid).then((response) => {
        if(response.code==200){
          this.form = response.data;
          this.open = true;
          this.deptList = [
            {
              id: response.data.orgid,
              name: response.data.orgname,
            },
          ];
          this.$nextTick(() => {
            roleMenu.then((res) => {
              let checkedKeys = res.checkedKeys;
              checkedKeys.forEach((v) => {
                this.$nextTick(() => {
                  this.$refs.menu.setChecked(v, true, false);
                });
              });
            });
          });
          this.title = "修改角色";
        }else{
          this.msgError("获取角色信息失败");
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const roleIds = row.roleid || this.ids;
      this.$confirm(
        '是否确认删除角色编号为"' + roleIds + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return delRole(roleIds);
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
      this.$confirm("是否确认导出所有角色数据项?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.exportLoading = true;
          return exportRole(queryParams);
        })
        .then((response) => {
          this.download(response.msg);
          this.exportLoading = false;
        })
        .catch(() => {});
    },      
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.roleid != undefined) {
            this.form.menus = this.getMenuAllCheckedKeys();
            updateRole(this.form).then((response) => {
              if(response.code==200){
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              }else{
                this.msgError(response.message);
              }
            }).catch(() => {});
          } else {
            this.form.menus = this.getMenuAllCheckedKeys();
            addRole(this.form).then((response) => {
              if(response.code==200){
                this.msgSuccess("新增成功");
                this.open = false;
                this.getList();
              }else{
                this.msgError(response.message);
              }

            }).catch(() => {});
          }
        }
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      if (this.$refs.menu) {
        this.$refs.menu.setCheckedKeys([]);
      }
      (this.menuExpand = false),
        (this.menuNodeAll = false),
        (this.deptExpand = true),
        (this.deptNodeAll = false),
        (this.form = {
          roleid: undefined,
          name: undefined,
          roleKey: undefined,
          adminmark: undefined,
          roleSort: 0,
          status: "0",
          menus: [],
          deptIds: [],
          menuCheckStrictly: true,
          deptCheckStrictly: true,
          remark: undefined,
          unitname: undefined,
          unitid: undefined,
        });
      this.resetForm("form");
    },  
    // /** 分配用户操作 */
    // handleAuthUser: function (row) {
    //   const roleid = row.roleid;
    //   this.$router.push("/auth/user/" + roleid);
    // },    
    // /** 分配数据权限操作 */
    // handleDataScope(row) {
    //   this.reset();
    //   const roleDeptTreeselect = this.getRoleDeptTreeselect(row.roleid);
    //   getRole(row.roleid).then((response) => {
    //     this.form = response.data;
    //     this.openDataScope = true;
    //     this.$nextTick(() => {
    //       roleDeptTreeselect.then((res) => {
    //         this.$refs.dept.setCheckedKeys(res.checkedKeys);
    //       });
    //     });
    //     this.title = "分配数据权限";
    //   });
    // },    
    // /** 提交按钮（数据权限） */
    // submitDataScope: function () {
    //   if (this.form.roleid != undefined) {
    //     this.form.deptIds = this.getDeptAllCheckedKeys();
    //     dataScope(this.form).then((response) => {
    //       this.msgSuccess("修改成功");
    //       this.openDataScope = false;
    //       this.getList();
    //     }).catch(() => {});
    //   }
    // },      
    // // 取消按钮（数据权限）
    // cancelDataScope() {
    //   this.openDataScope = false;
    //   this.reset();
    // },
    // /** 转换部门数据结构 */
    // normalizer(node) {
    //   if (node.children && !node.children.length) {
    //     delete node.children;
    //   }
    //   return {
    //     id: node.id,
    //     label: node.label,
    //     children: node.children,
    //   };
    // },
   
    // // 更多操作触发
    // handleCommand(command, row) {
    //   switch (command) {
    //     case "handleDataScope":
    //       this.handleDataScope(row);
    //       break;
    //     case "handleAuthUser":
    //       this.handleAuthUser(row);
    //       break;
    //     default:
    //       break;
    //   }
    // },
    //选择角色模版
    handleRole(index) {
      const roleid = index;
      const roleMenu = this.getRoleMenuTreeselect(index);
      getRole(roleid).then((response) => {
        if(response.code==200){
          this.$nextTick(() => {
            roleMenu.then((res) => {
              let checkedKeys = res.checkedKeys;
              checkedKeys.forEach((v) => {
                this.$nextTick(() => {
                  this.$refs.menu.setChecked(v, true, false);
                });
              });
            });
          });
        }
      });
    },    
    // 角色状态修改
    handleStatusChange(row) {
      let text = row.status === "0" ? "启用" : "停用";
      this.$confirm('确认要"' + text + '""' + row.name + '"角色吗?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return changeRoleStatus(row.roleid, row.status);
        })
        .then(() => {
          this.msgSuccess(text + "成功");
        })
        .catch(function () {
          row.status = row.status === "0" ? "1" : "0";
        });
    },     
    /** 查询菜单下拉树结构 */
    getTreeselect() {
      unittreeselect({ orgid: this.form.orgid }).then((response) => {
        // this.orgOptions = [];
        const menu = { id: 0, label: "部门类目", children: [] };
        menu.children = this.handleTree(response.data, "id");
        // this.orgOptions.push(menu);
      });
    },    
    // 树权限（展开/折叠）
    handleCheckedTreeExpand(value, type) {
      if (type == "menu") {
        let treeList = this.menuOptions;
        for (let i = 0; i < treeList.length; i++) {
          this.$refs.menu.store.nodesMap[treeList[i].id].expanded = value;
        }
      } else if (type == "dept") {
        let treeList = this.deptOptions;
        for (let i = 0; i < treeList.length; i++) {
          this.$refs.dept.store.nodesMap[treeList[i].id].expanded = value;
        }
      }
    },
    // 树权限（全选/全不选）
    handleCheckedTreeNodeAll(value, type) {
      if (type == "menu") {
        this.$refs.menu.setCheckedNodes(value ? this.menuOptions : []);
      } else if (type == "dept") {
        this.$refs.dept.setCheckedNodes(value ? this.deptOptions : []);
      }
    },
    // 树权限（父子联动）
    handleCheckedTreeConnect(value, type) {
      if (type == "menu") {
        this.form.menuCheckStrictly = value ? true : false;
      } else if (type == "dept") {
        this.form.deptCheckStrictly = value ? true : false;
      }
    },
   /** 查询菜单树结构 */
    getMenuTreeselect() {
      menuTreeselect().then((response) => {
        this.menuOptions = response.data;
      });
    },
    // 所有菜单节点数据
    getMenuAllCheckedKeys() {
      // 目前被选中的菜单节点
      let checkedKeys = this.$refs.menu.getHalfCheckedKeys();
      // 半选中的菜单节点
      let halfCheckedKeys = this.$refs.menu.getCheckedKeys();
      checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
      return checkedKeys;
    },
    /** 根据角色ID查询菜单树结构 */
    getRoleMenuTreeselect(roleid) {
      return roleMenuTreeselect(roleid).then((response) => {
        this.menuOptions = response.menus;
        return response;
      });
    },
    // /** 选择角色权限范围触发 */
    // dataScopeSelectChange(value) {
    //   if (value !== "2") {
    //     this.$refs.dept.setCheckedKeys([]);
    //   }
    // },    
    // /** 查询部门树结构 */
    // getDeptTreeselect() {
    //   deptTreeselect().then((response) => {
    //     this.deptOptions = response.data;
    //   });
    // },    
    // // 所有部门节点数据
    // getDeptAllCheckedKeys() {
    //   // 目前被选中的部门节点
    //   let checkedKeys = this.$refs.dept.getCheckedKeys();
    //   // 半选中的部门节点
    //   let halfCheckedKeys = this.$refs.dept.getHalfCheckedKeys();
    //   checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
    //   return checkedKeys;
    // },    
    // /** 根据角色ID查询部门树结构 */
    // getRoleDeptTreeselect(roleid) {
    //   return roleDeptTreeselect(roleid).then((response) => {
    //     this.deptOptions = response.depts;

    //     return response;
    //   });
    // },            
  },
};
</script>
