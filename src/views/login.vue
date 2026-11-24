<template>
  <div class="login">
    <el-form
      ref="loginForm"
      :model="loginForm"
      :rules="loginRules"
      class="login-form"
    >
      <el-row>
        <!-- <el-col :span="12">
          <el-image class="login-left-img" :src="loginLeftPic"></el-image>
        </el-col> -->
        <el-col :span="19" class="login-form-right">
          <!-- <el-image class="login-lamp-img" :src="loginLeftPic"></el-image> -->
          <h2 class="title" style="font-size:22px !important">中联医信智慧医疗客户服务平台</h2>
          <el-form-item prop="username">
            <el-input  v-model="loginForm.username" placeholder="账号"  type="text"  auto-complete="off">
              <svg-icon  slot="prefix"  icon-class="user"  class="el-input__icon input-icon" />
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input  v-model="loginForm.password" placeholder="密码"  type="password"  auto-complete="off" @keyup.enter.native="handleLogin">
              <svg-icon  slot="prefix"  icon-class="password"  class="el-input__icon input-icon" />
            </el-input>
          </el-form-item>
          <!-- <el-form-item prop="code">
            <el-input
              v-model="loginForm.code"
              auto-complete="off"
              placeholder="验证码"
              style="width: 63%"
              @keyup.enter.native="handleLogin"
            >
              <svg-icon
                slot="prefix"
                icon-class="validCode"
                class="el-input__icon input-icon"
              />
            </el-input>
            <div class="login-code">
              <img :src="codeUrl" @click="getCode" class="login-code-img" />
            </div>
          </el-form-item> -->
          <!--<el-checkbox v-model="loginForm.rememberMe" style="margin:0px 0px 25px 0px;">记住密码</el-checkbox>-->
          <el-form-item style="width: 100%">
            <el-button type="primary" size="medium" style="width: 100%"  :loading="loading"  @click.native.prevent="handleLogin">
              <span v-if="!loading">登 录</span>
              <span v-else>登 录 中...</span>
            </el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <!--  底部  -->
    <div class="el-login-footer">
      <p>Copyright © 2023 中联医信</p>
    </div>
  </div>
</template>

<script>
import { getCodeImg } from "@/api/login";
import Cookies from "js-cookie";
import { encrypt, decrypt } from "@/utils/jsencrypt";
import loginLeftPic from "@/assets/image/login-pic-left-d.png";
// import loginLampPic from "@/assets/image/login-lamp.png";

export default {
  name: "Login",
  data() {
    return {
      loginLeftPic,
      // loginLampPic,
      codeUrl: "",
      cookiePassword: "",
      loginForm: {
        username: "",
        password: "",
        rememberMe: false,
        code: "",
        uuid: "",
      },
      loginRules: {
        username: [
          { required: true, trigger: "blur", message: "用户名不能为空" },
        ],
        password: [
          { required: true, trigger: "blur", message: "密码不能为空" },
        ],
        // code: [
        //   { required: true, trigger: "change", message: "验证码不能为空" },
        // ],
      },
      loading: false,
      redirect: undefined,
    };
  },
  watch: {
    $route: {
      handler: function (route) {
        this.redirect = route.query && route.query.redirect;
      },
      immediate: true,
    },
  },
  created() {
    // this.getCode();
    this.getCookie();
  },
  methods: {
    getCode() {
      getCodeImg().then((res) => {
        this.codeUrl = "data:image/gif;base64," + res.img;
        this.loginForm.uuid = res.uuid;
      });
    },
    getCookie() {
      const username = Cookies.get("username");
      const password = Cookies.get("password");
      // const rememberMe = Cookies.get("rememberMe");
      this.loginForm = {
        username: username === undefined ? this.loginForm.username : username,
        password:
          password === undefined ? this.loginForm.password : decrypt(password),
        // rememberMe: rememberMe === undefined ? false : Boolean(rememberMe),
      };
    },
    handleLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loading = true;
          if (this.loginForm.rememberMe) {
            Cookies.set("username", this.loginForm.username, { expires: 30 });
            Cookies.set("password", encrypt(this.loginForm.password), {
              expires: 30,
            });
            // Cookies.set("rememberMe", this.loginForm.rememberMe, {
            //   expires: 30,
            // });
          } else {
            Cookies.remove("username");
            Cookies.remove("password");
            // Cookies.remove("rememberMe");
          }
          this.$store
            .dispatch("Login", this.loginForm)
            .then(() => {
              this.$router.push({ path: this.redirect || "/" }).catch(() => {});
            })
            .catch(() => {
              this.loading = false;
              // this.getCode();
            });
        }
      });
    },
  },
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-image: url("../assets/image/login-background-3.png");
  background-size: cover;
}

.title {
  margin: 0px auto 30px auto;
  text-align: center;
  color: #0d3dea;
  font-size: 24px;
  font-weight: bolder;
}

.login-form {
  border-radius: 25px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  background: #ffffff;
  width: 537px; //1088px;
  height: 481px; //569px;
  margin-left:45%;

  // .login-left-img {
  //   width: 100%;
  //   height: 100%;
  // }

  ::v-deep .el-input {
    height: 38px;
  }

  .login-form-right {
    // padding: 20% 8% 20% 8%;
    padding-left: 20%;
    padding-top: 20%;

    // .login-lamp-img {
    //   position: absolute;
    //   top: 0;
    //   right: 5%;
    // }
  }

  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 2px;
  }
}

.login-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}

.login-code {
  width: 33%;
  height: 38px;
  float: right;

  img {
    cursor: pointer;
    vertical-align: middle;
  }
}

.el-login-footer {
  height: 80px;
  line-height: 0;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #ffffff;
  font-family: Arial;
  font-size: 14px;
  letter-spacing: 1px;
}

.login-code-img {
  height: 38px;
  width: 100%;
}

.el-button {
  margin-top: 5%;
  border: 1px solid #5b8cfb;
  background-color: #5b8cfb;
  color: #ffffff;
}

.el-button:active {
  border: 1px solid #5b8cfb;
  background-color: #5b8cfb;
}

::v-deep .is-loading {
  background-color: #5b8cfb;
  color: #fff;
}
</style>
