<template>
  <div class="app-container">
    <el-tabs v-model="activeTab" @tab-click="tabClick">
      <el-tab-pane label="工单列表" name="rec">
    <div class="contain-top">
      <el-form :model="queryParams" v-show="showSearch" ref="queryForm" :inline="true"  label-width="68px">
      <el-form-item  label="医院" prop="orgid">
          <el-select v-model="queryParams.orgid" placeholder="请选择机构" :remote-method="remoteOrg" class="widthClass" filterable  remote clearable >
            <el-option
              v-for="dict in orgOptions"
              :key="dict.orgid"
              :label="dict.orgname"
              :value="dict.orgid"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="服务单号" prop="documentNo">
          <el-input  v-model="queryParams.documentNo"  placeholder="请输入服务单号" size="small" @keyup.enter.native="handleQuery" class="widthClass" clearable />
        </el-form-item>
        <el-form-item label="联系电话" prop="deptPhone">
          <el-input  v-model="queryParams.deptPhone"   placeholder="请输入联系电话" size="small" @keyup.enter.native="handleQuery" class="widthClass" clearable />
        </el-form-item>
        <el-form-item label="联系人员" prop="contacts">
          <el-input  v-model="queryParams.contacts"    placeholder="请输入联系人员" size="small" @keyup.enter.native="handleQuery" class="widthClass" clearable />
        </el-form-item>
        <!-- <el-form-item label="开始时间" prop="dateStart">
          <el-date-picker v-model="dateStart"  placeholder="选择日期" type="datetime" class="widthClass">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间" prop="dateEnd">
          <el-date-picker v-model="dateEnd"    placeholder="选择日期" type="datetime" class="widthClass">
          </el-date-picker>
        </el-form-item> -->
        <el-form-item label="申请时间">
            <el-date-picker  v-model="dateRange" start-placeholder="开始日期" end-placeholder="结束日期"
                type="daterange"
                unlink-panels
                range-separator="至"
                :picker-options="pickerOptions">
              </el-date-picker>
        </el-form-item>
         <el-form-item label="完成时间">
            <el-date-picker  v-model="finishDateRange" start-placeholder="开始日期" end-placeholder="结束日期"
                type="daterange"
                unlink-panels
                range-separator="至"
                :picker-options="pickerOptions">
              </el-date-picker>
        </el-form-item>       
        <el-form-item>
          <el-button icon="el-icon-search"  size="mini" @click="handleQuery" type="primary" >搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      <el-row :gutter="10">
        <el-col :span="1.5">
          <el-button type="warning" size="mini" icon="el-icon-download"  @click="handleExport" :loading="exportLoading" v-hasPermi="['system:rec:export']"  plain>导出</el-button>
        </el-col>
        <el-col :span="1.5" v-if="glshow == 2">
          <el-tag>今日派单总数:{{ totalnum }}</el-tag>
        </el-col>
        <el-col :span="1.5" v-if="glshow == 2">
          <el-tag>今日完成总数:{{ overnum }}</el-tag>
        </el-col>
        <right-toolbar
          :showSearch.sync="showSearch"
          @queryTable="getList"
        ></right-toolbar>
      </el-row>
    </div>
    <br />
    <div class="contain-cont">
      <el-table v-loading="loading" :data="recList" @selection-change="handleSelectionChange"  element-loading-text="拼命加载中"  table-cloumn  height="calc(100% - 50px)" border>
        <el-table-column type="selection" width="50px" align="center" />
        <el-table-column width="120px" align="center" label="服务单号" prop="id"        :show-overflow-tooltip="true" fixed />       
        <el-table-column width="170px" align="center" label="问题概述" prop="title"     :show-overflow-tooltip="true" />
        <el-table-column width="420px" align="center" label="服务详细描述" prop="describe" :show-overflow-tooltip="true"  />
        <el-table-column width="150px" align="center" label="申请医院" prop="orgname"   :show-overflow-tooltip="true"  />
        <el-table-column width="100%"  align="center" label="申请科室" prop="unitname" />
        <el-table-column width="130px" align="center" label="联系人员" prop="contacts" />
        <el-table-column width="110px" align="center" label="联系电话" prop="tel" />
        <!-- <el-table-column width="110px" align="center" label="QQ号码"   prop="qqnum" />        -->
        <el-table-column width="155px" align="center" label="申请时间" prop="createAt" />
        <el-table-column width="155px" align="center" label="期望时间" prop="desiretime" />
        <el-table-column width="155px" align="center" label="安排时间" prop="arrangetime" />
        <el-table-column width="155px" align="center" label="处理人"   prop="currentusername" />
        <el-table-column width="155px" align="center" label="完成时间" prop="completetime" />
        <el-table-column width="100%"  align="center" label="工单状态" prop="orderstatus" />     
        <el-table-column width="250px" align="center" label="操作"  fixed="right" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button size="mini" type="text" icon="el-icon-tickets" @click="showDetail(scope.row)"    v-hasPermi="['system:rec:query']">详情</el-button>
            <el-button v-if="isOrderCreator(scope.row)" size="mini" type="text" icon="el-icon-edit"    @click="handleApproval(scope.row)">评价工单</el-button>
            <el-button size="mini" type="text" icon="el-icon-tickets" @click="handleEvalDetail(scope.row)">评价详情</el-button>
            <el-button size="mini" type="text" icon="el-icon-tickets" @click="handleKnowledge(scope.row)"   v-hasPermi="['system:select:base']">转入知识库</el-button>
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

      <!--工单详情对话框 -->
      <el-dialog :title="title" :visible.sync="detileopen" width="1000px" append-to-body :close-on-click-modal="false">
        <div>
          <div>
            <el-form ref="form" :model="form" :rules="ruless" label-width="80px">
              <el-row>
                <el-col :span="6"> 
                  <el-form-item label="联系人员" prop="contacts">
                    <el-input v-model="form.contacts" placeholder="请输入内容"    style="width: 143px"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="联系电话" prop="tel">
                    <el-input v-model="form.tel"      placeholder="请输入联系电话" style="width: 143px"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="6">
                  <el-form-item label="申请科室" prop="unitname">
                    <el-input v-model="form.unitname" placeholder="请输入内容"    style="width: 143px"></el-input>
                  </el-form-item>
                </el-col>

                <el-col :span="6">
                  <el-form-item label="处理人" prop="currentusername">
                    <el-input v-model="form.currentusername" placeholder="请输入处理人"  style="width: 143px" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row> <el-col>
                  <el-form-item label="申请时间" prop="createAt">
                    <el-date-picker v-model="form.createAt"  placeholder="选择申请时间"  size="small" type="datetime">
                    </el-date-picker>
                  </el-form-item>
                </el-col></el-row>
              <el-row>
                <el-col :span="8">
                  <el-form-item label="问题描述" prop="title">
                    <el-input v-model="form.title"     placeholder="请输入内容" style="width: 383px" />
                  </el-form-item>
                </el-col>
                <el-col>
                  <el-form-item label="问题描述" prop="describe">
                    <el-input v-model="form.describe"  placeholder="请输入内容" style="width: 383px" type="textarea" :rows="8" />
                  </el-form-item>
                </el-col>
                <!-- <el-col>
                  <el-form-item label="终止原因" prop="stopter">
                    <el-input
                      style="width: 300px"
                      v-model="form.happenPosition"
                      type="textarea"
                      :rows="4"
                      placeholder="请输入发生终止原因"
                    />
                  </el-form-item>
                </el-col> -->
                <el-col :span="12">
                  <el-form-item label="附件" prop="enclosure">
                    <el-upload action="#"
                      class="file-upload"
                      style="width: 62%" 
                      multiple
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
                      <span><i class="el-icon-user"></i>{{ item.createBy }}(电话:{{ item.tel }})
                        {{ item.orderstatus }}
                      </span>
                        {{ item.tousername }}
                    </div>
                    <div>
                      <span><i class="el-icon-edit-outline"></i>
                        {{ item.disposal }}
                      </span>
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

      <!-- 处理 -->
      <el-dialog :title="title" :visible.sync="open"  width="500px" append-to-body :close-on-click-modal="false">
        <el-form ref="form" :model="form" :rules="rules" label-width="80px">
          <el-row>
            <el-col>
              <el-form-item label="构成问题" prop="serviceConfirl">
                <el-select  v-model="form.serviceConfirl"  placeholder="请选择是否构成问题">
                  <el-option label="是" value="是"></el-option>
                  <el-option label="否" value="否"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col>
              <el-form-item label="处理时长" prop="processDuration">
                <el-input v-model="form.processDuration"   placeholder="计算中"  style="width: 59%" type="text" readonly />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col>
              <el-form-item label="是否完成" prop="serviceFinished">
                <el-select v-model="form.serviceFinished"  placeholder="请选择服务是否完成">
                  <el-option label="是" value="是"></el-option>
                  <el-option label="否" value="否"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col>
              <el-form-item label="是否解决" prop="questionFinished">
                <el-select  v-model="form.questionFinished"  placeholder="请选择问题是否解决">
                  <el-option label="是" value="是"></el-option>
                  <el-option label="否" value="否"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col>
              <el-form-item label="处理方法" prop="processMethod">
                <el-input  v-model="form.processMethod"      placeholder="请输入处理方法"  type="textarea" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" id="hidden" @click="submitForm">确 定</el-button>
          <el-button @click="dialogone">取 消</el-button>
        </div>
      </el-dialog>

      <!-- 评价 -->
      <el-dialog :title="titleEval" :visible.sync="openEval"  width="40%" append-to-body :close-on-click-modal="false">
        <el-form ref="evalForm" :model="form" :rules="rulesEval" label-width="120px">
          <el-row>
            <el-col>
              <el-form-item label="工单号" prop="ordernum">
                <el-input  v-model="form.ordernum"      placeholder=""  type="text" readonly />
              </el-form-item>
            </el-col>
          </el-row>          
          <el-row>
            <el-col>
              <el-form-item label="满意" prop="isSatisfied">
                <el-radio-group v-model="form.isSatisfied" :disabled="evalReadonly" style="width: 70%" >
                  <el-radio v-for="item in isSatisfiedList" :key="item.value" :label="item.value">
                    {{item.label}}
                  </el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col>
              <el-form-item label="不满意原因" prop="unSatisfiedReason">
                <el-input  v-model="form.unSatisfiedReason" :disabled="evalReadonly"      placeholder="不满意时必填"  type="textarea" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col>
              <el-form-item label="评价内容" prop="evalContent">
                <el-input  v-model="form.evalContent" :disabled="evalReadonly"      placeholder="请输入评价内容"  type="textarea" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col>
              <el-form-item label="问题是否解决" prop="solvedStatus">
                <el-radio-group v-model="form.solvedStatus" :disabled="evalReadonly">
                  <el-radio v-for="item in solvedList" :key="item.value" :label="item.value">{{item.label}}</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col>
              <el-form-item label="评价标签">
                <el-checkbox-group v-model="evalTagArr" :disabled="evalReadonly">
                  <el-checkbox v-for="tag in evalTagOptions" :key="tag" :label="tag">{{tag}}</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col>
              <el-form-item label="响应速度" prop="scoreResponse">
                <el-rate v-model="form.scoreResponse" :disabled="evalReadonly" style="margin-top:8px" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col>
              <el-form-item label="处理质量" prop="scoreQuality">
                <el-rate v-model="form.scoreQuality" :disabled="evalReadonly" style="margin-top:8px" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col>
              <el-form-item label="服务态度" prop="scoreAttitude">
                <el-rate v-model="form.scoreAttitude" :disabled="evalReadonly" style="margin-top:8px" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col>
              <el-form-item label="整体评分">
                <el-rate :value="evalScoreTotal" disabled style="margin-top:8px" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <template v-if="!evalReadonly">
            <el-button type="primary" id="hidden" @click="submitForm">确 定</el-button>
            <el-button @click="dialogone">取 消</el-button>
          </template>
          <el-button v-else @click="dialogone">关 闭</el-button>
        </div>
      </el-dialog>

    </div>
      </el-tab-pane>
      <!--开发项目页签：我完成的开发项目（登记过实际完成时间），不动工单逻辑。仅服务商（河南中联）可见 -->
      <el-tab-pane label="开发项目" name="mine" v-if="isProviderOrg">
        <div class="contain-top">
          <el-form :inline="true" label-width="68px">
            <el-form-item label="项目名称">
              <el-input v-model="mineFilter" placeholder="输入项目名称/用户名称过滤，回车查询" clearable size="small" class="widthClass"
                @keyup.enter.native="handleMineQuery" @clear="handleMineQuery" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="el-icon-refresh" size="mini" @click="loadMineList">刷新</el-button>
            </el-form-item>
          </el-form>
        </div>
        <div class="contain-cont" style="margin-top:10px;">
          <el-table v-loading="mineLoading" element-loading-text="拼命加载中" :data="filteredMineList"
            border>
            <el-table-column :show-overflow-tooltip="true" label="项目名称" min-width="180px" align="center" prop="projectName" />
            <el-table-column label="项目类型" width="130px" align="center" prop="projectType" />
            <el-table-column :show-overflow-tooltip="true" label="用户名称" min-width="150px" align="center" prop="orgName" />
            <el-table-column :show-overflow-tooltip="true" label="对应合同名称" min-width="180px" align="center" prop="contractName" />
            <el-table-column label="工作量" width="90px" align="center" prop="workload" />
            <el-table-column label="要求完成时间" width="160px" align="center" prop="requireDate" sortable>
              <template #default="{ row }">
                {{ parseTime(row.requireDate, '{y}-{m}-{d}') }}
              </template>
            </el-table-column>
            <el-table-column label="实际完成时间" width="160px" align="center" prop="finishDate" sortable>
              <template #default="{ row }">
                {{ parseTime(row.finishDate, '{y}-{m}-{d}') }}
              </template>
            </el-table-column>
            <el-table-column :show-overflow-tooltip="true" label="完成情况" min-width="150px" align="center" prop="projectStatus" />
            <el-table-column label="负责人" width="100px" align="center" prop="linkPerson" />
            <el-table-column :show-overflow-tooltip="true" label="实施人员" min-width="120px" align="center" prop="doPerson" />
            <el-table-column label="验收状态" width="120px" align="center" prop="acceptStatus">
              <template #default="{ row }">
                <el-tag :type="mineTagType(row.acceptStatus)" size="mini">{{ mineStatusFormat(row.acceptStatus) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="验收时间" width="160px" align="center" prop="acceptDate" sortable>
              <template #default="{ row }">
                {{ parseTime(row.acceptDate, '{y}-{m}-{d}') }}
              </template>
            </el-table-column>
            <el-table-column label="登记人" width="100px" align="center" prop="createBy" />
            <el-table-column label="操作" align="center" width="100px" fixed="right">
              <template slot-scope="scope">
                <el-button size="mini" type="text" icon="el-icon-tickets" @click="mineDetails(scope.row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
          <!--开发项目分页：接口返回几条显示几条-->
          <pagination v-show="mineTotal > 0" :total="mineTotal" :page.sync="mineQueryParams.pageNum"
            :limit.sync="mineQueryParams.pageSize" @pagination="loadMineList" />
        </div>
        <!--开发项目详情对话框-->
        <el-dialog title="开发项目详情" :visible.sync="mineOpen" width="55%" append-to-body :close-on-click-modal="false">
          <el-form :model="mineForm" label-width="100px" style="margin-left:3%;">
            <el-row>
              <el-col :span="12">
                <el-form-item label="项目名称">
                  <el-input style="width: 78%" v-model="mineForm.projectName" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="项目类型">
                  <el-input style="width: 78%" v-model="mineForm.projectType" disabled />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="用户名称">
                  <el-input style="width: 78%" v-model="mineForm.orgName" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="对应合同">
                  <el-input style="width: 78%" v-model="mineForm.contractName" disabled />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="工作量">
                  <el-input style="width: 78%" v-model="mineForm.workload" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="负责人">
                  <el-input style="width: 78%" v-model="mineForm.linkPerson" disabled />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="实施人员">
                  <el-input style="width: 78%" v-model="mineForm.doPerson" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="验收状态">
                  <el-input style="width: 78%" :value="mineStatusFormat(mineForm.acceptStatus)" disabled />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="要求完成时间">
                  <el-input style="width: 78%" :value="parseTime(mineForm.requireDate, '{y}-{m}-{d}')" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="实际完成时间">
                  <el-input style="width: 78%" :value="parseTime(mineForm.finishDate, '{y}-{m}-{d}')" disabled />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="验收时间">
                  <el-input style="width: 78%" :value="parseTime(mineForm.acceptDate, '{y}-{m}-{d}')" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="登记人">
                  <el-input style="width: 78%" v-model="mineForm.createBy" disabled />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="完成情况">
                  <el-input v-model="mineForm.projectStatus" type="textarea" :rows="3" disabled />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="项目备注">
                  <el-input v-model="mineForm.remark" type="textarea" :rows="2" disabled />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="附件">
                  <!--项目附件（完成登记时上传的验收报告等文件），点击可预览下载-->
                  <el-upload
                    class="file-upload"
                    style="width: 62%"
                    action="#"
                    :file-list="mineDetailFileList"
                    :on-preview="onPreview"
                  >
                  </el-upload>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="联系人信息">
              <el-table :data="mineContacts" border style="width: 95%">
                <el-table-column label="姓名" align="center" prop="contactName" />
                <el-table-column label="职务" align="center" prop="contactPost" />
                <el-table-column label="电话" align="center" prop="contactTel" />
              </el-table>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="mineOpen = false">关 闭</el-button>
          </div>
        </el-dialog>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import {
  getRec,
  delRec,
  updateRecProcess,
  overList,
  DisposalList,
  personAlstats,
  orgHospitallist,
  exportRec,
} from "@/api/order/service/rec";

import { listUser, getUserProfile } from "@/api/system/user";
import { listDept } from "@/api/system/dept";
import { listMine, getMine } from "@/api/develop/devproject";
import { resolveFileUrl } from "@/api/common/file";
import { list,addEvaluation,getEvaluationBy,updateEvaluation,delEvaluation } from "@/api/evaluation/evaluation";
import Treeselect from "@riophae/vue-treeselect";
import {
  parseTime,
  FunGetDateStr,
  formatToYYYYMMDDHHMMSS,
} from "@/utils/zlsoft";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import store from "@/store";
export default {
  name: "Rec",
  components: {
    Treeselect,
  },

  data() {
    return {
      activeTab: "rec", // 当前页签：rec-已完成工单，mine-已完成开发项目
      mineList: [], // 我完成的开发项目
      mineTotal: 0, // 开发项目总数
      mineQueryParams: { pageNum: 1, pageSize: 10 }, // 开发项目分页参数
      mineLoading: false,
      mineFilter: "", // 过滤关键字
      mineLoaded: false, // 是否已加载过
      mineOpen: false, // 开发项目详情对话框
      mineForm: {}, // 开发项目详情
      mineDetailFileList: [], // 开发项目详情附件（只读展示）
      mineContacts: [], // 开发项目联系人
      mineStatusOptions: [], // 验收状态字典
      loading: true, // 遮罩层
      exportLoading: false,// 导出遮罩层
      detileopen: false, //工单详情   
      ids: [],// 选中数组 
      showSearch: true,// 显示搜索条件
      total: 0,// 总条数
      recList: [],//工单列表
      options: [],//机构初始数据
      orgOptions: [], //机构   
      title: "",// 对话框标题 
      titleEval:"",//工单评价对话框标题
      open: false,
      openEval:false,//工单评价对话框
      evalReadonly:false,//评价只读查看模式（已评价且查看者非评价人时为true：处理人可查看、创建人可修改）
      evalTagArr:[],//评价标签（勾选数组，提交时转逗号串）
      solvedList:[ {value:1,label:'已解决'},{value:2,label:'部分解决'},{value:3,label:'未解决'} ],//问题是否解决
      evalTagOptions:['响应及时','处理专业','态度好','一次解决','响应慢','多次返修','沟通不畅','未彻底解决'],//评价标签
      totalnum:0, //总数
      overnum:0, //完成数
      ruless: {
        contacts: [{ required: true, message: "联系人员为空", trigger: "blur" } ],
        createAt: [{ required: true, message: "申请时间不能为空", trigger: "blur"}],
        tel: [{ required: true, message: "联系电话不能为空", trigger: "blur" }],
        describe: [ { required: true, message: "服务详细描述不能为空", trigger: "blur" } ],
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        documentNo: undefined,
        deptPhone: undefined,
        contacts: undefined,
        orgid:undefined,
        params:{
          beginTime:"",
          endTime:"",
          finishTimeStart:"",
          finishTimeEnd:""
        },
        //工单流转到的是账户id，而非人员id
        currentuserid:store.getters.roles.orgaccount.id
      }, 
      form: {},// 表单参数
      disposalList: [],//工单流转记录
      glshow: store.getters.roles.organizationtype,
      fileList: [],
      // 表单校验
      rules: {
        documentNo: [ { required: true, message: "服务单号不能为空", trigger: "blur" }],
        documentStatus: [{ required: true, message: "单据状态", trigger: "blur" }],
        reqDept: [{ required: true, message: "申请科室不能为空", trigger: "blur" }],
        deptPhone: [{ required: true, message: "科室电话不能为空", trigger: "blur" }],
        contacts: [{ required: true, message: "联系人员不能为空", trigger: "blur" }],
        reqDatetime: [{ required: true, message: "申请时间不能为空", trigger: "blur" }],
        serviceDetall: [{ required: true, message: "服务详细描述不能为空", trigger: "blur" }],
      },
      // 表单校验-工单评价
      rulesEval: {
        ordernum: [ { required: true, message: "工单号不能为空", trigger: "blur" }],
        isSatisfied: [{ required: true, message: "是否满意不能为空", trigger: "change" }],
        evalContent: [{ required: true, message: "评价内容不能为空", trigger: "blur" }],
        //星级评价改为选填，不做必填校验
        solvedStatus: [{ required: true, message: "请选择问题是否解决", trigger: "change" }]
      },
      dateRange: [],
      dateStart: null,
      dateEnd: null,
      finishDateRange:[],
      pickerOptions: {
          shortcuts: [{
            text: '最近一周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
            }
          }]
        },
        isSatisfiedList:[
          {
            label:"满意",
            value:"1"
          },
          {
            label:"不满意",
            value:"0"
          }      
        ]
    };
  },
  created() {

    this.dateStart = FunGetDateStr(-3) + " " + "00:00:00";
    this.dateEnd = parseTime(new Date().setHours(23, 59, 59, 999));
  
    this.finishDateRange = [this.dateStart, this.dateEnd];
    if(store.getters.roles.organizationtype==2){
      personAlstats().then((res) =>{
        this.totalnum = res.OrderTotalVo.totalnum;
        this.overnum = res.OrderTotalVo.overnum;
      })
    }

    orgHospitallist().then((res) => {
      this.options = res.data;
    });

    //开发项目验收状态
    this.getDicts("sys_dev_accept_status").then((response) => {
      this.mineStatusOptions = response.data;
    });

    //开发项目列表：进入页面即加载，无需等tab切换（仅服务商河南中联可见）
    if (this.isProviderOrg) {
      this.loadMineList();
    }

    this.getList();

  },

  computed: {
    //开发项目仅服务商类型下的河南中联机构可见
    isProviderOrg() {
      const roles = store.getters.roles || {};
      const org = roles.orgaccount || {};
      return roles.organizationtype == 2 && org.orgname === "河南中联";
    },
    //整体评分=已评项均分四舍五入（0-5）；未评显示0；>=3 自动映射为满意(isSatisfied=1)
    evalScoreTotal() {
      const s = [this.form.scoreResponse, this.form.scoreQuality, this.form.scoreAttitude].filter(v => !!v);
      if (s.length === 0) return 0;
      return Math.round(s.reduce((a, b) => a + b, 0) / s.length);
    },
    //开发项目页签：按项目名称/用户名称前端过滤
    filteredMineList() {
      if (!this.mineFilter) {
        return this.mineList;
      }
      const key = this.mineFilter.toLowerCase();
      return this.mineList.filter((item) => {
        return (
          (item.projectName || "").toLowerCase().includes(key) ||
          (item.orgName || "").toLowerCase().includes(key)
        );
      });
    },
  },

  methods: {
    //************【开发项目页签】页签切换时加载最新数据 */
    tabClick(tab) {
      if (tab.name === "mine") {
        this.loadMineList();
      }
    },
    //************【开发项目页签】加载我完成的开发项目（登记过实际完成时间，分页） */
    loadMineList() {
      this.mineLoading = true;
      listMine({ ...this.mineQueryParams, completed: "1", projectName: this.mineFilter || "" }).then((response) => {
        this.mineList = response.rows || [];
        this.mineTotal = response.total || 0;
        this.mineLoading = false;
      }).catch(() => {
        this.mineLoading = false;
      });
    },
    //************【开发项目页签】过滤查询（回到第一页） */
    handleMineQuery() {
      this.mineQueryParams.pageNum = 1;
      this.loadMineList();
    },
    //************【开发项目页签】详情 */
    mineDetails(row) {
      this.mineDetailFileList = [];
      getMine(row.id).then((response) => {
        this.mineForm = response.data;
        this.mineContacts = this.mineForm.contactList == null ? [] : this.mineForm.contactList;
        //解析已有附件（url::name 逗号分隔，历史绝对地址剥离域名兼容处理，用当前文件服务地址拼接）
        if (this.mineForm.enclosure != null && this.mineForm.enclosure != "") {
          this.mineForm.enclosure.split(",").forEach((item) => {
            const file = item.split("::");
            this.mineDetailFileList.push({ url: resolveFileUrl(file[0]), name: file[1] });
          });
        }
        this.mineOpen = true;
      });
    },
    //************【开发项目页签】验收状态翻译 */
    mineStatusFormat(acceptStatus) {
      const status = this.mineStatusOptions.find((item) => item.dictValue == acceptStatus);
      return status ? status.dictLabel : acceptStatus;
    },
    //************【开发项目页签】验收状态标签颜色 */
    mineTagType(acceptStatus) {
      const map = { 1: "success", 2: "info", 3: "warning", 4: "" };
      return map[acceptStatus] || "info";
    },
    //***********【1-筛选区】 查询列表方法 */
    getList() {
      this.loading = true;
      this.recList = [];

      if(this.dateRange!=null){
          if(this.dateRange.length>0){
            this.queryParams.params.beginTime = formatToYYYYMMDDHHMMSS(this.dateRange[0]);
            this.queryParams.params.endTime = formatToYYYYMMDDHHMMSS(new Date(this.dateRange[1]).setHours(23, 59, 59, 999));
          }
      }else{
            this.queryParams.params.beginTime = "";
            this.queryParams.params.endTime = "";
      }
      if(this.finishDateRange!=null){
          if(this.finishDateRange.length>0){
            this.queryParams.params.finishTimeStart = formatToYYYYMMDDHHMMSS(this.finishDateRange[0]);
            this.queryParams.params.finishTimeEnd = formatToYYYYMMDDHHMMSS(new Date(this.finishDateRange[1]).setHours(23, 59, 59, 999));
          }  
      }else{
            this.queryParams.params.finishTimeStart = "";
            this.queryParams.params.finishTimeEnd = "";      
      }
 
      overList(this.queryParams).then((response) => {
        this.recList = response.rows;
        this.total = response.total;
        this.loading = false;
      });   
    },
    //***********【1-筛选区】 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    //***********【1-筛选区】 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.dateStart = "";
      this.dateEnd = "";
      this.queryParams.params.beginTime = "";
      this.queryParams.params.endTime = "";
      this.queryParams.params.finishTimeStart = "";
      this.queryParams.params.finishTimeEnd = "";
      this.queryParams.currentuserid=store.getters.roles.orgaccount.id;
      this.dateRange=[];
      this.finishDateRange=[];
      this.handleQuery();
    },
    //***********【1-筛选区】 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm("是否确认导出所有【已完成工单】数据项?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
          this.exportLoading = true;
          return exportRec(queryParams);
        })
        .then((response) => {
          this.download(response.msg);
          this.exportLoading = false;
        })
        .catch(() => {});
    },
    //============【2-列表区】 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
    },    
    //============【2-列表区】 查看详情 */
    showDetail(row) {
      this.reset();
      this.fileList = [];
      this.disposalList = []; 
      const id = row.id || this.ids;
      DisposalList({ id: row.id }).then((response) => {
        this.disposalList =response.data;
        });
      getRec(id).then((response) => {
        //工单数据不含isSatisfied/solvedStatus等评价字段，赋值会让已挂载的评价弹窗radio值变化，
        //触发change必填校验，控制台打async-validator警告，先抑制一次
        this.suppressChangeValidate();
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
        this.detileopen = true;
        
      });
    },
    //============【2-列表区】评价工单/查看评价详情
    //不做机构类型/角色权限控制：当前登录人是该工单创建人即可新增/修改评价，否则只读查看详情
    //当前登录人是否为该工单创建人（评价权限唯一依据）
    isOrderCreator(row){
      const acc = (store.getters.roles.orgaccount || {});
      return row.createByid != null && row.createByid !== '' && row.createByid == acc.id;
    },
    handleApproval(row){
      //防重入：上一次请求还没返回时忽略重复点击
      if (this._evalDetailLoading) return;
      this._evalDetailLoading = true;
      //注意：不能在请求前重置form！el-radio-group的value变化（哪怕是代码赋值）会派发el.form.change
      //触发必填校验，弹窗已挂载但还没打开时会往控制台打"async-validator: isSatisfied is required"警告。
      //所以改为：确认要打开弹窗时才重置/填充form。
      getEvaluationBy(row.id).then((response) => {
        this._evalDetailLoading = false;
        if (response.code == 200) {
             //工单可能还没有评价记录，evaluation为null，必须判空（否则报错被catch吞掉，弹窗打不开）
             const ev = response.data.evaluation;
             if(ev == null || ev.id == null || ev.id == undefined){
                  //尚无评价：仅工单创建人可新增评价（不做机构类型控制）
                  if(!this.isOrderCreator(row)){
                    //未评价且不是创建人：直接提示，不动form（避免触发隐藏弹窗的校验）
                    this.msgInfo("该工单暂无评价");
                    return;
                  }
                  //创建人新增评价：此时才重置表单
                  this.resetEvalForm(row.id);
                  this.evalReadonly = false;
              }else{
                  //已评价：仅评价人本人可修改，处理人等其他查看者只读
                  this.evalReadonly = ev.createByid != (store.getters.roles.orgaccount || {}).id;
                  this.fillEvalForm(ev, row.id);
              }
              this.titleEval = this.evalReadonly ? "评价详情" : "工单评价";
              this.openEval = true;
              //清空上一次打开遗留的校验错误状态（否则"是否满意不能为空"等红字会直接显示）
              this.$nextTick(() => {
                this.$refs.evalForm && this.$refs.evalForm.clearValidate();
              });
           } else {
             this.msgSuccess("获取工单评价信息失败，" + response.msg);
             this.getList();
           }
         }).catch(() => {
           this._evalDetailLoading = false;
         });

    },
    //抑制一次change校验（与element-ui resetFields同机制）：
    //代码整体替换/清空form时，el-radio-group的value侦听器会派发el.form.change，
    //弹窗已挂载（含隐藏状态）时必填校验失败会往控制台打"async-validator: xxx is required"警告。
    //在重置form前调用本方法，可让这次程序赋值不触发校验。
    suppressChangeValidate(){
      const touched = [];
      ["evalForm", "form"].forEach((refName) => {
        const f = this.$refs[refName];
        if (f && f.fields) {
          f.fields.forEach((field) => { field.validateDisabled = true; });
          touched.push(f);
        }
      });
      if (touched.length) {
        //注意必须用setTimeout（宏任务）恢复：调用方都是"先suppress、后赋值form"，
        //Vue的$nextTick回调按注册顺序执行，若用nextTick注册恢复，恢复会先于watcher校验执行导致抑制失效；
        //setTimeout必然在本轮所有微任务（含watcher校验派发）之后执行
        setTimeout(() => {
          touched.forEach((f) => {
            f.fields.forEach((field) => { field.validateDisabled = false; });
          });
        }, 0);
      }
    },
    //重置评价表单为新增状态（整体替换form对象，保证评分/解决情况/标签字段是响应式的——Vue2直接加属性不触发视图更新）
    resetEvalForm(ordernum){
      this.suppressChangeValidate();
      this.form = {
        id: null,
        ordernum: ordernum,
        isSatisfied: undefined,
        unSatisfiedReason: null,
        evalContent: null,
        scoreResponse: 0,
        scoreQuality: 0,
        scoreAttitude: 0,
        scoreTotal: null,
        solvedStatus: null,
        evalTags: null
      };
      this.evalTagArr = [];
    },
    //填充已有评价数据到表单（整体替换保证响应式）
    fillEvalForm(ev, ordernum){
      //同样抑制一次change校验：历史评价数据（增强字段上线前）的solvedStatus/isSatisfied可能为null，
      //回显时radio值变化会触发必填校验失败，控制台打async-validator警告（且弹窗闪红字）
      this.suppressChangeValidate();
      this.form = {
        id: ev.id,
        ordernum: ordernum,
        isSatisfied: ev.isSatisfied,
        unSatisfiedReason: ev.unSatisfiedReason,
        evalContent: ev.evalContent,
        scoreResponse: ev.scoreResponse || 0,
        scoreQuality: ev.scoreQuality || 0,
        scoreAttitude: ev.scoreAttitude || 0,
        scoreTotal: ev.scoreTotal,
        solvedStatus: ev.solvedStatus,
        evalTags: ev.evalTags
      };
      this.evalTagArr = ev.evalTags ? ev.evalTags.split(',') : [];
    },
    //============【2-列表区】评价详情：只读查看（创建人/处理人都可点），未评价时提示
    handleEvalDetail(row){
      //防重入：上一次请求还没返回时忽略重复点击，避免弹出多条重复提示/打开多个弹窗
      if (this._evalDetailLoading) return;
      this._evalDetailLoading = true;
      //注意：请求前不重置form！未评价提前return时表单保持原样，避免el-radio-group值变化
      //触发隐藏弹窗的必填校验，往控制台打"async-validator: isSatisfied is required"警告。
      getEvaluationBy(row.id).then((response) => {
        this._evalDetailLoading = false;
        if (response.code == 200) {
             const ev = response.data.evaluation;
             if (ev == null) {
               //未评价：直接提示，不动form、不打开弹窗
               this.msgInfo("该工单暂无评价");
               return;
             }
             this.evalReadonly = true;
             this.fillEvalForm(ev, row.id);
             this.titleEval = "评价详情";
             this.openEval = true;
             this.$nextTick(() => {
               this.$refs.evalForm && this.$refs.evalForm.clearValidate();
             });
           } else {
             this.msgSuccess("获取工单评价信息失败，" + response.msg);
           }
         }).catch(() => {
           this._evalDetailLoading = false;
         });
    },
    //============【2-列表区】转入知识库
    handleKnowledge(row){
      this.$message.success("暂未开放");
    },       
    //############【3-表单】 取消按钮
    dialogone() {
      this.open = false;
      this.openEval = false;
      this.reset();
    },
    //***********【1-1筛选区】医院过滤
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
    //############【3-1表单】 表单重置
    reset() {
      //重置前先抑制一次change校验：isSatisfied/solvedStatus等必填项被清空时，
      //el-radio-group会派发el.form.change触发隐藏弹窗的校验，控制台打async-validator警告
      this.suppressChangeValidate();
      this.form = {
        id: null,
        documentNo: null,
        documentStatus: 0,
        reqDept: null,
        deptPhone: null,
        contacts: null,
        reqDatetime: null,
        serviceType: null,
        serviceClass: null,
        severity: null,
        urgency: null,
        happenPosition: null,
        serviceDetall: null,
        enclosure: null,
        assignDatetime: null,
        processDatetime: null,
        serviceConfirl: null,
        serviceFinished: null,
        isSatisfied: null,
        unSatisfiedReason: null,
        ordernum: null,
        evalContent: null,
        scoreResponse: 0,
        scoreQuality: 0,
        scoreAttitude: 0,
        scoreTotal: null,
        solvedStatus: null,
        evalTags: null
      };
      this.resetForm("form");
    },   
    //############【3-2表单】点击文件预览或下载
    onPreview(file) {
      window.open(file.url, "_blank");
    },
    /** 提交按钮 */
    submitForm() {
      //原有校验：满意/不满意与原因的联动
      if(this.form.isSatisfied==""||this.form.isSatisfied==null||this.form.isSatisfied==undefined){
        this.msgSuccess("请先选择是否满意！");
        return;
      }
      if(this.form.isSatisfied=="0"&&(this.form.unSatisfiedReason==""||this.form.unSatisfiedReason==null)){
        this.msgSuccess("请填写不满意原因！");
        return;
      }
      if(this.form.isSatisfied=="1"&&(this.form.unSatisfiedReason!=""&&this.form.unSatisfiedReason!=null)){
        this.msgSuccess("满意则不可填写不满意内容！");
        return;
      }
      //星级评价选填，未评分不拦截
      if(this.form.solvedStatus==null||this.form.solvedStatus===undefined){
        this.msgSuccess("请选择问题是否解决！");
        return;
      }
      //整体评分自动计算落库
      this.form.scoreTotal = this.evalScoreTotal;
      //标签转逗号串
      this.form.evalTags = this.evalTagArr.length > 0 ? this.evalTagArr.join(',') : "";
      this.$refs["evalForm"].validate((valid) => {
        if (valid) {
          if (this.form.id != null) {
            updateEvaluation(this.form).then((response) => {
              this.msgSuccess("修改成功");
              this.openEval = false;
              this.getList();
            }).catch(() => {});
          } else {
            addEvaluation(this.form).then((response) => {
              this.msgSuccess("新增成功");
              this.openEval = false;
              this.getList();
            }).catch(() => {});
          }
        }
      });
    },

    // /** 开始处理 */
    // handleUpdate(row) {
    //   this.reset();
    //   const id = row.id || this.ids;
    //   this.getUseruser();
    //   getRec(id).then((response) => {
    //     this.form = response.data;
    //     this.open = true;
    //     this.title = "处理";

    //     //计算时长
    //     var old_date = new Date(this.form.processDatetime);
    //     var new_date = new Date();
    //     var difftime = (new_date - old_date) / 1000; //计算时间差,并把毫秒转换成秒
    //     var days = parseInt(difftime / 86400); // 天  24*60*60*1000
    //     var hours = parseInt(difftime / 3600) - 24 * days; // 小时 60*60 总小时数-过去的小时数=现在的小时数
    //     var minutes = parseInt((difftime % 3600) / 60); // 分钟 -(day*24) 以60秒为一整份 取余 剩下秒数 秒数/60 就是分钟数
    //     if (days == 0) {
    //       this.form.processDuration = hours + "时" + minutes + "分";
    //       if (hours == 0) {
    //         this.form.processDuration = minutes + "分";
    //       } else {
    //         this.form.processDuration = hours + "时" + minutes + "分";
    //       }
    //     } else {
    //       this.form.processDuration =
    //         days + "天" + hours + "时" + minutes + "分";
    //     }
    //   });
    // },
  },
};
</script>
<style scoped lang="scss">
.app-container {
  overflow: hidden;
  /* el-tabs 层级打断高度链：用 flex 链把固定高度穿透到 el-tab-pane，
     否则 contain-cont 的 calc(100% - 55px) 对 auto 父级失效，表格被压扁/裁剪 */
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
    // height: 55px;
    flex-shrink: 0;
    .el-form-item {
      margin-bottom: 10px;
    }
  }
  .contain-cont {
    height: calc(100% - 55px);
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

.widthClass {
  width:200px;
}

</style>
