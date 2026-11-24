<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--部门数据-->
      <el-col :span="4" :xs="24">
        <div class="head-container"> 
          <el-input  v-model="deptName"  placeholder="请输入机构名称" size="small" prefix-icon="el-icon-search" style="margin-bottom: 20px" clearable />
        </div>
        <div class="head-container">
          <el-tree
            class="dept-tree"
            :data="treOptions"
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
        <el-form :model="queryParams" ref="queryForm" v-show="showSearch" :inline="true" >
          <el-form-item label="机构名称" prop="name">
            <el-input  v-model="queryParams.name" placeholder="请输入机构名称" size="small"  @keyup.enter.native="handleQuery"  clearable />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status"  placeholder="机构状态"  size="small" clearable >
              <el-option
                v-for="dict in statusOptions"
                :key="dict.dictValue"
                :label="dict.dictLabel"
                :value="dict.dictValue"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button  type="primary"  icon="el-icon-search" size="mini"  @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary"  icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['system:dept:add']"  plain  >
              新增
            </el-button>
          </el-col>
          <right-toolbar
            :showSearch.sync="showSearch"
            @queryTable="getList"
          ></right-toolbar>
        </el-row>

        <el-table :data="deptList"  row-key="id"  v-loading="loading"  element-loading-text="拼命加载中"  default-expand-all  :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
          <el-table-column label="机构名称" prop="name"    align="center" min-width="20%" fixed></el-table-column>
          <el-table-column label="状态"     prop="status"  align="center" min-width="10%" :formatter="statusFormat"></el-table-column>
          <el-table-column label="授权时间" prop="deleteAt" align="center"  min-width="16%" >
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.deleteAt,"{y}-{m}-{d}") }}</span>
            </template>
          </el-table-column>
          <el-table-column label="修改人"   prop="updateBy" align="center" min-width="12%" ></el-table-column>
          <el-table-column label="修改时间" prop="updateAt" align="center"  min-width="16%">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.updateAt) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="创建人"   prop="createBy" align="center"  min-width="15%"></el-table-column>
          <el-table-column label="创建时间" prop="createAt" align="center"  min-width="18%">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.createAt) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" fixed="right" min-width="20%" class-name="small-padding fixed-width">
            <template slot-scope="scope" v-if="scope.row.type != '0'">
              <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"  v-hasPermi="['system:dept:edit']">
                修改
              </el-button>
              <el-button size="mini" type="text" icon="el-icon-edit" @click="handlebfUpdate(scope.row)" v-hasPermi="['system:dept:part']">
                维护
              </el-button>
              <el-button size="mini" type="text" icon="el-icon-loading" @click="handleEmpower(scope.row)" v-hasPermi="['system:dept:empower']">
                授权
              </el-button>
              <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['system:dept:delete']">
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
    <!-- 维护窗口对话框 -->
    <el-dialog :title="title" :visible.sync="bfopen" width="600px" :close-on-click-modal="false" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col v-if="form.name !== 0">
            <el-form-item label="机构名称" prop="name" @input="generateInitials">
              <el-input v-model="form.name" placeholder="请输入机构名称" disabled />
            </el-form-item>
          </el-col>
          <el-col v-if="form.name !== 0">
            <el-form-item label="拼音码" prop="pinyin">
              <el-input v-model="form.pinyin"  placeholder="请输入拼音码" disabled />
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="机构类型" prop="type">
              <el-select  v-model="form.type"  placeholder="请选择机构类型"  @change="depttypeasd" size="small" clearable  disabled>
                <el-option
                  v-for="rce in orgtypeOptions"
                  :key="rce.dictValue"
                  :label="rce.dictLabel"
                  :value="rce.dictValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="上级机构" prop="porgname">
              <el-input v-model="form.porgname" placeholder="请输入机构名称"  disabled />
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="机构地区" prop="city">
              <el-input v-model="form.city"    placeholder="请输入机构地区 例：某省某市某区"/>
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="负责人" prop="contact">
              <el-input v-model="form.contact" placeholder="请输入负责人"  maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="联系电话" prop="tel">
              <el-input v-model="form.tel"     placeholder="请输入联系电话" maxlength="11" />
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="详细地址" prop="address">
              <el-input v-model="form.address" placeholder="请输入详细地址"  maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="机构状态">
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
    <!-- 添加或修改部门对话框 -->
    <el-dialog  :title="title"  :visible.sync="open"  width="600px"  :close-on-click-modal="false"  append-to-body  >
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col v-if="form.name !== 0">
            <el-form-item label="机构名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入机构名称"  @input="generateInitials"/>
            </el-form-item>
          </el-col>
          <el-col v-if="form.name !== 0">
            <el-form-item label="拼音码" prop="pinyin">
              <el-input  v-model="form.pinyin" placeholder="请输入拼音码"/>
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="机构类型" prop="type">
              <el-select v-model="form.type"  placeholder="请选择机构类型" @change="depttypeasd"  size="small"  clearable>
                <el-option
                  v-for="rce in orgtypeOptions"
                  :key="rce.dictValue"
                  :label="rce.dictLabel"
                  :value="rce.dictValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="上级机构" prop="porgid">
              <treeselect v-model="form.porgid" placeholder="请选择上级机构名称" 
                :options="menuOptions"
                :normalizer="normalizer"
                :default-expand-level="2"
                :show-count="true"   
              />
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="服务范围" prop="servescope">
              <el-select  v-model="form.servescope" placeholder="请选择服务范围" size="small" clearable >
                <el-option
                  v-for="rce in serveOptions"
                  :key="rce.dictValue"
                  :label="rce.dictLabel"
                  :value="rce.dictValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col v-show="sqshow">
            <el-form-item label="授权时间" prop="deleteAt">
              <el-date-picker v-model="form.deleteAt" placeholder="选择日期" type="date" >
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="机构地区" prop="city">
              <el-input v-model="form.city" placeholder="请输入机构地区 例：某省某市某区" />
            </el-form-item>
          </el-col>

          <el-col>
            <el-form-item label="负责人" prop="contact">
              <el-input v-model="form.contact"  placeholder="请输入负责人" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="联系电话" prop="tel">
              <el-input v-model="form.tel" placeholder="请输入联系电话" maxlength="11" />
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="详细地址" prop="address">
              <el-input  v-model="form.address" placeholder="请输入详细地址"  maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="机构状态">
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

    <el-dialog :title="title" :visible.sync="sqopen"  width="600px" :close-on-click-modal="false" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col v-if="form.name !== 0">
            <el-form-item label="机构名称" prop="name">
              <el-input  v-model="form.name"  placeholder="请输入机构名称"  disabled />
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="机构类型" prop="type">
              <el-select  v-model="form.type"  placeholder="请选择机构类型"  @change="depttypeasd"  size="small"  clearable  disabled >
                <el-option
                  v-for="rce in orgtypeOptions"
                  :key="rce.dictValued"
                  :label="rce.dictLabel"
                  :value="rce.dictValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="授权日期" prop="deleteAt">
              <el-date-picker  v-model="form.deleteAt"  placeholder="选择日期"  type="date" >
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="sqsubmitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
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
  treeselect,
  empOwer,
} from "@/api/system/dept";
// import area from "@/utils/area.json";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import { parseTime,generateFirstLetter } from "@/utils/zlsoft";
import store from "@/store";

export default {
  name: "Unit",
  components: { Treeselect },
  data() {
    return {
      total: 0,
      // 遮罩层
      loading: true,
      showSearch: true,// 列表右上角显示搜索条件
      bfopen: false, //维护窗口对话框
      deptTypeoptions: [],//部门类型
      // 表格树数据
      deptList: [],
      sqshow: false,//授权时间
      // 部门树选项
      deptOptions: [],
      orgtypeOptions: [],
      menuOptions: [],
      menuOptionsAssign: [],
      treOptions: [],//机构部门tree数据
      // 弹出层标题
      title: "",
      
      open: false,//机构信息对话框
      sqopen: false,//授权对话框
      
      statusOptions: [],//机构状态数据字典
      // relationOptions: [],
      serveOptions: [],//服务范围下拉
      deptName: undefined,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: undefined,
        status: undefined,
        id: undefined,
      },
      // 表单参数
      form: {},
      defaultProps: {
        children: "children",
        label: "label",
      },
      // 表单校验
      rules: {
        name: [ { required: true, message: "机构名称不能为空", trigger: "blur" }],
        type: [ { required: true, message: "机构类型不能为空", trigger: "blur" }],
        porgid: [{ required: true, message: "上级机构不能为空", trigger: "input" }],
        deleteAt: [{ required: true, message: "授权日期不能为空", trigger: "blur" }],
        tel: [{ required: true, message: "手机号码不能为空", trigger: "blur" },
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: "请输入正确的手机号码",
            trigger: "blur",
          },
        ],
      },
      // area: area,
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
    // this.getTreeselect();
    this.getDicts("sys_normal_disable").then((response) => {
      this.statusOptions = response.data;
    });
    // //部门类型
    // this.getDicts("sys_dept_type").then((response) => {
    //   this.deptTypeoptions = response.data;
    // });
    // 机构类型;
    this.getDicts("sys_jg_root").then((response) => {
      this.orgtypeOptions = response.data;
    });
    // 关系类型;
    // this.getDicts("sys_relation_type").then((response) => {
    //   this.relationOptions = response.data;
    // });
    // 服务范围;
    this.getDicts("sys_serve_scope").then((response) => {
      this.serveOptions = response.data;
    });
    this.getList();
  },
  methods: {
    /** 查询部门列表 */
    getList() {
      this.loading = true;
      this.deptList =[]
      listDept(this.queryParams).then((response) => {
        this.deptList = this.handleTree(response.rows, "id");
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.id = null;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },    
    /** 新增按钮操作 */
    async handleAdd(row) {
      this.reset();
      this.sqshow = true;
      await this.getTreeselect();
      this.open = true;
      this.title = "添加机构";
      // listDept().then((response) => {
      //   this.deptOptions = this.handleTree(response.rows, "id");
      // });
    },
    /** 修改按钮操作 */
    async handleUpdate(row) {
      this.reset();
      await this.getTreeselect();
      getDept(row.id).then((response) => {
        this.form = response.data;

        //处理 上级机构 加载
        this.menuOptions = [];
        this.menuOptions.push({
          id:this.menuOptionsAssign[0].children[0].id,
          label:this.menuOptionsAssign[0].children[0].label,
          children:[]
        })
        this.menuOptionsAssign[0].children[0].children.forEach(item=>{
          this.menuOptions[0].children.push({
              id:item.id,
              label:item.label,
              children:[]
          })
        })        

        this.open = true;
        this.title = "修改机构";
      });
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
        .then(function () {
          return delDept(row.id);
        })
        .then(() => {
          this.getList();
          this.getselect();
          this.msgSuccess("删除成功");
        })
        .catch(() => {});
    },    
    //授权
    handleEmpower(row) {
      // this.getTreeselect();
      this.reset();
      getDept(row.id).then((response) => {
        this.form = response.data;
        this.sqopen = true;
        this.title = "授权机构";
      });
      // listDeptExcludeChild(row.id).then((response) => {
      //   this.deptOptions = this.handleTree(response.data, "id");
      // });
    },
    //维护
    async handlebfUpdate(row) {
      this.reset();
      await this.getTreeselect();
      getDept(row.id).then((response) => {
        this.form = response.data;
        this.bfopen = true;
        this.title = "修改机构";
      });
      // listDeptExcludeChild(row.id).then((response) => {
      //   this.deptOptions = this.handleTree(response.data, "id");
      // });
    },  
    // 取消按钮
    cancel() {
      this.open = false;
      this.bfopen = false;
      this.sqshow = false;
      this.sqopen = false;
      this.reset();
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$nextTick(() => {
        console.log(this.form.porgid);
        // 先清除验证状态
        this.$refs["form"].clearValidate();

        this.$refs["form"].validate((valid) => {
          this.form.deleteAt = parseTime(this.form.deleteAt,"{y}-{m}-{d} {h}:{i}:{s}");
          this.form.porgid = this.form.porgid;
          if (valid) {
            if (this.form.id != undefined) {
              updateDept(this.form).then((response) => {
                this.msgSuccess("修改成功");
                this.open = false;
                this.bfopen = false
                this.getList();
                this.getselect();
              }).catch(() => {});
            } else {
              addDept(this.form).then((response) => {
                this.msgSuccess("新增成功");
                this.open = false;
                this.bfopen = false
                this.getList();
                this.getselect();
              }).catch(() => {});
            }
          }
        });
      })
    },
    //授权
    sqsubmitForm() {
      this.$refs["form"].validate((valid) => {
        this.form.deleteAt = parseTime( this.form.deleteAt,"{y}-{m}-{d} {h}:{i}:{s}");
        if (valid) {
          if (this.form.deleteAt != null) {
            empOwer(this.form).then((response) => {
              this.msgSuccess("授权成功");
              this.sqopen = false;
              this.getList();
            }).catch(() => {});
          } else {
            this.msgSuccess("请选择授权日期！");
          }
        }
      });
    },    
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        name: undefined,
        city: undefined,
        socialcode: undefined,
        type: undefined,
        contact: undefined,
        tel: undefined,
        address: undefined,
        status: "0",
        deleteAt: undefined,
        servescope: undefined,
        relationtype: undefined,
        pinyin:undefined,
        porgid:undefined,
      };
      this.resetForm("form");
    },      
    /** 查询部门下拉树结构 */
    getselect() {
      treeselect().then((response) => {
        this.treOptions = response.data;
      });
    },
    //获取机构类型的值
    depttypeasd(value) {
      this.menuOptions = [];
      this.form.porgid = undefined;
      console.log(this.menuOptions);
      console.log(this.form.porgid);      
      var Dept = this.orgtypeOptions.find((item) => {
        return item.dictValue === value;
      });
      this.form.deptType = Dept.dictValue;
      this.form.deptTypeValue = Dept.dictLabel;     
      //联动 上级机构
      if(store.getters.roles.organizationtype=="0"){
        if(Dept.dictLabel === "管理机构"){
          this.menuOptions = [{
            id: this.menuOptionsAssign[0].children[0].id,
            label:this.menuOptionsAssign[0].children[0].label,
            children:[]
          }]
          this.form.porgid = this.menuOptionsAssign[0].children[0].id;
        }else if(Dept.dictLabel === "服务商" || Dept.dictLabel === "医疗机构"){
          this.menuOptionsAssign[0].children[0].children.forEach(item=>{
            this.menuOptions.push({
              id:item.id,
              label:item.label,
              children:[]
            })
          })
        }
      }else if(store.getters.roles.organizationtype=="1"){
         if(Dept.dictLabel === "管理机构"){
            this.msgSuccess("请选择服务商或医疗机构");
            this.form.type = undefined;
            this.form.porgid = undefined;
            this.menuOptions=[];
        }else if(Dept.dictLabel === "服务商" || Dept.dictLabel === "医疗机构"){
          this.menuOptions= [];       
          this.menuOptions.push({
            id: this.menuOptionsAssign[0].children[0].id,
            label:this.menuOptionsAssign[0].children[0].label,
            children:[]
          })
          // this.form.porgid = this.menuOptionsAssign[0].children[0].id;
        }       
      }
    },
    // 筛选节点
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    // 节点单击事件
    handleNodeClick(data) {
      this.queryParams.id = data.id;
      this.queryParams.name = null;
      this.queryParams.status = null;
      this.getList();
    },
    /** 查询菜单下拉树结构 */
    getTreeselect() {
      treeselect().then((response) => {
        this.menuOptions = [];
        const menu = { id: 0, label: "部门类目", children: [] };
        menu.children = this.handleTree(response.data, "id");
        this.menuOptions.push(menu);
        //将menuOptions浅复制
        Object.assign(this.menuOptionsAssign,this.menuOptions); 
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
    //机构输入事件
    generateInitials(value){
      value = value.replace(/[^\u4e00-\u9fa5]/g, '');
      this.form.pinyin = generateFirstLetter(value);
    },
    // 字典状态字典翻译
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status);
    },    
    // handleChange(area) {
    //   // this.form.province = area[0];
    //   // this.form.city = area[1];
    //   // this.form.county = area[2];
    //   console.log(area);
    // },
    // // 用户状态修改
    // handleStatusChange(row) {
    //   let text = row.status === "0" ? "启用" : "停用";
    //   this.$confirm('确认要"' + text + '""' + row.name + '"机构吗?', "警告", {
    //     confirmButtonText: "确定",
    //     cancelButtonText: "取消",
    //     type: "warning",
    //   })
    //     .then(function () {
    //       let obj = {
    //         personid: row.pid,
    //         status: row.status,
    //         unitid: row.unitid,
    //       };
    //       return changeUserStatus(obj);
    //     })
    //     .then(() => {
    //       this.msgSuccess(text + "成功");
    //     })
    //     .catch(function () {
    //       row.status = row.status === "0" ? "1" : "0";
    //     });
    // },
  },
};
</script>
