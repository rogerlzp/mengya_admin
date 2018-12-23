<template>
  <div class="app-container">
    <!--查询  -->
    <div style="margin-bottom: 30px;"></div>

      <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="120px">
        <el-form-item label="BannerID" prop="bannerId"  :required="true" >
          <el-col :span="12">
          <el-input v-model="temp.bannerId" :disabled="true"></el-input>
          </el-col>
        </el-form-item>
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

        <el-form-item label="Banner状态" prop="bannerState">
          <el-col :span="12">
          <el-input v-model="temp.bannerState"></el-input>
          </el-col>
        </el-form-item>


        <el-form-item label="Banner图片" prop="bannerUrl">
          <template slot-scope="scope">
            <img :src="temp.bannerUrl" style="width: 100px;height: 100px;display: block;" />
          </template>
        </el-form-item>


        <div> 更改Logo图片 </div>
        <div style="margin-bottom: 20px;">
          <ImageUpload v-model="temp.bannerUrl" />
        </div>


      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="updateData">确定</el-button>
      </div>


  </div>
</template>

<script>
  import optionApi from '@/api/option'
  import courseApi from '@/api/course'
  import { parseTime, resetTemp } from '@/utils'
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
          bannerId: null,
          bannerName: null,
          bannerUrl: null,
          linkUrl: null,
          bannerState: null,
          created: null,
          updated: null
        },
        textMap: {
          update: '编辑品牌',
          create: '新增品牌'
        },
        rules: {
          brandName: [{ validator: validateName, trigger: 'blur' }],
          brandCode: [{ validator: validateCode, trigger: 'blur' }],
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
        dialogImageUrl: '',
        dialogVisible: false
      }
    },

    created() {
      const bannerId = this.$route.params && this.$route.params.bannerId
      this.fetchData(bannerId)
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
      fetchData(bannerId) {
        courseApi.queryBannerById(bannerId).then(response => {
          const banner = response.data.banner
          this.temp.bannerId = banner.bannerId
          this.temp.bannerName = banner.bannerName
          this.temp.bannerUrl = banner.bannerUrl
          this.temp.linkUrl = banner.linkUrl
          this.temp.bannerState = banner.bannerState
        }).catch(err => {
          console.log(err)
        })
      },

      updateData() {
        this.$refs['dataForm'].validate((valid) => {
          if (!valid) return
          const tempData = Object.assign({}, this.temp) // copy obj
          courseApi.updateBanner(tempData).then(res => {
            tempData.updated = res.data.updated
            this.tableData.splice(tempData.idx, 1, tempData)
            this.dialogFormVisible = false
            this.$message.success('更新成功')
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
