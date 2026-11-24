<template>
  <div class="app-container">
    <div class="index-right">
      <!-- 服务客户 -->
      <el-tabs v-model="activeTab">
        <el-tab-pane label="人员情况" name="ryqkInfo">
          <ryqkInfo />
        </el-tab-pane>
        <!-- <el-tab-pane label="人员情况" name="ryqkInfo">
          <ryqkInfo />
        </el-tab-pane> -->
        <el-tab-pane label="人员情况统计" name="rytjInfo">
          <rytjInfo />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>
<script>
import { customerList, unitordersumList } from "@/api/order/service/rec.js";
import { parseTime, FunGetDateStr } from "@/utils/zlsoft";
// import fwryInfo from "./fwindex";
import ryqkInfo from "./ryindex.vue";
import rytjInfo from "./rytjindex.vue";
export default {
  components: { ryqkInfo, rytjInfo },
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
      unitordersumList: [],
      loading: false,
      activeTab: "ryqkInfo",
    };
  },

  created() {
    this.newDate = FunGetDateStr(-3) + " " + "00:00:00";
    this.dateRange = [this.newDate, parseTime(new Date())];
    if (this.dateRange) {
      // this.selectfwkh();
      // this.selectryqk();
    }
  },
  mounted() {
    // this.statisticalListFun(); // 调用初始化函数获取数据并设置到 chartOptions 中
  },

  methods: {
    dateChange() {
      this.selectfwkh();
      this.selectryqk();
    },
    //查询服务客户
    selectfwkh() {
      customerList(this.addDateRange(this.fwParams, this.dateRange)).then(
        (response) => {
          this.customerList = response.rows;
          this.fwtotal = response.total;
        }
      );
    },
    //查询人员情况
    selectryqk() {
      unitordersumList(this.addDateRange(this.ryParams, this.dateRange)).then(
        (response) => {
          this.unitordersumList = response.rows;
          this.rytotal = response.total;
        }
      );
    },
    // handlefwkh(row) {
    //   this.selectfwkh(row.page, row.limit);
    // },
    // handleryqk(row) {
    //   this.selectryqk(row.page, row.limit);
    // },
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
}
</style>
