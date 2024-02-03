class InMemoryCache {
  constructor() {
    this.cache = null;
    this.systemChange = false;
  }

  getCacheStatus() {
    if(this.cache === null) {
      return false;
    }
    if(this.systemChange) {
      return false;
    }
    return true;
  }

  getCache() {
    return this.cache;
  }

  setCache(args) {
    this.cache = args;
  }
}

exports.InMemoryCache = InMemoryCache;