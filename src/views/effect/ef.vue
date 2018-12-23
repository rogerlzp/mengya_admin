<template>
  <div id="login" ref="userInfo">
    <a class="login" @click='show =!show'></a>
    <transition name="info">
      <div v-if="show" class="user-info">
        <div class="user-head"></div>
        <span class="user-name">astonmartin</span>
        <span class="my-channel">我的频道</span>
        <span class="logout">退出</span>
      </div>
    </transition>
  </div>
</template>

<script>
  export default{
    name: 'ef',
    data(){
      return {
        show: false
      }
    },
    mounted() {
      let _this = this;
      document.addEventListener('click', function (e) {
        if (!!_this.$refs.userInfo.contains(e.target)) return;
        _this.show = false;
      })
    }
  }
</script>

<style>
  .info-enter, .infor-leave-active {
    opacity: 0;
    transform: translate3d(0,20%, 0);
  }
  .info-enter-active, .infor-leave-active {
    transition: all .5s cubic-bezier(0.4, 0, 0, 1.5);
  }
</style>
