<template>
  <div class="app-container">
    <div style="margin-bottom: 30px;"></div>
    <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="120px">
      <el-form-item label="优惠ID：" prop="id" :required="true">
        <el-col :span="12">
          <el-input v-model="temp.id" :disabled="true"></el-input>
        </el-col>
      </el-form-item>
      <el-form-item label="优惠名称：" prop="disaccountName" :required="true">
        <el-col :span="12">
          <el-input v-model="temp.disaccountName"></el-input>
        </el-col>
      </el-form-item>
      <el-form-item label="gradeIdList：" prop="gradeIdList">
        <el-col :span="12">
          <el-input v-model="temp.gradeIdList" ></el-input>
        </el-col>
      </el-form-item>
      <el-form-item label="折扣价格：" prop="byValue">
        <el-col :span="12">
          <el-input v-model="temp.byValue" ></el-input>
        </el-col>
      </el-form-item>
      <el-form-item label="折扣百分比：" prop="byPercentage">
        <el-col :span="12">
          <el-input  v-model="temp.byPercentage" ></el-input>
        </el-col>
      </el-form-item>


      <el-form-item label="优惠类型:" prop="disaccountType">
        <el-select v-model="temp.disaccountType" placeholder="请选择课程类型" value-key="value">
            <el-option label="两份课优惠价格值" value="twoGradeByValue" key="twoGradeByValue"></el-option>
            <el-option label="两份课优惠价格百分比" value="twoGradeByPercentage" key="twoGradeByPercentage"></el-option>
            <el-option label="三份课优惠价格值" value="threeGradeByValue" key="threeGradeByValue"></el-option>
            <el-option label="三份课优惠价格百分比" value="threeGradeByPercentage" key="threeGradeByPercentage"></el-option>
        </el-select>
      </el-form-item>

      <el-col :span="8">
        <el-form-item label-width="45px" label="课程优惠:" class="postInfo-container-item">
          <el-select v-model="gradeIdList" :multiple="true" :remote-method="getRemoteGradeList" filterable remote placeholder="搜索课程">
            <el-option v-for="(item,index) in gradeListOptions" :key="item.gradeName" :label="item.gradeName"
                       :value="item.id" :value-key="item.gradeName"/>
          </el-select>
        </el-form-item>
      </el-col>

    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogFormVisible = false">取消</el-button>
      <el-button type="primary" @click="updateData">更新</el-button>
    </div>
  </div>
</template>

<script>
  import optionApi from '@/api/option'
  import courseApi from '@/api/course'
  import { parseTime, resetTemp, sleep } from '@/utils'
  import { root, confirm, pageParamNames } from '@/utils/constants'
  import VideoUpload from '@/components/Upload/singleVideo'
  import Tinymce from '@/components/Tinymce'
  import ImageUpload from '@/components/Upload/singleImage4'

  export default {
    name: 'BannerManage',
    components: {
      Tinymce, VideoUpload,ImageUpload
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
          id: null,
          gradeIdList: null,
          byValue: null,
          byPercentage: null,
          disaccountName: null,
          disaccountType: null,
          status: null,
          created: null,
          updated: null
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
        gradeListOptions: [],
        gradeIdList: []
      }
    },

    created() {
      const gradeId = this.$route.params && this.$route.params.id
      this.fetchData(gradeId)
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
        }),
        courseApi.gradeSearch().then(res => {
          if (!res.data.gradeList) return
          this.gradeListOptions = res.data.gradeList
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
          courseApi.addGrade(this.temp).then((res) => {
            this.temp.bannerId = res.data.bannerId // 后台传回来新增记录的id
            this.$message({
              type: 'success',
              center: true,
              message: '添加成功'
            })
            this.$router.push({
              path: '/mengya/grade/list'
            })
          })
        })
      },

      updateData() {
        const that = this
        this.$refs['dataForm'].validate((valid) => {
          if (!valid) return
          that.temp.gradeIdList = []
          for (var i = 0; i < that.gradeIdList.length; i++) {
            that.temp.gradeIdList += that.gradeIdList[i]
            if (i < that.gradeIdList.length - 1) {
              that.temp.gradeIdList += ';'
            }
          }
          courseApi.updateGradeDisaccount(this.temp).then((res) => {
            this.temp.updated = res.data.updated // 后台传回来新增记录的id
            this.$message({
              type: 'success',
              center: true,
              message: '更新成功'
            })
            this.$router.push({
              path: '/mengya/disaccount/list'
            })
          })
        })
      },
      // 查询
      fetchData(gradeId) {
        courseApi.queryGradeDisaccountById(gradeId).then(response => {
          const gradeDisaccount = response.data.gradeDisaccount
          this.temp.id = gradeDisaccount.id
          this.temp.disaccountName = gradeDisaccount.disaccountName
          this.temp.disaccountType = gradeDisaccount.disaccountType
          this.temp.byValue = gradeDisaccount.byValue
          this.temp.byPercentage = gradeDisaccount.byPercentage
          this.temp.gradeIdList = gradeDisaccount.gradeIdList
          this.temp.status = gradeDisaccount.status

          this.gradeIdList = gradeDisaccount.gradeIdList.split(';')

        }).catch(err => {
          console.log(err)
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
        // this.dialogImageUrl = file.url
        // this.dialogVisible = true
      },

      getRemoteGradeList() {
        courseApi.gradeSearch().then(res => {
          if (!res.data.gradeList) return
          this.gradeListOptions = res.data.gradeList
        })
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
