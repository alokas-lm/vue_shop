<template>
  <!--头部区域-->
  <el-container class="home_container">
    <el-header>
      <div class="header_div">
        <img src="../assets/heima.png" alt="icon">
        <span class="head_text">超级管理后台系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <!--左侧区域-->
      <el-aside :width="isCollapse ? '64px' : '200px' ">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!--左侧菜单区域-->
        <el-menu background-color="#333744"
                 text-color="#fff"
                 active-text-color="#409EFF"
                 :unique-opened="true"
                 :collapse="isCollapse"
                 :collapse-transition="false"
                 router
                 :default-active="$route.path">

          <!-- 一级菜单 -->
          <el-submenu :index="item.id + '' "
                      v-for="item in menulist"
                      :key="item.id" >
            <!-- 一级菜单的模板区域 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconList[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>

            <!-- 二级菜单区 -->
            <el-menu-item :index=" '/'+subItem.path " v-for="subItem in item.children" :key="subItem.id">
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>

  export default {
    name: "home",
    components: {

    },
    data() {
      return {
        menulist: [],
        iconList: {
          '125': 'iconfont icon-users',
          '103': 'iconfont icon-tijikongjian',
          '101': 'iconfont icon-shangpin',
          '102': 'iconfont icon-danju',
          '145': 'iconfont icon-baobiao',
        },
        isCollapse: false,
      }
    },
    created() {
      this.getMenuList()
    },
    methods: {
      logout() {
        window.sessionStorage.clear()
        this.$router.push("/login")
      },
      async getMenuList() {
        const {data: res} = await this.$axios.get('menus')
        if(res.meta.status !== 200)
          return this.$message.error(res.meta.msg)
        this.menulist = res.data
        console.log(res);
      },
      toggleCollapse() {
        this.isCollapse = !this.isCollapse
      },
    }
  }
</script>

<style scoped>
  .el-header {
    background-color: #373D41;
    display: flex;
    justify-content: space-between;
    padding-left: 0px;
    align-items: center;
    color: #e9e9e9;
    font-size: 20px;
}
  .header_div {
    display: flex;
    align-items: center;
  }
  .head_text {
    margin-left: 15px;
  }
  .el-aside {
    background-color: #333744;
  }
  .el-main {
    background-color: #EAEDF1;
  }
  .home_container {
    height: 100%;
  }
  .iconfont {
    margin-right: 10px;
  }
  .el-menu {
    border-right: none;
  }
  .toggle-button {
    background-color: #4A5064;
    text-align: center;
    color: #fff;
    line-height: 24px;
    font-size: 10px;
    letter-spacing: 0.2em;
    cursor: pointer;
  }

</style>