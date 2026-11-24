<template>
  <div class="navbar">
    <hamburger
      id="hamburger-container"
      :is-active="sidebar.opened"
      class="hamburger-container"
      @toggleClick="toggleSideBar"
    />

    <breadcrumb id="breadcrumb-container" class="breadcrumb-container" />

    <div class="right-menu">
      <Person id="Person" class="right-menu-item" />
      <template v-if="device !== 'mobile'">
        <search id="header-search" class="right-menu-item" />

        <screenfull id="screenfull" class="right-menu-item hover-effect" />

        <el-tooltip content="布局大小" effect="dark" placement="bottom">
          <size-select id="size-select" class="right-menu-item hover-effect" />
        </el-tooltip>
      </template>

      <el-dropdown
        class="avatar-container right-menu-item hover-effect"
        trigger="click"
      >
        <div class="avatar-wrapper">
          <img src="../../assets/image/profile.png" class="user-avatar" />
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>
            <i class="el-icon-user"></i>
            <span>当前用户：{{ this.$store.state.user.name }}</span>
          </el-dropdown-item>
          <router-link to="/user/profile">
            <el-dropdown-item divided>
              <i class="el-icon-setting"></i>
              <span>个人中心</span>
            </el-dropdown-item>
          </router-link>
          <el-dropdown-item @click.native="setting = true">
            <i class="el-icon-s-operation"></i>
            <span>布局设置</span>
          </el-dropdown-item>
          <el-dropdown-item divided @click.native="changedept">
            <i class="el-icon-sort"></i>
            <span>切换部门</span>
          </el-dropdown-item>
          <el-dropdown-item divided @click.native="logout">
            <i class="el-icon-switch-button"></i>
            <span>退出登录</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <el-dialog
      title="切换部门"
      width="400px"
      :close-on-click-modal="false"
      append-to-body
      :visible.sync="dialogTableVisible"
      @close="closeDialog"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col>
            <el-form-item label="选择部门" prop="unitid">
              <el-select
                v-model="form.unitid"
                placeholder="请选择部门"
                size="small"
                @change="changeunit"
              >
                <el-option
                  v-for="rce in fromunitList"
                  :key="rce.id"
                  :label="rce.name"
                  :value="rce.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Breadcrumb from "@/components/Breadcrumb";
import Hamburger from "@/components/Hamburger";
import Screenfull from "@/components/Screenfull";
import SizeSelect from "@/components/SizeSelect";
import Search from "@/components/HeaderSearch";
import Person from "@/components/Personnel";
import { changeunitList } from "@/api/system/dept";
import store from "@/store";
export default {
  components: {
    Breadcrumb,
    Hamburger,
    Screenfull,
    SizeSelect,
    Search,
    Person,
  },
  data() {
    return {
      dialogTableVisible: false,
      form: {},
      rules: {},
      fromunitList: [],
    };
  },
  computed: {
    ...mapGetters(["sidebar", "avatar", "device"]),
    setting: {
      get() {
        return this.$store.state.settings.showSettings;
      },
      set(val) {
        this.$store.dispatch("settings/changeSetting", {
          key: "showSettings",
          value: val,
        });
      },
    },
  },

  methods: {
    toggleSideBar() {
      this.$store.dispatch("app/toggleSideBar");
    },
    async logout() {
      this.$confirm("确定注销并退出系统吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.$store.dispatch("LogOut").then(() => {
            sessionStorage.removeItem("value");
            location.href = "/index";
          });
        })
        .catch(() => {});
    },
    reset() {
      this.form = {
        unit: undefined,
      };
      this.resetForm("form");
    },
    closeDialog() {
      this.reset();
    },
    changedept() {
      changeunitList().then((response) => {
        this.fromunitList = response.data;
        this.dialogTableVisible = true;
      });
    },

    changeunit(value) {
      if (value == store.getters.roles.unit.id) {
        this.msgSuccess(
          "当前部门为" +
            " '" +
            store.getters.roles.unit.name +
            "' " +
            "请选择其他部门！"
        );
      } else {
        sessionStorage.setItem("value", value);
        location.href = "/index";
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          margin: 5px 0 0 0;
          width: 30px;
          height: auto;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 15px;
          font-size: 14px;
        }
      }
    }
  }
}
</style>
