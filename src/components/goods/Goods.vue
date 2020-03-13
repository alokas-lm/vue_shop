<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="5">
          <el-button type="primary" @click="addGoods">添加商品</el-button>
        </el-col>
      </el-row>
      <el-table :data="goodsList" border stripe height="580">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="110px"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="110px"></el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="160px">
          <template v-slot="scope">
            {{scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200px">
          <template v-slot="scope">
            <el-button type="primary" size="mini" @click="editGoodsInfo">编辑</el-button>
            <el-button type="danger" size="mini" @click="deleteGoods(scope.row.goods_id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 30, 50, 100]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

  </div>
</template>

<script>
  export default {
    name: "goods",
    data() {
      return {
        queryInfo: {
          query: '',
          pagenum: 1,
          pagesize: 10
        },
        goodsList: [],
        total: 1,
        addDialogVisible: false,
        addRuleForm: {

        },
        rules: {

        },

      }
    },
    created() {
      this.getGoodsList()
    }
    ,
    methods: {
      async getGoodsList() {
        const {data: res} = await this.$axios.get('goods', {params: this.queryInfo})
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品列表数据失败')
        }
        console.log(res.data);
        this.goodsList = res.data.goods
        this.total = res.data.total
      },
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize
        this.getGoodsList()
      },
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage
        this.getGoodsList()
      },
      addGoods() {
        this.$router.push({path: '/goods/add'})
      },
      editGoodsInfo() {

      },
      async deleteGoods(id) {
          const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).catch(err => err);
          if (confirmResult !== 'confirm') {
            return this.$message.info('已取消删除')
          }
          const {data: res} = await this.$axios.delete(`goods/${id}`)
          if (res.meta.status !== 200) return this.$message.error('删除商品失败！')
          this.$message.success('删除商品成功！')
        this.getGoodsList()
      },
    }
  }
</script>

<style scoped>
  .el-pagination {
    margin-top: 20px;
  }
</style>