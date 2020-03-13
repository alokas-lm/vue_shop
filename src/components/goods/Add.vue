<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/goods'}">商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false">
      </el-alert>
      <el-steps :active="active - 0" finish-status="success"
                :space=300 :align-center="true">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>


      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        <el-tabs :tab-position="'left'" v-model="active" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader v-model="addForm.goods_cat" :options="cateList"
                           :props="casProps" @change="handleChange" clearable>
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item v-for="item in manyData" :key="item.attr_id" :label="item.attr_name">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox v-for="(cb, i) in item.attr_vals" :key="i" :label="cb" border size="small"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item v-for="item in onlyData" :key="item.attr_id" :label="item.attr_name">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action是指定上传的api接口 -->
            <el-upload :action="upLoadURL" :on-preview="handlePreview" :on-remove="handleRemove"
                       :on-success="handleSuccess"
                       list-type="picture"
                       :headers="headerObj">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="addProduct" @click="addProduction">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>


    <el-dialog title="图片预览" :visible.sync="picDialogVisible" width="50%">
      <img :src="pic" alt="图片">
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "add",
    data() {
      return {
        active: '',
        tabPosition: 'left',
        addForm: {
          goods_name: '',
          goods_price: 0,
          goods_number: 0,
          goods_weight: 0,
          goods_cat: [],
          pics: [],
          goods_introduce: '',
          attrs: []
        },
        addFormRules: {
          goods_name: [
            {required: true, message: '请输入商品名称', trigger: 'blur'}
          ],
          goods_price: [
            {required: true, message: '请输入商品价格', trigger: 'blur'}
          ],
          goods_number: [
            {required: true, message: '请输入商品数量', trigger: 'blur'}
          ],
          goods_weight: [
            {required: true, message: '请输入商品重量', trigger: 'blur'}
          ],
          goods_cat: [
            {required: true, message: '请输入商品重量', trigger: 'blur'}
          ]
        },
        cateList: [],
        casProps: {
          expandTrigger: 'hover',
          value: 'cat_id',
          label: 'cat_name',
          children: 'children',
        },
        manyData: [],
        onlyData: [],
        upLoadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
        headerObj: {
          Authorization: window.sessionStorage.getItem('token')
        },
        picDialogVisible: false,
        pic: '',
      }
    },
    created() {
      this.getCateList()
    },
    methods: {
      async getCateList() {
        const {data: res} = await this.$axios.get('categories')
        if (res.meta.status !== 200) {
          return this.$message.error('获取参数列表失败')
        }
        this.cateList = res.data
      },
      handleChange() {
        if (this.addForm.goods_cat.length !== 3) {
          this.addForm.goods_cat = []
        }
        console.log(this.addForm.goods_cat);
      },
      beforeTabLeave(activeName, oldActiveName) {
        if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
          this.$message.error('请完善商品信息')
          return false
        }
      },
      async tabClicked() {
        if (this.active === '1') {
          const {data: res} = await this.$axios.get(`categories/${this.cateId}/attributes`,
            {params: {sel: 'many'}})
          if (res.meta.status !== 200) {
            return this.$message.error('获取参数列表失败')
          }
          res.data.forEach(item => {
            item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
          })
          console.log(res.data);
          this.manyData = res.data
        } else if (this.active === '2') {
          const {data: res} = await this.$axios.get(`categories/${this.cateId}/attributes`,
            {params: {sel: 'only'}})
          if (res.meta.status !== 200) {
            return this.$message.error('获取静态参数失败')
          }
          console.log(res.data);
          this.onlyData = res.data
        }
      },
      handlePreview(file) {
        console.log(file);
        // this.pic = file.response.data.url
        this.pic = file.url
        this.picDialogVisible = true
      },
      handleRemove(file) {
        const filePath = file.response.data.tmp_path
        const i = this.addForm.pics.findIndex(x => x.pic === filePath)
        this.addForm.pics.splice(i, 1)
        console.log(this.addForm.pics);
      },
      handleSuccess(response) {
        console.log(response);
        const picInfo = {pic: response.data.tmp_path}
        this.addForm.pics.push(picInfo)
        console.log(this.addForm.pics);
      },
      addProduction(){
        this.$refs.addFormRef.validate(async valid => {
          if(!valid) return this.$message.error('商品信息填写有误，请重新检查填写')
          // this.addForm.goods_cat = this.addForm.goods_cat.join(',')
          var obj = JSON.parse(JSON.stringify(this.addForm))
          obj.goods_cat = obj.goods_cat.join(',')
          console.log(obj);
          this.manyData.forEach(item => {
            const newInfo = {
              attr_id: item.attr_id,
              attr_vals: item.attr_vals.join(' ')
            }
            this.addForm.attrs.push(newInfo)
          })
          this.onlyData.forEach(item => {
            const newInfo = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals
            }
            this.addForm.attrs.push(newInfo)
          })
          obj.attrs = this.addForm.attrs
          console.log(obj);
          const {data: res} = await this.$axios.post(`goods`, obj)
          if(res.meta.status !== 201) return this.$message.error('添加商品失败')
          this.$message.success('添加商品成功')
          this.$router.push('/goods')
        })
        console.log(this.addForm.goods_introduce);
      },

    },
    computed: {
      cateId() {
        if (this.addForm.goods_cat.length === 3) {
          return this.addForm.goods_cat[2]
        }
        return null
      }
    }
  }
</script>

<style scoped>
  .el-steps {
    margin-top: 20px;
  }

  .el-tabs {
    margin-top: 30px;
  }
  img {
    width: 100%;
  }
  .addProduct {
    margin-top: 20px;
  }
</style>