let datatables = $('#device_datatable').DataTable({
    pageLength: 10,
    fixedHeader: true,
    responsive: true,
    ajax: {
      url: "list_device/",
      type: "GET",
    },
    columns: [  
        {"data": "id"},
        {
            "data": "device_Name",
            "render": function(data, type, row, meta){
                return `<a onclick="get_realtime_data_from_mqttbroker('${data}')">${data}</a>`;
            }
        },
        {"data": "store"},
        {"data": "data"},
        {"data": "status"},
        {
            data: null,
            className: "center",
            defaultContent: '<a href="javascript:void(0)" onclick="delete_device(this)" class="text-muted font-16" style="margin-right: 10px" id="delete_btn"><i class="fas fa-trash-alt"></i></a>' +
                            '<a href="javascript:void(0)" onclick="get_device_edit_modal(this)" class="text-muted font-16" id="edit_btn"><i class="far fa-edit"></i></a>'
        }
    ],
    "sDom": 'rtip',
    columnDefs: [{
        targets: 'no-sort',
        orderable: false
    }]
});

$('#searchbar').on('keyup', function() {
    datatables.search(this.value).draw();
});

$('#key-search').on('keyup', function() {
    datatables.search(this.value).draw();
});
$('#type-filter').on('change', function() {
    datatables.column(4).search($(this).val()).draw();
});

$(document).on("submit", "#post_device", function (e){
    e.preventDefault();
    let status
    let checkbox=document.getElementById('checkbox')
    if (checkbox.checked==true){
        status=true
    }
    else{
       status=false
    }

    console.log(status)
    $.ajax({
        url: "create_device/",
        type: 'post',
        dataType: 'json',
        data: {
            device_Name: $("input[name='device_Name']").val(),
            store: $("input[name='store']").val(),
            data: $("input[name='data']").val(),
            // status: $("input[name='status']").val() 
            status: status,
            csrfmiddlewaretoken: $("input[name='csrfmiddlewaretoken']").val(),
            action: "post"
        },
        success: function(data){
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

function delete_device(data){
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

    }).then(result=>{
        if(result.value){
            Swal.fire(
                'Deleted!',
                `Device ${device} has been deleted.`,
                'success'
            )
            $.ajax({
                url: "delete_device/"+deviceId,
                type: "delete",
                dataType: "json",
                success: function (){
                    $(data).parent().parent().remove();
                    datatables.ajax.reload();
                }
            })
        }
    })
}

function get_device_edit_modal(data){
    let deviceId = $(data).parent().siblings()[0].textContent;
    $.ajax({
        url: "update_device/"+deviceId,
        type: "get",
        dataType: "json",
        success: function(data){
            console.log(data)
            toggleEditDeviceModal(data);
        }
    })
}

$(document).on('submit', '#edit_device', function(e){
    e.preventDefault();

    let status
    let checkbox=document.getElementById('editcheckbox')
    if (checkbox.checked==true){
        status=true
    }
    else{
       status=false
    }
    let deviceId = e.target.elements[1].value;
    $.ajax({
        url: "update_device/"+deviceId,
        type: "put",
        dataType: "json",
        data: {
            device_Name: $(".device_name input[name='device_Name']").val(),
            store: $(".store input[name='store']").val(),
            data: $(".data input[name='data']").val(),
            status: status,
            csrfmiddlewaretoken: $("input[name='csrfmiddlewaretoken']").val(),
            action: "put"
        },
        success: function (){
            $(".edit_device_modal").hide();
            datatables.ajax.reload();
        }
    })
})


function get_realtime_data_from_mqttbroker(data){
    const clientId = 'mqttjs_' + Math.random().toString(16).substring(2, 10)
    const options = {
        // keepalive: 60,
        clientId: clientId,
        // Clean session
        clean: true,
        connectTimeout: 4000,
        // Auth
        // clientId: 'emqx_test',
        // username: 'emqx_test',
        // password: 'emqx_test',
      }
    
    const client = mqtt.connect('10.10.5.82', options);

    client.on('connect', function (connack) {
        console.log('Connected');
        // Publish

        // setInterval(()=>{
        //     client.publish('test', 'ws connection demo...!', { qos: 0, retain: false }, function(error){
        //         if(error){
        //             console.log("Error while publishing.")
        //         }
        //         else{
        //             console.log("Message sent")
        //             client.subscribe('test')
        //         }
        //     })
            
        // },5000);

        client.subscribe('esp32/temperature');
        
        client.on('message', function (topic, message) {
            // message is Buffer
            console.log(message.toString())
            // client.end()
        })

        // client.subscribe('test', function (err) {
        //     if (!err) {
        //       client.publish('test', 'Hello mqtt')
        //     }
        //   })

    })
}



