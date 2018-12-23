/**
 * “用户管理”相关接口
 */
import request from '@/utils/request'

export default {

  queryStaff(queryParam, pageParam) {
    return request({
      url: '/sys_user/query',
      method: 'post',
      data: {
        ...queryParam,
        current: pageParam.current,
        size: pageParam.size
      }
    })
  },

  updateStaff(data) {
    return request({
      url: '/sys_user/info',
      method: 'patch',
      data
    })
  },

  updatePwd(data) {
    return request({
      url: '/sys_user/pwd',
      method: 'patch',
      data
    })
  },

  addStaff(data) {
    return request({
      url: '/sys_user',
      method: 'post',
      data
    })
  },

  deleteStaff(data) {
    return request({
      url: '/sys_user',
      method: 'delete',
      data
    })
  },

  /**
   * 更新员工的角色
   * @param perm
   */
  updateStaffRoles(data) {
    return request({
      url: '/sys_user/role',
      method: 'patch',
      data
    })
  },

  // 搜索用户，非系统用户
  userSearch(name) {
    return request({
      url: '/adminUser/search',
      method: 'get',
      params: { 'username': name }
    })
  },
  // 搜索用户，非系统用户
  userDetail(userId) {
    return request({
      url: '/adminUser/detail',
      method: 'get',
      params: { 'userId': userId }
    })
  },
  // 更新用户信息
  updateUser(data) {
    return request({
      url: '/adminUser/update',
      method: 'patch',
      data
    })
  }

}
