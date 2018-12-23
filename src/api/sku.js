/**
 * “产品管理”相关接口
 */
import request from '@/utils/request'

export default {

  queryBrand(queryParam, pageParam) {
    return request({
      url: '/adminBrand/query',
      method: 'post',
      data: {
        ...queryParam,
        current: pageParam.current,
        size: pageParam.size
      }
    })
  },

  addBrand(data) {
    return request({
      url: '/adminBrand/add',
      method: 'post',
      data
    })
  },

  // 查询Brand
  queryBrandById(brandId) {
    return request({
      url: '/adminBrand/detail',
      method: 'get',
      params: { 'brandId': brandId }
    })
  },

  // 创建Theme
  addTheme(data) {
    return request({
      url: '/adminTheme/add',
      method: 'post',
      data
    })
  },
  updateTheme(data) {
    return request({
      url: '/adminTheme/update',
      method: 'post',
      data
    })
  },

  // 删除 Theme Sku
  deleteThemeSku(themeId, skuNo) {
    return request({
      url: '/adminTheme/deleteSku',
      method: 'post',
      data: {
        themeId: themeId,
        skuNo: skuNo
      }
    })
  },

  queryTheme(queryParam, pageParam) {
    return request({
      url: '/adminTheme/query',
      method: 'post',
      data: {
        ...queryParam,
        current: pageParam.current,
        size: pageParam.size
      }
    })
  },

  // 查询Theme detail
  queryThemeDetailById(themeId) {
    return request({
      url: '/adminTheme/detail',
      method: 'get',
      params: { 'id': themeId }
    })
  },



  queryCategory(queryParam, pageParam) {
    return request({
      url: '/adminCategory/query',
      method: 'post',
      data: {
        ...queryParam,
        current: pageParam.current,
        size: pageParam.size
      }
    })
  },

  addCategory(data) {
    return request({
      url: '/adminCategory/add',
      method: 'post',
      data
    })
  },

  queryAttr(queryParam, pageParam) {
    return request({
      url: '/adminAttr/query',
      method: 'post',
      data: {
        ...queryParam,
        current: pageParam.current,
        size: pageParam.size
      }
    })
  },

  queryAttrVal(attrId) {
    return request({
      url: '/adminAttr/queryAttrVal',
      method: 'post',
      data: {
        attrId: attrId
      }
    })
  },

  addAttr(data) {
    return request({
      url: '/adminAttr/add',
      method: 'post',
      data
    })
  },

  updateAttr(data) {
    return request({
      url: '/adminAttr/update',
      method: 'patch',
      data
    })
  },

  querySPU(queryParam, pageParam) {
    return request({
      url: '/adminSPU/query',
      method: 'post',
      data: {
        ...queryParam,
        current: pageParam.current,
        size: pageParam.size
      }
    })
  },

  /**
   * 根据订单状态查询结果
   * @param queryParam
   * @param pageParam
   */
  queryOrder(queryParam, pageParam) {
    return request({
      url: '/adminOrder/query',
      method: 'post',
      data: {
        ...queryParam,
        current: pageParam.current,
        size: pageParam.size
      }
    })
  },
  /**
   * 审核结果，同意、或者不同意
   * @param queryParam
   * @param pageParam
   */
  refundAgree(queryParam, pageParam) {
    return request({
      url: '/adminOrder/refundAudit',
      method: 'post',
      data: {
        ...queryParam
      }
    })
  },

  /**
   * 确认发货
   * @param queryParam
   * @param pageParam
   */
  orderSend(queryParam, pageParam) {
    return request({
      url: '/adminOrder/sendSku',
      method: 'post',
      data: {
        ...queryParam
      }
    })
  },

  addSPU(data) {
    return request({
      url: '/adminSPU/add',
      method: 'post',
      data
    })
  },

  querySKU(queryParam, pageParam) {
    return request({
      url: '/adminSKU/query',
      method: 'post',
      data: {
        ...queryParam,
        current: pageParam.current,
        size: pageParam.size
      }
    })
  },
  // 根据SpuCode 查询 sku
  querySKUBySpuCode(spuCode) {
    return request({
      url: '/adminSKU/getSKUBySpuCode',
      method: 'get',
      params: { 'spuCode': spuCode }
    })
  },
  // 根据SkuNo 查询 sku
  querySKUBySkuNo(skuNo) {
    return request({
      url: '/adminSKU/detail',
      method: 'get',
      params: { 'skuNo': skuNo }
    })
  },

  // 根据SKU名字查询 SKU
  skuSearch(skuName) {
    return request({
      url: '/adminSKU/search',
      method: 'get',
      params: { 'skuName': skuName }
    })
  },

  // 会员价格体系查询
  queryUserLevel() {
    return request({
      url: '/adminUser/queryUserLevel',
      method: 'get'
    })
  },

  addSKU(data) {
    return request({
      url: '/adminSKU/add',
      method: 'post',
      data
    })
  },

  updateSKU(data) {
    return request({
      url: '/adminSKU/update',
      method: 'post',
      data
    })
  },

  // 查询SPU
  querySPUBySpuCode(spuCode) {
    return request({
      url: '/adminSPU/list',
      method: 'get',
      params: { 'spuCode': spuCode }
    })
  },

  addUser(data) {
    return request({
      url: '/sys_user',
      method: 'post',
      data
    })
  },

  deleteSPU(data) {
    return request({
      url: '/adminSPU',
      method: 'delete',
      data
    })
  },

  // 更新项目
  updateBrand(data) {
    return request({
      url: '/adminBrand/update',
      method: 'patch',
      data
    })
  },

  // 删除Brand
  deleteBrand(data) {
    return request({
      url: '/adminBrand',
      method: 'delete',
      data
    })
  },
  // 删除SKU
  deleteSKU(data) {
    return request({
      url: '/adminSKU',
      method: 'delete',
      data
    })
  },

  // 更新SPU
  updateSPU(data) {
    return request({
      url: '/adminSPU/update',
      method: 'patch',
      data
    })
  },

  deleteAttrById(data) {
    return request({
      url: '/adminAttr',
      method: 'delete',
      data
    })
  },

  querySPUByBrandCategory(categoryCode, brandCode) {
    return request({
      url: '/adminSPU/queryByBC',
      method: 'post',
      data: {
        categoryCode: categoryCode,
        brandCode: brandCode
      }
    })
  },


  getAttrByCategory(categoryCode) {
    return request({
      url: '/adminAttr/getAttrByCategory',
      method: 'post',
      data: {
        categoryCode: categoryCode
      }
    })
  },

  deleteAttrByAttrSpu(attrId, spuCode) {
    return request({
      url: '/adminSPU/deleteAttr',
      method: 'post',
      data: {
        attrId: attrId,
        spuCode: spuCode
      }
    })
  },

  // 删除一个spu对应的sub spu
  deleteSubSpu(spuCode, subSpuCode) {
    return request({
      url: '/adminSPU/deleteSubSpu',
      method: 'post',
      data: {
        spuCode: spuCode,
        subSpuCode: subSpuCode
      }
    })
  },



  deleteAttrByAttrId(attrId) {
    return request({
      url: '/adminAttr/deleteAttr',
      method: 'post',
      data: {
        attrId: attrId
      }
    })
  },

  // 删除SPU中的设计师
  deleteSpuDesigner(spuCode, designerId) {
    return request({
      url: '/adminSPU/deleteDesigner',
      method: 'post',
      data: {
        spuCode: spuCode,
        designerId: designerId
      }
    })
  },


}

