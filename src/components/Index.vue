<template>
  <div class="container">
    <div style="position:fixed;padding:10px 30px 10px 0;z-index:2;background-color:white;width:100%;">
      <date-range :from="new Date()" @onChange="dateRangeChange"></date-range>
      <form action="javascript:void(0);" @submit.prevent="formSubmit" class="list-group">
        <input ref="searchInput" type="search" class="form-control list-group-item" placeholder="关键字" v-model="keyword" style="margin-top: 15px;display:block">
      </form>

    </div>
    <div style="padding-top:120px;">
      <ul class="list-group">
        <li v-for="t in tickets" :key="t.url" class="list-group-item">
          <div style="display: flex;align-items:center">
            <a :href="t.url" style="color:unset;">
              <a v-html="getSearchTitle(t.title)" ></a>
              <p style="font-size:0.8em">{{`${getSourceName(t.source)}${t.hall ? ` ${t.hall}` : ''}`}}</p>
              <p style="font-size:0.8em" v-for="(d, i) in t.date" v-bind:key="i">
                {{getDate(d.date)}}
                <br v-if="d.price && d.price.length" />
                <span v-for="(p, i) in d.price" v-bind:key="i" :class="p.isSoldOut?'text-danger':'text-success'">
                  {{p.price}}
                </span>
                <br/>
              </p>
            </a>
          </div>
        </li>
      </ul>
    </div>
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
      console.log(this.keyword);

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
    getDay(d) {
      return moment(d).format('YYYY-MM-DD')
    },
    getDate(d) {
      return moment(d).format('YYYY-MM-DD HH:mm:ss')
    },
    openPicker(picker) {
      this.$refs[picker].open();
    },
    getSourceName(source) {
      switch (source) {
        case 2:
          return '上海大剧院';
        case 0:
          return '上海交响乐团';
        case 1:
          return '东方艺术中心';
      }
    },
    setStartDate(date) {
      this.startDate = date;
    },
    setEndDate(date) {
      this.endDate = date;
    },
    dateRangeChange(startDate, endDate) {
      this.startDate = startDate;
      this.endDate = endDate;
    },
    formSubmit() {
      this.$refs.searchInput.blur();
      return false
    },
    getSearchTitle(title) {
      if (!this.keyword) {
        return title;
      }

      let keys = this.keyword.split(' ');

      keys.forEach(k => {
        if (k) {
          title = title.replace(new RegExp(k, 'gi'), () => {
            return `<span class="text-warning">${k}</span>`
          });
        }
      });

      return title;
    }
  }
}

</script>

<style>
p {
  margin-bottom: 0;
}
</style>