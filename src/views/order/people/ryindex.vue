<template>
  <!-- 服务客户 -->

  <!-- 服务人员-->
  <div class="index">
    <el-form  :model="queryParams"  ref="queryForm"  :inline="true" label-width="68px">
      <!-- <el-form-item label="选择时间" prop="reqDatetime">
        <el-date-picker
          v-model="dateRange"
          size="small"
          style="width: 476px"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          @change="dateChange"
        ></el-date-picker>
      </el-form-item> -->
      <el-form-item label="开始时间" prop="dateStart">
        <el-date-picker  v-model="dateStart" type="datetime" placeholder="选择日期" @change="dateChange"></el-date-picker>
      </el-form-item>
      <el-form-item label="结束时间" prop="dateEnd">
        <el-date-picker  v-model="dateEnd"  type="datetime"  placeholder="选择日期" @change="dateChange"></el-date-picker>
      </el-form-item>
      <el-form-item label="逾期天数" prop="overDays">
        <el-input type="text" v-model="overDays" placeholder="请输入逾期天数（整数）" @change="checkInputNum" />
      </el-form-item>      
      <el-form-item>
        <el-col :span="1.5">
          <el-button type="warning" icon="el-icon-download" size="mini" plain :loading="exportLoading" @click="handleExport" v-hasPermi="['system:rec:export']">导出</el-button>
        </el-col>
      </el-form-item>
    </el-form>
    <div class="ry-index">
      <ul>
        <li>
          服务单数总和(人员)：<span>{{ totalfw }}</span>
        </li>
        <li>
          处理单数总和(人员)：<span>{{ totalcl }}</span>
        </li>
      </ul>
    </div>
    <el-table  v-loading="loading" :data="unitordersumList"
      element-loading-text="拼命加载中" border  :default-sort="{ prop: 'username', order: 'descending' }"  height="500px">
      <el-table-column  label="处理人"   prop="username"  width="240px"  align="center"  :formatter="formatter"  />
      <el-table-column  label="所在部门" prop="unitname"  width="240px"  align="center" />
      <el-table-column  label="服务单数" prop="total"     width="160px"  align="center"  sortable />
      <el-table-column  label="已处理数" prop="over"      width="160px"  align="center"  />
      <el-table-column  label="平均处理时间" prop="processingtime" width="165px"  align="center"  v-if="this.processingTime != '3'" />
    </el-table>
    <pagination
      :total="rytotal"
      :page.sync="ryParams.pageNum"
      :limit.sync="ryParams.pageSize"
      @pagination="selectryqk"
    />
  </div>
</template>
<script>
import { unitordersumList,exportOrderNumCount } from "@/api/order/service/rec.js";
import { parseTime, FunGetDateStr, formatToYYYYMMDDHHMMSS} from "@/utils/zlsoft";
import store from "@/store";
export default {
  data() {
    return {
      fwtotal: 0,
      rytotal: 0,
      queryParams: {},
      processingTime: store.getters.roles.organizationtype,
      fwParams: {
        pageNum: 1,
        pageSize: 10,
      },
      ryParams: {
        pageNum: 1,
        pageSize: 10
      },
      dateRange: [],
      unitordersumList: [],
      loading: true,
      totalfw: 0,
      totalcl: 0,
      dateStart: null,
      dateEnd: null,
      // 导出遮罩层
      exportLoading: false,
      overDays:null
    };
  },

  created() {
    this.dateStart = FunGetDateStr(-0) + " " + "00:00:00";
    this.dateEnd = parseTime(new Date().setHours(23, 59, 59, 999));
    this.dateRange = [this.dateStart, this.dateEnd];
    
    this.selectryqk();
  },

  methods: {
    //查询人员情况
    selectryqk() {
      let queryParams = {
        pageNum:this.ryParams.pageNum,
        pageSize:this.ryParams.pageSize,
        params:{
          beginTime:this.dateRange[0],
          endTime:this.dateRange[1],
          overDays:this.overDays==null?0:this.overDays
        }   
      }
      unitordersumList(queryParams).then(
        (response) => {
          this.unitordersumList = response.rows;
          this.rytotal = response.total;
          if (this.unitordersumList != "") {
            this.totalfw = this.unitordersumList[0].sumtotal;
            this.totalcl = this.unitordersumList[0].sumover;
          }
          this.loading = false
        }
      );
    },
    /** 导出按钮操作 */
    handleExport() {
      this.$confirm("是否确认导出当前时间范围的人员工单统计?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.exportLoading = true;
          let queryParams = {
              pageNum:this.ryParams.pageNum,
              pageSize:this.ryParams.pageSize,
              params:{
                beginTime:this.dateRange[0],
                endTime:this.dateRange[1],
                overDays:this.overDays==null?0:this.overDays
              }   
            }
          return exportOrderNumCount(queryParams);
        })
        .then((response) => {
          this.download(response.msg);
          this.exportLoading = false;
        })
        .catch(() => { });
    },  
    //日期change事件
    dateChange() {
      this.dateRange = [
        formatToYYYYMMDDHHMMSS(this.dateStart),
        formatToYYYYMMDDHHMMSS(this.dateEnd),
      ];
      if (new Date(this.dateRange[0]) > new Date(this.dateRange[1])) {
        return this.$message.error("请选择正确的时间段！");
      }
      this.selectryqk();
    },       
    formatter(row, column) {
      return row.username;
    },    
    checkInputNum(val){
      console.log(val)
      if(val.trim()!=""){
        const regex = /^[1-9]\d*$/;
        if(!regex.test(val)){
            this.$message.error("请填写正整数！");
            this.ryParams.overDays="";
            return;
        }
      }
      this.overDays = val;
      this.selectryqk();
    }
  },
};
</script>
<style lang="scss" scoped>
.app-container {
  overflow: hidden;

  .index-right {
    // width: 90%;
    height: calc(100% - 50px);
    overflow-y: auto;
    display: flex;
    justify-content: space-between;
  }

  .rightB-Tl {
    font-size: 24px;
  }
  .ry-index {
    margin-bottom: 20px;
    ul {
      // margin-left: -40px;
      list-style: none;
      display: flex;
      li {
        margin-left: 30px;
      }
    }
    span {
      color: red;
    }
  }
}
</style>
