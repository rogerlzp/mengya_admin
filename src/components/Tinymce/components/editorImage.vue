<template>
  <div class="upload-container">
    <el-button icon='el-icon-upload' size="mini" :style="{background:color,borderColor:color}"
               @click=" dialogVisible=true" type="primary">上传图片
    </el-button>
    <el-dialog append-to-body :visible.sync="dialogVisible">
      <el-upload class="editor-slide-upload" :action="uploadDomain"
                 :multiple="true" :file-list="fileList" :show-file-list="true"
                 :on-success="handleSuccess"
                 accept="image/jpeg,image/jpg,image/gif,image/png"
                 :data="form"
                 :auto-upload="true"
                 list-type="picture-card" :on-remove="handleRemove"
                 :before-upload="beforeUpload">
        <el-button size="small" type="primary">点击上传</el-button>
      </el-upload>
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="handleSubmit">确 定</el-button>
    </el-dialog>
  </div>
</template>

<script>
  // import { getToken } from 'api/qiniu'
  import qiniuApi from '@/api/qiniu'

  export default {
    name: 'editorSlideUpload',
    props: {
      color: {
        type: String,
        default: '#1890ff'
      }
    },
    data() {
      return {
        postData: [],
        form: {//存放获取到uptoken 和 key
          token: '',   //需要经过编译，并不是直接复制七牛账号里面的token
          key: ''       //这个key也不是七牛账号的key，key可以重命名上传的文件名，其他作用不太记得了

        },
        dialogVisible: false,
        listObj: {},
        fileList: [],
        imageFile: null,
        imageUrl: null,
        qiniuToken: null,
        // 七牛云的上传地址，根据自己所在地区选择，我这里是华南区
        uploadDomain: 'https://upload.qiniup.com',
        // 这是七牛云空间的外链默认域名
        qiniuaddr: 'xiaochengxu.mengyahome.com',
      }
    },
    created() {
      this.getQiniuToken()
    },
    methods: {
      newSubmitForm() { // 确定上传
        this.$refs.newupload.submit()
      },
      checkAllSuccess() {
        return Object.keys(this.listObj).every(item => this.listObj[item].hasSuccess)
      },
      handleSubmit() {
        const arr = Object.keys(this.listObj).map(v => this.listObj[v])
        if (!this.checkAllSuccess()) {
          this.$message('请等待所有图片上传成功 或 出现了网络问题，请刷新页面重新上传！')
          return
        }
        this.$emit('successCBK', arr)
        this.listObj = {}
        this.fileList = []
        this.dialogVisible = false
      },
      handleSuccess(response, file) {
        const uid = file.uid
        const objKeyArr = Object.keys(this.listObj)
        for (let i = 0, len = objKeyArr.length; i < len; i++) {
          if (this.listObj[objKeyArr[i]].uid === uid) {
            this.listObj[objKeyArr[i]].url = 'http://' + this.qiniuaddr + '/mengya/image/' + file.name
            this.listObj[objKeyArr[i]].hasSuccess = true
            return
          }
        }
      },
      handleRemove(file) {
        const uid = file.uid
        const objKeyArr = Object.keys(this.listObj)
        for (let i = 0, len = objKeyArr.length; i < len; i++) {
          if (this.listObj[objKeyArr[i]].uid === uid) {
            delete this.listObj[objKeyArr[i]]
            return
          }
        }
      },
      getQiniuToken() {
        qiniuApi.getToken().then((res) => {
          this.form.token = res.data.uploadToken
        })
      },

      beforeUpload(file) {
        const _self = this
        const _URL = window.URL || window.webkitURL
        const fileName = file.uid
        this.listObj[fileName] = {}

        const keyname = 'mengya/image/' + file.name
        this.form.key = keyname
        const isLt10M = file.size / 1024 / 1024 < 10
        if (!isLt10M) {
          this.$message.error('上传头像图片大小不能超过 10MB!')
        }
        if (isLt10M) {
          const config = {
            headers: {'Content-Type': 'multipart/form-data'}
          }
        }

        return new Promise((resolve, reject) => {
          const img = new Image()
          img.src = _URL.createObjectURL(file)
          img.onload = function() {
            _self.listObj[fileName] = { hasSuccess: false, uid: file.uid, width: this.width, height: this.height }
          }
          resolve(true)
        })
      },
    }

  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .upload-container {
    .editor-slide-upload {
      margin-bottom: 20px;
    }
  }
</style>
