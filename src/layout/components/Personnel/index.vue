<template>
  <div>
    <span>{{ name }} </span>
    <span>-</span>
    <span>{{ unitname }}</span>
  </div>
</template>
<script>
import store from "@/store";
export default {
  data() {
    return {
      name: "",
      unitname: "",
    };
  },
  created() {
    this.name = store.getters.roles.orgaccount.account;
    this.unitname = store.getters.roles.unit.name;
  },
};
</script>

<style>
div span {
  font-size: 14px;
}
</style>
