<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <tree-table :data="cateList" :columns="columns" :selection-type="false" :expand-type="false"
                  :show-index="true" border>
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen;"></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" v-else="scope.row.cat_level === 2">三级</el-tag>
        </template>
        <template slot="operation" slot-scope="scope">
          <el-button type="primary" size="small" icon="el-icon-edit" @click="setCateInfo">修改</el-button>
          <el-button type="danger" size="small" class="el-icon-delete"> 删除</el-button>
        </template>
      </tree-table>
      <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="queryInfo.pagenum"
              :page-sizes="[1, 3, 5, 10]"
              :page-size="queryInfo.pagesize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total">
      </el-pagination>
    </el-card>


    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogVisibleClosed">
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addFormRef" label-width="100px">
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="分类父级">
          <!-- options 用来指定数据源 -->
          <el-cascader v-model="selectKeys" :options="parentCateList"
                       :props="casProps" clearable @change="parentCateChange">
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addCateDialogVisibleClosed">取 消</el-button>
    <el-button type="primary" @click="addCate">确 定</el-button>
  </span>
    </el-dialog>



  </div>
</template>

<script>
  export default {
    name: "categories",
    data() {
      return {
        queryInfo: {
          type: 3,
          pagenum: 1,
          pagesize: 5
        },
        total: 0,
        cateList: [],
        columns: [
          {label: '分类名称', prop: 'cat_name'},
          {label: '是否有效', type: 'template', template: 'isok'},
          {label: '排序', type: 'template', template: 'order'},
          {label: '操作', type: 'template', template: 'operation'},
        ],
        addCateDialogVisible: false,
        addCateForm: {
          cat_name: '',
          cat_pid: 0,
          //分类等级默认为1级
          cat_level: 0
        },
        addCateFormRules: {
          cat_name: [
            {required: true, message: '请输入分类名称', trigger: 'blur'}
          ]
        },
        parentCateList: [],
        casProps: {
          expandTrigger: 'hover',
          value: 'cat_id',
          label: 'cat_name',
          children: 'children',
          checkStrictly: true
        },
        //选中的父级分类的Id数组
        selectKeys: []
      }
    },
    created() {
      this.getCateList()
    },
    methods: {
      async getCateList() {
        const { data: res} = await this.$axios.get('/categories', {params: this.queryInfo})
        console.log(res.data);
        if(res.meta.status !== 200) {
          return this.$message.error('获取商品分类列表失败')
        }
        this.cateList = res.data.result
        this.total = res.data.total
      },
      //监听pagesize改变
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize
        this.getCateList()
      },
      //监听pagenum改变
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage
        this.getCateList()
      },
      addCateDialog() {
        this.addCateDialogVisible = true
        this.getParentCateList()
      },
      async getParentCateList() {
        const {data: res} = await this.$axios.get('categories', {params: {type: 2}})
        if(res.meta.status !== 200) {
          return this.$message.error('获取分类列表失败')
        }
        this.parentCateList = res.data
      },
      parentCateChange() {
        console.log(this.selectKeys.length);
        if (this.selectKeys.length > 0){
          //父级分类的ID
          this.addCateForm.cat_pid = this.selectKeys[this.selectKeys.length - 1]
          //为当前分类的等级赋值
          this.addCateForm.cat_level = this.selectKeys.length
          return
        }
        // else {
        //   this.addCateForm.cat_pid = 0
        //   //为当前分类的等级赋值
        //   this.addCateForm.cat_level = 0
        // }
      },
       addCate() {
        this.$refs.addFormRef.validate(async valid => {
          if(!valid) return
          const {data: res} = await this.$axios.post('categories', this.addCateForm)
          if(res.meta.status !== 201) {
            return this.$message.error('添加分类失败')
          }
          this.$message.success('添加分类成功')
          this.getCateList()
          this.addCateDialogVisible = false
        })
      },
      addCateDialogVisibleClosed() {
        this.addCateForm.cat_name = ''
        this.selectKeys = []
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
        this.addCateDialogVisible = false
      },
      setCateInfo() {

      }
    }
  }
</script>

<style scoped>
  .el-tag {
    margin: 2px;
  }
  .el-button {
    text-indent: 0px;
  }
  .el-row {
    margin-bottom: 15px;
  }
</style>