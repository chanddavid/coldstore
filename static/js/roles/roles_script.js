let datatables = $('#role_datatable').DataTable({
    pageLength: 10,
    fixedHeader: true,
    responsive: true,
    ajax: {
      url: "list/",
      type: "GET",
    },
    columns: [
        {"data": "id"},
        {"data": "name"},
        {
            data: null,
            className: "center",
            defaultContent: '<a href="javascript:void(0)" onclick="delete_role(this)" class="text-muted font-16" style="margin-right: 10px" id="delete_btn"><i class="fas fa-trash-alt"></i></a>' +
                            '<a href="javascript:void(0)" onclick="get_role_edit_modal(this)" class="text-muted font-16" id="edit_btn"><i class="far fa-edit"></i></a>'
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

$(document).on("submit", "#post_role", function (e){
    e.preventDefault();
    $.ajax({
        url: "create/",
        type: 'post',
        dataType: 'json',
        data: {
            name: $("input[name='name']").val(),
            csrfmiddlewaretoken: $("input[name='csrfmiddlewaretoken']").val(),
            action: "post"
        },
        success: function(data){
            toggleRoleModal();
            Swal.fire({
                position: 'top-end',
                icon: 'success',
                title: `${data.name} role has been created`,
                showConfirmButton: false,
                timer: 1500
            })
            document.querySelector('#post_role').reset();
            datatables.ajax.reload();
        }
    })
})

function delete_role(data){
    let roleId = $(data).parent().siblings()[0].textContent;
    let role = $(data).parent().siblings()[1].textContent;
    console.log(roleId)
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
                `Role ${role} has been deleted.`,
                'success'
            )
            $.ajax({
                url: "delete/"+roleId,
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

function get_role_edit_modal(data){
    let roleId = $(data).parent().siblings()[0].textContent;
    $.ajax({
        url: "edit/"+roleId,
        type: "get",
        dataType: "json",
        success: function(data){
            console.log(data)
            toggleEditRoleModal(data);
        }
    })
}

$(document).on('submit', '#edit_role', function(e){
    e.preventDefault();
    let roleId = e.target.elements[1].value;
    $.ajax({
        url: "edit/"+roleId,
        type: "put",
        dataType: "json",
        data: {
            name: $(".role_name input[name='name']").val(),
            csrfmiddlewaretoken: $("input[name='csrfmiddlewaretoken']").val(),
            action: "put"
        },
        success: function (){
            $(".edit_role_modal").hide();
            datatables.ajax.reload();
        }
    })
})