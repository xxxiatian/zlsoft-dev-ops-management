<template>
  <!-- 服务客户 -->
  <div class="contain-top">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      label-width="68px"
    >
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
        <el-date-picker
          v-model="dateStart"
          type="datetime"
          placeholder="选择日期"
          @change="dateChange"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item label="结束时间" prop="dateEnd">
        <el-date-picker
          v-model="dateEnd"
          type="datetime"
          placeholder="选择日期"
          @change="dateChange"
        >
        </el-date-picker>
      </el-form-item>
    </el-form>
    <div class="fw-index">
      <ul>
        <li>
          服务单数总和(医院)：<span>{{ totalfw }}</span>
        </li>
        <li>
          处理单数总和(医院)：<span>{{ totalcl }}</span>
        </li>
      </ul>
    </div>
    <div>
      <el-table :data="customerList"  v-loading="loading"  :default-sort="{ prop: 'services', order: 'descending' }"  border height="500px" >
        <el-table-column  label="渠道"      prop="services"  width="200px"  align="center"  :formatter="formatter"  />
        <el-table-column  label="医院名称"   prop="hospital" width="200px"  align="center"  :show-overflow-tooltip="true"  />
        <el-table-column  label="服务单数"   prop="total"    width="150px"  align="center"  sortable />
        <el-table-column  label="已处理数"   prop="overnum"  width="150px"  align="center"  />
        <el-table-column  label="终止单数"   prop="cancel"   width="150px"  align="center"  />
      </el-table>
      <pagination
        :total="fwtotal"
        :page.sync="fwParams.pageNum"
        :limit.sync="fwParams.pageSize"
        @pagination="selectfwkh"
      />
    </div>
  </div>
</template>
<script>
import { customerList } from "@/api/order/service/rec.js";
import {
  parseTime,
  FunGetDateStr,
  formatToYYYYMMDDHHMMSS,
} from "@/utils/zlsoft";

export default {
  data() {
    return {
      fwtotal: 0,
      rytotal: 0,
      queryParams: {},
      fwParams: {
        pageNum: 1,
        pageSize: 10,
      },
      ryParams: {
        pageNum: 1,
        pageSize: 10,
      },
      dateRange: [],
      customerList: [],
      //   unitordersumList: [],
      loading: false,
      totalfw: 0,
      totalcl: 0,
      dateStart: null,
      dateEnd: null,
    };
  },

  created() {
    this.dateStart = FunGetDateStr(0) + " " + "00:00:00";
    this.dateEnd = parseTime(new Date().setHours(23, 59, 59, 999));
    this.dateRange = [this.dateStart, this.dateEnd];
    // if (this.dateRange) {
    //   this.selectfwkh;
    //   //   this.selectryqk();
    // }
    this.selectfwkh();
  },
  mounted() {
    // this.statisticalListFun(); // 调用初始化函数获取数据并设置到 chartOptions 中
  },

  methods: {
    //查询服务客户
    selectfwkh() {
      customerList(this.addDateRange(this.fwParams, this.dateRange)).then(
        (response) => {
          if(response){
            this.customerList = response.rows;
            this.fwtotal = response.total;
            // const totalfw = this.customerList.reduce(
            //   (sum, item) => sum + item.total,
            //   0
            // );
            // const totalcl = this.customerList.reduce(
            //   (sum, item) => sum + item.overnum,
            //   0
            // );
            // this.totalfw = totalfw;
            // this.totalcl = totalcl;
            this.totalfw = this.customerList.length>0?this.customerList[0].sumtotal:0;
            this.totalcl = this.customerList.length>0?this.customerList[0].sumover:0;
          }
        }
      );
    },
    dateChange() {
      this.dateRange = [
        formatToYYYYMMDDHHMMSS(this.dateStart),
        formatToYYYYMMDDHHMMSS(this.dateEnd),
      ];
      if (new Date(this.dateRange[0]) > new Date(this.dateRange[1])) {
        return this.$message.error("请选择正确的时间段！");
      }
      this.selectfwkh();
      //   this.selectryqk();
    },    
    formatter(row, column) {
      return row.services;
    },
  },
};
</script>
<style lang="scss" scoped>
.app-container {
  overflow: hidden;

  .index-right {
    // width: 90%;
    height: calc(100% - 50px);
    // overflow-y: auto;
    // display: flex;
    // justify-content: space-between;
  }

  .rightB-Tl {
    font-size: 24px;
  }
  .fw-index {
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
