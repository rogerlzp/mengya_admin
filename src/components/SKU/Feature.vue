<template>
  <div>
    <li>
      <p> helloworld</p>
      <button v-on:click="$emit('remove')">删除</button>
    </li>
  </div>
</template>
