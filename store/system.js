import { defineStore } from 'pinia';

export default defineStore('system', {
  state: () => ({
    statusBarHeight: 0,
    navigationHeight: 0
  }),
  actions: {
    async getStatusbarHeight() {

      const systemInfo = uni.getSystemInfoSync();
      this.statusBarHeight = systemInfo.statusBarHeight;
      const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
      this.navigationHeight =
        (menuButtonInfo.top - this.statusBarHeight) * 2 + menuButtonInfo.height;
    }
  },
  getters: {
    headerTop(state) {
      return state.statusBarHeight + state.navigationHeight;
    }
  }
});
