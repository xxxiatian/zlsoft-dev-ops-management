<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--部门数据-->
      <el-col :span="4" :xs="24">
        <div class="head-container">
          <el-input
            v-model="deptName"
            placeholder="请输入部门名称"
            clearable
            size="small"
            prefix-icon="el-icon-search"
            style="margin-bottom: 20px"
          />
        </div>
        <div class="head-container">
          <el-tree
            class="dept-tree"
            :data="unittreOptions"
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
        <el-form
          :model="queryParams"
          ref="queryForm"
          :inline="true"
          v-show="showSearch"
        >
          <el-form-item label="部门名称" prop="name">
            <el-input
              v-model="queryParams.name"
              placeholder="请输入部门名称"
              clearable
              size="small"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="部门类别" prop="unittype">
            <el-input
              v-model="queryParams.unittype"
              placeholder="请输入部门类别"
              clearable
              size="small"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select
              v-model="queryParams.status"
              placeholder="部门状态"
              clearable
              size="small"
            >
              <el-option
                v-for="dict in statusOptions"
                :key="dict.dictValue"
                :label="dict.dictLabel"
                :value="dict.dictValue"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button  type="primary"  icon="el-icon-search"  size="mini"  @click="handleQuery" >搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button  type="primary"  icon="el-icon-plus"  size="mini"  @click="handleAdd"  v-hasPermi="['system:user:add']"  plain >
              新增
            </el-button>
          </el-col>
          <right-toolbar
            :showSearch.sync="showSearch"
            @queryTable="getList"
          ></right-toolbar>
        </el-row>

        <el-table  :data="deptList"
          v-loading="loading"
          element-loading-text="拼命加载中"          
          row-key="id"
          default-expand-all
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        >
          <el-table-column  prop="orgname"  label="机构名称"  align="center"  min-width="20%"></el-table-column>
          <el-table-column  prop="name"     label="部门名称"  align="center"  min-width="16%"></el-table-column>
          <el-table-column  prop="unittype" label="部门类型"  align="center"  min-width="14%"></el-table-column>
          <el-table-column  prop="status"   label="状态"      align="center"  min-width="10%"  :formatter="statusFormat"></el-table-column>
          <el-table-column  prop="contact"  label="部门联系人"  align="center"  min-width="15%"></el-table-column>
          <el-table-column  prop="tel"      label="部门电话"  align="center"  min-width="14%"></el-table-column>
          <el-table-column  prop="createTime" label="创建时间"  align="center"  min-width="18%">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.createAt) }}</span>
            </template>
          </el-table-column>
          <el-table-column  label="操作"  align="center"  min-width="15%"  class-name="small-padding fixed-width"  >
            <template slot-scope="scope" v-if="scope.row.isadmin != 0">
              <el-button  size="mini"  type="text"  icon="el-icon-edit"  @click="handleUpdate(scope.row)"  v-hasPermi="['system:unit:edit']">
                修改
              </el-button>
              <!-- <el-button  size="mini"  type="text"  icon="el-icon-plus"  @click="handleAddgro(scope.row)"  v-hasPermi="['system:unit:add']"  >
                新增小组
              </el-button> -->
              <el-button  size="mini"  type="text"  icon="el-icon-delete"  @click="handleDelete(scope.row)"  v-hasPermi="['system:unit:delete']">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination
          :total="total"
          :page.sync="queryParams.pageNum"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />
      </el-col>
    </el-row>
    <!-- 添加或修改部门对话框 -->
    <el-dialog :title="title"  :visible.sync="open"  width="600px" :close-on-click-modal="false"  append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col>
            <el-form-item label="机构名称" prop="orgname">
              <el-input  v-model="form.orgname"  placeholder="请输入机构名称"  :disabled="true"  />
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="上级部门" prop="punitid">
              <treeselect placeholder="请选择上级部门名称"
                v-model="form.punitid"
                :options="menuOptions"
                :normalizer="normalizer"
                :default-expand-level="2"
                :show-count="true"
                @input="pUnitChanged"
              />
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="部门名称" prop="name">
              <el-input  v-model="form.name"  placeholder="请输入部门名称"  maxlength="50"  />
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="部门类型" prop="unittype">
              <el-select  v-model="form.unittype"  placeholder="部门类型"  size="small"  clearable >
                <el-option
                  v-for="dict in deptTypeoptions"
                  :key="dict.dictValue"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item  v-show="icationshow"  label="产品名称"  prop="icationid" >
              <el-select  v-model="form.icationid"  placeholder="产品名称" size="small"  multiple  clearable >
                <el-option
                  v-for="dict in icationList"
                  :key="dict.icationid"
                  :label="dict.productname"
                  :value="dict.icationid"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="联系人" prop="contact">
              <el-input  v-model="form.contact"  placeholder="请输入部门联系人"  maxlength="50"  />
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="部门电话" prop="tel">
              <el-input  v-model="form.tel"  placeholder="请输入部门电话"  maxlength="50"  />
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="部门状态">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in statusOptions"
                  :key="dict.dictValue"
                  :label="dict.dictValue"
                  >{{ dict.dictLabel }}
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

    <!-- 添加小组 -->
    <el-dialog  :title="title"  :visible.sync="xzopen"  width="600px"  :close-on-click-modal="false" append-to-body >
      <el-form ref="form" :model="form" :rules="xzrules" label-width="80px">
        <el-row>
          <el-col>
            <el-form-item label="机构名称" prop="orgname">
              <el-input  v-model="form.orgname"  placeholder="请输入机构名称"  :disabled="true" />
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="部门名称" prop="name">
              <el-input  v-model="form.name"  placeholder="请输入部门名称"  maxlength="50"  disabled  />
            </el-form-item>
          </el-col>

          <el-col>
            <el-form-item label="小组名称" prop="groupname">
              <el-input  v-model="form.groupname"  placeholder="请输入小组名称"  maxlength="50"  />
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="人员名称" prop="personname">
              <el-input  v-model="form.personname"  placeholder="请输入人员名称"  maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="人员类型" prop="persontype">
              <el-select v-model="form.persontype"  placeholder="人员类型"  size="small"  clearable>
                <el-option
                  v-for="dict in groupOptions"
                  :key="dict.dictValue"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="小组状态">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in statusOptions"
                  :key="dict.dictValue"
                  :label="dict.dictValue"
                  >{{ dict.dictLabel }}
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
  </div>
</template>

<script>
import {
  unitDept,
  getUnit,
  delUnit,
  addUnit,
  updateUnit,
  unittreeselect,
} from "@/api/system/dept";
import { authorizeicaList } from "@/api/system/empower";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import store from "@/store";

export default {
  name: "Unit",
  components: { Treeselect },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      //部门类型
      deptTypeoptions: [],
      // 表格树数据
      deptList: [],
      deptName: undefined,
      total: 0,
      // 部门树选项
      deptOptions: [],
      // 菜单树选项
      menuOptions: [],
      unittreOptions: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      xzopen: false,
      icationshow: false,
      defaultProps: {
        children: "children",
        label: "label",
      },
      // 状态数据字典
      statusOptions: [],
      groupOptions: [],
      topList: [],
      icationList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: undefined,
        status: undefined,
        orgid: undefined,
        unittype: undefined,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [
          { required: true, message: "部门名称不能为空", trigger: "blur" },
        ],
        unittype: [
          { required: true, message: "部门类型不能为空", trigger: "blur" },
        ],
        punitid: [
          {required: true, message: "上级部门不能为空", trigger: "blur"}
        ],
        tel: [
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: "请输入正确的手机号码",
            trigger: "blur",
          },
        ],
        // orderNum: [
        //   { required: true, message: "显示排序不能为空", trigger: "blur" },
        // ],
      },
      xzrules: {
        persontype: [
          { required: true, message: "人员类型不能为空", trigger: "blur" },
        ],
        personname: [
          { required: true, message: "小组人员名称不能为空", trigger: "blur" },
        ],
        groupname: [
          { required: true, message: "小组名称不能为空", trigger: "blur" },
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
    this.getselect();
    //部门类型
    this.getDicts("sys_dept_type").then((response) => {
      this.deptTypeoptions = response.data;
    });
    this.getDicts("sys_normal_disable").then((response) => {
      this.statusOptions = response.data;
    });
    // //人员类型
    // this.getDicts("sys_group_person").then((response) => {
    //   this.groupOptions = response.data;
    // });
    // setTimeout(() => {
    this.getList();
    // }, 200);
  },
  methods: {
    /** 查询部门列表 */
    getList() {
      this.loading = true;
      this.deptList =[]
      unitDept(this.queryParams).then((response) => {
        this.deptList = this.handleTree(response.rows, "id");
        this.loading = false;
        this.total = response.total;
        // this.deptList.forEach((obj1) => {
        //   const matchedObj1 = this.deptTypeoptions.find(
        //     (obj2) => obj2.dictSort === obj1.unittype
        //   );
        //   if (matchedObj1) {
        //     obj1.unittype = matchedObj1.dictLabel;
        //   }
        // });
        if (store.getters.roles.organizationtype == "3") {
          const regList = this.deptTypeoptions.filter(
            (item) => item.dictValue == "1" || item.dictValue == "2"
          );
          this.deptTypeoptions = regList;
        }
      });
    },
    // 筛选节点
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    // 节点单击事件
    handleNodeClick(data) {
      this.queryParams.id = data.id;
      this.getList();
    },
    /** 查询菜单下拉树结构 */
    getTreeselect() {
      unittreeselect().then((response) => {
        this.menuOptions = [];
        const menu = { id: 0, label: "部门类目", children: [] };
        menu.children = this.handleTree(response.data, "id");
        this.menuOptions.push(menu);
        
        let menuOptionsAssign = []; 
        Object.assign(menuOptionsAssign,this.menuOptions)
        this.menuOptions = [];
        let orgType = store.getters.roles.organizationtype;
        if(orgType==0){
          menuOptionsAssign[0].children[0].children.forEach(item=>{
            this.menuOptions.push({
              id:item.id,
              label:item.label,
              type:1,
              children:item.children.map(item1=>({
                id:item1.id,
                label:item1.label,
                children:[],
                type:3
              }))
            })
          })
        }else if(orgType==1){
          console.log(menuOptionsAssign)
          menuOptionsAssign[0].children[0].children.forEach(item=>{
            this.menuOptions.push({
              id:item.id,
              label:item.label,
              type:3,
              children:[]
            })
          })          
        }else {           
           menuOptionsAssign[0].children.forEach(item=>{
            this.menuOptions.push({
              id:item.id,
              label:item.label,
              type:3,
              children:[]
            })
          })  
        }
      });
    },
    getselect() {
      unittreeselect().then((response) => {
        this.unittreOptions = response.data;
      });
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
        type:node.type
      };
    },
    // 字典状态字典翻译
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status);
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.xzopen = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        orgid: undefined,
        name: undefined,
        orgname: undefined,
        punitid: undefined,
        contact: undefined,
        tel: undefined,
        unittype: undefined,
        icationid: undefined,
        depicalist: undefined,
        status: "0",
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.queryParams.id = null;
      this.handleQuery();
    },
    /** 新增按钮操作 */
    async handleAdd(row) {
      this.reset();
      await this.getTreeselect();
      await authorizeicaList().then((response) => {
        this.icationList = response.data;
      });
      if (store.getters.roles.organizationtype == "3") {
        this.icationshow = true;
      }
      // this.form.orgname = store.getters.roles.orgaccount.orgname;
      // this.form.orgid = store.getters.roles.orgaccount.orgid;
      // this.form.punitid = store.getters.roles.orgaccount.orgid;
      this.open = true;
      this.title = "添加部门";
    },
    handleAddgro(row) {
      this.reset();
      // this.form.orgname = store.getters.roles.orgaccount.orgname;
      // this.form.orgid = store.getters.roles.orgaccount.orgid;
      this.form.orgname = row.orgname;
      this.form.orgid = row.orgid;
      this.form.name = row.name;
      this.xzopen = true;
      this.title = "添加小组";
    },

    /** 修改按钮操作 */
    async handleUpdate(row) {
      this.reset();
      await this.getTreeselect();
      await authorizeicaList().then((response) => {
        this.icationList = response.data;
      });
      if (store.getters.roles.organizationtype == "3") {
        this.icationshow = true;
      }
      getUnit(row.id).then((response) => {
        this.form = response.data;
        const icationids = response.data.depicalist.map(
          (item) => item.icationid
        );
        this.$set(this.form, "icationid", icationids);
        this.open = true;
        this.title = "修改部门";
      });
    },
    /** 提交按钮 */
    submitForm: function () {
      let obj = this.form.icationid;
      let arr = [];
      for (let key in obj) {
        arr.push({
          icationid: obj[key],
          value: key,
        });
      }
      this.form.depicalist = arr;
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id != undefined) {
            updateUnit(this.form).then((response) => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
              this.getselect();
            });
          } else {
            addUnit(this.form).then((response) => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.xzopen = false;
              this.getList();
              this.getselect();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$confirm('是否确认删除名称为"' + row.name + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return delUnit(row.id);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        })
        .catch(() => {});
    },
    // 上级部门变更事件
    pUnitChanged(val){
      let filterUnit = [];
      filterUnit = this.menuOptions.find(item=>item.id == val);
      if(filterUnit==undefined){
        filterUnit = this.menuOptions.find(item=>item.children &&item.children.find(item1=>item1.id==val))?.children.find(item1 => item1.id == val);
      }else{
        if(filterUnit.type==1){
           this.msgError("请选择当前的下级部门！");
           this.form.punitid = null;
           return;
        }
      }
      if(filterUnit){
        this.form.orgname = filterUnit.label;
        this.form.orgid = filterUnit.id;
        this.form.punitid = filterUnit.id;
      }
    }
  },
};
</script>
