<template>
  <div class="app-container">

    <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="120px">

      <el-form-item label="StoryImage名称" prop="storyImageName">
        <el-input v-model="temp.storyImageName"></el-input>
      </el-form-item>

      <el-form-item label="imageDesc" prop="imageDesc">
        <el-input v-model="temp.imageDesc"></el-input>
      </el-form-item>

      <el-form-item label="isHomepage" prop="isHomepage">
        <el-input v-model="temp.isHomepage"></el-input>
      </el-form-item>

      <el-form-item label="显示顺序" prop="showOrder">
        <el-input v-model="temp.showOrder"></el-input>
      </el-form-item>
      <el-form-item label="图片类型" prop="storyImageType">
        <el-input v-model="temp.storyImageType"></el-input>
      </el-form-item>


      <!-- TODO： 增加projectID -->
      <el-form-item label="projectId" prop="projectId">
        <el-select v-model="temp.projectId" placeholder="请选择">
          <el-option v-for="(item,id) in projectList" :key="id"
                     :label="item.projectName"
                     :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="图片">     
            <img :src="temp.imageUrl" style="width: 1000px;height: 600px;display: block;" />         
      </el-form-item>

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

      <!-- TODO： 增加图片上的产品位置 -->
      <div>
        <el-button @click="addSkuOption">添加</el-button>
        <el-table :data="storyImageProductList">
          <el-table-column prop="id" label="产品ID">
            <template slot-scope="scope">
              <el-input v-model="storyImageProductList[scope.$index].id"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="skuNo" label="产品名称">
            <template slot-scope="scope">
              <el-input v-model="storyImageProductList[scope.$index].skuNo"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="tagLeft" label="Tag左边相对位置，百分比后，填整数">
            <template slot-scope="scope">
              <el-input v-model="storyImageProductList[scope.$index].tagLeft"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="tagTop" label="Tag上边相对位置，百分比后，填整数">
            <template slot-scope="scope">
              <el-input v-model="storyImageProductList[scope.$index].tagTop"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="tagRight" label="Tag左边相对位置，百分比后，填整数">
            <template slot-scope="scope">
              <el-input v-model="storyImageProductList[scope.$index].tagRight"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="tagBottom" label="Tag底部相对位置，百分比后，填整数">
            <template slot-scope="scope">
              <el-input v-model="storyImageProductList[scope.$index].tagBottom"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="age" label="">
            <template slot-scope="scope">
              <el-button @click="deleteRow(scope.$index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>


    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogFormVisible = false">取消</el-button>
      <el-button type="primary" @click="updateData">确定</el-button>
    </div>


  </div>
</template>

<script>
  import userApi from '@/api/user'
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
          id: null,
          storyImageName: null,
          imageUrl: null,
          imageDesc: null,
          isHomepage: null,
          storyImageType: null,
          showOrder: null,
          status: null,
          projectId: null,
          projectName: null,
          storyImageProductList: [],
          skuLocationList: [], //
          skuNo: null,
          skuName: null,
          featureOptions: [],
          description: null

        },
        textMap: {
          update: '编辑StoryImage',
          create: '新增StoryImage'
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
        storyImageProductList: [],
        projectList: [], // 项目列表， TODO：优化添加
        imageUrl: '',
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
      const storyImageId = this.$route.params && this.$route.params.storyImageId
      this.fetchData(storyImageId)
    },

    watch: {
      // 延时查询
      'tableQuery.nick': debounce(function () {
        // this.fetchData()
      }, 500)
    }, // watch

    methods: {
      fetchData(storyImageId) {
        storyImageApi.queryStoryImageById(storyImageId).then(response => {
          const storyImage = response.data.storyImage
          const storyImageProductList = storyImage.storyImageProductList
          // Just for test
          this.temp.id = storyImage.id
          this.temp.storyImageName = storyImage.storyImageName
          this.temp.imageUrl = storyImage.imageUrl
          this.temp.imageDesc = storyImage.imageDesc
          this.temp.isHomepage = storyImage.isHomepage
          this.temp.storyImageType = storyImage.storyImageType
          this.temp.showOrder = storyImage.showOrder
          this.temp.projectId = storyImage.projectId
          this.temp.projectName = storyImage.projectName
          this.temp.status = storyImage.status

          storyImageProductList.forEach(obj => {
            this.storyImageProductList.unshift(Object.assign({}, obj))
          })
        }).catch(err => {
          console.log(err)
        })
      },

      // 更新
      updateData() {
        this.$refs['dataForm'].validate((valid) => {
          if (!valid) return
          const tempData = Object.assign({}, this.temp) // copy obj
          storyImageApi.updateStoryImage(tempData).then(res => {
            this.$message.success('更新成功')
          })
        })
      },

      // 增加产品位置
      addSkuOption() {
        this.storyImageProductList.push({})
        this.temp.storyImageProductList = this.storyImageProductList
      },
      deleteRow(index) {
        storyImageApi.deleteStoryImageProduct(this.storyImageProductList[index].id).then((res) => {
          if (res.data.deleteResult === 1) {
            this.storyImageProductList.splice(index, 1)
            this.temp.storyImageProductList = this.storyImageProductList
          }
        })
      },

      handleRemove(file, fileList) {
        console.log(file, fileList)
      },
      handlePictureCardPreview(file) {
        this.dialogImageUrl = file.url
        this.dialogVisible = true
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
            this.temp.imageUrl = 'http://' + this.qiniuaddr + '/' + res.data.key
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
      }
      ,

      rmImage() {
        this.emitInput('')
      }
      ,
      emitInput(val) {
        this.imageUrl = ''
        // this.$emit('input', val)
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
