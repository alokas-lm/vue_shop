<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-alert
              title="注意：只允许为第三级分类设置相关参数"
              type="warning" show-icon :closable="false">

      </el-alert>
      <el-row class="style">
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader v-model="selectKeys" :options="cateList"
                       :props="casProps" clearable @change="handleChange">
          </el-cascader>
        </el-col>
      </el-row>
      <el-tabs v-model="activeName" @tab-click="handleClick" :disabled="isBtnDisabled">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" :disabled="isBtnDisabled" size="small" @click="addDialogVisible = true">添加参数
          </el-button>
          <el-table :data="manyDate" border stripe>
            <el-table-column type="expand">
              <template v-slot="scope">
                <el-tag class="tag-style" closable v-for="(item, i) in scope.row.attr_vals" :key="i"
                @close="handleClosed(i, scope.row)">{{item}}</el-tag>

                <el-input
                        class="input-new-tag"
                        v-if="scope.row.inputVisible"
                        v-model="scope.row.inputValue"
                        ref="saveTagInput"
                        size="small"
                        @keyup.enter.native="handleInputConfirm(scope.row)"
                        @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag
                </el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button type="primary" icon="el-icon-edit" size="small" @click="showEditParams(scope.row.attr_id)">
                  修改
                </el-button>
                <el-button type="danger" icon="el-icon-delete" size="small" @click="deleteParams(scope.row.attr_id)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" :disabled="isBtnDisabled" size="small" @click="addDialogVisible = true">添加参数
          </el-button>
          <el-table :data="onlyData" border stripe>
            <el-table-column type="expand">

            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button type="primary" icon="el-icon-edit" size="small" @click="showEditParams(scope.row.attr_id)">
                  修改
                </el-button>
                <el-button type="danger" icon="el-icon-delete" size="small" @click="deleteParams(scope.row.attr_id)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!--添加参数的Dialog-->
    <el-dialog
            :title="'添加' + titleText"
            :visible.sync="addDialogVisible"
            width="50%"
            @close="addDialogClosed">
      <el-form :model="addRuleForm" :rules="rules" ref="ruleFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addRuleForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addParams">确 定</el-button>
  </span>
    </el-dialog>
    <!--修改参数的Dialog-->
    <el-dialog
            :title="'修改' + titleText"
            :visible.sync="editDialogVisible"
            width="50%"
            @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="setRuleFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="confirmEditParams">确 定</el-button>
  </span>
    </el-dialog>

  </div>
</template>

<script>
  export default {
    name: "params",
    data() {
      return {
        cateList: [],
        casProps: {
          expandTrigger: 'hover',
          value: 'cat_id',
          label: 'cat_name',
          children: 'children',
          checkStrictly: true
        },
        selectKeys: [],
        activeName: 'many',
        manyDate: [],
        onlyData: [],
        addDialogVisible: false,
        editDialogVisible: false,
        addRuleForm: {
          attr_name: ''
        },
        rules: {
          attr_name: [
            {required: true, message: '请输入参数名', trigger: 'blur'}
          ]
        },
        editForm: {},
        editFormRules: {
          attr_name: [
            {required: true, message: '请输入参数名', trigger: 'blur'}
          ]
        },
      }
    },
    created() {
      this.getCateList()
    },
    methods: {
      //获取商品分类列表
      async getCateList() {
        const {data: res} = await this.$axios.get('categories')
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品分类列表失败！')
        }
        this.cateList = res.data
      },
      //级联选择框选中项变化，会触发此函数
      handleChange() {
        this.getParamsData()
      },
      handleClick() {
        this.getParamsData()
      },
      async getParamsData() {
        if (this.selectKeys.length !== 3) {
          this.selectKeys = [];
          return
        }
        const {data: res} = await this.$axios.get(`categories/${this.cateId}/attributes`, {params: {sel: this.activeName}})
        if (res.meta.status !== 200) {
          return this.$message.error('获取参数失败')
        }
        console.log(res.data);
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
          item.inputVisible = false
          item.inputValue = ''
        })
        if (this.activeName === 'many') {
          this.manyDate = res.data
        } else {
          this.onlyData = res.data
        }
      },
      addParams() {
        this.$refs.ruleFormRef.validate(async valid => {
          if (!valid) return
          const {data: res} = await this.$axios.post(`categories/${this.cateId}/attributes`, {
            attr_name: this.addRuleForm.attr_name,
            attr_sel: this.activeName
          })
          if (res.meta.status !== 201) {
            return this.$message.error('添加参数失败！')
          }
          this.$message.success('添加参数成功!')
          this.addDialogVisible = false
          this.getParamsData()
        })
      },
      addDialogClosed() {
        this.$refs.ruleFormRef.resetFields()
      },
      editDialogClosed() {
        this.$refs.setRuleFormRef.resetFields()
      },
      async showEditParams(id) {
        this.editDialogVisible = true
        const {data: res} = await this.$axios.get(`categories/${this.cateId}/attributes/${id}`,
            {attr_sel: this.activeName})
        if (res.meta.status !== 200) return this.$message.error('获取参数失败')
        this.editForm = res.data
      },
      confirmEditParams() {
        this.$refs.setRuleFormRef.validate(async valid => {
          if (!valid) return
          const {data: res} = await this.$axios.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName,
            attr_vals: this.editForm.attr_vals
          })
          if (res.meta.status !== 200) return this.$message.error('更新参数失败')
          this.$message.success('更新参数成功')
          this.editDialogVisible = false
          this.getParamsData()
        })
      },
      async deleteParams(id) {
        const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err);
        if (confirmResult !== 'confirm') {
          return this.$message.info('已取消删除')
        }
        const {data: res} = await this.$axios.delete(`categories/${this.cateId}/attributes/${id}`)
        if (res.meta.status !== 200) return this.$message.error('删除参数失败！')
        this.$message.success('删除参数成功！')
        this.getParamsData()
      },
      showInput(row) {
        row.inputVisible = true
        //$nextTick 方法的作用，就是当页面上的元素被重新渲染之后，才会执行回调函数中的代码
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
      },
      handleInputConfirm(row) {
        if (row.inputValue.trim().length === 0) {
          row.inputValue = ''
          row.inputVisible = false
          return
        }
        row.attr_vals.push(row.inputValue.trim())
        row.inputValue = ''
        row.inputVisible = false
        // const {data: res} = await this.$axios.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        //   attr_name: row.attr_name,
        //   attr_sel: row.attr_sel,
        //   attr_vals: row.attr_vals.join(' ')
        // })
        // if (res.meta.status !== 200) {
        //   return this.$message.error('标签更新失败')
        // }
        // this.$message.success('标签更新成功')
this.saveAttrVals(row)
      },
      async saveAttrVals(row) {
        const {data: res} = await this.$axios.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        })
        if (res.meta.status !== 200) {
          return this.$message.error('标签更新失败')
        }
        this.$message.success('标签更新成功')
      },

      async handleClosed (i, row) {
          row.attr_vals.splice(i, 1);
        this.saveAttrVals(row)
      }
    },
    computed: {
      isBtnDisabled() {
        if (this.selectKeys.length !== 3) {
          return true
        }
        return false
      },
      cateId() {
        if (this.selectKeys.length === 3) {
          return this.selectKeys[2]
        }
        return null
      },
      titleText() {
        if (this.activeName === 'many') {
          return '动态参数'
        }
        return '静态属性'
      }
    }
  }
</script>

<style scoped>
  .style {
    margin-top: 20px;
  }

  .el-tabs {
    margin-top: 15px;
  }

  .input-new-tag {
    width: 200px;
  }

  .tag-style {
    margin: 0px 10px 0px 10px;
  }
</style>