<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>


    <el-card>
      <!-- 用户列表区域 -->
      <el-table row-key="id" :data="rightsList" border style="width: 100%">
        <el-table-column type="index" label="#">
        </el-table-column>
        <el-table-column prop="authName" label="权限名称">
        </el-table-column>
        <el-table-column prop="path" label="路径">
        </el-table-column>
        <el-table-column prop="level" label="权限等级">
          <template v-slot="scope">
            <el-tag v-if="scope.row.level === '0'">一级权限</el-tag>
            <el-tag type="success" v-else-if="scope.row.level === '1'">二级权限</el-tag>
            <el-tag type="warning" v-else="scope.row.level === '2'">三级权限</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
  export default {
    name: "rolelist",
    data() {
      return {
        rightsList: [],
      }
    },
    created() {
      this.getRightsList()
    },
    methods: {
      async getRightsList() {
        const {data: res} = await this.$axios.get('rights/list')
        console.log(res);
        if (res.meta.status !== 200)
          return this.$message.error('获取用户列表失败')
        this.rightsList = res.data
      }
    }
  }
</script>

<style scoped>

</style>