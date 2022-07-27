function currentDate(realdata, device_id) {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0');
    let yyyy = today.getFullYear();
  
    todaydate = yyyy + '-' + mm + '-' + dd;
    let newDate = document.getElementById("newDate")
    newDate.innerHTML = `<p id="newDate"><b>Date:</b> ${todaydate}  &nbsp <b>Temperature:</b> ${realdata}°c</p>`
  
    let deviceidgraph = document.getElementById("graph-title")
    deviceidgraph.innerHTML = `<h5 class="modal-title" id="graph-title">Temperature Graph of ${device_id}</h5>`
  }
function dataObjofUpperGraph() {
    let dataobj = {
      type: 'line',
      data: {
        labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  
        datasets: [{
          label: 'Temperature',
          borderColor: "rgb(220,20,60)",
          borderWidth: 2,
          fill: true,
          backgroundColor: "rgba(255,99,132,0.2)",
          data: [65, 59, 80, 81, 30, 23, 54, 12, 23, 34],
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          },
          x: {
            beginAtZero: true
          }
        },
        animation: true,
  
      }
    }
    return dataobj
  }
function secondChart(datesearch_ws){
    datesearch_ws.onopen = function (e) {
      console.log("Date search Connection is opened !!!!")
    }
    datesearch_ws.onmessage = function (e) {
      let jsobj = JSON.parse(e.data)["data_set"]
      let arr = []
      for (let i = 0; i < jsobj.length; i++) {
        arr.push(i)
      }
      // movechart plugib block
      let data = {
        labels: arr,
        datasets: [{
          label: 'Covers 2000 Data',
          data: jsobj,
          backgroundColor: [
            'rgba(240, 99, 132, 0.2)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)'
          ],
          borderWidth: 1,
          tension: 0.5,
          pointRadius: 0.5
  
        }]
      }
      let moveChart = {
        id: 'moveChart',
        afterEvent(chart, args) {
          let { ctx, canvas, chartArea: { left, right, top, bottom, width, height } } = chart
          canvas.addEventListener('mousemove', (event) => {
  
            let x = args.event.x
            let y = args.event.y
  
            if (x >= left - 15 && x <= left + 15 && y >= height / 2 + top - 15 && y <= height / 2 + top + 15) {
              canvas.style.cursor = 'pointer'
            }
            else if (x >= right - 15 && x <= right + 15 && y >= height / 2 + top - 15 && y <= height / 2 + top + 15) {
              canvas.style.cursor = 'pointer'
            }
            else {
              canvas.style.cursor = 'default'
            }
          })
        },
        afterDraw(chart, args, pluginOptions) {
          let { ctx, chartArea: { left, right, top, bottom, width, height } } = chart
          class CircleArrow {
            draw(ctx, x1, pixel) {
              let angle = Math.PI / 180
              ctx.beginPath()
              ctx.lineWidth = 3
              ctx.strokeStyle = 'rgba(102,102,102,0.5)'
              ctx.fillStyle = 'white'
              ctx.arc(x1, (height / 2) + top, 15, angle * 0, angle * 360, false)
              ctx.stroke()
              ctx.fill()
              ctx.closePath()
              // // movechart arrow
              ctx.beginPath()
              ctx.lineWidth = 3
              ctx.strokeStyle = 'rgba(255,26,104,1)'
              ctx.moveTo(x1 + pixel, height / 2 + top - 7.5)
              ctx.lineTo(x1 - pixel, height / 2 + top)
              ctx.lineTo(x1 + pixel, height / 2 + top + 7.5)
              ctx.stroke()
              ctx.closePath()
  
            }
          }
          let drawCircleLeft = new CircleArrow()
          drawCircleLeft.draw(ctx, left, 5)
  
          let drawCircleRight = new CircleArrow()
          drawCircleRight.draw(ctx, right, -5)
        }
      }
      let config = {
        type: 'line',
        data,
        options: {
          layout: {
            padding: {
              right: 18
            }
          },
          scales: {
            x: {
              min: arr.length - 2000,
              max: arr.length
            },
            y: {
              beginAtZero: true
            }
          }
        },
        plugins: [moveChart]
      }
      let mynewChart = document.getElementById('mynewChart').getContext('2d');
      let crt = new Chart(mynewChart, config);
      function moveScroll() {
        let { ctx, canvas, chartArea: { left, right, top, bottom, width, height } } = crt
        canvas.addEventListener('click', (event) => {
          let rect = canvas.getBoundingClientRect()
          let x = event.clientX - rect.left
          let y = event.clientY - rect.top
  
  
          if (x >= left - 15 && x <= left + 15 && y >= height / 2 + top - 15 && y <= height / 2 + top + 15) {
            crt.options.scales.x.min = crt.options.scales.x.min - 1000
            crt.options.scales.x.max = crt.options.scales.x.max - 1000
            if (crt.options.scales.x.min <= 0) {
              crt.options.scales.x.min = 0
              crt.options.scales.x.max = 1000
            }
          }
  
          if (x >= right - 15 && x <= right + 15 && y >= height / 2 + top - 15 && y <= height / 2 + top + 15) {
            crt.options.scales.x.min = crt.options.scales.x.min + 1000
            crt.options.scales.x.max = crt.options.scales.x.max + 1000
            if (crt.options.scales.x.max >= data.datasets[0].data.length) {
              crt.options.scales.x.min = data.datasets[0].data.length - 1000
              crt.options.scales.x.max = data.datasets[0].data.length
            }
          }
          crt.update()
  
        })
      }
      crt.ctx.onclick = moveScroll()
  
    }
    datesearch_ws.onclose = function (e) {
      console.log("date search connection closed", e);
      let canvasParent = document.getElementById('mynew_Chart');
      canvasParent.innerHTML = ''
    }
  }

function canvasDestroy(){
  let canvasParent = document.getElementById('mynew_Chart');
  canvasParent.innerHTML = ''
  canvasParent.innerHTML = `<canvas id="mynewChart" height="120px"></canvas>`
}
