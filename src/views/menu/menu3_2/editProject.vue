<template>
  <div class="app-container">
    <div style="margin-bottom: 30px;"></div>
    <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="120px">
      <el-form-item label="项目名称" prop="projectName" >
        <el-input v-model="temp.projectName" ></el-input>
      </el-form-item>

      <el-form-item label="地址" prop="location">
        <el-input v-model="temp.location"></el-input>
      </el-form-item>

      <el-form-item label="开始时间" prop="beginTime">
        <el-date-picker
          v-model="temp.beginTime"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择开始时间">
        </el-date-picker>
      </el-form-item>

      <el-form-item label="结束时间" prop="endTime">
        <el-date-picker
          v-model="temp.endTime"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择结束时间">
        </el-date-picker>
      </el-form-item>

      <el-form-item label="客户" prop="customer">
        <el-input  v-model="temp.customer"></el-input>
      </el-form-item>

      <el-form-item label="项目描述" prop="projectDesc">
        <el-input  v-model="temp.projectDesc"></el-input>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-input  v-model="temp.status"></el-input>
      </el-form-item>
      <el-form-item label="空间类型" prop="spaceType">
        <el-input  v-model="temp.spaceType"></el-input>
      </el-form-item>

      <!-- TODO： 增加项目的设计者 -->
      <div>
        <el-button @click="addProjectArtist">添加设计师</el-button>
        <el-table :data="projectArtistList">
          <el-table-column prop="userId" label="设计师ID">
            <template slot-scope="scope">
              <el-input v-model="projectArtistList[scope.$index].userId"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="userName" label="设计师名称">
            <template slot-scope="scope">
              <el-input v-model="projectArtistList[scope.$index].userName"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="age" label="">
            <template slot-scope="scope">
              <el-button @click="deleteArtistRow(scope.$index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- TODO： 增加项目的设计公司 -->
      <div>
        <el-button @click="addProjectCompany">添加设计公司</el-button>
        <el-table :data="projectCompanyList">
          <el-table-column prop="id" label="公司ID">
            <template slot-scope="scope">
              <el-input v-model="projectCompanyList[scope.$index].id"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="companyName" label="公司名称">
            <template slot-scope="scope">
              <el-input v-model="projectCompanyList[scope.$index].companyName"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="age" label="">
            <template slot-scope="scope">
              <el-button @click="deleteCompanyRow(scope.$index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>


      <!-- TODO： 增加添加包含的产品 -->
      <div>
        <el-button @click="addProjectSku">添加包含的产品</el-button>
        <el-table :data="projectSkuList">
          <el-table-column prop="skuNo" label="SKU 编号">
            <template slot-scope="scope">
              <el-input v-model="projectSkuList[scope.$index].skuNo"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="skuName" label="SKU 名称">
            <template slot-scope="scope">
              <el-input v-model="projectSkuList[scope.$index].skuName"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="age" label="">
            <template slot-scope="scope">
              <el-button @click="deleteSkuRow(scope.$index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>


      <!-- 添加产品对应的图片 -->
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
      <el-button type="primary" @click="updateData">确定</el-button>
    </div>
    <!--弹出窗口：修改品牌角色-->

  </div>
</template>

<script>
  import optionApi from '@/api/option'
  import userApi from '@/api/user'

  import skuApi from '@/api/sku'
  import qiniuApi from '@/api/qiniu'
  import storyImageApi from '@/api/storyImageApi'
  import { parseTime, resetTemp } from '@/utils'
  import { root, confirm, pageParamNames } from '@/utils/constants'
  import debounce from 'lodash/debounce'

  export default {

    name: 'addProject',

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
          id: null,
          projectName: null,
          location: null,
          beginTime: null,
          endTime: null,
          customer: null,
          projectDesc: null,
          spaceType: null,
          status: null,
          projectImageList: [], // 重置skuImageList
          projectSkuList: [],
          projectArtistList: [],
          projectCompanyList: []
        },
        textMap: {
          update: '更新项目',
          create: '新增项目'
        },
        rules: {
          categoryName: [{ validator: validateName, trigger: 'blur' }],
          categoryCode: [{ validator: validateCode, trigger: 'blur' }],
          parentId: [{ validator: validatImageUrl, trigger: 'blur' }]
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

        imageUrl: '',
        projectImageList: [],
        projectSkuList: [],
        projectArtistList: [],
        projectCompanyList: [],
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
      const projectId = this.$route.params && this.$route.params.projectId
      this.fetchData(projectId)
    },

    watch: {
      // 延时查询
      'tableQuery.nick': debounce(function() {
        this.fetchData()
      }, 500)
    }, // watch

    methods: {
      fetchData(projectId) {
        storyImageApi.queryProjectById(projectId).then(response => {
          const project = response.data.project
          const projectImageList = project.projectImageList
          const projectSkuList = project.projectSkuList
          const projectArtistList = project.projectArtistList
          const projectCompanyList = project.projectCompanyList
          this.temp.id = project.id
          this.temp.projectName = project.projectName
          this.temp.location = project.location
          this.temp.beginTime = project.beginTime
          this.temp.endTime = project.endTime
          this.temp.customer = project.customer
          this.temp.projectDesc = project.projectDesc
          this.temp.spaceType = project.spaceType
          this.temp.status = project.status

          projectImageList.forEach(obj => {
            this.projectImageList.unshift(Object.assign({}, obj))
          })
          projectSkuList.forEach(obj => {
            this.projectSkuList.unshift(Object.assign({}, obj))
          })
          projectArtistList.forEach(obj => {
            this.projectArtistList.unshift(Object.assign({}, obj))
          })
          projectCompanyList.forEach(obj => {
            this.projectCompanyList.unshift(Object.assign({}, obj))
          })

        }).catch(err => {
          console.log(err)
        })
      },

      updateData() {
        this.$refs['dataForm'].validate((valid) => {
          if (!valid) return
          const tempData = Object.assign({}, this.temp) // copy obj
          storyImageApi.updateProject(tempData).then(res => {
            this.$message.success('更新成功')
          })
        })
      },

      // 删除
      handleDelete(idx, row) {
        this.$confirm('您确定要永久删除该项目？', '提示', confirm).then(() => {
          storyImageApi.deleteProject({ projectId: row.id }).then(res => {
            this.tableData.splice(idx, 1)
            --this.tablePage.total
            this.dialogFormVisible = false
            this.$message.success('删除成功')
          })
        }).catch(() => {
          this.$message.info('已取消删除')
        })
      },

      // upload to qiniu
      upqiniu(req) {
        console.log(req)
        const config = {
          headers: { 'Content-Type': 'multipart/form-data' }
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
            this.imageUrl = 'http://' + this.qiniuaddr + '/' + res.data.key

            // 第一次时候判断
            if (!this.temp.projectImageList && typeof (this.temp.projectImageList) !== 'undefined') {
              this.temp.projectImageList = []
            }
            var picStr = '{"picUrl":"' + this.imageUrl + '"}'
            var picJson = JSON.parse(picStr)
            this.temp.projectImageList.push(picJson)
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
        this.imageUrl = ''
        // this.$emit('input', val)
      },

      // 增加产品位置
      addProjectArtist() {
        this.projectArtistList.push({})
        this.temp.projectArtistList = this.projectArtistList
      },
      deleteArtistRow(index) {
        storyImageApi.deleteProjectArtist(this.temp.id, this.projectArtistList[index].id).then((res) => {
          if (res.data.deleteResult === 1) {
            this.projectArtistList.splice(index, 1)
            this.temp.projectArtistList = this.projectArtistList
          }
        })
      },

      // 增加产品位置
      addProjectCompany() {
        this.projectCompanyList.push({})
        this.temp.projectCompanyList = this.projectCompanyList
      },
      deleteCompanyRow(index) {
        storyImageApi.deleteProjectCompany(this.temp.id, this.projectCompanyList[index].id).then((res) => {
          if (res.data.deleteResult === 1) {
            this.projectCompanyList.push({})
            this.temp.projectCompanyList = this.projectCompanyList
          }
        })
      },

      // 增加产品位置
      addProjectSku() {
        this.projectSkuList.push({})
        this.temp.projectSkuList = this.projectSkuList
      },
      deleteSkuRow(index) {
        storyImageApi.deleteProjectSku(this.temp.id, this.projectSkuList[index].skuNo).then((res) => {
          if (res.data.deleteResult === 1) {
            this.projectSkuList.push({})
            this.temp.projectSkuList = this.projectSkuList
          }
        })
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
