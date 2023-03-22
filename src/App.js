import React, { useEffect, useState } from 'react'
import { Select, Divider, Rate } from 'antd'
import './App.css'
import GeryPng from './imgs/location-grey.png'
import TelPng from './imgs/tel.png'
import BackSvg from './imgs/back.svg'
import locations from './location.json'
import pois from './pois.json'
import TransportLayer from './utils/request'
import useCallbackState from './utils/useCallbackState'

const { Option } = Select

const transportLayer = new TransportLayer()

// 121.48054 , 31.23593

function App() {
  const [city, setCity] = useState('上海市')

  const [map, setMap] = useState(null)
  const [targetList, setTargetList] = useState([])
  const [showDetail, setShowDetail] = useState(false)
  const [selectLocation, setSelectLocation] = useState(null)
  const [point, setPoint] = useState(null)
  //   const [selectMarker, setMarker] = useState(null)
  const iconSize = new window.BMapGL.Size(48, 48)
  const [markers, setMarkers] = useState([]) // 设置当前城市 所有标注点

  const [countMarker, setCountMarker] = useState(null) // 设置当前城市数字标点

  const [centerPoint, setCenterPoint] = useState({ lat: 31.23593, lng: 121.48054 })

  const [store, setStore] = useState('希尔顿酒店')

  useEffect(() => {
    if (store === '希尔顿酒店') {
      let location = locations.find((local) => local.location === city)
      setTargetList(location.list)
      initData(city, location.list)
    } else {
      fetchData(
        {
          type: 'baidu',
          page: 1,
          query: store,
          region: city,
        },
        (res) => {
          let { results } = res
          let newPois = results.map((p) => {
            let img = store.includes('麦当劳') ? 'https://poi-pic.cdn.bcebos.com/swd/d2a04b35-be1e-3c9e-ad71-285f1e2a284f.jpg@h_104,w_132,q_100' : 'https://poi-pic.cdn.bcebos.com/swd/5d262415-a8a1-3ced-8e54-89c7488e5a8b.jpg@h_104,w_132,q_100'
            return {
              title: p.name,
              point: { ...p.location },
              address: p.address,
              province: p.province,
              city: p.city,
              phoneNumber: p.telephone,
              image: img,
              rating: parseInt(p.detail_info.overall_rating),
            }
          })
          setTargetList(newPois)
          initData(city, newPois)
        }
      )
    }
  }, [store, city])

  useEffect(() => {
    map &&
      map.addEventListener('zoomend', () => {
        let zoom = map.getZoom()
        if (zoom >= 4 && zoom <= 9.5) {
          markers.forEach((ms) => {
            map.removeOverlay(ms)
          })
          getCenterLngLat(city, (point) => {
            createLabel(markers.length, point)
          })
        } else {
          markers.forEach((ms) => {
            map.addOverlay(ms)
          })
          removeLabel()
        }
      })
  }, [markers, countMarker])

  const initData = (val, targetList) => {
    let map = new window.BMapGL.Map('container')

    map.enableScrollWheelZoom(true)
    map.enableInertialDragging(true)

    let ms = []
    targetList.forEach((local) => {
      let point = new window.BMapGL.Point(local.point.lng, local.point.lat)
      let myIcon = new window.BMapGL.Icon(require('./imgs/location-red.png'), iconSize)
      let marker = new window.BMapGL.Marker(point, { icon: myIcon, title: local.title })
      marker.onclick = (e) => {
        let { target } = e
        let overlays = map.getOverlays()
        var localSearch = new window.BMapGL.LocalSearch(val, {
          // renderOptions: { map },
          onSearchComplete: (results) => {
            let newPoint = new window.BMapGL.Point(e.target.latLng.lng, e.target.latLng.lat)
            let find = results._pois.find((result) => result.title.includes(store))
            find['image'] = local.image
            find['rating'] = local.rating

            overlays.forEach((overlay) => {
              if (overlay._config.title === target._config.title) {
                overlay.setIcon(new window.BMapGL.Icon(require('./imgs/location-blue.png'), iconSize))
              } else {
                overlay.setIcon(new window.BMapGL.Icon(require('./imgs/location-red.png'), iconSize))
              }
            })
            // setMarker(lay)
            selectTarget(find)
            setPoint(newPoint)
            map.centerAndZoom(newPoint, 14)
          },
        })
        localSearch.search(local.title)
      }
      ms.push(marker)
      map.addOverlay(marker)
      map.centerAndZoom(point, 11)
    })
    setMarkers(ms)
    setMap(map)
  }

  const createLabel = (content, point) => {
    let myIcon = new window.BMapGL.Icon(require('./imgs/location-filled.png'), iconSize)
    let marker = new window.BMapGL.Marker(point, { icon: myIcon })
    map.addOverlay(marker)
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
    marker.setLabel(label)
    setCountMarker(marker)
  }

  const removeLabel = () => {
    map.removeOverlay(countMarker)
  }

  const cityChange = (value) => {
    setCity(value || '上海市')
    initData(value || '上海市')
    setShowDetail(false)
    setSelectLocation(null)
    // getCenterLngLat(value)
  }

  // 获取城市中心坐标点
  const getCenterLngLat = async (value, callback) => {
    value = value || city
    let res = await transportLayer.getCenter('baidu', value)
    setCenterPoint(res)
    callback(res)
  }

  const fetchData = async ({ type, page, query, region }, callback) => {
    let res = await transportLayer.getStore({
      type,
      page,
      query,
      region,
    })

    callback(res)
  }

  const selectTarget = (target) => {
    if (map) {
      let newPoint = new window.BMapGL.Point(target.point.lng, target.point.lat)
      let marker = null
      let overlays = map.getOverlays()
      overlays.forEach((overlay) => {
        if (target.title === overlay._config.title) {
          overlay.setIcon(new window.BMapGL.Icon(require('./imgs/location-blue.png'), iconSize))
        } else {
          overlay.setIcon(new window.BMapGL.Icon(require('./imgs/location-red.png'), iconSize))
        }
      })

      map.centerAndZoom(newPoint, 14)
      map.addOverlay(marker)
      //   setMarker(marker)
      setPoint(newPoint)
    }
    setSelectLocation(target)
    setShowDetail(true)
  }

  const storeChange = (value) => {
    setStore(value)
    setShowDetail(false)
    removeLabel()
    map.centerAndZoom(centerPoint, 11)
  }

  const back = () => {
    setShowDetail(false)
    point && map.centerAndZoom(point, 11)
    let overlays = map.getOverlays()
    overlays.forEach((overlay) => {
      overlay.setIcon(new window.BMapGL.Icon(require('./imgs/location-red.png'), iconSize))
    })
  }
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 999, width: '20%', height: '75vh' }}>
        <Select style={{ width: '100%' }} value={city} onChange={cityChange} allowClear>
          {locations.map((item, index) => {
            return (
              <Option value={item.location} key={index}>
                {item.location}
              </Option>
            )
          })}
        </Select>

        <div className="into" style={{ height: targetList.length > 3 ? '100%' : '75%' }}>
          {!showDetail &&
            targetList.map((target, index) => {
              return (
                <div key={index} style={{ cursor: 'pointer' }} onClick={() => selectTarget(target)}>
                  <div className="title">{target.title}</div>
                  <div className="content">
                    <div className="type">
                      <div style={{ paddingBottom: 8 }}>
                        {target.rating.toFixed(1)}&nbsp;/&nbsp;5分
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

          {showDetail && (
            <div className="detail">
              <div>
                <div id="placereturnfixed" onClick={() => back()}>
                  <img src={BackSvg} width="16" style={{ marginRight: 4 }} alt="" />
                  返回
                </div>
                <img src={selectLocation.image} width="100%" height={200} alt="" />
              </div>
              <div style={{ fontSize: 20, fontWeight: 'bold', padding: '8px 0' }}>{selectLocation.title}</div>
              <div>
                <Rate allowHalf value={Number(selectLocation.rating)} style={{ color: 'red' }} />
                <span style={{ marginLeft: 16 }}>{selectLocation.rating}分</span>
                <span style={{ marginLeft: 16 }}> 高档型</span>
              </div>

              <div style={{ padding: '16px 0', display: 'flex', alignItems: 'center' }}>
                <img src={GeryPng} width={24} alt="" />
                <span style={{ marginLeft: 16, fontSize: 16 }}>{selectLocation.address}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img src={TelPng} width={24} alt="" />
                <span style={{ marginLeft: 16, fontSize: 16 }}>{selectLocation.phoneNumber}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 999, width: '20%', height: '75vh' }}>
        <Select style={{ width: '100%' }} defaultValue="希尔顿酒店" onChange={(value) => storeChange(value)}>
          <Option value="希尔顿酒店">希尔顿酒店</Option>
          <Option value="麦当劳">麦当劳</Option>
          <Option value="星巴克">星巴克</Option>
        </Select>
      </div>
      <div id="container"></div>
    </div>
  )
}

export default App
