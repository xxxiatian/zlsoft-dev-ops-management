<template>
  <div class="app-container">
    <div class="contain-top">
      <el-form ref="queryForm"  :model="queryParams" v-show="showSearch" label-width="68px" :inline="true">
        <el-form-item prop="orgid" label="机构"  v-if="glshow == 1 || glshow == 0">
          <el-select v-model="queryParams.orgid" placeholder="请选择机构" :remote-method="remoteOrg" class="widthClass"   filterable remote  clearable reserve-keyword>
            <el-option
              v-for="dict in orgOptions"
              :key="dict.orgid"
              :label="dict.orgname"
              :value="dict.orgid"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="glshow == 2" label="医院" prop="orgid"> 
          <el-select v-model="queryParams.orgid" placeholder="请选择机构" :remote-method="remoteOrg" class="widthClass"  filterable remote clearable reserve-keyword>
            <el-option
              v-for="dict in orgOptions"
              :key="dict.orgid"
              :label="dict.orgname"
              :value="dict.orgid"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="服务单号" prop="id">
          <el-input v-model="queryParams.id" placeholder="请输入服务单号" @keyup.enter.native="handleQuery" size="small" class="widthClass" clearable />
        </el-form-item>
        <el-form-item label="工单状态" prop="orderstatus">
          <el-select  v-model="queryParams.orderstatus" placeholder="请选择工单状态" size="small" class="widthClass" clearable>
            <el-option
              v-for="rce in statusOptions"
              :key="rce.dictValue"
              :label="rce.dictLabel"
              :value="rce.dictValue"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间" prop="dateStart">
          <el-date-picker  v-model="dateStart" placeholder="选择日期" type="datetime" class="widthClass">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间" prop="dateEnd">
          <el-date-picker  v-model="dateEnd"   placeholder="选择日期" type="datetime" class="widthClass">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="处理人" prop="currentuserid">
          <el-select v-model="queryParams.currentuserid" placeholder="请选择处理人" :remote-method="remoteMethod" size="small" class="widthClass"  remote clearable filterable allow-create>
            <el-option
              v-for="rce in unitOptions"
              :key="rce.id"
              :label="rce.personname"
              :value="rce.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button  size="mini" icon="el-icon-search"  @click="handleQuery" type="primary" >搜索</el-button>
          <el-button  size="mini" icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      <div>
        <el-row :gutter="10">
          <el-col :span="1.5">
            <el-button type="warning" size="mini" icon="el-icon-download" :loading="exportLoading" @click="handleExport" plain v-hasPermi="['system:rec:export']">
              导出
            </el-button>
          </el-col>
          <right-toolbar :showSearch.sync="showSearch"  @queryTable="getList"></right-toolbar>
        </el-row>
      </div>
      <br />
    </div>
    <div class="contain-cont">
      <el-table :data="recList"  @selection-change="handleSelectionChange" v-loading="loading"
        table-cloumn  element-loading-text="拼命加载中" :row-class-name="tableRowClassName"  height="calc(100% - 50px)" border
      >
        <el-table-column type="selection" width="50px" align="center" />
        <el-table-column prop="id"          label="服务单号"      width="120px" align="center"  :show-overflow-tooltip="true" fixed />        
        <el-table-column prop="title"       label="问题概述"      width="190px" align="center"  :show-overflow-tooltip="true"  />
        <el-table-column prop="describe"    label="服务详细描述"  width="400px"  align="center" :show-overflow-tooltip="true"  />
        <el-table-column prop="orgname"     label="申请医院"      width="170px" align="center"  :show-overflow-tooltip="true"  />
        <el-table-column prop="unitname"    label="申请科室"      width="100%"  align="center"  :show-overflow-tooltip="true"  />
        <el-table-column prop="contacts"    label="联系人员"      width="120px" align="center" />
        <el-table-column prop="tel"         label="联系电话"      width="120px" align="center" />
        <!-- <el-table-column prop="qqnum" label="QQ号码" width="100px" align="center" />  -->
        <el-table-column prop="createAt"    label="申请时间"      width="155px" align="center"></el-table-column>
        <el-table-column prop="desiretime"  label="期望时间"      width="155px" align="center" ></el-table-column>
        <el-table-column prop="arrangetime" label="安排时间"      width="155px" align="center" />
        <el-table-column prop="currentusername"  label="处理人"   width="160px" align="center" />
        <el-table-column prop="currentunitname"  label="处理部门" width="155px" align="center" />
        <el-table-column prop="completetime"     label="完成时间" width="155px" align="center" />       
        <el-table-column prop="orderstatus"      label="工单状态" width="100%"  align="center" />
        <el-table-column label="操作"  width="320px" align="center" fixed="right" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button  size="mini"  type="text"  icon="el-icon-edit"  @click="handleAssign(scope.row)"  v-hasPermi="['system:rec:todo']"
              v-if="showBtn(scope.row,'派单')">派单</el-button>
            <el-button size="mini" type="text" icon="el-icon-warning-outline" @click="handlestop(scope.row)" v-hasPermi="['system:rec:over']"
              v-if="showBtn(scope.row,'终止')">终止</el-button>
            <el-button size="mini" type="text" icon="el-icon-position" @click="handleReceive(scope.row)" v-hasPermi="['system:rec:record']"
              v-if="showBtn(scope.row,'接单')">接单</el-button>
            <el-button size="mini"  type="text" icon="el-icon-position" @click="handleTransDept(scope.row)" v-hasPermi="['system:rec:derpt']"
              v-if="showBtn(scope.row,'转部门')">转部门</el-button>
            <el-button size="mini" type="text" icon="el-icon-tickets" @click="showDetail(scope.row)" v-hasPermi="['system:rec:query']" >详情</el-button>
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

      <!-- 转部门、终止、派单 对话框 -->
      <el-dialog :title="title" :visible.sync="open"  width="1000px" append-to-body  :close-on-click-modal="false">
        <el-form ref="form" :model="form" :rules="ruless" label-width="80px">
          <el-row>
            <el-col :span="12">
              <el-form-item label="联系人员" prop="contacts">
                <el-input v-model="form.contacts" placeholder="请输入内容"    style="width: 220px" disabled ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系电话" prop="tel">
                <el-input v-model="form.tel"      placeholder="请输入联系电话" style="width: 220px"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="申请科室" prop="unitname">
                <el-input v-model="form.unitname" placeholder="请输入内容"     style="width: 220px"  disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="申请时间" prop="createAt">
                <el-date-picker v-model="form.createAt" placeholder="选择申请时间"  size="small" type="datetime"  disabled >
                </el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="8">
              <el-form-item label="处理人" prop="currentuserid">
                <el-select v-model="form.currentuserid" placeholder="请选择处理人" style="width: 220px !important">
                  <el-option
                    v-for="dict in personlist"
                    :key="dict.id"
                    :label="dict.name"
                    :value="dict.id"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="处理方式" prop="processing">
                <el-select v-model="form.processing" placeholder="请选择处理方式">
                  <el-option
                    v-for="dict in servicetypeOptions"
                    :key="dict.dictValue"
                    :label="dict.dictLabel"
                    :value="dict.dictValue"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="服务分类" prop="servicetype">
                <el-select v-model="form.servicetype" placeholder="请选择服务分类" style="width: 220px">
                  <el-option
                    v-for="dict in serviceclassOptions"
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
              <el-form-item label="问题概述" prop="title">
                <el-input v-model="form.title"    placeholder="请输入内容" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="终止原因" prop="stopter">
                <el-input v-model="form.stopter"  placeholder="请输入发生终止原因" style="width: 380px" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="问题描述" prop="describe">
                <el-input  v-model="form.describe" placeholder="请输入内容"  type="textarea" :rows="6" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="处理方法" prop="disposal">
                <el-input v-model="form.disposal"  placeholder="请输入处理方法"  type="textarea" style="width: 380px" :rows="3"/>
              </el-form-item>
            </el-col>
            <el-col :span="12" v-show="zjshow">
              <el-form-item label="转交部门" prop="currentunitid">
                <el-select  v-model="form.currentunitid" placeholder="请选择转交部门" @change="chanUnit" style="width: 380px">
                  <el-option
                    v-for="dict in deptList"
                    :key="dict.id"
                    :label="dict.name"
                    :value="dict.id"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="附件" prop="enclosure">
                <el-upload action="#" :http-request="requestUpload"
                  class="file-upload"
                  style="width: 62%"                 
                  :file-list="fileList"                 
                  :on-preview="onPreview"
                  :on-remove="handleRemove"
                >
                  <el-button size="mini" type="primary">点击上传</el-button>
                </el-upload>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="warning" v-show="zjshow"   :disabled="isButtonDisabled" @click="transForm">转 交</el-button>
          <el-button type="success" v-show="bzjshow"  :disabled="isButtonDisabled" @click="orderDoForm">派 单</el-button>
          <el-button type="danger"  v-show="stopshow" :disabled="isButtonDisabled" @click="stopForm">终 止</el-button>
          <!-- <el-button type="primary" @click="modifyForm">修 改</el-button> -->
          <el-button @click="dialogone">取 消</el-button>
        </div>
      </el-dialog>

      <!-- 工单详情对话框 -->
      <el-dialog :title="title" :visible.sync="detileopen" width="1000px" append-to-body :close-on-click-modal="false">
        <div>
          <div>
            <el-form  ref="form" :model="form" :rules="ruless" label-width="80px">
              <el-row>
                <el-col :span="6">
                  <el-form-item label="联系人员" prop="contacts">
                    <el-input v-model="form.contacts" placeholder="请输入内容"    style="width: 143px"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="联系电话" prop="tel">
                    <el-input v-model="form.tel"      placeholder="请输入联系电话" style="width: 143px"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="6">
                  <el-form-item label="申请科室" prop="unitname">
                    <el-input v-model="form.unitname" placeholder="请输入内容"     style="width: 143px"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="处理人" prop="currentusername">
                    <el-input v-model="form.currentusername" placeholder="请输入处理人"  style="width: 143px" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <el-form-item label="申请时间" prop="createAt">
                    <el-date-picker v-model="form.createAt"  placeholder="选择申请时间" size="small" type="datetime">
                    </el-date-picker>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="6">
                  <el-form-item label="问题概述" prop="title">
                    <el-input v-model="form.title"  style="width: 383px"  filterable />
                  </el-form-item>
                </el-col>
                <el-col>
                  <el-form-item label="问题描述" prop="describe">
                    <el-input v-model="form.describe" placeholder="请输入内容"  style="width: 383px"  type="textarea" :rows="8"  />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="附件" prop="enclosure">
                    <el-upload action="#" :http-request="requestUpload"
                      class="file-upload"
                      style="width: 62%"
                      multiple
                      :on-remove="handleRemove"
                      :file-list="fileList"                     
                      :on-preview="onPreview"
                    >
                      <el-button size="mini" type="primary">点击上传</el-button>
                    </el-upload>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </div>
          <div class="gdjb">
            <p style="font-size: 18px; color: #303133">工单进度详情</p>
            <div class="material-tabs">
              <div class="tabItem">
                <el-timeline>
                  <el-timeline-item
                    v-for="(item, index) in disposalList"
                    :color="index === 0 ? '#95F204' : ''"
                    :key="index"
                  >
                    <div>
                      <span><i class="el-icon-user"></i>{{ item.createBy }}(电话:{{ item.tel }}) {{ item.orderstatus }}</span>
                      {{ item.tousername }}
                    </div>
                    <div>
                      <span><i class="el-icon-edit-outline"></i>{{ item.orderstatus=='终止问题'?(item.disposal ? item.disposal:stopReason):item.disposal }}</span>
                    </div>
                    <div style="line-height: 10px; color: #909399">
                      <i class="el-icon-time"></i>{{ item.createAt }}
                    </div>
                  </el-timeline-item>
                </el-timeline>
              </div>
            </div>
          </div>
        </div>
      </el-dialog>

      <!-- 转服务商对话框 -->
      <!-- <el-dialog  :title="title" :visible.sync="zjopen"  width="1000px"  append-to-body  :close-on-click-modal="false">
        <el-form ref="form" :model="form" :rules="rulesss" label-width="80px">
          <el-row>
            <el-col :span="12">
              <el-form-item label="联系人员" prop="contacts">
                <el-input v-model="form.contacts" placeholder="请输入内容"     style="width: 220px"  disabled ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系电话" prop="tel">
                <el-input v-model="form.tel"      placeholder="请输入联系电话"  style="width: 220px"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="申请科室" prop="unitname">
                <el-input v-model="form.unitname" placeholder="请输入内容"     style="width: 220px" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="申请时间" prop="createAt">
                <el-date-picker v-model="form.createAt" placeholder="选择申请时间" size="small" type="datetime" disabled>
                </el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="问题描述" prop="describe">
                <el-input v-model="form.describe"       placeholder="请输入内容"  style="width: 300px" type="textarea" :rows="4" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="转交原因" prop="disposal">
                <el-input v-model="form.disposal"       placeholder="请输入内容"  style="width: 300px" type="textarea" :rows="4" clearable />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="附件" prop="enclosure">
                <el-upload
                  class="file-upload"
                  style="width: 62%"
                  action="#"
                  :file-list="fileList"
                  :http-request="requestUpload"
                  :on-preview="onPreview"
                  :on-remove="handleRemove"
                >
                  <el-button size="mini" type="primary">点击上传</el-button>
                </el-upload>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="modifytran" type="primary" >确 定</el-button>
          <el-button @click="dialogone">取 消</el-button>
        </div>
      </el-dialog> -->
    </div>
  </div>
</template>

<script>
import {
  postorderList,
  getRec,
  delRec,
  addRec,
  updateRec,
  exportRec,
  distributiond,
  listUser,
  listDept,
  EngineerInformation,
  personList,
  orderDo,
  DisposalList,
  gdUpdata,
  stopOrder,
  deLiver,
  deprtList,
  recordList,
  unitPersonlist,
  orgHospitallist,
} from "@/api/order/service/rec";
import Editor from "@/components/Editor";
// import { getUserProfile } from "@/api/system/user";
import { unitDept } from "@/api/system/dept";
import {
  parseTime,
  FunGetDateStr,
  formatToYYYYMMDDHHMMSS,
} from "@/utils/zlsoft";
import Treeselect from "@riophae/vue-treeselect";
import { uploadFile, serverUrl } from "@/api/common/file";

import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import store from "@/store";
export default {
  name: "Service",
  components: {
    Treeselect,
    Editor,
  },

  data() {
    return {
      dateRange: [],
      deptList: [], //转交部门下拉  
      loading: true,// 遮罩层
      statusnum: 1,    
      exportLoading: false,// 导出遮罩层    
      ids: [],// 选中数组
      showSearch: true,// 显示搜索条件
      stopshow: false, //终止页面下的 终止按钮
      dateStart: null,
      dateEnd: null,
      zjshow: false, //转交页面下的转交按钮
      bzjshow: true, //派单页面下的派单按钮
      glshow: store.getters.roles.organizationtype, //0 root,1 管理机构,2 服务商，3 医疗机构   
      total: 0,// 总条数
      recList: [], //部门工单列表
      options: [], //初始机构数据
      orgOptions: [],//机构下拉      
      fileList: [],//文件上传
      detileopen: false, //工单详情对话框     
      statusOptions: [],//单据状态  
      severityOptions: [],//问题范围
      disposalList: [], //工单流转记录     
      personlist: [],//处理人     
      servicetypeOptions: [],//处理方式
      serviceclassOptions: [],//服务分类
      unitPersonList: [], //部门人员
      unitOptions: [], //处理人    
      title: "",// 弹出层标题
      // zjopen: false, //转服务商对话框
      open: false, //转部门、派单、终止等对话框
      servicetype: 0,
      processing: 0,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        id: null,
        orderstatus: null,
        orgname: null,
        unitname: null,
        tel: null,
        title: null,
        contacts: null,
        describe: null,
        createAt: null,
        desiretime: null,
        currentusername: null,
        currentuserid: null,
        arrangetime: null,
        processing: null,
        servicetype: null,
        stopter: null,
        isClear: false,
        currentunitid: store.getters.roles.unit.id,
      },
      dealPerson:{
        userId:null,
        userName:null,
        unitid:null,
      },
      form: {},// 表单参数
      // 表单校验
      rules: {
        contacts: [{ required: true, message: "联系人员为空", trigger: "blur" }],
        createAt: [{ required: true, message: "申请时间不能为空", trigger: "blur"}],
        tel: [{ required: true, message: "联系电话不能为空", trigger: "blur" }],
        title: [{ required: true, message: "问题概述不能为空", trigger: "blur" }],
        scopetype: [{ required: true, message: "问题范围不能为空", trigger: "blur" }],
        describe: [{ required: true, message: "服务详细描述不能为空", trigger: "blur" }],
      },
      ruless: {
        contacts: [{ required: true, message: "联系人员为空", trigger: "blur" }],
        createAt: [{ required: true, message: "申请时间不能为空", trigger: "blur"}],
        tel: [{ required: true, message: "联系电话不能为空", trigger: "blur" }],
        describe: [{ required: true, message: "服务详细描述不能为空", trigger: "blur" }],
      },
      rulesss: {
        disposal: [{ required: true, message: "转交原因不能为空", trigger: "blur" }],
      },
      // show: true,
      isButtonDisabled: false,
      timeoutId: null,
      stopReason:""  //终止原因
    };
  },

  created() {
    this.statusnum = this.$route.params.statusnum;//首页 工单分类跳转链接的参数

    this.dateStart = FunGetDateStr(-3) + " " + "00:00:00";
    this.dateEnd = parseTime(new Date().setHours(23, 59, 59, 999));

    this.dateRange = [this.dateStart, this.dateEnd];
    if (this.dateRange) {
      this.getList;
    }
    unitPersonlist({ unitid: store.getters.roles.unit.id }).then((res) => {
      this.unitPersonList = res.data;
    });
    orgHospitallist().then((res) => {
      this.options = res.data;
    });

    //单据状态
    this.getDicts("sys_document_status").then((response) => {
      this.statusOptions = response.data;
    });

    //问题范围
    this.getDicts("sys_info_pre").then((response) => {
      this.severityOptions = response.data;
    });
    //问题等级
    this.getDicts("sys_severity_status").then((response) => {
      this.servicetypeOptions = response.data;
    });

    //服务分类
    this.getDicts("sys_cancels_order").then((response) => {
      this.serviceclassOptions = response.data;
    });
    this.getList();
  },

  methods: {
    /**********【1-筛选区操作】 查询：部门工单列表 */
    getList() {
      this.loading = true;
      this.recList = []
      postorderList(this.addDateRange(this.queryParams, this.dateRange)).then(
        (response) => {
          this.recList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
    }, 
    /**********【1-筛选区操作】 查询：搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.dateRange = [ formatToYYYYMMDDHHMMSS(this.dateStart), formatToYYYYMMDDHHMMSS(this.dateEnd)];

      if( this.dateEnd == null){
        this.dateRange = [
          this.dateStart==null?"1900-01-01 00:00:00":formatToYYYYMMDDHHMMSS(this.dateStart),
          parseTime(new Date()),
        ];
      }      
      if (new Date(this.dateRange[0]) > new Date(this.dateRange[1])) {
        return this.$message.error("请选择正确的时间段！");
      }
      this.getList();
    },
    /**********【1-筛选区操作】 重置按钮操作 */
    resetQuery() {
      this.dateStart = null 
      this.dateEnd = null
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /**********【1-筛选区操作】 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm("是否确认导出所有【请填写功能名称】数据项?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.exportLoading = true;
          return exportRec(queryParams);
        })
        .then((response) => {
          this.download(response.msg);
          this.exportLoading = false;
        })
        .catch(() => {});
    },

    //=============【2-列表区操作】列表操作--工单终止
    handlestop(row) {
      this.reset();
      this.fileList = [];
      const id = row.id || this.ids;
      getRec(id).then((response) => {
        this.form = response.data;
        if (this.form.enclosure != null && this.form.enclosure != "") {
          var urlList = this.form.enclosure.split(",");
          urlList.forEach((url) => {
            var file = url.split("::");
            this.fileList.push({ url: file[0], name: file[1] });
          });
        }
        // this.show = true;
        
        this.form.tel = row.tel;
        this.form.processing = row.processing;
        this.form.servicetype = row.servicetype;
        this.form.currentusername = row.currentusername;
        
        if (row.servicetype == null || row.servicetype == undefined || row.servicetype == "") {
          this.servicetype = 1;
        }
        if (row.processing == null || row.processing == undefined || row.processing == "") {
          this.processing = 1;
        }
      });
      personList({ unitid: store.getters.roles.unit.id }).then((response) => {
        if(response){
          this.personlist = response.data;
        }
        let person = this.personlist.find(item=>item.id==row.currentuserid);
        if(person==undefined){
          this.personlist.push({
              id:row.currentuserid,
              name: row.currentusername
          })
        }
      });
      this.title = "工单处理详情";
      this.zjshow = false; //转交按钮
      this.bzjshow = false;//派单按钮
      this.stopshow = true;//终止按钮
      this.open = true;//终止对话框
    },
    //=============【2-列表区操作】 列表操作--派单 
    handleAssign(row) {
      this.reset();
      this.fileList = [];
      const id = row.id || this.ids;
      getRec(id).then((response) => {
        this.form = response.data;
        if (this.form.enclosure != null && this.form.enclosure != "") {
          var urlList = this.form.enclosure.split(",");
          urlList.forEach((url) => {
            var file = url.split("::");
            this.fileList.push({ url: file[0], name: file[1] });
          });
        }

        this.form.tel = row.tel;
        this.form.processing = row.processing;
        this.form.servicetype = row.servicetype;
        this.form.currentusername = row.currentusername;

        if (row.servicetype == null || row.servicetype == undefined || row.servicetype == "") {
          this.servicetype = 1;
        }
        if (row.processing == null || row.processing == undefined || row.processing == "") {
          this.processing = 1;
        }
      });

      //当前部门的人员信息，若人员信息不包含row里的人员，则将row里的人员添加到人员信息
      personList({ unitid: store.getters.roles.unit.id }).then((response) => {
        if(response){
          this.personlist = response.data;
        }
        let person = this.personlist.find(item=>item.id==row.currentuserid);
        if(person==undefined){
          this.personlist.push({
              id:row.currentuserid,
              name: row.currentusername
          })
        }
      });

      unitDept(this.queryParams).then((response) => {
        this.deptList = this.handleTree(response.rows, "id");
      });

      this.title = "工单处理详情";
      this.zjshow = false; //转交按钮
      this.bzjshow = true; //派单按钮
      this.stopshow = false; //终止按钮
      // this.show = true;
      this.open = true; //派单对话框
    },    
    //=============【2-列表区操作】列表操作--接单
    handleReceive(row) {
      const ids = row.id;
      let obj = {
        id: row.id,
        unitid: row.unitid,
        pid: store.getters.roles.person.id,
      };
      this.$confirm('是否确认接单号为"' + ids + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return recordList(obj);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("接单成功");
        })
        .catch(() => {});
    },
    //=============【2-列表区操作】列表操作--转部门
    handleTransDept(row) {

      unitDept(this.queryParams).then((response) => {
        this.deptList = response.rows;
      });

      this.reset();
      this.fileList = [];
      const id = row.id || this.ids;
      getRec(id).then((response) => {
        this.form = response.data;
        if (this.form.enclosure != null && this.form.enclosure != "") {
          var urlList = this.form.enclosure.split(",");
          urlList.forEach((url) => {
            var file = url.split("::");
            this.fileList.push({ url: file[0], name: file[1] });
          });
        }
        // this.show = true;
        
        this.form.tel = row.tel;
        this.form.processing = row.processing;
        this.form.servicetype = row.servicetype;
        this.form.currentusername = row.currentusername;
        this.form.currentuserid = row.currentuserid;
        this.dealPerson.userId = row.currentuserid;
        this.dealPerson.userName = row.currentusername;
        this.dealPerson.unitid = row.currentunitid;
        
        if (row.servicetype == null || row.servicetype == undefined || row.servicetype == "") {
          this.servicetype = 1;
        }
        if (row.processing == null || row.processing == undefined || row.processing == "") {
          this.processing = 1;
        }
      });
      personList({ unitid: store.getters.roles.unit.id }).then((response) => {
        if(response){
          this.personlist = response.data;
        }
        let person = this.personlist.find(item=>item.id==row.currentuserid);
        if(person==undefined){
          this.personlist.push({
              id:row.currentuserid,
              name: row.currentusername
          })
        }
      }); 
      this.title = "工单处理详情";
      this.zjshow = true; //转交按钮
      this.bzjshow = false; //派单按钮
      this.stopshow = false; //终止按钮
      this.open = true; //转部门对话框        
    },
    //=============【2-列表区操作】列表操作--详情
    showDetail(row) {
      this.reset();
      this.fileList = [];
      this.disposalList = [];
      const id = row.id || this.ids;
      DisposalList({ id: row.id }).then((response) => {
          this.disposalList = response.data;
        });
      getRec(id).then((response) => {
        this.form = response.data;
        if (this.form.enclosure != null && this.form.enclosure != "") {
          var urlList = this.form.enclosure.split(",");
          urlList.forEach((url) => {
            var file = url.split("::");
            this.fileList.push({ url: file[0], name: file[1] });
          });
        }
        
        this.stopReason = row.stopter;//终止原因       
        this.form.tel = row.tel;
        this.title = "派单详情";
        this.detileopen = true;
      });
    },  
    
    //##########【3-对话框按钮】派单按钮 
    orderDoForm() {
      this.stopDoub();
      if ( this.form.currentuserid == null || this.form.currentuserid == undefined || this.form.currentuserid == "") {
        this.msgError("请填写处理人");
        return;
      }
      this.$refs["form"].validate((valid) => {
        this.form.desiretime = parseTime( this.form.desiretime,"{y}-{m}-{d} {h}:{i}:{s}");
        this.form.createAt = parseTime( this.form.createAt, "{y}-{m}-{d} {h}:{i}:{s}" );
        this.form.assignDatetime = parseTime(this.form.assignDatetime,"{y}-{m}-{d} {h}:{i}:{s}");
        this.form.reqDatetime = parseTime(this.form.reqDatetime, "{y}-{m}-{d} {h}:{i}:{s}");

        if (valid) {
          if ( this.form.servicetype != null && this.form.servicetype != undefined && this.form.servicetype != "" ) {
            if (!this.isNumeric(this.form.servicetype)) {
              let servicetypee = this.serviceclassOptions.find( (item) => item.dictLabel === this.form.servicetype)?.dictValue;
              this.form.servicetype = Number(servicetypee);
            }
          }
          if ( this.form.processing != null && this.form.processing != undefined && this.form.processing != "") {
            if (!this.isNumeric(this.form.processing)) {
              let serverityy = this.servicetypeOptions.find( (item) => item.dictLabel === this.form.processing)?.dictValue;
              this.form.processing = Number(serverityy);
            }
          }
          orderDo(this.form).then((response) => {
            if(response.code==200){
              this.msgSuccess("派单成功");
              this.open = false;
              this.getList();
            }else{
              this.msgError(response.message);
            }
          }).catch((error)=>{
            
          });
          this.fileList = [];
        }
      });
    },
    //##########【3-对话框按钮】 终止按钮
    stopForm() {
      this.stopDoub();
      this.$refs["form"].validate((valid) => {
        this.form.desiretime = parseTime(this.form.desiretime, "{y}-{m}-{d} {h}:{i}:{s}");
        this.form.createAt = parseTime(this.form.createAt,"{y}-{m}-{d} {h}:{i}:{s}");
        if (valid) {
          if (this.form.stopter == null && this.form.stopter == undefined) {
            this.msgError("请填写终止原因！");
            return;
          }
          if ( this.form.servicetype != null && this.form.servicetype != undefined && this.form.servicetype != "") {
            let servicetypee = this.serviceclassOptions.find( (item) => item.dictLabel === this.form.servicetype)?.dictValue;
            this.form.servicetype = Number(servicetypee);
          }
          if ( this.form.processing != null && this.form.processing != undefined && this.form.processing != "") {
            let serverityy = this.servicetypeOptions.find((item) => item.dictLabel === this.form.processing)?.dictValue;
            this.form.processing = Number(serverityy);
          }
          if (this.form.id != null) {
            stopOrder(this.form).then((response) => {
              if(response.code==200){
                this.msgSuccess("终止成功");
                this.open = false;
                this.getList();
              }else{
                  this.msgError(response.message);
              }
            }).catch((error)=>{});
          }
          this.fileList = [];
        }
      });
    }, 
    //##########【3-对话框按钮】转交部门
    transForm(row) {
      this.stopDoub();
      this.$refs["form"].validate((valid) => {
        this.form.desiretime = parseTime(this.form.desiretime, "{y}-{m}-{d} {h}:{i}:{s}" );
        this.form.createAt = parseTime( this.form.createAt, "{y}-{m}-{d} {h}:{i}:{s}");
        if (valid) {
          if ( this.form.currentunitid == null || this.form.currentunitid == undefined || this.form.currentunitid == "" ) {
            this.msgError("请填写转交部门！");
            return;
          }
          //判断是否换部门了,若换了部门，处理人也需要换（若原处理人为空，则不考虑）
          if(this.dealPerson.userId!=null&&this.dealPerson.userId!=""){
             let person = this.personlist.find(item=>item.id==this.form.currentuserid);
             if(person==undefined){
                this.msgError("请更换处理人，须是当前转交部门下的人员！");
                return;
             }
          }
          
          if ( this.form.servicetype != null && this.form.servicetype != undefined && this.form.servicetype != "" ) {
            let servicetypee = this.serviceclassOptions.find( (item) => item.dictLabel === this.form.servicetype)?.dictValue;
            this.form.servicetype = Number(servicetypee);
          }
          if ( this.form.processing != null && this.form.processing != undefined && this.form.processing != "" ) {
            let serverityy = this.servicetypeOptions.find((item) => item.dictLabel === this.form.processing)?.dictValue;
            this.form.processing = Number(serverityy);
          }
          if (this.form.id != null) {
            deprtList(this.form).then((response) => {
              if(response.code==200){
                this.msgSuccess("转交成功");
                this.open = false;
                this.getList();
              }else{
                this.msgError(response.message);
              }
            }).catch(() => { });
          }
          this.fileList = [];
        }
      });
    },
    /**********【1-1筛选区操作】 机构或医院过滤 */
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
    //***********【2-1列表区】行样式变化 */
    tableRowClassName({ row }) {
      if (row.orderstatus === "院内终止" || row.orderstatus === "服务终止") {
        return "warning-row";
      }
      if (row.orderstatus === "院内完成" || row.orderstatus === "服务完成") {
        return "success-row";
      }
      return "";
    },
    //***********【2-1列表区】 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
    },  
    //***********【2-2列表区】 操作按钮显示
    showBtn(row,btnName){
      if(btnName=="派单"){
        if(((row.orderstatus == '服务分配' ||  row.orderstatus == '服务处理') && this.glshow == '2') || (row.orderstatus == '院内分配' && this.glshow=='3') ){
              return true;
           }else{
              return false;
           }
      }else if(btnName=="接单"){
        if((row.orderstatus == '服务分配' && this.glshow == '2') || (row.orderstatus == '院内分配' && this.glshow == '3' )){
              return true;
           }else{
              return false;
           }
      }else if(btnName=="终止"){
        if(((row.orderstatus == '院内分配' || row.orderstatus == '院内处理' || row.orderstatus == '问题下单') && this.glshow == '3')||
           (row.orderstatus !== '服务终止' && row.orderstatus !== '服务完成' && this.glshow == '2')  ){
              return true;
           }else{
              return false;
           }
      }else if(btnName=="转部门"){
        if( ((row.orderstatus == '院内分配' || row.orderstatus == '问题下单') && this.glshow == '3')||
            (row.orderstatus !== '服务终止' && row.orderstatus !== '服务完成' && this.glshow == '2') ){
              return true;
          }else{
              return false;
          }
      }
    },     
    //***********【3-1表单区】 表单重置
    reset() {
      this.form = {
        contacts: null,
        createAt: this.dateRange[1],
        orgname: store.getters.roles.orgaccount.orgname,
        orgid: store.getters.roles.orgaccount.orgid,
        unitname: store.getters.roles.unit.name,
        unitid: null,
        scopetype: '',
        tel: null,
        desiretime: null,
        processing: null,
        currentusername: null,
        servicetype: null,
        stopter: null,
        disposal: null,
        currentunitid: null,
      };
      this.resetForm("form");
    }, 
    //***********【3-2表单区】禁止双击
    stopDoub() {
      // 执行按钮点击后的逻辑
      this.isButtonDisabled = true;
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }
      this.timeoutId = setTimeout(() => {
        this.isButtonDisabled = false;
      }, 1500);
    },
    //***********【3-3表单区】处理人过滤
    remoteMethod(query) {
      if (query !== "") {
        // 使用setTimeout模拟异步请求
        setTimeout(() => {
          this.unitOptions = this.unitPersonList.filter((item) => {
            // 检查拼音是否包含查询的字符串
            return (
              item.pinyin.toLowerCase().includes(query.toLowerCase()) ||
              item.personname.toLowerCase().includes(query.toLowerCase())
            );
          });
        }, 100);
      } else {
        this.unitOptions = [];
      }
    },  
    //***********【3-3表单区】转部门选转接人
    chanUnit(value) {
      personList({ unitid: value }).then((response) => {
        this.personlist = response.data;
      });
    }, 
    //***********【3-4表单区】上传文件删除
    handleRemove(file) {
      this.fileList.splice(this.fileList.indexOf(file), 1);
    },
    //***********【3-4表单区】上传文件前判断
    beforeUpload(file) {
      const isLt1M = file.size / 1024 / 1024 < 10;
      if (!isLt1M) {
        this.$message.error("上传文件大小不能超过10MB!");
      }
      return isLt1M;
    },
    //***********【3-4表单区】覆盖默认的上传行为
    requestUpload(imageData) {
      const file = imageData.file;
      const formData = new FormData();
      formData.append("file", file);
      uploadFile(formData).then((response) => {
        if (response.code == 200) {
          const name = file.name;
          this.fileList.push({
            url: serverUrl + response.fileName,
            name: name,
          });
          var pics = [];
          this.fileList.forEach((ele) => {
            pics.push(ele.url + "::" + ele.name);
          });
          this.form.enclosure = pics.join(",");
        } else {
          this.$message.error(response.msg);
        }
      }).catch(() => {});
    },
    //***********【3-4表单区】点击文件预览或下载
    onPreview(file) {
      window.open(file.url, "_blank");
    },
    //***********【3-5表单区】取消按钮
    dialogone() {
      this.open = false;
      // this.zjopen = false;
      this.reset();
    },       

  // transmitForm(row) {
  //     this.reset();
  //     this.fileList = [];
  //     const id = row.id || this.ids;
  //     getRec(id).then((response) => {
  //       this.form = response.data;
  //       if (this.form.enclosure != null && this.form.enclosure != "") {
  //         var urlList = this.form.enclosure.split(",");
  //         urlList.forEach((url) => {
  //           var file = url.split("::");
  //           this.fileList.push({ url: file[0], name: file[1] });
  //         });
  //       }
  //       this.zjopen = true;
  //       this.form.tel = row.tel;
  //       this.title = "转单详情";
  //     });
  //   },
  //   modifytran() {
  //     if (this.form.orderstatus == 2) {
  //       this.msgError("请先自行处理问题！");
  //       return;
  //     } else if (this.form.orderstatus > 5) {
  //       this.msgError("已转交服务商，请勿重复提交！");
  //       return;
  //     } else {
  //       this.$refs["form"].validate((valid) => {
  //         if (valid) {
  //           if (this.form.id != null) {
  //             deLiver(this.form).then((response) => {
  //               if(response.code==200){
  //                 this.msgSuccess("转交成功");
  //                 this.open = false;
  //                 this.zjopen = false;
  //                 this.getList();
  //               }else{
  //                 this.msgError(response.message);
  //               }
  //             }).catch((error)=>{});
  //           }
  //           this.fileList = [];
  //         }
  //       });
  //     }
  //   },    
  //   modifyForm() {
  //     if (this.servicetype == 1) {
  //       if (this.form.servicetype != null) {
  //         this.form.servicetype = Number(this.form.servicetype);
  //       }
  //     } else {
  //       if (this.form.servicetype != null || this.form.processing == null) {
  //         if (this.servicetype == 0) {
  //           this.form.servicetype = Number(this.form.servicetype);
  //         } else {
  //           let servicetypee = this.serviceclassOptions.find(
  //             (item) => item.dictLabel === this.form.servicetype
  //           )?.dictValue;
  //           this.form.servicetype = Number(servicetypee);
  //           this.form.processing = Number(this.form.processing);
  //         }
  //       }
  //     }
  //     if (this.processing == 1) {
  //       if (this.form.processing != null) {
  //         this.form.processing = Number(this.form.processing);
  //       }
  //     } else {
  //       if (this.form.servicetype == null || this.form.processing != null) {
  //         if (this.processing == 0) {
  //           this.form.processing = Number(this.form.processing);
  //         } else {
  //           let serverityy = this.servicetypeOptions.find(
  //             (item) => item.dictLabel === this.form.processing
  //           )?.dictValue;
  //           this.form.processing = Number(serverityy);
  //           this.form.servicetype = Number(this.form.servicetype);
  //         }
  //       }
  //     }
  //     this.$refs["form"].validate((valid) => {
  //       this.form.desiretime = parseTime( this.form.desiretime, "{y}-{m}-{d} {h}:{i}:{s}" );
  //       this.form.createAt = parseTime( this.form.createAt, "{y}-{m}-{d} {h}:{i}:{s}" );
  //       if (valid) {
  //         if (this.form.id != null) {
  //           gdUpdata(this.form).then((response) => {
  //             if (response.code==200){
  //               this.msgSuccess("修改成功");
  //               this.open = false;
  //               this.getList();
  //             }else{
  //               this.msgError(response.msg);
  //             }
  //           }).catch(() => { });
  //         }
  //         this.fileList = [];
  //       }
  //     });
  //   },    

    // /** 删除按钮操作 */
    // handleDelete(row) {
    //   const ids = row.id || this.ids;
    //   this.$confirm(
    //     '是否确认删除【请填写功能名称】编号为"' + ids + '"的数据项?',
    //     "警告",
    //     {
    //       confirmButtonText: "确定",
    //       cancelButtonText: "取消",
    //       type: "warning",
    //     }
    //   )
    //     .then(function () {
    //       return delRec(ids);
    //     })
    //     .then(() => {
    //       this.getList();
    //       this.msgSuccess("删除成功");
    //     })
    //     .catch(() => {});
    // },
  },
};
</script>
<style scoped lang="scss">
.app-container {
  overflow: hidden;
  .contain-top {
    // height: 90px;
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

.gdjb {
  height: 500px;
  width: 450px;
  border: 1px solid white;
  position: absolute;
  top: 0px;
  left: 500px;
}
/* 整体滚动条样式 */
::-webkit-scrollbar {
    width: 12px; /* 设置滚动条的宽度 */
}

/* 滚动轨迹样式 */
::-webkit-scrollbar-track {
    background: #f1f1f1; /* 设置滚动轨迹的背景颜色 */
}

/* 滚动滑块样式 */
::-webkit-scrollbar-thumb {
    background: #888; /* 设置滚动滑块的背景颜色 */
}

/* 当鼠标悬停在滚动滑块上时的样式 */
::-webkit-scrollbar-thumb:hover {
    background: #555; /* 设置鼠标悬停时滚动滑块的背景颜色 */
}
.material-tabs {
  height: 100%;
  overflow-y: scroll;
  .el-tabs__header {
    margin: 0;
    border: none;
  }
  .el-tabs__content {
    height: calc(80% - 40px);
    border: 1px solid #dae0e6 !important;
    border-radius: 0 8px 8px 8px;
    background: #fff;
    .el-tab-pane {
      height: calc(80% - 40px);
      overflow-y: auto;
    }
  }
  .tabItem {
    padding: 10px;
    .el-timeline-item:nth-of-type(1) {
      // font-size: 29px;
      .el-timeline-item__node {
        .el-timeline-item__icon {
          font-size: 22px;
          background-color: #007fff !important;
          border-radius: 50%;
        }
      }
    }
  }
}
::v-deep .el-table .warning-row {
  background: #ffece6;
}
::v-deep .el-table .success-row {
  background: #f0f9eb;
}

.widthClass {
  width:200px;
}

</style>
