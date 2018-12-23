<template>
  <div class="app-container">
    <div style="margin-bottom: 30px;"></div>
    <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="120px">
      <el-form-item label="折扣名称：" prop="disaccountName" :required="true">
        <el-col :span="12">
          <el-input v-model="temp.disaccountName"></el-input>
        </el-col>
      </el-form-item>
      <el-form-item label="折扣类型：" prop="disaccountType">
        <el-col :span="12">
          <el-select v-model="temp.disaccountType" placeholder="折扣类型" value-key="value">
            <el-option label="两份课优惠价格值" value="twoGradeByValue" key="twoGradeByValue"></el-option>
            <el-option label="两份课优惠价格百分比" value="twoGradeByPercentage" key="twoGradeByPercentage"></el-option>
            <el-option label="三份课优惠价格值" value="threeGradeByValue" key="threeGradeByValue"></el-option>
            <el-option label="三份课优惠价格百分比" value="threeGradeByPercentage" key="threeGradeByPercentage"></el-option>
          </el-select>
        </el-col>
      </el-form-item>
      <el-form-item label="优惠价格值(减多少钱)：" prop="byValue"
                    v-if="temp.disaccountType == 'twoGradeByValue' ||temp.disaccountType == 'threeGradeByValue' ">
        <el-col :span="12">
          <el-input v-model="temp.byValue"></el-input>
        </el-col>
      </el-form-item>
      <el-form-item label="优惠价格值(打几折)：" prop="gradeAge"
                    v-else-if="temp.disaccountType == 'twoGradeByPercentage' ||temp.disaccountType == 'threeGradeByPercentage' ">
        <el-col :span="12">
          <el-input v-model="temp.byPercentage"></el-input>
        </el-col>
      </el-form-item>


      <el-col :span="8">
        <el-form-item label-width="45px" label="课程优惠:" class="postInfo-container-item">
          <el-select v-model="gradeIdList" :remote-method="getRemoteGradeList" :multiple="true" filterable remote
                     placeholder="搜索课程">
            <el-option v-for="(item,index) in gradeListOptions" :key="item.gradeName" :label="item.gradeName"
                       :value="item.id" :value-key="item.gradeName" />
          </el-select>
          <!--<el-checkbox-group v-model="checkboxGroup1">-->
          <!--<el-checkbox-button v-for="item in gradeListOptions"-->
          <!--:label="item.gradeName" :key="item.id">{{city}}</el-checkbox-button>-->
          <!--</el-checkbox-group>-->
        </el-form-item>
      </el-col>


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
  import {parseTime, resetTemp, sleep} from '@/utils'
  import {root, confirm, pageParamNames} from '@/utils/constants'
  import VideoUpload from '@/components/Upload/singleVideo'
  import ImageUpload from '@/components/Upload/singleImage4'
  import Tinymce from '@/components/Tinymce'


  export default {
    name: 'BannerManage',
    components: {
      Tinymce, VideoUpload, ImageUpload
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
          brandName: [{validator: validateName, trigger: 'blur'}],
          brandImageUrl: [{validator: validatImageUrl, trigger: 'blur'}]
        },
        checkAll: false,
        isIndeterminate: true,
        // 所有角色(管理员除外
        roleOptions: [],
        roleMap: new Map(),
        gradeListOptions: [],
        gradeIdList: [],
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
        const that = this

        this.$refs['dataForm'].validate((valid) => {
          if (!valid) return
          for (var i = 0; i < that.gradeIdList.length; i++) {
            that.temp.gradeIdList += that.gradeIdList[i]
            if (i < that.gradeIdList.length - 1) {
              that.temp.gradeIdList += ';'
            }
          }
          courseApi.addGradeDisaccount(this.temp).then((res) => {
            this.temp.disaccountId = res.data.disaccountId // 后台传回来新增记录的id
            this.$message({
              type: 'success',
              center: true,
              message: '添加优惠成功'
            })
            this.$router.push({
              path: '/mengya/disaccount/list'
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
  .role-checkbox {
    margin-left: 0px;
    margin-right: 15px;
  }

  .postInfo-container-item {
    float: left;
  }
</style>
