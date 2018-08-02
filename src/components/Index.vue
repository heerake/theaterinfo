<template>
  <div>
    <span>开始日期</span><input type="date" v-model="startDate" />
    <br/>
    <span>结束日期</span><input type="date" v-model="endDate" />
    <ul>
      <li v-for="t in tickets" v-bind:key="t.url">
        <a :href="t.url">
          <p>{{t.title}}</p>
          <p v-for="(d, i) in t.date" v-bind:key="i">
            {{getDate(d)}}
          </p>
        </a>
      </li>
    </ul>
  </div>
</template>
<script>
import moment from 'moment';
import data from '../helper/data';

export default {
  Name: 'Index',
  data() {
    return {
      startDate: '',
      endDate: '',
      keyword: ''
    }
  },
  computed: {
    tickets: function () {
      return data.getFilterData(this.startDate, this.endDate, this.keyword);
    }
  },
  watch: {
    startDate: function (newValue, oldValue) {
    },
    endDate: function (newValue, oldValue) {
    }
  },
  methods: {
    getDate(d) {
      return moment(new Date(d)).format('YYYY-MM-DD hh:mm:ss')
    }
  }
}

</script>

<style>
</style>