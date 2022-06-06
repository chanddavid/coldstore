let datatables =
 $('#user_datatable').DataTable({
     pageLength: 10,
     fixedHeader: true,
     responsive: true,
     ajax: {
       url: "list/",
       type: "GET",
     },
     columns: [
         {"data": "id"},
         {"data": "user_name"},
         {"data": "first_name"},
         {"data": "last_name"},
         {"data": "email"},
         {"data": "organization"},
         {"data": "is_superuser"},
         {"data": "is_active"},
         {
             data: null,
             className: "center",
             defaultContent: '<a href="javascript:void(0)" onclick="delete_user(this)" class="text-muted font-16" style="margin-right: 10px" id="delete_btn"><i class="fas fa-trash-alt"></i></a>' +
                             '<a href="javascript:void(0)" onclick="get_edit_modal(this);" class="text-muted font-16" id="edit_btn"><i class="far fa-edit"></i></a>'

         }
     ],
    "sDom": 'rtip',
     columnDefs: [
         {
            targets: 'no-sort',
            orderable: false
        },
        //  {
        //     "searchable": false,
        //     "orderable": false,
        //     "targets": 0
        // }
     ],
     // "order": [[ 1, 'asc' ]],
     aoColumnDefs: [
         {
             aTargets: 4,
             fnCreatedCell: function (td) {
                 $(td).css('word-break', 'break-all');
             }
         },
     ]
});

 // datatables.on( 'order.dt search.dt', function () {
 //        datatables.column(0, {search:'applied', order:'applied'}).nodes().each( function (cell, i) {
 //            cell.innerHTML = i+1;
 //        } );
 //    } ).draw();

$('#searchbar').on('keyup', function() {
    datatables.search(this.value).draw();
});

$('#key-search').on('keyup', function() {
    datatables.search(this.value).draw();
});
$('#type-filter').on('change', function() {
    datatables.column(4).search($(this).val()).draw();
});


$(document).on("submit", "#post_user", function (e){
    e.preventDefault();
    console.log("User posting....")
    $.ajax({
        url: "create/",
        type: "post",
        dataType: "json",
        data: {
            first_name: $("#first_name").val(),
            last_name: $("#last_name").val(),
            user_name: $("#user_name").val(),
            password: $("#password").val(),
            email: $("#email").val(),
            team: $("#team").val(),
            is_superuser: $("input[name='is_superuser']:checked").val(),
            is_active: $("input[name='is_active']:checked").val(),
            csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
            action: "post"
        },
        success: function(data) {
            toggleUserModal();
            Swal.fire({
                position: 'top-end',
                icon: 'success',
                title: `${data.user_name} has been created`,
                showConfirmButton: false,
                timer: 1500
            })
            document.querySelector("#post_user").reset();
            datatables.ajax.reload();
        },
        error: function(data){
            console.log("Errorr......")
        }

    })
})

function delete_user(data){
    let userId = $(data).parent().siblings()[0].textContent;
    let user = $(data).parent().siblings()[1].textContent;
    console.log("I am here....")
    Swal.fire({
        title: 'Are you sure?',
        text: 'Enter password',
        input: 'password',
        preConfirm: (password) => {
            return fetch(`deleteConf/`, {
                method: "post",
                body: JSON.stringify({
                    password:password
                }),
                headers: {
                    'Content-type': 'application/json; charset=UTF-8\''
                }

            })
                .then(response=>{
                    if(!response.ok){
                        throw new Error("Invalid Password...")
                    }
                    return response
                })
                .catch(error => {
                    Swal.showValidationMessage(
                         `${error}`
                    )
                })
        },
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: "#d33",
        confirmButtonText: 'Yes, delete it',
        }).then((result)=>{
            if(result.value){
                console.log("Result Value is: ")
                console.log(result.value)
                Swal.fire(
                    'Deleted!',
                    `User ${user} has been deleted.`,
                    'success'
                )
                $.ajax({
                url: 'delete/'+userId,
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

function get_edit_modal(data){
    let userId = $(data).parent().siblings()[0].textContent;
    $.ajax({
        url: 'edit/'+userId,
        type: "get",
        dataType: "json",
        success: function (data){
            toggleUserEditModal(data);
        }
    })
}

$(document).on("submit", "#edit_user", function(e){
    e.preventDefault();
    console.log("editing.....")
    let userId = e.target.elements[1].value;
    $.ajax({
        url: 'edit/'+userId,
        type: "post",
        dataType: "json",
        data: {
            first_name: $("#edit_first_name").val(),
            last_name: $("#edit_last_name").val(),
            user_name: $("#edit_user_name").val(),
            email: $("#edit_email").val(),
            team: $("#edit_team").val(),
            is_superuser: $(".edit_is_superuser input[name='is_superuser']:checked").val(),
            is_active: $(".edit_is_active input[name='is_active']:checked").val(),
            csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
            action: "put"
        },
        success: function(){
            $(".edit_user_modal").hide();
            Swal.fire({
                position: 'top-end',
                icon: 'success',
                title: `Updated Successfully`,
                showConfirmButton: false,
                timer: 1500
            })
            datatables.ajax.reload();
        }

    })
})


