<template>
  <el-form ref="form" :model="user" :rules="rules" label-width="80px">
    <el-form-item label="用户昵称" prop="name">
      <el-input v-model="user.name" maxlength="30" />
    </el-form-item>
    <el-form-item label="手机号码" prop="tel">
      <el-input v-model="user.tel" maxlength="11" />
    </el-form-item>
    <el-form-item label="邮箱" prop="email">
      <el-input v-model="user.email" maxlength="50" />
    </el-form-item>
    <el-form-item label="初始部门" prop="unitid">
      <el-select v-model="user.unitid" placeholder="请选择部门" size="small">
        <el-option
          v-for="rce in fromunitList"
          :key="rce.id"
          :label="rce.name"
          :value="rce.id"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="性别">
      <el-radio-group v-model="user.gender">
        <el-radio label="0">男</el-radio>
        <el-radio label="1">女</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" size="mini" @click="submit">保存</el-button>
      <el-button type="danger" size="mini" @click="close">关闭</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { updateUserProfile } from "@/api/system/user";
import store from "@/store";
import { changeunitList } from "@/api/system/dept";
export default {
  props: {
    user: {
      type: Object,
    },
  },
  data() {
    return {
      // 表单校验
      rules: {
        name: [
          { required: true, message: "用户昵称不能为空", trigger: "blur" },
        ],
        email: [
          { required: true, message: "邮箱地址不能为空", trigger: "blur" },
          {
            type: "email",
            message: "'请输入正确的邮箱地址",
            trigger: ["blur", "change"],
          },
        ],
        tel: [
          { required: true, message: "手机号码不能为空", trigger: "blur" },
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: "请输入正确的手机号码",
            trigger: "blur",
          },
        ],
      },
      fromunitList: [],
    };
  },
  created() {
    changeunitList().then((response) => {
      this.fromunitList = response.data;
    });
  },
  methods: {
    submit() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.user.unitname = "";
          updateUserProfile(this.user).then((response) => {
            this.msgSuccess("修改成功");
          }).catch(() => {});
        }
      });
    },
    close() {
      this.$store.dispatch("tagsView/delView", this.$route);
      this.$router.push({ path: "/index" });
    },
  },
};
</script>
