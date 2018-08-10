<template>
  <div>
    <mt-datetime-picker ref="startPicker" type="date" :startDate="from" @confirm="setStartDate">
    </mt-datetime-picker>
    <mt-datetime-picker ref="endPicker" type="date" :startDate="endFrom" @confirm="setEndDate">
    </mt-datetime-picker>
    <div>
      <button type="button" class="btn btn-info" @click="openPicker('startPicker')">{{startDate && getDay(startDate) || '开始日期'}}</button>
      <button type="button" class="btn btn-info" @click="openPicker('endPicker')">{{endDate && getDay(endDate) || '结束日期'}}</button>
      <button type="button" class="btn btn-info" @click="reset()">重置日期</button>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
export default {
  name: 'date-range',
  props: ['from'],
  computed: {
    endFrom: function () {
      return this.startDate || this.from;
    }
  },
  data() {
    return {
      startDate: '',
      endDate: ''
    }
  },
  methods: {
    setStartDate(date) {
      this.startDate = date;

      this.$emit('onChange', this.startDate, this.endDate);
    },
    setEndDate(date) {
      this.endDate = date;

      this.$emit('onChange', this.startDate, this.endDate);
    },
    openPicker(picker) {
      this.$refs[picker].open();
    },
    getDay(d) {
      return moment(d).format('YYYY-MM-DD')
    },
    reset() {
      this.setStartDate('');
      this.setEndDate('');
    }
  }

}
</script>

<style>
</style>


