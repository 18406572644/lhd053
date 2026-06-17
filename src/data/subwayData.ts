export interface Station {
  name: string
  lat: number
  lng: number
}

export interface SubwayLine {
  name: string
  color: string
  stations: Station[]
}

export const lineColors: Record<string, string> = {
  '1号线': '#E53935',
  '2号线': '#1A5CD6',
  '3号线': '#FB8C00',
  '4号线': '#43A047',
  '5号线': '#8E24AA',
  '6号线': '#00ACC1',
  '7号线': '#F4511E',
  '8号线': '#6D4C41',
  '9号线': '#5E35B1',
  '10号线': '#00BCD4',
  '13号线': '#FFB300',
  '14号线': '#8BC34A',
  '15号线': '#546E7A',
  '16号线': '#795548',
  '八通线': '#E53935',
  '昌平线': '#FF7043',
  '房山线': '#7E57C2',
  '亦庄线': '#D81B60',
  '机场线': '#A1887F',
}

export const subwayLines: SubwayLine[] = [
  {
    name: '1号线',
    color: '#E53935',
    stations: [
      { name: '古城', lat: 39.9076, lng: 116.2228 },
      { name: '八角游乐园', lat: 39.9077, lng: 116.2353 },
      { name: '八宝山', lat: 39.9064, lng: 116.2504 },
      { name: '玉泉路', lat: 39.9062, lng: 116.2638 },
      { name: '五棵松', lat: 39.9085, lng: 116.2774 },
      { name: '万寿路', lat: 39.9087, lng: 116.2917 },
      { name: '公主坟', lat: 39.9083, lng: 116.3061 },
      { name: '军事博物馆', lat: 39.9099, lng: 116.3185 },
      { name: '木樨地', lat: 39.9106, lng: 116.3331 },
      { name: '南礼士路', lat: 39.9118, lng: 116.3443 },
      { name: '复兴门', lat: 39.9131, lng: 116.3558 },
      { name: '西单', lat: 39.9134, lng: 116.3733 },
      { name: '天安门西', lat: 39.9133, lng: 116.3888 },
      { name: '天安门东', lat: 39.9139, lng: 116.4022 },
      { name: '王府井', lat: 39.9147, lng: 116.4104 },
      { name: '东单', lat: 39.9149, lng: 116.4183 },
      { name: '建国门', lat: 39.9137, lng: 116.4347 },
      { name: '永安里', lat: 39.9131, lng: 116.4456 },
      { name: '国贸', lat: 39.9128, lng: 116.4583 },
      { name: '大望路', lat: 39.9122, lng: 116.4716 },
      { name: '四惠', lat: 39.9090, lng: 116.4879 },
      { name: '四惠东', lat: 39.9087, lng: 116.5038 },
    ]
  },
  {
    name: '2号线',
    color: '#1A5CD6',
    stations: [
      { name: '西直门', lat: 39.9423, lng: 116.3559 },
      { name: '车公庄', lat: 39.9368, lng: 116.3568 },
      { name: '阜成门', lat: 39.9285, lng: 116.3574 },
      { name: '复兴门', lat: 39.9131, lng: 116.3558 },
      { name: '长椿街', lat: 39.9029, lng: 116.3598 },
      { name: '宣武门', lat: 39.8991, lng: 116.3693 },
      { name: '和平门', lat: 39.8992, lng: 116.3822 },
      { name: '前门', lat: 39.8993, lng: 116.3978 },
      { name: '崇文门', lat: 39.9008, lng: 116.4204 },
      { name: '北京站', lat: 39.9035, lng: 116.4274 },
      { name: '建国门', lat: 39.9137, lng: 116.4347 },
      { name: '朝阳门', lat: 39.9254, lng: 116.4357 },
      { name: '东四十条', lat: 39.9355, lng: 116.4359 },
      { name: '东直门', lat: 39.9416, lng: 116.4348 },
      { name: '雍和宫', lat: 39.9485, lng: 116.4227 },
      { name: '安定门', lat: 39.9484, lng: 116.4091 },
      { name: '鼓楼大街', lat: 39.9480, lng: 116.3946 },
      { name: '积水潭', lat: 39.9447, lng: 116.3731 },
    ]
  },
  {
    name: '4号线',
    color: '#43A047',
    stations: [
      { name: '安河桥北', lat: 40.0092, lng: 116.2859 },
      { name: '北宫门', lat: 39.9987, lng: 116.2864 },
      { name: '西苑', lat: 39.9896, lng: 116.2921 },
      { name: '圆明园', lat: 39.9874, lng: 116.3049 },
      { name: '北京大学东门', lat: 39.9842, lng: 116.3120 },
      { name: '中关村', lat: 39.9773, lng: 116.3167 },
      { name: '海淀黄庄', lat: 39.9751, lng: 116.3234 },
      { name: '人民大学', lat: 39.9674, lng: 116.3253 },
      { name: '魏公村', lat: 39.9587, lng: 116.3279 },
      { name: '国家图书馆', lat: 39.9494, lng: 116.3270 },
      { name: '动物园', lat: 39.9438, lng: 116.3370 },
      { name: '西直门', lat: 39.9423, lng: 116.3559 },
      { name: '新街口', lat: 39.9374, lng: 116.3631 },
      { name: '平安里', lat: 39.9314, lng: 116.3748 },
      { name: '西四', lat: 39.9245, lng: 116.3762 },
      { name: '灵境胡同', lat: 39.9182, lng: 116.3750 },
      { name: '西单', lat: 39.9134, lng: 116.3733 },
      { name: '宣武门', lat: 39.8991, lng: 116.3693 },
      { name: '菜市口', lat: 39.8897, lng: 116.3683 },
      { name: '陶然亭', lat: 39.8788, lng: 116.3730 },
      { name: '北京南站', lat: 39.8652, lng: 116.3786 },
      { name: '马家堡', lat: 39.8555, lng: 116.3694 },
      { name: '角门西', lat: 39.8489, lng: 116.3718 },
      { name: '公益西桥', lat: 39.8362, lng: 116.3734 },
    ]
  },
  {
    name: '5号线',
    color: '#8E24AA',
    stations: [
      { name: '天通苑北', lat: 40.0827, lng: 116.4148 },
      { name: '天通苑', lat: 40.0749, lng: 116.4161 },
      { name: '天通苑南', lat: 40.0645, lng: 116.4174 },
      { name: '立水桥', lat: 40.0449, lng: 116.4191 },
      { name: '北苑路北', lat: 40.0280, lng: 116.4204 },
      { name: '大屯路东', lat: 40.0046, lng: 116.4217 },
      { name: '惠新西街北口', lat: 39.9843, lng: 116.4212 },
      { name: '惠新西街南口', lat: 39.9701, lng: 116.4216 },
      { name: '和平西桥', lat: 39.9613, lng: 116.4225 },
      { name: '和平里北街', lat: 39.9536, lng: 116.4233 },
      { name: '雍和宫', lat: 39.9485, lng: 116.4227 },
      { name: '北新桥', lat: 39.9416, lng: 116.4228 },
      { name: '张自忠路', lat: 39.9356, lng: 116.4234 },
      { name: '东四', lat: 39.9252, lng: 116.4237 },
      { name: '灯市口', lat: 39.9177, lng: 116.4193 },
      { name: '东单', lat: 39.9149, lng: 116.4183 },
      { name: '崇文门', lat: 39.9008, lng: 116.4204 },
      { name: '磁器口', lat: 39.8929, lng: 116.4212 },
      { name: '天坛东门', lat: 39.8824, lng: 116.4217 },
      { name: '蒲黄榆', lat: 39.8647, lng: 116.4258 },
      { name: '刘家窑', lat: 39.8557, lng: 116.4289 },
      { name: '宋家庄', lat: 39.8365, lng: 116.4370 },
    ]
  },
  {
    name: '6号线',
    color: '#00ACC1',
    stations: [
      { name: '海淀五路居', lat: 39.9278, lng: 116.2778 },
      { name: '慈寿寺', lat: 39.9276, lng: 116.2924 },
      { name: '花园桥', lat: 39.9281, lng: 116.3058 },
      { name: '白石桥南', lat: 39.9284, lng: 116.3226 },
      { name: '车公庄西', lat: 39.9304, lng: 116.3441 },
      { name: '车公庄', lat: 39.9368, lng: 116.3568 },
      { name: '平安里', lat: 39.9314, lng: 116.3748 },
      { name: '北海北', lat: 39.9367, lng: 116.3912 },
      { name: '南锣鼓巷', lat: 39.9377, lng: 116.4042 },
      { name: '东四', lat: 39.9252, lng: 116.4237 },
      { name: '朝阳门', lat: 39.9254, lng: 116.4357 },
      { name: '东大桥', lat: 39.9238, lng: 116.4511 },
      { name: '呼家楼', lat: 39.9220, lng: 116.4601 },
      { name: '金台路', lat: 39.9224, lng: 116.4729 },
      { name: '十里堡', lat: 39.9220, lng: 116.4899 },
      { name: '青年路', lat: 39.9245, lng: 116.5014 },
      { name: '常营', lat: 39.9267, lng: 116.5665 },
      { name: '草房', lat: 39.9280, lng: 116.5902 },
      { name: '物资学院路', lat: 39.9268, lng: 116.6099 },
      { name: '通州北关', lat: 39.9156, lng: 116.6585 },
      { name: '通运门', lat: 39.9110, lng: 116.6757 },
      { name: '北运河西', lat: 39.9081, lng: 116.6941 },
      { name: '潞城', lat: 39.9056, lng: 116.7401 },
    ]
  },
  {
    name: '8号线',
    color: '#6D4C41',
    stations: [
      { name: '朱辛庄', lat: 40.0892, lng: 116.3270 },
      { name: '育知路', lat: 40.0743, lng: 116.3407 },
      { name: '平西府', lat: 40.0757, lng: 116.3545 },
      { name: '回龙观东大街', lat: 40.0693, lng: 116.3710 },
      { name: '霍营', lat: 40.0603, lng: 116.3754 },
      { name: '育新', lat: 40.0479, lng: 116.3632 },
      { name: '西小口', lat: 40.0404, lng: 116.3676 },
      { name: '永泰庄', lat: 40.0316, lng: 116.3699 },
      { name: '林萃桥', lat: 40.0140, lng: 116.3662 },
      { name: '森林公园南门', lat: 40.0084, lng: 116.3835 },
      { name: '奥林匹克公园', lat: 39.9998, lng: 116.3916 },
      { name: '奥体中心', lat: 39.9879, lng: 116.3935 },
      { name: '北土城', lat: 39.9737, lng: 116.3950 },
      { name: '安华桥', lat: 39.9637, lng: 116.3956 },
      { name: '安德里北街', lat: 39.9556, lng: 116.3959 },
      { name: '鼓楼大街', lat: 39.9480, lng: 116.3946 },
      { name: '什刹海', lat: 39.9395, lng: 116.3944 },
      { name: '南锣鼓巷', lat: 39.9377, lng: 116.4042 },
      { name: '中国美术馆', lat: 39.9220, lng: 116.4120 },
      { name: '珠市口', lat: 39.8884, lng: 116.3975 },
      { name: '天桥', lat: 39.8818, lng: 116.3980 },
      { name: '永定门外', lat: 39.8686, lng: 116.3977 },
      { name: '木樨园', lat: 39.8598, lng: 116.3987 },
      { name: '海户屯', lat: 39.8512, lng: 116.3980 },
      { name: '大红门南', lat: 39.8384, lng: 116.3936 },
      { name: '和义', lat: 39.8257, lng: 116.3920 },
      { name: '东高地', lat: 39.8150, lng: 116.3938 },
      { name: '火箭万源', lat: 39.8037, lng: 116.3962 },
      { name: '五福堂', lat: 39.7935, lng: 116.4037 },
      { name: '德茂', lat: 39.7808, lng: 116.4179 },
      { name: '瀛海', lat: 39.7694, lng: 116.4322 },
    ]
  },
  {
    name: '9号线',
    color: '#5E35B1',
    stations: [
      { name: '国家图书馆', lat: 39.9494, lng: 116.3270 },
      { name: '白石桥南', lat: 39.9284, lng: 116.3226 },
      { name: '白堆子', lat: 39.9214, lng: 116.3110 },
      { name: '军事博物馆', lat: 39.9099, lng: 116.3185 },
      { name: '北京西站', lat: 39.8948, lng: 116.3221 },
      { name: '六里桥东', lat: 39.8834, lng: 116.3203 },
      { name: '六里桥', lat: 39.8819, lng: 116.3086 },
      { name: '七里庄', lat: 39.8659, lng: 116.2975 },
      { name: '丰台东大街', lat: 39.8585, lng: 116.2850 },
      { name: '丰台南路', lat: 39.8400, lng: 116.2858 },
      { name: '科怡路', lat: 39.8333, lng: 116.2888 },
      { name: '郭公庄', lat: 39.8132, lng: 116.2940 },
    ]
  },
  {
    name: '10号线',
    color: '#00BCD4',
    stations: [
      { name: '巴沟', lat: 39.9753, lng: 116.2947 },
      { name: '苏州街', lat: 39.9748, lng: 116.3076 },
      { name: '海淀黄庄', lat: 39.9751, lng: 116.3234 },
      { name: '知春里', lat: 39.9751, lng: 116.3386 },
      { name: '知春路', lat: 39.9755, lng: 116.3480 },
      { name: '西土城', lat: 39.9756, lng: 116.3573 },
      { name: '牡丹园', lat: 39.9752, lng: 116.3723 },
      { name: '健德门', lat: 39.9783, lng: 116.3831 },
      { name: '北土城', lat: 39.9737, lng: 116.3950 },
      { name: '安贞门', lat: 39.9733, lng: 116.4068 },
      { name: '惠新西街南口', lat: 39.9701, lng: 116.4216 },
      { name: '芍药居', lat: 39.9751, lng: 116.4362 },
      { name: '太阳宫', lat: 39.9736, lng: 116.4481 },
      { name: '三元桥', lat: 39.9579, lng: 116.4536 },
      { name: '亮马桥', lat: 39.9479, lng: 116.4604 },
      { name: '农业展览馆', lat: 39.9395, lng: 116.4619 },
      { name: '团结湖', lat: 39.9326, lng: 116.4638 },
      { name: '呼家楼', lat: 39.9220, lng: 116.4601 },
      { name: '金台夕照', lat: 39.9167, lng: 116.4597 },
      { name: '国贸', lat: 39.9128, lng: 116.4583 },
      { name: '双井', lat: 39.8965, lng: 116.4629 },
      { name: '劲松', lat: 39.8820, lng: 116.4659 },
      { name: '潘家园', lat: 39.8739, lng: 116.4669 },
      { name: '十里河', lat: 39.8652, lng: 116.4675 },
      { name: '分钟寺', lat: 39.8444, lng: 116.4557 },
      { name: '成寿寺', lat: 39.8393, lng: 116.4443 },
      { name: '宋家庄', lat: 39.8365, lng: 116.4370 },
      { name: '石榴庄', lat: 39.8334, lng: 116.4230 },
      { name: '大红门', lat: 39.8381, lng: 116.4073 },
      { name: '角门东', lat: 39.8488, lng: 116.3876 },
      { name: '角门西', lat: 39.8489, lng: 116.3718 },
      { name: '草桥', lat: 39.8474, lng: 116.3469 },
      { name: '纪家庙', lat: 39.8381, lng: 116.3350 },
      { name: '首经贸', lat: 39.8301, lng: 116.3225 },
      { name: '丰台站', lat: 39.8212, lng: 116.3068 },
      { name: '泥洼', lat: 39.8238, lng: 116.2945 },
      { name: '西局', lat: 39.8279, lng: 116.2855 },
      { name: '六里桥', lat: 39.8819, lng: 116.3086 },
      { name: '莲花桥', lat: 39.8971, lng: 116.3104 },
      { name: '公主坟', lat: 39.9083, lng: 116.3061 },
      { name: '西钓鱼台', lat: 39.9198, lng: 116.2936 },
      { name: '慈寿寺', lat: 39.9276, lng: 116.2924 },
      { name: '车道沟', lat: 39.9409, lng: 116.2897 },
      { name: '长春桥', lat: 39.9568, lng: 116.2867 },
      { name: '火器营', lat: 39.9694, lng: 116.2852 },
    ]
  },
  {
    name: '13号线',
    color: '#FFB300',
    stations: [
      { name: '西直门', lat: 39.9423, lng: 116.3559 },
      { name: '大钟寺', lat: 39.9652, lng: 116.3437 },
      { name: '知春路', lat: 39.9755, lng: 116.3480 },
      { name: '五道口', lat: 39.9928, lng: 116.3420 },
      { name: '上地', lat: 40.0233, lng: 116.3227 },
      { name: '西二旗', lat: 40.0496, lng: 116.3123 },
      { name: '龙泽', lat: 40.0681, lng: 116.3176 },
      { name: '回龙观', lat: 40.0738, lng: 116.3420 },
      { name: '霍营', lat: 40.0603, lng: 116.3754 },
      { name: '立水桥', lat: 40.0449, lng: 116.4191 },
      { name: '北苑', lat: 40.0358, lng: 116.4306 },
      { name: '望京西', lat: 39.9948, lng: 116.4549 },
      { name: '芍药居', lat: 39.9751, lng: 116.4362 },
      { name: '光熙门', lat: 39.9635, lng: 116.4359 },
      { name: '柳芳', lat: 39.9492, lng: 116.4404 },
      { name: '东直门', lat: 39.9416, lng: 116.4348 },
    ]
  },
]

export const stationCoords: Record<string, { lat: number; lng: number }> = {}
subwayLines.forEach(line => {
  line.stations.forEach(s => {
    if (!stationCoords[s.name]) {
      stationCoords[s.name] = { lat: s.lat, lng: s.lng }
    }
  })
})

export function getStationCoords(stationName: string): { lat: number; lng: number } | null {
  return stationCoords[stationName] || null
}

export function getLineColor(lineName: string): string {
  return lineColors[lineName] || '#1A5CD6'
}

export function findLineByStation(start: string, end: string): SubwayLine | null {
  for (const line of subwayLines) {
    const startIdx = line.stations.findIndex(s => s.name === start)
    const endIdx = line.stations.findIndex(s => s.name === end)
    if (startIdx !== -1 && endIdx !== -1) {
      return line
    }
  }
  return null
}

export function getRouteStations(line: SubwayLine, start: string, end: string): Station[] {
  const startIdx = line.stations.findIndex(s => s.name === start)
  const endIdx = line.stations.findIndex(s => s.name === end)
  if (startIdx === -1 || endIdx === -1) return []

  const minIdx = Math.min(startIdx, endIdx)
  const maxIdx = Math.max(startIdx, endIdx)
  return line.stations.slice(minIdx, maxIdx + 1)
}
