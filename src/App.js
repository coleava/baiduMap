import { Map, Marker, AutoComplete } from 'react-bmapgl'
import star from './hotel.svg'
import { useEffect, useState } from 'react'
import { Select } from 'antd'
import './App.css'

// import cityList from './city.json'
import locations from './location.json'

const { Option } = Select

function App() {
  const [one, setOne] = useState()
  const [city, setCity] = useState('台北市')

  const [map, setMap] = useState(null)

  //   const onSelect = (uid) => {
  //     let one = list.find((p) => p.uid === uid)
  //     setOne(one)
  //   }

  useEffect(() => {
    // cityChange()
    initData('台北市')
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
    console.log('location', location)
    location.list.forEach((local) => {
      let point = new window.BMapGL.Point(local.point.lng, local.point.lat)
      let marker = new window.BMapGL.Marker(point)
      marker.onclick = (e) => {
        var localSearch = new window.BMapGL.LocalSearch(val, {
          // renderOptions: { map },
          onSearchComplete: (results) => {
            //   console.log('result', results)
            let find = results._pois.find((result) => result.title.endsWith('希尔顿酒店') || result.title.endsWith(')'))
            console.log('find', find)

            // find && sourcelist.push(find)
            var opts = {
              width: 300, // 信息窗口宽度
              height: 100, // 信息窗口高度
              title: find.title, // 信息窗口标题
            }
            let infoWindow = new window.BMapGL.InfoWindow(
              ` <div style="padding: 10px 0">
                        <div style="margin-bottom: 4px">地址:  ${find.address}</div>
                        <div>电话:  ${find.phoneNumber}</div>
                      </div>`,
              opts
            )
            infoWindow.onclickclose = () => {
              map.centerAndZoom(val, 10)
            }
            map.openInfoWindow(infoWindow, point)
            map.centerAndZoom(point, 14)
          },
        })
        localSearch.search(local.title)
      }
      map.centerAndZoom(point, 10)
      map.addOverlay(marker)
    })

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
    // initData('上海市')
    // initData('北京市')
    // initData('重庆市')
    // initData('三亚市')
    // initData('大连市')
    // initData('广州市')
    // initData('厦门市')
    // initData('西安市')
    // initData('沈阳市')
    // initData('青岛市')
    // initData('石家庄市')
    // initData('嘉兴市')
    // initData('郑州市')
    // initData('深圳市')
    // initData('武汉市')
    // initData('天津市')
    // initData('台州市')
    // initData('海口市')
    // initData('林芝市')
    // initData('台北市')
    // initData('杭州市')
    // initData('中山市')
    // initData('合肥市')
    // initData('南京市')
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* <div style={{ zIndex: 100, position: 'absolute', width: 500, height: 200, bottom: 0, background: '#ffffff', overflow: 'auto' }}>
        {list.map((item) => {
          return (
            <div
              key={item.uid}
              style={{ display: 'flex', flexDirection: 'column', padding: 10, height: 30, borderBottom: '1px solid #efefef', background: one && item.uid === one.uid ? '#f9a216' : '', cursor: 'pointer' }}
              onClick={() => onSelect(item.uid)}>
              <span style={{ fontSize: 14 }}>{item.name}</span>
              <span style={{ fontSize: 8, color: 'gray' }}>{item.address}</span>
            </div>
          )
        })}
      </div> */}
      <Select style={{ width: 200, position: 'absolute', top: 20, left: 20, zIndex: 999 }} value={city} onChange={cityChange} allowClear>
        {locations.map((item, index) => {
          return (
            <Option value={item.location} key={index}>
              {item.location}
            </Option>
          )
        })}
      </Select>
      <div id="container"></div>
      {/* <Map
        center={one ? new window.BMapGL.Point(one.location.lng, one.location.lat) : new window.BMapGL.Point(106.560162, 29.561205)}
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
