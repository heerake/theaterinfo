<template>
  <div id="app">
    <!-- 路由出口 -->
    <!-- 路由匹配到的组件将渲染在这里 -->
    <router-view></router-view>
    <p class="navigator">
      <!-- 使用 router-link 组件来导航. -->
      <!-- 通过传入 `to` 属性指定链接. -->
      <!-- <router-link> 默认会被渲染成一个 `<a>` 标签 -->
      <!-- <router-link to="/">Go to Foo</router-link>
      <router-link to="/bar">Go to Bar</router-link> -->
    </p>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
</style>
