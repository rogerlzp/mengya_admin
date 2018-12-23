import request from '@/utils/request'

export function userSearch(name) {
  return request({
    url: '/adminUser/search',
    method: 'get',
    params: { name }
  })
}
