import Vue from 'vue'
import Router from 'vue-router'
const _import = require('./_import_' + process.env.NODE_ENV)
// in development-env not use lazy-loading, because lazy-loading too many pages will cause webpack hot update too slow. so only in production use lazy-loading;
// detail: https://panjiachen.github.io/vue-element-admin-site/#/lazy-loading

Vue.use(Router)

/* Layout */
import Layout from '../views/layout/Layout'

/** note: submenu only apppear when children.length>=1
*   detail see  https://panjiachen.github.io/vue-element-admin-site/#/router-and-nav?id=sidebar
**/

/**
* hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
* alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
*                                if not set alwaysShow, only more than one route under the children
*                                it will becomes nested mode, otherwise not show the root menu
* redirect: noredirect           if `redirect:noredirect` will no redirct in the breadcrumb
* name:'router-name'             the name is used by <keep-alive> (must set!!!)
* meta : {
    roles: ['admin','editor']     will control the page roles (you can set multiple roles)
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
    noCache: true                if true ,the page will no be cached(default is false)
  }
**/
export const constantRouterMap = [
  { path: '/login', component: _import('login/index'), hidden: true },
  { path: '/authredirect', component: _import('login/authredirect'), hidden: true },
  { path: '/404', component: _import('errorPage/404'), hidden: true },
  { path: '/401', component: _import('errorPage/401'), hidden: true },
  {
    path: '',
    component: Layout,
    redirect: 'dashboard',
    children: [{
      path: 'dashboard',
      component: _import('dashboard/index'),
      name: 'dashboard',
      meta: { title: '首页', icon: 'dashboard', noCache: true }
    }]
  },
]

export default new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})

export const asyncRouterMap = [

  {
    path: '/system',
    component: Layout,
    meta: { perm:'m:sys', title: '系统', icon: 'chart' },
    children: [
      {
        path: 'user_manage',
        name: 'user_manage',
        component: _import('_system/user/index'),
        meta: { perm: 'm:sys:user', title: '用户管理', icon: 'chart', noCache: true }
      },
      {
        path: 'role_manage',
        name: 'role_manage',
        component: _import('_system/role/index'),
        meta: { perm: 'm:sys:role', title: '角色管理', icon: 'chart', noCache: true },
      },
      {
        hidden: true,
        path: 'role_manage/:roleId/assign_perm',
        name: 'role_manage_assign_perm',
        component: _import('_system/role/assign_perm'),
        meta: { hiddenTag: true , title: '角色授权'},
      },
      {
        path: 'perm_manage',
        name: 'perm_manage',
        component: _import('_system/perm/index'),
        meta: { perm: 'm:sys:perm', title: '权限管理', icon: 'chart', noCache: true }

      },
    ]
  },
  {
    path: '/mengya',
    name: 'mengya',
    component: Layout,
    meta: {
      title: '蒙芽产品',
      icon: 'example'
    },
    children: [
      {
        path: '/mengya/banner',
        name: 'Banner管理',
        component: _import('mengya/banner/index'),
        redirect: '/mengya/banner/list',
        meta: {
          title: 'Banner管理',
          icon: 'table'
        },
        children: [
          {
            path: 'addBanner',
            name: '创建Banner',
            component: _import('mengya/banner/addBanner'),
            meta: {
              title: '创建Banner',
              icon: 'table'
            },
          },
          {
            path: 'list',
            name: 'Banner list',
            component: _import('mengya/banner/list'),
            meta: {
              title: 'Banner列表',
              icon: 'table'
            }
          },
          {
            path: 'editBanner/:bannerId(\\w+)',
            component: _import('mengya/banner/editBanner'),
            name: '编辑Banner',
            meta: { title: '编辑Banner'},
            hidden: true
          }
        ]
      },
      {
        path: '/mengya/course',
        name: 'course管理',
        component: _import('mengya/course/index'),
        redirect: '/mengya/course/list',
        meta: {
          title: 'course管理',
          icon: 'table'
        },
        children: [
          {
            path: 'addCourse',
            name: '创建Course',
            component: _import('mengya/course/addCourse'),
            meta: {
              title: '创建Course',
              icon: 'table'
            }
          },
          {
            path: 'list',
            name: 'Course list',
            component: _import('mengya/course/list'),
            meta: {
              title: 'Course列表',
              icon: 'table'
            }
          },
          {
            path: 'editCourse/:id(\\w+)',
            component: _import('mengya/course/editCourse'),
            name: '编辑Course',
            meta: { title: '编辑Course' },
            hidden: true
          }
        ]
      },
      {
        path: '/mengya/grade',
        name: 'grade管理',
        component: _import('mengya/grade/index'),
        redirect: '/mengya/grade/list',
        meta: {
          title: 'grade管理',
          icon: 'table'
        },
        children: [
          {
            path: 'addGrade',
            name: '创建grade',
            component: _import('mengya/grade/addGrade'),
            meta: {
              title: '创建grade',
              icon: 'table'
            },
          },
          {
            path: 'list',
            name: 'grade list',
            component: _import('mengya/grade/list'),
            meta: {
              title: 'grade列表',
              icon: 'table'
            }
          },
          {
            path: 'editGrade/:id(\\w+)',
            component: _import('mengya/grade/editGrade'),
            name: '编辑Grade',
            meta: { title: '编辑Grade'},
            hidden: true
          }
        ]
      },
      {
        path: '/mengya/disaccount',
        name: '优惠折扣管理',
        component: _import('mengya/disaccount/index'),
        redirect: '/mengya/disaccount/list',
        meta: {
          title: '优惠折扣管理',
          icon: 'table'
        },
        children: [
          {
            path: 'addDisaccount',
            name: '创建disaccount',
            component: _import('mengya/disaccount/addDisaccount'),
            meta: {
              title: '创建disaccount',
              icon: 'table'
            },
          },
          {
            path: 'list',
            name: 'disaccount list',
            component: _import('mengya/disaccount/list'),
            meta: {
              title: 'disaccount列表',
              icon: 'table'
            }
          },
          {
            path: 'editDisaccount/:id(\\w+)',
            component: _import('mengya/disaccount/editDisaccount'),
            name: '编辑优惠',
            meta: { title: '编辑优惠'},
            hidden: true
          }
        ]
      }
    ]
  },
  {
    path: '/menu1',
    name: 'menu1',
    component: Layout,
    redirect: '/menu1/menu1_1',
    meta: {
      perm: 'm:order',
      title: '订单管理',
      icon: 'example'
    },
    children: [
      {
        path: 'menu1_1/index',
        name: '订单管理',
        component: _import('menu/menu1_1/index'),
        meta: {
          title: '订单管理',
          icon: 'table'
        },
      },
      {
        path: 'menu1_2/confirm_order',
        name: '订单确认',
        component: _import('menu/menu1_2/confirm_order'),
        // redirect: 'menu5_1/index',
        meta: {
          title: '订单确认',
          icon: 'table'
        },
      },
      {
        path: 'menu1_3/refund_order',
        name: '退单管理',
        component: _import('menu/menu1_3/refund_order'),
        // redirect: 'menu5_1/index',
        meta: {
          title: '退单管理',
          icon: 'table'
        }
      }
    ]
  },
  {
    path: '/menu2',
    component: Layout,
    meta: {
      perm: 'm:customer',
      title: 'UserManage',
      icon: 'chart'
    },
    hidden: true,
    children: [
      {
        path: '/menu2/menu2_1',
        name: '设计师管理',
        component: _import('menu/menu2_1/index'),
        redirect: '/menu2/menu2_1/list',
        meta: {
          title: '设计师管理',
          icon: 'table'
        },
        children: [
          {
            path: 'addUser',
            name: '创建设计师',
            component: _import('menu/menu2_1/addUser'),
            meta: {
              title: '创建设计师',
              icon: 'table'
            }
          },
          {
            path: 'list',
            name: '品牌 list',
            component: _import('menu/menu2_1/list'),
            meta: {
              title: '设计师列表',
              icon: 'table'
            }
          },
          {
            path: 'editUser/:userId(\\w+)',
            component: _import('menu/menu2_1/editUser'),
            name: '编辑设计师',
            meta: { title: '编辑设计师' },
            hidden: true
          }
        ]
      },
      {
        path: 'menu2_2/index',
        name: '用户角色管理',
        component: _import('menu/menu2_2/index'),
        meta: {
          title: '用户角色管理',
          icon: 'table'
        }
      }
    ]
  },

  {
    path: '/blog',
    component: Layout,
    redirect: '/blog/list',
    name: '博客管理',
    meta: {
      title: '博客管理',
      icon: 'example'
    },
    hidden: true,
    children: [
      {
        path: 'create',
        component: () => import('@/views/blog/create'),
        name: '创建博客',
        meta: { title: '创建博客', icon: 'edit' }
      },
      {
        path: 'edit/:id(\\d+)',
        component: () => import('@/views/blog/edit'),
        name: '编辑博客',
        meta: { title: '编辑博客', noCache: true },
        hidden: true
      },
      {
        path: 'list',
        component: () => import('@/views/blog/list'),
        name: '博客列表',
        meta: { title: '博客列表', icon: 'list' }
      }
    ]
  },

  {
    path: '/menu3',
    component: Layout,
    meta: {
      perm: 'm:storyimage',
      title: 'StoryImage',
      icon: 'chart'
    },
    hidden: true,
    children: [
      {
        path: '/menu3/menu3_1',
        name: 'StoryImage管理',
        redirect: '/menu3/menu3_1/list',
        component: _import('menu/menu3_1/index'),
        meta: {
          perm: 'm:storyimage:storyimage',
          title: 'StoryImage管理',
          icon: 'table'
        },
        children: [
          {
            path: 'addStoryImage',
            name: '创建SKU',
            component: _import('menu/menu3_1/addStoryImage'),
            meta: {
              // perm: 'm:menu3:1',
              title: '创建场景图',
              icon: 'table'
            },
          },
          {
            path: 'list',
            name: 'story image list',
            component: _import('menu/menu3_1/list'),
            meta: {
              // perm: 'm:menu3:1',
              title: '场景图列表',
              icon: 'table'
            }
          },
          {
            path: 'editStoryImage/:storyImageId(\\w+)',
            component: _import('menu/menu3_1/editStoryImage'),
            name: '编辑场景图',
            meta: { title: '编辑场景图' },
            hidden: true
          }
        ]
      },
      {
        path: '/menu3/menu3_2',
        name: 'Project管理',
        component: _import('menu/menu3_2/index'),
        redirect: '/menu3/menu3_2/list',
        meta: {
          perm: 'm:storyimage:project',
          title: 'Project管理',
          icon: 'table'
        },
        children: [
          {
            path: 'addProject',
            name: '创建项目',
            component: _import('menu/menu3_2/addProject'),
            meta: {
              title: '创建项目',
              icon: 'table'
            },
          },
          {
            path: 'list',
            name: 'project image list',
            component: _import('menu/menu3_2/list'),
            meta: {
              title: '项目列表',
              icon: 'table'
            }
          },
          {
            path: 'editProject/:projectId(\\w+)',
            component: _import('menu/menu3_2/editProject'),
            name: '编辑项目',
            meta: { title: '编辑项目' },
            hidden: true
          }
        ]
      },
      {
        path: 'menu3_4/index',
        name: '空间形式管理',
        component: _import('menu/menu3_4/index'),
        meta: {
          title: '空间形式管理',
          icon: 'table'
        }
      }
    ]
  },
  {
    path: '/menu5',
    name: 'menu5',
    component: Layout,
    // redirect: '/menu5/menu5_1',
    meta: {
      perm: 'm:sku',
      title: '产品管理',
      icon: 'example'
    },
    hidden: true,
    children: [
      {
        path: '/menu5/menu5_1',
        name: '品牌管理',
        component: _import('menu/menu5_1/index'),
        redirect: '/menu5/menu5_1/list',
        meta: {
          perm: 'm:sku:brand',
          title: '品牌管理',
          icon: 'table'
        },
        children: [
          {
            path: 'addBrand',
            name: '创建品牌Brand',
            component: _import('menu/menu5_1/addBrand'),
            meta: {
              // perm: 'm:menu5:1:add',
              title: '创建品牌Brand',
              icon: 'table'
            },
          },
          {
            path: 'list',
            name: '品牌 list',
            component: _import('menu/menu5_1/list'),
            meta: {
              // perm: 'm:menu5:1',
              title: '品牌列表',
              icon: 'table'
            }
          },
          {
            path: 'editBrand/:id(\\w+)',
            component: _import('menu/menu5_1/editBrand'),
            name: '编辑brnad',
            meta: { title: '编辑brand'},
            hidden: true
          }
        ]
      },
      {
        path: 'menu5_2/index',
        name: '分类管理',
        component: _import('menu/menu5_2/index'),
        // redirect: 'menu5_1/index',
        meta: {
          perm: 'm:sku:category',
          title: '分类管理',
          icon: 'table'
        },
      },
      {
        path: 'menu5_3/index',
        name: 'attr manager',
        component: _import('menu/menu5_3/index'),
        // redirect: 'menu5_1/index',
        meta: {
          perm: 'm:sku:attr',
          title: '属性管理',
          icon: 'table'
        },
      },

      {
        path: '/menu5/menu5_4',
        name: 'SPU Manager',
        // component: Layout,
        redirect: '/menu5/menu5_4/list',
        component: _import('menu/menu5_4/index'),
        // component: _import('menu/menu5_4/index'),
        // redirect: '/menu5/menu5_4/index',
        meta: {
          perm: 'm:sku:spu',
          title: 'SPU管理',
          icon: 'table'
        },
        children: [
          {
            path: 'addSpu',
            name: 'add spu',
            component: _import('menu/menu5_4/addSpu'),
            // redirect: 'menu5_1/index',
            meta: {
              // perm: 'm:menu5:4',
              title: '创建spu',
              icon: 'table'
            },
            // hidden: true
          },
          {
            path: 'list',
            name: 'SPU list',
            component: _import('menu/menu5_4/list'),
            // redirect: 'menu5_4/index',
            meta: {
              // perm: 'm:menu5:4',
              title: 'SPU列表',
              icon: 'table'
            }
          },
          {
            path: 'edit/:spuCode(\\w+)',
            component: _import('menu/menu5_4/edit'),
            name: '编辑spu',
            meta: { title: '编辑spu', noCache: true },
            hidden: true
          },
        ]
      },
      {
        path: '/menu5/menu5_5',
        name: 'SKU管理',
        // component: Layout,
        redirect: '/menu5/menu5_5/list',
        component: _import('menu/menu5_5/index'),
        // component: _import('menu/menu5_4/index'),
        // redirect: '/menu5/menu5_4/index',
        meta: {
          perm: 'm:sku:sku',
          title: 'SKU管理',
          icon: 'table'
        },
        children: [
          {
            path: 'addSku',
            name: '创建SKU',
            component: _import('menu/menu5_5/addSku'),
            // redirect: 'menu5_1/index',
            meta: {
              // perm: 'm:menu5:5',
              title: '创建sku',
              icon: 'table'
            },
            // hidden: true
          },
          {
            path: 'list',
            name: 'SKU list',
            component: _import('menu/menu5_5/list'),
            // redirect: 'menu5_4/index',
            meta: {
              // perm: 'm:menu5:5',
              title: 'SKU列表',
              icon: 'table'
            }
          },
          {
            path: 'edit/:skuNo(\\w+)',
            component: _import('menu/menu5_5/edit'),
            name: '编辑sku',
            meta: { title: '编辑sku', noCache: true },
            hidden: true
          }
        ]
      },
      {
        path: '/menu5/menu5_6',
        name: 'SKU主题管理',
        // component: Layout,
        redirect: '/menu5/menu5_6/list',
        component: _import('menu/menu5_6/index'),
        // component: _import('menu/menu5_4/index'),
        // redirect: '/menu5/menu5_4/index',
        meta: {
          perm: 'm:sku:theme',
          title: 'SKU主题管理',
          icon: 'table'
        },
        children: [
          {
            path: 'addTheme',
            name: '创建Theme',
            component: _import('menu/menu5_6/addTheme'),
            // redirect: 'menu5_1/index',
            meta: {
              // perm: 'm:menu5:5',
              title: '创建theme',
              icon: 'table'
            },
            // hidden: true
          },
          {
            path: 'list',
            name: 'Theme list',
            component: _import('menu/menu5_6/list'),
            // redirect: 'menu5_4/index',
            meta: {
              // perm: 'm:menu5:5',
              title: 'Theme列表',
              icon: 'table'
            }
          },
          {
            path: 'edit/:id(\\w+)',
            component: _import('menu/menu5_6/edit'),
            name: '编辑theme',
            meta: { title: '编辑theme', noCache: true },
            hidden: true
          }
        ]
      }

    ]
  },

  { path: '*', redirect: '/404', hidden: true }
]
