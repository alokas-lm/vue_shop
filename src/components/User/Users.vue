<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>用户管理</el-breadcrumb-item>
        <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="10">
        <el-col :span="8">
          <el-input placeholder="请输入内容"
                    v-model="queryInfo.query"
                    class="input-with-select"
                    clearable @clear="getUserList">
          <el-button slot="append" icon="el-icon-search" @click="searchUser"></el-button>
        </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <el-table border stripe :data="userList">

        <el-table-column type="index" label="序号">
        </el-table-column>
        <el-table-column prop="username" label="姓名">
        </el-table-column>
        <el-table-column prop="email" label="邮箱">
        </el-table-column>
        <el-table-column prop="mobile" label="电话">
        </el-table-column>
        <el-table-column prop="role_name" label="角色">
        </el-table-column>
        <el-table-column prop="mg_state" label="状态">
          <template v-slot="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="173px">
          <template v-slot="scope">
            <el-tooltip class="item" effect="dark" content="编辑" placement="top" :enterable="false">
            <el-button size="mini" type="primary" icon="el-icon-edit"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="删除" placement="top" :enterable="false">
            <el-button size="mini" type="danger" icon="el-icon-delete"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="修改" placement="top" :enterable="false">
              <el-button size="mini" type="warning" icon="el-icon-setting"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="queryInfo.pagenum"
              :page-sizes="[1, 2, 5, 10]"
              :page-size="queryInfo.pagesize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total">
      </el-pagination>
    </el-card>

    <!--//添加用户的对话框-->
    <el-dialog
            title="添加用户"
            :visible.sync="addDialogVisible"
            width="50%"
            @close="addUser">

      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px" class="demo-ruleForm">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
        </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addDialogVisible = false">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "users",
    data() {
      var checkEmail = (rule, value, cb) => {
        const regEmail = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/
        if(regEmail.test(value))
        {return cb()};
        cb(new Error('请输入合法的邮箱'))
      }
      var checkMobile = (rule, value, cb) => {
        const regMobile =  /^1([38]\d|5[0-35-9]|7[3678])\d{8}$/
        if(regMobile.test(value))
          return cb();
        cb(new Error('请输入正确的手机号码'))
      }
      return {
        queryInfo: {
          query: '',
          // 当前页数
          pagenum: 1,
          // 当前每页显示多少条数据
          pagesize: 2
        },
        userList: [],
        total: 0,
        value: true,
        addDialogVisible: false,
        addForm: {
          username: '',
          password: '',
          email: '',
          phonenum: '',
        },
        addFormRules: {
          username: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 3, max: 10, message: '长度在3到10个字符', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 6, max: 15, message: '长度在6到15个字符', trigger: 'blur' }
          ],
          email: [
            { required: true, message: '请输入邮箱', trigger: 'blur' },
            {validator: checkEmail, trigger: 'blur'}
          ],
          mobile: [
            { required: true, message: '请输入电话', trigger: 'blur' },
            {validator: checkMobile, trigger: 'blur'}
          ]
        },

      }
    },
    created() {
      this.getUserList()
    },
    methods: {
      async getUserList() {
        const {data: res} = await this.$axios.get('users', { params: this.queryInfo})
        if(res.meta.status !== 200)
          return this.$message.error('获取用户列表失败')
        console.log(res);
        this.userList = res.data.users
        this.total = res.data.total
      },
      handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
      handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
      },
      async userStateChanged(userinfo) {
        console.log(userinfo);
        const {data: res} = await this.$axios.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
        if(res.meta.status !== 200)
        {
          userinfo.mg_state = !userinfo.mg_state
          return this.$message.error('更新用户状态失败')
        }
        this.$message.success('更新用户状态成功')
      },
      searchUser() {
        this.queryInfo.pagenum = 1
        this.getUserList()
      },
      // addDialogClosed() {
      //   this.$refs.addFormRef.resetFields()
      // },
      addUser() {
        this.$refs.addFormRef.validate(async valid => {
          if(!valid)
            return
          const {data: res} = await this.$axios.post('users', this.addForm)
          if(res.meta.status !== 201)
          {
            return this.$message.error('添加用户状态失败')
          }
          this.$message.success('添加用户状态成功')
          this.addDialogVisible = false
          this.getUserList()
        })
      }

    }
  }
</script>

<style scoped>

</style>