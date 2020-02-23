<template>
    <el-container class="home-container">
      <!--头部区域-->
      <el-header>
        <div>
          <img src="../assets/heima.png" alt="logo">
          <span>电商后台管理系统</span>
        </div>
        <el-button type="info" @click="logout">退出</el-button>
      </el-header>
      <!--页面主体区域-->
      <el-container>
        <!--侧边栏-->
        <el-aside :width="isCollapse ? '64px' : '200px'">
          <div class="toggle-button" @click="toggleCollapse">|||</div>
          <el-menu
                  :default-active="this.$route.path"
                  class="el-menu-vertical-demo"
                  background-color="#333744"
                  text-color="#fff"
                  active-text-color="#409EFF"
                  unique-opened
                  :collapse="isCollapse"
                  :collapse-transition="false"
                  :router="true">
            <!-- 一级菜单 -->
            <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
              <!-- 一级菜单模板区域 -->
              <template slot="title">
                <!-- 图标 -->
                <i :class="iconList[item.id]"></i>
                <!-- 文本 -->
                <span>{{item.authName}}</span>
              </template>
                <!-- 二级菜单 -->
                <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id">
                  <template slot="title">
                    <!-- 图标 -->
                    <i class="el-icon-menu"></i>
                    <!-- 文本 -->
                    <span>{{subItem.authName}}</span>
                  </template>
                </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <!--右侧内容主体-->
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
</template>

<script>
  export default {
    name: "home",
    created() {
      this.getMenuList()
    },
    data() {
      return {
        menuList: [],
        iconList: {
          '125': 'iconfont icon-user',
          '103': 'iconfont icon-tijikongjian',
          '101': 'iconfont icon-shangpin',
          '102': 'iconfont icon-danju',
          '145': 'iconfont icon-baobiao',
        },
        isCollapse: false
      }
    },
    methods: {
      logout() {
        window.sessionStorage.clear()
        this.$router.push("/login")
      },
      async getMenuList() {
        const {data: res} = await this.$axios.get('menus')
        if(res.meta.status !==200)
          return this.$message.error(res.meta.msg)
        this.menuList = res.data
      },
      toggleCollapse() {
        this.isCollapse = !this.isCollapse
      }
    }
  }
</script>

<style scoped>
.home-container {
    height: 100%;
    width: 100%;
  }
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
}
.el-header > div {
  display: flex;
  align-items: center;
}
.el-aside {
  background-color: #333744;
}
.el-menu {
  border-right: 0;
}
.el-main {
  background-color: #eaedf1;
}
.iconfont {
  margin-right: 10px;
}
.toggle-button {
  background-color: #4A5064;
  color: #fff;
  font-size: 10px;
  line-height: 24px;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>