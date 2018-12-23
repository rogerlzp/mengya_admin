<template>
  <div class="app-container">
    <!--弹出窗口：新增/编辑用户-->
    <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="120px">

      <el-form-item label="SPU ID" prop="id" :required="true">
        <el-col :span="12">
          <el-input v-model="temp.id" :disabled="true"></el-input>
        </el-col>
      </el-form-item>

      <el-form-item label="SPU名称" prop="spuName" :required="true">
        <el-col :span="12">
          <el-input v-model="temp.spuName"></el-input>
        </el-col>
      </el-form-item>

      <el-form-item label="spu编码" prop="spuCode" :required="true">
        <el-col :span="12">
          <el-input v-model="temp.spuCode" :disabled="true"></el-input>
        </el-col>
      </el-form-item>

      <el-form-item label="spu类型" prop="spuType">
        <el-col :span="12">
          <el-select v-model="temp.spuType" placeholder="请选择类型" value-key="value">
            <el-option label="产品的组件产品" value="0" key="0"></el-option>
            <el-option label="主要产品" value="1" key="1"></el-option>
          </el-select>
        </el-col>
      </el-form-item>


      <el-form-item label="spu描述" prop="spuDesc">
        <el-col :span="12">
          <el-input type="textarea" v-model="temp.spuDesc"></el-input>
        </el-col>
      </el-form-item>

      <el-form-item label="spu英文描述" prop="spuEnDesc">
        <el-col :span="12">
          <el-input type="textarea" v-model="temp.spuEnDesc"></el-input>
        </el-col>
      </el-form-item>

      <el-form-item label="spu文件附件链接" prop="spuDoc">
        <el-col :span="12">
          <el-input v-model="temp.spuDoc"></el-input>
        </el-col>
      </el-form-item>
      <el-form-item label="修改文件链接" prop="spuDoc">
        <!-- 添加产品对应的PDF文件 -->
        <el-upload
          :action=uploadDomain
          :http-request=upqiniu
          :before-upload="beforeUpload"
        >
          <i class="el-icon-plus"></i>
        </el-upload>
        <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
      </el-form-item>

      <el-form-item label="分类名称" prop="categoryCode">
        <el-select v-model="temp.categoryCode"
                   placeholder="请选择">
          <el-option v-for="(item,id) in categories" :key="id"
                     :label="item.categoryName"
                     :value="item.categoryCode">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="品牌名称" prop="categoryCode">
        <el-select v-model="temp.brandCode"
                   placeholder="请选择">
          <el-option v-for="(item,id) in brands" :key="id"
                     :label="item.brandName"
                     :value="item.brandCode">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="适用空间：" prop="" :required="true">
        <el-col :span="12">
          <el-input v-model="checkedSpaceName" />
        </el-col>
        <el-button @click="chooseSpaceType"> 选择产品适用空间</el-button>
      </el-form-item>

      <!-- TODO： 增加属性的设计者 -->
      <div>
        <el-button @click="addAttr">添加产品属性</el-button>
        <div>
          <el-table :data="spuAttrList">
            <el-table-column prop="attrId" label="属性Id">
              <template slot-scope="scope">
                <el-input v-model="spuAttrList[scope.$index].attrId"></el-input>
              </template>
            </el-table-column>
            <el-table-column prop="attrName" label="属性名称">
              <template slot-scope="scope">
                <el-input v-model="spuAttrList[scope.$index].attrName"></el-input>
              </template>
            </el-table-column>
            <el-table-column prop="attrValues" label="属性值">
              <template slot-scope="scope">
                <el-input v-model="spuAttrList[scope.$index].attrValues"></el-input>
              </template>
            </el-table-column>
            <el-table-column prop="sortOrder" label="属性排列顺序">
              <template slot-scope="scope">
                <el-input v-model="spuAttrList[scope.$index].sortOrder"></el-input>
              </template>
            </el-table-column>
            <el-table-column prop="age" label="">
              <template slot-scope="scope">
                <el-button @click="deleteSpuAttrRow(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
            <el-table-column prop="age" label="">
              <template slot-scope="scope">
                <el-button @click="handleUpdateAttr(scope.$index,scope.row)">编辑</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- 增加关联产品 -->
      <div>
        <el-button @click="addRelateSPU">添加产品组件</el-button>
        <div>
          <el-table :data="spuComponentList">
            <el-table-column prop="id" label="SPU Id">
              <template slot-scope="scope">
                <el-input v-model="spuComponentList[scope.$index].id"></el-input>
              </template>
            </el-table-column>
            <el-table-column prop="spuName" label="产品名称">
              <template slot-scope="scope">
                <el-input v-model="spuComponentList[scope.$index].spuName"></el-input>
              </template>
            </el-table-column>
            <el-table-column prop="subSpuCode" label="产品Code">
              <template slot-scope="scope">
                <el-input v-model="spuComponentList[scope.$index].subSpuCode"></el-input>
              </template>
            </el-table-column>
            <el-table-column prop="subNum" label="组件产品数量">
              <template slot-scope="scope">
                <el-input v-model="spuComponentList[scope.$index].subNum"></el-input>
              </template>
            </el-table-column>
            <el-table-column label="">
              <template slot-scope="scope">
                <el-button @click="deleteSpuListRow(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <div>
        <el-button @click="addDesigner">添加产品设计师</el-button>
        <div>
          <el-table :data="spuDesignerList">
            <el-table-column prop="id" label="关联Id">
              <template slot-scope="scope">
                <el-input v-model="spuDesignerList[scope.$index].id"></el-input>
              </template>
            </el-table-column>
            <el-table-column prop="designerName" label="设计师名称">
              <template slot-scope="scope">
                <el-input v-model="spuDesignerList[scope.$index].designerName"></el-input>
              </template>
            </el-table-column>
            <el-table-column prop="designerId" label="设计师ID">
              <template slot-scope="scope">
                <el-input v-model="spuDesignerList[scope.$index].designerId"></el-input>
              </template>
            </el-table-column>
            <el-table-column prop="age" label="">
              <template slot-scope="scope">
                <el-button @click="deleteSpuDesignerRow(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="updateData">更新</el-button>
    </div>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="spuDialogFormVisible" width="60%">
      <el-form :rules="attrRules" ref="subSpuForm" :model="subSpuTemp" label-position="left" label-width="120px">

        <el-form-item label="SPU名称" prop="spuName">
          <el-input v-model="subSpuTemp.spuName"></el-input>
        </el-form-item>

        <el-form-item label="spu编码" prop="subSpuCode">
          <el-input v-model="subSpuTemp.subSpuCode"></el-input>
        </el-form-item>

        <el-form-item label="组件产品数量" prop="subNum">
          <el-input v-model="subSpuTemp.subNum"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="spuDialogFormVisible = false">取消</el-button>
        <el-button v-if="dialogStatus=='addSubSpu'" type="primary" @click="createSubSpu">增加组件产品</el-button>
      </div>

    </el-dialog>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="60%">
      <el-form :rules="attrRules" ref="dataAttrForm" :model="attrTemp" label-position="left" label-width="120px">

        <el-form-item label="属性名称" prop="attrName" :required="true">
          <el-col :span="12">
            <el-input v-model="attrTemp.attrName"></el-input>
          </el-col>
        </el-form-item>
        <el-form-item label="属性代码" prop="attrCode">
          <el-col :span="12">
            <el-input v-model="attrTemp.attrCode"></el-input>
          </el-col>
        </el-form-item>

        <el-form-item label="属性输入类型:" prop="attrInputType">
          <el-select v-model="attrTemp.attrInputType" placeholder="请选择"
                     value-key="value">
            <el-option label="手工输入" value="0" key="0"></el-option>
            <el-option label="选择输入" value="1" key="1"></el-option>
            <el-option label="多行文本输入" value="2" key="2"></el-option>
            <el-option label="属性值太多，增加属性值" value="3" key="3"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="属性类型:" prop="attrType">
          <el-select v-model="attrTemp.attrType" placeholder="能否多选"
                     value-key="value">
            <el-option label="不可以" value="0" key="0"></el-option>
            <el-option label="可以" value="1" key="1"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="属性检索类型:" prop="attrIndex">
          <el-select v-model="attrTemp.attrIndex" placeholder="检索类型"
                     value-key="value">
            <el-option label="不需要检索" value="0" key="0"></el-option>
            <el-option label="关键字检索" value="1" key="1"></el-option>
            <el-option label="范围检索" value="2" key="2"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="推荐其他属性产品:" prop="isLinked">
          <el-select v-model="attrTemp.isLinked" placeholder="能否多选"
                     value-key="value">
            <el-option label="不可以" value="0" key="0"></el-option>
            <el-option label="可以" value="1" key="1"></el-option>
          </el-select>
        </el-form-item>


        <el-form-item label="属性值" prop="attrValues" v-if="attrTemp.attrInputType==0">
          <el-input v-model="attrTemp.attrValues"></el-input>
        </el-form-item>
        <el-form-item label="属性值" prop="attrValues" v-else-if="attrTemp.attrInputType==1">
          <el-input type="textarea" v-model="attrTemp.attrValues"></el-input>
        </el-form-item>
        <el-form-item label="属性值" prop="attrValues" v-else-if="attrTemp.attrInputType==2">
          <el-input v-model="attrTemp.attrValues"></el-input>
        </el-form-item>

        <el-form-item label="属性值" v-else-if="attrTemp.attrInputType==3">
          <div>
            <el-button @click="addAttrVal">添加属性值</el-button>
            <div>
              <el-table :data="attrValList">
                <el-table-column prop="attrValName" label="属性中文值">
                  <template slot-scope="scope">
                    <el-input v-model="attrValList[scope.$index].attrValName"></el-input>
                  </template>
                </el-table-column>
                <el-table-column prop="attrValEnName" label="属性英文值">
                  <template slot-scope="scope">
                    <el-input v-model="attrValList[scope.$index].attrValEnName"></el-input>
                  </template>
                </el-table-column>
                <el-table-column label="">
                  <template slot-scope="scope">
                    <el-button @click="deleteAttrValRow(scope.$index)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>

        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button v-if="dialogStatus=='addAttr'" type="primary" @click="createAttr">创建属性</el-button>
        <el-button v-if="dialogStatus=='updateAttr'" type="primary" @click="updateAttr">创建属性</el-button>
      </div>

    </el-dialog>

    <!--弹出窗口：修改SPU-->

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="spuDesignerDialogFormVisible" width="60%">
      <el-form :rules="attrRules" ref="spuDesignerForm" :model="spuDesignerTemp" label-position="left"
               label-width="120px">

        <el-form-item label="设计者姓名" prop="designerName">
          <el-input v-model="spuDesignerTemp.designerName"></el-input>
        </el-form-item>

        <el-form-item label="设计者ID" prop="designerId">
          <el-input v-model="spuDesignerTemp.designerId"></el-input>
        </el-form-item>
        <el-form-item label="设计者头像" prop="subNum">
          <el-input v-model="spuDesignerTemp.subNum"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="spuDesignerDialogFormVisible = false">取消</el-button>
        <el-button v-if="dialogStatus=='addSpuDesigner'" type="primary"
                   @click="createDesigner">增加产品设计师
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :title="textMap[subDialogStatus]" :visible.sync="attrValDialogFormVisible" width="60%">
      <el-form :rules="attrRules" ref="attrValForm" :model="attrValTemp" label-position="left" label-width="120px">
        <el-form-item label="属性中文值" prop="attrValName">
          <el-input v-model="attrValTemp.attrValName"></el-input>
        </el-form-item>
        <el-form-item label="属性英文值" prop="attrValEnName">
          <el-input v-model="attrValTemp.attrValEnName"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="attrValDialogFormVisible = false">取消</el-button>
        <el-button v-if="subDialogStatus=='addAttrVal'" type="primary"
                   @click="createAttrVal">增加属性值
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="choosSpaceDialogFormVisible" width="80%">
      <div class="checkbox-table" v-for="(spaceItem,indexkey) in spaceList">
        <template>
          <el-checkbox :label="spaceItem.id" v-model="checkAll" :key="spaceItem.id"
                       @change="handleCheckAllSpaceChange(indexkey)">{{spaceItem.spaceName}}
          </el-checkbox>
          <div style="margin: 15px 0;"></div>
          <el-checkbox v-for="(subSpaceItem,subIndex) in spaceItem.subSpaceList" v-if="spaceItem.subSpaceList!=null "
                       v-model="checkedSpaceItem" @change="handleCheckedSpaceChange(subIndex, indexkey)"
                       :label="subSpaceItem.id"> {{subSpaceItem.spaceName}}
          </el-checkbox>
        </template>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="choosSpaceDialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="choosedSpace">增加产品使用空间</el-button>
      </div>

    </el-dialog>

  </div>
</template>

<script>
  import optionApi from '@/api/option'
  import userApi from '@/api/user'

  import skuApi from '@/api/sku'
  import qiniuApi from '@/api/qiniu'
  import storyImageApi from "@/api/storyImageApi";

  import {parseTime, resetTemp} from '@/utils'
  import {root, confirm, pageParamNames} from '@/utils/constants'
  import debounce from 'lodash/debounce'

  export default {

    name: 'SPUEdit',

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
        spuDialogFormVisible: false,
        spuDesignerDialogFormVisible: false,
        attrValDialogFormVisible: false,
        choosSpaceDialogFormVisible: false,
        dialogStatus: '',
        subDialogStatus: '',
        temp: {
          idx: null, // tableData中的下标
          id: null,
          spuName: null,
          spuCode: null,
          spuDesc: null,
          spuEnDesc: null,
          spuDoc: null,
          spuType: null,
          categoryCode: null,
          brandCode: null,
          spuAttrList: [],
          spuComponentList: [],
          spuDesignerList: [], // SPU 设计师
          spuSpaceList: [],
          created: null,
          updated: null
        },
        attrTemp: {
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
          attrValList: [],
          created: null,
          updated: null
        },
        subSpuTemp: {
          idx: null, // tableData中的下标
          id: null,
          spuName: null,
          spuCode: null,
          subSpuCode: null,
          subNum: null,
          created: null,
          updated: null
        },
        spuDesignerTemp: {
          id: null,
          designerName: null,
          designerId: null
        },
        attrValTemp: {
          id: null,
          attrValName: null,
          attrValEnName: null
        },

        textMap: {
          update: '编辑品牌',
          create: '新增品牌',
          addAttr: '增加SPU属性',
          addSubSpu: '增加关联产品SPU',
          addSpuDesigner: '增加产品设计师',
          addAttrVal: '增加属性值'
        },
        rules: {
          spuName: [{validator: validateName, trigger: 'blur'}],
          categoryCode: [{validator: validateCode, trigger: 'blur'}],
          brandCode: [{validator: validatImageUrl, trigger: 'blur'}]
        },
        attrRules: {
          spuName: [{validator: validateName, trigger: 'blur'}],
          categoryCode: [{validator: validateCode, trigger: 'blur'}],
          brandCode: [{validator: validatImageUrl, trigger: 'blur'}]
        },
        spuAttrList: [],
        spuComponentList: [],
        spuDesignerList: [], // SPU 设计师
        attrValList: [],
        isIndeterminate: true,
        // 所有角色(管理员除外)
        categories: [], // 分类
        spaceList: [], // 空间类型
        checkAll: [],
        checkedSpaceItem: [],
        checkedSpaceName: null,
        qiniuToken: null,
        // 七牛云的上传地址，根据自己所在地区选择，我这里是华南区
        uploadDomain: 'https://upload.qiniup.com',
        // 这是七牛云空间的外链默认域名
        qiniuaddr: 'image-egg.ptelatino.com',
        brands: []// 品牌
      }
    },

    created() {
      const spuCode = this.$route.params && this.$route.params.spuCode
      this.fetchData(spuCode)

    },

    watch: {
      // 延时查询
      'tableQuery.nick': debounce(function () {
        this.fetchData()
      }, 500)
    }, // watch

    methods: {
      fetchData(spuCode) {

        skuApi.querySPUBySpuCode(spuCode).then(response => {
          const spu = response.data.spu
          const spuAttrList = spu.spuAttrList
          const spuComponentList = spu.spuComponentList
          const spuDesignerList = spu.spuDesignerList
          this.spuSpaceList = spu.spuSpaceList
          // Just for test
          this.temp.id = spu.id
          this.temp.spuName = spu.spuName
          this.temp.spuCode = spu.spuCode
          this.temp.spuType = spu.spuType
          this.temp.spuDesc = spu.spuDesc
          this.temp.spuEnDesc = spu.spuEnDesc
          this.temp.categoryCode = spu.categoryCode
          this.temp.brandCode = spu.brandCode
          this.temp.spuDoc = spu.spuDoc

          spuAttrList.forEach(obj => {
            // this.spuAttrList.push(obj)
            this.spuAttrList.unshift(Object.assign({}, obj))
          })
          spuComponentList.forEach(obj => {
            this.spuComponentList.unshift(Object.assign({}, obj))
          })
          spuDesignerList.forEach(obj => {
            this.spuDesignerList.unshift(Object.assign({}, obj))
          })
          const that = this
          storyImageApi.querySpaceList().then(res => {
            res.data.spaceList.forEach(obj => {
              that.spaceList.push(obj)
            })
            const checkedSpaceNameList = []
            for (var i = 0; i < that.spuSpaceList.length; i++) {
              for (var j = 0; j < that.spaceList.length; j++) {
                if (that.spuSpaceList[i].id === that.spaceList[j].id) {
                  checkedSpaceNameList.push(that.spuSpaceList[i].spaceName)
                  that.checkAll[i] = that.spuSpaceList[i].id
                } else {
                  if (that.spaceList[j].subSpaceList !== null) {
                    for (var k = 0; k < that.spaceList[j].subSpaceList.length; k++) {
                      if (that.spuSpaceList[i].id === that.spaceList[j].subSpaceList[k].id) {
                        checkedSpaceNameList.push(that.spuSpaceList[i].spaceName)
                        that.checkedSpaceItem[i] = that.spuSpaceList[i].id
                      }
                    }
                  }
                }
              }
            }
            that.checkedSpaceName = checkedSpaceNameList.toString()
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
        const allRids = this.roleOptions.map(role => role.i)
        this.updateUserRolesData.rids = val ? allRids : []
        this.isIndeterminate = false
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

      // 删除
      handleDelete(idx, row) {
        this.$confirm('您确定要永久删除该产品？', '提示', confirm).then(() => {
          skuApi.deleteSPU({id: row.id}).then(res => {
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
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      updateData() {
        this.temp.spuSpaceList = this.checkAll.concat()
        this.temp.spuSpaceList = this.checkedSpaceItem.concat()
        this.$refs['dataForm'].validate((valid) => {
          if (!valid) return
          skuApi.updateSPU(this.temp).then((res) => {
            this.$message.success('更新成功')
          })
        })
      },

      // 1. 弹出浮窗
      // 2. 增加一行
      // 3. 提交成功后，将对应的值增加到这行里面
      addAttr() {
        resetTemp(this.attrTemp)
        this.attrValList = [] // 删除attrValList中的值
        this.dialogStatus = 'addAttr'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataAttrForm'].clearValidate()
        })
      },
      createAttr() {
        this.$refs['dataAttrForm'].validate((valid) => {
          if (!valid) return
          skuApi.addAttr(this.attrTemp).then((res) => {
            this.attrTemp.attrId = res.data.attrId // 后台传回来新增记录的id
            this.tableData.unshift(Object.assign({}, this.attrTemp))
            this.dialogFormVisible = false
            // 显示对应的值到新增加的一行里面
            this.$message.success('添加成功')
            // this.spuAttrList.push({})
            this.spuAttrList.unshift(Object.assign({}, this.attrTemp))
            this.temp.spuAttrList = this.spuAttrList
          })
        })
      },
      deleteSpuAttrRow(index) {
        skuApi.deleteAttrByAttrSpu(this.spuAttrList[index].attrId, this.temp.spuCode).then((res) => {
          if (res.data.deleteResult === 1) {
            this.spuAttrList.splice(index, 1)
            this.temp.spuAttrList = this.spuAttrList
          }
        })
      },
      // 增加关联产品
      addRelateSPU() {
        resetTemp(this.relateSpuTemp)
        this.dialogStatus = 'addSubSpu'
        this.spuDialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['subSpuForm'].clearValidate()
        })
      },
      createSubSpu() {
        this.$refs['subSpuForm'].validate((valid) => {
          if (!valid) return
          this.spuComponentList.unshift(Object.assign({}, this.subSpuTemp))
          this.temp.spuComponentList = this.spuComponentList
          this.$message.success('添加成功')
          this.spuDialogFormVisible = false
        })
      },
      deleteSpuListRow(index) {
        skuApi.deleteSubSpu(this.temp.spuCode, this.spuComponentList[index].subSpuCode).then((res) => {
          if (res.data.deleteResult === 1) {
            this.spuComponentList.splice(index, 1)
            this.temp.spuComponentList = this.spuComponentList
          }
        })
      },

      // 设计师
      addDesigner() {
        resetTemp(this.spuDesignerTemp)
        this.dialogStatus = 'addSpuDesigner'
        this.spuDesignerDialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['spuDesignerForm'].clearValidate()
        })
      },
      createDesigner() {
        this.$refs['spuDesignerForm'].validate((valid) => {
          if (!valid) return
          this.spuDesignerList.unshift(Object.assign({}, this.spuDesignerTemp))
          this.temp.spuDesignerList = this.spuDesignerList
          this.$message.success('添加成功')
          this.spuDesignerDialogFormVisible = false
        })
      },
      deleteSpuDesignerRow(index) {
        skuApi.deleteSpuDesigner(this.temp.spuCode, this.spuDesignerList[index].designerId).then((res) => {
          if (res.data.deleteResult === 1) {
            this.spuDesignerList.splice(index, 1)
            this.temp.spuDesignerList = this.spuDesignerList
          }
        })
      },

      // 增加属性值
      addAttrVal() {
        resetTemp(this.attrValTemp)
        this.subDialogStatus = 'addAttrVal'
        this.attrValDialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['attrValForm'].clearValidate()
        })
      },
      createAttrVal() {
        this.$refs['attrValForm'].validate((valid) => {
          if (!valid) return
          this.attrValList.unshift(Object.assign({}, this.attrValTemp))
          this.attrTemp.attrValList = this.attrValList
          this.$message.success('添加成功')
          this.attrValDialogFormVisible = false
        })
      },
      deleteAttrValRow(index) {
        this.attrValList.splice(index, 1)
        this.attrTemp.attrValList = this.attrValList
      },

      // 更新Attr
      handleUpdateAttr(idx, row) {
        this.attrTemp = Object.assign({}, row) // copy obj
        if (this.attrTemp.attrInputType === 3) { // 从后台获取AttrVal属性
          skuApi.queryAttrVal(this.attrTemp.attrId).then((res) => {
            this.attrValList = []
            const attrValList = res.data.attrValList
            attrValList.forEach(obj => {
              this.attrValList.unshift(Object.assign({}, obj))
            })
          })
        }
        this.dialogStatus = 'updateAttr'
        this.dialogFormVisible = true
        this.$nextTick(() => this.$refs['dataAttrForm'].clearValidate())
      },
      updateAttr() {
        this.$refs['dataAttrForm'].validate((valid) => {
          if (!valid) return
          skuApi.updateAttr(this.attrTemp).then((res) => {
            this.attrTemp.attrId = res.data.attrId // 后台传回来新增记录的id
            this.tableData.unshift(Object.assign({}, this.attrTemp))
            this.dialogFormVisible = false
            this.$message.success('更新成功')
          })
        })
      },

      // upload to qiniu
      upqiniu(req) {
        console.log(req)
        const config = {
          headers: {'Content-Type': 'multipart/form-data'}
        }
        var filename = req.file.name
        // 重命名要上传的文件

        // 从后端获取上传凭证token
        qiniuApi.getToken().then((res) => {
          const formdata = new FormData()
          formdata.append('file', req.file)
          formdata.append('token', res.data.uploadToken)
          formdata.append('key', filename)
          // 获取到凭证之后再将文件上传到七牛云空间
          this.myAxios.post(this.uploadDomain, formdata, config).then(res => {
            this.temp.spuDoc = 'http://' + this.qiniuaddr + '/' + res.data.key
          })
        })
      },
      // 验证文件合法性
      beforeUpload(file) {
        const isPDF = file.type === 'application/pdf' || file.type === 'application/doc' || file.type === 'application/docx'
        const isLt50M = file.size / 1024 / 1024 < 50
        if (!isPDF) {
          this.$message.error('上传规格描述文件只能是 PDF格式 !')
        }
        if (!isLt50M) {
          this.$message.error('上传规格描述文件不能超过 50 MB!')
        }
        return isPDF && isLt50M
      },

      // space type
      chooseSpaceType() {
        this.dialogStatus = 'chooseSpaceType'
        this.choosSpaceDialogFormVisible = true
        this.$nextTick(() => {
          // this.$refs['dataAttrForm'].clearValidate()
        })
      },
      handleCheckAllSpaceChange(indexkey) {
        console.log(this.checkAll[indexkey])
        if (this.checkAll[indexkey] === 1) {
          // 遍历，将所有的放进来

        }
      },
      handleCheckedSpaceChange(subIndex, indexKey) {
        console.log(subIndex, indexKey)

      },
      choosedSpace() {
        const checkedSpaceNameList = []
        const that = this
        for (var i = 0; i < that.spaceList.length; i++) {
          that.checkAll.forEach(function(item, index) {
            if (that.spaceList[i].id === item) {
              checkedSpaceNameList.push(that.spaceList[i].spaceName)
            }
          })
          if (that.spaceList[i].subSpaceList != null) {
            for (var j = 0; j < that.spaceList[i].subSpaceList.length; j++) {
              that.checkedSpaceItem.forEach(function (item, index) {
                if (that.spaceList[i].subSpaceList[j].id === item) {
                  checkedSpaceNameList.push(that.spaceList[i].subSpaceList[j].spaceName)
                }
              })
            }
          }
        }
        that.checkedSpaceName = checkedSpaceNameList.toString()
        that.choosSpaceDialogFormVisible = false
      },
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .role-checkbox {
    margin-left: 0px;
    margin-right: 15px;
  }
</style>
