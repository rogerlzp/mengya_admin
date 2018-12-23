/**
 * “七牛”相关接口
 */
import request from '@/utils/request'

export default {

  getToken() {
    return request({
      url: '/qiniu/upToken',
      method: 'get'
    })
  }
}
