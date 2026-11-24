<template>
  <div class="app-container">
    <el-form  :model="queryParams"  ref="queryForm" v-show="showSearch"  :inline="true" >
      <el-form-item label="部门名称" prop="deptName">
        <el-input  v-model="queryParams.deptName"  placeholder="请输入部门名称" size="small"  clearable  @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status"  placeholder="部门状态" size="small"  clearable >
          <el-option
            v-for="dict in statusOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button  type="primary" size="mini"  icon="el-icon-search"  @click="handleQuery">搜索</el-button>
        <el-button  size="mini"  icon="el-icon-refresh" @click="resetQuery">重置</el-button
        >
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" size="mini" icon="el-icon-plus"  plain  @click="handleAdd"  v-hasPermi="['system:dept:add']">
          新增
        </el-button>
      </el-col>

      <right-toolbar  :showSearch.sync="showSearch"  @queryTable="getList" ></right-toolbar>
    </el-row>

    <el-table  v-loading="loading"  :data="deptList"  row-key="deptId" :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
      <el-table-column  prop="deptName" label="部门名称"  width="260"></el-table-column>
      <el-table-column  prop="orderNum" label="排序"      width="200"></el-table-column>
      <el-table-column  prop="status"   label="状态"      width="100"  :formatter="statusFormat"></el-table-column>
      <el-table-column  prop="createTime" label="创建时间" width="200"  align="center">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column  label="操作"  align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button  size="mini"  type="text"  icon="el-icon-edit"  @click="handleUpdate(scope.row)"  v-hasPermi="['system:dept:edit']">
            修改
          </el-button>
          <el-button  size="mini"  type="text"  icon="el-icon-plus"  @click="handleAdd(scope.row)"     v-hasPermi="['system:dept:add']">
            新增
          </el-button>
          <el-button  size="mini"  type="text"  icon="el-icon-delete"  @click="handleDelete(scope.row)"  v-hasPermi="['system:dept:remove']" v-if="scope.row.parentId != 0" >
            删除
          </el-button>
          <el-button  size="mini"  type="text"  icon="el-icon-edit"  @click="handleAssignUser(scope.row)"  v-hasPermi="['system:dept:edit']" v-if="scope.row.ancestors.split(',').length==2" >
            分配人员
          </el-button>
          <el-button size="mini"  type="text"  @click="showAssignedUser(scope.row)" v-if="scope.row.ancestors.split(',').length==2">
            查看分配人员
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改部门对话框 -->
    <el-dialog  :title="title"  :visible.sync="open"  width="600px"  :close-on-click-modal="false" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col v-if="form.parentId !== 0">
            <el-form-item label="上级部门" prop="parentId">
              <treeselect
                v-model="form.parentId"
                :options="deptOptions"
                :normalizer="normalizer"
                placeholder="选择上级部门"
              />
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="部门名称" prop="deptName">
              <el-input v-model="form.deptName" placeholder="请输入部门名称" />
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="部门类型" prop="deptType">
              <el-select  v-model="form.deptType" placeholder="请选择部门类型"  @change="depttypeasd"   clearable size="small">
                <el-option
                  v-for="rce in deptTypeoptions"
                  :key="rce.dictValue"
                  :label="rce.dictLabel"
                  :value="rce.dictValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="显示排序" prop="orderNum">
              <el-input-number  v-model="form.orderNum"  controls-position="right"  :min="0" />
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="负责人" prop="leader">
              <el-input  v-model="form.leader"  placeholder="请输入负责人"  maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="联系电话" prop="phone">
              <el-input  v-model="form.phone"  placeholder="请输入联系电话"  maxlength="11" />
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="邮箱" prop="email">
              <el-input  v-model="form.email"  placeholder="请输入邮箱"  maxlength="50"  />
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="部门状态">
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
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 分配人对话框 -->
    <el-dialog  :title="title"  :visible.sync="openDown"  width="500px"  append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-col :span="12">
          <el-form-item label="分配人">
            <el-select  v-model="form.userIds" placeholder="请选择分配人"  multiple  @change="selectUser">
              <el-option
                v-for="type in distributiond"
                :key="type.userId"
                :label="type.nickName"
                :value="type.userId"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFormUser">确 定</el-button>
      </div>
    </el-dialog>


    <!-- 人员信息对话框 -->
    <el-dialog  :title="title"  :visible.sync="openStaff"  width="800px"  append-to-body  >
      <el-table :data="tableData"  style="width: 100%"  height="250">
      <el-table-column  prop="nickName"  label="姓名" width="150"> </el-table-column>
      <el-table-column  prop="phonenumber" label="手机号码" width="120"> </el-table-column>
      <el-table-column  prop="email"  label="邮箱" width="300"></el-table-column>
      <el-table-column  label="操作" align="center"  class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button  size="mini"  type="text"  icon="el-icon-delete"  @click="staffDelete(scope.row)" v-if="scope.row.parentId != 0">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

  </div>
</template>

<script>
import {
  listDept,
  getDept,
  delDept,
  addDept,
  updateDept,
  listDeptExcludeChild,
} from "@/api/system/dept";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import { deptList, distributiond,getsysStaff,staffdel } from "@/api/order/service/rec";
import {
  addUser,
  updateUser,
 
} from "@/api/custoomer/sysuserdept/user";

export default {
  name: "Dept",
  components: { Treeselect },
  data() {
    return {    
      tableData:[],  //查询分配的员工 
      loading: true,   // 遮罩层
      showSearch: true,// 显示搜索条件
      distributiond:[],//分配人    
      deptTypeoptions: [],//部门类型     
      deptList: [], //部门列表     
      deptOptions: [],// 部门树选项
      title: "",// 弹出层标题
      openDown: false,//部门人员对话框
      openStaff:false,//用户信息对话框
      open: false,//部门对话框
      deptId:"",
      statusOptions: [],// 部门状态数据字典
      // 查询参数
      queryParams: {
        deptName: undefined,
        status: undefined,
      },
      form: {},// 表单参数
      // 表单校验
      rules: {
        parentId: [ { required: true, message: "上级部门不能为空", trigger: "blur" }],
        deptName: [ { required: true, message: "部门名称不能为空", trigger: "blur" }],
        orderNum: [ { required: true, message: "显示排序不能为空", trigger: "blur" }],
        email:    [ { type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"]} ],
        phone:    [ { pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,  message: "请输入正确的手机号码",  trigger: "blur" }],
      },
    };
  },
  created() {
    this.getdistributiondList();
    this.getList();
    this.getDicts("sys_normal_disable").then((response) => {
      this.statusOptions = response.data;
    });
    //部门类型
    this.getDicts("sys_dept_type").then((response) => {
      this.deptTypeoptions = response.data;
    });
  },
  methods: {
    //**********【1-筛选区】 查询部门列表方法 */
    getList() {
      this.loading = true;
      deptList(this.queryParams).then((response) => {
        this.deptList = this.handleTree(response.data, "deptId");
        this.loading = false;
      });
    },
    //**********【1-筛选区】  搜索按钮操作 */
    handleQuery() {
      this.getList();
    },
    //**********【1-筛选区】  重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },    
    //###########【3-表单】 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    //===========【2-列表区】 新增按钮操作 */
    handleAdd(row) {
      this.reset();
      if (row != undefined) {
        this.form.parentId = row.deptId;
      }
      this.open = true;
      this.title = "添加部门";
      listDept().then((response) => {
      this.deptOptions = this.handleTree(response.data, "deptId");
      });
    },
    //===========【2-列表区】 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      getDept(row.deptId).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改部门";
      });
      listDeptExcludeChild(row.deptId).then((response) => {
        this.deptOptions = this.handleTree(response.data, "deptId");
      });
    },
    //===========【2-列表区】 删除按钮操作 */
    handleDelete(row) {
      this.$confirm(
        '是否确认删除名称为"' + row.deptName + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return delDept(row.deptId);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        })
        .catch(() => {});
    },    
    //===========【2-列表区】 分配人员操作 */
    handleAssignUser(row) {
      this.reset();
      const deptId = row.deptId || this.ids;

       getDept(deptId).then((response) => {
        this.form = response.data;
        this.openDown = true;
        this.title = "分配员工";
      });
    },
    //===========【2-列表区】 查看分配人员*/
    showAssignedUser(row) {
      this.reset();
      const deptId = row.deptId || this.ids;

       getsysStaff(deptId).then((response) => {
        this.tableData = response.data;
        this.deptId=row.deptId;
        this.openStaff = true;
        this.title = "分配员工";
      });
    },
    //###########【3-表单】 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.deptId != undefined) {
            updateDept(this.form).then((response) => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addDept(this.form).then((response) => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },    
    //###########【3-表单】 分配人员提交按钮 */
    submitFormUser() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.deptId == null) {
            updateUser(this.form).then((response) => {
              this.msgSuccess("修改成功");
              this.openDown = false;
              this.getList();
            });
          } else {
            addUser(this.form).then((response) => {
              this.msgSuccess("新增成功");
              this.openDown = false;
              this.getList();
            });
          }
        }
      });
    },
    //###########【3-表单】 删除员工 */
    staffDelete(row) {
      row.deptId=this.deptId;
      this.$confirm(
        '是否确认删除名称为"' + row.nickName + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function (){
          return staffdel(row.deptId,row.userId);
        })
        .then(() => {
         window.location.reload()
          this.msgSuccess("删除成功");
        })
        .catch(() => {});
    },  
    //===========【2-1列表区】 字典状态字典翻译
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status);
    },          
    //###########【3-1表单】获取分配人id
    selectUser(value) {
      var user = this.userList.find((item) => {
        return item.userIds === value;
      });
      
      this.form.UserIds = user.userId; 
    },
    //###########【3-2表单】获取分配人
    getdistributiondList() {
      this.loading = true;
      distributiond(this.queryParams).then((response) => {
        this.distributiond = response.rows;
        this.loading = false;
      });
    },

    //###########【3-3表单】 转换部门数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.deptId,
        label: node.deptName,
        children: node.children,
      };
    },
    //###########【3-4表单】 表单重置
    reset() {
      this.form = {
        deptId: undefined,
        parentId: undefined,
        deptName: undefined,
        orderNum: undefined,
        leader: undefined,
        phone: undefined,
        email: undefined,
        status: "0",
      };
      this.resetForm("form");
    },    
    //###########【3-5表单】 获取部门类型的值
    depttypeasd(value) {
      var Dept = this.deptTypeoptions.find((item) => {
        return item.dictValue === value;
      });
      this.form.deptType = Dept.dictValue;
      this.form.deptTypeValue = Dept.dictLabel;
    },    
  },
};
</script>
