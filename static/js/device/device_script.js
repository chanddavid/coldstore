let datatables = $('#device_datatable').DataTable({
  pageLength: 10,
  fixedHeader: true,
  responsive: true,
  ajax: {
    url: "list_device/",
    type: "GET",
  },
  columns: [
    { "data": "id" },
    { "data": "freeze_id" },
    {
      "data": "device_Name",
      "render": function (data, type, row, meta) {
        console.log(data)
        return `<a type="button" data-toggle="modal" data-target="#temp-graph" onclick="get_realtime_data_from_mqttbroker('${data}', '${row.freeze_id}', '${row.organization}')">${data}</a>`;
      }
    },
    { "data": "organization" },
    { "data": "status" },
    {
      data: null,
      className: "center",
      defaultContent: '<a href="javascript:void(0)" onclick="refresh_device(this)" class="text-muted font-16" style="margin-right: 10px" id="refresh_btn"><i class="fa-solid fa-arrow-rotate-right"></i></a>' +
        '<a href="javascript:void(0)" onclick="delete_device(this)" class="text-muted font-16" style="margin-right: 10px" id="delete_btn"><i class="fas fa-trash-alt"></i></a>' +
        '<a href="javascript:void(0)" onclick="get_device_edit_modal(this)" class="text-muted font-16" id="edit_btn"><i class="far fa-edit"></i></a>'
    }
  ],
  "sDom": 'rtip',
  columnDefs: [{
    targets: 'no-sort',
    orderable: false
  }]
});

$('#searchbar').on('keyup', function () {
  datatables.search(this.value).draw();
});

$('#key-search').on('keyup', function () {
  datatables.search(this.value).draw();
});
$('#type-filter').on('change', function () {
  datatables.column(4).search($(this).val()).draw();
});

$(document).on("submit", "#post_device", function (e) {
  e.preventDefault();
  let status
  let checkbox = document.getElementById('checkbox')
  if (checkbox.checked == true) {
    status = true
  }
  else {
    status = false
  }

  console.log(status)
  $.ajax({
    url: "create_device/",
    type: 'post',
    dataType: 'json',
    data: {
      freeze_id: $("input[name='freeze_id']").val(),
      device_Name: $("input[name='device_Name']").val(),
      organization: $("input[name='organization']").val(),
      // status: $("input[name='status']").val() 
      status: status,
      csrfmiddlewaretoken: $("input[name='csrfmiddlewaretoken']").val(),
      action: "post"
    },
    success: function (data) {
      console.log(data)
      toggleDeviceModal();
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: `${data.device_Name} Device has been created`,
        showConfirmButton: false,
        timer: 1500
      })
      document.querySelector('#post_device').reset();
      datatables.ajax.reload();
    }
  })
})

function delete_device(data) {
  let deviceId = $(data).parent().siblings()[0].textContent;
  let device = $(data).parent().siblings()[1].textContent;
  console.log(deviceId)
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this! ",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it'

  }).then(result => {
    if (result.value) {
      Swal.fire(
        'Deleted!',
        `Device ${device} has been deleted.`,
        'success'
      )
      $.ajax({
        url: "delete_device/" + deviceId,
        type: "delete",
        dataType: "json",
        success: function () {
          $(data).parent().parent().remove();
          datatables.ajax.reload();
        }
      })
    }
  })
}

function get_device_edit_modal(data) {
  let deviceId = $(data).parent().siblings()[0].textContent;
  $.ajax({
    url: "update_device/" + deviceId,
    type: "get",
    dataType: "json",
    success: function (data) {
      console.log(data)
      toggleEditDeviceModal(data);
    }
  })
}

$(document).on('submit', '#edit_device', function (e) {
  e.preventDefault();

  let status
  let checkbox = document.getElementById('editcheckbox')
  if (checkbox.checked == true) {
    status = true
  }
  else {
    status = false
  }
  let deviceId = e.target.elements[1].value;
  $.ajax({
    url: "update_device/" + deviceId,
    type: "put",
    dataType: "json",
    data: {
      freeze_id: $(".freeze_id input[name='freeze_id']").val(),
      device_Name: $(".device_name input[name='device_Name']").val(),
      organization: $(".organization input[name='organization']").val(),
      status: status,
      csrfmiddlewaretoken: $("input[name='csrfmiddlewaretoken']").val(),
      action: "put"
    },
    success: function () {
      $(".edit_device_modal").hide();
      datatables.ajax.reload();
    }
  })
})

let ws;

function get_realtime_data_from_mqttbroker(device_name, freeze_id, organization) {


  let canvasParent = document.getElementById('chart');
  canvasParent.innerHTML = ` <canvas id="myChart">
  </canvas>`

  let url = `ws://${window.location.host}/ws/async-get-real-time-data/${organization}/${freeze_id}/${device_name}`
  ws = new WebSocket(url);


  var myLine = null


  ws.onopen = function (e) {
    console.log("Connection is opened !!!!")
    console.log(e)
  }

  ws.onmessage = function (e) {

    console.log(JSON.parse(e.data))
    var realdata = JSON.parse(e.data)["temp"]

    console.log(typeof (realdata))
    console.log("Data: ", realdata)
    dataobjNew = dataobj['data']['datasets'][0]['data'];
    dataobjNew.shift();
    dataobjNew.push(realdata)
    dataobj['data']['datasets'][0]['data'] = dataobjNew
    window.myLine.update();

    //date and temperature
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0');
    let yyyy = today.getFullYear();

    today = yyyy + '-' + mm + '-' + dd;

    let newDate = document.getElementById("newDate")
    newDate.innerHTML = `<p id="newDate"><b>Date:</b> ${today}  &nbsp <b>Temperature:</b> ${realdata}°c</p>`




  }
  ws.onclose = function (e) {
    console.log("Closed data from server")
    let canvasParent = document.getElementById('chart')
    canvasParent.innerHTML = ''

  }
  var dataobj = {
    type: 'line',
    data: {
      labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],

      datasets: [{
        label: 'Freeze Temperature',
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
  var cxt = document.getElementById('myChart').getContext('2d');
  if (myLine != null) {
    myLine.destroy();
  }
  window.myLine = new Chart(cxt, dataobj);

  // below graph
  $(function () {
    var start = moment().subtract(29, 'days');
    var end = moment();
    function cb(start, end) {
      $('#reportrange span').html(start.format('MMMM D YYYY') + ' - ' + end.format('MMMM D YYYY'));
      console.log("the date is ", start.format('MMMM D YYYY'), end.format('MMMM D YYYY'))
      start_date = start.format('MMMM D YYYY')
      end_date = end.format('MMMM D YYYY')

      let canvasParent = document.getElementById('mynew_Chart');
      canvasParent.innerHTML = ''
      canvasParent.innerHTML = `<canvas id="mynewChart" height="120px">
      </canvas>`

      let datesearchurl = `ws://${window.location.host}/ws/async-search-date/${organization}/${freeze_id}/${start_date}/${end_date}`
      datesearch_ws = new WebSocket(datesearchurl);

      datesearch_ws.onopen = function (e) {
        console.log("Date search Connection is opened !!!!")
        console.log(e)
      }

      datesearch_ws.onmessage = function (e) {

        let jsobj = JSON.parse(e.data)["data_set"]
        console.log("jsobj", jsobj)
        let arr = []
        for (let i = 0; i < jsobj.length; i++) {
          arr.push(i)
        }
        console.log(arr)
        // movechart plugib block


        const data = {
          labels: arr,
          datasets: [{
            label: 'Last 2 Hour Data (Covers 500 Data) ',
            data: jsobj,
            backgroundColor: [
              'rgba(240, 99, 132, 0.2)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)'
            ],
            borderWidth: 1,
            tension: 0.4,
            pointRadius: 0.5

          }]
        }
        const moveChart = {
          id: 'moveChart',
          afterEvent(chart, args) {
            const { ctx, canvas, chartArea: { left, right, top, bottom, width, height } } = chart
            canvas.addEventListener('mousemove', (event) => {
              console.log(event)
              const x = args.event.x
              const y = args.event.y
              console.log(x + '-' + y)
              if (x >= left - 15 && x <= left + 15 && y >= height / 2 + top - 15 && y <= height / 2 + top + 15) {
                canvas.style.cursor = 'pointer'
                console.log("okay");
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
            const { ctx, chartArea: { left, right, top, bottom, width, height } } = chart

            class CircleArrow {
              draw(ctx, x1, pixel) {
                const angle = Math.PI / 180
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

                console.log(chart)
              }
            }
            let drawCircleLeft = new CircleArrow()
            drawCircleLeft.draw(ctx, left, 5)

            let drawCircleRight = new CircleArrow()
            drawCircleRight.draw(ctx, right, -5)


          }
        }
        

        const config = {
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
                min: arr.length-500,
                max: arr.length
              },
              y: {
                beginAtZero: true
              }
            }
          },
          plugins: [moveChart]

        }
        var mynewChart = document.getElementById('mynewChart').getContext('2d');
        var crt = new Chart(mynewChart, config);
        function moveScroll() {
          const { ctx,canvas, chartArea: { left, right, top, bottom, width, height } } = crt
          canvas.addEventListener('click', (event) => {
            const rect = canvas.getBoundingClientRect()
            const x = event.clientX - rect.left
            const y = event.clientY - rect.top
            console.log("value of x", x)
            console.log("value of y", y);

            if (x >= left - 15 && x <= left + 15 && y >= height / 2 + top - 15 && y <= height / 2 + top + 15) {
              crt.options.scales.x.min = crt.options.scales.x.min - 100
              crt.options.scales.x.max = crt.options.scales.x.max - 100
              if (crt.options.scales.x.min <= 0) {
                crt.options.scales.x.min = 0
                crt.options.scales.x.max = 500
              }
              crt.update()
            }

            if (x >= right - 15 && x <= right + 15 && y >= height / 2 + top - 15 && y <= height / 2 + top + 15) {
              crt.options.scales.x.min = crt.options.scales.x.min + 100
              crt.options.scales.x.max = crt.options.scales.x.max + 100
              if (crt.options.scales.x.max >= data.datasets[0].data.length) {
                crt.options.scales.x.min = data.datasets[0].data.length - 100
                crt.options.scales.x.max = data.datasets[0].data.length
              }
              crt.update()
            }

          })
        }
        crt.ctx.onclick = moveScroll()

      }
      datesearch_ws.onclose = function (e) {
        console.log("date search connection closed", e);
        let canvasbelowParent = document.getElementById('mynew_Chart')
        canvasbelowParent.innerHTML = ''
      }

    }

    $('#reportrange').daterangepicker({
      startDate: start,
      endDate: end,
      ranges: {
        'Today': [moment(), moment()],
        'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
        'Last 30 Days': [moment().subtract(29, 'days'), moment()],
        'This Month': [moment().startOf('month'), moment().endOf('month')],
        'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
      }
    }, cb);

    cb(start, end);




  });


}



function refresh_device(data) {
  // let deviceId = $(data).parent().siblings()[0].textContent;
  // $.ajax({
  //     url: "update_device/"+deviceId,
  //     type: "get",
  //     dataType: "json",
  //     success: function(data){
  //         console.log(data)
  //         $.ajax({
  //             url: "mqtt_device_details/",
  //             type: "post",
  //             data:data,
  //             dataType: "json",
  //             success: function(data){
  //                 console.log(data)
  //             }
  //         })

  //     }
  // })

  // console.log("i am clicked")
  ws.close();
}


