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
        {"data": "freeze_id"},
        {"data": "device_Name"},
        {"data": "organization"},
        {"data": "status"},
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
            freeze_id: $("input[name='freeze_id']").val(),
            device_Name: $("input[name='device_Name']").val(),
            organization: $("input[name='organization']").val(),
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
            freeze_id: $(".freeze_id input[name='freeze_id']").val(),
            device_Name: $(".device_name input[name='device_Name']").val(),
            organization: $(".organization input[name='organization']").val(),
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


function refresh_device(){
    console.log("i am clicked")
}