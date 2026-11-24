<template>
  <div class="app-container">
    <div class="contain-top">
      <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px">
        <el-form-item label="合同名称" prop="contractName">
          <el-input v-model="queryParams.contractName"  placeholder="请输入合同名称" clearable size="small"  class="widthClass"
            @keyup.enter.native="handleQuery"  />
        </el-form-item>
        <el-form-item label="甲方名称" prop="j_orgname">
          <el-input v-model="queryParams.j_orgname"     placeholder="请输入甲方名称" clearable size="small"  class="widthClass"/>
        </el-form-item>   
        <el-form-item label="关联医院" prop="orgName">
          <el-input v-model="queryParams.orgName"       placeholder="请输入医院名称" clearable size="small" class="widthClass"/>
        </el-form-item> 
        <el-form-item label="乙方名称" prop="y_orgname">
          <el-input v-model="queryParams.y_orgname"     placeholder="请输入乙方名称" clearable size="small"  class="widthClass"/>
        </el-form-item>          
        <el-form-item label="合同主题" prop="contractSubject">
          <el-select v-model="queryParams.contractSubject"  placeholder="请选择合同主题" filterable class="widthClass" >
            <el-option v-for="dict in contractList" :key="dict.dictValue" :label="dict.dictLabel"
              :value="dict.dictValue">
            </el-option>
          </el-select>
        </el-form-item> 
        <el-form-item label="合同类型" prop="contractType">
          <el-select v-model="queryParams.contractType"     placeholder="请选择合同类型" filterable class="widthClass">
            <el-option 
              v-for="item in contractTypeList" 
              :key="item.dictValue" 
              :label="item.dictLabel"
              :value="item.dictValue">
            </el-option>
          </el-select>
        </el-form-item>                            
        <el-form-item label="开票" prop="isInvoice">
          <el-select v-model="queryParams.isInvoice"        placeholder="请选择" filterable class="widthClass">
            <el-option 
              v-for="item in isContractBackList" 
              :key="item.label" 
              :label="item.value"
              :value="item.label">
            </el-option>
          </el-select>
        </el-form-item> 
        <el-form-item label="结项" prop="isOver">
          <el-select v-model="queryParams.isOver"           placeholder="请选择" filterable class="widthClass">
            <el-option v-for="item in isContractBackList" :key="item.label" :label="item.value"
              :value="item.label">
            </el-option>
          </el-select>
        </el-form-item>         
        <el-form-item label="开始时间" prop="dateStart">
          <el-date-picker v-model="dateStart" placeholder="选择日期" type="date" class="widthClass">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间" prop="dateEnd">
          <el-date-picker v-model="dateEnd"   placeholder="选择日期" type="date" class="widthClass">
          </el-date-picker>
        </el-form-item> 
        <el-form-item>
          <el-button icon="el-icon-search"  size="mini" @click="handleQuery" type="primary" >搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      <!--操作按钮-->
      <div style="margin-top:10px;" >
        <el-row :gutter="10">         
          <el-col :span="1.5">
            <el-button type="warning" plain icon="el-icon-download" size="mini" :loading="exportLoading"  @click="handleExport" v-hasPermi="['contractM:contract:export']" >
              导出
            </el-button>
          </el-col>
        </el-row>
      </div>      
    </div>
    <div class="contain-cont" style="margin-top:10px;">
      <el-table table-cloumn v-loading="loading" element-loading-text="拼命加载中" :data="recList"
        @selection-change="handleSelectionChange" :row-class-name="tableRowClassName" height="calc(100% - 50px)" border>
        <el-table-column type="selection" width="50px" align="center" />
        <el-table-column label="合同名称" prop="contractName"      width="300px" align="center"  :show-overflow-tooltip="true" fixed/>
        <el-table-column label="合同主题" prop="contractSubject"   width="110px" align="center"  :show-overflow-tooltip="true" />
        <el-table-column label="合同类型" prop="contractType"      width="110px" align="center"  :show-overflow-tooltip="true" >
          <template #default="{ row }">
            {{ row.contractType === 1 ? '进项' : row.contractType === 2 ? '销项' : row.contractType }}
          </template>
        </el-table-column>
        <!-- <el-table-column label="流转状态" width="180px" align="center">
          <template slot-scope="scope">
            <span :style="{color:scope.row.reviewStatus==1||scope.row.reviewStatus==3?'red':(scope.row.reviewStatus==4?'green':'blue')}">
              {{scope.row.reviewStatusDes}}
            </span>
          </template>
        </el-table-column> -->
        <el-table-column label="甲方名称" prop="j_orgname"          width="220px" align="center" :show-overflow-tooltip="true" />
        <el-table-column label="关联医院" prop="orgName"            width="220px" align="center" :show-overflow-tooltip="true" />
        <el-table-column label="乙方名称" prop="y_orgname"          width="220px" align="center" :show-overflow-tooltip="true" />
        <el-table-column label="合同金额(元)" prop="contractAmount" width="130px" align="center" />
        <el-table-column label="开票金额(元)" prop="invoiceAmount"  width="130px" align="center" />
        <el-table-column label="回款金额(元)" prop="payAmount"      width="130px" align="center" />
        <el-table-column label="未开票金额(元)" prop="unInvoiceAmount"  width="130px" align="center" />
        <el-table-column label="开票未回款(元)" prop="unPayAmount"  width="130px" align="center" />
        <el-table-column label="合同未回款(元)" prop="contractRestAmount"      width="130px" align="center" />
        <el-table-column label="签订人员" prop="signatory"          width="150px" align="center" />
        <el-table-column label="签订日期" prop="contractSignDate"   width="180px" align="center" sortable/>
        <el-table-column label="是否开票" prop="isInvoice"          width="90px"  align="center"  >
          <template #default="{ row }">
            {{ row.isInvoice === "1" ? '是' : row.isInvoice === "0" ? '否' : row.isInvoice }}
          </template>
        </el-table-column>
        <el-table-column label="是否结项" prop="isOver"             width="90px"  align="center" >
          <template #default="{ row }">
            {{ row.isOver === "1" ? '是' : row.isOver === "0" ? '否' : row.isOver }}
          </template>
        </el-table-column>        
        <el-table-column label="操作" fixed="right" align="center" width="320px" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button size="mini" type="text" icon="el-icon-plus" @click="handleAdd(scope.row.id)"
              v-hasPermi="['contractM:contract:addQrCode']">发票</el-button>
            <el-button size="mini" type="text" icon="el-icon-edit" @click="handleContractEdit(scope.row)"
              v-hasPermi="['contractM:contract:update']">合同</el-button>              
            <el-button size="mini" type="text" icon="el-icon-tickets" @click="handleContract(scope.row)"
              >合同详情</el-button>
            <el-button size="mini" type="text" icon="el-icon-tickets" @click="handInvoice(scope.row.id)"
              v-hasPermi="['contractM:contract:detail']">发票详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
        @pagination="getList" />

      <el-dialog :title="title" :visible.sync="contractdialog" width="55%" append-to-body :close-on-click-modal="false">
        <el-form ref="form" :model="form" :rules="rules" label-width="80px" style="margin-left:6%;">
          <el-row>
            <el-col :span="12">
              <el-form-item label="合同名称" prop="contractName">
                <el-input v-model="form.contractName" placeholder="请输入合同名称" style="width: 78%" disabled></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="合同主题" prop="contractSubject">
                <el-select v-model="form.contractSubject" filterable placeholder="请选择合同主题" style="width: 78%" disabled>
                  <el-option v-for="dict in contractList" :key="dict.dictValue" :label="dict.dictLabel"
                    :value="dict.dictValue"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="合同金额" prop="contractAmount">
                <el-input v-model="form.contractAmount" placeholder="请输入合同金额" style="width: 78%" disabled></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="甲方名称" prop="j_orgname">
                <el-input v-model="form.j_orgname"  placeholder="请输入甲方名称" style="width: 78%" disabled/>
              </el-form-item>
            </el-col> 
            <el-col :span="12">
              <el-form-item label="关联医院" prop="orgName">
                <el-select  v-model="form.orgName"  placeholder="请选择关联医院" style="width: 78%" disabled
                  filterable :remote-method="remoteOrg" remote clearable>
                  <el-option 
                    v-for="dict in orgOptions" 
                    :key="dict.orgid" 
                    :label="dict.orgname"
                    :value="dict.orgid"></el-option>
                </el-select>
              </el-form-item>
            </el-col>    
          </el-row>          
          <el-row>
            <el-col :span="12">
              <el-form-item label="乙方名称" prop="y_orgname">
                <el-input v-model="form.y_orgname" placeholder="请输入乙方名称" style="width: 78%" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="合同类型" prop="contractType">
                <el-radio-group v-model="form.contractType" style="width: 78%">
                  <el-radio v-for="item in contractTypeList" :key="item.dictValue" :label="item.dictLabel" :value="item.dictValue" disabled>
                  </el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="签订人员" prop="signatory">
                <el-input v-model="form.signatory" placeholder="请输入签订人员" style="width: 78%" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="签订日期" prop="contractSignDate">
                <el-date-picker v-model="form.contractSignDate" placeholder="请选择签订日期"  style="width: 78%" disabled type="datetime" >
                </el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="邮寄人" prop="postPerson">
                <el-input v-model="form.postPerson" placeholder="请输入邮寄人" style="width: 78%"  disabled/>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="邮寄日期" prop="postDate">
                <el-date-picker v-model="form.postDate" type="datetime" placeholder="请选择邮寄日期" style="width: 78%" disabled>
                </el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="合同收回" prop="isBack">
                <el-radio-group v-model="form.isBack" style="width: 78%">
                  <el-radio v-for="item in isContractBackList" :key="item.label" :label="item.value" :value="item.label" disabled>
                  </el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="快递单号" prop="postNum">
                <el-input v-model="form.postNum" placeholder="请输入快递单号"  style="width: 78%"  disabled/>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="是否开票" prop="isInvoice">
                <el-radio-group v-model="form.isInvoice" style="width: 78%">
                  <el-radio v-for="item in isContractBackList" :key="item.label" :label="item.value" :value="item.label">
                  </el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="是否结项" prop="isOver">
                <el-radio-group v-model="form.isOver" style="width: 78%">
                  <el-radio v-for="item in isContractBackList" :key="item.label" :label="item.value" :value="item.label">
                  </el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col>
              <el-form-item label="合同内容" prop="content">
                <el-input v-model="form.content" placeholder="请输入合同简介" type="textarea" style="width:90%;" autosize disabled/>
              </el-form-item>
            </el-col>
          </el-row>                      
           <el-row>
            <el-col :span="12">
              <el-form-item label="合同附件" prop="enclosure">
                <el-upload  action="#" :file-list="contractFileList" :on-preview="onPreview" class="file-upload" style="width: 78%">
                  <el-button size="mini" type="primary" disabled>点击上传</el-button>
                </el-upload>
                <!-- <el-input style="width: 220px" v-model="form.enclosure" placeholder="请上传合同附件"  disabled/> -->
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer" style="margin-right:50px;">
          <el-button @click="contractSubmit" :disabled="isButtonDisabled" v-show="title == '合同修改'" type="primary" >提 交</el-button>
          <el-button @click="dialogone">取 消</el-button>
        </div>
      </el-dialog>

      <el-dialog :title="title" :visible.sync="faPiaoOpen" width="1000px" append-to-body :close-on-click-modal="false">
        <el-form ref="fpForm" :model="fpForm" :rules="invoiceRules" label-width="80px" style="margin-left:6%;">
          <el-row>
            <!-- <el-col :span="12" hidden>
              <el-form-item label="电子发票" prop="qrCode">
                 <el-input style="width: 78%" v-model="fpForm.qrCode" placeholder="请输入发票二维码链接" />
              </el-form-item>
            </el-col>             -->
            <el-col :span="12">
              <el-form-item label="开票日期" prop="qrDate">
                 <el-date-picker v-model="fpForm.qrDate" type="datetime" placeholder="请选择开票日期" style="width: 78%">
                 </el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="开票人" prop="qrPerson">
                <el-input v-model="fpForm.qrPerson" placeholder="请输入开票人" style="width: 78%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="开票金额" prop="invoiceAmount">
                <el-input v-model="fpForm.invoiceAmount" placeholder="请输入开票金额" style="width: 78%" />
              </el-form-item>
            </el-col>
          </el-row>
           <!-- <el-row>  
            <el-col :span="12">
              <el-form-item label="收/付金额" prop="payAmount">
                <el-input style="width: 78%" v-model="fpForm.payAmount" placeholder="请输入收/付款金额" /></el-form-item>
            </el-col>     
            <el-col :span="12">
              <el-form-item label="收/付日期" prop="payDate">
                 <el-date-picker v-model="fpForm.payDate" type="datetime" placeholder="请选择收/付款日期" style="width: 78%">
                </el-date-picker></el-form-item>
            </el-col>
          </el-row> -->
          <el-row>
            <el-col :span="12">
              <el-form-item label="发票上传" prop="enclosure">
                <el-upload action="#"  :http-request="requestUpload"  :before-upload="beforeUpload"
                  :file-list="fileList"
                  :on-preview="onPreview" 
                  :on-remove="handleRemove" 
                  :limit="1" class="file-upload" style="width: 78%" >
                  <el-button size="mini" type="primary" :disabled="isDisabledH">点击上传</el-button>
                </el-upload>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="22">           
              <el-button size="mini" type="primary" icon="el-icon-plus" @click="addPaymentRow">
                回款
              </el-button>
              <el-form>
              <el-table table-cloumn element-loading-text="拼命加载中" :data="paymentList"  border>
                <el-table-column label="回款人"  prop="payPerson"   min-width="20%" align="center" >
                  <template slot-scope="scope">
                    <el-form-item>
                      <el-input v-model="scope.row.payPerson" placeholder="请输入回款人" />
                    </el-form-item>
                  </template>
                </el-table-column>
                <el-table-column label="回款金额" prop="payAmount"  min-width="20%" align="center" >
                  <template slot-scope="scope">
                    <el-form-item>
                      <el-input v-model="scope.row.payAmount" placeholder="请输入回款金额" @blur="checkInputAmount(scope.row)"/>
                    </el-form-item>
                  </template>
                </el-table-column>                  
                <el-table-column label="回款时间" prop="payDate"    min-width="40%" align="center" >
                  <template slot-scope="scope">
                    <el-form-item>
                      <el-date-picker v-model="scope.row.payDate" placeholder="请选择回款日期" type="datetime" >
                      </el-date-picker>   
                    </el-form-item>                 
                  </template>
                </el-table-column>  
                <el-table-column label="操作" min-width="24%" align="center">
                  <template slot-scope="scope">
                    <el-button size="mini" type="text" icon="el-icon-delete" @click="handlePaymentDel(scope.row)">
                      删除
                    </el-button>
                    </template>
                </el-table-column>                                   
              </el-table>
              </el-form>
            </el-col>
          </el-row>         
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="fpSubmitForm(0)" :disabled="isButtonDisabled">提 交</el-button>
          <!-- <el-button type="primary" @click="fpSubmitForm(1)" :disabled="isButtonDisabled">提交审核</el-button> -->
          <el-button @click="dialogone">取 消</el-button>
        </div>
      </el-dialog>

      <el-dialog :title="title" :visible.sync="invoiceDialog" width="60%" append-to-body :close-on-click-modal="false">
          <el-table table-cloumn v-loading="loading" element-loading-text="拼命加载中" :data="invoiceList" height="450px" border>

              <!-- <el-table-column label="发票二维码" min-width="28%" align="center" prop="qrCode" :show-overflow-tooltip="true"/> -->
              <el-table-column label="开票人"   min-width="17%" align="center" prop="qrPerson" />
              <el-table-column label="开票时间" min-width="33%" align="center" prop="qrDate" />
              <el-table-column label="开票金额" min-width="18%" align="center" prop="invoiceAmount" />
              <!-- <el-table-column label="收/付金额" min-width="17%" align="center" prop="payAmount" />
              <el-table-column label="收/付时间" min-width="33%" align="center" prop="payDate" /> -->
              <el-table-column label="回款金额" min-width="17%" align="center" prop="payAmount" />
              <el-table-column label="回款次数" min-width="17%" align="center" prop="payTimes" />
              <el-table-column label="回款差额" min-width="17%" align="center" prop="payAmountRest" />
              <el-table-column label="回款状态" min-width="17%" align="center">
                <template slot-scope="scope">
                  <span :style="{color:scope.row.payAmountRest==0?'green':'red'}">
                    {{scope.row.payAmountRest==0?'已完成':'未完成'}}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="发票文件" min-width="20%" align="center" :show-overflow-tooltip="true">
                <template #default="{ row }">
                  <a :href="row.enclosure==null?'':row.enclosure.split('::')[0]" download="" target="_blank"> {{row.enclosure==null?'':row.enclosure.split('::')[1]}} </a>
                </template>
              </el-table-column>
              <el-table-column label="操作" min-width="24%" align="center" class-name="small-padding fixed-width">
                <template slot-scope="scope">
                  <el-button size="mini" type="text" icon="el-icon-edit" @click="handleInvoiceEdit(scope.row)">
                    修改
                  </el-button>
                  <!-- <el-button size="mini" type="text" icon="el-icon-delete" @click="handleInvoiceDel(scope.row)"
                    >删除</el-button> -->
                  </template>
              </el-table-column>
            </el-table>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import {
  orgHospitallist,
  unitPersonlist,

} from "@/api/order/service/rec";
import {
  getContractInfo,
  list,
  updateContract,
  addQrCode,
  updateQrCode,
  getQrCodeList,
  exportContract
} from "@/api/business/business";

import Editor from "@/components/Editor";
import { parseTime, FunGetDateStr, formatToYYYYMMDDHHMMSS } from "@/utils/zlsoft";
import Treeselect from "@riophae/vue-treeselect";
import { uploadFileOne, serverUrl } from "@/api/common/file";

import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import store from "@/store";
export default {
  name: "Service",
  components: {
    Treeselect,
    Editor,
  },

  data() {
    const  checkInputD = (rule, value, callback)=>{
      const regex = /^\d+(\.\d+)?$/; // 匹配整数或小数
      if (!regex.test(value)) {
        callback(new Error('请输入数字或小数'));
      } else {
        callback();
      }
    }
    return {
      // 弹出层标题
      title: "",
      contractdialog: false,
      total: 0,
      // 显示搜索条件
      showSearch: true,
      // 导出遮罩层
      exportLoading: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        contractName: "",
        contractType: "",
        contractSubject:"",
        j_orgname:"",
        orgName:"",
        isInvoice:"",
        isOver:""
      },
      // 表单参数
      form: {},
      rules: {},
      invoiceRules:{
        qrDate:[{required:true,message:"请选择开票日期",trigger:'blur'}],
        qrPerson:[{required:true,message:"请填写开票人",trigger:'blur'}],
        invoiceAmount:[{required:true,message:"请填写开票金额",trigger:'blur',validator:checkInputD}]
      },
      // paymentRules:{
      //   person:[{required:true,message:"请输入回款人",trigger:'blur'}],
      //   amount:[{required:true,message:"请输入回款金额",trigger:'blur',validator:checkInputD}],
      //   date:[{required:true,message:"请选择回款日期",trigger:'blur'}],
      // },
      dateStart: null,
      dateEnd: null,
      // 遮罩层
      loading: true,
      isShow: true,
      isButton: true,
      isDisabledH: false,
      isDisabledF: false,
      fileList: [],//上传文件列表
      contractFileList:[],//合同文件
      paymentList:[],//回款记录
      statusOptions: [],
      contractList: [],
      orgOptions: [],
      options: [],
      unitPersonList: [],
      unitOptions: [],
      inputs: [{ label: "", qrCode: '', qrDate: '' }],
      baseLabel: "电子发票",
      faPiaoOpen: false,
      fileHash:"",
      //发票
      fpForm:{
        contractId:"",
        qrCode:"",
        qrDate:"",
        qrPerson:"",
        payAmount:"",
        payDate:"",
        invoiceFile:"",
        enclosure:"",
        invoiceAmount:"",
        paymentList:[],
        isSubmitReview:0
      },
      invoiceDialog:false,
      invoiceList:[],
      isButtonDisabled: false,
      contractTypeList:[
        // {
        //   label:1,
        //   value:"进项"
        // },
        // {
        //   label:2,
        //   value:"销项"
        // }        
      ],
      isContractBackList:[
        {
          label:1,
          value:"是"
        },
        {
          label:0,
          value:"否"
        }        
      ]
    };
  },

  created() {
    //合同主题
    this.getDicts("sys_ht_type").then((response) => {
      this.contractList = response.data;
    });

    //合同类型
    this.getDicts("sys_contract_type").then((response) => {
      this.contractTypeList = response.data;
    });

    this.getList();
  },

  methods: {
    //************** 【1-筛选区】查询列表方法 */
     getList() {
      this.loading = true;
      this.recList = []
      list(this.addDateRange(this.queryParams, this.dateRange)).then(
        (response) => {
          this.recList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
    },
    // 表单重置
    reset() {
      this.form = {
        contractName: "",
        orgName: "",
        signatory: "",
        contractSignDate: parseTime(new Date()),
        postPerson: "",
        postDate: parseTime(new Date()),
        contractSubject: "",
        postNum: "",
        isBack: "1",
        y_orgname: "",
        contractType: "",
        contractAmount: "",
        enclosure: "",
      };
      this.resetForm("form");
    },
    //************** 【1-筛选区】 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;

      this.dateRange = [
        this.dateStart==""||this.dateStart==null?"":parseTime(this.dateStart),
        this.dateEnd==""||this.dateEnd==null?"":parseTime(this.dateEnd)
      ];

      this.getList();
    },
    //************** 【1-筛选区】 重置按钮操作 */
    resetQuery() {
      this.dateStart = null
      this.dateEnd = null
      this.resetForm("queryForm");
      this.handleQuery();
    },
    //************** 【1-筛选区】 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },

    tableRowClassName({ row }) {
      if (row.isOver === "0"||row.isOver === 0) {
        return "warning-row";
      }else{
        return "success-row";
      }
    },
    //==============【2-列表区】 新增按钮操作 */
    handleAdd(data) {
      this.reset();
      this.fileList = [];
      this.inputs = [{ label: "", qrCode: '', qrDate: '' }];
      this.fpForm={
        qrCode:"",
        qrDate:"",
        qrPerson:"",
        payAmount:"",
        payDate:"",
        invoiceFile:"",
        contractId:"",
        paymentList:[]
      }
      //添加默认开票人
      if(this.unitPersonList.length>0){
        this.fpForm.qrPerson = this.unitPersonList[0].personname;
      }
      this.fpForm.contractId = data;
      this.paymentList=[];//回款列表
      this.faPiaoOpen = true;
      this.isDisabledH = false;
      this.title = "新增发票";
    },
    //==============【2-列表区】 发票详情
    handInvoice(id) {
      this.reset();
      this.fileList = [];
      this.invoiceList = [];
      getQrCodeList(id).then((response) => {
        this.invoiceList = response.data;
      });
      this.invoiceDialog = true;
      this.title = "发票详情";
    },  
    //==============【2-列表区】合同详情 
    handleContract(row) {
      this.loadFormContractData(row);
      this.contractdialog = true;
      this.title = "合同详情";            
    },
    //==============【2-列表区】合同修改 
    handleContractEdit(row) {
      this.loadFormContractData(row);
      this.contractdialog = true;
      this.title = "合同修改";            
    },  
    //###############【3-表单】修改发票
    handleInvoiceEdit(row){
      this.fpForm = row;
      this.fileList=[];
      if (this.fpForm.enclosure != null && this.fpForm.enclosure != "") {
          var urlList = this.fpForm.enclosure.split(",");
          urlList.forEach((url) => {
            var file = url.split("::");
            this.fileList.push({ url: file[0], name: file[1] });
          });
      }
      this.paymentList = row.paymentList==null?[]:row.paymentList;      
      this.faPiaoOpen = true;
      this.title='发票修改';
    }, 
    //###############【3-表单】 取消按钮
    dialogone() {
      this.contractdialog = false;
      this.faPiaoOpen = false;
      if (this.inputs.qrCode == '' && this.inputs.label == '') {
        this.inputs = [{ label: "", qrCode: '', qrDate: '' }];
      }
      this.reset();
      // this.getList();
    },
    //###############【3-表单】提交发票-回款记录
    fpSubmitForm(val) {
      this.stopDoub();

      this.fpForm.isSubmitReview = val;
      this.fpForm.payDate = this.fpForm.payDate==""?"":parseTime(this.fpForm.payDate);
      this.fpForm.qrDate = this.fpForm.qrDate==""?"":parseTime(this.fpForm.qrDate);

      //判断回款
      if(this.paymentList.length>0){
        if(!this.paymentList.every(item=>item.payAmount&&item.payPerson&&item.payDate)){
          this.msgError("回款记录存在内容为空，请补充填写完整");
          return;
        }
        this.paymentList =  this.paymentList.map(item=>({
          ...item,
          payDate:parseTime(item.payDate)
        }))
        this.fpForm.paymentList = this.paymentList;
      }

      this.$refs["fpForm"].validate((valid) => {
        if (valid) {  
            if(this.fpForm.id){
              updateQrCode(this.fpForm).then((response) => {
                if (response.code == 200) {
                  this.msgSuccess("修改成功");
                  this.faPiaoOpen = false;
                  this.fileList = [];
                  this.reGetInvoiceList(this.fpForm.contractId);
                  this.getList(); 
                } else {
                  this.msgError("修改失败" + response.msg);
                }
              }).catch(() => {});
            }else{
              addQrCode(this.fpForm).then((response) => {
                if (response.code == 200) {
                  this.msgSuccess("新增成功");
                  this.faPiaoOpen = false;
                  this.getList(); 
                } else {
                  this.msgError("新增失败" + response.msg);
                }
              }).catch(() => {});
            }                
        }
      });

    },
    //###############【3-表单】合同修改-提交
    contractSubmit(){
      this.stopDoub();
      
      const contractSubject  = this.contractList.find(item=>item.dictLabel==this.form.contractSubject);
      this.form.contractSubject = contractSubject==null?this.form.contractSubject:contractSubject.dictValue;

      const cType = this.contractTypeList.find(item=>item.dictLabel==this.form.contractType);
      if(cType){
        this.form.contractType = cType.dictValue
      }else{
        this.form.contractType = 2
      }
      
      const isback = this.isContractBackList.find(item=>item.value==this.form.isBack);  
      if(isback){
        this.form.isBack = isback.label
      }else{
        this.form.isBack = 0
      }
      
      const isinv = this.isContractBackList.find(item=>item.value==this.form.isInvoice);
      if(isinv){
        this.form.isInvoice = isinv.label
      }else{
        this.form.isInvoice = 0
      }
      
      const isov = this.isContractBackList.find(item=>item.value==this.form.isOver);    
      if(isov){
        this.form.isOver = isov.label
      }else{
        this.form.isOver = 0
      }      
      
      this.$refs["form"].validate((valid) => {
        if (valid) {
            updateContract(this.form).then((response) => {
              if (response.code == 200) {
                this.form={};
                this.getList();
                this.contractdialog = false;
                this.msgSuccess("修改成功");
              } else {
                this.msgError("修改失败" + response.msg);
              }
            }).catch(() => {});
        }
      });
    },
    //###############【3-表单】禁止双击
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
    //###############【3-表单】删除发票回款信息
    handleInvoiceDel(row){
       this.fpForm = row
       this.fpForm.status=1;
       if(row.id){
         updateQrCode(this.fpForm).then((response) => {
            if (response.code == 200) {
              this.msgSuccess("删除成功");
              this.faPiaoOpen = false;
              this.fileList = [];
              this.getList();
              this.reGetInvoiceList(this.fpForm.contractId);
            } else {
              this.msgError("删除失败" + response.msg);
            }
        }).catch(() => {});       
       }
    },
    //###############【3-表单】添加一行 
    addPaymentRow(){
      this.paymentList.push({
        payPerson:"",
        payDate:"",
        payAmount:""
      })
    },
    //###############【3-表单】删除回款
    handlePaymentDel(row){
      const index = this.paymentList.indexOf(row);
      if(index!==-1){
        this.paymentList.splice(index,1);
      }
    },             
    // dateChange() {
    //   this.dateRange = [
    //     formatToYYYYMMDDHHMMSS(this.dateStart),
    //     formatToYYYYMMDDHHMMSS(this.dateEnd),
    //   ];
    //   if (new Date(this.dateRange[0]) > new Date(this.dateRange[1])) {
    //     return this.$message.error("请选择正确的时间段！");
    //   }
    //   this.selectryqk();
    // },

    handleRemove(file) {
      this.fileList.splice(this.fileList.indexOf(file), 1);
    },
    // 上传文件前判断
    beforeUpload(file) {
      const isLt1M = file.size / 1024 / 1024 < 10;
      if (!isLt1M) {
        this.$message.error("上传文件大小不能超过10MB!");
      }
      return isLt1M;
    },
    // 覆盖默认的上传行为
    requestUpload(imageData) {
      const file = imageData.file;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileHash",this.fileHash);
      formData.append("fileId",this.fpForm.invoiceFile)

      uploadFileOne(formData).then((response) => {
        this.fileHash = response.fileHash;
        this.fpForm.invoiceFile = response.fileId;
        if (response.code == 200) {
          const name = file.name;
          this.fileList.push({
            url: serverUrl + response.fileName,
            name: name,
          });
          this.$message.success("上传成功！");
        } else {
          this.$message.error(response.msg);
        }
      }).catch(() => {});
    },
    //点击文件预览或下载
    onPreview(file) {
      window.open(file.url, "_blank");
    },
    //获取发票信息
    reGetInvoiceList(contractId){
        getQrCodeList(contractId).then((response) => {
          this.invoiceList = response.data;
        });
    },
    //加载合同信息 
    loadFormContractData(row){
          this.reset();
          this.form={};
          this.contractFileList=[];

          //深拷贝，防止影响源数据
          this.form =JSON.parse(JSON.stringify(row));

          const isback =this.isContractBackList.find(item=>item.label== row.isBack);
          if(isback){
            this.form.isBack = isback.value;
          }else{
            this.form.isBack = "否";
          }
          const contype =this.contractTypeList.find(item=>item.dictValue== row.contractType);
          if(contype){
            this.form.contractType = contype.dictLabel;
          }else{
            this.form.contractType = null;
          }
          const isinv =this.isContractBackList.find(item=>item.label== row.isInvoice);
          if(isinv){
            this.form.isInvoice = isinv.value;
          }else{
            this.form.isInvoice = "否";
          }
          const isov =this.isContractBackList.find(item=>item.label== row.isOver);
          if(isov){
            this.form.isOver = isov.value;
          }else{
            this.form.isOver = "否";
          }

          if (this.form.enclosure != null && this.form.enclosure != "") {
            var urlList = this.form.enclosure.split(",");
            urlList.forEach((url) => {
              var file = url.split("::");
              this.contractFileList.push({ url: file[0], name: file[1] });
            });
          } 
          
          if (this.form.contractType == '1') {
            this.isShow = false
          } else {
            this.isShow = true
          }
    },

    remoteOrg(query) {
      if (query !== "") {
        setTimeout(() => {
          this.orgOptions = this.options.filter((item) => {
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
    // remoteMethod(query) {
    //   this.loading = false
    //   if (query !== "") {
    //     setTimeout(() => {
    //       this.unitOptions = this.unitPersonList.filter((item) => {
    //         return (
    //           item.pinyin.toLowerCase().includes(query.toLowerCase()) ||
    //           item.personname.toLowerCase().includes(query.toLowerCase())
    //         );
    //       });
    //     }, 100);
    //   } else {
    //     this.unitOptions = [];
    //   }
    // },
    // async copyInputValue(event) {
    //   try {
    //     const input = event.target.querySelector('input');
    //     await navigator.clipboard.writeText(input.value);
    //     this.$message.success('已复制到剪贴板');
    //   } catch (err) {
    //     this.$message.error('复制失败');
    //   }
    // },
    // downloadFile(url){
    //   if(url){
    //     window.open(url);
    //   }
    // },
    checkInputAmount(row){
      const regex = /^\d+(\.\d+)?$/; // 匹配整数或小数
      if (!regex.test(row.payAmount)) {
        this.msgError("请输入正确的金额数字");
        row.payAmount="";
      }
    },
    //点击文件预览或下载
    onPreview(file) {
      window.open(file.url, "_blank");
    },
    //=============【2-列表区】 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm("是否确认导出数据?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.exportLoading = true;
          return exportContract(queryParams);
        })
        .then((response) => {
          this.download(response.msg);
          this.exportLoading = false;
        })
        .catch(() => { });
    },

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
  width: 12px;
  /* 设置滚动条的宽度 */
}

/* 滚动轨迹样式 */
::-webkit-scrollbar-track {
  background: #f1f1f1;
  /* 设置滚动轨迹的背景颜色 */
}

/* 滚动滑块样式 */
::-webkit-scrollbar-thumb {
  background: #888;
  /* 设置滚动滑块的背景颜色 */
}

/* 当鼠标悬停在滚动滑块上时的样式 */
::-webkit-scrollbar-thumb:hover {
  background: #555;
  /* 设置鼠标悬停时滚动滑块的背景颜色 */
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
