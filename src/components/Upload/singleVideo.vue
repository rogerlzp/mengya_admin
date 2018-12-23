<template>
  <div class="upload-container">
    <el-upload
      :action=uploadDomain
      :before-upload="beforeVideoUpload"
      :multiple="false"
      :data="form"
      :auto-upload="true"
      :show-file-list="false"
      :on-success="handleVidoeSuccess"
      :on-progress="uploadVideoProcess"
      class="image-uploader"
      drag>
      <i class="el-icon-upload" />
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
    </el-upload>
    <el-progress v-if="videoFlag == true" type="circle" :percentage="videoUploadPercent" style="margin-top:30px;"></el-progress>

    <div class="image-preview image-app-preview">
      <div v-show="imageUrl.length>1" class="image-preview-wrapper" v-if="imageUrl !=null">
        <video :src="imageUrl" controls preload="auto" style="width: 100%;height: 100%"> </video>
        <div class="image-preview-action">
          <i class="el-icon-delete" @click="rmImage" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import qiniuApi from '@/api/qiniu'

  export default {
    name: 'SingleVideoUpload1',
    props: {
      value: {
        type: String,
        default: ' '
      }
    },
    data() {
      return {
        tempimageUrl: '',
        videoUploadPercent: 0,
        videoFlag: false,
        postData: [],
        form: { // 存放获取到uptoken 和 key
          token: '', // 需要经过编译，并不是直接复制七牛账号里面的token
          key: '' // 这个key也不是七牛账号的key，key可以重命名上传的文件名

        },
        uploadDomain: 'https://upload.qiniup.com',
        // 这是七牛云空间的外链默认域名
        qiniuaddr: 'xiaochengxu.mengyahome.com',
        listObj: {},
      }
    },
    computed: {
      imageUrl() {
        return this.value
      }
    },
    created() {
      this.getQiniuToken()
    },
    methods: {
      rmImage() {
        this.emitInput('')
      },
      emitInput(val) {
        this.$emit('input', val)
      },
      handleVidoeSuccess(file) {
        // const uid = file.uid
        this.videoUploadPercent = 1.0
        this.videoFlag = false
        const imageUrl = 'http://' + this.qiniuaddr + '/' + this.form.key
        this.emitInput(imageUrl)
      },
      getQiniuToken() {
        qiniuApi.getToken().then((res) => {
          this.form.token = res.data.uploadToken
        })
      },
      beforeVideoUpload(file) {
        if (this.form.token === '') {
          qiniuApi.getToken().then((res) => {
            this.form.token = res.data.uploadToken

            const _self = this
            const _URL = window.URL || window.webkitURL
            const fileName = file.uid
            this.listObj[fileName] = {}

            const keyname = 'mengya/video/' + file.name
            this.form.key = keyname

            const isLt10M = file.size / 1024 / 1024 < 1000
            if (['video/mp4', 'video/ogg', 'video/flv', 'video/avi', 'video/wmv', 'video/rmvb'].indexOf(file.type) === -1) {
              this.$message.error('请上传正确的视频格式')
              return false
            }
            if (!isLt10M) {
              this.$message.error('上传头像图片大小不能超过 1000MB!')
              return false
            }
            if (isLt10M) {
              const config = {
                headers: {'Content-Type': 'multipart/form-data'}
              }
            }

            return new Promise((resolve, reject) => {
              const img = new Image()
              img.src = _URL.createObjectURL(file)
              img.onload = function () {
                _self.listObj[fileName] = {hasSuccess: false, uid: file.uid, width: this.width, height: this.height}
              }
              resolve(true)
            })
          })
        } else {
          const _self = this
          const _URL = window.URL || window.webkitURL
          const fileName = file.uid
          this.listObj[fileName] = {}

          const keyname = 'mengya/video/' + file.name
          this.form.key = keyname

          const isLt10M = file.size / 1024 / 1024 < 1000
          if (!isLt10M) {
            this.$message.error('上传头像图片大小不能超过 1000MB!')
          }
          if (isLt10M) {
            const config = {
              headers: {'Content-Type': 'multipart/form-data'}
            }
          }

          return new Promise((resolve, reject) => {
            const img = new Image()
            img.src = _URL.createObjectURL(file)
            img.onload = function () {
              _self.listObj[fileName] = {hasSuccess: false, uid: file.uid, width: this.width, height: this.height}
            }
            resolve(true)
          })
        }
      },
      uploadVideoProcess(event, file, fileList){
        this.videoFlag = true;
        this.videoUploadPercent = parseInt(file.percentage.toFixed(0));
      },
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import "src/styles/mixin.scss";

  .upload-container {
    width: 100%;
    position: relative;
    @include clearfix;
    .image-uploader {
      width: 35%;
      float: left;
    }
    .image-preview {
      width: 200px;
      height: 200px;
      position: relative;
      border: 1px dashed #d9d9d9;
      float: left;
      margin-left: 50px;
      .image-preview-wrapper {
        position: relative;
        width: 100%;
        height: 100%;
        img {
          width: 100%;
          height: 100%;
        }
      }
      .image-preview-action {
        position: absolute;
        width: 20%;
        height: 20%;
        right: 0;
        top: 0;
        cursor: default;
        text-align: center;
        color: #fff;
        opacity: 0;
        font-size: 20px;
        background-color: rgba(255, 0, 1, .5);
        transition: opacity .3s;
        cursor: pointer;
        text-align: center;
        line-height: 50px;
        .el-icon-delete {
          font-size: 36px;
        }
      }
      &:hover {
        .image-preview-action {
          opacity: 1;
        }
      }
    }
    .image-app-preview {
      width: 320px;
      height: 180px;
      position: relative;
      border: 1px dashed #d9d9d9;
      float: left;
      margin-left: 50px;
      .app-fake-conver {
        height: 44px;
        position: absolute;
        width: 100%; // background: rgba(0, 0, 0, .1);
        text-align: center;
        line-height: 64px;
        color: #fff;
      }
    }
  }
</style>
