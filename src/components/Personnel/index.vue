<template>
  <div>
    <span v-if="show" class="orization">系统授权还剩 
      <span> {{ date }}</span>天，请及时联系管理员授权！
    </span>
    <span v-if="gqshow" class="orization">
      <span> 系统授权已过期，请联系管理员授权 ！</span>
    </span>
    <span>{{ account }}-</span>
    <span>{{ name }}-</span>
    <span>{{ unitname }}</span>
  </div>
</template>
<script>
import { expirationTime } from "@/api/system/dept";
import store from "@/store";
export default {
  data() {
    return {
      account: store.getters.roles.orgaccount.account,
      unitname: store.getters.roles.unit.name,
      name:store.getters.roles.person.name,
      show: false,
      gqshow: false,
      date: 0,
    };
  },
  created() {
    this.getUser();
  },
  methods: {
    toggleShow() {
      this.show = !this.show;
    },
    getUser() {
      expirationTime().then((response) => {
        this.date = response.data;
        if (this.date > 0 && this.date < 31) {
          this.show = true;
          this.gqshow = false;
          setInterval(this.toggleShow, 1000);
        } else if (this.date < 0) {
          this.show = false;
          this.gqshow = true;
        }
      });
    },
  },
};
</script>

<style>
div span {
  font-size: 14px;
}
.orization {
  color: black;
  font-size: 14px;
}
.orization span {
  color: red;
  /* font-size: 20px; */
  font-weight: bold;
}
.slide-enter-active,
.slide-leave-active {
  transition: all 1s;
}
.slide-enter,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>
