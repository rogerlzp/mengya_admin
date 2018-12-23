<template>
  <div class="app-container">
    <!--查询  -->
    <el-row>
      <el-input style="width:200px;" v-model="tableQuery.nick" placeholder="昵称"></el-input>
      <span style="margin-right: 15px;"></span>
      <el-tooltip class="item" content="搜索" placement="top">
        <el-button icon="el-icon-search" circle @click="fetchData(1)" v-perm="'b:sku:query'"></el-button>
      </el-tooltip>
    </el-row>
    <div style="margin-bottom: 30px;"></div>
    <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleCreate" v-perm="'b:sku:add'">
      {{textMap.create}}
    </el-button>
    <div style="margin-bottom: 30px;"></div>
    <!--列表-->
    <el-table style="width: 100%"
              :data="tableData"
              v-loading.body="tableLoading"
              element-loading-text="加载中"
              border fit highlight-current-row>

      <el-table-column prop="id" label="主题ID"></el-table-column>
      <el-table-column prop="themeName" label="主题名称"></el-table-column>
      <el-table-column prop="themeTitle" label="主题标题"></el-table-column>
      <el-table-column prop="themeDesc" label="主题描述"></el-table-column>
      <el-table-column prop="themeCover" label="主题封面图片">
        <template slot-scope="scope">
          <img :src="scope.row.themeCover" style="width: 100px;height: 100px;display: block;" />
        </template>
      </el-table-column>
      <el-table-column prop="status" label="主题状态"></el-table-column>
      <el-table-column prop="showOrder" label="主题展示顺序"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-tooltip content="编辑" placement="top">
            <el-button @click="handleUpdate(scope.$index,scope.row)" size="medium" type="info" icon="el-icon-edit"
                       circle plain></el-button>
          </el-tooltip>
          <el-tooltip content="删除" placement="top" v-if="!hasAdminRole(scope.row)">
            <el-button @click="handleDelete(scope.$index,scope.row)" size="medium" type="danger" icon="el-icon-delete"
                       circle plain></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <div style="margin-bottom: 30px;"></div>
    <!--分页-->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="tablePage.current"
      :page-sizes="[10, 20, 30, 40, 50]"
      :page-size="tablePage.size"
      layout="total, sizes, prev, pager, next, jumper"
      :total="tablePage.total">
    </el-pagination>

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
    name: 'ThemeList',

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
        editRolesDialogVisible: false,
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
        textMap: {
          update: '编辑产品',
          create: '新增产品'
        },
        rules: {
          spuName: [{validator: validateName, trigger: 'blur'}],
          categoryCode: [{validator: validateCode, trigger: 'blur'}],
          brandCode: [{validator: validatImageUrl, trigger: 'blur'}]
        },
        checkAll: false,
        isIndeterminate: true,
        // 所有角色(管理员除外)
        roleOptions: [],
        categories: [],
        skuImageList: [],
        discountPrice: [], // 根据会员价格对应的
        customerLevelList: [],
        brands: [], // 品牌
        attrList: [], // spu属性列表
        spus: [],
        roleMap: new Map(),
        // 更新用户的角色的数据
        updateUserRolesData: {
          idx: null,
          uid: null,
          rids: []
        },
        lists: [], // 测试list
        skuAttrList: [], // feature列表，包括FeatureOption
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
      this.initData()
      this.fetchData()
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

        // 获取 category code
        skuApi.queryCategory(0, 100).then(res => {
          res.data.page.records.forEach(obj => {
            this.categories.push(obj)
          })
        })

        // 获取 会员价格，有默认的会员价格
        skuApi.queryUserLevel().then(res => {
          res.data.customerLevelList.forEach(obj => {
            this.customerLevelList.push(obj)
          })
        })
        // 品牌很多的时候优化
        skuApi.queryBrand(0, 100).then(res => {
          res.data.page.records.forEach(obj => {
            this.brands.push(obj)
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
      fetchData(current) {
        if (current) {
          this.tablePage.current = current
        }
        this.tableLoading = true
        skuApi.queryTheme(this.tableQuery, this.tablePage).then(res => {
          this.tableData = res.data.page.records
          this.tableLoading = false
          pageParamNames.forEach(name => this.$set(this.tablePage, name, res.data.page[name]))
        })
      },

      // 更新
      handleUpdate(idx, row) {
        this.$router.push({
          path: '/menu5/menu5_6/edit/' + row.id
        })
      },
      invokeUpdateUserRolesApi() {
        userApi.updateUserRoles(this.updateUserRolesData).then(res => {
          const newRoles = this.updateUserRolesData.rids.map(rid => {
            const rname = this.roleMap.get(rid)
            if (rname) return {rid, rname}
          })
          this.tableData[this.updateUserRolesData.idx].roleList = newRoles
          this.editRolesDialogVisible = false
          this.$message.success('更新成功')
        })
      },

      // 删除
      handleDelete(idx, row) {
        this.$confirm('您确定要永久删除该用户？', '提示', confirm).then(() => {
          skuApi.deleteSKU({skuNo: row.skuNo}).then(res => {
            this.tableData.splice(idx, 1)
            --this.tablePage.total
            this.dialogFormVisible = false
            this.$message.success('删除成功')
          })
        }).catch(() => {
          this.$message.info('已取消删除')
        })
      },

      // 新增
      handleCreate() {
        this.$router.push({
          path: '/menu5/menu5_6/addTheme'
        })
      },
      createData() {
        this.$refs['dataForm'].validate((valid) => {
          if (!valid) return
          // updateFeatureList(this.temp.featureList)
          skuApi.addSKU(this.temp).then((res) => {
            this.temp.skuNo = res.data.skuNo // 后台传回来新增记录的id
            this.temp.created = res.data.created // 后台传回来新增记录的时间
            this.temp.roleList = []
            this.tableData.unshift(Object.assign({}, this.temp))
            ++this.tablePage.total
            this.dialogFormVisible = false
            this.featureList = [] // 重置featureList
            this.skuImageList = [] // 重置skuImageList
            this.temp.skuImageList = []
            this.$message.success('添加成功')
          })
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
            if (!this.temp.skuImageList && typeof (this.temp.skuImageList) !== 'undefined') {
              this.temp.skuImageList = []
            }
            var picStr = '{"picUrl":"' + this.imageUrl + '"}'
            var picJson = JSON.parse(picStr)
            this.temp.skuImageList.push(picJson)
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
      onSelectedCategory(event, item) {
        console.log(this.temp.categoryCode)
        // Feature选项列出来
        skuApi.getFeatureByCategory(this.temp.categoryCode).then(res => {
          this.featureList = [] // 重新选择后，更新一下
          this.temp.featureOptionList = []
          res.data.featureList.forEach(obj => {
            this.featureList.push(obj)
            for (var featureOption in obj.featureOptions) {
              this.temp.featureOptionList.push(featureOption)
              break
            }
          })
          // this.temp.featureList = this.featureList // 取第一个值
        })
      },
      // 选择brand
      onSelectedBrand(event, item) {
        console.log(this.temp.brandCode)
        // 品牌很多的时候优化
        skuApi.querySPUByBrandCategory(this.temp.categoryCode, this.temp.brandCode).then(res => {
          res.data.spuList.forEach(obj => {
            this.spus.push(obj)
          })
        })
      },
      // 选择SPU
      onSelectedSPU(event, item) {
        this.attrList = item.spuAttrList // 属性列表
      },

      onSelectedFeature(event, item) {
        // this.temp.featureList[]
        // this.temp.featureList[index] = this.featureList[index].val
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
