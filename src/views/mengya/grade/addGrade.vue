<template>
  <div class="app-container">
    <div style="margin-bottom: 30px;"></div>
    <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="120px">
      <el-form-item label="Grade名称：" prop="gradeName" :required="true">
        <el-col :span="12">
          <el-input v-model="temp.gradeName"></el-input>
        </el-col>
      </el-form-item>
      <el-form-item label="展示价格：" prop="listPrice">
        <el-col :span="12">
          <el-input v-model="temp.listPrice" ></el-input>
        </el-col>
      </el-form-item>
      <el-form-item label="实际出售价格：" prop="salePrice">
        <el-col :span="12">
          <el-input v-model="temp.salePrice" ></el-input>
        </el-col>
      </el-form-item>
      <el-form-item label="适合年龄：" prop="gradeAge">
        <el-col :span="12">
          <el-input v-model="temp.gradeAge" ></el-input>
        </el-col>
      </el-form-item>
      <el-form-item label="课程链接（待确定）：" prop="gradeLink">
        <el-col :span="12">
          <el-input  v-model="temp.gradeLink" ></el-input>
        </el-col>
      </el-form-item>


      <el-form-item label="课程类型:" prop="gradeType">
        <el-select v-model="temp.gradeType" placeholder="请选择课程类型" value-key="value">
          <el-option label="视频" value="1" key="1"></el-option>
          <el-option label="音频" value="2" key="2"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="付费类型:" prop="isFree">
        <el-select v-model="temp.payType" placeholder="付费类型" value-key="value">
          <el-option label="免费课程" value="1" key="1"></el-option>
          <el-option label="付费课程" value="0" key="0"></el-option>
        </el-select>
      </el-form-item>


      <el-form-item label="课程描述：" prop="gradeDesc">
        <el-col :span="12">
          <el-input type="textarea" v-model="temp.gradeDesc" ></el-input>
        </el-col>
      </el-form-item>

      <el-form-item label="课程Cover图片：" prop="gradeCover">
        <div style="margin-bottom: 20px;">
          <ImageUpload v-model="temp.gradeCover" />
        </div>
        <!--<el-dialog :visible.sync="dialogVisible">-->
          <!--<img width="100%" :src="dialogImageUrl" alt="">-->
        <!--</el-dialog>-->
      </el-form-item>
      <el-form-item label="课程介绍视频：" prop="gradeVideo">
        <div style="margin-bottom: 20px;">
          <VideoUpload v-model="temp.gradeVideo" />
        </div>
      </el-form-item>

      <div class="editor-container">
        <Tinymce ref="editor" :height="400" v-model="temp.content" />
      </div>


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
  import VideoUpload from '@/components/Upload/singleVideo'
  import ImageUpload from '@/components/Upload/singleImage4'
  import Tinymce from '@/components/Tinymce'


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
          gradeName: null,
          listPrice: null,
          salePrice: null,
          gradeAge: null,
          gradeLink: null,
          status: null,
          gradeDesc: null,
          content: null,
          gradeType: null,
          payType: null,
          gradeCover: null,
          gradeVideo: null,
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
        roleMap: new Map()
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
          courseApi.addGrade(this.temp).then((res) => {
            this.temp.gradeId = res.data.gradeId // 后台传回来新增记录的id
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
