<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm"  :inline="true" v-show="showSearch" >
      <el-form-item label="小组名称" prop="name">
        <el-input  v-model="queryParams.name"  placeholder="请输入小组名称"  size="small"  @keyup.enter.native="handleQuery"  clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary"  size="mini" icon="el-icon-search"   @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['system:group:add']" plain >
          新增
        </el-button>
      </el-col>
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table  v-loading="loading"  element-loading-text="拼命加载中"  :data="groupList"  row-key="id"  default-expand-all
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
      <el-table-column  prop="orgname"   label="机构名称"  align="center"  min-width="20%"  ></el-table-column>
      <el-table-column  prop="unitname"  label="部门名称"  align="center"  min-width="15%" ></el-table-column>
      <el-table-column  prop="name"      label="小组名称"  align="center"  min-width="16%"  ></el-table-column>
      <!-- <el-table-column  prop="grouppersonList[0].personname"  label="人员名称"  align="center"  min-width="14%"  ></el-table-column> -->
      <el-table-column  prop="status"    label="状态"      align="center"  min-width="10%"  :formatter="statusFormat" ></el-table-column>
      <el-table-column  prop="createBy"  label="创建人"    align="center"  min-width="13%" ></el-table-column>
      <el-table-column  prop="createAt"  label="创建时间"  align="center"  min-width="15%" >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column  label="操作"  align="center"  class-name="small-padding fixed-width"  min-width="18%" >
        <template slot-scope="scope" v-if="scope.row.persontype != 0">
          <el-button size="mini"  type="text" icon="el-icon-edit"  @click="handleUpdate(scope.row)" v-hasPermi="['system:group:edit']" >
            修改
          </el-button>
          <el-button size="mini"  type="text" icon="el-icon-tickets"  @click="handleGroupPersonQuery(scope.row)"  v-hasPermi="['system:group:edit']">
            查看成员
          </el-button>
          <!-- <el-button size="mini"  type="text" icon="el-icon-tickets"  @click="handleGroupPersonAdd(scope.row)"  v-hasPermi="['system:group:edit']">
            新增成员
          </el-button>           -->
          <el-button size="mini"  type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"  v-hasPermi="['system:group:delete']">
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
    <!-- 添加小组 -->
    <el-dialog :title="title" :visible.sync="openGroup" width="600px"  :close-on-click-modal="false" append-to-body >
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col>
            <el-form-item label="机构名称" prop="orgname">
              <!-- <el-input v-model="form.orgname"  placeholder="请输入机构名称"   /> -->
              <treeselect v-model="form.orgid"  placeholder="请选择机构名称" @input="orgChanged" :disabled="disabled"
                :options="menuOptions"
                :normalizer="normalizer"
                :default-expand-level="2"
                :show-count="true"   
              />              
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="部门名称" prop="unitid">
              <el-select  v-model="form.unitid"  placeholder="请选择部门" size="small"  clearable  @change="unitChanged" :disabled="disabled" >
                <el-option
                  v-for="dict in unitOptions"
                  :key="dict.id"
                  :label="dict.name"
                  :value="dict.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="小组名称" prop="name" >
              <el-input  v-model="form.name"     placeholder="请输入小组名称"   />
            </el-form-item>
          </el-col>         
          <el-col>
            <el-form-item label="小组简介" prop="profile">
              <el-input  v-model="form.profile"  placeholder="请输入小组简介" />
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="小组状态" >
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

    <!-- 添加小组成员 -->
    <el-dialog :title="title" :visible.sync="openGroupPerson" width="600px"  :close-on-click-modal="false" append-to-body >     
      <el-form ref="formPerson" :model="formPerson" :rules="rulesPerson" label-width="80px">      
        <el-row>
          <el-col>
            <el-form-item label="机构名称" prop="orgname">
              <!-- <el-input v-model="form.orgname"  placeholder="请输入机构名称"   /> -->
              <treeselect v-model="formPerson.orgid"   placeholder="请选择机构名称" @input="orgChanged" :disabled="disabled"
                :options="menuOptions"
                :normalizer="normalizer"
                :default-expand-level="2"
                :show-count="true"   
              />              
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="部门名称" prop="unitid">
              <el-select  v-model="formPerson.unitid"  placeholder="请选择部门"    @change="unitChanged" :disabled="disabled" size="small"  clearable  >
                <el-option
                  v-for="dict in unitOptions"
                  :key="dict.id"
                  :label="dict.name"
                  :value="dict.id"
                />
              </el-select>
              <!-- <el-input v-model="form.unitname" placeholder="请输入小组名称"  maxlength="50"   /> -->
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="小组名称" prop="groupid" >
              <el-select  v-model="formPerson.groupid"  placeholder="请选择小组" :disabled="disabled" size="small"  clearable >
                <el-option
                  v-for="dict in groupOptions"
                  :key="dict.id"
                  :label="dict.name"
                  :value="dict.id"
                />
              </el-select>              
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="小组人员" prop="personid">
              <el-select  v-model="formPerson.personid"  placeholder="小组人员"  size="small"  clearable multiple filterable :remote-method="remotePerson" remote>
                <el-option
                  v-for="dict in personOptions"
                  :key="dict.personid"
                  :label="dict.personname"
                  :value="dict.personid"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="人员类型" prop="persontype" >
              <el-select v-model="formPerson.persontype"  placeholder="人员类型"  size="small"  clearable>
                <el-option
                  v-for="dict in perTypeOptions"
                  :key="dict.dictValue"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                />
              </el-select>
            </el-form-item>
          </el-col>          
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancelGroupPerson">取 消</el-button>
      </div>
    </el-dialog>

    <!--查看成员-->
    <el-dialog :title="title" :visible.sync="ckopen"  width="30%"  :close-on-click-modal="false"  append-to-body >
      <el-form ref="form" label-width="150px">
        <el-row style="margin-top:-20px;">
          <el-col>
            <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleGroupPersonAdd" >
              新 增
            </el-button>
          </el-col>
        </el-row>           
        <el-row>
          <el-col>
            <el-table v-loading="loading" :data="groupmeList"  row-key="id"  border  default-expand-all >
              <!-- <el-table-column  prop="groupname"   label="小组名称"  align="center"  width="200" ></el-table-column> -->
              <el-table-column  prop="personname"  label="人员名称"  align="center"  min-width="15%" ></el-table-column>
              <el-table-column  prop="persontype"  label="人员类型"  align="center"  min-width="15%" ></el-table-column>
            </el-table>
            <pagination
              :total="personTotal"
              :page.sync="queryPersonParams.pageNum"
              :limit.sync="queryPersonParams.pageSize"
              @pagination="getGroupPersons"
            />
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
  addGroup,
  listGroup,
  getGroup,
  unitpersonList,
  updateGroup,
  delUnitGroup,
  getGroupPerson,
  getUnitGroup
} from "@/api/system/group";
import { getunitList } from "@/api/system/isrouter";
import {treeselect} from "@/api/system/dept";
import store from "@/store";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "group",
  components: {Treeselect},
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      //部门类型
      deptTypeoptions: [],
      // 表格树数据
      groupList: [],
      groupmeList: [],
      // 部门树选项
      deptOptions: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      openGroupPerson: false,
      // 小组弹窗
      openGroup:false,
      showOrNot:false, 
      ckopen: false,
      // 状态数据字典
      statusOptions: [],
      personOptions: [],
      //人员副本
      personOptionsCopy:[],
      //机构
      menuOptions:[],
      //部门
      unitOptions: [],
      //部门副本
      unitOptionsCopy: [],
      //小组
      groupOptions:[],  
      //人员类型
      perTypeOptions:[],
      disabled:false,  
      total: 0,
      //小组成员
      personTotal:0, 
      //查看小组成员的传参
      row:null,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: undefined,
        status: "0",
      },
      // 查询参数
      queryPersonParams: {
        pageNum: 1,
        pageSize: 10
      },      
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        unitid: [
          { required: true, message: "部门名称不能为空", trigger: "blur" },
        ],
        name: [
          { required: true, message: "小组名称不能为空", trigger: "blur" },
        ]     
      },
      // 表单参数
      formPerson: {},
      // 表单校验
      rulesPerson: {
        persontype:[
          { required: true, message: "人员类型不能为空", trigger: "blur" },
        ],
        personid:[
          { required: true, message: "人员不能为空", trigger: "blur" },
        ],       
      },      
      operType:null
    };
  },
  created() {
    this.getDicts("sys_normal_disable").then((response) => {
      this.statusOptions = response.data;
    });
    //人员类型
    this.getDicts("sys_group_person").then((response) => {
      this.perTypeOptions = response.data;
    });

    this.getList();
    this.getTreeselect();
    this.getUnitOptions();//所有部门
  },
  methods: {
    /** 查询部门列表 */
    getList() {
      this.loading = true;
      this.groupList = []
      listGroup(this.queryParams).then((response) => {
        this.groupList = this.handleTree(response.rows, "id");
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
    /** 新增小组按钮操作 */
    handleAdd() {
      this.reset();
      this.disabled = false;
      this.form.unitid = null;
      this.openGroup = true;
      this.operType = "add";
      this.title = "添加小组";
    },    
    /** 修改按钮操作 */
    async handleUpdate(row) {
      this.reset();
      
      this.disabled = true;
      this.title = "修改小组";
      this.operType = "update";

      await this.getOrgUnits(row);//所有部门
      await this.getUnitPersons(row);//部门下的所有人
      this.form.orgid = row.orgid;
      this.form.unitid = row.unitid;
      this.form.name = row.name;
      this.form.id = row.id;
      this.form.status = row.status;
      this.form.profile = row.profile;

      this.openGroup = true;

      // unitpersonList({ unitid: row.unitid }).then((response) => {
      //   this.personOptions = response.data;
      // });
      // getGroup(row.id).then((response) => {
      //   this.form = response.data;
      //   const personids = response.data.grouppersonList.map(
      //     (item) => item.personid
      //   );
      //   this.$set(this.form, "personid", personids);
      //   this.openGroupPerson = true;
      //   this.title = "修改小组";
      // });
      // listDeptExcludeChild(row.id).then((response) => {
      //   this.deptOptions = this.handleTree(response.data, "id");
      // });
    },  
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$confirm('是否确认删除名称为"' + row.name + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
      .then(() => {
        return delUnitGroup({ id: row.id }); // 确保返回 Promise
      })
      .then((response) => {
        if (response) {
          this.msgSuccess("删除成功"); // 此时 this 正确指向 Vue 实例
          this.getList();
        }
      })
      .catch(() => {});
    },         
    // 字典状态字典翻译
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status);
    },
    // 取消按钮
    cancel() {
      this.openGroup = false;
      this.ckopen = false;
      this.openUpdate = false;
      this.groupmeList = [];
      this.reset();
    },
    cancelGroupPerson(){
      this.openGroupPerson = false;
      this.$refs.formPerson.resetFields();
      this.$refs.form.resetFields();
    },
    // 表单重置
    reset() {
      this.form = {
        orgname: undefined,
        orgid: undefined,
        unitid: undefined,
        unitname: undefined,
        name: undefined,
        status: "0",
        profile:undefined,
      };
      this.resetForm("form");
    },
    // 表单重置
    resetFormPerson() {
      this.formPerson = {
        orgname: undefined,
        orgid: undefined,
        unitid: undefined,
        unitname: undefined,
        name: undefined,
        groupid:undefined,
        status: "0",
        personid:undefined,
        persontype:undefined,
      };
      this.resetForm("formPerson");
    },    
    //获取部门类型的值
    depttypeasd(value) {
      var Dept = this.deptTypeoptions.find((item) => {
        return item.dictValue === value;
      });
      this.form.deptType = Dept.dictValue;
      this.form.deptTypeValue = Dept.dictLabel;

      // this.deptPhone=user.phone
    },
    // 查看成员
    handleGroupPersonQuery(row) {
      this.row = null;
      this.row = row;
      getGroupPerson({id:row.id,params:{pageNum:this.queryPersonParams.pageNum,pageSize:this.queryPersonParams.pageSize}}).then((response) => {
        if(response){
          this.groupmeList = response.rows;
          this.personTotal = response.total;
        }
      });
      this.ckopen = true;
      this.title = "小组成员";
    },
    getGroupPersons(){
      getGroupPerson({id:this.row.id,params:{pageNum:this.queryPersonParams.pageNum,pageSize:this.queryPersonParams.pageSize}}).then((response) => {
        if(response){
          this.groupmeList = response.rows;
          this.personTotal = response.total;
        }
      });
    },
    //新增成员
    async handleGroupPersonAdd(row){
      this.resetFormPerson();
      row = this.row;
      this.title = "新增组成员";
      this.disabled = true;
      this.operType = "add";

      await this.getOrgUnits(row);//所有部门
      await this.unitChanged(row.unitid);//部门下的所有组
      await this.getUnitPersons(row);//部门下的所有人
      this.formPerson.orgid = row.orgid;
      this.formPerson.unitid = row.unitid;
      this.formPerson.groupid =  row.id;
      this.formPerson.id = row.id;
      this.formPerson.personid = null;
      this.formPerson.persontype = null;
      this.openGroupPerson = true;
    },
    /** 提交按钮 */
    submitForm: function () {
      if(this.title=="新增组成员") {
        let obj = this.formPerson.personid;
        let arr = [];
        for (let key in obj) {
          arr.push({
            personid: obj[key],
            persontype:this.formPerson.persontype
          });
        }
        this.formPerson.grouppersonList = arr;
        this.$refs["formPerson"].validate((valid) => {
            if (valid) {
                addGroup(this.formPerson).then((response) => {
                  if(response){
                    this.msgSuccess("新增成功");
                    this.resetFormPerson();
                    delete this.formPerson.grouppersonList;
                    this.openGroupPerson = false;
                        getGroupPerson({id:this.row.id,params:{pageNum:this.queryPersonParams.pageNum,pageSize:this.queryPersonParams.pageSize}}).then((response) => {
                          if(response){
                            this.groupmeList = response.rows;
                            this.personTotal = response.total;
                          }
                        });
                  }
                }).catch(() => {});
            }
        })
        
      }else{
          this.$refs["form"].validate((valid) => {
            if (valid) {
              if (this.operType == "update") {
                updateGroup(this.form).then((response) => {
                  if(response){
                    this.msgSuccess("修改成功");
                    this.openGroup = false;
                    this.getList();
                  }
                }).catch(() => {});
              } else {
                addGroup(this.form).then((response) => {
                  if(response){
                    this.msgSuccess("新增成功");
                    this.openGroup = false;
                    this.getList();
                  }
                }).catch(() => {});
              }
            }
          });
      }
    },
    /** 查询机构树结构 */
    getTreeselect() {
      treeselect().then((response) => {
        this.menuOptions = [];
        const menu = { id: 0, label: "机构类目", children: [] };
        menu.children = this.handleTree(response.data, "id");
        this.menuOptions.push(menu);

      });
    },
    /** 转换数据结构 */
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
    //机构改变，部门跟随机构变化
    orgChanged(val){
      this.unitOptions=[];
      // this.unitOptions = this.unitOptionsCopy.find(item=>item.orgid == val);
      this.unitOptionsCopy.forEach(item=>{
        if(item.orgid == val){
          this.unitOptions.push({
            id:item.id,
            name:item.name
          })
        }
      })
    },
    //获取所有部门
    getUnitOptions(){
      getunitList({orgid:""}).then((response) => {
        this.unitOptionsCopy = this.handleTree(response.data, "id");
      });
    },
    //部门变化，小组跟随部门变化
    unitChanged(val){
      getUnitGroup({unitid:val}).then((response)=>{
        if(response){
          this.groupOptions = response.data;
        }
      })
    },
    //获取所有组
    getUnitGroups(){
      getUnitGroup({unitid:null}).then((response)=>{
        if(response){
          this.groupOptions = response.data;
        }
      })
    },
    //获取部门下的所有人
    getUnitPersons(row){
      unitpersonList({ unitid: row.unitid }).then((response) => {
        if(response){
          this.personOptions = response.data;
          this.personOptionsCopy = [];
          this.personOptions.forEach(item=>{
            this.personOptionsCopy.push({
              pinyin:item.pinyin,
              personname:item.personname,
              personid:item.personid
            })
          }) 
        }        
      });
    },
    //获取机构下的部门
    getOrgUnits(row){
      getunitList({orgid:row.orgid}).then((response) => {
        if(response){
          this.unitOptions=[];
          response.data.forEach(item=>{
            this.unitOptions.push({
              id:item.id,
              name:item.name             
            })
          })
        }
      });
    },
    remotePerson(query) {
      if (query !== "") {
        setTimeout(() => {
          this.personOptions = this.personOptionsCopy.filter((item) => {
            return (
              item.pinyin.toLowerCase().includes(query.toLowerCase()) ||
              item.personname.toLowerCase().includes(query.toLowerCase())
            );
          });
        }, 100);
      }
    },
  },
};
</script>
