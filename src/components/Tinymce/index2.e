<template>
  <div class="tinymce-container editor-container" :class="{fullscreen:fullscreen}">
    <textarea class="tinymce-textarea" :id="tinymceId"></textarea>
    <div class="editor-custom-btn-container">
      <editorImage color="#1890ff" class="editor-upload-btn" @successCBK="imageSuccessCBK"></editorImage>
    </div>
  </div>
</template>

<script>
import editorImage from './components/editorImage'
import plugins from './plugins'
import toolbar from './toolbar'

export default {
  name: 'tinymce123',
  components: { editorImage },
  props: {
    id: {
      type: String
    },
    value: {
      type: String,
      default: ''
    },
    toolbar: {
      type: Array,
      required: false,
      default() {
        return []
      }
    },
    menubar: {
      default: 'file edit insert view format table'
    },
    height: {
      type: Number,
      required: false,
      default: 360
    }
  },
  data() {
    return {
      hasChange: false,
      hasInit: false,
      tinymceId: this.id || 'vue-tinymce-' + +new Date(),
      fullscreen: false
    }
  },
  watch: {
    value(val) {
      if (!this.hasChange && this.hasInit) {
        this.$nextTick(() => window.tinymce.get(this.tinymceId).setContent(val))
      }
    }
  },
  mounted() {
    this.initTinymce()
  },
  activated() {
    this.initTinymce()
  },
  deactivated() {
    this.destroyTinymce()
  },
  methods: {
    initTinymce() {
      const _this = this
      window.tinymce.init({
        selector: `#${this.tinymceId}`,
        // selector: 'textarea',
        // height: 500,
        theme: 'modern',
        plugins: 'print preview code fullpage powerpaste searchreplace autolink directionality ' +
        'advcode visualblocks visualchars fullscreen image link media template codesample table ' +
        'charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists textcolor' +
        ' wordcount tinymcespellchecker a11ychecker imagetools mediaembed  linkchecker contextmenu  textpattern help',
        toolbar: 'formatselect code | bold italic strikethrough forecolor backcolor | link| alignleft aligncenter alignright alignjustify | numlist bullist outdent indent  | removeformat',
        // image_advtab: true,

        height: this.height,
        // body_class: 'panel-body ',
        // object_resizing: false,
        // toolbar: this.toolbar.length > 0 ? this.toolbar : toolbar,
         menubar: this.menubar,
        // plugins: plugins,
        // convert_fonts_to_spans: true,
        // extended_valid_elements: 'span',
        // end_container_on_empty_block: true,
        // powerpaste_word_import: 'clean',
        // code_dialog_height: 450,
        // code_dialog_width: 1000,
        // advlist_bullet_styles: 'square',
        // advlist_number_styles: 'default',
        // imagetools_cors_hosts: ['www.tinymce.com', 'codepen.io'],
        // default_link_target: '_blank',
        // link_title: false,
    //     fontsize_formats: '10px 11px 12px 14px 16px 18px 20px 24px 26px 28px 30px 36px',
    //     // FontSelect
    //     font_formats: `
    // 微软雅黑=微软雅黑;
    // 宋体=宋体;
    // 黑体=黑体;
    // 仿宋=仿宋;
    // 楷体=楷体;
    // 隶书=隶书;
    // 幼圆=幼圆;
    // Andale Mono=andale mono,times;
    // Arial=arial, helvetica,
    // sans-serif;
    // Arial Black=arial black, avant garde;
    // Book Antiqua=book antiqua,palatino;
    // Comic Sans MS=comic sans ms,sans-serif;
    // Courier New=courier new,courier;
    // Georgia=georgia,palatino;
    // Helvetica=helvetica;
    // Impact=impact,chicago;
    // Symbol=symbol;
    // Tahoma=tahoma,arial,helvetica,sans-serif;
    // Terminal=terminal,monaco;
    // Times New Roman=times new roman,times;
    // Trebuchet MS=trebuchet ms,geneva;
    // Verdana=verdana,geneva;
    // Webdings=webdings;
    // Wingdings=wingdings,zapf dingbats`,
        init_instance_callback: editor => {
          if (_this.value) {
            editor.setContent(_this.value)
          }
          _this.hasInit = true
          editor.on('NodeChange Change KeyUp SetContent', () => {
            this.hasChange = true
            this.$emit('input', editor.getContent())
          })
        },
        setup(editor) {
          editor.on('FullscreenStateChanged', (e) => {
            _this.fullscreen = e.state
          })
        },
        // 在编辑器中启用字体和字体大小选择

      // 整合七牛上传
        // images_dataimg_filter(img) {
        //   setTimeout(() => {
        //     const $image = $(img);
        //     $image.removeAttr('width');
        //     $image.removeAttr('height');
        //     if ($image[0].height && $image[0].width) {
        //       $image.attr('data-wscntype', 'image');
        //       $image.attr('data-wscnh', $image[0].height);
        //       $image.attr('data-wscnw', $image[0].width);
        //       $image.addClass('wscnph');
        //     }
        //   }, 0);
        //   return img
        // },
        // images_upload_handler(blobInfo, success, failure, progress) {
        //   progress(0);
        //   const token = _this.$store.getters.token;
        //   getToken(token).then(response => {
        //     const url = response.data.qiniu_url;
        //     const formData = new FormData();
        //     formData.append('token', response.data.qiniu_token);
        //     formData.append('key', response.data.qiniu_key);
        //     formData.append('file', blobInfo.blob(), url);
        //     upload(formData).then(() => {
        //       success(url);
        //       progress(100);
        //     })
        //   }).catch(err => {
        //     failure('出现未知问题，刷新页面，或者联系程序员')
        //     console.log(err);
        //   });
        // },
      })
    },
    destroyTinymce() {
      if (window.tinymce.get(this.tinymceId)) {
        window.tinymce.get(this.tinymceId).destroy()
      }
    },
    setContent(value) {
      window.tinymce.get(this.tinymceId).setContent(value)
    },
    getContent() {
      window.tinymce.get(this.tinymceId).getContent()
    },
    imageSuccessCBK(arr) {
      const _this = this
      // 增加默认大小为200x200, 方便调整大小
      arr.forEach(v => {
        window.tinymce.get(_this.tinymceId).insertContent(`<img class="wscnph" style="width:200px;height:200px" src="${v.url}" >`)
      })
    }
  },
  destroyed() {
    this.destroyTinymce()
  }
}
</script>

<style scoped>
.tinymce-container {
  position: relative;
}
.tinymce-container>>>.mce-fullscreen {
  z-index: 10000;
}
.tinymce-textarea {
  visibility: hidden;
  z-index: -1;
}
.editor-custom-btn-container {
  position: absolute;
  right: 4px;
  top: 4px;
  /*z-index: 2005;*/
}
.fullscreen .editor-custom-btn-container {
  z-index: 10000;
  position: fixed;
}
.editor-upload-btn {
  display: inline-block;
}
</style>
