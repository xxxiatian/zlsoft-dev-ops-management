<template>
  <div class="app-container">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="项目列表" name="project">
    <div class="contain-top">
      <!--筛选条件-->
      <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px">
        <el-form-item label="项目名称" prop="projectName">
          <el-input v-model="queryParams.projectName" placeholder="请输入项目名称" clearable size="small" class="widthClass"
            @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item label="项目类型" prop="projectType">
          <el-select v-model="queryParams.projectType" filterable clearable placeholder="请选择项目类型" class="widthClass">
            <el-option v-for="dict in projectTypeOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="用户名称" prop="orgName">
          <el-input v-model="queryParams.orgName" placeholder="请输入用户名称" clearable size="small" class="widthClass" />
        </el-form-item>
        <el-form-item label="合同名称" prop="contractName">
          <el-input v-model="queryParams.contractName" placeholder="请输入对应合同名称" clearable size="small" class="widthClass" />
        </el-form-item>
        <el-form-item label="验收状态" prop="acceptStatus">
          <el-select v-model="queryParams.acceptStatus" clearable placeholder="请选择验收状态" class="widthClass">
            <el-option v-for="dict in acceptStatusOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      <!--操作按钮-->
      <div style="margin-top:10px;">
        <el-row :gutter="10">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['devops:devproject:add']">
              项目登记
            </el-button>
          </el-col>
          <!-- <el-col :span="1.5">
            <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate()"
              v-hasPermi="['devops:devproject:edit']">
              修改
            </el-button>
          </el-col> -->
          <el-col :span="1.5">
            <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete"
              v-hasPermi="['devops:devproject:remove']">
              删除
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="el-icon-download" size="mini" :loading="exportLoading" @click="handleExport"
              v-hasPermi="['devops:devproject:export']">
              导出
            </el-button>
          </el-col>
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </div>
    </div>
    <div class="contain-cont" style="margin-top:10px;">
      <el-table v-loading="loading" element-loading-text="拼命加载中" :data="projectList"
        @selection-change="handleSelectionChange" border>
        <el-table-column type="selection" width="50px" align="center" />
        <el-table-column :show-overflow-tooltip="true" label="项目名称" min-width="180px" align="center" prop="projectName" fixed />
        <el-table-column label="项目类型" width="130px" align="center" prop="projectType" />
        <el-table-column :show-overflow-tooltip="true" label="用户名称" min-width="150px" align="center" prop="orgName" />
        <el-table-column :show-overflow-tooltip="true" label="对应合同名称" min-width="180px" align="center" prop="contractName" />
        <el-table-column label="工作量" width="90px" align="center" prop="workload" />
        <el-table-column label="要求完成时间" width="160px" align="center" prop="requireDate" sortable>
          <template #default="{ row }">
            {{ parseTime(row.requireDate, '{y}-{m}-{d}') }}
          </template>
        </el-table-column>
        <el-table-column label="实际完成时间" width="150px" align="center" prop="finishDate" sortable>
          <template #default="{ row }">
            {{ parseTime(row.finishDate, '{y}-{m}-{d}') }}
          </template>
        </el-table-column>
        <el-table-column label="负责人" width="100px" align="center" prop="linkPerson" />
        <el-table-column :show-overflow-tooltip="true" label="实施人员" min-width="120px" align="center" prop="doPerson" />
        <el-table-column label="验收状态" width="120px" align="center" prop="acceptStatus">
          <template #default="{ row }">
            <el-tag :type="acceptTagType(row.acceptStatus)" size="mini">{{ acceptStatusFormat(row.acceptStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="验收时间" width="150px" align="center" prop="acceptDate" sortable>
          <template #default="{ row }">
            {{ parseTime(row.acceptDate, '{y}-{m}-{d}') }}
          </template>
        </el-table-column>
        <el-table-column label="登记人" width="100px" align="center" prop="createBy" />
        <el-table-column label="登记时间" width="160px" align="center" prop="createAt" sortable />
        <el-table-column label="操作" align="center" width="200px" class-name="small-padding fixed-width" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
              v-if="scope.row.acceptStatus != 1" v-hasPermi="['devops:devproject:edit']">修改</el-button>
            <el-button size="mini" type="text" icon="el-icon-tickets" @click="handDetails(scope.row)"
              v-hasPermi="['devops:devproject:query']">详情</el-button>
            <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
              v-hasPermi="['devops:devproject:remove']">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页-->
      <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
        @pagination="getList" />

      <!-- 添加或修改【开发项目】对话框 -->
      <el-dialog :title="title" :visible.sync="open" width="55%" append-to-body :close-on-click-modal="false">
        <el-form ref="form" :model="form" :rules="rules" label-width="100px" style="margin-left:3%;" :disabled="!isButton">
          <el-row>
            <el-col :span="12">
              <el-form-item label="项目名称" prop="projectName">
                <el-input style="width: 78%" v-model="form.projectName" placeholder="请输入项目名称" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="项目类型" prop="projectType">
                <el-select v-model="form.projectType" filterable placeholder="请选择项目类型" style="width: 78%">
                  <el-option v-for="dict in projectTypeOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="用户名称" prop="orgName">
                <el-select v-model="form.orgName" placeholder="选择医院或直接录入三方公司" :remote-method="remoteOrg" style="width: 78%"
                  filterable remote allow-create clearable>
                  <el-option v-for="dict in orgOptions" :key="dict.orgid" :label="dict.orgname" :value="dict.orgname"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="对应合同" prop="contractName">
                <el-select v-model="form.contractId" filterable clearable placeholder="请选择对应合同（可为空）" style="width: 78%"
                  :filter-method="filterContract">
                  <el-option v-for="item in contractOptions" :key="item.id" :label="item.contractName" :value="item.id">
                    <span style="float: left">{{ item.contractName }}</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">{{ item.orgName }}</span>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="工作量" prop="workload">
                <el-input style="width: 78%" v-model="form.workload" placeholder="请输入估算工作量，如：30人天" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="负责人" prop="linkPerson">
                <el-select v-model="linkPersonIds" multiple filterable clearable collapse-tags placeholder="请选择负责人（可多选）" style="width: 78%"
                  @change="handleLinkPersonChange">
                  <el-option v-for="item in personOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="实施人员" prop="doPerson">
                <el-select v-model="doPersonIds" multiple filterable clearable placeholder="请选择实施人员（可多选）"
                  style="width: 78%" @change="handleDoPersonChange">
                  <el-option v-for="item in personOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="要求完成时间" prop="requireDate" label-width="100px">
                <el-date-picker v-model="form.requireDate" type="datetime" placeholder="请选择要求完成时间" style="width: 78%">
                </el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="实际完成时间" prop="finishDate" label-width="100px">
                <el-date-picker v-model="form.finishDate" type="datetime" placeholder="请选择实际完成时间" style="width: 78%">
                </el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="验收状态" prop="acceptStatus">
                <el-select v-model="form.acceptStatus" placeholder="请选择验收状态" style="width: 78%">
                  <el-option v-for="dict in acceptStatusOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="验收时间" prop="acceptDate" label-width="100px">
                <el-date-picker v-model="form.acceptDate" type="datetime" placeholder="请选择验收时间" style="width: 78%">
                </el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="联系人信息" label-width="100px">
                <el-button v-if="isButton" size="mini" type="primary" icon="el-icon-plus" @click="addContactRow">添加联系人</el-button>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="22" style="margin-left: 3%;">
              <el-table :data="contactList" border>
                <el-table-column label="姓名" min-width="25%" align="center" prop="contactName">
                  <template slot-scope="scope">
                    <el-form-item>
                      <el-input v-model="scope.row.contactName" placeholder="请输入姓名" />
                    </el-form-item>
                  </template>
                </el-table-column>
                <el-table-column label="职务" min-width="25%" align="center" prop="contactPost">
                  <template slot-scope="scope">
                    <el-form-item>
                      <el-input v-model="scope.row.contactPost" placeholder="请输入职务" />
                    </el-form-item>
                  </template>
                </el-table-column>
                <el-table-column label="电话" min-width="30%" align="center" prop="contactTel">
                  <template slot-scope="scope">
                    <el-form-item>
                      <el-input v-model="scope.row.contactTel" placeholder="请输入电话" />
                    </el-form-item>
                  </template>
                </el-table-column>
                <el-table-column v-if="isButton" label="操作" min-width="20%" align="center" class-name="small-padding fixed-width">
                  <template slot-scope="scope">
                    <el-button size="mini" type="text" icon="el-icon-delete" @click="handleContactDel(scope.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-col>
          </el-row>
          <el-row>
            <el-col>
              <el-form-item label="完成情况" prop="projectStatus">
                <el-input v-model="form.projectStatus" placeholder="请输入项目完成情况（项目进度描述）" type="textarea" style="width:90%;"
                  :rows="3" autosize />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col>
              <el-form-item label="备注信息" prop="remark">
                <el-input v-model="form.remark" placeholder="请输入项目备注信息" type="textarea" style="width:90%;" :rows="2" autosize />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row v-if="!isButton">
            <el-col>
              <el-form-item label="附件">
                <!--项目附件（完成登记时上传的验收报告等文件），点击可预览下载-->
                <el-upload
                  class="file-upload"
                  style="width: 62%"
                  action="#"
                  :file-list="detailFileList"
                  :on-preview="onPreview"
                >
                </el-upload>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="submitForm" v-show="isButton">提 交</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </el-dialog>
    </div>
      </el-tab-pane>
      <!--合同列表页签：关联开发的合同在此展示，点击右侧"新增"基于该合同登记开发项目-->
      <el-tab-pane label="关联合同" name="contract">
        <div class="contain-top">
          <el-form :inline="true" label-width="68px">
            <el-form-item label="合同名称">
              <el-input v-model="contractFilter" placeholder="输入合同名称/对方单位过滤" clearable size="small" class="widthClass" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="el-icon-refresh" size="mini" @click="getContractList">刷新</el-button>
            </el-form-item>
          </el-form>
        </div>
        <div class="contain-cont" style="margin-top:10px;">
          <el-table v-loading="contractLoading" element-loading-text="拼命加载中" :data="filteredContracts"
            border>
            <el-table-column type="index" label="序号" width="60px" align="center" />
            <el-table-column :show-overflow-tooltip="true" label="合同名称" min-width="200px" align="center" prop="contractName" />
            <el-table-column :show-overflow-tooltip="true" label="对方单位" min-width="160px" align="center" prop="orgName" />
            <el-table-column label="签订日期" width="120px" align="center" prop="contractSignDate">
              <template #default="{ row }">
                {{ parseTime(row.contractSignDate, '{y}-{m}-{d}') }}
              </template>
            </el-table-column>
            <el-table-column label="合同金额" width="120px" align="center" prop="contractAmount" />
            <el-table-column label="操作" align="center" width="130px" fixed="right">
              <template slot-scope="scope">
                <el-button size="mini" type="text" icon="el-icon-plus" @click="handleAddContract(scope.row)"
                  v-hasPermi="['devops:devproject:add']">新增</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import {
  listDevproject,
  getDevproject,
  addDevproject,
  updateDevproject,
  delDevproject,
  delMDevproject,
  exportDevproject,
  devLinkContractList,
} from "@/api/develop/devproject";
import { orgHospitallist, personList } from "@/api/order/service/rec";
import { parseTime } from "@/utils/zlsoft";
import { resolveFileUrl } from "@/api/common/file";
import store from "@/store";

//对应合同下拉的固定特殊选项（排在所有合同之前）：选中时不关联真实合同，contractId 置空、contractName 存文本
const SPECIAL_CONTRACTS = [
  { id: "__none__", contractName: "无合同", orgName: "" },
  { id: "__unsigned__", contractName: "未签合同", orgName: "" },
];

export default {
  name: "Devproject",
  components: {},

  data() {
    return {
      // 当前页签：project-项目列表，contract-合同登记
      activeTab: "project",
      title: "", // 弹出层标题
      open: false, // 对话框
      total: 0, // 总数
      showSearch: true, // 显示搜索条件
      loading: true, // 遮罩层
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 选中行数据
      selectedRows: [],
      // 导出遮罩层
      exportLoading: false,
      // 项目表格数据
      projectList: [],
      // 项目类型字典
      projectTypeOptions: [],
      // 验收状态字典
      acceptStatusOptions: [],
      // 合同列表（登记项目时选择，合同登记页展示）
      contractOptions: [],
      // 合同全量列表（签订日期倒序备份，模糊筛选不丢数据）
      allContracts: [],
      // 合同登记页过滤关键字
      contractFilter: "",
      // 合同列表遮罩层
      contractLoading: false,
      // 医院机构选项
      orgOptions: [],
      options: [], // 原始机构数据
      // 本机构人员列表（负责人/实施人员选择）
      personlist: [],
      // 实施人员多选（人员id数组）
      doPersonIds: [],
      // 负责人多选（人员id数组）
      linkPersonIds: [],
      // 联系人列表（可多个）
      contactList: [],
      isButton: true, // 提交按钮是否显示
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        projectName: "",
        projectType: "",
        orgName: "",
        contractName: "",
        acceptStatus: "",
      },
      // 表单参数
      form: {},
      detailFileList: [], // 项目详情附件（只读展示）
      // 表单校验
      rules: {
        projectName: [{ required: true, message: "请填写项目名称", trigger: "blur" }],
        projectType: [{ required: true, message: "请选择项目类型", trigger: "change" }],
        orgName: [{ required: true, message: "请选择或录入用户名称", trigger: "change" }],
        acceptStatus: [{ required: true, message: "请选择验收状态", trigger: "change" }],
      },
    };
  },

  created() {
    this.getList();

    //项目类型
    this.getDicts("sys_dev_project_type").then((response) => {
      this.projectTypeOptions = response.data;
    });

    //验收状态
    this.getDicts("sys_dev_accept_status").then((response) => {
      this.acceptStatusOptions = response.data;
    });

    //合同列表（登记项目时选择，合同登记页展示）
    this.getContractList();

    //医院机构
    orgHospitallist().then((res) => {
      this.options = res.data;
    });

    //本机构人员列表（负责人/实施人员）
    personList({ unitid: store.getters.roles.unit.id }).then((res) => {
      this.personlist = res.data;
    });
  },

  computed: {
    //人员下拉选项：本机构人员列表 + 项目已存人员的兜底项
    //（查看/修改其他机构项目时，负责人/实施人员不在当前登录人的人员列表里，否则下拉会显示原始id）
    personOptions() {
      const list = this.personlist.map((item) => ({ id: item.id, name: item.name }));
      const known = new Set(list.map((item) => String(item.id)));
      const add = (idStr, nameStr) => {
        const ids = (idStr || "").split(",").filter((id) => id);
        const names = (nameStr || "").split(",");
        ids.forEach((id, idx) => {
          if (!known.has(String(id))) {
            known.add(String(id));
            list.push({ id: id, name: names[idx] || id });
          }
        });
      };
      add(this.form.linkPersonid, this.form.linkPerson);
      add(this.form.doPersonid, this.form.doPerson);
      return list;
    },
    //合同登记页按合同名称/对方单位过滤
    filteredContracts() {
      if (!this.contractFilter) {
        return this.allContracts;
      }
      const key = this.contractFilter.toLowerCase();
      return this.allContracts.filter((item) => {
        return (
          (item.contractName || "").toLowerCase().includes(key) ||
          (item.orgName || "").toLowerCase().includes(key)
        );
      });
    },
  },

  methods: {
    //************* 【4-合同登记】加载合同列表
    getContractList() {
      this.contractLoading = true;
      devLinkContractList().then((res) => {
        //按签订日期倒序，最新的合同排在最上面
        const list = (res.data || []).slice().sort((a, b) => {
          const ta = a.contractSignDate ? new Date(a.contractSignDate).getTime() : 0;
          const tb = b.contractSignDate ? new Date(b.contractSignDate).getTime() : 0;
          return tb - ta;
        });
        this.allContracts = list;
        //对应合同下拉最前面固定加"无合同/未签合同"两个特殊选项（选中时不关联真实合同）
        this.contractOptions = SPECIAL_CONTRACTS.concat(list);
        this.contractLoading = false;
      }).catch(() => {
        this.contractLoading = false;
      });
    },
    //*************【3-表单】对应合同模糊筛选（匹配合同名称/对方单位，不区分大小写；结果保持签订日期倒序）
    filterContract(query) {
      //筛选结果最前也保留"无合同/未签合同"特殊选项
      if (!query) {
        this.contractOptions = SPECIAL_CONTRACTS.concat(this.allContracts);
        return;
      }
      const key = query.toLowerCase();
      const filtered = this.allContracts.filter((item) => {
        return (
          (item.contractName || "").toLowerCase().includes(key) ||
          (item.orgName || "").toLowerCase().includes(key)
        );
      });
      this.contractOptions = SPECIAL_CONTRACTS.concat(filtered);
    },
    //************* 【4-合同登记】点击某条合同，基于该合同登记开发项目（预填合同）
    handleAddContract(row) {
      this.reset();
      this.contactList = [];
      this.isButton = true;
      this.title = "项目登记";
      this.form.contractId = row.id;
      this.form.contractName = row.contractName;
      this.open = true;
    },
    //************* 【1-筛选区】查询列表方法
    getList() {
      this.loading = true;
      listDevproject(this.queryParams).then((response) => {
        if (response) {
          this.projectList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      });
    },
    //************* 【1-筛选区】搜索按钮操作
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    //************* 【1-筛选区】重置按钮操作
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    //************* 【1-筛选区】多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      //勾选已验收项目时禁用工具栏"修改"按钮（已验收不允许修改）
      this.single = selection.length !== 1 || selection.some((item) => item.acceptStatus == 1);
      this.multiple = !selection.length;
      this.selectedRows = selection;
    },
    //************* 【1-筛选区】项目登记按钮操作
    handleAdd() {
      this.reset();
      this.contactList = [];
      this.isButton = true;
      this.title = "项目登记";
      this.open = true;
    },
    //=============【2-列表区】详情
    handDetails(row) {
      this.detailFileList = [];
      getDevproject(row.id).then((response) => {
        this.form = response.data;
        //验收状态字典的 dictValue 是字符串，回显需转字符串否则下拉显示原始数字
        this.form.acceptStatus = this.form.acceptStatus == null ? "" : String(this.form.acceptStatus);
        this.contactList = this.form.contactList == null ? [] : this.form.contactList;
        this.doPersonIds = this.form.doPersonid ? this.form.doPersonid.split(",") : [];
        this.linkPersonIds = this.form.linkPersonid ? this.form.linkPersonid.split(",") : [];
        this.ensureContractOption();
        //解析项目附件（url::name 逗号分隔，历史绝对地址剥离域名兼容处理，用当前文件服务地址拼接）
        if (this.form.enclosure != null && this.form.enclosure != "") {
          this.form.enclosure.split(",").forEach((item) => {
            const file = item.split("::");
            this.detailFileList.push({ url: resolveFileUrl(file[0]), name: file[1] });
          });
        }
        this.isButton = false;
        this.title = "项目详情";
        this.open = true;
      });
    },
    //=============【2-列表区】详情附件点击预览
    onPreview(file) {
      window.open(file.url, "_blank");
    },
    //*************【3-表单】对应合同下拉兜底：项目关联的合同不在当前合同列表中时，用库存合同名合成选项，避免下拉显示原始id
    ensureContractOption() {
      //特殊合同（无合同/未签合同）直接还原为下拉选项
      if (!this.form.contractId) {
        if (this.form.contractName === "无合同") {
          this.form.contractId = "__none__";
        } else if (this.form.contractName === "未签合同") {
          this.form.contractId = "__unsigned__";
        }
        return;
      }
      const exists = this.contractOptions.some((item) => String(item.id) === String(this.form.contractId));
      if (!exists) {
        this.contractOptions = this.contractOptions.concat([
          { id: this.form.contractId, contractName: this.form.contractName || this.form.contractId, orgName: this.form.orgName || "" },
        ]);
      }
    },
    //=============【2-列表区】修改
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getDevproject(id).then((response) => {
        this.form = response.data;
        //验收状态字典的 dictValue 是字符串，回显需转字符串否则下拉显示原始数字
        this.form.acceptStatus = this.form.acceptStatus == null ? "" : String(this.form.acceptStatus);
        this.contactList = this.form.contactList == null ? [] : this.form.contactList;
        this.doPersonIds = this.form.doPersonid ? this.form.doPersonid.split(",") : [];
        this.linkPersonIds = this.form.linkPersonid ? this.form.linkPersonid.split(",") : [];
        this.ensureContractOption();
        this.isButton = true;
        this.title = "修改项目";
        this.open = true;
      });
    },
    //=============【2-列表区】删除
    handleDelete(row) {
      const ids = row.id || this.ids;
      const names = row.projectName || this.selectedRows.length + "条项目";
      this.$confirm('是否确认删除项目【' + names + '】?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          if (row.id) {
            return delDevproject(row);
          }
          return delMDevproject(this.selectedRows);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        })
        .catch(() => {});
    },
    //=============【2-列表区】导出按钮操作
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm("是否确认导出开发项目数据?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.exportLoading = true;
          return exportDevproject(queryParams);
        })
        .then((response) => {
          this.download(response.msg);
          this.exportLoading = false;
        })
        .catch(() => {});
    },
    //*************【3-表单】取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    //*************【3-表单】表单重置
    reset() {
      this.form = {
        id: null,
        projectName: "",
        projectType: "",
        orgId: "",
        orgName: "",
        contractId: "",
        contractName: "",
        workload: "",
        requireDate: "",
        finishDate: "",
        projectStatus: "",
        linkPerson: "",
        linkPersonid: "",
        doPerson: "",
        doPersonid: "",
        acceptStatus: "2",
        acceptDate: "",
        remark: "",
        contactList: [],
      };
      this.doPersonIds = [];
      this.linkPersonIds = [];
      this.resetForm("form");
    },
    //*************【3-表单】联系人添加一行
    addContactRow() {
      this.contactList.push({
        contactName: "",
        contactPost: "",
        contactTel: "",
      });
    },
    //*************【3-表单】联系人删除一行
    handleContactDel(row) {
      const index = this.contactList.indexOf(row);
      if (index !== -1) {
        this.contactList.splice(index, 1);
      }
    },
    //*************【3-表单】负责人多选（同步姓名与id串）
    handleLinkPersonChange(ids) {
      this.form.linkPersonid = (ids || []).join(",");
      this.form.linkPerson = (ids || [])
        .map((id) => {
          const person = this.personlist.find((item) => item.id == id);
          return person ? person.name : "";
        })
        .filter((name) => name)
        .join(",");
    },
    //*************【3-表单】实施人员多选（同步姓名与id串）
    handleDoPersonChange(ids) {
      this.form.doPersonid = ids.join(",");
      this.form.doPerson = ids
        .map((id) => {
          const person = this.personlist.find((item) => item.id == id);
          return person ? person.name : "";
        })
        .filter((name) => name)
        .join(",");
    },
    //*************【3-表单】提交
    submitForm() {
      //校验联系人信息（姓名必填）
      if (this.contactList.length > 0) {
        if (!this.contactList.every((item) => item.contactName)) {
          this.msgError("联系人信息存在姓名为空，请补充填写完整或删除空行");
          return;
        }
      }
      if (this.form.requireDate) {
        this.form.requireDate = parseTime(this.form.requireDate);
      }
      if (this.form.finishDate) {
        this.form.finishDate = parseTime(this.form.finishDate);
      }
      if (this.form.acceptDate) {
        this.form.acceptDate = parseTime(this.form.acceptDate);
      }

      //匹配机构id：从医院列表选择的带id，手动录入的三方公司不带id
      this.form.orgId = "";
      const org = this.options.find((item) => item.orgname == this.form.orgName);
      if (org) {
        this.form.orgId = org.orgid;
        this.form.orgName = org.orgname;
      }

      //根据合同id带出合同名称
      const contract = this.contractOptions.find((item) => item.id == this.form.contractId);
      this.form.contractName = contract ? contract.contractName : "";
      //选择"无合同/未签合同"特殊选项时不关联真实合同（contract_id 为 uuid 列，置空避免插入非法值）
      if (this.form.contractId === "__none__" || this.form.contractId === "__unsigned__") {
        this.form.contractId = null;
      }

      this.form.contactList = this.contactList;

      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id != null) {
            updateDevproject(this.form).then((response) => {
              if (response.code == 200) {
                this.open = false;
                this.msgSuccess("修改成功");
                this.getList();
              } else {
                this.msgError("修改失败" + response.msg);
              }
            }).catch(() => {});
          } else {
            addDevproject(this.form).then((response) => {
              if (response.code == 200) {
                this.open = false;
                this.msgSuccess("登记成功");
                this.getList();
              } else {
                this.msgError("登记失败" + response.msg);
              }
            }).catch(() => {});
          }
        }
      });
    },
    //*************【3-1表单】机构过滤
    remoteOrg(query) {
      if (query !== "") {
        setTimeout(() => {
          this.orgOptions = this.options.filter((item) => {
            return (
              (item.pinyin || "").toLowerCase().includes(query.toLowerCase()) ||
              (item.orgname || "").toLowerCase().includes(query.toLowerCase())
            );
          });
        }, 100);
      } else {
        this.orgOptions = this.options;
      }
    },
    //*************验收状态翻译
    acceptStatusFormat(acceptStatus) {
      const status = this.acceptStatusOptions.find((item) => item.dictValue == acceptStatus);
      return status ? status.dictLabel : acceptStatus;
    },
    //*************验收状态标签颜色
    acceptTagType(acceptStatus) {
      const map = { 1: "success", 2: "info", 3: "warning", 4: "" };
      return map[acceptStatus] || "info";
    },
  },
};
</script>
<style scoped lang="scss">
.app-container {
  overflow: hidden;
  /* el-tabs 层级打断高度链：用 flex 链把固定高度穿透到 el-tab-pane，
     否则 contain-cont 的 calc(100% - 150px) 对 auto 父级失效，列表超出被裁剪 */
  display: flex;
  flex-direction: column;
  ::v-deep .el-tabs {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  ::v-deep .el-tabs__content {
    flex: 1;
    overflow: hidden;
  }
  ::v-deep .el-tab-pane {
    height: 100%;
  }

  .contain-top {
    flex-shrink: 0;
    .el-form-item {
      margin-bottom: 10px;
    }
  }

  .contain-cont {
    height: calc(100% - 150px);
    overflow-y: auto;
  }

  .pagination-container {
    margin: 0;
  }
}

.widthClass {
  width: 200px;
}
</style>
