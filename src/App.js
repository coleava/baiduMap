import React, { useEffect, useState } from 'react'
import { Select, Divider, Rate } from 'antd'
import './App.css'
import GeryPng from './imgs/location-grey.png'
import TelPng from './imgs/tel.png'
import BackSvg from './imgs/back.svg'

import locations from './location.json'

const { Option } = Select

function App() {
  const [city, setCity] = useState('上海市')

  const [map, setMap] = useState(null)
  const [targetList, setTargetList] = useState([])
  const [showDetail, setShowDetail] = useState(false)
  const [selectLocation, setSelectLocation] = useState(null)
  const [point, setPoint] = useState(null)
  const [selectMarker, setMarker] = useState(null)
  const iconSize = new window.BMapGL.Size(32, 32)
  useEffect(() => {
    initData('上海市')
  }, [])

  const initData = (val) => {
    let map = new window.BMapGL.Map('container')
    map.enableScrollWheelZoom(true)
    map.enableInertialDragging(true)
    // let point = new window.BMapGL.Point(108.94522570936788, 34.541199259719576) // 陕西
    //
    // var point = new window.BMapGL.Point(116.4133836971231,39.910924547299565) // 北京

    // var point = new window.BMapGL.Point( 121.48053886017651,31.235929042252014) // 上海
    let location = locations.find((local) => local.location === val)
    setTargetList(location.list)
    location.list.forEach((local) => {
      let point = new window.BMapGL.Point(local.point.lng, local.point.lat)
      let myIcon = new window.BMapGL.Icon(require('./imgs/location-red.png'), iconSize)
      let marker = new window.BMapGL.Marker(point, { icon: myIcon, title: local.title })
      //   marker.setImageUrl(require('./imgs/location-red.png'))
      marker.onclick = (e) => {
        let { target } = e
        let overlays = map.getOverlays()
        let lay = null
        var localSearch = new window.BMapGL.LocalSearch(val, {
          // renderOptions: { map },
          onSearchComplete: (results) => {
            let newPoint = new window.BMapGL.Point(e.target.latLng.lng, e.target.latLng.lat)
            let find = results._pois.find((result) => result.title.endsWith('希尔顿酒店') || result.title.endsWith(')'))
            find['image'] = local.image
            find['rating'] = local.rating
            overlays.forEach((overlay) => {
              if (overlay._config.title === target._config.title) {
                overlay.setIcon(new window.BMapGL.Icon(require('./imgs/location-blue.png'), iconSize))
                lay = overlay
              } else {
                overlay.setIcon(new window.BMapGL.Icon(require('./imgs/location-red.png'), iconSize))
              }
            })
            setMarker(lay)
            selectTarget(find)
            setPoint(newPoint)
            map.centerAndZoom(newPoint, 14)
          },
        })
        localSearch.search(local.title)
      }
      map.addOverlay(marker)
      map.centerAndZoom(point, 11)
    })
    setMap(map)
    // 将地址解析结果显示在地图上,并调整地图视野
    // let { pois } = cityList.find((x) => x.city === val)
    // console.log('pois',pois);
    // let myGeo = new window.BMapGL.Geocoder()
    // pois.forEach((poi) => {
    //   myGeo.getPoint(
    //     poi,
    //     (point) => {
    //   if (point) {
    // let location = new window.BMapGL.Point(point.lng, point.lat)
    // let marker = new window.BMapGL.Marker(location)

    // marker.onclick = (e) => {
    //   var local = new window.BMapGL.LocalSearch(val, {
    //     // renderOptions: { map },
    //     onSearchComplete: (results) => {
    //       console.log('result', results)
    //       let find = results._pois.find((result) => result.title.endsWith('希尔顿酒店') || result.title.endsWith(')'))
    //       // console.log('find', find)

    //       // find && sourcelist.push(find)
    //       var opts = {
    //         width: 300, // 信息窗口宽度
    //         height: 100, // 信息窗口高度
    //         title: find.title, // 信息窗口标题
    //       }
    //       let infoWindow = new window.BMapGL.InfoWindow(
    //         ` <div style="padding: 10px 0">
    //                 <div style="margin-bottom: 4px">地址:  ${find.address}</div>
    //                 <div>电话:  ${find.phoneNumber}</div>
    //               </div>`,
    //         opts
    //       )
    //       infoWindow.onclickclose = () => {
    //         map.centerAndZoom(val, 10)
    //       }
    //       map.openInfoWindow(infoWindow, location)
    //       map.centerAndZoom(location, 14)
    //     },
    //   })
    //   local.search(poi)
    // }
    // map.addOverlay(marker)
    //   } else {
    //     alert('您选择地址没有解析到结果!')
    //   }
    // }
    //     val
    //   )
    // })
    // map.centerAndZoom(val, 11)
    // setMap(map)
  }

  const cityChange = (value) => {
    setCity(value || '上海市')
    initData(value || '上海市')
    setShowDetail(false)
    setSelectLocation(null)
    selectMarker.setIcon(new window.BMapGL.Icon(require('./imgs/location-blue.png'), iconSize))
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
      setMarker(marker)
      setPoint(newPoint)
    }
    setSelectLocation(target)
    setShowDetail(true)
  }

  const back = () => {
    setShowDetail(false)
    point && map.centerAndZoom(point, 11)
    let overlays = map.getOverlays()
    overlays.forEach((overlay) => {
      overlay.setIcon(new window.BMapGL.Icon(require('./imgs/location-red.png'), iconSize))
    })
    // let myIcon = new window.BMapGL.Icon(require('./imgs/location-red.png'), new window.BMapGL.Size(32, 32))
    // let marker = new window.BMapGL.Marker(point, { icon: myIcon })
    // selectMarker && selectMarker.setIcon(new window.BMapGL.Icon(require('./imgs/location-red.png'), iconSize))
  }

  //   console.log('map', map,selectMarker)
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
                      <img src={target.image} width="95%" height="80" />
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
                  <img src={BackSvg} width="16" style={{ marginRight: 4 }} />
                  返回
                </div>
                <img src={selectLocation.image} width="100%" height="200" />
              </div>
              <div style={{ fontSize: 22, fontWeight: 'bold', padding: '8px 0' }}>{selectLocation.title}</div>
              <div>
                <Rate allowHalf value={Number(selectLocation.rating)} style={{ color: 'red' }} />
                <span style={{ marginLeft: 16 }}>{selectLocation.rating}分</span>
                <span style={{ marginLeft: 16 }}> 高档型</span>
              </div>

              <div style={{ padding: '16px 0', display: 'flex', alignItems: 'center' }}>
                <img src={GeryPng} width="24" />
                <span style={{ marginLeft: 16, fontSize: 16 }}>{selectLocation.address}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img src={TelPng} width="24" />
                <span style={{ marginLeft: 16, fontSize: 16 }}>{selectLocation.phoneNumber}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <div id="container"></div>
      {/* <Map
        center={one ? new window.BMapGL.Point(one.location.lng, one.location.lat) : new window.BMapGL.Point(116.4133836971231,39.910924547299565)}
        zoom={one ? 14 : 6}
        autoViewport={false}
        enableScrollWheelZoom={true}
        enableDragging={true}
        enableDoubleClickZoom={true}
        style={{ height: '100vh' }}>
        {list.map((p) => {
          return <Marker onClick={() => onSelect(p.uid)} key={p.uid} icon={new window.BMapGL.Icon(star, new window.BMapGL.Size(30, 30))} position={new window.BMapGL.Point(p.location.lng, p.location.lat)} />
        })}
      </Map> */}
    </div>
  )
}

export default App
