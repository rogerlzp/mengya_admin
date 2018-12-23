<template>
  <div class="app-container">
    <!--查询  -->
    <el-row>
      <el-input style="width:200px;" v-model="tableQuery.nick" placeholder="昵称"></el-input>
      <span style="margin-right: 15px;"></span>
      <el-tooltip class="item" content="搜索" placement="top">
        <el-button icon="el-icon-search" circle @click="fetchData(1)" v-perm="'b:user:query'"></el-button>
      </el-tooltip>
    </el-row>
    <div style="margin-bottom: 30px;"></div>
    <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleCreate" v-perm="'b:customer:add'">
      {{textMap.create}}
    </el-button>
    <div style="margin-bottom: 30px;"></div>
    <!--列表-->
    <el-table style="width: 100%"
              :data="tableData"
              v-loading.body="tableLoading"
              element-loading-text="加载中"
              border fit highlight-current-row>

      <el-table-column prop="userId" label="用户ID"></el-table-column>
      <el-table-column prop="userName" label="用户姓名"></el-table-column>
      <el-table-column prop="nickname" label="昵称"></el-table-column>
      <el-table-column prop="mobileNo" label="手机号码"></el-table-column>
      <el-table-column prop="email" label="邮箱"></el-table-column>
      <el-table-column prop="slogon" label="格言"></el-table-column>
      <el-table-column prop="gender" label="性别">
        <template slot-scope="scope">
          <div v-if="scope.row.gender==1">男</div>
          <div v-if="scope.row.gender==0">女</div>
        </template>
      </el-table-column>
      <el-table-column prop="roleName" label="角色">
      </el-table-column>
      <el-table-column prop="description" label="个人简介"></el-table-column>
      <el-table-column prop="birthday" label="出生时间"></el-table-column>
      <el-table-column prop="headImage" label="头像" width="120px" >
        <template slot-scope="scope">
          <img :src="scope.row.headImage" style="width: 100px;height: 100px;display: block;" />
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态">
        <template slot-scope="scope">
          <div v-if="scope.row.status==10">公司创建，用户未激活</div>
          <div v-if="scope.row.status==1">用户自己创建</div>
        </template>
      </el-table-column>


      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-tooltip content="编辑" placement="top">
            <el-button @click="handleUpdate(scope.$index,scope.row)" size="medium" type="info" icon="el-icon-edit"
                       circle plain></el-button>
          </el-tooltip>
          <el-tooltip content="修改角色" placement="top" v-if="!hasAdminRole(scope.row)">
            <el-button @click="handleUpdateUserRoles(scope.$index,scope.row)" size="medium" type="warning"
                       icon="el-icon-star-off" circle plain></el-button>
          </el-tooltip>
          <el-tooltip content="删除" placement="top" v-if="!hasAdminRole(scope.row)">
            <el-button @click="handleDelete(scope.$index,scope.row)" size="medium" type="danger" icon="el-icon-delete"
                       circle plain></el-button>
          </el-tooltip>
          <el-popover trigger="hover" placement="top" v-else style="display: inline-block;">
            <el-alert type="warning" :closable="false" title="权限说明">
              <div>为保证管理员在系统中的最高权限</div>
              <div>不允许编辑管理员自身的角色</div>
              <div>不允许删除管理员账号</div>
            </el-alert>
            <div slot="reference">
              <el-tag style="margin-left: 10px;" type="info">权限说明</el-tag>
            </div>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
    <div style="margin-bottom: 30px;"></div>
    <!--分页-->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="tablePage.current"
      :page-sizes="[10, 20, 30, 40, 50]"
      :page-size="tablePage.size"
      layout="total, sizes, prev, pager, next, jumper"
      :total="tablePage.total">
    </el-pagination>
    <!--弹出窗口：新增/编辑用户-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="90%">
      <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="120px">

        <el-form-item label="用户姓名" prop="userName" v-if="dialogStatus=='create'">
          <el-input v-model="temp.userName"></el-input>
        </el-form-item>

        <el-form-item label="手机号码" prop="mobileNo">
          <el-input v-model="temp.mobileNo" value="11000000000" auto-complete="off"></el-input>
        </el-form-item>

        <el-form-item label="用户密码" prop="password">
          <el-input v-model="temp.password" :value="123456"></el-input>
        </el-form-item>

        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="temp.nickname"></el-input>
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="temp.email"></el-input>
        </el-form-item>

        <el-form-item label="格言（偏好）" prop="slogon">
          <el-input v-model="temp.slogon"></el-input>
        </el-form-item>
        <el-form-item label="个人简介" prop="description">
          <el-input v-model="temp.description"></el-input>
        </el-form-item>
        <el-row>
          <el-col :span="8">
            <el-form-item label="性别:" prop="gender">
              <el-select v-model="temp.gender" placeholder="请选择性别" value-key="value">
                <el-option label="男" value="1" key="1"></el-option>
                <el-option label="女" value="0" key="0"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="出生日期:" prop="birthday">
              <el-date-picker
                v-model="temp.birthday"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="请选择出生日期">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- TODO： 增加角色 -->
        <el-form-item label="选择角色:" prop="role">
          <el-select v-model="temp.roleId" placeholder="选择角色">
            <el-option v-for="(role,index) in roleList" :key="index"
                       :label="role.roleName"
                       :value="role.id">
            </el-option>
          </el-select>
        </el-form-item>
        <!-- TODO： 增加设计公司经历 -->

        <!-- 添加头像图片 -->
        <el-upload
          :action=uploadDomain
          :http-request=upqiniu
          list-type="picture-card"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove">
          <i class="el-icon-plus"></i>
        </el-upload>
        <el-dialog :visible.sync="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt="">
        </el-dialog>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">创建</el-button>
        <el-button v-else type="primary" @click="updateData">确定</el-button>
      </div>
    </el-dialog>
    <!--弹出窗口：修改品牌角色-->

  </div>
</template>

<script>
  import optionApi from '@/api/option'
  import userApi from '@/api/user'

  import skuApi from '@/api/sku'
  import qiniuApi from '@/api/qiniu'
  import storyImageApi from '@/api/storyImageApi'
  import {parseTime, resetTemp} from '@/utils'
  import {root, confirm, pageParamNames} from '@/utils/constants'
  import debounce from 'lodash/debounce'

  export default {

    name: 'StoryImageManage',

    data() {
      const validateName = (rule, value, callback) => {
        if (this.dialogStatus === 'create' && value === '') {
          callback(new Error('必填'))
        } else {
          callback()
        }
      }

      const validateCode = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入密码'))
        } else {
          // if (this.temp.pwd2 !== '') {
          //   this.$refs.dataForm.validateField('pwd2');
          // }
          callback()
        }
      }

      const validatImageUrl = (rule, value, callback) => {
        // if (value === '') {
        //   callback(new Error('请输入密码 ImageUrl'));
        // } else  {
        callback()
        // }
      }

      return {
        parseTime: parseTime,
        tableLoading: false,
        tableData: [],
        tableQuery: {
          nick: null
        },
        tablePage: {
          current: null,
          pages: null,
          size: null,
          total: null
        },
        dialogFormVisible: false,
        editRolesDialogVisible: false,
        dialogStatus: '',
        temp: {
          idx: null, // tableData中的下标
          userId: null,
          birthday: null, // 生日
          gender: null, // 性别
          description: null, // 个人介绍
          slogon: null, // 介绍
          email: null, // email
          nickname: null, // 昵称
          password: null, // 用户密码
          mobileNo: null, // 手机号码
          userName: null, // 用户姓名
          headImage: null, // 头像
          roleId: null, // 角色 ID
          created: null,
          updated: null
        },
        textMap: {
          update: '更新设计师',
          create: '新增设计师'
        },
        rules: {
          categoryName: [{validator: validateName, trigger: 'blur'}],
          categoryCode: [{validator: validateCode, trigger: 'blur'}],
          parentId: [{validator: validatImageUrl, trigger: 'blur'}]
        },
        checkAll: false,
        isIndeterminate: true,
        // 所有角色(管理员除外)
        roleOptions: [],
        roleMap: new Map(),
        // 更新用户的角色的数据
        updateUserRolesData: {
          idx: null,
          uid: null,
          rids: []
        },

        headImage: '',
        roleList: [], // 角色列表
        qiniuToken: null,
        // 七牛云的上传地址，根据自己所在地区选择，我这里是华南区
        uploadDomain: 'https://upload.qiniup.com',
        // 这是七牛云空间的外链默认域名
        qiniuaddr: 'image-egg.ptelatino.com',
        dialogImageUrl: '',
        dialogVisible: false
      }
    },

    created() {
      this.initData()
      this.fetchData()
    },

    watch: {
      // 延时查询
      'tableQuery.nick': debounce(function () {
        this.fetchData()
      }, 500)
    }, // watch

    methods: {

      initData() {
        // 所有角色选项
        optionApi.listRoleOptions().then(res => {
          res.data.options.forEach(obj => {
            if (obj.val2 !== root.rval) { // 排除管理员
              this.roleOptions.push(obj)
              this.roleMap.set(obj.id, obj.val)
            }
          })
        })
      },

      hasAdminRole(row) {
        if (row && row.roleList) {
          return row.roleList.some(role => role.rval === root.rval)
        }
        return false
      },

      // 全选
      handleCheckAllChange(val) {
        const allRids = this.roleOptions.map(role => role.id)
        this.updateUserRolesData.rids = val ? allRids : []
        this.isIndeterminate = false
      },

      // 分页
      handleSizeChange(val) {
        this.tablePage.size = val
        this.fetchData()
      },
      handleCurrentChange(val) {
        this.tablePage.current = val
        this.fetchData()
      },

      // 查询
      fetchData(current) {
        if (current) {
          this.tablePage.current = current
        }
        this.tableLoading = true
        storyImageApi.queryUserList(0, 100).then(res => {
          this.tableData = res.data.page.records
          this.tableLoading = false
          pageParamNames.forEach(name => this.$set(this.tablePage, name, res.data.page[name]))
        })

        // Role List
        storyImageApi.queryRoleList(0, 10).then(res => {
          res.data.page.records.forEach(obj => {
            this.roleList.push(obj)
          })
        })
      },

      // 更新
      handleUpdate(idx, row) {
        this.$router.push({
          path: '/menu2/menu2_1/editUser/' + row.userId
        })
      },
      updateData() {
        this.$refs['dataForm'].validate((valid) => {
          if (!valid) return
          const tempData = Object.assign({}, this.temp) // copy obj
          userApi.updateUser(tempData).then(res => {
            tempData.updated = res.data.updated
            this.tableData.splice(tempData.idx, 1, tempData)
            this.dialogFormVisible = false
            this.$message.success('更新成功')
          })
        })
      },

      // 更新用户的角色
      handleUpdateUserRoles(idx, row) {
        // 显示用户的角色
        this.updateUserRolesData = {
          idx: idx,
          uid: row.uid,
          rids: row.roleList.map(role => role.rid)
        }
        // 显示弹窗
        this.editRolesDialogVisible = true
      },

      checkUpdateUserRolesData() {
        const noRolesSelected = this.updateUserRolesData && this.updateUserRolesData.rids && this.updateUserRolesData.rids.length === 0
        if (noRolesSelected) {
          this.$confirm('当前没有选中任何角色，会清除该用户已有的角色, 是否继续?', '提示', confirm).then(() => {
            this.invokeUpdateUserRolesApi()
          }).catch(() => {
            this.$message('已取消编辑用户角色')
          })
        } else {
          this.invokeUpdateUserRolesApi()
        }
      },

      invokeUpdateUserRolesApi() {
        userApi.updateUserRoles(this.updateUserRolesData).then(res => {
          const newRoles = this.updateUserRolesData.rids.map(rid => {
            const rname = this.roleMap.get(rid)
            if (rname) return {rid, rname}
          })
          this.tableData[this.updateUserRolesData.idx].roleList = newRoles
          this.editRolesDialogVisible = false
          this.$message.success('更新成功')
        })
      },

      // 删除
      handleDelete(idx, row) {
        this.$confirm('您确定要永久删除该用户？', '提示', confirm).then(() => {
          storyImageApi.deleteUser({ userId: row.userId }).then(res => {
            this.tableData.splice(idx, 1)
            --this.tablePage.total
            this.dialogFormVisible = false
            this.$message.success('删除成功')
          })
        }).catch(() => {
          this.$message.info('已取消删除')
        })
      },

      // 新增
      handleCreate() {
        this.$router.push({
          path: '/menu2/menu2_1/addUser'
        })
      },
      // upload to qiniu
      upqiniu(req) {
        console.log(req)
        const config = {
          headers: {'Content-Type': 'multipart/form-data'}
        }
        let filetype = ''
        if (req.file.type === 'image/png') {
          filetype = 'png'
        } else {
          filetype = 'jpg'
        }
        // 重命名要上传的文件
        const keyname = 'newegg' + Date.parse(new Date()) + Math.floor(Math.random() * 100) + '.' + filetype
        // 从后端获取上传凭证token
        qiniuApi.getToken().then((res) => {
          console.log(res)
          const formdata = new FormData()
          formdata.append('file', req.file)
          formdata.append('token', res.data.uploadToken)
          formdata.append('key', keyname)
          // 获取到凭证之后再将文件上传到七牛云空间
          this.myAxios.post(this.uploadDomain, formdata, config).then(res => {
            this.temp.headImage = 'http://' + this.qiniuaddr + '/' + res.data.key
            this.headImage = this.temp.headImage
          })
        })
      },
      // 验证文件合法性
      beforeUpload(file) {
        const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
        const isLt10M = file.size / 1024 / 1024 < 10
        if (!isJPG) {
          this.$message.error('上传头像图片只能是 JPG 格式!')
        }
        if (!isLt10M) {
          this.$message.error('上传头像图片大小不能超过 10MB!')
        }
        return isJPG && isLt10M
      },

      rmImage() {
        this.emitInput('')
      },
      emitInput(val) {
        this.headImage = ''
        // this.$emit('input', val)
      },

      // 增加产品位置
      addProjectArtist() {
        this.projectArtistList.push({})
        this.temp.projectArtistList = this.projectArtistList
      },
      deleteArtistRow(index) {
        this.projectArtistList.splice(index, 1)
        this.temp.projectArtistList = this.projectArtistList
      },

      // 增加产品位置
      addProjectCompany() {
        this.projectCompanyList.push({})
        this.temp.projectCompanyList = this.projectCompanyList
      },
      deleteCompanyRow(index) {
        this.projectCompanyList.splice(index, 1)
        this.temp.projectCompanyList = this.projectCompanyList
      },

      // 增加产品位置
      addProjectSku() {
        this.projectSkuList.push({})
        this.temp.projectSkuList = this.projectSkuList
      },
      deleteSkuRow(index) {
        this.projectSkuList.splice(index, 1)
        this.temp.projectSkuList = this.projectSkuList
      },

      handleRemove(file, fileList) {
        console.log(file, fileList)
      },
      handlePictureCardPreview(file) {
        this.dialogImageUrl = file.url
        this.dialogVisible = true
      }

    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .role-checkbox {
    margin-left: 0px;
    margin-right: 15px;
  }
</style>
