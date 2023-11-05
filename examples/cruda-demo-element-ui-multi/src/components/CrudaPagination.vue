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
    props:{
        crud:{
            type:String,
            required:true
        }
    },
    beforeCreate(){
        this.$crud = lookUpCrud(this,this.$options.propsData.crud)
    }
}
</script>