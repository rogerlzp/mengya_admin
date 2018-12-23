<template>
  <div class="app-container">
    <div style="margin-bottom: 30px;"></div>
    <!--列表-->
    <div style="margin-bottom: 30px;"></div>
    <!--分页-->
    <!--弹出窗口：新增/编辑用户-->
    <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="120px">

      <el-form-item label="分类名称:" prop="categoryCode">
        <el-input style="width: 200px" v-model="temp.categoryName" :value="temp.categoryName"
                  :disabled="true"></el-input>
      </el-form-item>

      <el-form-item label="品牌名称:" prop="brandCode">
        <el-input style="width: 200px" v-model="temp.brandName" :value="temp.brandName" :disabled="true"></el-input>
      </el-form-item>

      <el-form-item label="SPU名称:" prop="spuCode">
        <el-input style="width: 200px" v-model="temp.spuName" :value="temp.spuName" :disabled="true"></el-input>
      </el-form-item>


      <el-form-item label="SKU名称:" prop="skuName">
        <el-input style="width: 300px" v-model="temp.skuName"></el-input>
      </el-form-item>


      <div>
        <p>展示属性,不能多选，只是属性不同，库存和价格不需要变化</p>
        <el-form-item v-for="(spuAttrItem, index) in spuAttrList" :label="spuAttrItem.attrName" :key="index"
                      v-if="spuAttrItem.attrType==0">
          <el-input v-model="spuAttrItem.attrValues"
                    :value="spuAttrItem.attrValues" disabled="true"
                    v-if="spuAttrItem.attrInputType==0 || spuAttrItem.attrInputType==2">
          </el-input>
          <el-select v-model="attrChooseList[index]" @change="onSelectedAttr($event, index)"
                     v-if="spuAttrItem.attrInputType==1" disabled="true" style="width: 300px">
            <el-option v-for="(attrValueItem, index2) in spuAttrItem.attrValues.split(';')" :key="index2"
                       :label="attrValueItem"
                       :value="attrValueItem">
            </el-option>
          </el-select>
          <el-select v-model="attrChooseList[index]" @change="onSelectedAttr($event, index)"
                     v-if="spuAttrItem.attrInputType==3" style="width: 300px">
            <el-option v-for="(attrValueItem, index2) in spuAttrItem.attrValList" :key="index2"
                       :label="attrValueItem.attrValName"
                       :value="attrValueItem.attrValName">
            </el-option>
          </el-select>
        </el-form-item>
      </div>


      <div>
        <div>
          <p>可变属性，改变后需要更新产品，以及对应的库存和价格</p>
          <el-form-item v-for="(spuAttrItem, index) in spuAttrList" :label="spuAttrItem.attrName" :key="index"
                        v-if="spuAttrItem.attrType==1">
            <el-input v-model="spuAttrItem.attrValues"
                      :value="spuAttrItem.attrValues"
                      v-if="spuAttrItem.attrInputType==0 || spuAttrItem.attrInputType==2">
            </el-input>
            <el-select v-model="attrChooseList[index]"
                       @change="onSelectedAttr($event, index)"
                       v-if="spuAttrItem.attrInputType==1" style="width: 300px">
              <el-option v-for="(attrValueItem, index2) in spuAttrItem.attrValues.split(';')" :key="index2"
                         :label="attrValueItem"
                         :value="attrValueItem">
              </el-option>
            </el-select>
            <el-select v-model="attrChooseList[index]" @change="onSelectedAttr($event, index)"
                       v-if="spuAttrItem.attrInputType==3" style="width: 300px">
              <el-option v-for="(attrValueItem, index2) in spuAttrItem.attrValList" :key="index2"
                         :label="attrValueItem.attrValName"
                         :value="attrValueItem.attrValName">
              </el-option>
            </el-select>
          </el-form-item>
        </div>

        <el-form-item v-for="(skuImageItem, index) in skuImageList" :key="index" label="SKU图片" prop="brandLogo">
          <template slot-scope="scope">
            <img :src="skuImageItem.picUrl" style="width: 100px;height: 100px;display: block;"
            />
          </template>
        </el-form-item>


        <div> 更改图片</div>
        <!--<el-upload-->
        <!--:action=uploadDomain-->
        <!--:http-request=upqiniu-->
        <!--list-type="picture-card"-->
        <!--:on-preview="handlePictureCardPreview"-->
        <!--:on-remove="handleRemove">-->
        <!--<i class="el-icon-plus"></i>-->
        <!--</el-upload>-->
        <!--<el-dialog :visible.sync="dialogVisible">-->
        <!--<img width="100%" :src="dialogImageUrl" alt="">-->
        <!--</el-dialog>-->


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
      <el-button type="primary" @click="updateData">更新</el-button>
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
        editRolesDialogVisible: false,
        dialogStatus: '',
        temp: {
          idx: null, // tableData中的下标
          id: null,
          spuName: null,
          spuCode: null,
          skuName: null,
          description: null,
          categoryName: null,
          skuAttrList: [],
          skuAttributes: {attributes: [], picUrl: null},

          skuAttr: {id: null, skuNo: null, attributes: [], picUrl: null},
          tempSkuAttrList: [],
          skuImageList: [], // SKU Image
          spuAttrList: [], // 该SPU 所有的属性
          brandName: null,
          // skuAttr: null, // 只是传值，不做其他的
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
        skuAttrList: [],
        spuAttrList: [],
        tempSkuAttrList: [],
        attrChooseList: [], // 属性选择按钮框
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
      // this.initData()
      // this.fetchData()

      const skuNo = this.$route.params && this.$route.params.skuNo
      this.fetchData(skuNo)
    },

    watch: {
      // 延时查询
      'tableQuery.nick': debounce(function () {
        this.fetchData()
      }, 500)
    }, // watch

    methods: {
      fetchData(skuNo) {
        skuApi.querySKUBySkuNo(skuNo).then(response => {
          const sku = response.data.sku
          this.temp.skuAttr = sku.skuAttr
          const attributes = this.temp.skuAttr.attributes.split(',')
          const spuAttrList = sku.spuAttrList
          this.attrList = sku.spuAttrList

          const skuImageList = sku.skuImageList
          // Just for test
          this.temp.id = sku.id
          this.temp.skuName = sku.skuName
          this.temp.spuCode = sku.spuCode
          this.temp.skuNo = sku.skuNo
          this.temp.spuName = sku.spuName
          this.temp.brandName = sku.brandName
          this.temp.categoryName = sku.categoryName
          const that = this
          const tempSpuAttrList = spuAttrList

          tempSpuAttrList.forEach(obj => {
            this.spuAttrList.unshift(Object.assign({}, obj))
          })

          spuAttrList.reverse().forEach(function (item, index) {
            if (item.attrInputType === 1 || item.attrInputType === 3) {
              console.log('item2')
              attributes.forEach(function (attrValItem, attrValIndex) {
                const itemArray = attrValItem.split(':')
                if (itemArray[0] === String(item.attrId)) { // 替换值
                  that.attrChooseList[index] = itemArray[1]
                }
              })
            }
          })

          skuImageList.forEach(obj => {
            this.skuImageList.unshift(Object.assign({}, obj))
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
          skuApi.updateSKU(this.temp).then((res) => {
            // this.temp.skuNo = res.data.skuNo // 后台传回来新增记录的id
            // this.tableData.unshift(Object.assign({}, this.temp))
            // ++this.tablePage.total
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
      // 选中一个后，则更新对应的选项
      onSelectedAttr(event, index) {
        const that = this
        var attrId = String(this.attrList[index].attrId)
        var changedFlag = false
        const attributes = this.temp.skuAttr.attributes.split(',')
        attributes.forEach(function (item, index2, input) {
          const itemArray = item.split(':')
          if (itemArray[0] === attrId) { // 替换值
            if (that.attrList[index].attrInputType === 3) {
              itemArray[1] = that.attrChooseList[index]
              changedFlag = true
            }
            item = itemArray.join(':')
            input[index2] = item
          }
        })
        if (!changedFlag) { // 没有更新，或者没有值，则自己添加一下
          attributes.push(attrId + ':' + that.attrChooseList[index])
        }

        that.temp.skuAttr.attributes = attributes.toString()
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
