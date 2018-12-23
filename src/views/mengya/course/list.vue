<template>
  <div class="app-container">
    <!--查询  -->
    <el-row>
      <el-input style="width:200px;" v-model="tableQuery.nick" placeholder="昵称"></el-input>
      <span style="margin-right: 15px;"></span>
    </el-row>
    <div style="margin-bottom: 30px;"></div>
    <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleCreate">{{textMap.create}}</el-button>
    <div style="margin-bottom: 30px;"></div>
    <!--列表-->
    <el-table style="width: 100%"
              :data="tableData"
              v-loading.body="tableLoading"
              element-loading-text="加载中"
              border fit highlight-current-row>

      <el-table-column prop="id" label="Grade ID"></el-table-column>
      <el-table-column prop="courseName" label="Course名称"></el-table-column>
      <el-table-column prop="courseDesc" label="Course描述"></el-table-column>
      <el-table-column prop="courseTitle" label="Course标题"></el-table-column>
      <el-table-column prop="isFree" label="是否免费">
        <template slot-scope="scope">
          <div v-if="scope.row.isFree==1">免费课程</div>
          <div v-if="scope.row.isFree==0">付费课程</div>
        </template>
        </el-table-column>
      <el-table-column prop="gradeId" label="课程班级"></el-table-column>
      <el-table-column prop="courseNum" label="课程顺序"></el-table-column>
      <el-table-column prop="status" label="课程状态">
        <template slot-scope="scope">
          <div v-if="scope.row.status==1">有效</div>
          <div v-if="scope.row.status==0">无效</div>
        </template>
      </el-table-column>

      <el-table-column prop="courseImage" label="Course图片">
        <template slot-scope="scope">
          <img :src="scope.row.courseImage" style="width: 100px;height: 100px;display: block;" />
        </template>
      </el-table-column>
      <el-table-column prop="courseVideo" label="课程视频">
        <template slot-scope="scope">
          <video :src="scope.row.courseVideo" controls preload="auto"  style="width: 100px;height: 100px;display: block;" />
        </template>
      </el-table-column>

      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-tooltip content="编辑" placement="top">
            <el-button @click="handleUpdate(scope.$index,scope.row)" size="medium" type="info" icon="el-icon-edit" circle plain></el-button>
          </el-tooltip>
          <el-tooltip content="删除" placement="top" v-if="!hasAdminRole(scope.row)">
            <el-button @click="handleDelete(scope.$index,scope.row)" size="medium" type="danger" icon="el-icon-delete" circle plain></el-button>
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
  import optionApi from '@/api/option'
  import courseApi from '@/api/course'
  import { parseTime, resetTemp } from '@/utils'
  import { root, confirm, pageParamNames } from '@/utils/constants'
  import debounce from 'lodash/debounce'

  export default {
    name: 'GradeManage',
    data() {
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
          courseName: null,
          courseDesc: null,
          courseTitle: null,
          courseVideo: null,
          isFree: null,
          courseNum: null,
          status: null,
          gradeId: null,
          courseImage: null,
          created: null,
          updated: null
        },
        textMap: {
          update: '编辑品牌',
          create: '新增Course'
        },
        checkAll: false,
        isIndeterminate: true,
        // 所有角色(管理员除外
        roleOptions: [],
        roleMap: new Map()
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
        courseApi.queryCourse(this.tableQuery, this.tablePage).then(res => {
          this.tableData = res.data.page.records
          this.tableLoading = false
          pageParamNames.forEach(name => this.$set(this.tablePage, name, res.data.page[name]))
        })
      },
      // 删除
      handleDelete(idx, row) {
        this.$confirm('您确定要永久删除该Course？', '提示', confirm).then(() => {
          courseApi.deleteCourseById({ courseId: row.id }).then(res => {
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

      // 新增
      handleCreate() {
        this.$router.push({
          path: '/mengya/course/addCourse'
        })
      },
      handleUpdate(idx, row) {
        this.$router.push({
          path: '/mengya/course/editCourse/' + row.id
        })
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
