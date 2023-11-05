<template>
    <el-pagination
        :page-size.sync="$crud.pagination.pageSize"
        :total="$crud.pagination.total"
        :current-page.sync="$crud.pagination.currentPage"
        @current-change="$crud.toQuery()"
        @size-change="$crud.toQuery()"
      />
</template>
<script>
import {lookUpCrud} from 'cruda-element-ui'
export default {
    beforeCreate(){
        this.$crud = lookUpCrud(this)
    }
}
</script>