<template>
  <div class="app-container">
    <el-form  :model="queryParams"  ref="queryForm"  :inline="true"  v-show="showSearch">
      <el-form-item label="机构名称" prop="orgid">
        <el-select v-model="queryParams.orgid" placeholder="请选择机构" :remote-method="remoteOrg"  filterable  remote  clearable  >
          <el-option
            v-for="dict in orgOptions"
            :key="dict.orgid"
            :label="dict.orgname"
            :value="dict.orgid"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button  type="primary" size="mini"  icon="el-icon-search"  @click="handleQuery">
          搜索
        </el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button  type="primary" size="mini" icon="el-icon-plus" @click="handleAdd" v-hasPermi="['system:empower:add']"  plain >
          授权
        </el-button>
      </el-col>
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table :data="authorizeInfo" v-loading="loading" :row-class-name="tableRowClassName"  
      element-loading-text="拼命加载中"  default-expand-all  :tree-props="{ children: 'children', hasChildren: 'hasChildren' }" >
      <el-table-column  prop="toorgname"    label="机构名称"  align="center"  min-width="20%"  ></el-table-column>
      <el-table-column  prop="productname"  label="产品名称"  align="center"  min-width="20%"  ></el-table-column>
      <el-table-column  prop="status"       label="状态"      align="center"  min-width="15%"  :formatter="statusFormat"  ></el-table-column>
      <el-table-column  prop="authorizetime"  label="授权时间"  align="center"  min-width="15%"  >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.authorizetime, "{y}-{m}-{d}") }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column  prop="stoptime"  label="停用时间"  align="center"  min-width="15%"  >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.stoptime) }}</span>
        </template>
      </el-table-column> -->
      <el-table-column  label="操作"  align="center" min-width="15%"  class-name="small-padding fixed-width"  >
        <template slot-scope="scope" v-if="scope.row.stoptime == null">
          <el-button  size="mini"  type="text"  icon="el-icon-circle-close"  @click="handlestop(scope.row)"  v-hasPermi="['system:empower:add']"  >
            停用
          </el-button>
          <el-button  size="mini"  type="text"  icon="el-icon-loading"  @click="handleEmpower(scope.row)"  v-hasPermi="['system:empower:edit']"  >
            授权
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

    <!-- 授权对话框 -->
    <el-dialog :title="title"  :visible.sync="open"  width="500px"  :close-on-click-modal="false"  append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col v-if="timeShow">
            <el-form-item label="机构名称" prop="toorgid">
              <el-select  v-model="form.toorgid"  placeholder="机构名称"  size="small"  clearable  filterable  class="widthClass">
                <el-option
                  v-for="dict in orghosList"
                  :key="dict.orgid"
                  :label="dict.orgname"
                  :value="dict.orgid"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col v-if="timeShow">
            <el-form-item label="产品名称" prop="icationid">
              <el-select  v-model="form.icationid"  placeholder="产品名称" size="small"  clearable  filterable  class="widthClass">
                <el-option
                  v-for="dict in icalist"
                  :key="dict.id"
                  :label="dict.name"
                  :value="dict.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col>
            <el-form-item label="授权时间" prop="authorizetime">
              <el-date-picker  v-model="form.authorizetime" placeholder="选择日期"  type="date"  class="widthClass">
              </el-date-picker>
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
  orghospitalList,
  authOrize,
  icaList,
  authorizeList,
  stopStatus,
  authUpdate,
} from "@/api/system/empower";
import { orgHospitallist } from "@/api/order/service/rec";
import { parseTime } from "@/utils/zlsoft";
import store from "@/store";
export default {
  name: "empower",
  components: {},
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      total: 0,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orgname: undefined,
        toorgid: undefined,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        toorgid: [{ required: true, message: "机构名称不能为空", trigger: "blur" }],
        icationid: [{ required: true, message: "产品名称不能为空", trigger: "blur" }],
        authorize: [{ required: true, message: "授权日期不能为空", trigger: "blur" }],
      },
      orghosList: [],
      icalist: [],
      authorizeInfo: [],
      statusOptions: [],
      timeShow: true,
      orgOptions: [],
      options: [],
    };
  },
  created() {
    this.getDicts("sys_normal_disable").then((response) => {
      this.statusOptions = response.data;
    });
    this.getList();
    orgHospitallist().then((res) => {
      this.options = res.data;
    });
    icaList().then((response) => {
      this.icalist = response.data;
    });    
    // this.loading = false;
  },
  methods: {
    /** 查询部门列表 */
    getList() {
      this.loading = true;
      this.authorizeInfo = [];
      authorizeList(this.queryParams).then((response) => {
        this.authorizeInfo = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    }, 
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.toorgid=this.queryParams.orgid
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
      orghospitalList().then((response) => {
        this.orghosList = response.data;
      });
      this.timeShow = true;
      this.open = true;
      this.title = "授权";
    },  
    //授权修改
    handleEmpower(row) {
      this.form.toorgname = row.toorgname;
      this.form.toorgid = row.toorgid;
      this.form.icationid = row.icationid;
      this.form.orgid = row.orgid;
      this.form.orgname = row.orgname;
      this.form.id = row.id;
      this.timeShow = false;
      this.open = true;
      this.title = "授权";
    },
    /** 停用按钮操作 */
    handlestop(row) {
      this.$confirm(
        '是否确认停用名称为"' + row.toorgname + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return stopStatus({ id: row.id });
        })
        .then(() => {
          this.msgSuccess("停用成功");
          this.getList();
        })
        .catch(() => {});
    }, 
    /** 提交按钮 */
    submitForm: function () {
      this.form.authorizetime = parseTime( this.form.authorizetime, "{y}-{m}-{d} {h}:{i}:{s}");

      this.$refs["form"].validate((valid) => {
        if (valid) {
          console.log(this.form.id);
          if (this.form.id != undefined) {
            authUpdate(this.form).then((response) => {
              this.msgSuccess("授权成功");
              this.open = false;
              this.getList();
            }).catch(() => {});
          } else {
            authOrize(this.form).then((response) => {
              if(response.data==-2){
                this.msgError("存在授权信息");
                return;
              }
              this.msgSuccess("授权成功");
              this.open = false;
              this.getList();
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
      this.form = {
        icationid: undefined,
        toorgid: undefined,
        authorizetime: undefined,
        orgname: store.getters.roles.orgaccount.orgname,
      };
      this.resetForm("form");
    },
    remoteOrg(query) {
      if (query !== "") {
        // 使用setTimeout模拟异步请求
        setTimeout(() => {
          this.orgOptions = this.options.filter((item) => {
            // 检查拼音是否包含查询的字符串
            return (
              item.pinyin.toLowerCase().includes(query.toLowerCase()) ||
              item.orgname.toLowerCase().includes(query.toLowerCase())
            );
          });
        }, 100);
      } else {
        this.orgOptions = [];
      }
    },
    // 字典状态字典翻译
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status);
    },
    // handleSq(row) {
    //   console.log(row);
    // },
    tableRowClassName({ row }) {
      if (row.status == "1") {
        return "warning-row";
      }
      return "";
    },
  },
};
</script>
<style>
.el-table .warning-row {
  background: #ffece6;
}

.widthClass {
  width:320px !important;
}
</style>
