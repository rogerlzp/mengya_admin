/**
 * “storyImage”相关接口
 */
import request from '@/utils/request'

export default {

  // 获取所有的项目列表
  queryProjectList() {
    return request({
      url: '/adminProject/query',
      method: 'post',
      data: {
      }
    })
  },

  // 增加产品
  addProject(data) {
    return request({
      url: '/adminProject/add',
      method: 'post',
      data
    })
  },
  // 删除项目
  deleteProject(data) {
    return request({
      url: '/adminProject',
      method: 'delete',
      data
    })
  },

  // 删除项目中的设计师
  deleteProjectArtist(projectId, artistId) {
    return request({
      url: '/adminSPU/delProductArtist',
      method: 'post',
      data: {
        projectId: projectId,
        artistId: artistId
      }
    })
  },

  // 删除项目中的设计师
  deleteProjectImage(projectId, imageUrl) {
    return request({
      url: '/adminSPU/delProjectImage',
      method: 'post',
      data: {
        projectId: projectId,
        imageUrl: imageUrl
      }
    })
  },

  // 删除项目中的设计师
  deleteProjectCompany(projectId, companyId) {
    return request({
      url: '/adminSPU/delProjectCompany',
      method: 'post',
      data: {
        projectId: projectId,
        companyId: companyId
      }
    })
  },

  // 删除项目中的设计师
  deleteProjectSku(projectId, skuNo) {
    return request({
      url: '/adminSPU/delProjectSku',
      method: 'post',
      data: {
        projectId: projectId,
        skuNo: skuNo
      }
    })
  },

  deleteStoryImage(storyImageId) {
    return request({
      url: '/adminStoryImage/delStoryImage',
      method: 'post',
      data: {
        storyImageId: storyImageId
      }
    })
  },

  // 更新项目
  updateProject(data) {
    return request({
      url: '/adminProject',
      method: 'patch',
      data
    })
  },

  // 查询项目详细信息
  queryProjectById(projectId) {
    return request({
      url: '/adminProject/detail',
      method: 'get',
      params: { 'projectId': projectId }
    })
  },

  // 增加产品
  addStoryImage(data) {
    return request({
      url: '/adminStoryImage/add',
      method: 'post',
      data
    })
  },
  // 搜索storyimage
  queryStoryImageList(queryParam, pageParam) {
    return request({
      url: '/adminStoryImage/query',
      method: 'post',
      data: {
        ...queryParam,
        current: pageParam.current,
        size: pageParam.size
      }
    })
  },

  // 增加角色
  addUserRole(data) {
    return request({
      url: '/adminUser/addRole',
      method: 'post',
      data
    })
  },
  // 增加用户
  addUser(data) {
    return request({
      url: '/adminUser/addUser',
      method: 'post',
      data
    })
  },

  // 搜索role
  queryRoleList(queryParam, pageParam) {
    return request({
      url: '/adminUser/role/query',
      method: 'post',
      data: {
        ...queryParam,
        current: pageParam.current,
        size: pageParam.size
      }
    })
  },
  // 搜索user
  queryUserList(queryParam, pageParam) {
    return request({
      url: '/adminUser/user/query',
      method: 'post',
      data: {
        ...queryParam,
        current: pageParam.current,
        size: pageParam.size
      }
    })
  },


  // 获取所有的项目列表
  querySpaceList() {
    return request({
      url: '/adminSpace/list',
      method: 'post',
      data: {
      }
    })
  },
  // 获取所有的项目列表
  querySpace(queryParam, pageParam) {
    return request({
      url: '/adminSpace/query',
      method: 'post',
      data: {
      }
    })
  },

  // 增加产品
  addSpace(data) {
    return request({
      url: '/adminSpace/add',
      method: 'post',
      data
    })
  },
  // 删除项目
  deleteSpace(data) {
    return request({
      url: '/adminSpace',
      method: 'delete',
      data
    })
  },

  // 查询场景图
  queryStoryImageById(storyImageId) {
    return request({
      url: '/adminStoryImage/detail',
      method: 'get',
      params: { 'storyImageId': storyImageId }
    })
  },

  // 更新场景图
  updateStoryImage(data) {
    return request({
      url: '/adminStoryImage/update',
      method: 'patch',
      data
    })
  },

  // 删除场景图中的product
  deleteStoryImageProduct(storyImageProductId) {
    return request({
      url: '/adminStoryImage/deleteStoryImageProduct',
      method: 'post',
      data: {
        id: storyImageProductId
      }
    })
  }
}

