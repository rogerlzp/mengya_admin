<template>
  <div class="app-container">
    <!--查询  -->
    <el-row>
      <el-input style="width:200px;" v-model="tableQuery.nick" placeholder="昵称"></el-input>
      <span style="margin-right: 15px;"></span>
      <el-tooltip class="item" content="搜索" placement="top">
        <el-button icon="el-icon-search" circle @click="fetchData(1)" v-perm="'b:attr:query'"></el-button>
      </el-tooltip>
    </el-row>
    <div style="margin-bottom: 30px;"></div>
    <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleCreate" v-perm="'b:attr:add'">
      {{textMap.create}}
    </el-button>
    <div style="margin-bottom: 30px;"></div>

    <!--弹出窗口：新增/编辑用户-->

    <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="120px">

      <el-form-item label="属性名称" prop="attrName" v-if="dialogStatus=='create'">
        <el-input v-model="temp.attrName"></el-input>
      </el-form-item>
      <el-form-item label="属性代码" prop="attrCode">
        <el-input v-model="temp.attrCode"></el-input>
      </el-form-item>

      <el-form-item label="属性输入类型:" prop="attrInputType">
        <el-select v-model="temp.attrInputType" placeholder="请选择" @change="onSelectedInputType($event, item)"
                   value-key="value">
          <el-option label="手工输入" value="0" key="0"></el-option>
          <el-option label="选择输入" value="1" key="1"></el-option>
          <el-option label="多行文本输入" value="2" key="2"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="属性类型:" prop="attrType">
        <el-select v-model="temp.attrType" placeholder="能否多选"
                   value-key="value">
          <el-option label="不可以" value="0" key="0"></el-option>
          <el-option label="可以" value="1" key="1"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="属性检索类型:" prop="attrIndex">
        <el-select v-model="temp.attrIndex" placeholder="检索类型"
                   value-key="value">
          <el-option label="不需要检索" value="0" key="0"></el-option>
          <el-option label="关键字检索" value="1" key="1"></el-option>
          <el-option label="范围检索" value="2" key="2"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="显示顺序" prop="sortOrder">
        <el-input v-model="temp.sortOrder"></el-input>
      </el-form-item>
      <el-form-item label="推荐其他属性产品:" prop="isLinked">
        <el-select v-model="temp.isLinked" placeholder="能否多选"
                   value-key="value">
          <el-option label="不可以" value="0" key="0"></el-option>
          <el-option label="可以" value="1" key="1"></el-option>
        </el-select>
      </el-form-item>


      <el-form-item label="属性值" prop="attrValues" v-if="temp.attrInputType==0">
        <el-input v-model="temp.attrValues"></el-input>
      </el-form-item>
      <el-form-item label="属性值" prop="attrValues" v-else-if="temp.attrInputType==1">
        <el-input v-model="temp.attrValues"></el-input>
      </el-form-item>
      <el-form-item label="属性值" prop="attrValues" v-else-if="temp.attrInputType==2">
        <el-input v-model="temp.attrValues"></el-input>
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

  import optionApi from '@/api/option'
  import userApi from '@/api/user'

  import skuApi from '@/api/sku'

  import {parseTime, resetTemp} from '@/utils'
  import {root, confirm, pageParamNames} from '@/utils/constants'
  import debounce from 'lodash/debounce'

  export default {

    name: '属性管理',

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

      return {
        _this: this,
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
          attrId: null,
          attrName: null,
          attrCode: null,
          attrInputType: null,
          attrType: null,
          attrIndex: null,
          sortOrder: null,
          isLinked: null,
          attrValues: null,
          created: null,
          updated: null
        },
        textMap: {
          update: '编辑属性',
          create: '新增属性'
        },
        rules: {
          featureName: [{validator: validateName, trigger: 'blur'}],
          categoryCode: [{validator: validateCode, trigger: 'blur'}]
        },
        checkAll: false,
        isIndeterminate: true,
        // 所有角色(管理员除外)
        roleOptions: [],
        featureOptions: [],
        categories: [],
        roleMap: new Map(),
        // 更新用户的角色的数据
        updateUserRolesData: {
          idx: null,
          uid: null,
          rids: []
        }
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
            if (obj.val2 !== root.rval
            ) { // 排除管理员
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
      },

      hasAdminRole(row) {
        if (row && row.roleList) {
          return row.roleList.some(role => role.rval == root.rval
          )
        }
        return false
      },

      // 全选
      handleCheckAllChange(val) {
        const allRids = this.roleOptions.map(role => role.id
        )
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
        skuApi.queryAttr(this.tableQuery, this.tablePage).then(res => {
          this.tableData = res.data.page.records
          this.tableLoading = false
          pageParamNames.forEach(name => this.$set(this.tablePage, name, res.data.page[name])
          )
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
        this.$nextTick(() => this.$refs['dataForm'].clearValidate()
        )
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

      // 更新用户的角色
      handleUpdateUserRoles(idx, row) {
        // 显示用户的角色
        this.updateUserRolesData = {
          idx: idx,
          uid: row.uid,
          rids: row.roleList.map(role => role.rid
          )
        }
        // 显示弹窗
        this.editRolesDialogVisible = true
      },

      checkUpdateUserRolesData() {
        const noRolesSelected = this.updateUserRolesData && this.updateUserRolesData.rids && this.updateUserRolesData.rids.length === 0
        if (noRolesSelected) {
          this.$confirm('当前没有选中任何角色，会清除该用户已有的角色, 是否继续?', '提示', confirm).then(() => {
            this.invokeUpdateUserRolesApi()
          }).catch(() => {
            this.$message('已取消编辑用户角色')
          })
        } else {
          this.invokeUpdateUserRolesApi()
        }
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
        this.$confirm('您确定要永久删除该属性？', '提示', confirm).then(() => {
          skuApi.deleteFeatureById({id: row.id}).then(res => {
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
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      createData() {
        this.$refs['dataForm'].validate((valid) => {
          if (!valid) return
          skuApi.addAttr(this.temp).then((res) => {
            this.temp.attrId = res.data.attrId // 后台传回来新增记录的id
            this.tableData.unshift(Object.assign({}, this.temp))
            ++this.tablePage.total
            this.$message.success('添加成功')
          })
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
</style>
