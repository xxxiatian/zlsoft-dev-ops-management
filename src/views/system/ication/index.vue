<template>
  <div class="app-container">
    <el-form  :model="queryParams"  ref="queryForm"  v-show="showSearch"  :inline="true">
      <el-form-item label="产品名称" prop="name">
        <el-input  v-model="queryParams.name"  placeholder="请输入产品名称"  clearable  @keyup.enter.native="handleQuery"  />
      </el-form-item>
      <el-form-item>
        <el-button  type="primary" size="mini"  icon="el-icon-search"  @click="handleQuery"  >
          搜索
        </el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">
          重置
        </el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button  type="primary" size="mini" icon="el-icon-plus"  @click="handleAdd"  v-hasPermi="['system:ication:add']" plain>
          新增
        </el-button>
      </el-col>
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table :data="icationList"  v-loading="loading"  element-loading-text="拼命加载中"  row-key="id"  
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column label="产品名称"  prop="name" align="center" width="260"  fixed ></el-table-column>
      <el-table-column label="产品简介"  prop="profile" align="center" width="300"  :show-overflow-tooltip="true"></el-table-column>
      <el-table-column label="机构名称"  prop="orgname" align="center"  width="260"  ></el-table-column>
      <!-- <el-table-column label="部门名称"  prop="unitname"  align="center"  width="200" ></el-table-column> -->
      <el-table-column label="状态" align="center" key="status">
        <template slot-scope="scope" v-if="scope.row.modname == null">
          <el-switch
            v-model="scope.row.status"
            active-value="0"
            inactive-value="1"
            @change="handleStatusChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="修改人"  prop="updateBy"  align="center"  width="200"  ></el-table-column>
      <el-table-column label="修改时间" prop="updateAt"  align="center"  width="200" >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updateAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建人"  prop="createBy"  align="center"  width="180"  ></el-table-column>
      <el-table-column label="创建时间"  prop="createAt" align="center"  width="200" >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column  label="操作"  align="center" width="300"  fixed="right"  class-name="small-padding fixed-width"  >
        <template slot-scope="scope">
          <el-button  size="mini"  type="text"  icon="el-icon-plus"  @click="handleiacAdd(scope.row)"  v-hasPermi="['system:ication:add']"  >
            模块新增
          </el-button>
          <el-button  size="mini"  type="text"  icon="el-icon-edit"  @click="handleUpdate(scope.row)"  v-hasPermi="['system:ication:edit']"  >
            修改
          </el-button>
          <el-button  size="mini"  type="text"  icon="el-icon-tickets"  @click="handlemodQuery(scope.row)"  v-hasPermi="['system:ication:edit']"  >
            查看
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
    <!-- 产品添加或修改产品对话框 -->
    <el-dialog  :title="title"  :visible.sync="open"  width="600px"  :close-on-click-modal="false"  append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col>
            <el-form-item v-show="addShow" label="机构名称" prop="orgid">
              <el-input v-model="form.orgname" placeholder="请输入机构名称" disabled  />
              <!-- <treeselect placeholder="请选择机构名称"
                v-model="form.orgid"
                :options="orgOptions"
                :normalizer="normalizer"
                :default-expand-level="2"
                :show-count="true"
                @input="pOrgChanged"
              /> -->
            </el-form-item>
          </el-col>
          <!-- <el-col v-show="addShow">
            <el-form-item label="部门名称" prop="unitid">
              <treeselect  v-model="form.unitid" placeholder="请选择上级部门名称"  :options="unitOptions"  :normalizer="normalizer"
                :default-expand-level="2"  :show-count="true" />
            </el-form-item>
          </el-col> -->
          <el-col v-show="modShow">
            <el-form-item label="模块名称" prop="modname">
              <el-input v-model="form.modname" placeholder="请输入模块名称" />
            </el-form-item>
          </el-col>
          <el-col v-show="addShow">
            <el-form-item label="产品名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入产品名称" />
            </el-form-item>
          </el-col>
          <el-col v-show="addShow">
            <el-form-item label="产品分类" prop="type">
              <el-select  v-model="form.type"  placeholder="部门类型" size="small"  clearable >
                <el-option
                  v-for="dict in icationOptions"
                  :key="dict.dictValue"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item v-show="addShow" label="产品状态">
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
          <el-col v-show="addShow">
            <el-form-item label="产品简介" prop="profile">
                <el-input v-model="form.profile" placeholder="请输入产品简介"  type="textarea"  />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 查看模块 -->
    <el-dialog  :title="title"  :visible.sync="ckopen"  width="600px"  :close-on-click-modal="false"  append-to-body  >
      <el-form ref="form" :model="form" :rules="rules" label-width="150px">
        <el-row>
          <el-col>
            <el-table :data="modList"  v-loading="loading"  row-key="id"
              border  default-expand-all  :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
            >
              <el-table-column  prop="productname"  label="产品名称"  align="center"  width="200"  ></el-table-column>
              <el-table-column  prop="modname"  label="模块名称"  align="center"  width="178" ></el-table-column>
              <el-table-column  label="操作"  align="center"  width="180"  >
                <template slot-scope="scope">
                  <el-button  size="mini"  type="text"  icon="el-icon-edit"  @click="handleUpdate(scope.row)"  v-hasPermi="['system:ication:edit']"  >
                    修改
                  </el-button>
                  <el-button  size="mini"  type="text"  icon="el-icon-delete"  @click="handleDelete(scope.row)"  v-hasPermi="['system:ication:delete']"  v-if="scope.row.modname != null"  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  icamodList,
  addIcamod,
  updateIcamod,
  stopStatus,
  delIcation,
  addMod,
  getmodList,
  updateMod,
} from "@/api/system/ication";
import { getOrgList} from "@/api/order/service/rec";
// import { unittreeselect } from "@/api/system/dept";
// import Treeselect from "@riophae/vue-treeselect";
// import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import store from "@/store";
export default {
  name: "Unit",
  // components: { Treeselect },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      ckopen: false,//查看模块对话框 
      deptTypeoptions: [],//部门类型
      icationList: [],// 产品列表
      modList: [], //模块列表
      deptOptions: [],// 部门树选项
      // orgtypeOptions: [],
      icationOptions: [], //产品下拉
      // unitOptions: [],
      // 弹出层标题
      title: "",  
      total: 0,// 总数      
      open: false,// 产品添加或修改对话框
      addShow: false, //表单内容是否显示
      modShow: false, //模块名称是否显示
      statusOptions: [],// 产品状态数据字典
      // 查询参数
      queryParams: {
        pageSize: 10,
        pageNum: 1,
        name: undefined,
        status: undefined,
        id: undefined,
        orgid: undefined,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {},
      // 机构树
      orgOptions: [],
      // 产品所属机构
      toOrg:{}
    };
  },
  created() {
    this.getList();

    this.getDicts("sys_normal_disable").then((response) => {
      this.statusOptions = response.data;
    });
    this.getDicts("sys_ication_cp").then((response) => {
      this.icationOptions = response.data;
    });

    getOrgList().then((res) => {
      if(res){
        this.toOrg = res.data.find(item=>item.name=="河南中联");   
      }
    });    
  },
  methods: {
    /** 查询产品列表 */
    getList() {
      this.loading = true;
      this.icationList =  []
      console.log(this.queryParams)
      icamodList(this.queryParams).then((response) => {
        this.icationList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.queryParams.id = undefined;
      this.handleQuery();
    },
    /** 新增按钮操作 */
    handleAdd(row) {
      this.reset();  
      // this.getUnit();
      // this.getTreeselect();
      // this.form.orgname = store.getters.roles.orgaccount.orgname;
      // this.form.orgid = store.getters.roles.orgaccount.orgid;
      this.form.orgid = this.toOrg.id;
      this.form.orgname = this.toOrg.name;          
      this.open = true;
      this.addShow = true;
      this.title = "添加产品";
    },
    //模块新增
    handleiacAdd(row) {
      this.reset();
      this.form.icationid = row.id;
      this.form.productname = row.name;
      this.form.orgid = this.toOrg.id;
      this.form.orgname = this.toOrg.name;       
      this.open = true;
      this.modShow = true;
      this.title = "添加模块";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.form.orgid = this.toOrg.id;
      this.form.orgname = this.toOrg.name;        
      // this.getTreeselect();
      if (row.modname == undefined) {
        // this.getUnit();
        this.addShow = true;
        this.queryParams.id = row.id;
        icamodList(this.queryParams).then((response) => {
          console.log(response)
          this.form = response.rows[0];
          // if (this.form.type != null && this.form.type != undefined) {
          //   let type = this.icationOptions.find(
          //     (item) => item.dictValue === this.form.type
          //   )?.dictValue;
          // }
          // console.log( this.form.type);
          this.open = true;
          this.title = "修改产品";
        });
      } else {
        this.form.modname = row.modname;
        this.form.icationid = row.icationid;
        this.form.modid = row.modid;
        this.modShow = true;
        this.open = true;
        this.title = "修改模块";
      }
    },
    // 查看
    handlemodQuery(row) {
      this.getModlist(row.id);
    },
    // 取消按钮
    cancel() {
      if (this.title == "修改模块") {
        this.open = false;
        this.title = "产品模块";
      } else {
        this.ckopen = false;
        this.open = false;
        this.addShow = false;
        this.modShow = false;
      }

      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        icationid: undefined,
        productname: undefined,
        orgid: undefined,
        orgname: undefined,
        unitid: undefined,
        modname: undefined,
        name: undefined,
        type: undefined,
        profile: undefined,
        status: "0",
      };
      this.resetForm("form");
    },
    // getUnit() {
    //   unittreeselect().then((response) => {
    //     this.unitOptions = [];
    //     const menu = { id: 0, label: "部门类目", children: [] };
    //     menu.children = this.handleTree(response.data, "id");
    //     this.unitOptions.push(menu);
    //   });
    // },

    // 产品状态修改
    handleStatusChange(row) {
      let text = row.status === "0" ? "启用" : "停用";
      this.$confirm('确认要"' + text + '""' + row.name + '"用户吗?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          let obj = {
            id: row.id,
            status: row.status,
          };
          return stopStatus(obj);
        })
        .then(() => {
          this.msgSuccess(text + "成功");
        })
        .catch(function () {
          row.status = row.status === "0" ? "1" : "0";
        });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$confirm(
        '是否确认删除名称为"' + row.modname + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return delIcation(row.modid);
        })
        .then(() => {
          this.getModlist(row.icationid);
          this.msgSuccess("删除成功");
        })
        .catch(() => {});
    },    
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.title.includes("添加")) {
            if (this.title == "添加产品") {
              if (this.form.name == "" || this.form.name == undefined) {
                this.msgSuccess("请填写产品名称！");
                return;
              }
              //产品新增
              addIcamod(this.form).then((response) => {
                this.msgSuccess("新增成功");
                this.open = false;
                this.modShow = false;
                this.addShow = false;
                this.getList();
              }).catch(() => {});
            } else {
              //模块新增
              addMod(this.form).then((response) => {
                this.msgSuccess("新增成功");
                this.open = false;
                this.modShow = false;
                this.addShow = false;
              }).catch(() => {});
            }
          } else {
            if (this.title == "修改产品") {
              this.queryParams.id = undefined;
              //产品修改
              updateIcamod(this.form).then((response) => {
                this.msgSuccess("修改成功");
                this.open = false;
                this.modShow = false;
                this.addShow = false;
                this.getList();
              }).catch(() => {});
            } else {
              //模块修改
              updateMod(this.form).then((response) => {
                this.open = false;
                this.modShow = false;
                this.addShow = false;
                this.getModlist(response.id);
                this.msgSuccess("修改成功");
              }).catch(() => {});
            }
          }
        }
      });
    },
    /** 查询菜单下拉树结构 */
    getTreeselect() {
      unittreeselect().then((response) => {
        this.orgOptions = [];
        const menu = { id: 0, label: "部门类目", children: [] };
        menu.children = this.handleTree(response.data, "id");
        this.orgOptions.push(menu);
  
        let orgOptionsAssign = []; 
        Object.assign(orgOptionsAssign,this.orgOptions)
        this.orgOptions = [];
        let orgType = store.getters.roles.organizationtype;
        if(orgType==0){
          orgOptionsAssign[0].children[0].children.forEach(item=>{
            this.orgOptions.push({
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
          console.log(orgOptionsAssign)
          orgOptionsAssign[0].children[0].children.forEach(item=>{
            this.orgOptions.push({
              id:item.id,
              label:item.label,
              type:3,
              children:[]
            })
          })          
        }else {          
           orgOptionsAssign[0].children.forEach(item=>{
            this.orgOptions.push({
              id:item.id,
              label:item.label,
              type:3,
              children:[]
            })
          })  
        }
      });
    },    
    // 机构变更事件
    pOrgChanged(val){
      let filterUnit = [];
      filterUnit = this.orgOptions.find(item=>item.id == val);
      if(filterUnit==undefined){
        filterUnit = this.orgOptions.find(item=>item.children &&item.children.find(item1=>item1.id==val))?.children.find(item1 => item1.id == val);
      }else{
        if(filterUnit.type==1){
           this.msgError("请选择当前的下级机构！");
           this.form.orgid = null;
           this.form.orgname = null;
           return;
        }
      }
      if(filterUnit){
        this.form.orgname = filterUnit.label;
        this.form.orgid = filterUnit.id;
        // this.form.punitid = filterUnit.id;
      }
    },
    getModlist(id) {
      getmodList({ id: id }).then((response) => {
        this.modList = response.data;
        this.ckopen = true;
        this.title = "产品模块";
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
      };
    },  
    // 字典状态字典翻译
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status);
    },      
  },
};
</script>
