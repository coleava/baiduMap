import React from 'react'
import { Select, Divider, Rate, Cascader } from 'antd'
import GeryPng from '../imgs/location-grey.png'
import TelPng from '../imgs/tel.png'
import BackSvg from '../imgs/back.svg'
import locations from '../location.json'
import pois from '../pois.json'
import allCities from '../utils/allCities.json'
import TransportLayer from '../utils/request'

const { Option } = Select

const transportLayer = new TransportLayer()

export default class Main extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      city: '上海市',
      map: null,
      targetList: [],
      showDetail: false,
      selectLocation: null,
      point: null,
      markers: [],
      countMarker: null,
      centerPoint: { lat: 31.23593, lng: 121.48054 },
      store: '希尔顿酒店',
      options: [],
      isOpen: false,
    }
    this.iconSize = new window.BMapGL.Size(48, 48)
  }

  async componentDidMount() {
    await this.fetchData()
    await this.eventListener()
  }

  loadData = async ({ type, page, query, region }, callback) => {
    let res = await transportLayer.getStore({
      type,
      page,
      query,
      region,
    })

    callback(res)
  }

  eventListener = () => {
    this.state.map &&
      this.state.map.addEventListener('zoomend', () => {
        let zoom = this.state.map.getZoom()
        if (zoom >= 4 && zoom <= 9.5) {
          this.state.markers.forEach((ms) => {
            // map.removeOverlay(ms)
            ms.hide()
          })
          this.createLabel(this.state.markers.length, this.state.centerPoint)
        } else {
          this.state.markers.forEach((ms) => {
            // map.addOverlay(ms)
            ms.show()
          })
          this.state.map.removeOverlay(this.state.countMarker)
        }
      })
  }

  initAllCities = () => {
    let data = []
    allCities.forEach((c) => {
      data.push({
        value: c.provinceName,
        label: c.provinceName,
        children: c.citys.map((x) => {
          return {
            value: x.cityName,
            label: x.cityName,
          }
        }),
      })
    })

    this.setState({ options: data })
  }

  fetchData = async () => {
    await this.getCenterLngLat(this.state.city)
    if (this.state.store === '希尔顿酒店') {
      let location = locations.find((local) => local.location === this.state.city)
      this.setState({ targetList: location.list }, () => {
        this.initData(this.state.city, this.state.targetList)
      })
    } else {
      this.loadData(
        {
          type: 'baidu',
          page: 1,
          query: this.state.store,
          region: this.state.city,
        },
        (res) => {
          let { results } = res
          let newPois = results.map((p) => {
            let img = this.state.store.includes('麦当劳')
              ? 'https://poi-pic.cdn.bcebos.com/swd/d2a04b35-be1e-3c9e-ad71-285f1e2a284f.jpg@h_104,w_132,q_100'
              : 'https://poi-pic.cdn.bcebos.com/swd/5d262415-a8a1-3ced-8e54-89c7488e5a8b.jpg@h_104,w_132,q_100'
            return {
              title: p.name,
              point: { ...p.location },
              address: p.address,
              province: p.province,
              city: p.city,
              phoneNumber: p.telephone,
              image: img,
              rating: p.detail_info && p.detail_info.overall_rating && parseInt(p.detail_info.overall_rating),
            }
          })
          this.setState({ targetList: newPois }, () => {
            this.initData(this.state.city, this.state.targetList)
          })
        }
      )
    }
  }

  initData = (val) => {
    const { targetList } = this.state
    let map = new window.BMapGL.Map('container')

    map.enableScrollWheelZoom(true)
    map.enableInertialDragging(true)

    let ms = []
    targetList &&
      targetList.forEach((local) => {
        let point = new window.BMapGL.Point(local.point.lng, local.point.lat)
        let myIcon = new window.BMapGL.Icon(require('../imgs/location-red.png'), this.iconSize)
        let marker = new window.BMapGL.Marker(point, { icon: myIcon, title: local.title })
        marker.onclick = (e) => {
          let { target } = e
          let overlays = map.getOverlays()
          var localSearch = new window.BMapGL.LocalSearch(val, {
            // renderOptions: { map },
            onSearchComplete: (results) => {
              let newPoint = new window.BMapGL.Point(e.target.latLng.lng, e.target.latLng.lat)
              let find = results._pois.find((result) => result.title.includes(this.state.store))
              find['image'] = local.image
              find['rating'] = local.rating

              overlays.forEach((overlay) => {
                if (overlay._config.title === target._config.title) {
                  overlay.setIcon(new window.BMapGL.Icon(require('../imgs/location-blue.png'), this.iconSize))
                } else {
                  overlay.setIcon(new window.BMapGL.Icon(require('../imgs/location-red.png'), this.iconSize))
                }
              })
              // setMarker(lay)
              this.selectTarget(find)
              //   setPoint(newPoint)
              this.setState({ point: newPoint }, () => {
                map.centerAndZoom(newPoint, 14)
              })
            },
          })
          localSearch.search(local.title)
        }
        ms.push(marker)
        map.addOverlay(marker)
        map.centerAndZoom(point, 11)
      })

    this.setState({ map, markers: ms })
  }

  getCenterLngLat = async (value) => {
    value = value || this.state.city
    let res = await transportLayer.getCenter('baidu', value)
    this.setState({ centerPoint: res, countMarker: this.initMarker(res == 'Ok' ? this.state.centerPoint : res) })
  }

  initMarker = (point) => {
    let myIcon = new window.BMapGL.Icon(require('../imgs/location-filled.png'), this.iconSize)
    let marker = new window.BMapGL.Marker(point, { icon: myIcon })
    return marker
  }

  selectTarget = (target) => {
    this.setState({ selectLocation: target, showDetail: true }, () => {
      if (this.state.map) {
        let newPoint = new window.BMapGL.Point(target.point.lng, target.point.lat)
        let marker = null
        let overlays = this.state.map.getOverlays()
        overlays.forEach((overlay) => {
          if (target.title === overlay._config.title) {
            overlay.setIcon(new window.BMapGL.Icon(require('../imgs/location-blue.png'), this.iconSize))
          } else {
            overlay.setIcon(new window.BMapGL.Icon(require('../imgs/location-red.png'), this.iconSize))
          }
        })

        this.setState({ point: newPoint }, () => {
          this.state.map.centerAndZoom(newPoint, 14)
          this.state.map.addOverlay(marker)
        })
      }
    })
  }

  cityChange = (value) => {
    this.setState({ city: value || '上海市', showDetail: false, selectLocation: null, countMarker: null }, () => {
      //   this.initData(value)
      this.fetchData()
    })
  }

  cascaderChange = (value) => {
    this.setState({ city: value[1] || '上海市', showDetail: false, selectLocation: null, countMarker: null }, () => {
      //   this.initData(value[1])
      this.fetchData()
    })
  }

  createLabel = (content, point) => {
    if (point && typeof point === 'object') {
      this.state.map.addOverlay(this.state.countMarker)
      let label = new window.BMapGL.Label(content.toString(), {
        offset: new window.BMapGL.Size(-9, -12), // 设置标注的偏移量
      })

      label.setStyle({
        background: 'none',
        color: '#fff',
        border: 'none',
        fontWeight: 'bolder',
        fontSize: 32,
      })
      this.state.countMarker.setLabel(label)
    }
  }

  removeLabel = () => {
    this.state.countMarker && this.state.map.removeOverlay(this.state.countMarker)
  }

  storeChange = (value) => {
    this.initAllCities()
    this.setState({ store: value, showDetail: false }, () => {
      this.removeLabel()
      this.state.map.centerAndZoom(this.state.centerPoint, 11)
      this.fetchData()
    })
  }

  back = () => {
    this.setState({ showDetail: false }, () => {
      if (this.state.point) {
        this.state.map.centerAndZoom(this.state.point, 11)
        let overlays = this.state.map.getOverlays()
        overlays.forEach((overlay) => {
          overlay.setIcon(new window.BMapGL.Icon(require('../imgs/location-red.png'), this.iconSize))
        })
      }
    })
  }

  render() {
    return (
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 999, width: '20%', height: '75vh' }}>
          {this.state.store === '希尔顿酒店' && (
            <Select
              style={{ width: '100%' }}
              value={this.state.city}
              onChange={(value) => this.cityChange(value)}
              allowClear={false}
              onDropdownVisibleChange={(open) => {
                this.setState({ isOpen: open })
              }}>
              {locations.map((item, index) => {
                return (
                  <Option value={item.location} key={index}>
                    {item.location}
                  </Option>
                )
              })}
            </Select>
          )}
          {this.state.store !== '希尔顿酒店' && (
            <Cascader
              options={this.state.options}
              style={{ width: '100%' }}
              value={[this.state.city, this.state.city]}
              allowClear={false}
              expandTrigger="hover"
              onChange={(value) => this.cascaderChange(value)}
              onDropdownVisibleChange={(value) => {
                this.setState({ isOpen: value })
              }}
            />
          )}

          {!this.state.isOpen && (
            <div className="into" style={{ height: this.state.targetList.length > 3 ? '100%' : '75%' }}>
              {!this.state.showDetail &&
                this.state.targetList.map((target, index) => {
                  return (
                    <div key={index} style={{ cursor: 'pointer' }} onClick={() => this.selectTarget(target)}>
                      <div className="title">{target.title}</div>
                      <div className="content">
                        <div className="type">
                          <div style={{ paddingBottom: 8 }}>
                            {target.rating ? target.rating.toFixed(1) : 0}&nbsp;/&nbsp;5分
                            <Divider type="vertical" />
                            豪华型
                          </div>
                          <div>{target.address}</div>
                        </div>
                        <div style={{ flex: 1, marginRight: 8 }}>
                          <img src={target.image} width="95%" height={80} alt="" />
                        </div>
                      </div>
                      <Divider style={{ margin: '12px 0 10px 0' }} />
                    </div>
                  )
                })}

              {this.state.showDetail && (
                <div className="detail">
                  <div>
                    <div id="placereturnfixed" onClick={() => this.back()}>
                      <img src={BackSvg} width="16" style={{ marginRight: 4 }} alt="" />
                      返回
                    </div>
                    <img src={this.state.selectLocation.image} width="100%" height={200} alt="" />
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 'bold', padding: '8px 0' }}>{this.state.selectLocation.title}</div>
                  <div>
                    <Rate allowHalf value={Number(this.state.selectLocation.rating)} style={{ color: 'red' }} />
                    <span style={{ marginLeft: 16 }}>{this.state.selectLocation.rating}分</span>
                    <span style={{ marginLeft: 16 }}> 高档型</span>
                  </div>

                  <div style={{ padding: '16px 0', display: 'flex', alignItems: 'center' }}>
                    <img src={GeryPng} width={24} alt="" />
                    <span style={{ marginLeft: 16, fontSize: 16 }}>{this.state.selectLocation.address}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img src={TelPng} width={24} alt="" />
                    <span style={{ marginLeft: 16, fontSize: 16 }}>{this.state.selectLocation.phoneNumber}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 999, width: '20%', height: '75vh' }}>
          <Select style={{ width: '100%' }} defaultValue="希尔顿酒店" onChange={(value) => this.storeChange(value)}>
            <Option value="希尔顿酒店">希尔顿酒店</Option>
            <Option value="麦当劳">麦当劳</Option>
            <Option value="星巴克">星巴克</Option>
          </Select>
        </div>
        <div id="container"></div>
      </div>
    )
  }
}
