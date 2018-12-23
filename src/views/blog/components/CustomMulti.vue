<template>
  <div class="dropdown-wrap">
    <el-select class="dropdown-list" v-model="selectedValue" placeholder="选择开学课程期数">
      <el-option
        v-for="item in options"
        :key="item.plan_id"
        :class="{active: isActive(item)}"
        :label="item.plan_name"
        :value="item.plan_id">
        <el-checkbox
          v-if="isActive(item)"
          :label="item.plan_name"
          :disabled="isActive(item)"
          :checked="isActive(item)"
          @change="valueChange(item)">
        </el-checkbox>
        <div v-else v-text="item.plan_name" @click="selectItem(item)"></div>
      </el-option>
    </el-select>
  </div>
</template>

<script>
  export default {
    name: 'CustomMulti',
    props: {
      options: Array,
      selected: Array,
      selectedValue: null
    },

    mounted() {
      this.selectedItems = this.selected
    },

    watch: {
      selected: {
        handler(val) {
          this.selectedItems = val
        },
        deep: true
      }
    },
    methods: {
      // 选中
      selectItem(item) {
        // debugger
        const newArr = JSON.parse(JSON.stringify(this.selectedItems))
        const newItem = JSON.parse(JSON.stringify(item))
        newItem.type = 'primary'
        newItem.name = item.plan_name
        newItem.plan_id = item.plan_id
        newItem.version_id = item.version_id
        newArr.push(newItem)
        this.selectedItems = newArr
        this.$emit('valueChange', JSON.parse(JSON.stringify(newItem)), newArr)
      },
      // 取消选择
      valueChange(item) {
        this.$emit('del', item)
      },
      isActive(data) {
        return this.selectedItems.some(item => item.plan_id === data.plan_id)
      }
    }
  }
</script>

<style lang="scss" scoped>
  .active {
    display: block;
  }

  .cpt-dropdown-list {
    display: inline-block;

    .dropdown-link {
      color: #409eff;
      cursor: pointer;
    }
  }

  .dropdown-list {
    .el-select-dropdown {
      display: none !important;
    }
  }

  .el-dropdown-menu.cpt-dropdown-list-wrap {
    min-width: 188.09px;
    left: 345px !important;
  }

  // .dropdown-list {
  .el-select-dropdown__item.selected {
    background-color: rgba(#409eff, 0.1);
    color: #48576a;
  }

  .el-select-dropdown__item.selected.hover {
    //
    background-color: rgba(#409eff, 0.1);
    color: #48576a;
  }

  // }
</style>
