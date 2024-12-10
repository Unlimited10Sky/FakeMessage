// 如果您想动态创建一个默认头像，可以使用这段代码
const canvas = document.createElement('canvas')
canvas.width = 100
canvas.height = 100
const ctx = canvas.getContext('2d')

// 绘制圆形背景
ctx.fillStyle = '#8E8E93'
ctx.beginPath()
ctx.arc(50, 50, 50, 0, Math.PI * 2)
ctx.fill()

// 绘制铅笔图标
ctx.fillStyle = '#FFFFFF'
ctx.font = '40px Arial'
ctx.textAlign = 'center'
ctx.textBaseline = 'middle'
ctx.fillText('✎', 50, 50)

// 导出为图片
const defaultAvatar = canvas.toDataURL('image/png') 