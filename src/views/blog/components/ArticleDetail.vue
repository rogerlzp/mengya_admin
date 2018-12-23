<template>
  <div class="createPost-container">
    <el-form ref="postForm" :model="postForm" :rules="rules" class="form-container">

      <sticky :class-name="'sub-navbar '+postForm.status">
        <CommentDropdown v-model="postForm.comment_disabled" />
        <PlatformDropdown v-model="postForm.platforms" />
        <SourceUrlDropdown v-model="postForm.source_uri" />
        <el-button v-loading="loading" style="margin-left: 10px;" type="success" @click="submitForm">发布
        </el-button>
        <el-button v-loading="loading" type="warning" @click="draftForm">草稿</el-button>
      </sticky>

      <div class="createPost-main-container">
        <el-row>
          <Warning />
          <el-col :span="24">
            <el-form-item style="margin-bottom: 10px;" prop="title">
              <MDinput v-model="postForm.title" :maxlength="100" name="name" required>
                标题
              </MDinput>
            </el-form-item>
            <el-form-item style="margin-bottom: 5px;" prop="subTitle">
              <MDinput v-model="postForm.subTitle" :maxlength="100" required>
                副标题
              </MDinput>
            </el-form-item>
            <div><span>关键字：</span></div>
            <el-tag
              :key="tag"
              v-for="tag in dynamicTags"
              closable
              :disable-transitions="false"
              @close="handleClose(tag)">
              {{tag}}
            </el-tag>
            <el-input
              class="input-new-tag"
              v-if="inputVisible"
              v-model="inputValue"
              ref="saveTagInput"
              size="small"
              @keyup.enter.native="handleInputConfirm"
              @blur="handleInputConfirm"
            >
            </el-input>
            <el-button v-else class="button-new-tag" size="small" @click="showInput">+ New Tag</el-button>

            <div class="postInfo-container">
              <el-row>
                <el-col :span="8">
                  <el-form-item label-width="45px" label="作者:" class="postInfo-container-item">
                    <el-select v-model="postForm.author" :remote-method="getRemoteUserList" filterable remote placeholder="搜索用户">
                      <el-option v-for="(item,index) in userListOptions" :key="item.userName + item.nickname" :label="item.userName"
                                 :value="item.userId"/>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label-width="60px" label="设计师:" class="postInfo-container-item">
                    <el-select v-model="postForm.designerList"  :multiple="true" :remote-method="getRemoteUserList" filterable remote placeholder="搜索用户">
                      <el-option v-for="(item,index) in userListOptions" :key="item.userName + item.nickname" :label="item.userName"
                                 :value="item.userId"/>
                    </el-select>
                  </el-form-item>
                </el-col>

                <el-col :span="12">
                  <el-form-item label-width="90px" label="项目中产品:" class="postInfo-container-item">
                    <el-select v-model="postForm.skuList"  :multiple="true" :remote-method="getRemoteSKUList" filterable remote placeholder="搜索产品">
                      <el-option v-for="(item,index) in skuListOptions" :key="item.skuName+item.skuNo" :label="'名称:' + item.skuName + ' 编号:' +item.skuNo"
                                 :value="item.skuNo"/>
                    </el-select>
                  </el-form-item>
                </el-col>

                <el-col :span="10">
                  <el-form-item label-width="80px" label="发布时间:" class="postInfo-container-item">
                    <el-date-picker v-model="postForm.display_time" type="datetime" format="yyyy-MM-dd HH:mm:ss" placeholder="选择日期时间"/>
                  </el-form-item>
                </el-col>

                <el-col :span="10">
                  <el-form-item label-width="80px" label="博客样式:" class="postInfo-container-item">
                    <el-select v-model="postForm.imageType" placeholder="请选择博客样式" value-key="value">
                      <el-option label="有单独图片" value="1" key="1"></el-option>
                      <el-option label="无单独图片" value="0" key="0"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>

                <el-col :span="6">
                  <el-form-item label-width="60px" label="重要性:" class="postInfo-container-item">
                    <el-rate
                      v-model="postForm.importance"
                      :max="3"
                      :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                      :low-threshold="1"
                      :high-threshold="3"
                      style="margin-top:8px;"/>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </el-col>
        </el-row>

        <el-form-item style="margin-bottom: 40px;" label-width="45px" label="摘要:">
          <el-input :rows="1" v-model="postForm.content_short" type="textarea" class="article-textarea" autosize placeholder="请输入内容"/>
          <span v-show="contentShortLength" class="word-counter">{{ contentShortLength }}字</span>
        </el-form-item>

        <div class="editor-container">
          <Tinymce ref="editor" :height="400" v-model="postForm.content" />
        </div>

        <div style="margin-bottom: 20px;">
          <Upload v-model="postForm.image_uri" />
        </div>
      </div>
    </el-form>

  </div>
</template>

<script>

import articleApi from '@/api/article'
import skuApi from '@/api/sku'
import Tinymce from '@/components/Tinymce'
import Upload from '@/components/Upload/singleImage3'
import MDinput from '@/components/MDinput'
import Sticky from '@/components/Sticky' // 粘性header组件
import { validateURL } from '@/utils/validate'
import userApi from '@/api/user'
import Warning from './Warning'
import { CommentDropdown, PlatformDropdown, SourceUrlDropdown } from './Dropdown'

const defaultForm = {
  status: 'draft',
  title: '', // 文章题目
  content: '', // 文章内容
  content_short: '', // 文章摘要
  source_uri: '', // 文章外链
  image_uri: '', // 文章图片
  display_time: undefined, // 前台展示时间
  id: undefined,
  imageType: 1,
  platforms: ['a-platform'],
  comment_disabled: false,
  skuList: [], // 关联的产品列表
  designerList: [], // 设计师列表
  tagList: [],
  importance: 0
}

export default {
  name: 'ArticleDetail',
  components: {
    Tinymce, MDinput, Upload, Sticky, Warning, CommentDropdown, PlatformDropdown, SourceUrlDropdown },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const validateRequire = (rule, value, callback) => {
      if (value === '') {
        this.$message({
          message: rule.field + '为必填项',
          type: 'error'
        })
        callback(new Error(rule.field + '为必填项'))
      } else {
        callback()
      }
    }
    const validateSourceUri = (rule, value, callback) => {
      if (value) {
        if (validateURL(value)) {
          callback()
        } else {
          this.$message({
            message: '外链url填写不正确',
            type: 'error'
          })
          callback(new Error('外链url填写不正确'))
        }
      } else {
        callback()
      }
    }
    return {
      postForm: Object.assign({}, defaultForm),
      loading: false,
      userListOptions: [],
      skuListOptions: [],
      rules: {
        image_uri: [{ validator: validateRequire }],
        title: [{ validator: validateRequire }],
        content: [{ validator: validateRequire }],
        source_uri: [{ validator: validateSourceUri, trigger: 'blur' }]
      },
      tempRoute: {},
      temp: {
        idx: null, // tableData中的下标
        status: 'draft',
        articleTitle: '', // 文章题目
        articleContent: '', // 文章内容
        articleAbstract: '', // 文章摘要
        source_uri: '', // 文章外链
        articleImage: '', // 文章图片
        imageType: 1,
        displayTime: undefined, // 前台展示时间
        id: undefined,
        platforms: ['a-platform'],
        isCommentEnabled: false,
        userId: '10001',
        skuList: [], // 关联的产品列表
        designerList: [], // 设计师列表
        tagList: [],
        importance: 0
      },
      // Tag
      dynamicTags: [],
      inputVisible: false,
      inputValue: ''
    }
  },
  computed: {
    contentShortLength() {
      return this.postForm.content_short.length
    },
    lang() {
      return this.$store.getters.language
    }
  },
  created() {
    if (this.isEdit) {
      const id = this.$route.params && this.$route.params.id
      this.fetchData(id)
    } else {
      this.postForm = Object.assign({}, defaultForm)
    }

    // Why need to make a copy of this.$route here?
    // Because if you enter this page and quickly switch tag, may be in the execution of the setTagsViewTitle function, this.$route is no longer pointing to the current page
    // https://github.com/PanJiaChen/vue-element-admin/issues/1221
    this.tempRoute = Object.assign({}, this.$route)
  },
  methods: {
    fetchData(id) {
      articleApi.fetchArticle(id).then(response => {
        const article = response.data.article
        this.postForm.title = article.articleTitle
        this.postForm.content_short = article.articleAbstract
        this.postForm.content = article.articleContent
        this.postForm.display_time = article.displayTime
        this.postForm.author = article.authorName

        this.postForm.image_uri = article.articleImage
        if (article.tagList != null) {
          this.dynamicTags = []
          for (var i = 0; i < article.tagList.length; i++) {
            this.dynamicTags.push(article.tagList[i].tagName)
          }
        }
        if (article.skuList != null) {
          this.postForm.skuList = []
          for (var j = 0; j < article.skuList.length; j++) {
            this.postForm.skuList.push(article.skuList[j].skuName)
          }
        }
        if (article.designerList != null) {
          this.postForm.designerList = []
          for (var k = 0; k < article.designerList.length; k++) {
            this.postForm.designerList.push(article.designerList[k].userName)
          }
        }

        // Set tagsview title
        this.setTagsViewTitle()
      }).catch(err => {
        console.log(err)
      })
    },
    setTagsViewTitle() {
      const title = this.lang === 'zh' ? '编辑文章' : 'Edit Article'
      const route = Object.assign({}, this.tempRoute, { title: `${title}-${this.postForm.id}` })
      this.$store.dispatch('updateVisitedView', route)
    },
    submitForm() {
      this.postForm.display_time = parseInt(this.postForm.display_time / 1000)
      this.temp.articleContent = this.postForm.content
      this.temp.status = 'published'
      this.temp.articleAbstract = this.postForm.content_short
      this.temp.source_uri = this.postForm.source_uri
      this.temp.articleImage = this.postForm.image_uri
      this.temp.imageType = this.postForm.imageType
      this.temp.designerList = this.postForm.designerList
      this.temp.skuList = this.postForm.skuList
      this.temp.displayTime = this.postForm.display_time
      this.temp.id = this.postForm.id
      this.temp.articleTitle = this.postForm.title
      this.temp.platforms = this.postForm.platforms
      this.temp.isCommentEnabled = !this.postForm.comment_disabled
      this.temp.importance = this.postForm.importance
      this.temp.userId = this.postForm.author
      this.temp.tagList = this.dynamicTags

      this.$refs.postForm.validate(valid => {
        var that = this
        if (valid) {
          this.loading = true
          articleApi.createArticle(that.temp).then((res) => {
            this.temp.articleId = res.data.articleId // 后台传回来新增记录的id
            this.$notify({
              title: '成功',
              message: '发布文章成功',
              type: 'success',
              duration: 2000
            })
            this.postForm.status = 'published'
            this.loading = false

            // 跳转到list页面
            this.$router.push({
              path: '/blog/list'
            })
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    draftForm() {
      if (this.postForm.content.length === 0 || this.postForm.title.length === 0) {
        this.$message({
          message: '请填写必要的标题和内容',
          type: 'warning'
        })
        return
      }
      this.$message({
        message: '保存成功',
        type: 'success',
        showClose: true,
        duration: 1000
      })
      this.postForm.status = 'draft'
    },
    getRemoteUserList(query) {
      userApi.userSearch(query).then(res => {
        if (!res.data.userList) return
        this.userListOptions = res.data.userList
      })
    },
    getRemoteSKUList(query) {
      if (!query || query.replace(/(^s*)|(s*$)/g, '').length === 0) return // 为空则不做任何事情
      skuApi.skuSearch(query).then(res => {
        if (!res.data.skuList) return
        this.skuListOptions = res.data.skuList
      })
    },

    // Tag 标签
    handleClose(tag) {
      this.dynamicTags.splice(this.dynamicTags.indexOf(tag), 1)
    },

    showInput() {
      this.inputVisible = true;
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },

    handleInputConfirm() {
      const inputValue = this.inputValue
      if (inputValue) {
        this.dynamicTags.push(inputValue)
      }
      this.inputVisible = false
      this.inputValue = ''
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import "../../../../src/styles/mixin.scss";
.createPost-container {
  position: relative;
  .createPost-main-container {
    padding: 40px 45px 20px 50px;
    .postInfo-container {
      position: relative;
      @include clearfix;
      margin-top: 5px;
      margin-bottom: 10px;
      .postInfo-container-item {
        float: left;
      }
    }
    .editor-container {
      min-height: 500px;
      margin: 0 0 30px;
      .editor-upload-btn-container {
        text-align: right;
        margin-right: 10px;
        .editor-upload-btn {
          display: inline-block;
        }
      }
    }
  }
  .word-counter {
    width: 40px;
    position: absolute;
    right: -10px;
    top: 0px;
  }

  .el-tag + .el-tag {
    margin-left: 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
}
</style>
