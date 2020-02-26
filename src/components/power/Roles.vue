<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>


    <el-card>
      <el-button type="primary" @click="addRoleDialogVisible = true">添加角色</el-button>
      <!-- 角色列表区域 -->
      <el-table :data="roleList" border style="width: 100%">
        <el-table-column type="expand">
        <template v-slot="scope">
          <el-row :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
            <!-- 渲染一级权限 -->
            <el-col :span="5">
              <el-tag closable @close="removeRightsById(scope.row, item1.id)">{{item1.authName}}</el-tag>
              <i class="el-icon-caret-right"></i>
            </el-col>
            <!-- 渲染二级和三级权限 -->
            <el-col :span="19">
              <el-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                <el-col :span="6">
                  <el-tag closable type="success" @close="removeRightsById(scope.row, item2.id)">{{item2.authName}}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <el-col :span="18">
                  <el-tag closable :class="[i3 === 0 ? '' : 'bdtop']" v-for="(item3, i3) in item2.children" :key="item3.id"
                          type="warning" @close="removeRightsById(scope.row, item3.id)">
                    {{item3.authName}}
                  </el-tag>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#">
        </el-table-column>
        <el-table-column prop="roleName" label="角色名称">
        </el-table-column>
        <el-table-column prop="roleDesc" label="角色描述">
        </el-table-column>
        <el-table-column  label="操作">
            <template v-slot="scope">
                <el-button type="primary" icon="el-icon-edit" size="small">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="small" @click="removeRolesById(scope.row.id)">删除</el-button>
                <el-button type="warning" icon="el-icon-setting" size="small" @click="showSetRightDialog(scope.row)">分配角色</el-button>
            </template>
          </el-table-column>
      </el-table>
    </el-card>

    <el-dialog title="分配权限" :visible.sync="showSetRightDialogVisible" width="50%">
       <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all
                :default-checked-keys="defKeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
    <el-button @click="showSetRightDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="allotRights">确 定</el-button>
  </span>
    </el-dialog>

    <el-dialog title="添加角色" :visible.sync="addRoleDialogVisible" width="50%" @close="addRoleDialogClosed">
      <el-form :model="addForm" ref="addFormRef" label-width="100px" class="demo-ruleForm">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addRoleDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addRoles">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "roles",
    data() {
      return {
        roleList: [],
        showSetRightDialogVisible: false,
        rightsList: [],
        treeProps: {
          label: 'authName',
          children: 'children'
        },
        defKeys: [],
        roleId: '',
        addRoleDialogVisible: false,
        addForm: {
          roleName: '',
          roleDesc: ''
        },
      }
    },
    created() {
      this.getRoleList()
    },
    methods: {
      async getRoleList() {
        const {data: res} = await this.$axios.get('roles')
        if (res.meta.status !== 200)
          return this.$message.error('获取用户列表失败')
        this.roleList = res.data
      },
      async removeRightsById(role, rightId) {
        const confirmResult = await this.$confirm('此操作将删除该权限, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err);
        if(confirmResult !== 'confirm') {
          return this.$message.info('已取消删除')
        }
        const {data: res} = await this.$axios.delete(`roles/${role.id}/rights/${rightId}`)
        if(res.meta.status !== 200) {
          return this.$message.error('删除权限失败')
        }
        this.$message.success('删除权限成功')
        role.children = res.data
      },
      async showSetRightDialog(role) {
        this.roleId = role.id
        const {data: res} = await this.$axios.get('rights/tree')
        console.log(res);
        if (res.meta.status !== 200)
          return this.$message.error('获取用户列表失败')
        this.rightsList = res.data
        this.defKeys = []
        this.getLefKeys(role, this.defKeys)
        this.showSetRightDialogVisible = true
      },
      getLefKeys(node, arr) {
        if(!node.children) {
          return arr.push(node.id)
        }
        node.children.forEach(item => this.getLefKeys(item, arr))
      },
      async allotRights() {
        const keys = [
            ...this.$refs.treeRef.getCheckedKeys(),
            ...this.$refs.treeRef.getHalfCheckedKeys()
        ]
        const idStr = keys.join(',')
        const {data: res} = await this.$axios.post(`roles/${this.roleId}/rights/`, {rids: idStr})
        if(res.meta.status !== 200) {
          return this.$message.error('权限授予失败')
        }
        this.$message.success('权限授予成功')
        this.getRoleList()
        this.showSetRightDialogVisible = false
      },
      async removeRolesById(id) {
        const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err);
        if(confirmResult !== 'confirm') {
          return this.$message.info('已取消删除')
        }
        const { data: res} = await this.$axios.delete('roles/' + id)
        if(res.meta.status !== 200) {
          return this.$message.error('删除用户失败')
        }
        this.$message.success('已删除用户')
        this.getRoleList()
      },
      async addRoles() {
              const {data: res} = await this.$axios.post('roles', this.addForm)
              if(res.meta.status !== 201) return this.$message.error('添加用户失败')
              this.$message.success('添加用户成功')
              this.addDialogVisible = false
              this.getRoleList()
      },
      addRoleDialogClosed() {
        this.addForm = {}
      }
    }
  }
</script>

<style scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>