import { Map, Marker, AutoComplete } from 'react-bmapgl'
import star from './hotel.svg'
import { useEffect, useState } from 'react'
import list from './data.json'
import { Select } from 'antd'
import './App.css'

const cityList = [
  { city: '北京市', pois: ['北京王府井希尔顿酒店', '北京希尔顿酒店', '北京大兴希尔顿酒店', '北京通州北投希尔顿酒店', '北京首都机场希尔顿酒店'] },
  { city: '上海市', pois: ['上海虹桥祥源希尔顿酒店', '上海松江广富林希尔顿酒店', '上海奉贤前昇希尔顿酒店'] },
  { city: '重庆市', pois: ['重庆希尔顿酒店', '重庆两江新区高科希尔顿酒店'] },
  { city: '三亚市', pois: ['海南海花岛希尔顿酒店'] },
  { city: '大连市', pois: ['大连富力希尔顿酒店'] },
  { city: '广州市', pois: ['佛山希尔顿酒店', '佛山顺德海骏达希尔顿酒店', '广州万富希尔顿酒店', '广州天河希尔顿酒店', '广州翡翠希尔顿酒店'] },
  { city: '厦门市', pois: ['厦门磐基希尔顿酒店'] },
  { city: '西安市', pois: ['西安富力希尔顿酒店', '西安高新希尔顿酒店'] },
  { city: '沈阳市', pois: ['沈阳世茂希尔顿酒店'] },
  { city: '青岛市', pois: ['青岛金沙滩希尔顿酒店'] },
  { city: '石家庄市', pois: ['石家庄希尔顿酒店'] },
  { city: '嘉兴市', pois: ['嘉兴希尔顿酒店'] },
  { city: '郑州市', pois: ['郑州希尔顿酒店'] },
  { city: '深圳市', pois: ['深圳国际会展中心希尔顿酒店', '深圳大中华希尔顿酒店'] },
  { city: '武汉市', pois: ['武汉世茂希尔顿酒店', '武汉光谷希尔顿酒店'] },
  { city: '天津市', pois: ['天津生态城世茂希尔顿酒店'] },
  { city: '台州市', pois: ['台州希尔顿酒店'] },
  { city: '海口市', pois: ['海口鲁能希尔顿酒店', '海口希尔顿酒店', '海南海花岛希尔顿酒店'] },
  { city: '林芝市', pois: ['工布庄园希尔顿酒店'] },
  { city: '台北市', pois: ['台北新板希尔顿酒店'] },
]

const { Option } = Select

function App() {
  const [one, setOne] = useState()
  const [city, setCity] = useState('上海市')
  const [map, setMap] = useState(null)
  const [target, setTarget] = useState(null)

  const onSelect = (uid) => {
    let one = list.find((p) => p.uid === uid)
    setOne(one)
  }

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
    // map.centerAndZoom(val, 10)
    var myGeo = new window.BMapGL.Geocoder()

    // 将地址解析结果显示在地图上,并调整地图视野
    let { pois } = cityList.find((x) => x.city === val)
    // locations
    pois.forEach((poi) => {
      myGeo.getPoint(
        poi,
        (point) => {
          if (point) {
            let location = new window.BMapGL.Point(point.lng, point.lat)
            let marker = new window.BMapGL.Marker(location)

            marker.onclick = (e) => {
              //   let infoWindow = new window.BMapGL.InfoWindow(poi, {
              //     width: 200,
              //     height: 50,
              //     title: poi,
              //   })
              //   map.openInfoWindow(infoWindow, point)
              //   map.centerAndZoom(point, 14)
              var local = new window.BMapGL.LocalSearch(val, {
                // renderOptions: { map },
                onSearchComplete: (results) => {
                  console.log(results)
                  let find = results._pois.find((result) => (result.title.endsWith('希尔顿酒店') || result.title.endsWith(')')) && result.isAccurate)
                  console.log('find', find)

                  var opts = {
                    width: 280, // 信息窗口宽度
                    height: 100, // 信息窗口高度
                    title: find.title, // 信息窗口标题
                  }
                  let infoWindow = new window.BMapGL.InfoWindow(
                    (
                     ` <div style="padding: 10px 0">
                        <div style="margin-bottom: 4px">地址:  ${find.address}</div>
                        <div>电话:  ${find.phoneNumber}</div>
                      </div>`
                    ),
                    opts
                  )
                  infoWindow.onclickclose = () => {
                    map.centerAndZoom(val, 10)
                  }
                  map.openInfoWindow(infoWindow, location)
                  map.centerAndZoom(location, 14)
                },
              })
              local.search(poi)
            }
            map.addOverlay(marker)
          } else {
            alert('您选择地址没有解析到结果!')
          }
        },
        val
      )
    })
    map.centerAndZoom(val, 11)
    setMap(map)
  }

  const cityChange = (value) => {
    setCity(value || '上海市')
    initData(value || '上海市')
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
        {cityList.map((item, index) => {
          return (
            <Option value={item.city} key={index}>
              {item.city}
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
