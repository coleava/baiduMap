import React from 'react'
import { Select, Divider, Rate, Cascader } from 'antd'
import GeryPng from '../imgs/location-grey.png'
import TelPng from '../imgs/tel.png'
import BackSvg from '../imgs/back.svg'
// import locations from '../location.json'
// import allCities from '../utils/allCities.json'
import capital from '../utils/capital.json'
import TransportLayer from '../utils/request'

const { Option } = Select

const transportLayer = new TransportLayer()

export default class Main extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      city: '北京市',
      map: null,
      targetList: [],
      showDetail: false,
      selectLocation: null,
      point: null,
      markers: [],
      countMarker: null,
      countLabel: null,
      centerPoint: { lat: 31.23593, lng: 121.48054 },
      store: ['希尔顿酒店', '星巴克', '麦当劳'],
      options: [],
      isOpen: false,
      page: 1,
      size: 30,
    }
    this.countLabel = null
    this.iconSize = new window.BMapGL.Size(52, 52)
    this.smallIconSize = new window.BMapGL.Size(28, 28)
  }

  async componentDidMount() {
    await this.loadData()
  }

  loadData = async () => {
    this.initAllCities()
    await this.getCenterLngLat(this.state.city)
    let res = await transportLayer.getStore({
      page: this.state.page,
      size: this.state.size,
      query: this.state.store.join(','),
      region: this.state.city,
    })
    this.setState({ targetList: res }, async () => {
      this.initData(this.state.city)
    })
  }

  initAllCities = () => {
    let data = []
    capital.forEach((c) => {
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

  initData = (val) => {
    const { targetList } = this.state
    let map = new window.BMapGL.Map('container')

    map.enableScrollWheelZoom(true)
    map.enableInertialDragging(true)

    let ms = []
    targetList &&
      targetList.forEach((local) => {
        let point = new window.BMapGL.Point(local.point.lng, local.point.lat)
        let myIcon = null
        if (local.sort.includes('希尔顿酒店')) {
          myIcon = new window.BMapGL.Icon(require('../imgs/location-blue1.png'), this.smallIconSize)
        }
        if (local.sort.includes('星巴克')) {
          myIcon = new window.BMapGL.Icon(require('../imgs/location-green.png'), this.smallIconSize)
        }
        if (local.sort.includes('麦当劳')) {
          myIcon = new window.BMapGL.Icon(require('../imgs/location-red.png'), this.smallIconSize)
        }
        // new window.BMapGL.Icon(require('../imgs/location-red.png'), this.smallIconSize)
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
                  overlay.setIcon(new window.BMapGL.Icon(require('../imgs/location-blue.png'), this.smallIconSize))
                } else {
                  if (local.sort.includes('希尔顿酒店')) {
                    overlay.setIcon(new window.BMapGL.Icon(require('../imgs/location-blue1.png'), this.smallIconSize))
                  }
                  if (local.sort.includes('星巴克')) {
                    overlay.setIcon(new window.BMapGL.Icon(require('../imgs/location-green.png'), this.smallIconSize))
                  }
                  if (local.sort.includes('麦当劳')) {
                    overlay.setIcon(new window.BMapGL.Icon(require('../imgs/location-red.png'), this.smallIconSize))
                  }
                }
              })
              this.selectTarget(find)
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

    this.setState({ map, markers: ms }, () => {
      map.onzoomend = (e) => {
        let zoom = map.getZoom()
        if (zoom <= 9.5) {
          this.state.markers.forEach((ms) => {
            this.state.map.removeOverlay(ms)
            // ms.hide()
          })
          this.createLabel(this.state.markers.length.toString())
        }

        if (zoom > 10) {
          if (this.countLabel) {
            this.state.markers.forEach((ms) => {
                this.state.map.addOverlay(ms)
            //   ms.show()
            })
            this.countLabel.setContent('')
            this.state.countMarker.setLabel(null)
            let node = document.querySelector('.BMapLabel')
            // console.log('node',node);
            node.style.display = 'none'
            // console.log('after',node);
            this.countLabel = null
            this.state.map.removeOverlay(this.state.countMarker)
          }
        }
      }
    })
  }

  getCenterLngLat = async (value) => {
    value = value || this.state.city
    let res = await transportLayer.getCenter(value)
    this.setState({ centerPoint: res, countMarker: this.initMarker({ lng: res.lng, lat: res.lat }) })
  }

  initMarker = (point) => {
    let myIcon = new window.BMapGL.Icon(require('../imgs/location-filled.png'), this.iconSize)
    let marker = new window.BMapGL.Marker(point, { icon: myIcon })
    return marker
  }

  initLabel = (content, callback) => {
    let offsetX = -8
    if (content.length === 2) {
      offsetX = -11
    }
    if (content.length === 3) {
      offsetX = -12
    }
    let label = new window.BMapGL.Label(content, {
      offset: new window.BMapGL.Size(offsetX, -12), // 设置标注的偏移量
    })

    label.setStyle({
      background: 'none',
      color: '#fff',
      border: 'none',
      fontWeight: 'bolder',
    //   fontSize: 14,
      display: 'block',
    })
    this.countLabel = label
    callback(label)
    // this.setState({ countLabel: label }, callback)
  }

  selectTarget = (target) => {
    this.setState({ selectLocation: target, showDetail: true }, () => {
      if (this.state.map) {
        let newPoint = new window.BMapGL.Point(target.point.lng, target.point.lat)
        let marker = null
        let overlays = this.state.map.getOverlays()
        overlays.forEach((overlay) => {
          if (target.title === overlay._config.title) {
            overlay.setIcon(new window.BMapGL.Icon(require('../imgs/location-blue.png'), this.smallIconSize))
          } else {
            if (overlay._config.title.includes('希尔顿酒店')) {
              overlay.setIcon(new window.BMapGL.Icon(require('../imgs/location-blue1.png'), this.smallIconSize))
            }
            if (overlay._config.title.includes('星巴克')) {
              overlay.setIcon(new window.BMapGL.Icon(require('../imgs/location-green.png'), this.smallIconSize))
            }
            if (overlay._config.title.includes('麦当劳')) {
              overlay.setIcon(new window.BMapGL.Icon(require('../imgs/location-red.png'), this.smallIconSize))
            }
          }
        })

        this.setState({ point: newPoint }, () => {
          this.state.map.centerAndZoom(newPoint, 14)
          this.state.map.addOverlay(marker)
        })
      }
    })
  }

  cascaderChange = (value) => {
    this.countLabel = null
    this.setState({ city: value[1] || '上海市', showDetail: false, selectLocation: null, countMarker: null }, this.loadData)
  }

  createLabel = (content) => {
    this.initLabel(content, (label) => {
      //   this.state.countLabel.setContent(content)
      label.setContent(content)
      this.state.countMarker.setLabel(label)
      this.state.map.addOverlay(this.state.countMarker)
    })
  }

  removeLabel = () => {
    this.state.countMarker && this.state.map.removeOverlay(this.state.countMarker)
  }

  storeChange = (value) => {
    this.countLabel = null
    this.initAllCities()
    this.setState({ store: value, showDetail: false }, () => {
      this.removeLabel()
      this.state.map.centerAndZoom(this.state.centerPoint, 11)
      this.loadData()
    })
  }

  back = () => {
    this.setState({ showDetail: false }, () => {
      if (this.state.point) {
        this.state.map.centerAndZoom(this.state.point, 11)
        let overlays = this.state.map.getOverlays()
        overlays.forEach((overlay) => {
          if (overlay._config.title.includes('希尔顿酒店')) {
            overlay.setIcon(new window.BMapGL.Icon(require('../imgs/location-blue1.png'), this.smallIconSize))
          }
          if (overlay._config.title.includes('星巴克')) {
            overlay.setIcon(new window.BMapGL.Icon(require('../imgs/location-green.png'), this.smallIconSize))
          }
          if (overlay._config.title.includes('麦当劳')) {
            overlay.setIcon(new window.BMapGL.Icon(require('../imgs/location-red.png'), this.smallIconSize))
          }
        })
      }
    })
  }

  render() {
    return (
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 999, width: '20%', height: '75vh' }}>
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

          {!this.state.isOpen && (
            <div className="into" style={{ height: this.state.targetList.length > 3 ? (this.state.showDetail ? '60%' : '100%') : '75%' }}>
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
                          <div style={{ fontSize: 14 }}>{target.address}</div>
                        </div>
                        <div style={{ flex: 1, marginRight: 8 }}>
                          <img src={target.image} width={60} height={60} alt="" />
                        </div>
                      </div>
                      <Divider style={{ margin: '12px 0 10px 0' }} />
                    </div>
                  )
                })}

              {this.state.showDetail && (
                <div className="detail">
                  <div style={{ marginBottom: 16 }}>
                    <div id="placereturnfixed" onClick={() => this.back()}>
                      <img src={BackSvg} width="16" style={{ marginRight: 4 }} alt="" />
                      返回
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <img src={this.state.selectLocation.image} width={160} height={160} alt="" />
                    </div>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 'bold', padding: '8px 0' }}>{this.state.selectLocation.title}</div>
                  <div>
                    <Rate allowHalf value={Number(this.state.selectLocation.rating)} style={{ color: 'red' }} />
                    <span style={{ marginLeft: 16 }}>{this.state.selectLocation.rating}分</span>
                    <span style={{ marginLeft: 16 }}> 高档型</span>
                  </div>

                  <div style={{ padding: '16px 0', display: 'flex', alignItems: 'center' }}>
                    <img src={GeryPng} width={24} alt="" />
                    <span style={{ marginLeft: 16, fontSize: 14 }}>{this.state.selectLocation.address}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img src={TelPng} width={24} alt="" />
                    <span style={{ marginLeft: 16, fontSize: 14 }}>{this.state.selectLocation.phoneNumber}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div style={{ position: 'absolute', top: 20, right: '22%', zIndex: 999, width: '20%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', backgroundColor: '#fff', borderRadius: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 32 }}>
              <div style={{ backgroundColor: '#023ffa', width: 6, height: 6, borderRadius: 6, marginRight: 8 }}></div>
              <p>希尔顿酒店</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 32 }}>
              <div style={{ backgroundColor: '#00714d', width: 6, height: 6, borderRadius: 6, marginRight: 8 }}></div>
              <p>星巴克</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 32 }}>
              <div style={{ backgroundColor: '#f20321', width: 6, height: 6, borderRadius: 6, marginRight: 8 }}></div>
              <p>麦当劳</p>
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 999, width: '20%', height: '75vh' }}>
          <Select style={{ width: '100%' }} defaultValue={this.state.store} onChange={(value) => this.storeChange(value)} mode="multiple">
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
