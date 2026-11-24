<template>
  <div class="app-container">
    <div class="contain-top">
      <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
        <el-form-item label="机构" prop="orgid" v-if="glshow == 1 || glshow == 0">
          <el-select v-model="queryParams.orgid" placeholder="请选择机构" :remote-method="remoteOrg"   filterable remote clearable class="widthClass">
            <el-option   v-for="dict in orgOptions"   :key="dict.orgid"   :label="dict.orgname"   :value="dict.orgid">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="glshow == 2" label="医院" prop="orgid">
          <el-select v-model="queryParams.orgid" placeholder="请选择机构" 
            filterable :remote-method="remoteOrg" remote clearable  class="widthClass">
            <el-option   v-for="dict in orgOptions"   :key="dict.orgid"   :label="dict.orgname"  :value="dict.orgid">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="服务单号" prop="id">
          <el-input v-model="queryParams.id" placeholder="请输入服务单号" clearable size="small"  @keyup.enter.native="handleQuery" class="widthClass" />
        </el-form-item>
        <el-form-item label="处理部门" prop="currentunitid">
          <el-select v-model="queryParams.currentunitid" placeholder="请选择处理部门" class="widthClass">
            <el-option v-for="dict in deptList" :key="dict.id" :label="dict.name" :value="dict.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="工单状态" prop="orderstatus">
          <el-select v-model="queryParams.orderstatus" placeholder="请选择工单状态 " clearable size="small" class="widthClass">
            <el-option v-for="rce in statusOptions" :key="rce.dictValue" :label="rce.dictLabel"  :value="rce.dictValue" />
          </el-select>
        </el-form-item>
        <el-form-item label="产品" prop="product" v-show="org_id=='08336fe6-a1a9-4acd-9edf-b14e014e4074'">
          <el-select v-model="queryParams.product" placeholder="请选择产品 " clearable size="small" class="widthClass">
            <el-option key="all" label="全部" value="all" />
            <el-option v-for="pro in productsOptions" :key="pro.dictValue" :label="pro.dictLabel" :value="pro.dictValue" />
          </el-select>
        </el-form-item>        
        <el-form-item label="开始时间" prop="dateStart">
          <el-date-picker v-model="dateStart" type="datetime" placeholder="选择日期" class="widthClass">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间" prop="dateEnd">
          <el-date-picker v-model="dateEnd"   type="datetime" placeholder="选择日期" class="widthClass">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="联系人员" prop="contacts">
          <el-input v-model="queryParams.contacts" placeholder="请输入联系人员" clearable size="small"  @keyup.enter.native="handleQuery" class="widthClass" />
        </el-form-item>
        <el-form-item label="处理人" prop="currentuserid">
          <el-select v-model="queryParams.currentuserid" placeholder="输入首字母选择处理人" :remote-method="remoteMethod" 
            remote  filterable clearable size="small" class="widthClass" :loading="loading" allow-create>
            <el-option   v-for="rce in unitOptions"   :key="rce.id"   :label="rce.personname"  :value="rce.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="服务描述" prop="describe">
          <el-input v-model="queryParams.describe" placeholder="请输入服务描述" clearable size="small" class="widthClass" />
        </el-form-item>        
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      <div>
        <el-row :gutter="5">
          <el-col :span="1.5">
            <el-button type="primary" icon="el-icon-plus" size="mini" plain  @click="handleAdd"  v-hasPermi="['system:rec:add']">
              新增工单
            </el-button>
          </el-col>
          <el-col :span="1.5"> </el-col>
          <el-col :span="1.5">
            <el-button type="warning" icon="el-icon-download" size="mini" plain @click="handleExport" :loading="exportLoading" v-hasPermi="['system:rec:export']">
              导出
            </el-button>
          </el-col>
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </div>
      <br />
    </div>
    <div class="contain-cont">
      <el-table table-cloumn v-loading="loading" element-loading-text="拼命加载中" :data="recList"
        @selection-change="handleSelectionChange" :row-class-name="tableRowClassName" height="calc(100% - 50px)" border>
        <el-table-column type="selection" width="50px" align="center" />
        <el-table-column label="服务单号"     prop="id"       width="120px"   align="center"    :show-overflow-tooltip="true" fixed />
        <el-table-column label="问题概述"     prop="title"    width="200px"   align="center"    :show-overflow-tooltip="true" />
        <el-table-column label="服务详细描述" prop="describe"  width="400px"  align="center"     :show-overflow-tooltip="true" />
        <el-table-column label="申请医院"     prop="orgname"  width="150px"   align="center"    :show-overflow-tooltip="true" />
        <el-table-column label="申请科室"     prop="unitname" width="100%"    align="center"    :show-overflow-tooltip="true" />        
        <el-table-column label="联系人员"     prop="contacts" width="120px"   align="center" />
        <el-table-column label="联系电话"     prop="tel"      width="120px"   align="center"  />
        <!-- <el-table-column label="QQ号码" width="100px" align="center" prop="qqnum" /> -->
        <el-table-column label="申请时间"     prop="createAt"     width="155px"   align="center" />
        <el-table-column label="期望时间"     prop="desiretime"   width="155px"   align="center"  />
        <el-table-column label="安排时间"     prop="arrangetime"  width="155px"   align="center" />
        <el-table-column label="处理人"       prop="currentusername" width="150px"   align="center"  />
        <el-table-column label="处理办法"     prop="disposal"     width="170px"   align="center"  :show-overflow-tooltip="true" />
        <el-table-column label="完成时间"     prop="completetime" width="155px"   align="center" />
        <el-table-column label="工单状态"     prop="orderstatus"  width="100%"    align="center" />       
        <el-table-column label="操作" fixed="right" align="center" width="400px" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button size="mini" type="text" icon="el-icon-edit" @click="handleAssign(scope.row)"
              v-hasPermi="['system:rec:todo']"  v-if="showBtn(scope.row,'派单')">派单</el-button>
            <el-button size="mini" type="text" icon="el-icon-warning-outline" @click="handlestop(scope.row)"
              v-hasPermi="['system:rec:over']"  v-if="showBtn(scope.row,'终止')">终止</el-button>
            <el-button size="mini" type="text" icon="el-icon-position" @click="handleReceive(scope.row)"
              v-hasPermi="['system:rec:record']"  v-if="showBtn(scope.row,'接单')">接单</el-button>
            <el-button size="mini" type="text" icon="el-icon-position" @click="transmitForm(scope.row)" 
              v-hasPermi="['system:rec:submit']"  v-if="showBtn(scope.row,'转服务商')">转服务商</el-button>
            <el-button size="mini" type="text" icon="el-icon-edit" @click="handleRepair(scope.row)"
              v-hasPermi="['system:rec:edit']"  v-if="showBtn(scope.row,'修改')">修改</el-button>              
            <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
              v-hasPermi="['system:rec:remove']">删除</el-button>
            <el-button size="mini" type="text" icon="el-icon-tickets" @click="showDetail(scope.row)"
              v-hasPermi="['system:rec:query']">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"  @pagination="getList" />

      <!-- 转交、派单、终止 工单共用对话框 -->
      <el-dialog :title="title" :visible.sync="open" width="1000px" append-to-body :close-on-click-modal="false">
        <el-form ref="form" :model="form" :rules="ruless" label-width="80px">
          <el-row>
            <el-col :span="12">
              <el-form-item label="联系人员" prop="contacts">
                <el-input  v-model="form.contacts" placeholder="请输入内容" style="width: 220px" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系电话" prop="tel">
                <el-input  v-model="form.tel"      placeholder="请输入联系电话" style="width: 220px" ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="申请科室" prop="unitname">
                <el-input  v-model="form.unitname" placeholder="请输入内容" style="width: 220px" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="申请时间" prop="createAt">
                <el-date-picker v-model="form.createAt" type="datetime" placeholder="选择申请时间" size="small" disabled >
                </el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="8">
              <el-form-item label="处理人" prop="currentuserid">
                <el-select v-model="form.currentuserid"  placeholder="请选择处理人"  filterable >
                  <el-option v-for="dict in personlist" :key="dict.id" :label="dict.name" :value="dict.id"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="处理方式" prop="processing">
                <el-select v-model="form.processing" placeholder="请选择处理方式">
                  <el-option v-for="dict in servicetypeOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="服务分类" prop="servicetype">
                <el-select v-model="form.servicetype" placeholder="请选择服务分类">
                  <el-option v-for="dict in serviceclassOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="问题概述" prop="title">
                <el-input  v-model="form.title" style="width: 383px" filterable />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="终止原因" prop="stopter">
                <el-input v-model="form.stopter" placeholder="请输入终止原因" style="width: 380px" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="问题描述" prop="describe">
                <el-input v-model="form.describe" placeholder="请输入内容"   style="width: 383px" type="textarea" :rows="6" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="处理方法" prop="disposal">
                <el-input v-model="form.disposal" placeholder="请输入处理方法" style="width: 380px" type="textarea" :rows="6"  />
              </el-form-item>
            </el-col>
            <el-col :span="12" v-show="zjshow">
              <el-form-item label="转交部门" prop="currentunitid">
                <el-select v-model="form.currentunitid" placeholder="请选择转交部门">
                  <el-option v-for="dict in deptList" :key="dict.id" :label="dict.name" :value="dict.id"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="附件" prop="enclosure">
                <el-upload  action="#" :http-request="requestUpload"
                  class="file-upload" style="width: 62%"
                  :file-list="fileList" 
                  :on-preview="onPreview" 
                  :on-remove="handleRemove"  
                  :before-upload="beforeUpload">
                  <el-button size="mini" type="primary">点击上传</el-button>
                </el-upload>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button v-show="zjshow"    type="warning" @click="zjsmitForm">转 交</el-button>
          <el-button v-show="bzjshow"   type="success" @click="orderDoForm" :disabled="isButtonDisabled">派 单</el-button>
          <el-button v-show="stopshow"  type="danger"  @click="stopForm"    :disabled="isButtonDisabled">终 止</el-button>
          <!-- <el-button type="primary" @click="modifyForm">修 改</el-button> -->
          <el-button @click="dialogone">取 消</el-button>
        </div>
      </el-dialog>

      <!---新增工单对话框--->
      <el-dialog :title="title" :visible.sync="staffopen" width="1000px" append-to-body :close-on-click-modal="false">
        <el-form ref="form" :model="form" :rules="rules" label-width="80px">
          <el-row>
            <el-col :span="12">
              <el-form-item label="申请时间" prop="createAt">
                <el-date-picker v-model="form.createAt"  placeholder="选择申请时间" type="datetime"  size="small" clearable>
                </el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="期望时间" prop="desiretime">
                <el-date-picker v-model="form.desiretime" placeholder="期望解决时间" type="datetime" size="small" >
                </el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="申请科室" prop="unitname">
                <el-input  v-model="form.unitname" placeholder="请输入内容" style="width: 220px" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系人员" prop="contacts">
                <el-input  v-model="form.contacts" placeholder="请输入内容" style="width: 220px" @change="contactsNumeric"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="8">
              <el-form-item label="联系电话" prop="tel">
                <el-input  v-model="form.tel" placeholder="请输入科室电话" style="width: 220px" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="QQ号码" prop="qqnum">
                <el-input  v-model="form.qqnum" placeholder="请输入QQ号" style="width: 200px" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="问题范围" prop="scopetype">
                <el-select v-model="form.scopetype" placeholder="问题范围" clearable size="small" style="width: 215px">
                  <el-option v-for="dict in severityOptions" :key="dict.dictValue" :label="dict.dictLabel"  :value="dict.dictValue" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="8">
              <el-form-item label="问题概述" prop="title">
                <el-input  v-model="form.title" placeholder="请输入20字左右问题概述" style="width: 220px" clearable maxlength="20" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="产品名称" prop="icationid">
                <el-select v-model="form.icationid" placeholder="产品名称" clearable size="small" style="width: 200px" @change="changModu">
                  <el-option v-for="dict in icamodList" :key="dict.icationid" :label="dict.productname" :value="dict.icationid" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="模块名称" prop="moduleid">
                <el-select v-model="form.moduleid" filterable allow-create default-first-option placeholder="模块名称" @change="validateNumeric">
                  <el-option v-for="dict in modList" :key="dict.modid" :label="dict.modname" :value="dict.modid" style="width: 200px">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-form-item label="详细描述" prop="describe">
              <editor v-model="form.describe" :min-height="198" style="width: 860px"/>
            </el-form-item>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="附件" prop="enclosure">
                <el-upload action="#" :http-request="requestUpload"  
                  class="file-upload" style="width: 62%" multiple
                  :file-list="fileList" 
                  :on-preview="onPreview" 
                  :on-remove="handleRemove"
                  :before-upload="beforeUpload">
                  <el-button size="mini" type="primary">点击上传</el-button>
                </el-upload>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="submitForm" type="primary" :disabled="isButtonDisabled" >确 定</el-button>
          <el-button @click="dialogone1">取 消</el-button>
        </div>
      </el-dialog>

      <!---修改工单对话框--->
      <el-dialog :title="title" :visible.sync="updataOpen" width="1000px" append-to-body :close-on-click-modal="false">
        <el-form ref="form" :model="form" :rules="rules" label-width="80px">
          <el-row>
            <el-col :span="12">
              <el-form-item label="申请时间" prop="createAt">
                <el-date-picker v-model="form.createAt" placeholder="选择申请时间" type="datetime" size="small" clearable >
                </el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="期望时间" prop="desiretime">
                <el-date-picker v-model="form.desiretime" placeholder="期望解决时间" type="datetime" size="small" >
                </el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="申请科室" prop="unitname">
                <el-input v-model="form.unitname" placeholder="请输入内容" style="width: 220px" disabled ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系人员" prop="contacts">
                <el-input v-model="form.contacts" placeholder="请输入内容" style="width: 220px" ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="联系电话" prop="tel">
                <el-input v-model="form.tel" placeholder="请输入科室电话"  style="width: 220px" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="问题范围" prop="scopetype">
                <el-select v-model="form.scopetype" placeholder="问题范围" clearable size="small" style="width: 220px">
                  <el-option v-for="dict in severityOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="问题概述" prop="title">
                <el-input   v-model="form.title" placeholder="请输入20字左右问题概述" style="width: 220px" clearable maxlength="20" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="QQ号码" prop="qqnum">
                <el-input v-model="form.qqnum" placeholder="请输入QQ号" style="width: 220px"  />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-form-item label="详细描述" prop="describe">
              <el-input v-model="form.describe" placeholder="请输入内容" style="width: 840px" type="textarea" :rows="8" />
            </el-form-item>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="附件" prop="enclosure">
                <el-upload action="#" :http-request="requestUpload" 
                  class="file-upload" style="width: 62%" multiple
                  :on-remove="handleRemove" 
                  :file-list="fileList" 
                  :on-preview="onPreview"
                  :before-upload="beforeUpload">
                  <el-button size="mini" type="primary">点击上传</el-button>
                </el-upload>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer update">
          <el-button @click="updataSubmitForm" type="primary" :disabled="isButtonDisabled" >确 定</el-button>
          <el-button @click="dialogone1">取 消</el-button>
        </div>
      </el-dialog>

      <!-- 工单详情对话框 -->
      <el-dialog :title="title" :visible.sync="detailOpen" width="1000px" append-to-body :close-on-click-modal="false">
        <div>
          <div>
            <el-form ref="form" :model="form" :rules="ruless" label-width="80px">
              <el-row>
                <el-col :span="6">
                  <el-form-item label="联系人员" prop="contacts">
                    <el-input v-model="form.contacts" placeholder="请输入内容" style="width: 143px" ></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="联系电话" prop="tel">
                    <el-input v-model="form.tel" placeholder="请输入联系电话"  style="width: 143px" ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="6">
                  <el-form-item label="申请科室" prop="unitname">
                    <el-input v-model="form.unitname" placeholder="请输入内容" style="width: 143px" ></el-input>
                  </el-form-item>
                </el-col>

                <el-col :span="6">
                  <el-form-item label="处理人" prop="currentusername">
                    <el-input v-model="form.currentusername"  placeholder="请输入处理人" style="width: 143px" filterable/>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col>
                  <el-form-item label="申请时间" prop="createAt">
                    <el-date-picker v-model="form.createAt" placeholder="选择申请时间" type="datetime"  size="small">
                    </el-date-picker>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="6">
                  <el-form-item label="问题概述" prop="title">
                    <el-input v-model="form.title" style="width: 383px" filterable />
                  </el-form-item>
                </el-col>
                <el-col>
                  <el-form-item label="问题描述" prop="describe">
                    <el-input  v-model="form.describe" placeholder="请输入内容" type="textarea" style="width: 383px" :rows="8" />
                  </el-form-item>
                </el-col>

                <el-col :span="12">
                  <el-form-item label="附件" prop="enclosure">
                    <el-upload action="#" :http-request="requestUpload" 
                      class="file-upload" style="width: 62%" multiple
                      :file-list="fileList" 
                      :on-preview="onPreview"
                      :on-remove="handleRemove" 
                      :before-upload="beforeUpload">
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
                  <el-timeline-item v-for="(item, index) in disposalList" :color="index === 0 ? '#95F204' : ''" :key="index">
                    <div>
                      <span><i class="el-icon-user"></i>{{ item.createBy }}(电话:{{ item.tel }}) {{ item.orderstatus }}</span>
                      {{ item.tousername }}
                    </div>
                    <div>
                      <span>
                        <i class="el-icon-edit-outline"></i>{{ item.orderstatus=='终止问题'?(item.disposal ? item.disposal:stopReason):item.disposal }}
                      </span>
                    </div>
                    <!-- <div style="line-height: 10px">
                      <i class="el-icon-phone"></i>{{ item.tel }}
                    </div> -->
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

      <!---转服务商对话框--->
      <el-dialog :title="title" :visible.sync="transSPOpen" width="1000px" append-to-body :close-on-click-modal="false">
        <el-form ref="form" :model="form" :rules="rulesss" label-width="80px">
          <el-row>
            <el-col :span="12">
              <el-form-item label="联系人员" prop="contacts">
                <el-input  v-model="form.contacts" placeholder="请输入内容" style="width: 220px" disabled></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="联系电话" prop="tel">
                <el-input  v-model="form.tel" placeholder="请输入联系电话" style="width: 220px"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="申请科室" prop="unitname">
                <el-input  v-model="form.unitname" placeholder="请输入内容" style="width: 220px" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="申请时间" prop="createAt">
                <el-date-picker v-model="form.createAt" placeholder="选择申请时间" type="datetime" size="small" disabled >
                </el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="问题描述" prop="describe">
                <el-input v-model="form.describe" placeholder="请输入内容" type="textarea" :rows="4" style="width: 300px" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="转交原因" prop="disposal">
                <el-input v-model="form.disposal" placeholder="请输入内容" type="textarea" :rows="4" style="width: 300px"  clearable/>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="附件" prop="enclosure">
                <el-upload action="#" :http-request="requestUpload" 
                  class="file-upload" style="width: 62%" 
                  :on-preview="onPreview" 
                  :file-list="fileList"
                  :on-remove="handleRemove"
                  :before-upload="beforeUpload">
                  <el-button size="mini" type="primary">点击上传</el-button>
                </el-upload>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="modifytran" type="primary" :disabled="isButtonDisabled" >确 定</el-button>
          <el-button @click="dialogone">取 消</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import {
  listRec,
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
  timeoutList,
  deprtList,
  recordList,
  departmenticationList,
  remove,
  toorderList,
  unitPersonlist,
  orgHospitallist,
} from "@/api/order/service/rec";
import { getmodList } from "@/api/system/ication";
import Editor from "@/components/Editor";
import { getUserProfile } from "@/api/system/user";
import { orderunitDept } from "@/api/system/dept";
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
      org_id:store.getters.roles.orgaccount.orgid, //当前机构id
      userList: [],//用户数据
      dateRange: [],
      dateStart: null,
      dateEnd: null,     
      options: [],  //初始机构数据
      orgOptions: [], //机构数据
      deptList: [], //部门数据
      icamodList: [], //产品数据
      modList: [], //模块     
      unitPersonList: [],//当前部门所有人
      unitOptions: [],//处理人     
      statusnum: 1,     
      loading: true,// 遮罩层
      exportLoading: false,// 导出遮罩层
      glshow: store.getters.roles.organizationtype,//0 root,1 管理机构,2 服务商，3 医疗机构      
      ids: [],// 选中数组
      showSearch: true,// 显示搜索条件
      stopshow: false, //终止页面的终止按钮
      zjshow: false, //粘胶页面下的转交部门 下拉、按钮 是否显示 --open对话框
      bzjshow: true, //派单页面里的派单按钮是否显示--open对话框     
      total: 0,// 总条数
      recList: [],//工单列表数据    
      fileList: [], //文件上传
      staffopen: false,//新增工单对话框
      detailOpen: false,//工单详情对话框
      updataOpen: false,//工单修改对话框     
      statusOptions: [],//工单状态 下拉
      productsOptions: [],//产品类型 下拉
      severityOptions: [], //问题范围 下拉
      disposalList: [],//工单流转记录数据     
      personlist: [],//处理人  
      servicetypeOptions: [],//处理方式
      serviceclassOptions: [],//服务分类
      servicetype: 0, //选择的服务分类
      processing: 0, //选择的处理方式      
      title: "",// 弹出层标题 
      transSPOpen: false,// 转服务商对话框
      open: false, //转交、派单、终止工单 对话框
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
        currentunitid: null,
        reqDatetime: null,
        describe: null,
        product:null,
        params:{
          beginTime:FunGetDateStr(-3) + " " + "00:00:00",
          endTime:parseTime(new Date().setHours(23, 59, 59, 999)),
          orderstatus:[]
        }
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        contacts: [{ required: true, message: "联系人员为空", trigger: "blur" } ],
        createAt: [{ required: true, message: "申请时间不能为空", trigger: "blur"} ],
        title: [ { required: true, message: "问题概述不能为空", trigger: "blur" } ],
        scopetype: [ { required: true, message: "问题范围不能为空", trigger: "change" } ],
        describe: [ { required: true, message: "服务详细描述不能为空", trigger: "blur" } ],
        icationid: [ { required: true, message: "产品名称不能为空", trigger: "change" } ],
        tel: [
          { required: true, message: "联系电话不能为空", trigger: "blur" },
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: "请输入正确的手机号码",
            trigger: "blur",
          },
        ],
      },
      ruless: {
        contacts: [ { required: true, message: "联系人员不能为空", trigger: "blur" } ],
        createAt: [ { required: true, message: "申请时间不能为空", trigger: "blur" } ],
        describe: [ { required: true, message: "服务详细描述不能为空", trigger: "blur" } ],
        tel: [
          { required: true, message: "联系电话不能为空", trigger: "blur" },
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: "请输入正确的手机号码",
            trigger: "blur",
          },
        ],
      },
      rulesss: {
        disposal: [ { required: true, message: "转交原因不能为空", trigger: "blur" } ],
      },
      // show: true,
      fileUrl: "",
      isButtonDisabled: false, //按钮禁用
      timeoutId: null, //防双击
      stopReason:""  //终止原因
    };
  },
  created() {
    this.statusnum = this.$route.query.statusnum;
    if (this.statusnum != undefined){
      this.dateStart = null;
      this.dateEnd = null;
      this.queryParams.params.beginTime = null;
      this.queryParams.params.endTime = null;
    }else{
      this.dateStart = FunGetDateStr(-3) + " " + "00:00:00";
      this.dateEnd = parseTime(new Date().setHours(23, 59, 59, 999));
      this.queryParams.params.beginTime = FunGetDateStr(-3) + " " + "00:00:00";
      this.queryParams.params.endTime = parseTime(new Date().setHours(23, 59, 59, 999));
      // this.dateRange = [this.dateStart, this.dateEnd];
    }

    orderunitDept(this.queryParams).then((response) => {
      this.deptList = this.handleTree(response.data, "id");
    });
    orgHospitallist().then((res) => {
      this.options = res.data;
    });
    //当前部门所有人
    unitPersonlist({ unitid: store.getters.roles.unit.id }).then((res) => {
      this.unitPersonList = res.data;
    });
    //单据状态
    this.getDicts("sys_document_status").then((response) => {
      this.statusOptions = response.data;
    });
    //产品类型
    this.getDicts("sys_product_type").then((response) => {
      this.productsOptions = response.data;
    });  
    //问题范围
    this.getDicts("sys_info_pre").then((response) => {
      this.severityOptions = response.data;
    });
    //处理方式
    this.getDicts("sys_severity_status").then((response) => {
      this.servicetypeOptions = response.data;
    });
    //服务分类
    this.getDicts("sys_cancels_order").then((response) => {
      this.serviceclassOptions = response.data;
    });

    if (this.statusnum != undefined) {
      let pagenum = [1];
      let pagesize = [10];
      if (this.statusnum == 1) {
        this.getList();
      } else if (this.statusnum == 2) {
        if (this.glshow == 2) {
          this.queryParams.orderstatus = "4";
          let orderstatus = [4];
          this.gettoorderList(orderstatus, pagenum, pagesize);
        } else if (this.glshow == 3) {
          this.queryParams.orderstatus = "1";
          let orderstatus = [1];
          this.gettoorderList(orderstatus, pagenum, pagesize);
        }
      } else if (this.statusnum == 3) {
        if (this.glshow == 2) {
          this.queryParams.orderstatus = "5";
          let orderstatus = [5];
          this.queryParams.params.orderstatus = [5];
          this.gettoorderList(orderstatus, pagenum, pagesize);
        } else if (this.glshow == 3) {
          this.queryParams.orderstatus = "3";
          let orderstatus = [2, 5, 4];
          this.queryParams.params.orderstatus = [2, 5, 4];
          this.gettoorderList(orderstatus, pagenum, pagesize);          
        }
      } else if (this.statusnum == 4) {
        if (this.glshow == 2) {
          this.queryParams.orderstatus = "7";
          let orderstatus = [7];
          this.gettoorderList(orderstatus, pagenum, pagesize);          
        } else if (this.glshow == 3) {
          this.queryParams.orderstatus = "6";
          let orderstatus = [6, 7];
          this.gettoorderList(orderstatus, pagenum, pagesize);          
        }
      } else if (this.statusnum == 5) {
        if (this.glshow == 2) {
          this.queryParams.orderstatus = "9";
          let orderstatus = [9];
          this.gettoorderList(orderstatus, pagenum, pagesize);          
        } else if (this.glshow == 3) {
          this.queryParams.orderstatus = "8";
          let orderstatus = [8, 9];
          this.gettoorderList(orderstatus, pagenum, pagesize);          
        }
      } else if (this.statusnum == 6) {
        timeoutList({ pagenum: pagenum, pagesize: pagesize }).then(
          (response) => {
            this.recList = response.rows;
            this.total = response.total;
            this.loading = false;
          }
        );
      }
    } else {
      this.getList();
    }
  },

  methods: {
    //**********【1-筛选区】查询工单列表方法
    getList() {
      this.loading = true;
      this.recList = [];

      listRec(this.queryParams).then((response) => {
          if(response.code==200){
            this.recList = response.rows;
            this.total = response.total;
            this.loading = false;
          }else{
            this.msgError("查询工单列表失败");
          }
        }
      );
    },
    //**********【1-筛选区】 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.dateRange = [
        formatToYYYYMMDDHHMMSS(this.dateStart),
        formatToYYYYMMDDHHMMSS(this.dateEnd),
      ];
   
      if( this.dateEnd == null){
        this.dateRange = [
          this.dateStart==null?"2000-01-01 00:00:00":formatToYYYYMMDDHHMMSS(this.dateStart),
          parseTime(new Date()),
        ];
      }    
      if (new Date(this.dateRange[0]) > new Date(this.dateRange[1])) {
        return this.$message.error("请选择正确的时间段！");
      }
      this.queryParams.params.beginTime = this.dateStart == null?"2000-01-01 00:00:00":formatToYYYYMMDDHHMMSS(this.dateStart);
      this.queryParams.params.endTime = this.dateEnd == null?parseTime(new Date()):formatToYYYYMMDDHHMMSS(this.dateEnd);

      this.getList();
    },
    //**********【1-筛选区】 重置按钮操作 */
    resetQuery() {
      this.dateStart = null;
      this.dateEnd = null;
      this.queryParams.params.beginTime = null;
      this.queryParams.params.endTime = null;
      this.queryParams.params.orderstatus=[];
      this.statusnum = ""
   
      this.resetForm("queryForm");
      this.queryParams.orderstatus = "";
      this.handleQuery();
    },
    //**********【1-筛选区】 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      // this.multiple = !selection.length;
    },
    //**********【1-筛选区】 新增按钮操作 */
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
      this.form.createAt = parseTime(new Date());
      this.form.unitid = store.getters.roles.unit.id;
      if (!store.getters.roles.person.name.includes("管理员")) {
        this.form.contacts = store.getters.roles.person.name;
        this.form.tel = store.getters.roles.person.tel;
      }
      this.staffopen = true;
      this.requesdate();
      this.title = "新增工单";
    },
    //**********【1-筛选区】 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm("是否确认导出所有工单数据项?", "警告", {
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
        .catch(() => { });
    },      
    //============【2-列表区】行样式
    tableRowClassName({ row }) {
      if (row.orderstatus === "院内终止" || row.orderstatus === "服务终止") {
        return "warning-row";
      }
      if (row.orderstatus === "院内完成" || row.orderstatus === "服务完成") {
        return "success-row";
      }
      return "";
    },   
    //============【2-列表区】终止操作
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
        this.form.currentuserid =row.currentuserid;
        
        if (row.servicetype == null || row.servicetype == undefined || row.servicetype =="") {
          this.servicetype = 1;
        }
        if (row.processing == null || row.processing == undefined ||row.processing =="") {
          this.processing = 1;
        }
      });
      personList({ unitid: store.getters.roles.unit.id }).then((response) => {
        if(response){
          this.personlist = response.data;
        }
        if(row.currentuserid!=null&&row.currentuserid!=""){
          let person = this.personlist.find(item=>item.id==row.currentuserid);
          if(person==undefined){
            this.personlist.unshift({
                id:row.currentuserid,
                name: row.currentusername
            })
          }
        }
      });
      this.title = "工单处理详情";
      this.zjshow = false;//转交按钮
      this.bzjshow = false;//派单按钮
      this.stopshow = true;//终止按钮
      this.open = true;
    },
    //============【2-列表区】 派单按钮操作 */
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
        this.form.currentuserid =row.currentuserid;
        this.form.currentorgid = store.getters.roles.orgaccount.orgid;
        this.form.currentunitid = store.getters.roles.unit.id;
        
        if (row.servicetype == null || row.servicetype == undefined ||row.servicetype == "") {
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
        if(row.currentuserid!=null&&row.currentuserid!=""){
          let person = this.personlist.find(item=>item.id==row.currentuserid);
          if(person==undefined){
            this.personlist.unshift({
                id:row.currentuserid,
                name: row.currentusername
            })
          }
        }

      });

      this.title = "工单派单";
      this.zjshow = false; //转交页面里的转交按钮    
      this.stopshow = false; //终止页面里的终止按钮
      // this.show = true; //
      this.open = true; //派单页面  
      this.bzjshow = true;  // 派单页面里的 派单按钮

    },
    //============【2-列表区】接单操作
    handleReceive(row) {
      const ids = row.id;
      let obj = {
        id: row.id,
        unitid: store.getters.roles.unit.id,
        unitname: store.getters.roles.unit.name
        // pid: store.getters.roles.orgaccount.id,
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
        .catch(() => { });
    },
    //============【2-列表区】修改操作
    handleRepair(row) {
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
        
        this.title = "工单修改";
        this.updataOpen = true;
      });
    },
    //============【2-列表区】 查看详情 */
    showDetail(row) {
      this.reset();
      this.fileList = [];
      this.disposalList = [];
      const id = row.id || this.ids;

      //获取orderdo 工单流转记录
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
  
        this.title = "派单详情";
        this.form.tel = row.tel;
        this.stopReason = row.stopter;//终止原因  
        this.detailOpen = true;  
        
      });
    }, 
    //============【2-列表区】转服务商 打开窗口
    transmitForm(row) {
      this.reset();
      this.fileList = [];
      const id = row.id || this.ids;
      getRec(id).then((response) => {
        if(response.code==200){
          this.form = response.data;
          if (this.form.enclosure != null && this.form.enclosure != "") {
            var urlList = this.form.enclosure.split(",");
            urlList.forEach((url) => {
              var file = url.split("::");
              this.fileList.push({ url: file[0], name: file[1] });
            });
          }
          this.transSPOpen = true;
          this.form.tel = row.tel;
          this.title = "转单详情";
        }else{
          this.msgError("工单信息获取失败！");
        }

      });
    }, 
    //============【2-列表区】 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm(
        '是否确认删除【请填写功能名称】编号为"' + ids + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return delRec(ids);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        })
        .catch(() => { });
    },         
    //############【3-表单】 提交按钮 */
    submitForm() {
      this.stopDoub();
      const combinedStrings = this.fileList.map((file) => `${file.url}::${file.name}`).join(",");
      this.form.enclosure = combinedStrings;
      this.$refs["form"].validate((valid) => {
        this.form.createAt = parseTime( this.form.createAt, "{y}-{m}-{d} {h}:{i}:{s}");
        this.form.desiretime = parseTime(this.form.desiretime,"{y}-{m}-{d} {h}:{i}:{s}");

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
                this.msgError("新增失败");
              }
            }).catch(() => {});
     
          this.fileList = [];
        }
      });
    },
    //############【3-表单】 修改按钮
    updataSubmitForm() {
      this.stopDoub();
      const combinedStrings = this.fileList.map((file) => `${file.url}::${file.name}`).join(",");
      this.form.enclosure = combinedStrings;
      this.$refs["form"].validate((valid) => {
        if (valid) {
          gdUpdata(this.form).then((res) => {
            if(res.code==200){
              this.msgSuccess("修改成功");
              this.updataOpen = false;
              this.getList();
            }else{
              this.msgError(res.msg);
            }
          }).catch(() => {});
        }
      });
    },
    //############【3-表单】 派单按钮 */
    orderDoForm() {
      this.stopDoub();
      if ( this.form.currentuserid == null || this.form.currentuserid == undefined || this.form.currentuserid == "") {
        this.msgError("请填写处理人");
        return;
      }

      this.$refs["form"].validate((valid) => {
        this.form.desiretime = parseTime(this.form.desiretime, "{y}-{m}-{d} {h}:{i}:{s}");
        this.form.createAt = parseTime(this.form.createAt,"{y}-{m}-{d} {h}:{i}:{s}");
        this.form.assignDatetime = parseTime(this.form.assignDatetime,"{y}-{m}-{d} {h}:{i}:{s}");
        this.form.reqDatetime = parseTime(this.form.reqDatetime,"{y}-{m}-{d} {h}:{i}:{s}");

        if (valid) {
          if ( this.form.servicetype != null && this.form.servicetype != undefined && this.form.servicetype != "") {
            if (!this.isNumeric(this.form.servicetype)) {
              let servicetypee = this.serviceclassOptions.find((item) => item.dictLabel === this.form.servicetype)?.dictValue;
              this.form.servicetype = Number(servicetypee);
            }
          }
          if ( this.form.processing != null && this.form.processing != undefined && this.form.processing != "") {
            if (!this.isNumeric(this.form.processing)) {
              let serverityy = this.servicetypeOptions.find((item) => item.dictLabel === this.form.processing)?.dictValue;
              this.form.processing = Number(serverityy);
            }
          }
          orderDo(this.form).then((response) => {
            if(response.code==200){
              this.msgSuccess("派单成功");
              this.open = false;
              // this.staffopen = false;
              this.getList();
            }else{
              this.msgError(response.msg);
            }
          }).catch(() => { });
          this.fileList = [];
        }
      });
    },
    //############【3-表单】 终止窗口 终止按钮
    stopForm() {
      this.stopDoub();
      this.$refs["form"].validate((valid) => {
        this.form.desiretime = parseTime( this.form.desiretime, "{y}-{m}-{d} {h}:{i}:{s}");
        this.form.createAt = parseTime( this.form.createAt, "{y}-{m}-{d} {h}:{i}:{s}");
        if (valid) {
          this.form.processing = null;
          this.form.servicetype = null;
          if (this.form.stopter == null || this.form.stopter == undefined || this.form.stopter =="") {
            this.msgError("请填写终止原因！");
            return;
          }

          if (this.form.id != null) {
            stopOrder(this.form).then((response) => {
              if(response.code==200){
                this.msgSuccess("终止成功");
                this.open = false;
                // this.staffopen = false;
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
    //############【3-表单】转服务商 提交
    modifytran() {
      this.stopDoub();
      if (this.form.orderstatus > 2) {
        this.msgSuccess("已转交服务商，请勿重复提交！");
        return;
      } 
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id != null) {
            deLiver(this.form).then((response) => {
              if(response.code==200){
                this.msgSuccess("转交成功");
                // this.open = false;
                this.transSPOpen = false;
                // this.staffopen = false;
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
    //############【3-表单】转交部门 提交
    zjsmitForm(row) {
      this.$refs["form"].validate((valid) => {
        this.form.desiretime = parseTime(this.form.desiretime,"{y}-{m}-{d} {h}:{i}:{s}");
        this.form.createAt = parseTime(this.form.createAt,"{y}-{m}-{d} {h}:{i}:{s}");

        if (valid) {
          if ( this.form.currentunitid == null || this.form.currentunitid == undefined || this.form.currentunitid == "") {
            this.msgError("请填写转交部门！");
            return;
          }
          if ( this.form.servicetype != null && this.form.servicetype != undefined && this.form.servicetype !="") {
            let servicetypee = this.serviceclassOptions.find((item) => item.dictLabel === this.form.servicetype)?.dictValue;
            this.form.servicetype = Number(servicetypee);
          }
          if ( this.form.processing != null && this.form.processing != undefined && this.form.processing !="") {
            let serverityy = this.servicetypeOptions.find((item) => item.dictLabel === this.form.processing)?.dictValue;
            this.form.processing = Number(serverityy);
          }

          if (this.form.id != null) {
            deprtList(this.form).then((response) => {
              if(response.code==200){
                this.msgSuccess("转交成功");
                this.open = false;
                // this.staffopen = false;
                this.getList();
              }else{
                this.msgError(response.msg);
              } 
            }).catch(() => { });
          }
          this.fileList = [];
        }
      });
    },
    //############【3-表单】禁止双击
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
    //############【3-表单】 取消按钮
    dialogone1() {
      this.staffopen = false;
      this.updataOpen = false;
      this.reset();
    },
    //############【3-表单】 取消按钮
    dialogone() {
      this.open = false;
      this.transSPOpen = false;
      this.reset();
    },  
    //************【1-1筛选区】机构输入过滤
    remoteOrg(query) {
      if (query !== "") {
        // this.loading = true;
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
        // this.loading = false;
      } else {
        this.orgOptions = [];
      }
    },     
    //************【1-2筛选区】初始化时间
    requesdate() {
      this.form.reqDatetime = new Date();
      this.form.assignDatetime = new Date();
    }, 
    //============【2-1列表区】操作按钮显示   
    showBtn(row,btnName){
      if(btnName=="派单"){
        if(((row.orderstatus == '服务分配' ||  row.orderstatus == '服务处理') && this.glshow == '2') || (row.orderstatus == '院内分配' && this.glshow=='3')  ){
          return true;
        }else{
          return false;
        }
      }else if(btnName=="接单"){
        if((row.orderstatus == '服务分配' && this.glshow == '2') ||   (row.orderstatus == '院内分配' && this.glshow == '3' )
        ){
          return true;
        }else{
          return false;
        }
      }else if(btnName=="终止"){
        if(((row.orderstatus == '院内分配' || row.orderstatus == '院内处理' || row.orderstatus == '问题下单') && this.glshow == '3')||
           (row.orderstatus !== '服务终止' && row.orderstatus !== '服务完成' && this.glshow == '2') 
           ){        
              return true;
           }else{
              return false;
           }
      }else if(btnName=="转部门"){
        if( ((row.orderstatus == '院内分配' || row.orderstatus == '问题下单') && this.glshow == '3')||
            (row.orderstatus !== '服务终止' && row.orderstatus !== '服务完成' && this.glshow == '2')
           ){
              return true;
          }else{
              return false;
          }
      }else if(btnName=="转服务商"){
        if((row.orderstatus == '问题下单' || row.orderstatus == '院内分配' || row.orderstatus == '院内处理') && this.glshow == '3'){
            return true;
        }else{
            return false;
        }
      }else if(btnName=="修改"){
        if((row.orderstatus !== '服务终止' && row.orderstatus !== '服务完成' && this.glshow == '2')||
           (row.orderstatus !== '院内终止' && row.orderstatus !== '院内完成' && this.glshow == '3')||
           this.glshow == '0'){
              return true;
           }else{
              return false;
           }
      }
    },
    //############【3-1表单】删除文件
    handleRemove(file, fileList) {
      this.fileList.splice(this.fileList.indexOf(file), 1);
      // remove({ fileName: this.fileUrl }).then((response) => {});
    },
    //############【3-1表单】 上传文件前判断
    beforeUpload(file) {
      const isLt1M = file.size / 1024 / 1024 < 10;
      if (!isLt1M) {
        this.$message.error("上传文件大小不能超过10MB!");
      }
      return isLt1M;
    },
    //############【3-1表单】 覆盖默认的上传行为
    requestUpload(imageData) {
      const file = imageData.file;
      const formData = new FormData();
      formData.append("file", file);
      uploadFile(formData).then((response) => {
        if (response.code == 200) {
          this.fileUrl = response.url;
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
    //############【3-1表单】点击文件预览或下载
    onPreview(file) {
      window.open(file.url, "_blank");
    },
    //############【3-2表单】处理人输入过滤
    remoteMethod(query) {
      if (query !== "") {
        // this.loading = true;
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
        // this.loading = false;
      } else {
        this.unitOptions = [];
      }
    },    
    //############【3-3表单】 表单重置
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
        currentunitid: null,
        currentorgid: null,
        moduleid: null,
        icationid: null,
        moduleid: null,
        qqnum: null,
      };
      this.resetForm("form");
    },
    //############【3-4表单】根据产品选择模块
    changModu(value) {
      getmodList({ id: value }).then((response) => {
        this.modList = response.data;
      });
    },

    //判断是否输入数字
    isNumeric(str) {
      return /^[0-9]+$/.test(str);
    },
    validateNumeric(value) {
      if (this.isNumeric(value)) {
        this.$message.error("输入的内容不能为纯数字");
        this.form.moduleid = "";
      }
    },
    contactsNumeric(value) {
      if (this.isNumeric(value)) {
        this.$message.error("输入的内容不能为纯数字");
        this.form.contacts = "";
      }
    },
    //查询工单流转记录
    gettoorderList(orderstatus, pagenum, pagesize) {
      toorderList({
        orderstatus: orderstatus,
        pagenum: pagenum,
        pagesize: pagesize,
      }).then((response) => {
        this.recList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
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

.dialog-footer.update{
  margin-right:40px;
}

</style>
