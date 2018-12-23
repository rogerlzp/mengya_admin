<template>
  <div class="app-container">
    <div style="margin-bottom: 30px;"></div>
    <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleCreate" v-perm="'b:sku:add'">
      {{textMap.create}}
    </el-button>
    <div style="margin-bottom: 30px;"></div>
    <!--列表-->

    <!--分页-->
    <!--弹出窗口：新增/编辑用户-->
    <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="120px">

      <el-form-item label="分类名称" prop="categoryCode">
        <el-select v-model="temp.categoryCode" @change="onSelectedCategory($event, item)"
                   placeholder="请选择">
          <el-option v-for="(item,id) in categories" :key="id"
                     :label="item.categoryName"
                     :value="item.categoryCode">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="品牌名称" prop="brandCode">
        <el-select v-model="temp.brandCode" @change="onSelectedBrand($event, item)"
                   placeholder="请选择">
          <el-option v-for="(item,id) in brands" :key="id"
                     :label="item.brandName"
                     :value="item.brandCode">
          </el-option>
        </el-select>
      </el-form-item>

    </el-form>


    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogFormVisible = false">取消</el-button>
      <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">创建</el-button>
      <el-button v-else type="primary" @click="updateData">确定</el-button>
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
          featureOptions: [],
          description: null,
          categoryCode: null,
          skuImageList: [], // SKU Image
          featureOptionList: [], // featureOptionList
          brandCode: null,
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
        featureList: [], // feature列表，包括FeatureOption
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
