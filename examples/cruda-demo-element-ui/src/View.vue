<template>
    <el-dialog :title="getTitle()" :visible.sync="$crud.formStatus > 2" width="30%">
      <!-- 表单通常要放在单独组件中，否则容易引起非必要重绘导致UI卡顿 -->
      <el-form ref="form" crud :rules="rules" :model="$crud.form" label-position="top" label-width="80px">
        <el-form-item label="姓名" prop="uname">
          {{ $crud.form.uname }}
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          {{ $crud.form.email }}
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="$crud.cancel()">取 消</el-button>
      </span>
    </el-dialog>
</template>

<script>
import CRUD,{onHook,lookUpCrud} from 'cruda-element-ui'

export default {
  // Activate Cruda
  data() {
    return {
      rules: {
        uname: [{ required: true, trigger: "blur" }],
        email: [{ required: true, trigger: "blur" }],
      },
    };
  },
  beforeCreate(){
    this.$crud = lookUpCrud(this)
  },
  mounted() {
    onHook(this, CRUD.HOOK.AFTER_DETAILS,(crud,rs)=>{
      console.log('View',rs.data,Date.now())
    })
  },
  methods: {
    getTitle() {
      if (this.$crud.formStatus == 1)
        return "新增";
      if (this.$crud.formStatus == 2)
        return "编辑";
    },
  }
};
</script>

<style>
body {
  position: absolute;
  height: 100%;
  width: 100%;
  overflow: hidden;
  margin: 0;
}

#app {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0 1rem;
}

#app header,
#app footer {
  padding: 0.5rem 0;
}

#app main {
  flex: 1;
  overflow: hidden;
}
</style>
