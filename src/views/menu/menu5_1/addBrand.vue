<template>
  <div class="app-container">
    <div style="margin-bottom: 30px;"></div>
      <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="120px">
        <el-form-item label="品牌名称：" prop="brandName" :required="true">
          <el-col :span="12">
          <el-input v-model="temp.brandName"></el-input>
          </el-col>
        </el-form-item>
        <el-form-item label="品牌英文名称：" prop="brandEnName">
          <el-col :span="12">
          <el-input v-model="temp.brandEnName"></el-input>
          </el-col>
        </el-form-item>
        <el-form-item label="品牌描述：" prop="brandDesc">
          <el-col :span="12">
          <el-input type="textarea" v-model="temp.brandDesc" ></el-input>
          </el-col>
        </el-form-item>
        <el-form-item label="品牌英文描述：" prop="brandEnDesc">
          <el-col :span="12">
          <el-input  type="textarea" v-model="temp.brandEnDesc"></el-input>
          </el-col>
        </el-form-item>
        <el-form-item label="品牌代码：" prop="brandCode">
          <el-col :span="12">
          <el-input v-model="temp.brandCode"></el-input>
          </el-col>
        </el-form-item>

        <el-form-item label="品牌官网：" prop="homepage">
          <el-col :span="12">
            <el-input v-model="temp.homepage"></el-input>
          </el-col>
        </el-form-item>

        <el-form-item label="品牌故事：" prop="brandStory">
          <el-col :span="12">
            <el-input v-model="temp.brandStory"></el-input>
          </el-col>
        </el-form-item>

        <el-form-item label="父类ID：" prop="parentId">
          <el-col :span="12">
          <el-input  v-model="temp.parentId"></el-input>
          </el-col>
        </el-form-item>

        <el-form-item label="品牌图片：" prop="brandLogo">

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
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="createData">创建</el-button>
      </div>
  </div>
</template>

<script>
  import optionApi from '@/api/option'
  import userApi from '@/api/user'
  import skuApi from '@/api/sku'
  import qiniuApi from '@/api/qiniu'
  import { parseTime, resetTemp, sleep } from '@/utils'
  import { root, confirm, pageParamNames } from '@/utils/constants'
  import debounce from 'lodash/debounce'


  export default {
    name: 'BrandManage',
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
          callback(new Error('请输入密码'));
        } else {
          // if (this.temp.pwd2 !== '') {
          //   this.$refs.dataForm.validateField('pwd2');
          // }
          callback()
        }
      }

      const validatImageUrl = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入密码 ImageUrl'))
        } else {
          callback()
        }
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
          id: null,
          brandName: null,
          brandEnName: null,
          brandCode: null,
          brandLogo: null,
          brandDesc: null,
          brandEnDesc: null,
          brandStory: null,
          homepage: null,
          created: null,
          updated: null
        },
        textMap: {
          update: '编辑品牌',
          create: '新增品牌'
        },
        rules: {
          brandName: [{ validator: validateName, trigger: 'blur' }],
          brandImageUrl: [{ validator: validatImageUrl, trigger: 'blur' }]
        },
        checkAll: false,
        isIndeterminate: true,
        // 所有角色(管理员除外
        roleOptions: [],
        roleMap: new Map(),
        // 更新用户的角色的数据
        updateUserRolesData: {
          idx: null,
          uid: null,
          rids: []
        },
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
      // 查询
      fetchData(current) {
        if (current) {
          this.tablePage.current = current
        }
        this.tableLoading = true
        skuApi.queryBrand(0, 10).then(res => {
          this.tableData = res.data.page.records
          this.tableLoading = false
          pageParamNames.forEach(name => this.$set(this.tablePage, name, res.data.page[name]))
        })
      },
      // 新增
      createData() {
        this.$refs['dataForm'].validate((valid) => {
          if (!valid) return
          skuApi.addBrand(this.temp).then((res) => {
            this.temp.id = res.data.brandId // 后台传回来新增记录的id
            this.tableData.unshift(Object.assign({}, this.temp))
            ++this.tablePage.total
            this.$message({
              type: 'success',
              center: true,
              message: '添加成功'
            });
            // this.$message.success('添加成功')
            this.$router.push({
              path: '/menu5/menu5_1/list'
            })
          })
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
            this.temp.brandLogo = 'http://' + this.qiniuaddr + '/' + res.data.key
            this.brandLogo = this.temp.brandLogo
          })
        }).catch(function(error) {
          console.log('发生错误！', error);
        });
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
  .role-checkbox{
    margin-left: 0px;
    margin-right: 15px;
  }
</style>
