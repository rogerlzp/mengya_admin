<template>
  <div class="app-container">
    <!-- 新增/编辑用户 -->
      <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="120px">

        <el-form-item label="用户姓名" prop="userName" :required="true">
          <el-col :span="12">
          <el-input v-model="temp.userName"></el-input>
          </el-col>
        </el-form-item>

        <el-form-item label="手机号码" prop="mobileNo">
          <el-col :span="12">
          <el-input v-model="temp.mobileNo" value="11000000000" auto-complete="off"></el-input>
          </el-col>
        </el-form-item>

        <el-form-item label="用户密码" prop="password">
          <el-col :span="12">
          <el-input v-model="temp.password" :value="123456"></el-input>
          </el-col>
        </el-form-item>

        <el-form-item label="昵称" prop="nickname">
          <el-col :span="12">
          <el-input v-model="temp.nickname"></el-input>
          </el-col>
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-col :span="12">
          <el-input v-model="temp.email"></el-input>
          </el-col>
        </el-form-item>

        <el-form-item label="格言（偏好）" prop="slogon">
          <el-col :span="12">
          <el-input v-model="temp.slogon"></el-input>
          </el-col>
        </el-form-item>
        <el-form-item label="个人简介" prop="description">
          <el-col :span="12">
          <el-input  type="textarea" v-model="temp.description"></el-input>
          </el-col>
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
        </el-row>
        <el-row>
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
        <div style="margin-top: 30px; margin-bottom: 20px"><span>增加用户头像</span>
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
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="close">取消</el-button>
        <el-button type="primary" @click="createData">创建</el-button>
      </div>
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

    name: 'DesignerManage',

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
          callback()
        }
      }

      const validatImageUrl = (rule, value, callback) => {
        callback()
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

        storyImageApi.queryRoleList(0, 10).then(res => {
          res.data.page.records.forEach(obj => {
            this.roleList.push(obj)
          })
        })
      },

      hasAdminRole(row) {
        if (row && row.roleList) {
          return row.roleList.some(role => role.rval === root.rval)
        }
        return false
      },
      // 新增
      createData() {
        this.$refs['dataForm'].validate((valid) => {
          if (!valid) return
          storyImageApi.addUser(this.temp).then((res) => {
            this.temp.id = res.data.id // 后台传回来新增记录的id
            this.$message.success('添加成功')
            this.$router.push({
              path: '/menu2/menu2_1/list'
            })
          })
        })
      },

      close() {
        this.$router.push({
          path: '/menu2/menu2_1/list'
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
