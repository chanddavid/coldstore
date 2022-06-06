let datatables =
        $('#user_roles_datatable').DataTable({
            pageLength: 10,
            fixedHeader: true,
            responsive: true,
            ajax: {
              url: "list/",
              type: "GET",
            },
            columns: [
                {"data": "id"},
                {"data": "user"},
                {"data": "roles"},
                {
                    data: null,
                    className: "center",
                    defaultContent: '<a onclick="delete_user_roles(this)" class="text-muted font-16" style="margin-right: 10px" id="delete_btn"><i class="fas fa-trash-alt"></i></a> ' +
                                    '<a onclick="get_user_role_edit_modal(this)" class="text-muted font-16" id="edit_btn"><i class="far fa-edit"></i></a>'
                }
            ],
            "sDom": 'rtip',
            columnDefs: [{
                targets: 'no-sort',
                orderable: false
            }],
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

$(document).on("submit", "#post_user_roles", function(e){
    e.preventDefault();
    let roles = [];
    let roleId = $(".chosen-select").select2('data')
    roleId.forEach(r=>{
       roles.push(r.id);
    })
    console.log(roles)
    console.log(typeof roles)
    $.ajax({
        url: "create/",
        type: "post",
        data: {
            user: $("#user").val(),
            roles: roles,
            csrfmiddlewaretoken: $("input[name='csrfmiddlewaretoken']").val(),
            action: "post",
        },
        success: function (data){
            console.log(data)
            toggleUserRolesModal();
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: `${data.user} assigned with role ${data.roles}`,
                showConfirmButton: false,
                timer: 1500
            })
            document.querySelector("#post_user_roles").reset();
            datatables.ajax.reload();
            $(".chosen-select").val(null).trigger("change");
        }
    })
})

function get_user_role_edit_modal(data){
    let user_roleId = $(data).parent().siblings()[0].textContent;
    $.ajax({
        url: "edit/"+user_roleId,
        type: "get",
        dataType: "json",
        success: function(data){
            toggleUserRolesEditModal(data)
        }
    })
}

function delete_user_roles(data){
    let user_roleId = $(data).parent().siblings()[0].textContent;
    let user = $(data).parent().siblings()[1].textContent;
    Swal.fire({
          title: 'Are you sure?',
          text: "You won't be able to revert this!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, delete it!',
        }).then((result) => {
          if (result.value) {
              console.log("User role result value is: ")
              console.log(result.value)
              Swal.fire(
              'Deleted!',
              `${user} role has been deleted.`,
              'success'
            )
              $.ajax({
                url: "delete/"+user_roleId,
                type: "delete",
                dataType: "json",
                success: function(){
                    $(data).parent().parent().remove();
                    datatables.ajax.reload();
                }
            });

          }
        })
}

$(document).on("submit", "#edit_user_roles", function (e){
    e.preventDefault();
    console.log("editing.....")
    console.log(e)
    let userRoleId = e.target.elements[1].value;
    console.log(userRoleId)
    let roles = []
    let roleId = $(".edit-chosen-select").select2('data');
    roleId.forEach(r=>{
        roles.push(r.id)
    });
    // $(".roles input[name='roles']:checked").each(function(){
    //     roles.push($(this).val())
    // });
    console.log(roles)
    $.ajax({
        url: "edit/"+userRoleId,
        type: "put",
        dataType: "json",
        data: {
            user: $("#edit_user").val(),
            roles: roles,
            csrfmiddlewaretoken: $("input[name='csrfmiddlewaretoken']").val(),
            action: "put"
        },
        success: function (){
            toggleUserRolesEditModal();
            datatables.ajax.reload();
        }
    })
})

$(function(){
    $(".chosen-select").select2({width: "100%"});
});
