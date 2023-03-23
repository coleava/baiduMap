import axios from 'axios'

class TransportLayer {
  constructor() {
    this.client = axios.create()
    let url = new URL(window.location.href)
    let originValue = `${url.origin}/map`
    this.client.interceptors.request.use((cfg) => {
      cfg.baseURL = originValue

      return cfg
    })

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
        }
        if (error.response && error.response.status === 403) {
          return
        }
        return Promise.reject(error)
      }
    )
  }

  //获取城市中心坐标点
  async getCenter(type, region) {
    let url = `/center?type=${type}&region=${region}`
    let response = await this.client.get(url)
    return response.data
  }

  //检索门店列表
  async getStore({ type, page, query, region }) {
    let url = `/sync?type=${type}&page=${page}&query=${query}&region=${region}`
    let response = await this.client.get(url)
    return response.data
  }
}

export default TransportLayer