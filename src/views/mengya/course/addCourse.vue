<template>
  <div class="app-container">
    <div style="margin-bottom: 30px;"></div>
    <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="120px">
      <el-form-item label="Course名称：" prop="courseName" :required="true">
        <el-col :span="12">
          <el-input v-model="temp.courseName"></el-input>
        </el-col>
      </el-form-item>
      <el-form-item label="课程标题：" prop="courseTitle">
        <el-col :span="12">
          <el-input v-model="temp.courseTitle" ></el-input>
        </el-col>
      </el-form-item>
      <el-form-item label="课程描述：" prop="courseDesc">
        <el-col :span="12">
          <el-input type="textarea" v-model="temp.courseDesc" ></el-input>
        </el-col>
      </el-form-item>


      <el-form-item label="属于的年龄类别课程" prop="gradeId">
        <el-select v-model="temp.gradeId"
                   placeholder="请选择">
          <el-option v-for="(item,id) in gradeList" :key="id"
                     :label="item.gradeName"
                     :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>


      <el-form-item label="是否免费:" prop="isFree">
        <el-select v-model="temp.isFree" placeholder="免费课程" value-key="value">
          <el-option label="免费课程" value="1" key="1"></el-option>
          <el-option label="付费课程" value="0" key="0"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="课程顺序：" prop="courseNum">
        <el-col :span="12">
          <el-input  v-model="temp.courseNum"></el-input>
        </el-col>
      </el-form-item>

      <el-form-item label="课程图片：" prop="courseImage">
        <div style="margin-bottom: 20px;">
          <ImageUpload v-model="temp.courseImage" />
        </div>
      </el-form-item>

      <el-form-item label="课程视频：" prop="courseVideo">
        <div style="margin-bottom: 20px;">
          <VideoUpload v-model="temp.courseVideo" />
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
  import Tinymce from '@/components/Tinymce'
  import VideoUpload from '@/components/Upload/singleVideo'
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
          courseName: null,
          courseDesc: null,
          courseTitle: null,
          courseVideo: null,
          isFree: null,
          courseNum: null,
          content: null,
          status: null,
          gradeId: null,
          courseImage: null,
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
        gradeList: [] // 班级类别列表
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
        // 获取 gradeList
        courseApi.queryGrade(0, 20).then(res => {
          res.data.page.records.forEach(obj => {
            this.gradeList.push(obj)
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
          courseApi.addCourse(this.temp).then((res) => {
            this.temp.courseId = res.data.courseId // 后台传回来新增记录的id
            this.$message({
              type: 'success',
              center: true,
              message: '添加成功'
            })
            this.$router.push({
              path: '/mengya/course/list'
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
  @import "../../../../src/styles/mixin.scss";
  .editor-container {
    min-height: 500px;
    margin: 0 0 30px;
    .editor-upload-btn-container {
      text-align: right;
      margin-right: 10px;
      .editor-upload-btn {
        display: inline-block;
      }
    }
  }

  .role-checkbox{
    margin-left: 0px;
    margin-right: 15px;
  }

</style>
