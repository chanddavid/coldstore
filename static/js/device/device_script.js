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
  // console.log(status)
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
      // console.log(data)
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
  // console.log(deviceId)
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
      // console.log(data)
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
  // upper chart
  let canvasParent = document.getElementById('chart');
  canvasParent.innerHTML = ` <canvas id="myChart">
  </canvas>`
  let url = `ws://${window.location.host}/ws/async-get-real-time-data/${organization}/${freeze_id}/${device_name}`
  ws = new WebSocket(url);

  let myLine = null
  ws.onopen = function (e) {
    console.log("Connection is opened !!!!")
    console.log(e)
  }
  ws.onmessage = function (e) {
    let realdata = JSON.parse(e.data)["temp"]
    let device_id = JSON.parse(e.data)["d_id"]
    dataobjNew = dataobj['data']['datasets'][0]['data'];
    dataobjNew.shift();
    dataobjNew.push(realdata)
    dataobj['data']['datasets'][0]['data'] = dataobjNew
    window.myLine.update();

    //date and temperature
    currentDate(realdata, device_id)

  }
  ws.onclose = function (e) {
    console.log("Closed data from server")
    canvasParent.innerHTML = ''

  }
  dataobj = dataObjofUpperGraph()
  let cxt = document.getElementById('myChart').getContext('2d');
  if (myLine != null) {
    myLine.destroy();
  }
  window.myLine = new Chart(cxt, dataobj);

  // below graph
  let start = moment().subtract(29, 'days');
  let end = moment();
  function cb(start, end) {
    $('#reportrange span').html(start.format('MMMM D YYYY') + ' - ' + end.format('MMMM D YYYY'));
    start_date = start.format('MMMM D YYYY')
    end_date = end.format('MMMM D YYYY')

    let canvasParent = document.getElementById('mynew_Chart');
    canvasParent.innerHTML = ''
    canvasParent.innerHTML = `<canvas id="mynewChart" height="120px">
    </canvas>`
  
    let datesearchurl = `ws://${window.location.host}/ws/async-search-date/${organization}/${freeze_id}/${start_date}/${end_date}`
    datesearch_ws = new WebSocket(datesearchurl);
    secondChart(datesearch_ws)
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


