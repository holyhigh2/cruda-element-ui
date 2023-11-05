<template>
  <div id="app">
    <section class="left" style="flex: 1;display: flex;flex-direction: column;">
    <header>
      <el-input clearable placeholder="文本模糊查询" style="width: 200px" v-model="$cruds.single.query.keyword"
        @keydown.enter.native="$cruds.single.reload()" @clear="$cruds.single.reload()"></el-input>
      <el-button @click="$cruds.single.reload()">查询</el-button>
      <el-button type="primary" @click="$cruds.single.toAdd()">新增</el-button>
    </header>
    <main>
      <el-table height="100%" crud :data="$cruds.single.table.data" style="width: 100%" @row-click="(row)=>$cruds.single.toView(row)">
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="uname" label="姓名"></el-table-column>
        <el-table-column prop="ip" label="ip"></el-table-column>
        <el-table-column prop="domain" label="域名"></el-table-column>
        <el-table-column align="right">
          <template slot-scope="scope">
            <el-button size="mini" @click.stop @click="$cruds.single.toEdit(scope.row)">
              <div v-if="!!$cruds.single.snapshots[scope.row.id]" style="display: inline-block;background-color: gold;width: 8px;height: 8px;overflow: hidden;border-radius: 8px;border: 1px solid;"></div>
              Edit
            </el-button>
            <el-button size="mini" type="danger" @click.stop @click="$cruds.single.toDelete(scope.row)">Delete</el-button>
          </template>
        </el-table-column>
      </el-table>
    </main>
    <footer>
      <CrudaPagination crud="single"></CrudaPagination>
    </footer>
  </section>
  <hr style="    width: 100%;"/>
  <section class="right" style="flex: 1;display: flex;flex-direction: column;">
    <header>
      <el-input clearable placeholder="文本模糊查询" style="width: 200px" v-model="$cruds.multiple.query.keyword"
        @keydown.enter.native="$cruds.multiple.reload()" @clear="$cruds.multiple.reload()"></el-input>
      <el-button @click="$cruds.multiple.reload()">查询</el-button>
      <el-button type="primary" @click="$cruds.multiple.toAdd()">新增</el-button>
    </header>
    <main>
      <el-table height="100%" crud :data="$cruds.multiple.table.data" style="width: 100%" @row-click="(row)=>$cruds.multiple.toView(row)">
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="uname" label="姓名"></el-table-column>
        <el-table-column prop="ip" label="ip"></el-table-column>
        <el-table-column prop="domain" label="域名"></el-table-column>
        <el-table-column align="right">
          <template slot-scope="scope">
            <el-button size="mini" @click.stop @click="$cruds.multiple.toEdit(scope.row)">
              <div v-if="!!$cruds.multiple.snapshots[scope.row.id]" style="display: inline-block;background-color: gold;width: 8px;height: 8px;overflow: hidden;border-radius: 8px;border: 1px solid;"></div>
              Edit
            </el-button>
            <el-button size="mini" type="danger" @click.stop @click="$cruds.multiple.toDelete(scope.row)">Delete</el-button>
          </template>
        </el-table-column>
      </el-table>
    </main>
    <footer>
      <CrudaPagination crud="multiple"></CrudaPagination>
    </footer>
  </section>

  <el-dialog :title="getTitle($cruds.single)" :visible.sync="$cruds.single.formStatus > 0 && $cruds.single.formStatus < 3" width="30%">
      <!-- 表单通常要放在单独组件中，否则容易引起非必要重绘导致UI卡顿 -->
      <el-form ref="singleForm" crud :rules="rules" :model="$cruds.single.form" label-position="top" label-width="80px">
        <el-form-item label="姓名" prop="uname">
          <el-input v-model="$cruds.single.form.uname"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="$cruds.single.form.email"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="$cruds.single.cancel()">取 消</el-button>
        <el-button type="primary" @click="submit($cruds.single)">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog :title="getTitle($cruds.multiple)" :visible.sync="$cruds.multiple.formStatus > 0 && $cruds.multiple.formStatus < 3" width="30%">
      <!-- 表单通常要放在单独组件中，否则容易引起非必要重绘导致UI卡顿 -->
      <el-form ref="multipleForm" crud :rules="rules" :model="$cruds.multiple.form" label-position="top" label-width="80px">
        <el-form-item label="姓名" prop="uname">
          <el-input v-model="$cruds.multiple.form.uname"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="$cruds.multiple.form.email"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="$cruds.multiple.cancel()">取 消</el-button>
        <el-button type="primary" @click="submit($cruds.multiple)">确 定</el-button>
      </span>
    </el-dialog>

    <!-- <ViewV crud="multiple"/>
    <ViewV crud="single"/> -->
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
  cruds: {
    single:{url:"api/single",recoverable:true},
    multiple:{url:"api/multiple",recoverable:true},
  },
  data() {
    return {
      rules: {
        uname: [{ required: true, trigger: "blur" }],
        email: [{ required: true, trigger: "blur" }],
      },
    };
  },
  mounted() {
    this.$cruds.multiple.reload();
    this.$cruds.single.reload();
  },
  computed:{
    hasMultiShot(){
      return 1
    }
  },
  watch:{
    '$cruds.multiple.snapshots':{
      handler(v){
      },
      deep:true
    }
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
    getTitle(crud) {
      if (crud.formStatus == 1)
        return "新增-"+crud.key;
      if (crud.formStatus == 2)
        return "编辑-"+crud.key;
    },
    submit(crud){
      try {
        // this.$crud.submit(this.$refs.form)
        crud.submitAdd(crud==this.$cruds.single?this.$refs.singleForm:this.$refs.multipleForm)
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
