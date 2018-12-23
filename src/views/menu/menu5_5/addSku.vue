<template>
  <div class="app-container">
    <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="120px">

      <el-form-item label="分类名称" prop="categoryCode">
        <el-select v-model="temp.categoryCode" @change="onSelectedCategory($event)"
                   placeholder="请选择">
          <el-option v-for="(item,id) in categories" :key="id"
                     :label="item.categoryName"
                     :value="item.categoryCode">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="品牌名称" prop="brandCode">
        <el-select v-model="temp.brandCode" @change="onSelectedBrand($event)"
                   placeholder="请选择">
          <el-option v-for="(item,id) in brands" :key="id"
                     :label="item.brandName"
                     :value="item.brandCode">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="SPU名称" prop="spuCode">
        <el-select v-model="temp.spuCode" @change="onSelectedSPU($event)"
                   placeholder="请选择">
          <el-option v-for="(item,id) in spus" :key="id"
                     :label="item.spuName"
                     :value="item.spuCode">
          </el-option>
        </el-select>
      </el-form-item>


      <el-form-item label="SKU名称" prop="skuName" :required="true">
        <el-col :span="12">
        <el-input v-model="temp.skuName"></el-input>
        </el-col>
      </el-form-item>


      <div>
        <div>
          <p>展示属性,不能多选，只是属性不同，库存和价格不需要变化</p>
          <el-form-item v-for="(spuAttrItem, index) in attrList" :label="spuAttrItem.attrName" :key="index"
                        v-if="spuAttrItem.attrType==0">
            <el-input v-model="spuAttrItem.attrValues"
                      :value="spuAttrItem.attrValues"
                      v-if="spuAttrItem.attrInputType==0 || spuAttrItem.attrInputType==2">
            </el-input>
            <el-select v-model="attrChooseList[index]" placeholder="请选择属性" @change="onSelectedAttr($event, index)"
                       v-if="spuAttrItem.attrInputType==1">
              <el-option v-for="(attrValueItem, index2) in spuAttrItem.attrValues.split(';')" :key="index2"
                         :label="attrValueItem"
                         :value="attrValueItem">
              </el-option>
            </el-select>
            <el-select v-model="attrChooseList[index]" placeholder="请选择属性" @change="onSelectedAttr($event, index)"
                       v-if="spuAttrItem.attrInputType==3">
              <el-option v-for="(attrValueItem, index2) in spuAttrItem.attrValList" :key="index2"
                         :label="attrValueItem.attrValName"
                         :value="attrValueItem.attrValName">
              </el-option>
            </el-select>
          </el-form-item>
        </div>
        <div>
          <p>可变属性，改变后需要更新产品，以及对应的库存和价格</p>
          <el-form-item v-for="(spuAttrItem, index) in attrList" :label="spuAttrItem.attrName" :key="index"
                        v-if="spuAttrItem.attrType==1">
            <el-input v-model="spuAttrItem.attrValues"
                      :value="spuAttrItem.attrValues"
                      v-if="spuAttrItem.attrInputType==0 || spuAttrItem.attrInputType==2">
            </el-input>
            <el-select v-model="attrChooseList[index]" placeholder="请选择属性" @change="onSelectedAttr($event, index)"
                       v-if="spuAttrItem.attrInputType==1">
              <el-option v-for="(attrValueItem, index2) in spuAttrItem.attrValues.split(';')" :key="index2"
                         :label="attrValueItem"
                         :value="attrValueItem">
              </el-option>
            </el-select>
            <el-select v-model="attrChooseList[index]" placeholder="请选择属性" @change="onSelectedAttr($event, index)"
                       v-if="spuAttrItem.attrInputType==3">
              <el-option v-for="(attrValueItem, index2) in spuAttrItem.attrValList" :key="index2"
                         :label="attrValueItem.attrValName"
                         :value="attrValueItem.attrValName">
              </el-option>
            </el-select>
          </el-form-item>
        </div>
        <div>
          <p>为选择的属性增加一个放大的展示图片</p>
          <el-upload
            :action=uploadDomain
            :http-request=upqiniuForAttr
            :on-preview="handleAttrPictureCardPreview"
            :on-remove="handleAttrRemove">
            <i class="el-icon-plus"></i>
          </el-upload>
          <el-dialog :visible.sync="dialogAttrVisible">
            <img width="100%" :src="dialogAttrImageUrl" alt="">
          </el-dialog>
        </div>

      </div>

      <!-- 添加图片 -->
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


      <div>
        <p>库存</p>
        <div>
          <el-form-item label="总库存" prop="categoryCode">
            <el-input v-model="temp.totalNum"></el-input>
          </el-form-item>
          <el-form-item label="可卖库存" prop="categoryCode">
            <el-input v-model="temp.sellableNum"></el-input>
          </el-form-item>
          <el-form-item label="锁定库存" prop="categoryCode">
            <el-input v-model="temp.lockedNum"></el-input>
          </el-form-item>
        </div>


        <div>
          <p>价格</p>
          <el-form-item label="市场价" prop="categoryCode">
            <el-input v-model="temp.listPrice"></el-input>
          </el-form-item>
          <el-form-item label="零售价格" prop="categoryCode">
            <el-input v-model="temp.salePrice"></el-input>
          </el-form-item>
          <el-form-item label="特价" prop="categoryCode">
            <el-input v-model="temp.specialPrice"></el-input>
          </el-form-item>
          <el-form-item label="进货价格" prop="categoryCode">
            <el-input v-model="temp.importPrice"></el-input>
          </el-form-item>
          <el-form-item label="成本价" prop="categoryCode">
            <el-input v-model="temp.costPrice"></el-input>
          </el-form-item>

          <div>
            <p>会员折扣价</p>
            <el-form-item v-for="(userLevelItem, index) in customerLevelList"
                          :label="userLevelItem.levelName" :key="index">
              <el-input v-model="temp.discountPrice[index]"></el-input>
            </el-form-item>
          </div>

        </div>
      </div>

    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogFormVisible = false">取消</el-button>
      <el-button type="primary" @click="createData">创建</el-button>
    </div>

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
    name: 'UserManage',

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
          spuName: null,
          spuCode: null,
          skuName: null,
          description: null,
          categoryCode: null,
          skuAttrList: [],
          skuAttributes: {attributes: [], picUrl: null},
          tempSkuAttrList: [],
          skuImageList: [], // SKU Image
          brandCode: null,
          skuAttr: null, // 只是传值，不做其他的
          totalNum: null,
          sellableNum: null,
          lockedNum: null,

          listPrice: null,
          salePrice: null,
          specialPrice: null,
          importPrice: null,
          costPrice: null,

          discountPrice: [], // 或许不需要，或者展开来
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
        spus: [],
        roleMap: new Map(),
        // 更新用户的角色的数据
        updateUserRolesData: {
          idx: null,
          uid: null,
          rids: []
        },
        lists: [], // 测试list
        tempAttrVal: null,
        skuAttrList: [],
        attrChooseList: [], // 属性选择按钮框
        tempSkuAttrList: [],
        attrList: [], // feature列表，包括FeatureOption
        imageUrl: '',
        qiniuToken: null,
        // 七牛云的上传地址，根据自己所在地区选择，我这里是华南区
        uploadDomain: 'https://upload.qiniup.com',
        // 这是七牛云空间的外链默认域名
        qiniuaddr: 'image-egg.ptelatino.com',
        dialogImageUrl: '',
        dialogVisible: false,
        dialogAttrVisible: false,
        dialogAttrImageUrl: ''

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
        skuApi.querySKU(this.tableQuery, this.tablePage).then(res => {
          this.tableData = res.data.page.records
          this.tableLoading = false
          pageParamNames.forEach(name => this.$set(this.tablePage, name, res.data.page[name]))
        })
      },

      // 更新
      handleUpdate(idx, row) {
        this.temp = Object.assign({}, row) // copy obj
        this.temp.idx = idx
        this.temp.pwd = null
        this.temp.pwd2 = null
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.$nextTick(() => this.$refs['dataForm'].clearValidate())
      },
      updateData() {
        this.$refs['dataForm'].validate((valid) => {
          if (!valid) return
          const tempData = Object.assign({}, this.temp) // copy obj
          userApi.updateUser(tempData).then(res => {
            tempData.updated = res.data.updated
            this.tableData.splice(tempData.idx, 1, tempData)
            this.dialogFormVisible = false
            this.$message.success('更新成功')
          })
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
        resetTemp(this.temp)
        this.dialogStatus = 'create'
        this.dialogFormVisible = true
        this.temp.discountPrice = []
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      createData() {
        this.$refs['dataForm'].validate((valid) => {
          if (!valid) return
          this.temp.skuAttributes.attributes = this.temp.skuAttributes.attributes.toString()
          skuApi.addSKU(this.temp).then((res) => {
            this.temp.skuNo = res.data.skuNo // 后台传回来新增记录的id
            this.tableData.unshift(Object.assign({}, this.temp))
            ++this.tablePage.total
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
        console.log(this.temp.categoryCode)
      },
      // 选择brand
      onSelectedBrand(event) {
        console.log(this.temp.brandCode)
        // 品牌很多的时候优化
        skuApi.querySPUByBrandCategory(this.temp.categoryCode, this.temp.brandCode).then(res => {
          res.data.spuList.forEach(obj => {
            this.spus.push(obj)
          })
        })
      },
      // 选择SPU后，查询所有的SPU属性
      onSelectedSPU(event) {
        console.log(this.temp.spuCode)
        skuApi.querySPUBySpuCode(this.temp.spuCode).then(res => {
          this.spu = res.data.spu
          this.attrList = res.data.spu.spuAttrList
          this.skuAttrList = this.attrList
        })
      },
      // attr属性选择之后
      onSelectedAttr(event, index) {
        const that = this
        var attrId = String(this.attrList[index].attrId)
        var changedFlag = false
        that.temp.skuAttributes.attributes.forEach(function(item, index2) {
          const itemArray = item.split(':')
          if (itemArray[0] === attrId) { // 替换值
            if (that.attrList[index].attrInputType === 3) {
              itemArray[1] = that.attrChooseList[index]
              changedFlag = true
            } else {
              itemArray[1] = that.attrChooseList[index]
              changedFlag = true
            }
          }
        })
        if (!changedFlag) { // 没有更新，或者没有值，则自己添加一下
          that.temp.skuAttributes.attributes.push(attrId + ':' + that.attrChooseList[index])
        }
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
      },

      handleAttrRemove(file, fileList) {
        console.log(file, fileList)
      },
      handleAttrPictureCardPreview(file) {
        this.dialogAttrImageUrl = file.url
        this.dialogAttrVisible = true
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
