function currentDate(realdata, device_id) {
  let options = { year: 'numeric', month: 'long', day: 'numeric' }
  let today = new Date();
  // let dd = String(today.getDate()).padStart(2, '0');
  // let mm = String(today.getMonth() + 1).padStart(2, '0');
  // let yyyy = today.getFullYear();

  todaydate = today.toLocaleDateString("en-US", options)
  let newDate = document.getElementById("newDate")
  newDate.innerHTML = `<p id="newDate"><b>Date:</b> ${todaydate} &nbsp <b>Temp:</b> ${realdata}°c</p>`

  let deviceidgraph = document.getElementById("graph-title")
  deviceidgraph.innerHTML = `<h5 class="modal-title" id="graph-title">Temperature Graph of ${device_id}</h5>`
}
function canvasDestroy() {
  let canvasParent = document.getElementById('mynew_Chart');
  canvasParent.innerHTML = ''
  canvasParent.innerHTML = `<canvas id="mynewChart" height="120px"></canvas>`
}


function secondChart(datesearch_ws) {
  datesearch_ws.onopen = function (e) {
    console.log("Date search Connection is opened !!!!")
  }
  datesearch_ws.onmessage = function (e) {
    // console.log(e.data)
    let arr = []
    let mydata = []
    let jsobj = JSON.parse(e.data)["data_set"]
    if (jsobj.length != 0) {
      if (jsobj[0].hasOwnProperty("time")) {
        for (let i = 0; i < jsobj.length; i++) {
          arr.push(jsobj[i]['time'].slice(11, 19))
          mydata.push(jsobj[i]['temp'])
        }
      }
      else {
        // mydata = jsobj
        // for (let i = 0; i < jsobj.length; i++) {
        //   arr.push(i)
        for (let i = 0; i < jsobj.length; i++) {
          arr.push(jsobj[i]['dates'].slice(0, 11))
          mydata.push(jsobj[i]['temp'])
        }
      }
    }
    else {
      mydata = []
    }
    let min, max
    if (arr.length >= 1000) {
      console.log("true")
      min = arr.length - 1000,
        max = arr.length
    }
    else {
      console.log("false")
      min = 0,
        max = arr.length
    }
    console.log("array", arr)
    $('#mynew_Chart').highcharts({
      chart: {
        backgroundColor: '#FFFFFF',
        type: 'spline',
        marginLeft: 80,
        marginRight: 45,
        panning: true,
      },
      legend: {
        layout: 'horizontal',
        itemDistance: 25,
        symbolMargin: 10,
        itemStyle: {
          color: 'black',
          fontWeight: 'normal'
        }
      },
      title: {
        text: 'One Series = 1000 Data',
        style: {
          color: '#454545',
          font: 'sans-serif'
        }
      },
      subtitle: {
        text: 'Scrolls by 1000 Data',
        style: {
          color: '#454545',
          font: 'Verdana, sans-serif'
        }
      },
      plotOptions: {
        series: {
          lineWidth: 1,
          stickyTracking: false
        }
      },
      credits: {
        enabled: false
      },
      xAxis: {
        categories: arr,
        min: min,
        max: max,
        // labels: {
        //   style: {
        //     color: '#454545',
        //   }
        // },
      },
      yAxis: {
        title: {
          text: 'Temperature'
        },
        // labels: {
        //   style: {
        //     color: '#000000',
        //   }
        // },
      },
      exporting: {
        enabled: false
      },
      series: [{
        name: 'Series',
        data: mydata,
        color: '#ff6781',
        states: {
          hover: {
            enabled: false
          }
        },
      },]
    }, function (chart) { // on complete
      function noop() { };
      chart.renderer.button('<', chart.plotLeft - 90, chart.plotHeight - 110 + chart.plotTop, noop).addClass('left').add();


      chart.renderer.button('>', chart.plotLeft + chart.plotWidth + 0, chart.plotHeight + chart.plotTop - 110, noop).addClass('right').add();

      $('.left').click(function () {
        let { min, max, dataMin } = chart.xAxis[0].getExtremes()
        
        if (min - 1000 >= dataMin) {
          min -= 1000
          max -= 1000
        }
        else if (min - 1000 < dataMin) {
          min = 0
          max = 1000
        }
        chart.xAxis[0].setExtremes(min, max)
      });
      $('.right').click(function () {
        let { min, max, dataMax } = chart.xAxis[0].getExtremes()
       
        if (max + 1000 <= dataMax) {
          min += 1000
          max += 1000
        }
        else if (max == arr.length) {

        }
        else if (max + 1000 > dataMax) {
      
          min = max
          max = arr.length
        }
        chart.xAxis[0].setExtremes(min, max)
      }),
        Highcharts.addEvent(
          chart.container,
          document.onmousewheel === undefined ? 'DOMMouseScroll' : 'mousewheel',
          function (event) {
            const axis = chart.xAxis[0]
            extremes = axis.getExtremes()
            min = extremes.min
            max = extremes.max
            range = max - min
            if (min < 0) {
              console.log("i am min",min)
              console.log("negative")
              min = 0
              
              
              console.log(min)
            }
            if (min > 0) {
              console.log("positive")
              precision = range / 150
            }
            e = chart.pointer.normalize(event);

            let delta = e.deltaY,
              prevent = true;

            if (chart.isInsidePlot(e.chartX - chart.plotLeft, e.chartY - chart.plotTop)) {
              const proportion = (e.chartX - chart.plotLeft) / chart.plotWidth;
              axis.setExtremes(min + proportion * delta * precision, max)

              // Crosshair handling logic
              chart.yAxis.forEach(axis => {
                if (!(axis.pos < e.chartY && axis.pos + axis.len > e.chartY) && chart.hoverPoint && axis.cross) {
                  delete axis.cross.e
                }
              })

              if (prevent) {
                if (e) {
                  if (e.preventDefault) {
                    e.preventDefault();
                  }
                  if (e.stopPropagation) {
                    e.stopPropagation();
                  }
                  e.cancelBubble = true;
                }
              }
            }
          }
        );
    });
  }
  datesearch_ws.onclose = function (e) {
    console.log("date search connection closed", e);
    let canvasParent = document.getElementById('mynew_Chart');
    canvasParent.innerHTML = ''
  }
}

