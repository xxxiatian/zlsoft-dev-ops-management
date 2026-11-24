<template>
  <div class="app-container">
    <el-tabs v-model="activeTab" @tab-click="handleTabClick">
      <el-tab-pane label="待处理列表" name="rec">
    <div class="contain-top">
      <el-form  :model="queryParams"  ref="queryForm"  v-show="showSearch"  :inline="true" label-width="68px">
      <el-form-item  label="医院" prop="orgid">
          <el-select v-model="queryParams.orgid"   placeholder="请选择机构" :remote-method="remoteOrg" class="widthClass"  filterable remote clearable>
            <el-option
              v-for="dict in orgOptions"
              :key="dict.orgid"
              :label="dict.orgname"
              :value="dict.orgid"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="服务单号" prop="id">
          <el-input v-model="queryParams.id"       placeholder="请输入服务单号" @keyup.enter.native="handleQuery" size="small"  class="widthClass" clearable />
        </el-form-item>
        <el-form-item label="联系人员" prop="contacts">
          <el-input v-model="queryParams.contacts" placeholder="请输入联系人员" @keyup.enter.native="handleQuery" size="small" class="widthClass" clearable  />
        </el-form-item>
        <el-form-item>
          <el-button  type="primary" size="mini"  icon="el-icon-search" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="contain-cont">
      <el-table :data="recList" v-loading="loading" @selection-change="handleSelectionChange"
        table-cloumn element-loading-text="拼命加载中" height="calc(100% - 50px)"  border>
        <el-table-column  width="50px"  align="center"  type="selection" />
        <el-table-column  width="120px" align="center"  label="服务单号"  prop="id"       :show-overflow-tooltip="true" fixed />
        <el-table-column  width="170px" align="center"  label="问题概述"  prop="title"    :show-overflow-tooltip="true" />   
        <el-table-column  width="400px" align="center"  label="服务详细描述"  prop="describe"  :show-overflow-tooltip="true"  />
        <el-table-column  width="150px" align="center"  label="申请医院"  prop="orgname"  :show-overflow-tooltip="true"  />
        <el-table-column  width="100%"  align="center"  label="申请科室"  prop="unitname" />
        <el-table-column  width="140px" align="center"  label="联系人员"  prop="contacts" />
        <el-table-column  width="110px" align="center"  label="联系电话"  prop="tel" />
        <!-- <el-table-column  width="110px" align="center"  label="QQ号码"   prop="qqnum" />        -->
        <el-table-column  width="155px" align="center"  label="申请时间"  prop="createAt"></el-table-column>
        <el-table-column  width="155px" align="center"  label="期望时间"  prop="desiretime"></el-table-column>
        <el-table-column  width="155px" align="center"  label="安排时间"  prop="arrangetime" />
        <el-table-column  width="150px" align="center"  label="处理人"    prop="currentusername" />       
        <el-table-column  width="100%"  align="center"  label="工单状态"  prop="orderstatus" />    
        <el-table-column  width="320px" align="center"  label="操作" fixed="right" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button  id="btn" size="mini" type="text" icon="el-icon-edit" v-hasPermi="['system:rec:over']" @click="handleFinish(scope.row)"
              v-if="showBtn(scope.row,'完成')">完成</el-button>
            <!-- <el-button
              id="btn"
              size="mini"
              type="text"
              icon="el-icon-edit"
              v-hasPermi="['system:rec:edit']"
              @click="tranSferg(scope.row)"
              >转接</el-button
            > -->
            <!-- <el-button
              id="btn"
              size="mini"
              type="text"
              icon="el-icon-edit"
              v-hasPermi="['system:rec:back']"
              @click="Back(scope.row)"
              >退回</el-button
            > -->            
            <el-button size="mini" type="text" icon="el-icon-warning-outline" @click="handlestop(scope.row)" v-hasPermi="['system:rec:over']"
              v-if="showBtn(scope.row,'终止')">终止</el-button>
            <el-button size="mini" type="text" icon="el-icon-position" @click="handleTransDept(scope.row)" v-hasPermi="['system:rec:derpt']"
              v-if="showBtn(scope.row,'转部门')">转部门</el-button>
            <el-button size="mini" type="text" icon="el-icon-tickets" @click="showDetail(scope.row)" v-hasPermi="['system:rec:query']">详情</el-button>
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

      <!---工单完成 对话框--->
      <el-dialog :title="title" :visible.sync="open" width="1000px" append-to-body :close-on-click-modal="false">
        <el-form ref="form" :model="form" :rules="rules" label-width="80px">
          <el-row>
            <el-col :span="12">
              <el-form-item label="联系人员" prop="contacts">
                <el-input  v-model="form.contacts"  placeholder="请输入内容联系人员" style="width: 220px"   disabled></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="联系电话" prop="tel">
                <el-input  v-model="form.tel"       placeholder="请输入联系电话"  style="width: 220px"    disabled></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="申请科室" prop="unitname">
                <el-input  v-model="form.unitname"  placeholder="请输入内容"   style="width: 220px"     disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="申请时间" prop="createAt">
                <el-date-picker  v-model="form.createAt"  placeholder="选择申请时间"  type="datetime" size="small" disabled>
                </el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="8">
              <el-form-item label="处理人" prop="currentusername">
                <el-input  v-model="form.currentusername" placeholder="请输入发生处理人"  style="width: 220px" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="处理方式" prop="processing">
                <el-input  v-model="form.processing" placeholder="请输入处理方式"  style="width: 220px"  disabled/>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="服务分类" prop="servicetype">
                <el-input  v-model="form.servicetype"  placeholder="请输入服务分类" style="width: 220px"  disabled/>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="问题概述" prop="title">
                <el-input  disabled v-model="form.title" placeholder="请输入内容" />
              </el-form-item>
            </el-col>
            <!-- <el-col :span="12" v-if="this.zjshow">
              <el-form-item label="转接人" prop="currentuserid">
                <el-select  v-model="form.currentuserid"  placeholder="请选择转接人">
                  <el-option
                    v-for="dict in personlist"
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
              <el-form-item label="问题描述" prop="describe">
                <el-input disabled type="textarea" :rows="4" v-model="form.describe"  placeholder="请输入内容" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="处理方法" prop="disposal">
                <el-input type="textarea"  v-model="form.disposal" placeholder="请输入处理方法" />
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
          <el-button type="primary" :disabled="isButtonDisabled" @click="submitForm">确 定</el-button>
          <el-button @click="dialogone">取 消</el-button>
        </div>
      </el-dialog>

      <!-- 转部门或终止对话框 -->
      <el-dialog  :title="title" :visible.sync="zjopen" width="1000px"  append-to-body  :close-on-click-modal="false">
        <el-form ref="form" :model="form" :rules="ruless" label-width="80px">
          <el-row>
            <el-col :span="12">
              <el-form-item label="联系人员" prop="contacts">
                <el-input v-model="form.contacts" placeholder="请输入内容联系人员"  style="width: 220px"  disabled  ></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="联系电话" prop="tel">
                <el-input v-model="form.tel" placeholder="请输入联系电话" style="width: 220px" ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="申请科室" prop="unitname">
                <el-input v-model="form.unitname"  placeholder="请输入内容" style="width: 220px" disabled ></el-input>
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
                <el-select v-model="form.currentuserid" placeholder="请选择处理人" style="width: 220px">
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
                <el-select  v-model="form.processing"  placeholder="请选择处理方式">
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
                <el-select v-model="form.servicetype" placeholder="请选择服务分类" style="width: 237px">
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
                <el-input  v-model="form.title"  placeholder="请输入内容" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="终止原因" prop="stopter">
                <el-input  v-model="form.stopter"  placeholder="请输入发生终止原因"  />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="问题描述" prop="describe">
                <el-input v-model="form.describe" placeholder="请输入内容" type="textarea" :rows="5" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="处理方法" prop="disposal">
                <el-input v-model="form.disposal"  placeholder="请输入处理方法" type="textarea"  />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="转交部门" prop="currentunitid">
                <el-select v-model="form.currentunitid" placeholder="请选择转交部门"  @change="chanUnit">
                  <el-option
                    v-for="dict in deptList"
                    :key="dict.id"
                    :label="dict.name"
                    :value="dict.id"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="转接人" prop="currentuserid">
                <el-select  v-model="form.currentuserid" placeholder="请选择转接人">
                  <el-option
                    v-for="dict in personlist"
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
          <el-button v-show="zjshow" type="warning" :disabled="isButtonDisabled"  @click="transDept">转 交</el-button>
          <el-button v-show="stopshow" type="danger" :disabled="isButtonDisabled"  @click="stopForm">终 止</el-button>
          <!-- <el-button type="primary" @click="modifyForm">修 改</el-button> -->
          <el-button @click="dialogone">取 消</el-button>
        </div>
      </el-dialog>

      <!-- 工单详情对话框 -->
      <el-dialog  :title="title"  :visible.sync="detailOpen" width="1000px" append-to-body :close-on-click-modal="false">
        <div>
          <div>
            <el-form ref="form" :model="form" :rules="ruless" label-width="80px">
              <el-row>
                <el-col :span="6"> 
                  <el-form-item label="联系人员" prop="contacts">
                    <el-input v-model="form.contacts"  placeholder="请输入内容联系人员"  style="width: 143px" ></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="联系电话" prop="tel">
                    <el-input v-model="form.tel" placeholder="请输入联系电话" style="width: 143px" ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
                  <el-row>
                <el-col :span="6">
                  <el-form-item label="申请科室" prop="unitname">
                    <el-input v-model="form.unitname"  placeholder="请输入内容" style="width: 143px"  ></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="处理人" prop="currentusername">
                    <el-input v-model="form.currentusername"  placeholder="请输入处理人" style="width: 143px" />
                  </el-form-item>
                </el-col>
                
              </el-row>
              <el-row>
                <el-col>
                  <el-form-item label="申请时间" prop="createAt">
                    <el-date-picker v-model="form.createAt"  placeholder="选择申请时间" size="small" type="datetime"  >
                    </el-date-picker>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="6">
                  <el-form-item label="问题概述" prop="title">
                    <el-input v-model="form.title"  placeholder="请输入内容"  style="width: 383px"  />
                      </el-form-item>
                    </el-col>
                <el-col>
                  <el-form-item label="问题描述" prop="describe">
                    <el-input  v-model="form.describe" placeholder="请输入内容"  style="width: 383px" type="textarea" :rows="8"  />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="附件" prop="enclosure">
                    <el-upload :file-list="fileList" :http-request="requestUpload"
                      class="file-upload"
                      style="width: 62%"
                      action="#"
                      :on-remove="handleRemove"
                      multiple                                           
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
                      <span><i class="el-icon-user"></i>{{ item.createBy }}(电话:{{  item.tel }}) {{ item.orderstatus }}</span>
                      {{ item.tousername }}
                    </div>
                    <div>
                      <span><i class="el-icon-edit-outline"></i> {{ item.orderstatus=='终止问题'?(item.disposal ? item.disposal:stopReason):item.disposal }}</span>
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
    </div>
      </el-tab-pane>
      <!--开发项目页签：派给我（负责人/实施人员）的开发项目，不动工单逻辑。仅服务商（河南中联）可见-->
      <el-tab-pane label="待处理项目" name="mine" v-if="isProviderOrg">
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
            <el-table-column label="登记人" width="100px" align="center" prop="createBy" />
            <el-table-column label="登记时间" width="160px" align="center" prop="createAt" sortable />
            <el-table-column label="操作" align="center" width="140px" fixed="right">
              <template slot-scope="scope">
                <el-button size="mini" type="text" icon="el-icon-tickets" @click="mineDetails(scope.row)">详情</el-button>
                <!--按验收状态显示对应操作按钮，状态流转：未实施→正在实施→已实施未验收→已验收-->
                <el-button v-if="scope.row.acceptStatus == 2 || scope.row.acceptStatus == null" size="mini"
                  type="text" icon="el-icon-video-play" @click="handleMineStart(scope.row)">开始实施</el-button>
                <el-button v-else-if="scope.row.acceptStatus == 4" size="mini"
                  type="text" icon="el-icon-finished" @click="handleMineComplete(scope.row)">实施完成</el-button>
                <el-button v-else-if="scope.row.acceptStatus == 3" size="mini"
                  type="text" icon="el-icon-circle-check" @click="handleMineComplete(scope.row)">验收登记</el-button>
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
                  <el-input style="width: 78%" :value="parseTime(mineForm.requireDate)" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="实际完成时间">
                  <el-input style="width: 78%" :value="parseTime(mineForm.finishDate)" disabled />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="验收时间">
                  <el-input style="width: 78%" :value="parseTime(mineForm.acceptDate)" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="登记人">
                  <el-input style="width: 78%" v-model="mineForm.createBy" disabled />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col>
                <el-form-item label="完成情况">
                  <el-input v-model="mineForm.projectStatus" type="textarea" style="width:90%;" :rows="3" disabled />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col>
                <el-form-item label="备注信息">
                  <el-input v-model="mineForm.remark" type="textarea" style="width:90%;" :rows="2" disabled />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col>
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
            <el-row>
              <el-col :span="22" style="margin-left: 3%;">
                <el-form-item label="联系人信息" label-width="100px"></el-form-item>
                <el-table :data="mineContacts" border>
                  <el-table-column label="姓名" min-width="30%" align="center" prop="contactName" />
                  <el-table-column label="职务" min-width="30%" align="center" prop="contactPost" />
                  <el-table-column label="电话" min-width="40%" align="center" prop="contactTel" />
                </el-table>
              </el-col>
            </el-row>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="mineOpen = false">关 闭</el-button>
          </div>
        </el-dialog>
        <!--开发项目状态流转登记对话框：实施完成登记/验收登记，按目标状态显示对应字段-->
        <el-dialog :title="completeTitle" :visible.sync="completeOpen" width="50%" append-to-body :close-on-click-modal="false">
          <el-form ref="completeForm" :model="completeForm" :rules="completeRules" label-width="110px" style="margin-left:3%;">
            <el-row>
              <el-col :span="12">
                <el-form-item label="项目名称">
                  <el-input style="width: 78%" v-model="completeForm.projectName" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="对应合同">
                  <el-input style="width: 78%" v-model="completeForm.contractName" disabled />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="登记状态">
                  <!--状态由操作按钮决定，自动流转，不可修改-->
                  <el-input style="width: 78%" :value="mineStatusFormat(completeForm.acceptStatus)" disabled />
                </el-form-item>
              </el-col>
            </el-row>
            <!--实施完成登记（正在实施→已实施未验收）：填写实际完成时间/项目完成情况-->
            <el-row v-if="completeForm.acceptStatus == '3'">
              <el-col :span="12">
                <el-form-item label="实际完成时间" prop="finishDate">
                  <el-date-picker style="width: 78%" v-model="completeForm.finishDate" type="date"
                    value-format="yyyy-MM-dd HH:mm:ss" placeholder="选择实际完成时间" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row v-if="completeForm.acceptStatus == '3'">
              <el-col :span="24">
                <el-form-item label="项目完成情况" prop="projectStatus">
                  <el-input v-model="completeForm.projectStatus" type="textarea" :rows="4"
                    placeholder="文字描述项目进度及完成情况" />
                </el-form-item>
              </el-col>
            </el-row>
            <!--验收登记（已实施未验收→已验收）：填写验收时间-->
            <el-row v-if="completeForm.acceptStatus == '1'">
              <el-col :span="12">
                <el-form-item label="验收时间" prop="acceptDate">
                  <el-date-picker style="width: 78%" v-model="completeForm.acceptDate" type="date"
                    value-format="yyyy-MM-dd HH:mm:ss" placeholder="选择验收时间" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="附件">
                  <!--已有附件保留展示，可继续追加新附件（如验收报告图片），删除仅移除本次列表中的文件-->
                  <el-upload
                    class="file-upload"
                    style="width: 62%"
                    action="#"
                    :file-list="mineFileList"
                    :http-request="mineRequestUpload"
                    :on-preview="onPreview"
                    :on-remove="mineRemoveFile"
                    multiple
                  >
                    <el-button size="mini" type="primary">点击上传</el-button>
                  </el-upload>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button type="primary" :loading="completeLoading" @click="submitMineComplete">确 定</el-button>
            <el-button @click="completeOpen = false">取 消</el-button>
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
  pendingList,
  ovEr,
  tranSfer,
  personList,
  backOrder,
  deprtList,
  DisposalList,
  stopOrder,
  orgHospitallist,
} from "@/api/order/service/rec";
import { parseTime } from "@/utils/zlsoft";
// import { listUser, getUserProfile } from "@/api/system/user";
// import { listDept } from "@/api/system/dept";
import Treeselect from "@riophae/vue-treeselect";
import { unitList } from "@/api/system/dept";
import { uploadFile, serverUrl, toFilePath, resolveFileUrl } from "@/api/common/file";
import { listMine, getMine, updateMineStatus } from "@/api/develop/devproject";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import store from "@/store";
export default {
  name: "Rec",
  components: {
    Treeselect,
  },

  data() {
    return {
      // 当前页签：rec-待处理列表，mine-开发项目
      activeTab: "rec",
      // 开发项目页签
      mineList: [], // 派给我的开发项目
      mineLoading: false,
      mineTotal: 0, // 开发项目总数
      mineQueryParams: { pageNum: 1, pageSize: 10 }, // 开发项目分页参数
      mineFilter: "", // 过滤关键字
      mineLoaded: false, // 是否已加载过
      mineOpen: false, // 开发项目详情对话框
      mineForm: {}, // 开发项目详情
      mineContacts: [], // 开发项目联系人
      mineStatusOptions: [], // 验收状态字典
      completeOpen: false, // 项目状态流转登记对话框
      completeTitle: "", // 对话框标题（实施完成登记/项目验收登记）
      completeLoading: false, // 状态流转提交中
      completeForm: {}, // 状态流转表单
      mineFileList: [], // 状态流转对话框附件（含已有附件+本次新增）
      mineDetailFileList: [], // 开发项目详情附件（只读展示）
      completeRules: {
        finishDate: [{ required: true, message: "请选择实际完成时间", trigger: "change" }],
        acceptDate: [{ required: true, message: "请选择验收时间", trigger: "change" }],
        projectStatus: [{ required: true, message: "请填写项目完成情况", trigger: "blur" }],
      },
      deptList: [],//转交部门
      options: [],//机构初始数据
      orgOptions: [],//机构下拉
      loading: true,
      exportLoading: false, //导出遮罩层
      detailOpen: false, //详情对话框
      zjshow: false, //转交页面下的转交按钮
      stopshow: false,//终止窗口下的终止按钮
      ids: [],// 选中数组
      fileList: [],//上传文件列表
      serviceclassOptions: [],//服务分类 下拉
      servicetypeOptions: [],//处理方式 下拉
      personlist: [],    
      showSearch: true,// 显示搜索条件
      zjopen: false, //转交、终止对话框     
      total: 0,// 总条数
      recList: [], //工单列表数据
      statusOptions: [],//工单处理状态
      disposalList: [], //工单流转记录     
      title: "",// 弹出层标题   
      open: false,//工单新增或修改、工单完成 对话框
      overgd: 0,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        id: null,
        contacts: null,
        orgid:null
      },
      form: {},// 表单参数
      // 表单校验
      rules: {},
      ruless: {
        contacts: [ { required: true, message: "联系人员为空", trigger: "blur" } ],
        createAt: [ { required: true, message: "申请时间不能为空", trigger: "blur" }],
        tel: [{ required: true, message: "联系电话不能为空", trigger: "blur" }],
        describe: [ { required: true, message: "服务详细描述不能为空", trigger: "blur" }],
      },
      isButtonDisabled: false,
      timeoutId: null,
      glshow: store.getters.roles.organizationtype, //0 root,1 管理机构,2 服务商，3 医疗机构
      stopReason:""  //终止原因
    };
  },
  created() {
    this.dateRange = [this.newDate, parseTime(new Date())];
    //工单状态
    this.getDicts("sys_document_status").then((response) => {
      this.statusOptions = response.data;
    }); 
    //处理方式
    this.getDicts("sys_severity_status").then((response) => {
      this.servicetypeOptions = response.data;
    });
    //机构
    orgHospitallist().then((res) => {
      this.options = res.data;
    });
    //服务分类
    this.getDicts("sys_cancels_order").then((response) => {
      this.serviceclassOptions = response.data;
    });
    //开发项目验收状态
    this.getDicts("sys_dev_accept_status").then((response) => {
      this.mineStatusOptions = response.data;
    });
    //开发项目列表：进入页面即加载，无需等tab切换（仅服务商河南中联可见）
    if (this.isProviderOrg) {
      this.loadMineList();
    }
    //工单列表
    this.getList();
  },

  computed: {
    //开发项目仅服务商类型下的河南中联机构可见
    isProviderOrg() {
      const roles = store.getters.roles || {};
      const org = roles.orgaccount || {};
      return roles.organizationtype == 2 && org.orgname === "河南中联";
    },
    //开发项目按项目名称/用户名称过滤
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
    handleTabClick(tab) {
      if (tab.name === "mine") {
        this.loadMineList();
      }
    },
    //************【开发项目页签】加载派给我的开发项目（负责人或实施人员是自己，分页） */
    loadMineList() {
      this.mineLoading = true;
      listMine({ ...this.mineQueryParams, projectName: this.mineFilter || "" }).then((response) => {
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
    //************【开发项目页签】开始实施（未实施→正在实施）：确认后直接流转 */
    handleMineStart(row) {
      this.$confirm("确认开始实施该项目？状态将变更为「正在实施」", "开始实施", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        updateMineStatus({ id: row.id, acceptStatus: "4" }).then(() => {
          this.msgSuccess("已开始实施");
          this.loadMineList();
        });
      }).catch(() => {});
    },
    //************【开发项目页签】状态流转登记：正在实施→实施完成登记；已实施未验收→验收登记 */
    handleMineComplete(row) {
      //根据当前状态决定目标状态：正在实施(4)→已实施未验收(3)，已实施未验收(3)→已验收(1)
      const target = row.acceptStatus == 4 ? "3" : "1";
      this.completeTitle = target == "3" ? "实施完成登记" : "项目验收登记";
      this.mineFileList = [];
      this.completeForm = {
        id: row.id,
        projectName: row.projectName,
        contractName: row.contractName,
        //目标状态由按钮决定，自动流转
        acceptStatus: target,
        finishDate: row.finishDate || "",
        projectStatus: row.projectStatus || "",
        acceptDate: row.acceptDate || "",
        //已有附件保留，本次可继续追加新附件
        enclosure: row.enclosure || "",
      };
      if (row.enclosure != null && row.enclosure != "") {
        row.enclosure.split(",").forEach((item) => {
          const file = item.split("::");
          //path 存相对路径（兼容历史绝对地址），展示用 resolveFileUrl 动态拼当前文件服务地址
          this.mineFileList.push({ url: resolveFileUrl(file[0]), path: toFilePath(file[0]), name: file[1] });
        });
      }
      this.completeOpen = true;
      this.$nextTick(() => {
        if (this.$refs.completeForm) {
          this.$refs.completeForm.clearValidate();
        }
      });
    },
    //************【开发项目页签】项目完成：上传附件（覆盖默认上传行为，追加到附件列表） */
    mineRequestUpload(imageData) {
      const file = imageData.file;
      const formData = new FormData();
      formData.append("file", file);
      uploadFile(formData).then((response) => {
        if (response.code == 200) {
          //新附件只存相对路径（如 /profile/upload/...），展示时动态拼当前文件服务地址，换域名无需迁移数据
          this.mineFileList.push({
            url: serverUrl + response.fileName,
            path: response.fileName,
            name: file.name,
          });
          this.completeForm.enclosure = this.mineFileList
            .map((ele) => (ele.path || toFilePath(ele.url)) + "::" + ele.name)
            .join(",");
        } else {
          this.$message.error(response.msg);
        }
      }).catch(() => {});
    },
    //************【开发项目页签】状态流转登记：移除附件（同步更新提交的附件串） */
    mineRemoveFile(file) {
      this.mineFileList.splice(this.mineFileList.indexOf(file), 1);
      this.completeForm.enclosure = this.mineFileList
        .map((ele) => (ele.path || toFilePath(ele.url)) + "::" + ele.name)
        .join(",");
    },
    //************【开发项目页签】状态流转登记：提交 */
    submitMineComplete() {
      this.$refs.completeForm.validate((valid) => {
        if (valid) {
          this.completeLoading = true;
          updateMineStatus(this.completeForm).then(() => {
            this.msgSuccess("登记成功");
            this.completeOpen = false;
            this.completeLoading = false;
            //当前页登记完成后若已空，回退一页再刷新
            if (this.mineList.length === 1 && this.mineQueryParams.pageNum > 1) {
              this.mineQueryParams.pageNum--;
            }
            this.loadMineList();
          }).catch(() => {
            this.completeLoading = false;
          });
        }
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
    //************【1-筛选区】查询列表方法 */
    getList() {
      this.loading = true;
      this.recList =[]
      pendingList(this.queryParams).then((response) => {
        this.recList = response.rows;
        this.total = response.total;
        this.recList.forEach((obj1) => {
          if (obj1.servicetype != null && obj1.servicetype != undefined) {
            let servicetype = obj1.servicetype.toString();
            const matchedObj2 = this.serviceclassOptions.find((obj3) => obj3.dictValue === servicetype);
            if (matchedObj2) {
              obj1.servicetype = matchedObj2.dictLabel;
            }
          }
          if (obj1.processing != null && obj1.processing != undefined) {
            let processing = obj1.processing.toString();
            const matchedObj3 = this.servicetypeOptions.find( (obj4) => obj4.dictValue === processing );
            if (matchedObj3) {
              obj1.processing = matchedObj3.dictLabel;
            }
          }
        });
        this.loading = false;
      });
    },
    //************【1-筛选区】搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    //************【1-筛选区】 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },    
    //************【1-筛选区】 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
    },

    //============【2-列表区】 查看详情 */
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
        this.stopReason = row.stopter;//终止原因 
        this.form.tel = row.tel;  
        this.title = "派单详情";
        this.detailOpen = true; 
      });
    },
    //============【2-列表区】列表操作--终止
    handlestop(row) {
      this.zjshow = false;//转交按钮
      this.stopshow = true;//终止按钮
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
        this.zjopen = true;//终止对话框
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
    //============【2-列表区】列表操作--转部门
    handleTransDept(row) {
      
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
        this.form.currentuserid = "";
        
        if (row.servicetype == null || row.servicetype == undefined || row.servicetype == "") {
          this.servicetype = 1;
        }
        if (row.processing == null || row.processing == undefined || row.processing == "") {
          this.processing = 1;
        }
      });
      unitList().then((response) => {
        this.deptList = response.data;
      });

      this.title = "工单处理详情";
      this.zjshow = true;    //转交按钮
      this.stopshow = false; //终止按钮
      this.zjopen = true;    //转交对话框

    }, 
    //============【2-列表区】列表的完成按钮
    handleFinish(row) {
      this.overgd = 1;
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
        this.form.id = row.id;

        this.title = "工单完成";
        this.open = true;
      });
    },       
    //############【3-表单】转交部门
    transDept() {
      this.stopDoub()
      this.$refs["form"].validate((valid) => {
        this.form.desiretime = parseTime( this.form.desiretime, "{y}-{m}-{d} {h}:{i}:{s}" );
        this.form.createAt = parseTime( this.form.createAt,"{y}-{m}-{d} {h}:{i}:{s}" );
        if (valid) {
          if ( this.form.currentunitid == null || this.form.currentunitid == undefined || this.form.currentunitid == "" ) {
            this.msgError("请填写转交部门！");
            return;
          }
          if ( this.form.servicetype != null && this.form.servicetype != undefined && this.form.servicetype != "") {
            let servicetypee = this.serviceclassOptions.find((item) => item.dictLabel === this.form.servicetype)?.dictValue;
            this.form.servicetype = Number(servicetypee);
          }
          if ( this.form.processing != null && this.form.processing != undefined && this.form.processing != "") {
            let serverityy = this.servicetypeOptions.find( (item) => item.dictLabel === this.form.processing )?.dictValue;
            this.form.processing = Number(serverityy);
          }
          if (this.form.id != null) {
            deprtList(this.form).then((response) => {
              if(response.code==200){
                this.msgSuccess("转交成功");
                // this.open = false;
                this.zjopen = false;
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
    //############【3-表单】终止按钮
    stopForm() {
      this.stopDoub()
      this.$refs["form"].validate((valid) => {
        this.form.desiretime = parseTime( this.form.desiretime, "{y}-{m}-{d} {h}:{i}:{s}");
        this.form.createAt = parseTime( this.form.createAt, "{y}-{m}-{d} {h}:{i}:{s}");
        if (valid) {
          // if (this.form.stopter == null || this.form.stopter == undefined || this.form.stopter == "") {
          if (!this.form.stopter){
            this.msgError("请填写终止原因！");
            return;
          }
          if (this.form.servicetype != null && this.form.servicetype != "" ) {
            let servicetypee = this.serviceclassOptions.find( (item) => item.dictLabel === this.form.servicetype )?.dictValue;
            this.form.servicetype = Number(servicetypee);
          }
          if ( this.form.processing != null && this.form.processing != "" ) {
            let serverityy = this.servicetypeOptions.find( (item) => item.dictLabel === this.form.processing)?.dictValue;
            this.form.processing = Number(serverityy);
          }
          if (this.form.id != null) {
            stopOrder(this.form).then((response) => {
              if(response.code==200){
                this.msgSuccess("终止成功");
                // this.open = false;
                this.zjopen = false;
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
    //############【3-表单】 提交按钮 */
    submitForm() {
      this.stopDoub()
      if (this.overgd == 1) {
        if (this.form.disposal == null || this.form.disposal == undefined || this.form.disposal == "") {
          this.msgError("请填写处理方法");
          return;
        }
        this.$refs["form"].validate((valid) => {
          if ( this.form.servicetype != null &&  this.form.servicetype != undefined &&  this.form.servicetype != "") {
            let servicetypee = this.serviceclassOptions.find( (item) => item.dictLabel === this.form.servicetype )?.dictValue;
            this.form.servicetype = Number(servicetypee);
          }
          if ( this.form.processing != null &&  this.form.processing != undefined &&  this.form.processing != "" ) {
            let serverityy = this.servicetypeOptions.find( (item) => item.dictLabel === this.form.processing )?.dictValue;
            this.form.processing = Number(serverityy);
          }
          if (valid) {
            if (this.form.id != null) {
              ovEr(this.form).then((response) => {
                if(response.code==200){
                  this.msgSuccess("处理成功");
                  this.open = false;
                  this.getList();
                }else{
                  this.msgError(response.message);
                }
              }).catch(() => {});
            }
          }
        });
      } else {
        if ( this.form.currentuserid == null || this.form.currentuserid == undefined || this.form.currentuserid == "" ) {
          this.msgError("请选择转接人");
          return;
        }
        this.$refs["form"].validate((valid) => {
          if ( this.form.servicetype != null &&  this.form.servicetype != undefined &&  this.form.servicetype != "") {
            let servicetypee = this.serviceclassOptions.find( (item) => item.dictLabel === this.form.servicetype )?.dictValue;
            this.form.servicetype = Number(servicetypee);
          }
          if ( this.form.processing != null && this.form.processing != undefined && this.form.processing != "") {
            let serverityy = this.servicetypeOptions.find( (item) => item.dictLabel === this.form.processing )?.dictValue;
            this.form.processing = Number(serverityy);
          }
          if (valid) {
            if (this.form.id != null) {
              tranSfer(this.form).then((response) => {
                this.msgSuccess("转接成功");
                this.open = false;
                this.getList();
              }).catch(() => {});
            }
          }
        });
      }
    },         
    //############【3-表单】 取消按钮
    dialogone() {
      this.open = false;
      this.zjopen = false;
      this.reset();
    },
    //************【1-1表单】医院过滤
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
    //=============【2-1列表】操作按钮显示
    showBtn(row,btnName){
      if(btnName=="派单"){
        if(((row.orderstatus == '服务分配' ||  row.orderstatus == '服务处理') && this.glshow == '2') ||
           (row.orderstatus == '院内分配' && this.glshow=='3')  ||
           this.glshow == '0'
           ){
              return true;
           }else{
              return false;
           }
      }else if(btnName=="接单"){
        if((row.orderstatus == '服务分配' && this.glshow == '2') ||  
           (row.orderstatus == '院内分配' && this.glshow == '3') ||
           this.glshow == '0'
           ){
              return true;
           }else{
              return false;
           }
      }else if(btnName=="完成"){
        if(((row.orderstatus == '院内分配' || row.orderstatus == '院内处理' || row.orderstatus == '问题下单') && this.glshow == '3')||
           (row.orderstatus !== '服务终止' && row.orderstatus !== '服务完成' && this.glshow == '2') ||
           this.glshow == '0'){
              return true;
           }else{
              return false;
           }
      }else if(btnName=="终止"){
        if(((row.orderstatus == '院内分配' || row.orderstatus == '院内处理' || row.orderstatus == '问题下单') && this.glshow == '3')||
           (row.orderstatus !== '服务终止' && row.orderstatus !== '服务完成' && this.glshow == '2') ||
           this.glshow == '0'){
              return true;
           }else{
              return false;
           }
      }else if(btnName=="转部门"){
        if( ((row.orderstatus == '院内分配' || row.orderstatus == '问题下单') && this.glshow == '3')||
            (row.orderstatus !== '服务终止' && row.orderstatus !== '服务完成' && this.glshow == '2')||
           this.glshow == '0'){
              return true;
          }else{
              return false;
          }
      }
    },       
    //############【3-1表单】表单重置
    reset() {
      this.form = {
        id: null,
        contacts: null,
        createAt: this.dateRange[1],
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
        currentuserid: null,
        currentunitid: null,
      };
      this.resetForm("form");
    },
    //############【3-2表单】转部门选转接人
    chanUnit(value) {
      personList({ unitid: value }).then((response) => {
        this.personlist = response.data;
      });
    },
    //############【3-3表单】覆盖默认的上传行为
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
    //############【3-3表单】点击文件预览或下载
    onPreview(file) {
      window.open(file.url, "_blank");
    },
    //############【3-3表单】删除文件
    handleRemove(file) {
      this.fileList.splice(this.fileList.indexOf(file), 1);
    },
    //############【3-4表单】禁止双击
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
    
   Back(row) {
      this.form.tel = row.tel;
      this.form.processing = row.processing;
      this.form.servicetype = row.servicetype;
      this.form.currentusername = row.currentusername;
      this.form.id = row.id;
      this.form.contacts = row.contacts;
      this.form.createAt = row.createAt;
      this.form.unitname = row.unitname;
      this.form.unitid = row.unitid;
      this.form.scopetype = row.scopetype;
      this.form.desiretime = row.desiretime;
      this.form.stopter = row.stopter;
      this.form.disposal = row.disposal;
      this.form.currentuserid = row.currentuserid;
      this.form.orderstatus = row.orderstatus;
      if (this.form.servicetype != null && this.form.servicetype != undefined && this.form.servicetype != "") {
        let servicetypee = this.serviceclassOptions.find((item) => item.dictLabel === this.form.servicetype)?.dictValue;
        this.form.servicetype = Number(servicetypee);
      }
      if (this.form.processing != null && this.form.processing != undefined && this.form.processing != "") {
        let serverityy = this.servicetypeOptions.find( (item) => item.dictLabel === this.form.processing )?.dictValue;
        this.form.processing = Number(serverityy);
      }
      if (this.form.orderstatus != null && this.form.orderstatus != undefined && this.form.orderstatus != "") {
        let orderstatus = this.statusOptions.find( (item) => item.dictLabel === this.form.orderstatus)?.dictValue;
        this.form.orderstatus = Number(orderstatus);
      }
      if (this.form.id != null) {
        const Form = this.form;
        const ids = row.id || this.ids;
        this.$confirm('您确定退回订单"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(function () {
            return backOrder(Form);
          })
          .then(() => {
            this.getList();
            this.msgSuccess("退回成功");
          })
          .catch(() => {});
      }
    },    

    // tranSferg(row) {
    //   this.overgd = 0;
    //   this.reset();
    //   personList({ unitid: row.unitid }).then((response) => {
    //     this.personlist = response.data;
    //   });
    //   this.open = true;
    //   this.zjshow = true;
    //   this.title = "工单处理";
    //   this.form.tel = row.tel;
    //   this.form.processing = row.processing;
    //   this.form.servicetype = row.servicetype;
    //   this.form.currentusername = row.currentusername;
    //   this.form.id = row.id;
    // },
    
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
  /* 加入 el-tabs 后层级变深，用 flex 链把固定高度穿透到 el-tab-pane，
     否则 contain-cont / 表格的 calc(100% - x) 对 auto 父级失效，表格体被压扁只剩一行 */
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
    height: 55px;
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
