<template>
  <div id="app">
    <header>
      <el-input clearable placeholder="文本模糊查询" style="width: 200px" v-model="$crud.query.keyword"
        @keydown.enter.native="$crud.reload()" @clear="$crud.reload()"></el-input>
      <el-button @click="$crud.reload()">查询</el-button>
      <el-button type="primary" @click="$crud.toAdd()">新增</el-button>
    </header>
    <main>
      <el-table height="100%" crud :data="$crud.table.data" style="width: 100%" @row-click="(row)=>$crud.toView(row)">
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="uname" label="姓名"></el-table-column>
        <el-table-column prop="ip" label="ip"></el-table-column>
        <el-table-column prop="domain" label="域名"></el-table-column>
        <el-table-column align="right">
          <template slot-scope="scope">
            <el-button size="mini" @click.stop @click="$crud.toEdit(scope.row)">Edit</el-button>
            <el-button size="mini" type="danger" @click.stop @click="$crud.toDelete(scope.row)">Delete</el-button>
          </template>
        </el-table-column>
      </el-table>
    </main>
    <footer>
      <CrudaPagination></CrudaPagination>
    </footer>

    <el-dialog :title="getTitle()" :visible.sync="$crud.formStatus > 0 && $crud.formStatus < 3" width="30%">
      <!-- 表单通常要放在单独组件中，否则容易引起非必要重绘导致UI卡顿 -->
      <el-form ref="form" crud :rules="rules" :model="$crud.form" label-position="top" label-width="80px">
        <el-form-item label="姓名" prop="uname">
          <el-input v-model="$crud.form.uname"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="$crud.form.email"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="$crud.cancel()">取 消</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
      </span>
    </el-dialog>

    <ViewV />
  </div>
</template>

<script>
import CRUD,{onHook} from 'cruda-element-ui'
import CrudaPagination from './components/CrudaPagination.vue';
import ViewV from './View.vue';
import { clone } from 'myfx';

export default {
  components: { CrudaPagination, ViewV },
  // Activate Cruda
  crud: {url:"api/single",recoverable:true},
  data() {
    return {
      rules: {
        uname: [{ required: true, trigger: "blur" }],
        email: [{ required: true, trigger: "blur" }],
      },
    };
  },
  created(){
    //xApi hooks
    onHook(this,CRUD.HOOK.AFTER_LIVE,(crud,rs)=>{
      console.log('xApi-->',rs.data)
    })
    // onHook(this,CRUD.HOOK.BEFORE_LIVE,(crud,param,cancel)=>{
    //   cancel()
    // })
  },
  mounted() {
    this.$crud.reload();
    this.$crud.form = {
      uname: "12",
      email: "12"
    };
    window.xx = this.$crud
    this.$crud.toLive({x:1,y:2});
  },
  methods: {
    // Hook
    async [CRUD.HOOK.AFTER_DETAILS](crud, rs) {
      console.log('App',rs.data,Date.now());
      await new Promise((resolve) => setTimeout(resolve, 2000))
      console.log('App',rs.data,Date.now());
    },
    [CRUD.HOOK.BEFORE_SUBMIT](crud,cancel,filterForm,xx) {
      let f = clone(crud.form)
      f.xx = 23
      delete f.uname
      // filterForm(f)
    },
    getTitle() {
      if (this.$crud.formStatus == 1)
        return "新增";
      if (this.$crud.formStatus == 2)
        return "编辑";
    },
    submit(){
      try {
        // this.$crud.submit(this.$refs.form)
        this.$crud.submitAdd(this.$refs.form)
      } catch (error) {
        debugger
      }
      
    }
  },
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
