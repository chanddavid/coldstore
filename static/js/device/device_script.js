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
        return `<a type="button" data-toggle="modal" data-target="#temp-graph" onclick="get_realtime_data_from_mqttbroker('${data}')">${data}</a>`;
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

function get_realtime_data_from_mqttbroker(data) {
  let canvasParent = document.getElementById('chart')
  canvasParent.innerHTML = ` <canvas id="myChart">

    </canvas>`

  let url = `ws://${window.location.host}/ws/async-get-real-time-data/`
  ws = new WebSocket(url);
  var myLine = null

  ws.onopen = function (e) {
    console.log("Connection is opened !!!!")
    console.log(e)
  }

  ws.onmessage = function (e) {
    console.log(JSON.parse(e.data))


    let data = JSON.parse(e.data)["temp"]

    console.log(typeof (data))
    console.log("Data: ", data)
    dataobjNew = dataobj['data']['datasets'][0]['data'];
    dataobjNew.shift();
    dataobjNew.push(data)
    dataobj['data']['datasets'][0]['data'] = dataobjNew
    window.myLine.update();


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
  var ctx = document.getElementById('myChart').getContext('2d');
  if (myLine != null) {
    myLine.destroy();
  }
  //myChart = new Chart(ctx, dataobj);
  window.myLine = new Chart(ctx, dataobj);


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


document.getElementById("close-socket").addEventListener("click", (e) => {
  e.preventDefault();
  ws.close();
})

// function close_connection(){
//     ws.close();
// }





