<template>
  <div class="app-container">
    <div style="margin-bottom: 30px;"></div>
      <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="120px">
        <el-form-item label="Banner名称：" prop="bannerName" :required="true">
          <el-col :span="12">
          <el-input v-model="temp.bannerName"></el-input>
          </el-col>
        </el-form-item>
        <el-form-item label="点击后的跳转链接：" prop="linkUrl">
          <el-col :span="12">
          <el-input type="textarea" v-model="temp.linkUrl" ></el-input>
          </el-col>
        </el-form-item>

        <el-form-item label="Banner图片：" prop="bannerUrl">
            <div style="margin-bottom: 20px;">
              <ImageUpload v-model="temp.bannerUrl" />
            </div>
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
  import courseApi from '@/api/course'
  import { parseTime, resetTemp, sleep } from '@/utils'
  import { root, confirm, pageParamNames } from '@/utils/constants'
  import debounce from 'lodash/debounce'
  import ImageUpload from '@/components/Upload/singleImage4'

  export default {
    name: 'BannerManage',
    components: {
      ImageUpload
    },
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
        dialogStatus: '',
        temp: {
          idx: null, // tableData中的下标
          bannerId: null,
          bannerName: null,
          bannerUrl: null,
          linkUrl: null,
          bannerState: null,
          created: null,
          updated: null
        },
        textMap: {
          update: '编辑Banner',
          create: '新增Banner'
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
        dialogImageUrl: '',
        dialogVisible: false
      }
    },

    created() {
      this.initData()
    },

    watch: {
      // 延时查询
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
      // 新增
      createData() {
        this.$refs['dataForm'].validate((valid) => {
          if (!valid) return
          courseApi.addBanner(this.temp).then((res) => {
            this.temp.bannerId = res.data.bannerId // 后台传回来新增记录的id
            this.$message({
              type: 'success',
              center: true,
              message: '添加成功'
            })
            this.$router.push({
              path: '/mengya/banner/list'
            })
          })
        })
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
