import request from '@/utils/request'

export default {
  fetchList(query) {
    return request({
      url: '/adminArticle/query',
      method: 'get',
      params: query
    })
  },
  fetchArticle(id) {
    return request({
      url: '/adminArticle/detail',
      method: 'get',
      params: { 'articleId': id }
    })
  },

  fetchPv(pv) {
    return request({
      url: '/adminArticle/pv',
      method: 'get',
      params: { pv }
    })
  },
  // 增加产品
  createArticle(data) {
    return request({
      url: '/adminArticle/add',
      method: 'post',
      data
    })
  },

  updateArticle(data) {
    return request({
      url: '/adminArticle/update',
      method: 'post',
      data
    })
  }
}
