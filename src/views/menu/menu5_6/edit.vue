<template>
  <div class="app-container">
    <div style="margin-bottom: 30px;"></div>
    <!--列表-->
    <div style="margin-bottom: 30px;"></div>
    <!--分页-->
    <!--弹出窗口：新增/编辑用户-->
    <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="120px">

      <el-form-item label="Themeid" prop="id" :required="true">
        <el-col :span="12">
          <el-input v-model="temp.id" :disabled="true"></el-input>
        </el-col>
      </el-form-item>

      <el-form-item label="Theme名称" prop="themeName" :required="true">
        <el-col :span="12">
          <el-input v-model="temp.themeName"></el-input>
        </el-col>
      </el-form-item>
      <el-form-item label="Theme描述" prop="themeDesc" :required="true">
        <el-col :span="12">
          <el-input type="textarea" v-model="temp.themeDesc"></el-input>
        </el-col>
      </el-form-item>
      <el-form-item label="Theme标题" prop="themeTitle" :required="true">
        <el-col :span="12">
          <el-input v-model="temp.themeTitle"></el-input>
        </el-col>
      </el-form-item>
      <el-form-item label="Theme展示顺序" prop="showOrder" :required="true">
        <el-col :span="12">
          <el-input v-model="temp.showOrder" type="number"></el-input>
        </el-col>
      </el-form-item>

      <el-form-item :required="true" label="Theme 封面图片" prop="themeCover">
        <template slot-scope="scope">
          <img :src="temp.themeCover" style="width: 100px;height: 100px;display: block;"
          />
        </template>

      </el-form-item>


      <div> 更改图片</div>
      <el-upload
        :action=uploadDomain
        :http-request=upqiniu
        list-type="picture-card"
        :on-preview="handlePictureCardPreview"
        :on-remove="handleRemove">
        <i class="el-icon-plus"></i>
      </el-upload>


      <div>
        <el-button @click="addSkuToTheme">添加产品到主题中</el-button>
        <div>
          <el-table :data="themeSkuList">
            <el-table-column prop="id" label="关联Id">
              <template slot-scope="scope">
                <el-input v-model="themeSkuList[scope.$index].id"></el-input>
              </template>
            </el-table-column>
            <el-table-column prop="skuNo" label="SKU编号">
              <template slot-scope="scope">
                <el-input v-model="themeSkuList[scope.$index].skuNo"></el-input>
              </template>
            </el-table-column>
            <el-table-column prop="skuName" label="SKU名称">
              <template slot-scope="scope">
                <el-input v-model="themeSkuList[scope.$index].skuName"></el-input>
              </template>
            </el-table-column>
            <el-table-column prop="age" label="">
              <template slot-scope="scope">
                <el-button @click="deleteThemeSkuRow(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

    </el-form>


    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogFormVisible = false">取消</el-button>
      <el-button type="primary" @click="updateData">更新</el-button>
    </div>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="themeSkuFormVisible" width="60%">
      <el-form :rules="rules" ref="themeSkuForm" :model="themeSkuTemp" label-position="left" label-width="120px">
        <el-form-item label="分类名称" prop="categoryCode">
          <el-select v-model="categoryCode" @change="onSelectedCategory($event)"
                     placeholder="请选择">
            <el-option v-for="(item,id) in categories" :key="id"
                       :label="item.categoryName"
                       :value="item.categoryCode">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="品牌名称" prop="brandCode">
          <el-select v-model="brandCode" @change="onSelectedBrand($event)"
                     placeholder="请选择">
            <el-option v-for="(item,id) in brands" :key="id"
                       :label="item.brandName"
                       :value="item.brandCode">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="SPU名称" prop="spuCode">
          <el-select v-model="spuCode" @change="onSelectedSPU($event)"
                     placeholder="请选择">
            <el-option v-for="(item,id) in spus" :key="id"
                       :label="item.spuName"
                       :value="item.spuCode">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="SKU名称" prop="skuCode">
          <el-select v-model="themeSkuTemp.skuNo" @change="onSelectedSKU($event)"
                     placeholder="请选择">
            <el-option v-for="(item,id) in skuList" :key="id"
                       :label="item.skuName"
                       :value="item.skuNo">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="themeSkuFormVisible = false">取消</el-button>
        <el-button v-if="dialogStatus=='addThemeSku'" type="primary"
                   @click="createThemeSku">增加
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  // import Vue from 'vue'
  import optionApi from '@/api/option'
  import userApi from '@/api/user'

  import skuApi from '@/api/sku'
  import qiniuApi from '@/api/qiniu'

  import {parseTime, resetTemp} from '@/utils'
  import {root, confirm, pageParamNames} from '@/utils/constants'
  import debounce from 'lodash/debounce'
  import ElMain from "element-ui/packages/main/src/main";

  export default {

    components: {ElMain},
    name: 'SKUEditManage',

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
        dialogStatus: '',
        temp: {
          idx: null, // tableData中的下标
          id: null,
          themeName: null,
          themeTitle: null,
          themeDesc: null,
          themeCover: null, // theme 封面
          showOrder: null, // 展示顺序
          themeSkuList: [], // SKU Image
          created: null,
          updated: null
        },
        themeSkuTemp: {
          idx: null, // tableData中的下标
          id: null,
          skuNo: null,
          skuName: null
        },
        textMap: {
          update: '编辑产品',
          create: '新增产品',
          addThemeSku: '添加SKU到Theme中'
        },
        rules: {
          spuName: [{validator: validateName, trigger: 'blur'}],
          categoryCode: [{validator: validateCode, trigger: 'blur'}],
          brandCode: [{validator: validatImageUrl, trigger: 'blur'}]
        },
        themeSkuRules: {
          skuNo: [{validator: validateName, trigger: 'blur'}]
        },
        categoryCode: null,
        brandCode: null,
        spuCode: null,
        spus: [],
        categories: [],
        themeSkuList: [],
        brands: [], // 品牌
        skuList: null,
        qiniuToken: null,
        // 七牛云的上传地址，根据自己所在地区选择，我这里是华南区
        uploadDomain: 'https://upload.qiniup.com',
        // 这是七牛云空间的外链默认域名
        qiniuaddr: 'image-egg.ptelatino.com',
        themeCover: '',
        themeSkuFormVisible: false

      }
    },

    created() {
      const id = this.$route.params && this.$route.params.id
      this.fetchData(id)
    },

    watch: {
      // 延时查询
      'tableQuery.nick': debounce(function () {
        this.fetchData()
      }, 500)
    }, // watch

    methods: {
      fetchData(id) {
        skuApi.queryThemeDetailById(id).then(response => {
          const theme = response.data.theme
          const themeSkuList = theme.themeSkuList

          this.temp.id = theme.id
          this.temp.skuName = theme.skuName
          this.temp.skuCode = theme.skuCode
          this.temp.themeName = theme.themeName
          this.temp.themeTitle = theme.themeTitle
          this.temp.themeDesc = theme.themeDesc
          this.temp.themeCover = theme.themeCover
          this.temp.showOrder = theme.showOrder

          themeSkuList.forEach(obj => {
            this.themeSkuList.unshift(Object.assign({}, obj))
          })

        }).catch(err => {
          console.log(err)
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

      // 更新
      updateData() {
        this.$refs['dataForm'].validate((valid) => {
          if (!valid) return
          this.temp.themeSkuList = this.themeSkuList // 复制列表
          skuApi.updateTheme(this.temp).then((res) => {
            this.themeSkuList = [] // 重置skuImageList
            this.temp.themeSkuList = []
            this.$message.success('添加成功')
          })
        })
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
            this.temp.themeCover = 'http://' + this.qiniuaddr + '/' + res.data.key
          })
        })
      },
      upqiniuForAttr(req) {
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
            this.dialogAttrImageUrl = 'http://' + this.qiniuaddr + '/' + res.data.key
            this.temp.skuAttributes.picUrl = this.dialogAttrImageUrl
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

      addNewList() {
        this.lists.push({
          id: this.nextTodoId++,
          title: this.newAddText
        })
        this.newAddText = ''
      },
      // 选择category
      onSelectedCategory(event) {
        console.log(this.categoryCode)
      },
      // 选择brand
      onSelectedBrand(event) {
        console.log(this.brandCode)
        // 品牌很多的时候优化
        skuApi.querySPUByBrandCategory(this.categoryCode, this.brandCode).then(res => {
          res.data.spuList.forEach(obj => {
            this.spus.push(obj)
          })
        })
      }, // 选择SPU后，查询所有的SKU属性
      onSelectedSPU(event) {
        console.log(this.spuCode)
        skuApi.querySKUBySpuCode(this.spuCode).then(res => {
          this.skuList = res.data.skuList
        })
      },
      onSelectedSKU(event) {
        console.log(this.skuNo)
      },
      handleRemove(file, fileList) {
        console.log(file, fileList)
      },
      handlePictureCardPreview(file) {
        this.dialogImageUrl = file.url
        this.dialogVisible = true
      },

      // 增加关联产品
      addSkuToTheme() {
        // 获取 category code
        skuApi.queryCategory(0, 100).then(res => {
          res.data.page.records.forEach(obj => {
            this.categories.push(obj)
          })
        })
        // 品牌很多的时候优化
        skuApi.queryBrand(0, 100).then(res => {
          res.data.page.records.forEach(obj => {
            this.brands.push(obj)
          })
        })
        resetTemp(this.themeSkuTemp)
        this.dialogStatus = 'addThemeSku'
        this.themeSkuFormVisible = true
        this.$nextTick(() => {
          this.$refs['themeSkuForm'].clearValidate()
        })
      },
      createThemeSku() {
        this.$refs['themeSkuForm'].validate((valid) => {
          if (!valid) return
          this.themeSkuList.unshift(Object.assign({}, this.themeSkuTemp))
          this.temp.themeSkuList = this.themeSkuList
          this.$message.success('添加成功')
          this.themeSkuFormVisible = false
        })
      },
      deleteThemeSkuRow(index) {
        skuApi.deleteThemeSku(this.temp.id, this.themeSkuList[index].skuNo).then((res) => {
          if (res.data.deleteResult === 1) {
            this.themeSkuList.splice(index, 1)
            this.temp.themeSkuList = this.themeSkuList
          }
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

  .upload-container {
    width: 100%;
    position: relative;
    .image-uploader {
      width: 60%;
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
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        cursor: default;
        text-align: center;
        color: #fff;
        opacity: 0;
        font-size: 20px;
        background-color: rgba(0, 0, 0, .5);
        transition: opacity .3s;
        cursor: pointer;
        text-align: center;
        line-height: 200px;
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
  }

</style>
