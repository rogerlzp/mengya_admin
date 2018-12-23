<template>
  <div class="app-container">
    <!--查询  -->
    <el-row>
      <el-input style="width:200px;" v-model="tableQuery.nick" placeholder="昵称"></el-input>
      <span style="margin-right: 15px;"></span>
      <el-tooltip class="item" content="搜索" placement="top" >
        <el-button icon="el-icon-search" circle @click="fetchData(1)" v-perm="'b:brand:query'"></el-button>
      </el-tooltip>
    </el-row>
    <div style="margin-bottom: 30px;"></div>
    <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleCreate" v-perm="'b:brand:add'">{{textMap.create}}</el-button>
    <div style="margin-bottom: 30px;"></div>
    <!--列表-->
    <el-table style="width: 100%"
              :data="tableData"
              v-loading.body="tableLoading"
              element-loading-text="加载中"
              border fit highlight-current-row>

      <el-table-column prop="id" label="品牌ID"></el-table-column>
      <el-table-column prop="brandName" label="品牌名称"></el-table-column>
      <el-table-column prop="brandCode" label="品牌代码"></el-table-column>
      <el-table-column prop="brandImageUrl" label="品牌图片"></el-table-column>

      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-tooltip content="编辑" placement="top">
            <el-button @click="handleUpdate(scope.$index,scope.row)" size="medium" type="info" icon="el-icon-edit" circle plain></el-button>
          </el-tooltip>
          <el-tooltip content="修改角色" placement="top" v-if="!hasAdminRole(scope.row)">
            <el-button @click="handleUpdateUserRoles(scope.$index,scope.row)" size="medium" type="warning" icon="el-icon-star-off" circle plain></el-button>
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
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="20%">
      <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="120px">

        <el-form-item label="品牌名称" prop="brandName" v-if="dialogStatus=='create'">
          <el-input v-model="temp.brandName"></el-input>
        </el-form-item>

        <el-form-item label="品牌代码" prop="brandCode">
          <el-input v-model="temp.brandCode"></el-input>
        </el-form-item>

        <el-form-item label="品牌图片" prop="brandImageUrl">
          <el-input  v-model="temp.brandImageUrl"></el-input>
        </el-form-item>


      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">创建</el-button>
        <el-button v-else type="primary" @click="updateData">确定</el-button>
      </div>
    </el-dialog>
    <!--弹出窗口：修改品牌角色-->

  </div>
</template>

<script>

  import optionApi from '@/api/option'
  import userApi from '@/api/user'

  import skuApi from '@/api/sku'

  import {parseTime, resetTemp} from '@/utils'
  import {root,confirm,pageParamNames} from '@/utils/constants'
  import debounce from 'lodash/debounce'

  export default {

    name: 'UserManage',

    data() {

      let validateName = (rule, value, callback) => {
        if (this.dialogStatus == 'create' && value === '') {
          callback(new Error('必填'));
        } else {
          callback();
        }
      };

      let validateCode = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入密码'));
        } else {
          // if (this.temp.pwd2 !== '') {
          //   this.$refs.dataForm.validateField('pwd2');
          // }
          callback();
        }
      };

      let validatImageUrl = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入密码 ImageUrl'));
        } else  {
          callback();
        }
      };

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
          brandName: null,
          brandCode: null,
          brandImageUrl: null,
          created: null,
          updated: null
        },
        textMap: {
          update: '编辑品牌',
          create: '新增品牌'
        },
        rules: {
          brandName: [{validator: validateName, trigger: 'blur'}],
          brandCode: [{validator: validateCode, trigger: 'blur'}],
          brandImageUrl: [{validator: validatImageUrl, trigger: 'blur'}]
        },
        checkAll: false,
        isIndeterminate: true,
        //所有角色(管理员除外)
        roleOptions:[],
        roleMap: new Map(),
        // 更新用户的角色的数据
        updateUserRolesData: {
          idx: null,
          uid: null,
          rids: []
        },
      }

    },

    created() {
      this.initData()
      this.fetchData()
    },

    watch: {
      //延时查询
      'tableQuery.nick': debounce(function () {
        this.fetchData()
      }, 500)
    },//watch

    methods: {

      initData(){
        //所有角色选项
        optionApi.listRoleOptions().then(res => {
          res.data.options.forEach(obj => {
          if(obj.val2!=root.rval){//排除管理员
          this.roleOptions.push(obj)
          this.roleMap.set(obj.id, obj.val)
        }
      })
      })
      },

      hasAdminRole(row){
        if(row && row.roleList){
          return row.roleList.some(role=>role.rval==root.rval)
        }
        return false
      },

      //全选
      handleCheckAllChange(val) {
        let allRids = this.roleOptions.map(role => role.id)
        this.updateUserRolesData.rids = val ? allRids : [];
        this.isIndeterminate = false;
      },

      //分页
      handleSizeChange(val) {
        this.tablePage.size = val;
        this.fetchData();
      },
      handleCurrentChange(val) {
        this.tablePage.current = val;
        this.fetchData();
      },

      //查询
      fetchData(current) {
        if(current){
          this.tablePage.current = current
        }
        this.tableLoading = true
        skuApi.queryBrand(this.tableQuery, this.tablePage).then(res => {
          this.tableData = res.data.page.records
        this.tableLoading = false
        pageParamNames.forEach(name => this.$set(this.tablePage, name, res.data.page[name]))
      })
      },

      //更新
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
        const tempData = Object.assign({}, this.temp)//copy obj
        userApi.updateUser(tempData).then(res => {
          tempData.updated = res.data.updated
        this.tableData.splice(tempData.idx, 1, tempData)
        this.dialogFormVisible = false
        this.$message.success("更新成功")
      })
      })
      },


      //更新用户的角色
      handleUpdateUserRoles(idx, row) {

        // 显示用户的角色
        this.updateUserRolesData = {
          idx: idx,
          uid: row.uid,
          rids: row.roleList.map(role=>role.rid)
      }
        // 显示弹窗
        this.editRolesDialogVisible = true
      },

      checkUpdateUserRolesData() {
        const noRolesSelected = this.updateUserRolesData && this.updateUserRolesData.rids && this.updateUserRolesData.rids.length ==0;
        if(noRolesSelected){
          this.$confirm('当前没有选中任何角色，会清除该用户已有的角色, 是否继续?', '提示', confirm).then(() => {
            this.invokeUpdateUserRolesApi()
        }).catch(() => {
            this.$message("已取消编辑用户角色");
        });
        }else{
          this.invokeUpdateUserRolesApi()
        }
      },

      invokeUpdateUserRolesApi(){
        userApi.updateUserRoles(this.updateUserRolesData).then(res => {
          let newRoles = this.updateUserRolesData.rids.map(rid=>{
            let rname = this.roleMap.get(rid);
        if(rname) return {rid,rname}
      })
        this.tableData[this.updateUserRolesData.idx].roleList = newRoles
        this.editRolesDialogVisible = false
        this.$message.success("更新成功")
      })
      },

      //删除
      handleDelete(idx, row) {
        this.$confirm('您确定要永久删除该用户？', '提示', confirm).then(() => {
          userApi.deleteUser({uid: row.uid}).then(res => {
          this.tableData.splice(idx, 1)
        --this.tablePage.total
        this.dialogFormVisible = false
        this.$message.success("删除成功")
      })
      }).catch(() => {
          this.$message.info("已取消删除")
      });

      },

      //新增
      handleCreate() {
        resetTemp(this.temp)
        this.dialogStatus = 'create'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
      })
      },
      createData() {
        this.$refs['dataForm'].validate((valid) => {
          if (!valid) return;
        skuApi.addBrand(this.temp).then((res) => {
          this.temp.uid = res.data.uid;//后台传回来新增记录的id
        this.temp.created = res.data.created;//后台传回来新增记录的时间
        this.temp.roleList = []
        this.tableData.unshift(Object.assign({},this.temp))
        ++this.tablePage.total
        this.dialogFormVisible = false
        this.$message.success("添加成功")
      })
      })
      },

    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .role-checkbox{
    margin-left: 0px;
    margin-right: 15px;
  }
</style>
