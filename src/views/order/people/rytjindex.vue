<template>
  <div class="app-container">
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
          <el-date-picker  v-model="dateStart"  type="datetime"  placeholder="选择日期"  @change="dateChange" > </el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间" prop="dateEnd">
          <el-date-picker  v-model="dateEnd"  type="datetime"  placeholder="选择日期"  @change="dateChange"></el-date-picker>
        </el-form-item>
      </el-form>
    </div>

    <div id="main" style="width: 1300px; height: 700px"></div>
  </div>
</template>
<script>
import { unitordersumsList } from "@/api/order/service/rec.js";
import { parseTime, FunGetDateStr,formatToYYYYMMDDHHMMSS } from "@/utils/zlsoft";
import * as echarts from "echarts";
export default {
  data() {
    return {
      queryParams: {},
      dateRange: [],
      chart: null,
      dealList: [],
      dataY: [],
      dealX: [],
      allX: [],
      cancel:[],
      dateStart: null,
      dateEnd: null,
    };
  },

  created() {
    this.dateStart = FunGetDateStr(-3) + " " + "00:00:00";
    this.dateEnd = parseTime(new Date().setHours(23, 59, 59, 999));
    this.dateRange = [this.dateStart, this.dateEnd];
  },
  mounted() {
    // this.initChartData(); // 调用初始化函数获取数据并设置到 chartOptions 中
    if (this.dateRange) {
      this.statisticalListFun();
    }
  },
  methods: {
    //加载数据，画图
    statisticalListFun() {
      let obj = {
        beginTime: this.dateRange[0],
        endTime: this.dateRange[1],
      };
      unitordersumsList(obj).then((response) => {
        this.dataY = response.data.map((i) => i.username).reverse();
        this.dealX = response.data.map((i) => i.total).reverse();
        this.allX = response.data.map((i) => i.over).reverse();
        this.cancel = response.data.map((i) => i.cancel).reverse();
        this.initChartData();
      });
    },
    //画图
    initChartData() {
      const animationDuration = 3000;
      var chartDom = document.getElementById("main");
      var myChart = echarts.init(chartDom);
      myChart.setOption({
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
        },
        legend: {},
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          data: this.dataY,
          axisLabel: {
            //x轴文字的配置
            show: true,
            interval: 0, //使x轴文字显示全
            rotate: 40, //旋转角度
          },
        },
        yAxis: {
          type: "value",
          boundaryGap: [0, 0.01],
        },
        color: ["#49C7DF", "#85CE61",'#C0645A'],
        series: [
          {
            name: "派单数量",
            type: "bar",
            data: this.dealX,
            animationDuration,
            itemStyle: {
              collor: "#66B1FF",
            },
            label: {
              show: true, // 开启显示
              position: "top", // 在上方显示
              distance: 15, // 距离图形元素的距离。当 position 为字符描述值（如 'top'、'insideRight'）时候有效
              verticalAlign: "middle",
              textStyle: {
                color: "#66B1FF", // 顶部数据的颜色
                fontSize: 14, // 顶部数据的字体大小
              },
            },
          },
          {
            name: "完成数量",
            type: "bar",
            data: this.allX,
            animationDuration,
            itemStyle: {
              collor: "#85CE61",
            },
            label: {
              show: true, // 开启显示
              position: "top", // 在上方显示
              distance: 15, // 距离图形元素的距离。当 position 为字符描述值（如 'top'、'insideRight'）时候有效
              verticalAlign: "middle",
              textStyle: {
                color: "#85CE61", // 顶部数据的颜色
                fontSize: 14, // 顶部数据的字体大小
              },
            },
          },
          // {
          //   name: "终止数量",
          //   type: "bar",
          //   data: this.cancel,
          //   animationDuration,
          //   itemStyle: {
          //     collor: "#C0645A",
          //   },
          //   label: {
          //     show: true, // 开启显示
          //     position: "top", // 在上方显示
          //     distance: 15, // 距离图形元素的距离。当 position 为字符描述值（如 'top'、'insideRight'）时候有效
          //     verticalAlign: "middle",
          //     textStyle: {
          //       color: "#C0645A", // 顶部数据的颜色
          //       fontSize: 14, // 顶部数据的字体大小
          //     },
          //   },
          // },
        ],
      });
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
      this.statisticalListFun();
    },    
  },
};
</script>
<style lang="scss" scoped>
.app-container {
  overflow: hidden;
  .content {
    display: flex;
    position: relative;
    .content-left {
      width: 18%;
      padding-top: 60px;
      height: calc(100vh - 200px);
      overflow-y: auto;
      box-shadow: 0 0 24px rgba(0, 0, 0, 0.06);
      border-radius: 10px;
      .content-item {
        padding: 0 16px;
        display: flex;
        justify-content: space-between;
        padding-bottom: 14px;
        align-items: center;
        border-bottom: 1px solid #f5f5f5;
        margin-bottom: 16px;
      }
      .position {
        border-radius: 10px;
        box-shadow: 0 0 rgba(0, 0, 0, 0.06);
        position: absolute;
        left: 0;
        top: 0;
        width: 18%;
        background-color: #fff;
        display: flex;
        justify-content: space-between;
        padding: 13px 14px;
        border-bottom: 1px solid #f5f5f5;
      }
    }
    #main {
      margin-left: 50px;
      flex: 1;
    }
  }
  .index-right {
    width: 30%;
    display: flex;
    justify-content: space-between;
  }
  .contain-top {
    height: 90px;
    .el-form-item {
      margin-bottom: 10px;
    }
  }
  .contain-cont {
    height: calc(100% - 90px);
    overflow-y: auto;
  }
  .pagination-container {
    margin: 0;
  }
}

.content-left::-webkit-scrollbar {
  display: none;
}
</style>
