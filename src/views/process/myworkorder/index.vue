<template>
  <div class="app-container">
    <div class="contain-top">
      <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
        <el-form-item label="服务单号" prop="id">
          <el-input v-model="queryParams.id" placeholder="请输入服务单号" clearable size="small" @keyup.enter.native="handleQuery" class="widthClass" />
        </el-form-item>
        <el-form-item label="工单状态" prop="orderstatus">
          <el-select  v-model="queryParams.orderstatus" placeholder="请选择工单状态 " clearable size="small">
            <el-option 
                v-for="rce in statusOptions" 
                :key="rce.dictValue" 
                :label="rce.dictLabel" 
                :value="rce.dictValue" 
                class="widthClass" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间" prop="dateStart">
          <el-date-picker v-model="dateStart" placeholder="选择日期" type="datetime"  @change="dateChange" class="widthClass" ></el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间" prop="dateEnd">
          <el-date-picker  v-model="dateEnd"  placeholder="选择日期" type="datetime"  @change="dateChange"  class="widthClass" ></el-date-picker>
        </el-form-item>
        <el-form-item label="联系人员" prop="contacts">
          <el-input  v-model="queryParams.contacts"  placeholder="请输入联系人员" size="small" clearable @keyup.enter.native="handleQuery" class="widthClass" />
        </el-form-item>
        <el-form-item>
          <el-button icon="el-icon-search" size="mini"  @click="handleQuery" type="primary" >搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      <div>
      <el-row :gutter="10">
        <el-col :span="1.5">
          <el-button type="primary" size="mini" icon="el-icon-plus" plain  @click="handleAdd"  v-hasPermi="['system:rec:add']" >新增工单</el-button>
        </el-col>
        <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" ></right-toolbar>
      </el-row>
    </div>
    <br>
    </div>
    <div class="contain-cont">
      <el-table :data="recList" @selection-change="handleSelectionChange" v-loading="loading" :row-class-name="tableRowClassName"
        table-cloumn element-loading-text="拼命加载中"  height="calc(100% - 50px)" border 
      >
        <el-table-column type="selection" width="50px" align="center" />
        <el-table-column prop="id"        label="服务单号"     width="120px"  align="center"     :show-overflow-tooltip="true"  fixed />    
        <el-table-column prop="title"     label="问题概述"     width="170px"  align="center"     :show-overflow-tooltip="true" />
        <el-table-column prop="describe"  label="服务详细描述" width="420px"  align="center"     :show-overflow-tooltip="true"  />
        <el-table-column prop="orgname"   label="申请医院"     width="150px"  align="center"    :show-overflow-tooltip="true"  />
        <el-table-column prop="unitname"  label="申请科室"     width="100%"   align="center"    :show-overflow-tooltip="true" />
        <el-table-column prop="contacts"  label="联系人员"     width="100%"   align="center" />
        <el-table-column prop="tel"       label="联系电话"     width="110px"  align="center" />
        <!-- <el-table-column prop="qqnum" label="QQ号码" width="110px" align="center" />    -->
        <el-table-column prop="createAt"    label="申请时间"   width="155px"  align="center" />
        <el-table-column prop="desiretime"  label="期望时间"   width="155px"  align="center" />
        <el-table-column prop="arrangetime" label="安排时间"   width="155px"  align="center" />
        <el-table-column prop="currentusername" label="处理人" width="160px"  align="center" />       
        <el-table-column prop="orderstatus" label="工单状态"   width="100%"   align="center" />       
        <el-table-column label="操作" align="center" width="320px" fixed="right" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button size="mini" type="text" icon="el-icon-tickets"  @click="showDetail(scope.row)" v-hasPermi="['system:rec:query']">详情</el-button>
            <el-button size="mini" type="text" icon="el-icon-warning-outline" @click="handlestop(scope.row)" v-hasPermi="['system:rec:over']"
              v-if="showBtn(scope.row,'终止')">终止</el-button>
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

      <!-- 终止对话框 -->
      <el-dialog  :title="title"  :visible.sync="open"  width="1000px"  append-to-body  :close-on-click-modal="false" >
        <el-form ref="form" :model="form" :rules="ruless" label-width="80px">
          <el-row>
            <el-col :span="12">
              <el-form-item label="联系人员" prop="contacts">
                <el-input v-model="form.contacts" placeholder="请输入联系人员" style="width: 220px"  disabled ></el-input>
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
                <el-input v-model="form.unitname" placeholder="请输入内容"    style="width: 220px"  disabled ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="申请时间" prop="createAt">
                <el-date-picker v-model="form.createAt" placeholder="选择申请时间" type="datetime" size="small"  disabled >
                </el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="8">
              <el-form-item label="处理人" prop="currentuserid">
                <el-select v-model="form.currentuserid" placeholder="请选择处理人" style="width: 220px" filterable >
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
                <el-select v-model="form.processing"  placeholder="请选择处理方式">
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
                <el-input  v-model="form.title" placeholder="请输入内容" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="终止原因" prop="stopter">
                <el-input v-model="form.stopter" placeholder="请输入发生终止原因" style="width: 380px" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="问题描述" prop="describe">
                <el-input v-model="form.describe" placeholder="请输入内容" type="textarea"  :rows="6" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="处理方法" prop="disposal">
                <el-input v-model="form.disposal" placeholder="请输入处理方法" type="textarea" style="width: 380px" :rows="6"/>
              </el-form-item>
            </el-col>
            <!-- <el-col :span="12" v-show="zjshow">
              <el-form-item label="转交部门" prop="currentunitid">
                <el-select v-model="form.currentunitid" placeholder="请选择转交部门" style="width: 380px">
                  <el-option
                    v-for="dict in deptList"
                    :key="dict.id"
                    :label="dict.name"
                    :value="dict.id"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col> -->
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
                  :before-upload="beforeUpload"
                >
                  <el-button size="mini" type="primary">点击上传</el-button>
                </el-upload>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <!-- <el-button v-show="zjshow"  type="warning" @click="zjsmitForm">转 交</el-button>
          <el-button v-show="bzjshow" type="success" @click="orderDoForm">派 单</el-button> -->
          <el-button v-show="stopshow" type="danger" @click="stopForm" :disabled="isButtonDisabled" >终 止</el-button>
          <el-button @click="dialogone">取 消</el-button>
        </div>
      </el-dialog>

      <!-- 新增工单对话框 -->
      <el-dialog  :title="title"  :visible.sync="staffopen"  width="1000px"  append-to-body  :close-on-click-modal="false">
        <el-form ref="form" :model="form" :rules="rules" label-width="80px">
          <el-row>
            <el-col :span="12">
              <el-form-item label="申请时间" prop="createAt">
                <el-date-picker v-model="form.createAt"  placeholder="选择申请时间" type="datetime" size="small" clearable></el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="期望时间" prop="desiretime">
                <el-date-picker v-model="form.desiretime" placeholder="期望解决时间" type="datetime" size="small" ></el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="申请科室" prop="unitname">
                <el-input v-model="form.unitname" placeholder="请输入内容" style="width: 220px" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系人员" prop="contacts">
                <el-input v-model="form.contacts" placeholder="请输入内容" style="width: 220px"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="8">
              <el-form-item label="联系电话" prop="tel">
                <el-input v-model="form.tel" placeholder="请输入科室电话" style="width: 220px"/>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="QQ号码" prop="qqnum">
                <el-input v-model="form.qqnum" placeholder="请输入QQ号" style="width: 200px"/>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="问题范围" prop="scopetype">
                <el-select  v-model="form.scopetype" placeholder="问题范围" size="small" style="width: 200px" clearable>
                  <el-option
                    v-for="dict in severityOptions"
                    :key="dict.dictValue"
                    :label="dict.dictLabel"
                    :value="dict.dictValue"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="8">
              <el-form-item label="问题概述" prop="title">
                <el-input v-model="form.title" placeholder="请输入20字左右问题概述" maxlength="20" style="width: 220px" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="产品名称" prop="icationid">
                <el-select  v-model="form.icationid"  placeholder="产品名称" @change="changModu" size="small" style="width: 200px" clearable >
                  <el-option
                    v-for="dict in icamodList"
                    :key="dict.icationid"
                    :label="dict.productname"
                    :value="dict.icationid"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="模块名称" prop="moduleid">
                <el-select v-model="form.moduleid" placeholder="模块名称" @change="validateNumeric"  style="width: 200px" filterable allow-create default-first-option >
                  <el-option
                    v-for="dict in modList"
                    :key="dict.modid"
                    :label="dict.modname"
                    :value="dict.modid"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-form-item label="详细描述" prop="describe">
              <editor v-model="form.describe" :min-height="198" style="width: 840px"/>
            </el-form-item>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="附件" prop="enclosure">
                <el-upload action="#" :http-request="requestUpload" :before-upload="beforeUpload" :on-remove="handleRemove" :file-list="fileList" :on-preview="onPreview"   
                  class="file-upload" style="width: 62%" multiple >
                  <el-button size="mini" type="primary">点击上传</el-button>
                </el-upload>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="submitForm"  :disabled="isButtonDisabled" type="primary" >确 定</el-button>
          <el-button @click="dialogone1">取 消</el-button>
        </div>
      </el-dialog>

      <!-- 添加或修改【请填写功能名称】对话框 -->
      <el-dialog  :title="title" :visible.sync="detileopen" width="1000px"  append-to-body :close-on-click-modal="false">
        <div>
          <div>
            <el-form ref="form" :model="form" :rules="ruless" label-width="80px">
              <el-row>
                <el-col :span="6">
                  <el-form-item label="联系人员" prop="contacts">
                    <el-input v-model="form.contacts"  placeholder="请输入联系人员" style="width: 143px"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="联系电话" prop="tel">
                    <el-input v-model="form.tel" placeholder="请输入联系电话" style="width: 143px"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="6">
                  <el-form-item label="申请科室" prop="unitname">
                    <el-input v-model="form.unitname" placeholder="请输入内容" style="width: 143px"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="处理人" prop="currentusername">
                    <el-input v-model="form.currentusername" placeholder="请输入处理人" style="width: 143px" filterable />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <el-form-item label="申请时间" prop="createAt">
                    <el-date-picker v-model="form.createAt" placeholder="选择申请时间"  size="small"  type="datetime">
                    </el-date-picker>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="6">
                  <el-form-item label="问题概述" prop="title">
                    <el-input v-model="form.title"  style="width: 383px" filterable />
                  </el-form-item>
                </el-col>
                <el-col>
                  <el-form-item label="问题描述" prop="describe">
                    <el-input v-model="form.describe" placeholder="请输入内容" type="textarea" style="width: 383px" :rows="8" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="附件" prop="enclosure">
                    <el-upload action="#" :http-request="requestUpload" :before-upload="beforeUpload"
                      class="file-upload"
                      style="width: 62%"  
                      :on-remove="handleRemove"
                      :file-list="fileList"                      
                      :on-preview="onPreview"                      
                      multiple
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

      <!-- <el-dialog :title="title" :visible.sync="zjopen" width="1000px" append-to-body :close-on-click-modal="false">
        <el-form ref="form" :model="form" :rules="rulesss" label-width="80px">
          <el-row>
            <el-col :span="12">
              <el-form-item label="联系人员" prop="contacts">
                <el-input v-model="form.contacts" placeholder="请输入联系人员" style="width: 193px" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系电话" prop="tel">
                <el-input v-model="form.tel" placeholder="请输入联系电话" style="width: 193px"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="申请科室" prop="unitname">
                <el-input v-model="form.unitname" placeholder="请输入内容" style="width: 193px"  disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="申请时间" prop="createAt">
                <el-date-picker v-model="form.createAt" placeholder="选择申请时间" type="datetime"  size="small"  disabled >
                </el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="问题描述" prop="describe">
                <el-input v-model="form.describe" placeholder="请输入内容" type="textarea" style="width: 300px" :rows="4" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="转交原因" prop="disposal">
                <el-input v-model="form.disposal"
                  style="width: 300px" placeholder="请输入内容" type="textarea" :rows="4" clearable />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="附件" prop="enclosure">
                <el-upload action="#" :http-request="requestUpload" :before-upload="beforeUpload"
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
          <el-button @click="modifytran" type="primary" >确 定</el-button>
          <el-button @click="dialogone">取 消</el-button>
        </div>
      </el-dialog> -->
    </div>
  </div>
</template>

<script>
import {
  myworkorderList,
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
  departmenticationList,
  deprtList,
  recordList,
} from "@/api/order/service/rec";
import Editor from "@/components/Editor";
// import { getUserProfile } from "@/api/system/user";

import { getmodList } from "@/api/system/ication";
import { parseTime, FunGetDateStr,formatToYYYYMMDDHHMMSS } from "@/utils/zlsoft";
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
      deptList: [],
      // 遮罩层
      loading: true,   
      // 导出遮罩层
      exportLoading: false,
      // 选中数组
      ids: [],
      // 科室选项
      deptOptions: [],
      // 性别状态字典
      sexOptions: [],
      // 显示搜索条件
      showSearch: true,
      stopshow: false,
      // zjshow: false, //转交按钮、转交部门
      // bzjshow: true, //派单按钮
      dateStart: null,
      dateEnd: null,
      total: 0,
      recList: [],
      fileList: [], //文件上传
      icamodList: [], //产品
      modList: [], //模块
      staffopen: false, //新增工单 对话框
      detileopen: false, //工单详情 对话框   
      statusOptions: [],//工单状态

      severityOptions: [],//问题范围
      disposalList: [], //工单流转记录
      //处理人
      personlist: [],
      servicetypeOptions: [], //处理方式    
      serviceclassOptions: [],//服务分类
      title: "",// 弹出层标题 
      // zjopen: false,//转交对话框
      open: false,
      servicetype: 0,
      processing: 0,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        id: null,
        orderstatus: null,
        contacts: null,
        createByid: store.getters.roles.orgaccount.id,
        currentunitid: null,
        // orgid: store.getters.roles.tbOrgaccount.orgid,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        contacts: [{ required: true, message: "联系人员为空", trigger: "blur" }],
        createAt: [{ required: true, message: "申请时间不能为空", trigger: "blur" }],
        tel: [
          { required: true, message: "联系电话不能为空", trigger: "blur" },
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: "请输入正确的手机号码",
            trigger: "blur",
          },
        ],
        title: [{ required: true, message: "问题概述不能为空", trigger: "blur" }],
        scopetype: [{ required: true, message: "问题范围不能为空", trigger: "blur" } ],
        describe: [{ required: true, message: "服务详细描述不能为空", trigger: "blur" }],
        icationid: [{ required: true, message: "产品名称不能为空", trigger: "blur" }],
      },
      ruless: {
        contacts: [{ required: true, message: "联系人员为空", trigger: "blur" }],
        createAt: [{ required: true, message: "申请时间不能为空", trigger: "blur"}],
        tel: [
          { required: true, message: "联系电话不能为空", trigger: "blur" },
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: "请输入正确的手机号码",
            trigger: "blur",
          },
        ],
        describe: [{ required: true, message: "服务详细描述不能为空", trigger: "blur" }],
      },
      rulesss: {
        disposal: [{ required: true, message: "转交原因不能为空", trigger: "blur" }],
      },
      // show: true,
      isButtonDisabled: false,
      timeoutId: null,
      glshow: store.getters.roles.organizationtype, //0 root,1 管理机构,2 服务商，3 医疗机构
      stopReason:""  //终止原因
    };
  },

  created() {

    this.dateStart = FunGetDateStr(-3) + " " + "00:00:00";
    this.dateEnd = parseTime(new Date().setHours(23, 59, 59, 999));
    this.dateRange = [this.dateStart, this.dateEnd];
    if (this.dateRange) {
      this.getList;
    }
    // unitDept(this.queryParams).then((response) => {
    //   console.log(response);
    //   this.deptList = this.handleTree(response.data, "id");
    //   this.loading = false;

    // });

    //单据状态
    this.getDicts("sys_document_status").then((response) => {
      this.statusOptions = response.data;
    });

    //问题范围
    this.getDicts("sys_info_pre").then((response) => {
      this.severityOptions = response.data;
    });
    //处理方式
    this.getDicts("sys_severity_status").then((response) => {
      this.servicetypeOptions = response.data;
    });
    this.getList();
  },

  methods: {

    //************【1-筛选区】列表查询方法 */
    getList() {
      this.loading = true;
      this.recList = [];
      myworkorderList(this.addDateRange(this.queryParams, this.dateRange)).then(
        (response) => {
          this.recList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
    },
    //************【1-筛选区】搜索按钮 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.dateRange = [
        formatToYYYYMMDDHHMMSS(this.dateStart),
        formatToYYYYMMDDHHMMSS(this.dateEnd),
      ];

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
    //************【1-筛选区】 重置按钮 */
    resetQuery() {
      this.dateStart = null 
      this.dateEnd = null
      this.resetForm("queryForm");
      this.handleQuery();
    }, 
    //************【1-筛选区】 新增按钮 */
    handleAdd() {
      this.reset();
      this.fileList = [];
      this.form.tel = null;
      let tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23);
      tomorrow.setMinutes(59);
      tomorrow.setSeconds(59);
      this.form.desiretime = tomorrow;
      departmenticationList({ unitid: store.getters.roles.unit.id }).then(
        (response) => {
          this.icamodList = response.data;
        }
      );
      this.form.createAt=parseTime(new Date())
      this.form.unitid = store.getters.roles.unit.id;
      if (!store.getters.roles.person.name.includes("管理员")) {
        this.form.contacts = store.getters.roles.person.name;
        this.form.tel = store.getters.roles.person.tel;
      }
      
      this.requesdate();
      this.title = "新增工单";
      this.staffopen = true;
    }, 
    //===========【2-列表区】列表页的终止操作
    handlestop(row) {
      // this.zjshow = false;
      // this.bzjshow = false;
      this.stopshow = true;
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
        this.open = true;
        this.form.tel = row.tel;
        this.form.processing = row.processing;
        this.form.servicetype = row.servicetype;
        this.form.currentusername = row.currentusername;
        this.title = "工单处理详情";
        if (row.servicetype == null || row.servicetype == undefined || row.servicetype == "") {
          this.servicetype = 1;
        }
        if (row.processing == null || row.processing == undefined || row.processing == "") {
          this.processing = 1;
        }
      });
      personList({ unitid: store.getters.roles.unit.id }).then((response) => {
        this.personlist = response.data;
        if (row.orderstatus.includes("服务")) {
          if (row.currentusername != null || row.currentuserid != null) {
            this.personlist = [
              {
                id: row.currentuserid,
                name: row.currentusername,
              },
            ];
          }
        }
      });
    },

    //===========【2-列表区】 查看详情 */
    showDetail(row) {
      this.reset();
      this.fileList = [];
      this.disposalList =[];
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
                
        this.title = "工单详情";
        this.form.tel = row.tel;
        this.stopReason = row.stopter;//终止原因  
        this.detileopen = true;
      });
    },     
    //===========【2-列表区】列表行样式
    tableRowClassName({ row }) {
      if (row.orderstatus === "院内终止" || row.orderstatus === "服务终止") {
        return "warning-row";
      }
      if (row.orderstatus === "院内完成" || row.orderstatus === "服务完成") {
        return "success-row";
      }
      return "";
    },
    //===========【2-列表区】多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
    },
    //###########【3-表单】 提交按钮 */
    submitForm() {
      this.stopDoub();
      this.$refs["form"].validate((valid) => {
        this.form.createAt = parseTime( this.form.createAt, "{y}-{m}-{d} {h}:{i}:{s}");
        this.form.desiretime = parseTime( this.form.desiretime, "{y}-{m}-{d} {h}:{i}:{s}");
        if (valid) {
            addRec(this.form).then((response) => {
              if(response.code==200){
                this.msgSuccess("新增成功");
                // this.open = false;
                this.staffopen = false;
                this.dateRange[0] = FunGetDateStr(-3) + " " + "00:00:00";
                this.dateRange[1] = FunGetDateStr(0) + " " + "23:59:59";
                this.getList();
              }else{
                this.msgError(response.msg);
              }

            }).catch(() => {});
          
          this.fileList = [];
        }
      });
    },
    //###########【3-表单】终止页的终止按钮
    stopForm() {
      this.stopDoub()
      this.$refs["form"].validate((valid) => {
        this.form.desiretime = parseTime( this.form.desiretime, "{y}-{m}-{d} {h}:{i}:{s}");
        this.form.createAt = parseTime( this.form.createAt, "{y}-{m}-{d} {h}:{i}:{s}");
        if (valid) {
          if (this.form.stopter == null || this.form.stopter == undefined || this.form.stopter == "") {
            this.msgError("请填写终止原因！");
            return;
          }
          if ( this.form.servicetype != null && this.form.servicetype != undefined && this.form.servicetype != "") {
            let servicetypee = this.serviceclassOptions.find((item) => item.dictLabel === this.form.servicetype)?.dictValue;
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
                this.msgError(response.msg);
              }  
            }).catch(() => {});
          }
          this.fileList = [];
        }
      });
    },

    //************【1-1筛选区】新增按钮调用 初始化时间
    requesdate() {
      this.form.reqDatetime = new Date();
      this.form.assignDatetime = new Date();
    },
    //************【1-2筛选区】日期选择
    dateChange() {
      if (this.dateRange && this.dateRange.length === 2) {
        const endTime = new Date(this.dateRange[1]);
        endTime.setHours(31, 59, 59, 999);
        const isoString = endTime.toISOString();
        const formattedDate = isoString.replace("T", " ").replace(/\..+/, "");
        this.dateRange[1] = formattedDate;
      }
    },
    //************【1-3筛选区】操作按钮显示 glshow 0:管理员 2:服务商 3:医疗机构
    showBtn(row,btnName){
      if(btnName=="派单"){
        if(((row.orderstatus == '服务分配' ||  row.orderstatus == '服务处理') && this.glshow == '2') ||
           (row.orderstatus == '院内分配' && this.glshow=='3')  || this.glshow == '0'){
              return true;
           }else{
              return false;
           }
      }else if(btnName=="接单"){
        if((row.orderstatus == '服务分配' && this.glshow == '2') ||  
           (row.orderstatus == '院内分配' && this.glshow == '3' )|| this.glshow == '0'){
              return true;
           }else{
              return false;
           }
      }else if(btnName=="终止"){
        if(((row.orderstatus == '院内分配' || row.orderstatus == '院内处理' || row.orderstatus == '问题下单') && this.glshow == '3')||
           (row.orderstatus !== '服务终止' && row.orderstatus !== '服务完成' && this.glshow == '2') || this.glshow == '0'){
              return true;
           }else{
              return false;
           }
      }else if(btnName=="转部门"){
        if( ((row.orderstatus == '院内分配' || row.orderstatus == '问题下单') && this.glshow == '3')||
            (row.orderstatus !== '服务终止' && row.orderstatus !== '服务完成' && this.glshow == '2')|| this.glshow == '0'){
              return true;
          }else{
              return false;
          }
      }
    },    
    //###########【3-1表单】上传文件删除
    handleRemove(file) {
      this.fileList.splice(this.fileList.indexOf(file), 1);
    },
    //###########【3-1表单】上传文件前判断
    beforeUpload(file) {
      const isLt1M = file.size / 1024 / 1024 < 10;
      if (!isLt1M) {
        this.$message.error("上传文件大小不能超过10MB!");
      }
      return isLt1M;
    },
    //###########【3-1表单】覆盖默认的上传行为
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
    //###########【3-1表单】点击文件预览或下载
    onPreview(file) {
      window.open(file.url, "_blank");
    },
    //###########【3-2表单】取消按钮 --终止对话框
    dialogone() {
      this.open = false;
      // this.zjopen = false;
      this.reset();
    },
    //###########【3-3表单】表单重置
    reset() {
      this.form = {
        contacts: null,
        createByid: store.getters.roles.orgaccount.id,
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
        icationid: null,
        moduleid: null,
      };
      this.resetForm("form");
    },
    //###########【3-4表单】根据产品选择模块
    changModu(value) {
      getmodList({ id: value }).then((response) => {
        this.modList = response.data;
      });
    },    
    //###########【3-5表单】取消按钮--新增对话框
    dialogone1() {
      this.staffopen = false;
      this.reset();
    },
    //###########【3-6表单】禁止双击
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
    //###########【3-7表单】输入内容检查    
    validateNumeric(value) {
      if (this.isNumeric(value)) {
        this.$message.error("输入的内容不能为纯数字");
        this.form.moduleid = '';
      }
    },
    //###########【3-8表单】判断是否输入数字
    isNumeric(str) {
      return /^[0-9]+$/.test(str);
    },    
    /** 转换部门数据结构 */
    normalizerDept(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.deptId,
        label: node.deptName,
        children: node.children,
      };
    },
    // /** 派单按钮 */
    // orderDoForm() {
    //   if (  this.form.currentuserid == null && this.form.currentuserid == undefined) {
    //     this.msgError("请填写处理人");
    //     return;
    //   }
    //   this.$refs["form"].validate((valid) => {
    //     this.form.desiretime = parseTime( this.form.desiretime, "{y}-{m}-{d} {h}:{i}:{s}");
    //     this.form.createAt = parseTime( this.form.createAt, "{y}-{m}-{d} {h}:{i}:{s}");
    //     this.form.assignDatetime = parseTime( this.form.assignDatetime, "{y}-{m}-{d} {h}:{i}:{s}");
    //     this.form.reqDatetime = parseTime( this.form.reqDatetime, "{y}-{m}-{d} {h}:{i}:{s}");

    //     if (valid) {
    //       if (this.form.servicetype != null && this.form.servicetype != undefined) {
    //         if (!this.isNumeric(this.form.servicetype)) {
    //           let servicetypee = this.serviceclassOptions.find((item) => item.dictLabel === this.form.servicetype)?.dictValue;
    //           this.form.servicetype = Number(servicetypee);
    //         }
    //       }
    //       if ( this.form.processing != null && this.form.processing != undefined) {
    //         if (!this.isNumeric(this.form.processing)) {
    //           let serverityy = this.servicetypeOptions.find((item) => item.dictLabel === this.form.processing)?.dictValue;
    //           this.form.processing = Number(serverityy);
    //         }
    //       }
    //       orderDo(this.form).then((response) => {
    //         if(response.code==200){
    //           this.msgSuccess("派单成功");
    //           this.open = false;
    //           this.staffopen = false;
    //           this.getList();
    //         }else{
    //           this.msgError(response.msg);
    //         }
    //       }).catch(() => {});
    //       this.fileList = [];
    //     }
    //   });
    // },

    // modifytran() {
    //   if (this.form.orderstatus > 2) {
    //     this.msgError("已转交服务商，请勿重复提交！");
    //   } else {
    //     this.$refs["form"].validate((valid) => {
    //       if (valid) {
    //         if (this.form.id != null) {
    //           deLiver(this.form).then((response) => {
    //             if(response.code==200){
    //               this.msgSuccess("转交成功");
    //               this.open = false;
    //               this.zjopen = false;
    //               this.staffopen = false;
    //               this.getList();
    //             }else{
    //               this.msgError(response.msg);
    //             } 
    //           }).catch(() => {});
    //         }
    //         this.fileList = [];
    //       }
    //     });
    //   }
    // },
    
    // //转交部门
    // zjsmitForm(row) {
    //   this.$refs["form"].validate((valid) => {
    //     this.form.desiretime = parseTime( this.form.desiretime, "{y}-{m}-{d} {h}:{i}:{s}");
    //     this.form.createAt = parseTime( this.form.createAt, "{y}-{m}-{d} {h}:{i}:{s}");
    //     if (valid) {
    //       if ( this.form.currentunitid == null && this.form.currentunitid == undefined ) {
    //         this.msgSuccess("请填写转交部门！");
    //         return;
    //       }
    //       if ( this.form.servicetype != null && this.form.servicetype != undefined ) {
    //         let servicetypee = this.serviceclassOptions.find( (item) => item.dictLabel === this.form.servicetype )?.dictValue;
    //         this.form.servicetype = Number(servicetypee);
    //       }
    //       if ( this.form.processing != null && this.form.processing != undefined) {
    //         let serverityy = this.servicetypeOptions.find( (item) => item.dictLabel === this.form.processing)?.dictValue;
    //         this.form.processing = Number(serverityy);
    //       }
    //       if (this.form.id != null) {
    //         deprtList(this.form).then((response) => {
    //           if(response.code==200){
    //             this.msgSuccess("转交成功");
    //             this.open = false;
    //             this.staffopen = false;
    //             this.getList();
    //           }else{
    //             this.msgError(response.msg);
    //           } 
    //         }).catch(() => {});
    //       }
    //       this.fileList = [];
    //     }
    //   });
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
