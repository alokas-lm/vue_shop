<template>
  <div>
    <!-- 面包屑导航区 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>用户管理</el-breadcrumb-item>
        <el-breadcrumb-item>用户列表</el-breadcrumb-item>
      </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="5">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table :data="userlist" border style="width: 100%">
        <el-table-column type="index">
        </el-table-column>
        <el-table-column prop="role_name" label="角色名称" width="180">
        </el-table-column>
        <el-table-column prop="username" label="帐号" width="180">
        </el-table-column>
        <el-table-column prop="mobile" label="电话">
        </el-table-column>
        <el-table-column prop="email" label="邮箱">
        </el-table-column>
        <el-table-column prop="mg_state" label="状态">
          <template v-slot="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <el-tooltip class="item" effect="dark" content="编辑" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="删除" placement="top" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRoleDialog(scope.row)"></el-button>
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

    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" class="demo-ruleForm">
        <el-form-item label="用户名称" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" show-password></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile" :status-icon	="true">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addUsers">确 定</el-button>
  </span>
    </el-dialog>


    <el-dialog title="修改用户信息" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px" class="demo-ruleForm">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editUsers">确 定</el-button>
  </span>
    </el-dialog>

    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%" @close="setRoleDialogClose">
      <div>
        <p>当前用户：{{userInfo.username}}</p>
        <p>当前角色：{{userInfo.role_name}}</p>
        <p>分配新角色：<el-select v-model="selectRoleId" placeholder="请选择">
          <el-option
                  v-for="item in rolesList"
                  :key="item.id"
                  :label="item.roleName"
                  :value="item.id">
          </el-option>
        </el-select></p>
      </div>
      <span slot="footer" class="dialog-footer">
    <el-button @click="setRoleDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "user",
    data() {
      var checkEmail = (rule, value, callback) => {
        const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
        if (regEmail.test(value)) {
          return callback()
        }
        callback(new Error('请输入合法的邮箱'))
      }
      var checkMobile = (rule, value, callback) => {
        const regMobile = /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
        if (regMobile.test(value)) {
          return callback()
        }
        callback(new Error('请输入正确的电话'))}

      return {
        queryInfo: {
          query: '',
          pagenum: 1,
          pagesize: 2
        },
        userlist: [],
        total: 0,
        addDialogVisible: false,
        addForm: {
          username: '',
          password: '',
          email: '',
          mobile: ''
        },
        addFormRules: {
          username: [
            {required: true, message: '请输入用户名', trigger: 'blur'},
            {min: 3, max: 10, message: '用户名的长度在3~10个字符之间', trigger: 'blur'}
          ],
          password: [
            {required: true, message: '请输入密码', trigger: 'blur'},
            {min: 6, max: 16, message: '用户名的长度在6~16个字符之间', trigger: 'blur'}
          ],
          email: [
            {required: true, message: '请输入邮箱', trigger: 'blur'},
            {validator: checkEmail, trigger: 'blur'}
              ],
          mobile: [
            {required: true, message: '请输入电话', trigger: 'blur'},
            {validator: checkMobile, trigger: 'blur'}
          ]
        },
        editDialogVisible: false,
        editForm: {},
        editFormRules: {
          email: [
            {required: true, message: '请输入邮箱', trigger: 'blur'},
            {validator: checkEmail, trigger: 'blur'}
          ],
          mobile: [
            {required: true, message: '请输入电话', trigger: 'blur'},
            {validator: checkMobile, trigger: 'blur'}
          ]
        },
        mid: '',
        setRoleDialogVisible: false,
        userInfo: {},
        rolesList: [],
        selectRoleId: ''
      }
    },
    created() {
      this.getUserList()
    },
    methods: {
      async getUserList() {
        const { data: res} = await this.$axios.get('users', { params: this.queryInfo})
        if(res.meta.status !== 200)
          return this.$message.error('获取用户列表失败')
        this.userlist = res.data.users
        this.total = res.data.total
      },
      //监听 pagesize 改变的事件
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize
        this.getUserList()
      },
      //监听页码值改变
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage
        this.getUserList()
      },
      async userStateChange(userInfo) {
        const { data: res} = await this.$axios.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
        if(res.meta.status !== 200) {
          userInfo.mg_state = !userInfo.mg_state
          return this.$message.error('用户状态改变失败')
        }
      },
      addDialogClosed() {
        this.$refs.addFormRef.resetFields()
      },
      editDialogClosed() {
        this.$refs.editFormRef.resetFields()
      },
      addUsers() {
        this.$refs.addFormRef.validate(async valid => {
          if(!valid) return this.$message.error('用户信息填写不正确')
          const {data: res} = await this.$axios.post('users', this.addForm)
          if(res.meta.status !== 201) return this.$message.error('添加用户失败')
          this.$message.success('添加用户成功')
          this.addDialogVisible = false
          this.getUserList()
        })
      },
      async showEditDialog(id) {
        const { data: res} = await this.$axios.get('users/' + id)
        if(res.meta.status !== 200 ) return this.$message.error('查询用户信息失败')
        this.editForm = res.data
        this.editDialogVisible = true
      },
      editUsers() {
        this.$refs.editFormRef.validate(async valid => {
          if(!valid) return this.$message.error('用户信息填写不正确')
          const {data: res} = await this.$axios.put(`users/`+ this.editForm.id, this.editForm)
          if(res.meta.status !== 200) {
            return this.$message.error('修改用户失败')
          }
          this.$message.success('修改用户成功')
          this.editDialogVisible = false
          this.getUserList()
        })
      },
      async removeUserById(id) {
        const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err);
        if(confirmResult !== 'confirm') {
          return this.$message.info('已取消删除')
        }
        const { data: res} = await this.$axios.delete('users/' + id)
        if(res.meta.status !== 200) {
          return this.$message.error('删除用户失败')
        }
        this.$message.success('已删除用户')
        this.getUserList()
      },
      async showSetRoleDialog(userInfo) {
        this.userInfo = userInfo
        const {data: res} = await this.$axios.get('roles')
        if(res.meta.status !== 200) {
          return this.$message.error('获取角色失败')
        }
        this.rolesList = res.data
        this.setRoleDialogVisible = true
      },
      async saveRoleInfo() {
        if(!this.selectRoleId) {
          return this.$message.error('请选择要分配的角色')
        }
        const {data: res} = await this.$axios.put(`users/${this.userInfo.id}/role`, {rid: this.selectRoleId})
        if(res.meta.status !== 200) {
          return this.$message.error('分配角色失败')
        }
        this.$message.success('分配角色成功')
        this.getUserList()
        this.setRoleDialogVisible = false
      },
      setRoleDialogClose() {
        this.selectRoleId = ''
        this.userInfo = {}
      }
    },
  }
</script>

<style scoped>

</style>