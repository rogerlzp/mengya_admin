/**
 * “产品管理”相关接口
 */
import request from '@/utils/request'

export default {

  addBanner(data) {
    return request({
      url: '/adminBanner/add',
      method: 'post',
      data
    })
  },
  updateBanner(data) {
    return request({
      url: '/adminBanner/update',
      method: 'post',
      data
    })
  },
  // banner
  queryBanner(queryParam, pageParam) {
    return request({
      url: '/adminBanner/query',
      method: 'post',
      data: {
        ...queryParam,
        current: pageParam.current,
        size: pageParam.size
      }
    })
  },
  // 查询Banner
  queryBannerById(bannerId) {
    return request({
      url: '/adminBanner/detail',
      method: 'get',
      params: { 'bannerId': bannerId }
    })
  },
  // 删除 Banner
  deleteBannerById(bannerId) {
    return request({
      url: '/adminBanner/deleteBanner',
      method: 'post',
      data: {
        bannerId: bannerId
      }
    })
  },

  // 创建Course
  addCourse(data) {
    return request({
      url: '/adminCourse/addCourse',
      method: 'post',
      data
    })
  },
  updateCourse(data) {
    return request({
      url: '/adminCourse/updateCourse',
      method: 'post',
      data
    })
  },
  // 删除 Theme Sku
  deleteCourseById(courseId) {
    return request({
      url: '/adminCourse/deleteCourse',
      method: 'post',
      data: {
        courseId: courseId
      }
    })
  },

  // 查询列表
  queryCourse(queryParam, pageParam) {
    return request({
      url: '/adminCourse/queryCourse',
      method: 'post',
      data: {
        ...queryParam,
        current: pageParam.current,
        size: pageParam.size
      }
    })
  },
  // 查询详情
  queryCourseById(courseId) {
    return request({
      url: '/adminCourse/detailCourse',
      method: 'get',
      params: { 'courseId': courseId }
    })
  },

  // 创建Grade
  addGrade(data) {
    return request({
      url: '/adminGrade/addGrade',
      method: 'post',
      data
    })
  },
  updateGrade(data) {
    return request({
      url: '/adminGrade/updateGrade',
      method: 'post',
      data
    })
  },
  // 删除 Theme Sku
  deleteGradeById(gradeId) {
    return request({
      url: '/adminGrade/deleteGrade',
      method: 'post',
      data: {
        gradeId: gradeId
      }
    })
  },

  // 查询所有的
  queryGrade(queryParam, pageParam) {
    return request({
      url: '/adminGrade/queryGrade',
      method: 'post',
      data: {
        ...queryParam,
        current: pageParam.current,
        size: pageParam.size
      }
    })
  },
  // 查询详情
  queryGradeById(gradeId) {
    return request({
      url: '/adminGrade/detailGrade',
      method: 'get',
      params: { 'gradeId': gradeId }
    })
  },

  // 搜索用户，非系统用户
  gradeSearch() {
    return request({
      url: '/adminGrade/search',
      method: 'get'
    })
  },

  // 创建Grade
  addGradeDisaccount(data) {
    return request({
      url: '/adminGrade/addDisaccount',
      method: 'post',
      data
    })
  },
  updateGradeDisaccount(data) {
    return request({
      url: '/adminGrade/updateDisaccount',
      method: 'post',
      data
    })
  },
  // 删除
  deleteGradeDisaccountById(disaccountId) {
    return request({
      url: '/adminGrade/deleteDisaccount',
      method: 'post',
      data: {
        disaccountId: disaccountId
      }
    })
  },

  // 查询所有的
  queryGradeDisaccount(queryParam, pageParam) {
    return request({
      url: '/adminGrade/queryDisaccount',
      method: 'post',
      data: {
        ...queryParam,
        current: pageParam.current,
        size: pageParam.size
      }
    })
  },
  // 查询详情
  queryGradeDisaccountById(disaccountId) {
    return request({
      url: '/adminGrade/detailDisaccount',
      method: 'get',
      params: { 'disaccountId': disaccountId }
    })
  }

}

