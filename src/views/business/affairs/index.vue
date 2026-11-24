<template>
  <div class="app-container">
    <div class="contain-top">
      <!--筛选条件-->
      <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px">
        <el-form-item label="合同名称" prop="contractName">
          <el-input v-model="queryParams.contractName" placeholder="请输入合同名称" clearable size="small" class="widthClass"
            @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item label="甲方名称" prop="j_orgname">
          <el-input v-model="queryParams.j_orgname" placeholder="请输入甲方名称" clearable size="small"  class="widthClass"/>
        </el-form-item>         
        <el-form-item label="关联医院" prop="orgName">
          <el-input v-model="queryParams.orgName" placeholder="请输入关联医院" clearable size="small"  class="widthClass"/>
        </el-form-item> 
        <el-form-item label="乙方名称" prop="y_orgname">
          <el-input v-model="queryParams.y_orgname" placeholder="请输入乙方名称" clearable size="small"  class="widthClass"/>
        </el-form-item>         
        <el-form-item label="合同主题" prop="contractSubject">
          <el-select v-model="queryParams.contractSubject" filterable placeholder="请选择合同主题" class="widthClass">
            <el-option v-for="dict in contractList" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue">
            </el-option>
          </el-select>
        </el-form-item> 
        <el-form-item label="合同类型" prop="contractType">
          <el-select v-model="queryParams.contractType" placeholder="请选择合同类型" class="widthClass">
            <el-option v-for="item in contractTypeList" :key="item.dictValue" :label="item.dictLabel"  :value="item.dictValue">
            </el-option>
          </el-select>
        </el-form-item>   
        <el-form-item label="合同分类" prop="contractCategory">
          <el-select v-model="queryParams.contractCategory" placeholder="请选择合同分类" class="widthClass">
            <el-option v-for="item in contractCategoryList" :key="item.dictLabel" :label="item.dictValue" :value="item.dictLabel">
            </el-option>
          </el-select>
        </el-form-item>                                   
        <el-form-item label="合同收回" prop="isBack">
          <el-select v-model="queryParams.isBack"  placeholder="请选择" class="widthClass">
            <el-option v-for="item in isContractBackList" :key="item.label" :label="item.value" :value="item.label">
            </el-option>
          </el-select>
        </el-form-item> 
        <el-form-item label="超期未收回" prop="overDays" label-width="88px">
          <el-select v-model="queryParams.overDays"  placeholder="请选择"  style="width:180px;">
            <el-option v-for="item in days" :key="item.label" :label="item.value" :value="item.label">
            </el-option>
          </el-select>
        </el-form-item>         
        <el-form-item label="开始时间" prop="dateStart">
          <el-date-picker v-model="dateStart" type="date" placeholder="选择日期" class="widthClass">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间" prop="dateEnd">
          <el-date-picker v-model="dateEnd" type="date" placeholder="选择日期" class="widthClass">
          </el-date-picker>
        </el-form-item>        
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      <!--操作按钮-->
      <div style="margin-top:10px;" v-show="currentOrgName=='河南中联'">
        <el-row :gutter="10">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['contractM:contract:add']" >
              新增合同
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button plain icon="el-icon-upload2" size="mini" type="info" @click="handleImport" v-hasPermi="['contractM:contract:import']">
              导入
            </el-button>
          </el-col>          
          <el-col :span="1.5">
            <el-button type="warning" plain icon="el-icon-download" size="mini" :loading="exportLoading"  @click="handleExport" v-hasPermi="['contractM:contract:export']" >
              导出
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="el-icon-delete" size="mini" @click="handleDelM" v-hasPermi="['contractM:contract:deleteM']" >
              批量删除
            </el-button>
          </el-col>
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </div>
    </div>
    <div class="contain-cont" style="margin-top:10px;">
      <el-table table-cloumn v-loading="loading" element-loading-text="拼命加载中" :data="recList"
        @selection-change="handleSelectionChange" height="calc(100% - 50px)" border>
        <el-table-column type="selection" width="50px" align="center" />
        <el-table-column :show-overflow-tooltip="true" label="合同名称" width="300px" align="center" prop="contractName" fixed />
        <el-table-column :show-overflow-tooltip="true" label="合同主题" width="120px" align="center" prop="contractSubject" />
        <el-table-column :show-overflow-tooltip="true" label="合同类型" width="120px" align="center" prop="contractType">
          <template #default="{ row }">
            {{ row.contractType === 1 ? '进项' : row.contractType === 2 ? '销项' : row.contractType }}
          </template>
        </el-table-column>
        <el-table-column label="合同分类" width="120px" align="center" prop="contractCategory" />
        <el-table-column label="合同金额(元)" width="150px" align="center" prop="contractAmount" />
        <el-table-column label="开票金额(元)" width="150px" align="center" prop="invoiceAmount" />
        <el-table-column label="甲方名称" width="190px" align="center" prop="j_orgname"  :show-overflow-tooltip="true" />
        <el-table-column label="关联医院" width="200px" align="center" prop="orgName" :show-overflow-tooltip="true" />
        <el-table-column label="乙方名称" width="200px" align="center" prop="y_orgname" :show-overflow-tooltip="true" />
        <el-table-column label="签订人员" width="120px" align="center" prop="signatory" />
        <el-table-column label="签订日期" width="170px" align="center" prop="contractSignDate" sortable/>
        <el-table-column label="邮寄日期" width="170px" align="center" prop="postDate" sortable/>
        <!-- <el-table-column label="邮寄人" width="120px" align="center" prop="postPerson" />
        <el-table-column label="邮寄日期" width="180px" align="center" prop="postDate" /> -->
        <!-- <el-table-column label="快递单号" width="200px" align="center" prop="postNum" /> -->
        <el-table-column label="合同收回" width="90px" align="center" prop="isBack">
          <template #default="{ row }">
            {{ row.isBack === 1 ? '是' : row.isBack === 0 ? '否' : row.isBack }}
          </template>
        </el-table-column>
        <!-- <el-table-column label="合同作废" width="90px" align="center" prop="isBack">
          <template #default="{ row }">
            {{ row.isCanceled === 1 ? '是' : row.isCanceled === 0 ? '否' : row.isCanceled }}
          </template>
        </el-table-column>         -->
        <el-table-column label="操作"  align="center" width="320px" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button size="mini" type="text" icon="el-icon-edit" @click="handleRepair(scope.row)"
              v-hasPermi="['contractM:contract:update']">修改</el-button>
            <el-button size="mini" type="text" icon="el-icon-tickets" @click="handDetails(scope.row)"
              v-hasPermi="['contractM:contract:detail']">详情</el-button>
            <el-button size="mini" type="text" icon="el-icon-plus" @click="handleAddInvoice(scope.row.id)" v-show="scope.row.contractType===1">发票</el-button>
            <el-button size="mini" type="text" icon="el-icon-tickets" @click="handInvoice(scope.row)">发票详情</el-button>
            <el-button size="mini" type="text" icon="el-icon-delete" @click="handDelete(scope.row)"
              v-hasPermi="['contractM:contract:delete']">删除</el-button>              
          </template>
        </el-table-column>
      </el-table>
      <!--分页-->
      <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
        @pagination="getList" />

      <!-- 添加或修改【合同】对话框 -->
      <el-dialog :title="title" :visible.sync="open" width="50%" append-to-body :close-on-click-modal="false">
        <el-form ref="form" :model="form" :rules="rules" label-width="80px" style="margin-left:6%;">
          <el-row>
            <el-col :span="12">
              <el-form-item label="合同名称" prop="contractName">
                <el-input style="width: 78%" v-model="form.contractName" placeholder="请输入合同名称"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="合同主题" prop="contractSubject">
                <el-select v-model="form.contractSubject" filterable placeholder="请选择合同主题" style="width: 78%">
                  <el-option v-for="dict in contractList" :key="dict.dictValue" :label="dict.dictLabel"  :value="dict.dictValue">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>

          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="合同金额" prop="contractAmount">
                <el-input style="width: 78%" v-model="form.contractAmount" placeholder="请输入合同金额"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="甲方名称" prop="j_orgname">
                <el-input style="width: 78%" v-model="form.j_orgname" placeholder="请输入甲方名称" />
              </el-form-item>
            </el-col>            
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="关联医院" prop="orgName">
                <el-select  v-model="form.orgName" placeholder="请选择关联医院" :remote-method="remoteOrg"  style="width: 78%" filterable remote allow-create>
                  <el-option v-for="dict in orgOptions" :key="dict.orgid" :label="dict.orgname" :value="dict.orgid"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="乙方名称" prop="y_orgname">
                <el-input style="width: 78%" v-model="form.y_orgname" placeholder="请输入乙方名称" />
              </el-form-item>
            </el-col>
          </el-row>          
          <el-row>
            <el-col :span="12">
              <el-form-item label="合同分类" prop="contractCategory">
                <el-select v-model="form.contractCategory" filterable placeholder="请选择合同分类" style="width: 78%">
                  <el-option v-for="item in contractCategoryList" :key="item.dictValue" :label="item.dictLabel" :value="item.dictValue"></el-option>
                </el-select>                
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="合同类型" prop="contractType">
                <el-radio-group v-model="form.contractType" style="width: 78%">
                  <el-radio v-for="item in contractTypeList" :key="item.dictValue" :label="item.dictLabel"  :value="item.dictValue">
                  </el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="签订人员" prop="signatory">
                <!-- <el-select v-model="form.signatory" placeholder="输入首字母选择签订人员" :remote-method="remoteMethod" remote
                  filterable clearable size="small" :loading="loading">
                  <el-option v-for="rce in unitOptions" :key="rce.id" :label="rce.personname" :value="rce.id" />
                </el-select> -->
                <el-input style="width: 78%" v-model="form.signatory" placeholder="请输入签订人员" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="签订日期" prop="contractSignDate">
                <el-date-picker v-model="form.contractSignDate" type="datetime" placeholder="请选择签订日期" style="width: 78%">
                </el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="邮寄人" prop="postPerson">
                <!-- <el-select v-model="form.postPerson" placeholder="输入首字母选择邮寄人" :remote-method="remoteMethod" remote
                  filterable clearable size="small" :loading="loading">
                  <el-option v-for="rce in unitOptions" :key="rce.id" :label="rce.personname" :value="rce.id" />
                </el-select> -->
                <el-input style="width: 78%" v-model="form.postPerson" placeholder="请输入邮寄人" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="邮寄日期" prop="postDate">
                <el-date-picker v-model="form.postDate" type="datetime" placeholder="请选择邮寄日期" style="width: 78%">
                </el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
               <el-form-item label="合同收回" prop="isBack">
                <el-radio-group v-model="form.isBack" style="width: 78%">
                  <el-radio v-for="item in isContractBackList" :key="item.label" :label="item.value"  :value="item.label">
                  </el-radio>
                </el-radio-group>
              </el-form-item>             
            </el-col>
            <el-col :span="12">
              <el-form-item label="快递单号" prop="postNum">
                <el-input style="width: 78%" v-model="form.postNum" placeholder="请输入快递单号" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col>
              <el-form-item label="合同内容" prop="content">
                <el-input v-model="form.content" placeholder="请输入合同简介" type="textarea" style="width:90%;" autosize/>
              </el-form-item>
            </el-col>
          </el-row>          
          <el-row>
            <el-col :span="12">
              <el-form-item label="合同上传" prop="enclosure">
                <el-upload class="file-upload" style="width: 78%" action="#" :file-list="fileList"
                  :http-request="requestUpload" :on-preview="onPreview" :on-remove="handleRemove"  :before-upload="beforeUpload">
                  <el-button size="mini" type="primary" :disabled="isDisabledH">点击上传</el-button>
                </el-upload>
              </el-form-item>
            </el-col>
            <el-col :span="12">
               <el-form-item label="合同作废" prop="isBack">
                <el-radio-group v-model="form.isCanceled" style="width: 78%">
                  <el-radio v-for="item in isCanceledList" :key="item.label" :label="item.value"  :value="item.label">
                  </el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="submitForm" v-show="isButton">提 交</el-button>
          <el-button @click="dialogone">取 消</el-button>
        </div>
      </el-dialog>

      <!--发票详情对话框-->
      <el-dialog :title="title" :visible.sync="invoiceDialog" width="60%" append-to-body :close-on-click-modal="false" style="height:500px !important">
          <el-table table-cloumn v-loading="loading" element-loading-text="拼命加载中" :data="invoiceList" height="450px" border>

              <!-- <el-table-column label="发票二维码" min-width="30%" align="center" prop="qrCode" :show-overflow-tooltip="true"/> -->
              <el-table-column label="开票人" min-width="17%" align="center" prop="qrPerson" />
              <el-table-column label="开票时间" min-width="33%" align="center" prop="qrDate" />
              <el-table-column label="开票金额(元)" min-width="20%" align="center" prop="invoiceAmount" />
              <!-- <el-table-column label="收/付金额" min-width="17%" align="center" prop="payAmount" />
              <el-table-column label="收/付时间" min-width="33%" align="center" prop="payDate" /> -->
              <el-table-column label="回款金额(元)" min-width="20%" align="center" prop="payAmount" />
              <el-table-column label="回款次数" min-width="16%" align="center" prop="payTimes" />
              <el-table-column label="回款差额(元)" min-width="20%" align="center" prop="payAmountRest" />              
              <el-table-column label="发票文件" min-width="20%" align="center" :show-overflow-tooltip="true">
                <template #default="{ row }">
                  <a :href="row.enclosure==null?'':row.enclosure.split('::')[0]" download="" target="_blank"> {{row.enclosure==null?'':row.enclosure.split('::')[1]}} </a>
                </template>
              </el-table-column>
              <el-table-column label="操作" min-width="20%" align="center" class-name="small-padding fixed-width" v-show="fapiaoEditShow">
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
      <!--添加发票及回款信息对话框-->
      <el-dialog :title="title" :visible.sync="faPiaoOpen" width="50%" append-to-body :close-on-click-modal="false">
        <el-form ref="fpForm" :model="fpForm" :rules="invoiceRules" label-width="80px" style="margin-left:6%;">
          <el-row>
            <!-- <el-col :span="12" hidden>
              <el-form-item label="电子发票" prop="qrCode">
                 <el-input style="width: 78%" v-model="fpForm.qrCode" placeholder="请输入发票二维码链接" />
              </el-form-item>
            </el-col>             -->
            <el-col :span="12">
              <el-form-item label="开票日期" prop="qrDate">
                 <el-date-picker v-model="fpForm.qrDate" type="datetime" placeholder="请选择开票日期" style="width: 78%"></el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="开票人" prop="qrPerson">
                <el-input style="width: 78%" v-model="fpForm.qrPerson" placeholder="请输入开票人" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="开票金额" prop="invoiceAmount">
                <el-input style="width: 78%" v-model="fpForm.invoiceAmount" placeholder="请输入开票金额" />
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
                <el-upload class="file-upload" style="width: 78%" action="#" :file-list="invoiceFileList"
                  :http-request="requestInvoiceUpload" :on-preview="onPreview" :on-remove="handleRemoveInvoiceFile"
                  :before-upload="beforeUpload" :limit="1">
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
              <el-table table-cloumn element-loading-text="拼命加载中" :data="paymentList" border>
                <el-table-column label="回款人" min-width="20%" align="center" prop="payPerson">
                  <template slot-scope="scope">
                    <el-form-item>
                      <el-input v-model="scope.row.payPerson" placeholder="请输入回款人" />
                    </el-form-item>
                  </template>
                </el-table-column>
                <el-table-column label="回款金额" min-width="20%" align="center" prop="payAmount">
                  <template slot-scope="scope">
                    <el-form-item>
                      <el-input v-model="scope.row.payAmount" placeholder="请输入回款金额" @blur="checkInputAmount(scope.row)"/>
                    </el-form-item>
                  </template>
                </el-table-column>                  
                <el-table-column label="回款时间" min-width="40%" align="center" prop="payDate">
                  <template slot-scope="scope">
                    <el-form-item>
                      <el-date-picker v-model="scope.row.payDate" type="datetime" placeholder="请选择回款日期">
                      </el-date-picker>   
                    </el-form-item>                 
                  </template>
                </el-table-column>  
                <el-table-column label="操作" min-width="24%" align="center" class-name="small-padding fixed-width">
                  <template slot-scope="scope">
                    <el-button size="mini" type="text" icon="el-icon-delete" @click="handlePaymentDel(scope.row)"
                      >删除</el-button>
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

      <!-- 合同导入对话框 -->
      <el-dialog  :title="upload.title"  :visible.sync="upload.open"  width="400px"  append-to-body >
        <el-upload
          ref="upload"
          :limit="1"
          accept=".xlsx, .xls"
          :headers="upload.headers"
          :action="upload.url + '?updateSupport=' + upload.updateSupport"
          :disabled="upload.isUploading"
          :on-progress="handleFileUploadProgress"
          :on-success="handleFileSuccess"
          :auto-upload="false"
          drag
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">
            将文件拖到此处，或
            <em>点击上传</em>
          </div>
          <div class="el-upload__tip" slot="tip">
            <el-link type="info" style="font-size: 12px" @click="importTemplate">下载模板</el-link>
          </div>
          <div class="el-upload__tip" style="color: red" slot="tip">
            提示：仅允许导入“xls”或“xlsx”格式文件！
          </div>
        </el-upload>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="submitFileForm">确 定</el-button>
          <el-button @click="upload.open = false">取 消</el-button>
        </div>
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
  delContract,
  addContract,
  getQrCodeList,
  exportContract,
  importTemplate,
  delM,
  addQrCode,
  updateQrCode
} from "@/api/business/business";

import Editor from "@/components/Editor";
import { parseTime, FunGetDateStr, formatToYYYYMMDDHHMMSS } from "@/utils/zlsoft";
import { uploadFileOne, serverUrl } from "@/api/common/file";
import { getToken } from "@/utils/auth";

import Treeselect from "@riophae/vue-treeselect";
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
      title: "",// 弹出层标题
      open: false,//对话框
      total: 0,//总数  
      showSearch: true,// 显示搜索条件
      dateStart:"",
      dateEnd:"",
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        contractName: "",
        contractSubject:"",
        contractType:"",
        contractSignDate: "",
        orgName:"",
        isBack:"",
        j_orgname:"",
        contractCategory:"",
        overDays:""
      },
      form: {},// 表单参数
      rules: {
        contractName:[{required:true,message:"请填写合同名称",trigger:"blur"}],
        contractSubject:[{required:true,message:"请选择合同主题",trigger:"blur"}],
        contractType:[{required:true,message:"请选择合同类型",trigger:"change"}],
        contractAmount:[{required:true,message:"请填写合同金额",trigger:"blur"}],
        signatory:[{required:true,message:"请填写合同签订人",trigger:"blur"}],
        contractSignDate:[{required:true,message:"请选择合同签订日期",trigger:"blur"}],
        orgName:[{required:true,message:"请填写关联医院",trigger:"blur"}],
        j_orgname:[{required:true,message:"请填写甲方名称",trigger:"blur"}],
        contractCategory:[{required:true,message:"请选择合同分类",trigger:"blur"}],
      },
      loading: true,// 遮罩层
      isShow: true,
      isButton: true, //提交按钮是否显示
      isDisabledH: false,
      isDisabledF: false,
      fileList: [],
      statusOptions: [],
      contractList: [], //合同列表
      orgOptions: [],//机构
      options: [], //原始机构数据
      unitPersonList: [],
      unitOptions: [],
      inputs: [{ label: "", qrCode: '', qrDate: '' }],
      baseLabel: "电子发票",
      fileHash:"",
      invoiceList:[], //发票列表
      invoiceDialog:false, //发票详情对话框
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
      ],
      isCanceledList:[
        {
          label:1,
          value:"是"
        },
        {
          label:0,
          value:"否"
        }
      ],
      days:[
        {
          label:5,
          value:"5天"
        },
        {
          label:10,
          value:"10天"
        },
        {
          label:15,
          value:"15天"
        },
        {
          label:20,
          value:"20天"
        },
        {
          label:30,
          value:"30天"
        }         
      ],      
      contractCategoryList:[
        // {
        //   label:"接口",
        //   value:"接口"
        // },
        // {
        //   label:"服务",
        //   value:"服务"
        // },
        // {
        //   label:"软件采购",
        //   value:"软件采购"
        // },
        // {
        //   label:"其他",
        //   value:"其他"
        // }
      ],
      // 导出遮罩层
      exportLoading: false,
      // 用户导入参数
      upload: {
        // 是否显示弹出层（导入）
        open: false,
        // 弹出层标题（导入）
        title: "",
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的数据
        updateSupport: 0,
        // 设置上传的请求头部
        headers: { Authorization: "Bearer " + getToken() },
        //上传的地址
        url: process.env.VUE_APP_BASE_API + "/contractM/contract/importContract",
      },  
      selectedRows:[],
      //发票表单
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
      faPiaoOpen: false,//新增发票窗口
      invoiceFileList:[], //发票文件
      paymentList:[],//回款记录 
      fapiaoEditShow:false,//发票详情对话框 操作列是否显示
      isButtonDisabled: false, //按钮是否禁用
      invoiceRules:{
        qrDate:[{required:true,message:"请选择开票日期",trigger:'blur'}],
        qrPerson:[{required:true,message:"请填写开票人",trigger:'blur'}],
        invoiceAmount:[{required:true,message:"请填写开票金额",trigger:'blur',validator:checkInputD}]
      },
      currentOrgName:store.getters.roles.orgaccount.orgname
    };
  },

  created() {

    // unitPersonlist({ unitid: store.getters.roles.unit.id }).then((res) => {
    //   this.unitPersonList = res.data;
    //   this.loading = false
    // });

    this.getList();


    //合同主题
    this.contractList = [];
    this.getDicts("sys_ht_type").then((response) => {
      this.contractList = response.data;
    });

    //合同类型
    this.getDicts("sys_contract_type").then((response) => {
      this.contractTypeList = response.data;
    });

    //合同主题
    this.getDicts("sys_contract_category").then((response) => {
      this.contractCategoryList = response.data;
    });

    //客户
    orgHospitallist().then((res) => {
      this.options = res.data;
    });

  },

  methods: {
    //************* 【1-筛选区】查询列表方法 */
    getList() {
      this.loading = true;
      this.recList = [];
      var params = this.addDateRange(this.queryParams, this.dateRange);
      Object.assign(params.params,{overDays:this.queryParams.overDays})
      list(params).then(
        (response) => {
          if(response){
            this.recList = response.rows;
            this.total = response.total;
            this.loading = false;
          }
        }
      );
    },
    //************* 【1-筛选区】 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;

      this.dateRange = [
        this.dateStart==""||this.dateStart==null?"":parseTime(this.dateStart),
        this.dateEnd==""||this.dateEnd==null?"":parseTime(this.dateEnd)
      ];

      this.getList();
    },
    //************* 【1-筛选区】 重置按钮操作 */
    resetQuery() {
      this.dateStart = null
      this.dateEnd = null
      this.queryParams.isBack=""
      this.resetForm("queryForm");
      this.handleQuery();
    },
    //************* 【1-筛选区】 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;

      //console.log("选中的数据",selection);
      this.selectedRows = selection;
    },
    //************* 【1-筛选区】 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.fileList = [];
      this.inputs = [{ label: "", qrCode: '', qrDate: '' }];
      
      this.isShow = false;
      this.isButton = true;
      this.isDisabledH = false;
      this.title = "新增合同";
      this.open = true;
    }, 
    //=============【2-列表区】详情   
    handDetails(row) {
      this.loadFormContractData(row);     
      this.isButton = false;
      this.title = "合同详情";
    },
    //=============【2-列表区】修改
    handleRepair(row) {
      this.loadFormContractData(row);
      this.title = "合同修改";
    },
    //=============【2-列表区】 新增发票按钮操作 */
    handleAddInvoice(data) {
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
    //=============【2-列表区】 发票详情
    handInvoice(row) {
      this.reset();
      this.fileList = [];
      this.invoiceList = [];
      const id = row.id ;
      getQrCodeList(id).then((response) => {
        this.invoiceList = response.data;
      });
      this.invoiceDialog = true;
      this.fapiaoEditShow = row.contractType===1?true:false;
      this.title = "发票详情";
    },    
    //=============【2-列表区】删除
    handDelete(row) {
  
      if(row.invoiceAmount!=null&&row.invoiceAmount!=""&&row.invoiceAmount!="0.00"&&row.invoiceAmount!="0"){
        this.$message.error("当前合同已进行了【发票关联】，不能删除！");
        return;        
      }

      this.$confirm(
        "是否确认删除当前合同【"+row.contractName+"】?",
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).then(function () {
          return delContract(row);
      }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
      }).catch(() => { });
    },  
    //=============【2-列表区】批量删除
    handleDelM(){
      if(this.selectedRows.length==0){
        this.$message.error("请至少选择一条记录！");
        return;
      }else{
        //判断是否含有上传了发票的数据
        var isTrue= false;//是否上传了发票
        this.selectedRows.forEach((item)=>{
          if(item.invoiceAmount!=null&&item.invoiceAmount!=""&&item.invoiceAmount!="0.00"){
            isTrue = true;
          }
        });
        if(isTrue){
          this.$message.error("选择的数据记录中【含有已上传发票】的数据，请取消选中已上传发票的数据后再进行删除！");
          return;
        }

      this.$confirm(
        "是否确认删除当前"+this.selectedRows.length+"条合同记录?",
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).then( ()=> {
        delM(this.selectedRows).then((response)=>{
          if(response){
            this.msgSuccess("删除成功");
            this.getList();
          }else{
            this.$message.error("删除失败");
          }
        })
      }).catch(() => { });

      }
    },  
    //=============【2-列表区】 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm("是否确认导出合同数据?", "警告", {
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
    //=============【2-列表区】 导入按钮操作 */
    handleImport() {
      this.upload.title = "合同导入";
      this.upload.open = true;
    },    
    handleRemove(file) {
      this.fileList.splice(this.fileList.indexOf(file), 1);
    },

    //##############【3-表单】 取消按钮
    dialogone() {
      this.open = false;
      this.faPiaoOpen = false;
      if (this.inputs.qrCode == '' && this.inputs.label == '') {
        this.inputs = [{ label: "", qrCode: '', qrDate: '' }];
      }
      this.reset();
    },
    //##############【3-表单】提交
    submitForm() {
      this.stopDoub();

      if(this.form.contractSignDate){
        this.form.contractSignDate = parseTime(this.form.contractSignDate);
      }

      if(this.form.postDate){
        this.form.postDate = parseTime(this.form.postDate);
      }

      const combinedStrings = this.fileList
        .map((file) => `${file.url}::${file.name}`)
        .join(",");
      this.form.enclosure = combinedStrings;
      
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

      const isCanceled = this.isCanceledList.find(item=>item.value==this.form.isCanceled);

      if(isCanceled){
        this.form.isCanceled = isCanceled.label
      }else{
        this.form.isCanceled = 0
      }

      this.contractList.forEach((item) => {
        if (item.dictLabel == this.form.contractSubject) {
          this.form.contractSubject = item.dictValue;
        }
      })


      this.options.forEach((item) => {
        if (item.orgid == this.form.orgName) {
          this.form.orgId = item.orgid;
          this.form.orgName = item.orgname;
        }
      })


      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id != null) {
            updateContract(this.form).then((response) => {
              if (response.code == 200) {
                this.open = false;
                this.msgSuccess("修改成功");
                this.getList();
              } else {
                this.msgSuccess("修改失败" + response.msg);
                this.getList();
              }
            }).catch(() => {});
          } else {
            addContract(this.form).then((response) => {
              if (response.code == 200) {
                this.open = false;
                this.msgSuccess("新增成功");
                this.getList();
              } else {
                this.msgSuccess("新增失败" + response.msg);
                this.getList();
              }
            }).catch(() => {});
          }
          this.fileList = [];
        }
      });

    },  
    //##############【3-表单】回款列表添加一行  
    addPaymentRow(){
      this.paymentList.push({
        payPerson:"",
        payDate:"",
        payAmount:""
      })
    },
    //##############【3-表单】回款列表删除一行  
    handlePaymentDel(row){
      const index = this.paymentList.indexOf(row);
      if(index!==-1){
        this.paymentList.splice(index,1);
      }
    },    
    //##############【3-表单】回款提交
    fpSubmitForm(val) {
      this.stopDoub();

      this.fpForm.isSubmitReview = val;
      this.fpForm.payDate = this.fpForm.payDate==""?"":parseTime(this.fpForm.payDate);
      this.fpForm.qrDate = this.fpForm.qrDate==""?"":parseTime(this.fpForm.qrDate);

      //判断回款
      if(this.paymentList.length>0){
        if(!this.paymentList.every(item=>item.payAmount&&item.payPerson&&item.payDate)){
          this.msgSuccess("回款记录存在内容为空，请补充填写完整");
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
                  this.msgSuccess("修改失败" + response.msg);
                }
              }).catch(() => {});
            }else{
              addQrCode(this.fpForm).then((response) => {
                if (response.code == 200) {
                  this.msgSuccess("新增成功");
                  this.faPiaoOpen = false;
                  this.getList();   
                } else {
                  this.msgSuccess("新增失败" + response.msg);
                }
              }).catch(() => {});
            }         
        }
      });

    }, 
    reGetInvoiceList(contractId){
        getQrCodeList(contractId).then((response) => {
          this.invoiceList = response.data;
        });
    },  
    //##############【3-表单】发票详情 修改按钮
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
    //##############【3-表单】表单重置
    reset() {
      this.form = {
        contractName: "",
        orgName: "",
        signatory: "",
        contractSignDate: "",
        postPerson: "",
        postDate: "",
        contractSubject: "",
        postNum: "",
        isBack: "0",
        y_orgname: "",
        contractType: "",
        contractAmount: "",
        enclosure: "",
        contractCategory:"",
        j_orgname:""
      };
      this.resetForm("form");
    },
    //##############【3-表单】禁止按钮双击
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
    //##############【3-1表单】机构过滤
    remoteOrg(query) {
      if (query !== "") {
        setTimeout(() => {
          this.orgOptions = this.options.filter((item) => {
            return (
              item.pinyin.toLowerCase().includes(query.toLowerCase()) ||
              item.orgname.toLowerCase().includes(query.toLowerCase())
            );
          });
          if(this.orgOptions.length==0){
            this.orgOptions = [{label:query,value:query}]
          }
        }, 100);
      } else {
        this.orgOptions = [];
      }
    },    
    //##############【3-2表单】 上传文件前判断
    beforeUpload(file) {
      const isLt1M = file.size / 1024 / 1024 < 10;
      if (!isLt1M) {
        this.$message.error("上传文件大小不能超过10MB!");
      }
      return isLt1M;
    },
    //##############【3-2表单】 覆盖默认的上传行为 --合同
    requestUpload(imageData) {
      const file = imageData.file;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileHash",this.fileHash);
      formData.append("fileId",this.form.contractFile==undefined?"":this.form.contractFile)
      uploadFileOne(formData).then((response) => {
        if (response.code == 200) {
          const name = file.name;
          this.form.contractFile = response.fileId;
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
    //##############【3-3表单】点击文件预览或下载
    onPreview(file) {
      window.open(file.url, "_blank");
    },
    //##############【3-4表单】 下载模板操作 */
    importTemplate() {
      importTemplate().then((response) => {
        this.download(response.msg);
      });
    },    
    //##############【3-5表单】 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true;
    },
    //##############【3-6表单】 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      this.upload.open = false;
      this.upload.isUploading = false;
      this.$refs.upload.clearFiles();
      this.$alert(response.msg, "导入结果", { dangerouslyUseHTMLString: true });
      this.handleQuery();
    },
    //##############【3-7表单】 提交上传文件
    submitFileForm() {
      this.$refs.upload.submit();
    },  
    //##############【3-8表单】 删除文件 
    handleRemoveInvoiceFile(file) {
      this.invoiceFileList.splice(this.fileList.indexOf(file), 1);
    },
    //##############【3-9表单】 覆盖默认的上传行为--发票
    requestInvoiceUpload(imageData) {
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
        } else {
          this.$message.error(response.msg);
        }
      }).catch(() => {});
    },    
    //加载合同信息
    loadFormContractData(row){
      this.reset();
      this.fileList = [];
      const id = row.id || this.ids;
      // //合同主题
      // this.getDicts("sys_ht_type").then((response) => {
      //   this.contractList = response.data;
      // });

        //深拷贝，防止影响源数据
        this.form =JSON.parse(JSON.stringify(row));

        const isback =this.isContractBackList.find(item=>item.label== row.isBack);
        if(isback){
          this.form.isBack = isback.value;
        }else{
          this.form.isBack = "否";
        }

        const isCanceled =this.isCanceledList.find(item=>item.label== row.isCanceled);
        if(isCanceled){
          this.form.isCanceled = isCanceled.value;
        }else{
          this.form.isCanceled = "否";
        }

        const contype =this.contractTypeList.find(item=>item.dictValue== row.contractType);
        if(contype){
          this.form.contractType = contype.dictLabel;
        }else{
          this.form.contractType = null;
        }
                
        if (row.contractType == 1) {
          this.isShow = false
        } else {
          this.isShow = true
        }
        this.inputs = row.qrCodeList;
        if (this.form.enclosure != null && this.form.enclosure != "") {
          var urlList = this.form.enclosure.split(",");
          urlList.forEach((url) => {
            var file = url.split("::");
            this.fileList.push({ url: file[0], name: file[1] });
          });
        }
        this.open = true;
        this.isButton = true;
        this.isDisabledH = false;
        this.isDisabledF= true;
    
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
