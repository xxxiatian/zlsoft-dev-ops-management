<template>
  <div class="index">
    <div class="index-left">
      <div class="index-leftT">
        <ul class="leftT-ul">
          <li @click="titStatus(1)">
            <div class="leftT-uldiv" style="background: rgb(73, 166, 255)">
              <span class="uldiv-sptext">全部工单</span>
              <span class="uldiv-ico spico1"></span>
              <span class="uldiv-spnum">{{ allnum.totalnum }}</span>
            </div>
          </li>
          <li @click="titStatus(2)">
            <div class="leftT-uldiv" style="background: rgb(254, 133, 110)">
              <span class="uldiv-sptext">待派单</span>
              <span class="uldiv-ico spico2"></span>
              <span class="uldiv-spnum">{{ allnum.pendingnum }}</span>
            </div>
          </li>
          <li @click="titStatus(3)">
            <div class="leftT-uldiv" style="background: rgb(255, 204, 78)">
              <span class="uldiv-sptext">处理中</span>
              <span class="uldiv-ico spico3"></span>
              <span class="uldiv-spnum">{{ allnum.handlenum }}</span>
            </div>
          </li>
          <li @click="titStatus(4)">
            <div class="leftT-uldiv" style="background: rgb(95, 223, 160)">
              <span class="uldiv-sptext">已处理</span>
              <span class="uldiv-ico spico4"></span>
              <span class="uldiv-spnum">{{ allnum.overnum }}</span>
            </div>
          </li>
          <li @click="titStatus(5)">
            <div class="leftT-uldiv" style="background: rgb(255, 101, 101)">
              <span class="uldiv-sptext">已终止</span>
              <span class="uldiv-ico spico5"></span>
              <span class="uldiv-spnum">{{ allnum.stopnum }}</span>
            </div>
          </li>
          <li @click="titStatus(6)">
            <div class="leftT-uldiv" style="background: rgb(191, 191, 191)">
              <span class="uldiv-sptext">已超时</span>
              <span class="uldiv-ico spico6"></span>
              <span class="uldiv-spnum">{{ allnum.timeout }}</span>
            </div>
          </li>
        </ul>
      </div>
      <div class="index-leftB" v-if="this.isHidden != '3'">
        <p class="leftB-p">工单列表</p>
        <div class="leftB-Box">
          <el-table table-cloumn :data="recList"  :row-class-name="tableRowClassName"  v-loading="loading" element-loading-text="拼命加载中"  height="calc(100% - 50px)" >
            <el-table-column  label="服务单号"  prop="id"            align="center"  width="120" />
            <el-table-column  label="状态"      prop="orderstatus"   align="center"  width="120" />
            <el-table-column  label="申请科室"  prop="unitname"      align="center"  width="120" />
            <el-table-column  label="联系电话"  prop="tel"           align="center"  width="140" />
            <el-table-column  label="申请人员"  prop="createBy"      align="center"  width="150" />
            <el-table-column  label="服务详细描述" prop="describe"    align="center"  width="200"  :show-overflow-tooltip="true" />
            <el-table-column  label="申请时间"  prop="createAt"      align="center"  width="160" />
            <el-table-column  label="期望时间"  prop="desiretime"    align="center"   width="180" />
            <el-table-column  label="处理人"    prop="currentusername"  align="center"  width="120" />
            <el-table-column  label="安排时间"  prop="arrangetime"   align="center"   width="160" />
            <el-table-column  label="终止原因"  prop="stopter"       align="center"   width="160"  :show-overflow-tooltip="true" />
          </el-table>
          <pagination
            v-show="total > 0"
            :total="total"
            :page.sync="queryParams.pageNum"
            :limit.sync="queryParams.pageSize"
            @pagination="handleCurrentChange"
          />
        </div>
      </div>
      <div class="container" v-else>
        <el-row :gutter="30">
          <el-col :span="12" class="left-column">
            <div class="left-top">
              <div class="echarts-container">
                <p>问题登记趋势</p>
                <div ref="lineChart" class="chart"></div>
              </div>
            </div>
          </el-col>
          <el-col :span="12" class="left-column">
            <div class="left-top">
              <div class="echarts-container">
                <p>问题处理趋势</p>
                <div ref="lineMyChart" class="chart"></div>
              </div>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="21" style="margin-top: 20px">
          <el-col :span="6" class="bottom-column">
            <div class="chart-container">
              <div class="chart-title1">
                <p style="color: rgb(254, 133, 110)">
                  ----- <span>待派单</span>
                </p>
                <p style="color: rgb(255, 204, 78)">
                  ----- <span>处理中</span>
                </p>
                <p style="color: rgb(95, 223, 160)">
                  ----- <span>已处理</span>
                </p>
                <p style="color: rgb(255, 101, 101)">
                  ----- <span>已终止</span>
                </p>
                <p style="color: rgb(191, 191, 191)">
                  ----- <span>已超时</span>
                </p>
              </div>
              <div id="pie-chart-1" class="pieYuan"></div>
            </div>
          </el-col>
          <!-- <el-col :span="6" class="bottom-column">
            <div id="pie-chart-2" class="pieYuan"></div>
          </el-col> -->
          <el-col :span="18" class="bottom-column">
            <div class="chart-container">
              <div class="chart-title">近半月登记数量</div>
              <div
                id="bar-chart"
                class="pieYuan"
                style="width: 100%; height: 400px"
              ></div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script>
import vueSeamlessScroll from "vue-seamless-scroll";
import Editor from "@/components/Editor";
import { homepage, selectotal,selectOrderCount } from "@/api/order/service/rec.js";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import store from "@/store";
var echarts = require("echarts/lib/echarts");
// 导入折线图
require("echarts/lib/chart/line");
// 引入饼图组件
require("echarts/lib/chart/pie");
require("echarts/lib/component/tooltip");
require("echarts/lib/component/title");
require("echarts/lib/chart/bar");
import { statisticalList } from "@/api/order/service/rec.js";
import { parseTime, FunGetDateStr } from "@/utils/zlsoft";
export default {
  name: "Index",
  components: {
    vueSeamlessScroll,
    Treeselect,
    Editor,
  },
  data() {
    return {
      openHandel: false,
      formReqStaffId: "",
      recList: [],
      listData: [],
      customerList: [],
      unitordersumList: [],
      userName: "",
      userTel: "",
      // 表格
      loading: true,
      total: 0,
      fwtotal: 0,
      rytotal: 0,
      dpshow: false,
      clshow: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
      },
      fwkhParams: {
        pageNum: 1,
        pageSize: 10,
      },
      ryqkParams: {
        pageNum: 1,
        pageSize: 10,
      },

      recList: [
        {
          createBy: "",
          createAt: "",
          unitname: "",
          unitid: "",
          scopetype: "",
          tel: "",
          desiretime: "",
          orderstatus: "",
          currentusername: "",
          stopter: "",
          disposal: "",
        },
      ],

      // 表单参数
      form: {},
      statusnum: 1,
      // 表单校验

      orderstatus: "",
      open: false,
      staffopen: false,
      //文件上传
      fileList: [],
      title: "",
      //修改程序
      isModifyProgramOptions: [],
      // 科室选项
      deptOptions: [],
      //服务类型
      servicetypeOptions: [],
      //服务类别
      serviceclassOptions: [],
      //项目名称
      entryName: [],
      //严重程度
      severityOptions: [],
      //紧急程度
      urgencyOptions: [],
      show: true,
      activeForm: {},
      actFormShow: true,
      formEntryName: "",
      titleHandle: "",
      isHidden: "",
      allnum: {},
      dataY: [],
      dealX: [],
      allX: [],
      pieChartData1: [],
      pieChartData2: [
        { value: 335, name: "直接访问" },
        { value: 310, name: "邮件营销" },
        { value: 234, name: "联盟广告" },
        { value: 135, name: "视频广告" },
        { value: 1548, name: "搜索引擎" },
      ],
      barChartData: [],
    };
  },
  methods: {
    createBarChart(domId, chartData) {
      const chartDom = document.getElementById(domId);
      const myChart = echarts.init(chartDom);
      const option = {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
        },
        xAxis: {
          type: "category",
          data: chartData.map((item) => item.name),
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            data: chartData,
            type: "bar",
            showBackground: true,
            backgroundStyle: {
              color: "rgba(180, 180, 180, 0.2)",
            },
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "#66B1FF" }, // 柱状图顶部颜色
                { offset: 1, color: "#C0645A" }, // 柱状图底部颜色
              ]),
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
        ],
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
          height: "300px", // 设置grid的高度
        },
      };
      myChart.setOption(option);
      window.addEventListener("resize", function () {
        myChart.resize();
      });
    },
    createPieChart(domId, chartData) {
      const chartDom = document.getElementById(domId);
      const myChart = echarts.init(chartDom);
      const option = {
        series: [
          {
            name: "访问来源",
            type: "pie",
            radius: "75%",
            data: chartData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              },
            },
          },
        ],
      };
      myChart.setOption(option);
      window.addEventListener("resize", function () {
        myChart.resize();
      });
    },
    tableRowClassName({ row }) {
      if (row.orderstatus === "服务终止") {
        return "warning-row";
      }
      if (row.orderstatus === "服务完成") {
        return "success-row";
      }
      return "";
    },

    titStatus(statusnum) {
      // 使用路由参数跳转
      this.$router.push({
        path: "/service/service",
        query: {
          statusnum: statusnum,
        },
      });
    },

    // 查询工单
    selectlists(pageNum, pageSize) {
      this.loading = true;
      this.recList  = []
      let obj = {
        pageNum: pageNum,
        pageSize: pageSize,
      };

      homepage(obj).then((res) => {
        this.recList = res.rows;
        this.total = res.total;
        this.recList.forEach((item) => {
          if (item.orderstatus == 3) {
            if (
              store.getters.roles.orgaccount.orgid ==
              "08336fe6-a1a9-4acd-9edf-b14e014e4074"
            ) {
              this.clshow = false;
              this.dpshow = true;
            } else {
              this.clshow = true;
              this.dpshow = false;
            }
          }
        });
      });
      this.loading = false;
    },
    statisticalListFun() {
      let obj = {
        beginTime: this.dateRange[0],
        endTime: this.dateRange[1],
      };
      statisticalList(obj).then((res) => {
        // this.dataY = res.over.map((i) => i.overnum).reverse();
        // this.dealX = res.total.map((i) => i.totalnum).reverse();
        // this.allX = res.over.map((i) => i.daytime).reverse();
        // this.cancel = res.cancel.map((i) => i.cancel).reverse();
        this.dataY = res.result.map((i) => i.overnum);
        this.dealX = res.result.map((i) => i.totalnum);
        this.allX = res.result.map((i) => i.daytime);
        this.cancel = res.result.map((i) => i.cancelnum);
        this.initChart();
        this.MyinitChart();
        this.chart1 = echarts.init(this.$refs.lineMyChart);
        this.chart2 = echarts.init(this.$refs.lineChart);
        this.barChartData = [
          { name: this.allX[0], value: this.dealX[0] },
          { name: this.allX[1], value: this.dealX[1] },
          { name: this.allX[2], value: this.dealX[2] },
          { name: this.allX[3], value: this.dealX[3] },
          { name: this.allX[4], value: this.dealX[4] },
          { name: this.allX[5], value: this.dealX[5] },
          { name: this.allX[6], value: this.dealX[6] },
          { name: this.allX[7], value: this.dealX[7] },
          { name: this.allX[8], value: this.dealX[8] },
          { name: this.allX[9], value: this.dealX[9] },
          { name: this.allX[10], value: this.dealX[10] },
          { name: this.allX[11], value: this.dealX[11] },
          { name: this.allX[12], value: this.dealX[12] },
          { name: this.allX[13], value: this.dealX[13] },
          { name: this.allX[14], value: this.dealX[14] },
        ];
        this.createBarChart("bar-chart", this.barChartData);
        window.addEventListener("resize", this.handleResize);
      });
    },
    // 页码切换
    handleCurrentChange(row) {
      this.selectlists(row.page, row.limit);
    },
    initChart() {
      // 基于准备好的dom，初始化echarts实例
      var chart = echarts.init(this.$refs.lineChart);

      // 指定图表的配置项和数据
      var option = {
        // title: {
        //   text: "问题登记趋势",
        // },
        tooltip: {},
        xAxis: {
          data: this.allX,
        },
        yAxis: {},
        series: [
          {
            name: "问题登记",
            type: "line",
            data: this.dealX,
            itemStyle: {
              color: "#db5c50",
            },
            lineStyle: {
              width: 5,
            },
            label: {
              normal: {
                show: true, // 显示拐点上的数字
                position: "top", // 数字显示的位置
                formatter: "{c}", // 显示的数据格式，{c}表示使用数据值
                textStyle: {
                  // 文字的样式
                  color: "#333", // 文字颜色
                  fontSize: 14, // 文字大小
                },
              },
            },
          },
        ],
      };

      // 使用刚指定的配置项和数据显示图表。
      chart.setOption(option);
    },
    MyinitChart() {
      // 基于准备好的dom，初始化echarts实例
      var chart = echarts.init(this.$refs.lineMyChart);

      // 指定图表的配置项和数据
      var option = {
        // title: {
        //   text: "问题登记趋势",
        // },
        tooltip: {},
        xAxis: {
          data: this.allX,
        },
        yAxis: {},
        series: [
          {
            name: "处理成功",
            type: "line",
            data: this.dataY,
            itemStyle: {
              color: "#57c872",
              width: 5,
            },
            lineStyle: {
              width: 5,
            },
            label: {
              normal: {
                show: true, // 显示拐点上的数字
                position: "top", // 数字显示的位置
                formatter: "{c}", // 显示的数据格式，{c}表示使用数据值
                textStyle: {
                  // 文字的样式
                  color: "#333", // 文字颜色
                  fontSize: 14, // 文字大小
                },
              },
            },
          },
        ],
      };

      // 使用刚指定的配置项和数据显示图表。
      chart.setOption(option);
    },

    handleResize() {
      if (this.chart1) {
        this.chart1.resize();
      }
      if (this.chart2) {
        this.chart2.resize();
      }
    },
  },
  mounted() {
    // this.createPieChart("pie-chart-2", this.pieChartData2);
  },
  created() {

    this.userName = store.getters.roles.person.name;
    this.userTel = store.getters.roles.person.tel;

    this.isHidden = store.getters.roles.organizationtype;

    this.dateRange = [this.newDate, parseTime(new Date())];
    this.dateStart = FunGetDateStr(-14) + " " + "00:00:00";
    this.dateEnd = parseTime(new Date().setHours(23, 59, 59, 999));
    this.dateRange = [this.dateStart, this.dateEnd];

    let param = {
      beginTime: this.dateRange[0],
      endTime: this.dateRange[1],
    };

    // if (this.isHidden != "3"){
    //   param.beginTime="";
    //   param.endTime=""
    // }
    // // 查询列表数量
    selectotal().then((res) => {
      this.allnum = res.data;
      if (this.isHidden == "3") {
        this.pieChartData1 = [
          {
            value: this.allnum.pendingnum,
            name: "待派单",
            itemStyle: { color: "rgb(254, 133, 110)" },
          },
          {
            value: this.allnum.handlenum,
            name: "处理中",
            itemStyle: { color: "rgb(255, 204, 78)" },
          },
          {
            value: this.allnum.overnum,
            name: "已处理",
            itemStyle: { color: "rgb(95, 223, 160)" },
          },
          {
            value: this.allnum.stopnum,
            name: "已终止",
            itemStyle: { color: "rgb(255, 101, 101)" },
          },
          {
            value: this.allnum.timeout,
            name: "已超时",
            itemStyle: { color: "rgb(191, 191, 191)" },
          },
        ];
        this.createPieChart("pie-chart-1", this.pieChartData1);
      }
    });


    if (this.isHidden == "3") {
      this.statisticalListFun();
    } else {
      // 查询工单
      this.selectlists(this.queryParams.pageNum, this.queryParams.pageSize);
    }
  },
  beforeDestroy() {
    //折线图
    window.removeEventListener("resize", this.handleResize);
    if (this.chart1) {
      this.chart1.dispose();
    }
    if (this.chart2) {
      this.chart2.dispose();
    }
  },
};
</script>

<style lang="scss" scoped>
.index {
  padding: 30px;
  box-sizing: border-box;
  display: flex;
  background: #f8f8f8;
  height: 100%;
  p,
  div,
  ul,
  li {
    padding: 0;
    margin: 0;
  }
  .index-left {
    width: calc(100% - 20px);
    margin-right: 20px;
    .index-leftT {
      .leftT-ul {
        list-style: none;
        display: flex;
        margin-bottom: 30px;
        li {
          margin-right: 10px;
          width: calc(20% - 8px);
          border-radius: 12px;
          background: #fff;
          box-shadow: 0 0 12px rgba(0, 0, 0, 0.06);
          height: 126px;
          cursor: pointer;
          &:last-child {
            margin-right: 0;
          }
          .leftT-uldiv {
            height: 100%;
            box-sizing: border-box;
            padding: 26px 20px;
            position: relative;
            .uldiv-sptext {
              font-size: 16px;
              color: white;
              position: absolute;
              left: 20px;
              top: 26px;
            }

            .uldiv-ico {
              display: inline-block;
              width: 36px;
              height: 36px;
              position: absolute;
              right: 20px;
              top: 18px;
              &.spico1 {
                background: url("~@/assets/index/全部.png") center center
                  no-repeat;
                background-size: 100% 100%;
              }
              &.spico2 {
                background: url("~@/assets/index/待处理.png") center center
                  no-repeat;
                background-size: 100% 100%;
              }
              &.spico3 {
                background: url("~@/assets/index/处理中.png") center center
                  no-repeat;
                background-size: 100% 100%;
              }
              &.spico4 {
                background: url("~@/assets/index/已处理.png") center center
                  no-repeat;
                background-size: 100% 100%;
              }
              &.spico5 {
                background: url("~@/assets/index/已终止.png") center center
                  no-repeat;
                background-size: 100% 100%;
              }
              &.spico6 {
                background: url("~@/assets/index/处理中.png") center center
                  no-repeat;
                background-size: 100% 100%;
              }
            }
            .uldiv-spnum {
              font-size: 36px;
              color: white;
              position: absolute;
              left: 20px;
              bottom: 20px;
            }
          }

          // 提交工单
          .rightT-send {
            display: inline-block;
            position: relative;
            width: 110px;
            height: 50px;
            line-height: 50px;
            border-radius: 12px 0 24px 0;
            background: #8ab0ff;
            color: white;
            font-size: 15px;
            text-align: right;
            box-sizing: border-box;
            padding-right: 8px;
            // margin-left: 98px;
            // right: -0;
            // top: 0;

            cursor: pointer;
            &::before {
              content: "";
              display: block;
              width: 22px;
              height: 22px;
              background: url("~@/assets/index/sent.png") center no-repeat;
              background-size: 100%;
              position: absolute;
              top: 50%;
              margin-top: -11px;
              left: 16px;
            }
          }
          .rightT-Tr {
            font-size: 15px;
            color: white;
            width: calc(100% - 10px);
            .rightT-Tp {
              padding-left: 20px;
              padding-top: 10px;
              .rightT-Tsp {
                display: inline-block;
                width: 60px;
              }
            }
          }
        }
      }
    }
    .index-leftB {
      height: calc(100% - 132px);
      margin-top: 10px;
      background: #fff;
      border-radius: 12px;
      box-sizing: border-box;
      padding: 0 20px;
      .leftB-p {
        height: 70px;
        line-height: 70px;
        font-size: 20px;
        color: #333333;
        font-weight: bold;
      }
      .leftB-Box {
        height: calc(100% - 70px);
        .scope-sp {
          display: inline-block;
          width: 56px;
          height: 24px;
          line-height: 24px;
          text-align: center;
          border-radius: 3px;
          font-size: 12px;
          &.djd-sp {
            color: #db5c50;
            background: #ffeceb;
          }
          &.clz-sp {
            color: #e7c56f;
            background: #fff6e1;
          }
          &.ypj-sp {
            color: #3399ff;
            background: #e5f2ff;
          }
          &.ycl-sp {
            color: #57c872;
            background: #dfffe7;
          }
          &.yqx-sp {
            color: #999999;
            background: #f1f1f1;
          }
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
.echarts-container {
  width: 100%; /* 容器宽度设置为100% */
  height: 400px; /* 容器的高度 */
  border-radius: 12px;
  background: white;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.06);
}
.echarts-container p {
  font-size: 20px;
  font-weight: 500;
  text-align: center;
  margin-bottom: -30px;
  padding-top: 30px;
}
.chart {
  width: 100%; /* 图表宽度设置为100% */
  height: 100%; /* 图表高度设置为100% */
}
.container {
  width: 100%; /* 确保容器宽度为100% */
  // height: 100%; /* 确保容器高度为100% */
}

.left-column,
.right-column {
  height: 100%; /* 确保左右列的高度为100% */
}

.left-top,
.left-bottom {
  margin-bottom: 30px; /* 上下间隔30px */
}

.left-bottom:last-child {
  margin-bottom: 0; /* 移除最后一个子元素的底部间隔 */
}

.chart-container1,
#main {
  width: 100%; /* 宽度设置为100%，使图表自适应 */
  height: 400px; /* 容器的高度 */
  border-radius: 12px;
  background: white;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.06);
}
.chart-container1 p {
  font-size: 20px;
  font-weight: 500;
  text-align: center;
  margin-top: 10px;
  margin-bottom: 40px;
  padding-top: 30px;
}

.bottom-column {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px; /* 或者您希望的固定高度 */
  position: relative;
}
.pieYuan {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  background: white;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.06);
}
.chart-container {
  position: relative;
  width: 100%;
  height: 100%;
}
.chart-title {
  position: absolute;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  text-align: center;
  padding-top: 10px;
  padding-bottom: 10px;
  font-size: 20px;
  font-weight: 500;
  z-index: 99999;
}
.chart-title1 {
  position: absolute;
  top: 260px;
  left: 89%;
  transform: translateX(-50%);
  width: 100%;
  text-align: center;
  padding-top: 10px;
  padding-bottom: 10px;
  z-index: 99999;
}
.chart-title1 p {
  line-height: 22px;
}
</style>
