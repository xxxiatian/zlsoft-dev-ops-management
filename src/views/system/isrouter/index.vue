<template>
  <div class="app-container">
    <el-form  :model="queryParams"  ref="queryForm"  :inline="true"  v-show="showSearch" >
      <el-form-item label="路由名称" prop="name">
        <el-input  v-model="queryParams.name"  placeholder="请输入路由名称"  size="small"  clearable  @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button  type="primary"  size="mini"  icon="el-icon-search"  @click="handleQuery" >
          搜索
        </el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">
          重置
        </el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button  type="primary"  size="mini"  icon="el-icon-plus"  @click="handleAdd"  v-hasPermi="['system:router:add']"   plain>
          新增
        </el-button>
      </el-col>
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table :data="icationList" v-loading="loading" element-loading-text="拼命加载中"  row-key="id"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column  prop="name"         label="路由名称"    align="center"  width="200"  :show-overflow-tooltip="true"  fixed></el-table-column>
      <el-table-column  prop="profile"      label="路由描述"    align="center"  width="300"  :show-overflow-tooltip="true" ></el-table-column>
      <el-table-column label="状态" align="center" key="status">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            active-value="0"
            inactive-value="1"
            @change="handleStatusChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column  prop="toorgname"    label="路由到机构"  align="center"  width="150" :show-overflow-tooltip="true" ></el-table-column>
      <el-table-column  prop="tounitname"   label="路由到部门"  align="center"  width="150" :show-overflow-tooltip="true" ></el-table-column>
      <el-table-column  prop="togroupname"  label="路由到小组"  align="center"  width="150" ></el-table-column>
      <!-- <el-table-column  prop="topersonname" label="路由到人员"  align="center"  width="150" ></el-table-column> -->
      <el-table-column  prop="tostatus"     label="路由到状态"  align="center"  width="100" ></el-table-column>
      <el-table-column  prop="type"         label="路由分类"    align="center"  width="150" ></el-table-column>
      <el-table-column  prop="updateBy"     label="修改人"      align="center"  width="120" ></el-table-column>
      <el-table-column  prop="updateAt"     label="修改时间"    align="center"  width="180" >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updateAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column  prop="createBy"     label="创建人"      align="center"  width="160" ></el-table-column>
      <el-table-column  prop="createAt"     label="创建时间"    align="center"  width="180" >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column  label="操作" align="center" width="200"  fixed="right"  class-name="small-padding fixed-width" >
        <template slot-scope="scope">
          <el-button  size="mini"  type="text"  icon="el-icon-edit"  @click="handleUpdate(scope.row)"  v-hasPermi="['system:router:edit']"  >
            修改
          </el-button>
          <el-button  size="mini"  type="text"  icon="el-icon-delete"  @click="handleDelete(scope.row)"  v-hasPermi="['system:router:delete']"  >
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
    <!-- 添加或修改部门对话框 -->
    <el-dialog :title="title"  :visible.sync="open" width="1100px"  :close-on-click-modal="false" append-to-body >
      <el-form ref="form" :model="form" :rules="rules" label-width="90px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="机构名称" prop="orgname">
              <el-input v-model="form.orgname" placeholder="请输入机构名称" disabled class="widthClass" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="部门名称" prop="unitname">
              <el-input  v-model="form.unitname"  placeholder="部门名称" disabled class="widthClass" />
            </el-form-item>
          </el-col>          
          <el-col :span="8">
            <el-form-item label="路由到机构" prop="toorgname">
              <el-input  v-model="form.toorgname"  placeholder="请输入路由到机构" disabled  class="widthClass" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="产品名称" prop="icationid">
              <el-select v-model="form.icationid" placeholder="产品名称"  @change="changemod"  @clear="clearmod"  size="small"  clearable class="widthClass">
                <el-option
                  v-for="dict in icamodList"
                  :key="dict.id"
                  :label="dict.name"
                  :value="dict.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="模块名称" prop="moduleid">
              <el-select  v-model="form.moduleid"  placeholder="模块名称" size="small"  clearable class="widthClass">
                <el-option
                  v-for="dict in modList"
                  :key="dict.modid"
                  :label="dict.modname"
                  :value="dict.modid"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="路由到状态" prop="tostatus">
              <el-select  v-model="form.tostatus"  placeholder="路由到状态" size="small"  clearable  class="widthClass">
                <el-option
                  v-for="dict in todocumentOptions"
                  :key="dict.dictValue"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="路由名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入路由名称"  class="widthClass" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="来源机构" prop="fromorgid">
              <el-select  v-model="form.fromorgid"  placeholder="来源机构"  @change="changeUnit"  @clear="clearUnit"  size="small"  clearable class="widthClass">
                <el-option
                  v-for="dict in fromorgList"
                  :key="dict.orgid"
                  :label="dict.orgname"
                  :value="dict.orgid"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8"  v-if="this.typeValue == 2 || this.typeValue == 3 || this.typeValue == 4">
            <el-form-item label="路由到部门" prop="tounitid">
              <el-select  v-model="form.tounitid"  placeholder="路由到部门" @change="changetounit" @clear="clearTounit" size="small"  clearable class="widthClass">
                <el-option
                  v-for="dict in toUnitList"
                  :key="dict.id"
                  :label="dict.name"
                  :value="dict.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="路由分类" prop="type">
              <el-select  v-model="form.type"  placeholder="路由分类"  @change="changeType"  @clear="cleartype"  size="small"  clearable  class="widthClass">
                <el-option
                  v-for="dict in typeOptions"
                  :key="dict.dictValue"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="来源部门" prop="fromunitid">
              <el-select  v-model="form.fromunitid"  placeholder="来源部门"  size="small" clearable class="widthClass">
                <el-option
                  v-for="dict in unitInfo"
                  :key="dict.id"
                  :label="dict.name"
                  :value="dict.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8" v-if="this.typeValue == 3 || this.typeValue == 4">
            <el-form-item label="路由到小组" prop="togroupid">
              <el-select  v-model="form.togroupid"  placeholder="路由到小组"  @change="changeGroup"  @clear="clearGroup" size="small"  clearable class="widthClass">
                <el-option
                  v-for="dict in fromgroupList"
                  :key="dict.id"
                  :label="dict.name"
                  :value="dict.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="路由描述" prop="profile">
              <el-input v-model="form.profile" placeholder="请输入路由描述" class="widthClass" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="来源状态" prop="fromstatus">
              <el-select v-model="form.fromstatus" placeholder="来源状态" size="small"  clearable class="widthClass">
                <el-option
                  v-for="dict in documentOptions"
                  :key="dict.dictValue"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8" v-if="this.typeValue == 4">
            <el-form-item label="路由到人员" prop="topersonid">
              <el-select  v-model="form.topersonid" placeholder="路由到人员" size="small"  clearable class="widthClass">
                <el-option
                  v-for="dict in frompersonList"
                  :key="dict.personid"
                  :label="dict.personname"
                  :value="dict.personid"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="路由状态" prop="status">
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
import { icaList, getmodList } from "@/api/system/ication";
import {
  getfromOrg,
  getunitList,
  getgroupList,
  getpersonList,
  addRouter,
  getrouterList,
  stopStatus,
  updataRouter,
  getRouter,
  delRouter,
} from "@/api/system/isrouter";
import { getOrgList} from "@/api/order/service/rec";
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
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      total: 0,
      open: false,
      typeValue: 0,
      // 状态数据字典
      statusOptions: [],
      icationList: [], //路由列表数据
      typeOptions: [], //路由分类下拉
      // 查询参数
      queryParams: {
        pageSize: 10,
        pageNum: 1,
        name: undefined,
        status: undefined,
        unitid: store.getters.roles.unit.id,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [ { required: true, message: "路由名称不能为空", trigger: "blur" } ],
        profile: [ { required: true, message: "路由描述不能为空", trigger: "blur" } ],
        type: [ { required: true, message: "路由分类不能为空", trigger: "blur" }],
        fromorgid: [ { required: true, message: "来源机构不能为空", trigger: "blur" }],
        fromstatus: [ { required: true, message: "来源状态不能为空", trigger: "blur" } ],
        icationid: [ { required: true, message: "产品不能为空", trigger: "blur" }],
      },
      icamodList: [],//产品名称下拉
      documentOptions: [],//来源状态
      todocumentOptions: [],//路由到状态 下拉
      toUnitList:[], //路由到部门下拉
      modList: [], //模块下拉
      fromorgList: [], //来源机构下拉
      unitInfo: [], //来源部门下拉
      // fromunitList: [],
      fromgroupList: [], //路由到小组下拉
      frompersonList: [], //路由到人员下拉
      toOrg:{} //机构信息
    };
  },
  created() {
    this.getList();
    //路由状态
    this.getDicts("sys_normal_disable").then((response) => {
      this.statusOptions = response.data;
    });
    //路由分类
    this.getDicts("sys_router_type").then((response) => {
      this.typeOptions = response.data;
    });
    this.getDicts("sys_document_status").then((response) => {
      this.documentOptions = response.data.filter(
        (item) => !item.dictLabel.includes("服务")
      );
      this.todocumentOptions = response.data.filter((item) =>
        item.dictLabel.includes("服务")
      );
    });
    //产品
    this.geticamodList();
    getOrgList().then((res) => {
      if(res){
        let orgname = store.getters.roles.orgaccount.orgname;
        if(orgname=="root"){
          orgname = "河南中联"
        }
        this.toOrg = res.data.find(item=>item.name==store.getters.roles.orgaccount.orgname);
        getunitList({ orgid: this.toOrg.id }).then((response) => {
          this.toUnitList = response.data;
        });
      }
    });    
  },
  methods: {
    /** 查询产品列表 */
    getList() {
      this.loading = true;
      this.icationList = []
      getrouterList(this.queryParams).then((response) => {
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
      this.handleQuery();
    },
    /** 新增按钮操作 */
    handleAdd(row) {
      this.reset();
      // this.geticamodList();
      // this.form.unitid = store.getters.roles.unit.id;
      // this.form.orgname = store.getters.roles.orgaccount.orgname;
      // this.form.orgid = store.getters.roles.orgaccount.orgid;
      // this.form.toorgname = store.getters.roles.orgaccount.orgname;
      this.fromorgList=[];
      this.form.toorgname = this.toOrg.name;
      this.open = true;
      this.title = "添加路由";
    },    
    /** 修改按钮操作 */
    async handleUpdate(row) {
      this.reset();
      // await this.geticamodList();
      // if (row.orgid != null) {
      //    getunitList({ orgid: row.orgid }).then((response) => {
      //     this.fromunitList = response.data;
      //   });
      // }
      if (row.icationid != null) {
         getmodList({ id: row.icationid }).then((response) => {
          this.modList = response.data;
        });
      }
      if (row.icationid != null) {
         getfromOrg({ icationid: row.icationid }).then((response) => {
          this.fromorgList = response.data;
        });
      }
      if (row.fromorgid != null ) {
         getunitList({ orgid: row.fromorgid }).then((response) => {
          this.unitInfo = response.data;
        });
      }
      if (row.tounitid != null && row.type=="小组路由") {
         getgroupList({ unitid: row.tounitid }).then((response) => {
          this.fromgroupList = response.data;
        });
      }
      // if (row.tounitid != null && row.type=="个人路由" ) {
      //    getpersonList({ unitid: row.tounitid, groupid: "" }).then(
      //     (response) => {
      //       this.frompersonList = response.data;
      //     }
      //   );
      // }
      await getRouter(row.id).then((response) => {
        this.form = response.data;
        if (this.form.type == "部门路由") {
          this.typeValue = 2;
        } else if (this.form.type == "小组路由") {
          this.typeValue = 3;
        } else if (this.form.type == "个人路由") {
          this.typeValue = 4;
        } else if(this.form.type == "机构路由"){
          this.typeValue = 1;
        }
        this.form.type = this.typeOptions.find(item=>item.dictLabel == this.form.type)["dictValue"];
        this.form.fromstatus = this.documentOptions.find(item=>item.dictLabel == this.form.fromstatus)["dictValue"];
        if(row.tostatus!=null&&row.tostatus!=""){
          this.form.tostatus = this.todocumentOptions.find(item=>item.dictLabel == this.form.tostatus)["dictValue"];
        }
        this.form.toorgname = this.toOrg.name;
        this.form.toorgid = this.toOrg.id;
      });

      this.open = true;
      this.title = "修改路由";
    }, 
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$confirm('是否确认删除名称为"' + row.name + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return delRouter(row.id);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        })
        .catch(() => {});
    },  
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id != undefined) {
            updataRouter(this.form).then((response) => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addRouter(this.form).then((response) => {
              if(response.data==-2){
                this.msgError("路由名称重复，请重新填写");
                return;
              }
              this.msgSuccess("新增成功");
              this.open = false;
              this.getList();

            });
          }
        }
      });
    },         
    // 取消按钮
    cancel() {
      this.open = false;
      this.typeValue = "";
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        orgid: store.getters.roles.orgaccount.orgid,
        orgname: store.getters.roles.orgaccount.orgname,
        unitid: store.getters.roles.unit.id,
        unitname: store.getters.roles.unit.name,
        toorgname: this.toOrg.name,
        toorgid: this.toOrg.id,
        togroupid: undefined,
        tounitid: undefined,
        topersonid: undefined,
        fromunitid: undefined,
        fromperson: undefined,
        fromstatus: undefined,
        fromorgid: undefined,
        name: undefined,
        type: undefined,
        profile: undefined,
        moduleid: undefined,
        icationid: undefined,
        tostatus: undefined,
        status: "0",
      };
      this.resetForm("form");
    },
    //产品名称
    geticamodList() {
      icaList().then((response) => {
        this.icamodList = response.data;
      });
    },
    // 字典状态字典翻译
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status);
    },
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
    
    //选择机构获取部门
    changeUnit(value) {
      this.unitInfo = [];
      this.form.fromunitid = "";
      if (value != "") {
        getunitList({ orgid: value }).then((response) => {
          this.unitInfo = response.data;
        });
      }
    },
    //产品名称change事件
    changemod(value) {
      this.modList = [];
      this.fromorgList = [];
      this.unitInfo = [];
      this.form.moduleid = "";
      this.form.fromorgid = "";
      this.form.fromunitid = "";
      if (value != "") {
        getmodList({ id: value }).then((response) => {
          this.modList = response.data;
        });
        getfromOrg({ icationid: value }).then((response) => {
          this.fromorgList = response.data;
        });
      }
    },
    //路由到部门change事件
    changetounit(value) {
      this.fromgroupList = [];
      this.frompersonList = [];
      this.form.togroupid = "";
      this.form.topersonid = "";
      if (value != "") {
        getgroupList({ unitid: value }).then((response) => {
          this.fromgroupList = response.data;
        });
        // getpersonList({ unitid: value, groupid: "" }).then((response) => {
        //   this.frompersonList = response.data;
        // });
      }
    },
    //路由到小组change事件
    changeGroup(value) {
      this.frompersonList = [];
      this.form.topersonid = "";
      // if (value != "") {
      //   getpersonList({ unitid: "", groupid: value }).then((response) => {
      //     this.frompersonList = response.data;
      //   });
      // }
    },
    //路由分类change事件
    changeType(value) {
      this.typeValue = value;
      if (value > 1) {
        // this.fromunitList = [];
        // this.fromgroupList = [];
        // this.frompersonList = [];
        this.form.tounitid = "";
        this.form.togroupid = "";
        this.form.topersonid = "";
        // getunitList({ orgid: store.getters.roles.orgaccount.orgid }).then(
        //   (response) => {
        //     this.fromunitList = response.data;
        //   }
        // );
      }
    },
    //产品名称clear事件
    clearmod() {
      this.modList = [];
      this.fromorgList = [];
      this.unitInfo = [];
      this.form.moduleid = "";
      this.form.fromorgid = "";
      this.form.fromunitid = "";
    },
    //来源机构clear事件
    clearUnit() {
      this.unitInfo = [];
      this.form.fromunitid = "";
    },
    //路由分类clear事件
    cleartype() {
      // this.fromunitList = [];
      this.fromgroupList = [];
      this.frompersonList = [];
      this.form.tounitid = "";
      this.form.togroupid = "";
      this.form.topersonid = "";
    },
    //路由到小组clear事件
    clearGroup() {
      this.frompersonList = [];
      this.form.togroupid = "";
      this.form.topersonid = "";
      // getpersonList({ unitid: this.form.tounitid, groupid: "" }).then(
      //   (response) => {
      //     this.frompersonList = response.data;
      //   }
      // );
    },
    //路由到部门clear事件
    clearTounit() {
      this.fromgroupList = [];
      this.frompersonList = [];
      this.form.togroupid = "";
      this.form.topersonid = "";
    },  
  },
};
</script>
<style scoped>
.router-open {
  display: flex;
  justify-content: space-between;
}
.widthClass{
  width:240px !important;
}
</style>
