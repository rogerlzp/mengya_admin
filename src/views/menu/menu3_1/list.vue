<template>
  <div class="app-container">
    <!--查询  -->
    <el-row>
      <el-input style="width:200px;" v-model="tableQuery.nick" placeholder="昵称"></el-input>
      <span style="margin-right: 15px;"></span>
      <el-tooltip class="item" content="搜索" placement="top" >
        <el-button icon="el-icon-search" circle @click="fetchData(1)" v-perm="'b:storyimage:query'"></el-button>
      </el-tooltip>
    </el-row>
    <div style="margin-bottom: 30px;"></div>
    <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleCreate"
               v-perm="'b:storyimage:add'">{{textMap.create}}</el-button>
    <div style="margin-bottom: 30px;"></div>
    <!--列表-->
    <el-table style="width: 100%"
              :data="tableData"
              v-loading.body="tableLoading"
              element-loading-text="加载中"
              border fit highlight-current-row>

      <el-table-column prop="id" label="storyImageID"></el-table-column>
      <el-table-column prop="storyImageName" label="StoryImage名称"></el-table-column>
      <el-table-column prop="imageUrl" label="imageUrl">
        <template slot-scope="scope">
          <img :src="scope.row.imageUrl" style="width: 100px;height: 100px;display: block;" />
        </template>
      </el-table-column>
      <el-table-column prop="imageDesc" label="imageDesc"></el-table-column>

      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-tooltip content="编辑" placement="top">
            <el-button @click="handleUpdate(scope.$index,scope.row)" size="medium" type="info" icon="el-icon-edit" circle plain></el-button>
          </el-tooltip>
          <el-tooltip content="删除" placement="top" v-if="!hasAdminRole(scope.row)">
            <el-button @click="handleDelete(scope.$index,scope.row)" size="medium" type="danger" icon="el-icon-delete" circle plain></el-button>
          </el-tooltip>
          <el-popover trigger="hover" placement="top" v-else style="display: inline-block;">
            <el-alert type="warning" :closable="false" title="权限说明">
              <div>为保证管理员在系统中的最高权限</div>
              <div>不允许编辑管理员自身的角色</div>
              <div>不允许删除管理员账号</div>
            </el-alert>
            <div slot="reference" >
              <el-tag style="margin-left: 10px;" type="info">权限说明</el-tag>
            </div>
          </el-popover>
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
    <!--弹出窗口：新增/编辑用户-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="90%">
      <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="120px">

        <el-form-item label="StoryImage名称" prop="storyImageName" v-if="dialogStatus=='create'">
          <el-input v-model="temp.storyImageName"></el-input>
        </el-form-item>




        <el-form-item label="imageDesc" prop="imageDesc">
          <el-input  v-model="temp.imageDesc"></el-input>
        </el-form-item>

        <el-form-item label="isHomepage" prop="isHomepage">
          <el-input  v-model="temp.isHomepage"></el-input>
        </el-form-item>

        <el-form-item label="显示顺序" prop="showOrder">
          <el-input  v-model="temp.showOrder"></el-input>
        </el-form-item>
        <el-form-item label="图片类型" prop="storyImageType">
          <el-input  v-model="temp.storyImageType"></el-input>
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
            <el-table-column prop="projectId" label="产品ID">
              <template slot-scope="scope">
                <el-input v-model="storyImageProductList[scope.$index].projectId"></el-input>
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
      </div>
    </el-dialog>
    <!--弹出窗口：修改品牌角色-->

  </div>
</template>

<script>
  import optionApi from '@/api/option'
  import userApi from '@/api/user'
  import qiniuApi from '@/api/qiniu'
  import storyImageApi from '@/api/storyImageApi'
  import { parseTime, resetTemp } from '@/utils'
  import { root, confirm, pageParamNames } from '@/utils/constants'
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
          projectId: null,
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
      this.initData()
      this.fetchData()
    },

    watch: {
      // 延时查询
      'tableQuery.nick': debounce(function() {
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
        storyImageApi.queryStoryImageList(this.tableQuery, this.tablePage).then(res => {
          this.tableData = res.data.page.records
          this.tableLoading = false
          pageParamNames.forEach(name => this.$set(this.tablePage, name, res.data.page[name]))
        })
        // 获取项目
        storyImageApi.queryProjectList(0, 100).then(res => {
          res.data.page.records.forEach(obj => {
            this.projectList.push(obj)
          })
        })
      },

      // 新增
      handleCreate() {
        this.$router.push({
          path: '/menu3/menu3_1/addStoryImage'
        })
      },
      handleUpdate(idx, row) {
        this.$router.push({
          path: '/menu3/menu3_1/editStoryImage/' + row.id
        })
      },
      handleDelete(idx, row) {
        this.$confirm('您确定要永久删除storyImage？', '提示', confirm).then(() => {
          storyImageApi.deleteStoryImage(row.id).then((res) => {
            this.tableData.splice(idx, 1)
            --this.tablePage.total
            this.dialogFormVisible = false
            this.$message.success('删除成功')
          }).catch(() => {
            this.$message.info('已取消删除')
          })
        })
      },
      // 增加产品位置
      addSkuOption() {
        this.storyImageProductList.push({})
        this.temp.storyImageProductList = this.storyImageProductList
      },
      deleteRow(index) {
        this.storyImageProductList.splice(index, 1)
        this.temp.storyImageProductList = this.storyImageProductList
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
            this.temp.imageUrl = 'http://' + this.qiniuaddr + '/' + res.data.key

            // // 第一次时候判断
            // if (!this.temp.projectImageList && typeof (this.temp.projectImageList) !== 'undefined') {
            //   this.temp.projectImageList = []
            // }
            // var picStr = '{"picUrl":"' + this.imageUrl + '"}'
            // var picJson = JSON.parse(picStr)
            // this.temp.imageUrl .push(picJson)
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
