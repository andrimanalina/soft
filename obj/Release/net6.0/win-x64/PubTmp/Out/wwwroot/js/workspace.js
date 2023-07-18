$(document).ready(() => {
    GetMyWorkspace();
});



$("#w-search").on("keyup", function () {
    var value = $(this).val().toLowerCase();
    $(`[data-type="workspace"] .w-name`).filter(function () {
        var parent = $(this).closest(`[data-type="workspace"]`);
        parent.toggle(parent.text().toLowerCase().indexOf(value) > -1);
    });
});

function GetMyWorkspace() {
	let formData = new FormData();
    
	formData.append("me.Mail", User.Username);
	formData.append("me.Password", User.Password);

	$.ajax({
		type: "POST",
        url: Origin + "Workspace/GetMyWorkspace",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        async: true,

        success: function (result) {
            Datas = JSON.parse(result);
            if (result == "login") {
                ToLogin();
            }
            if (result == "error") {
                Toast.fire({
                    icon: 'error',
                    title: Datas.msg
                });
            }

			let code = ``;
            $.each(Datas.data, function (k, v) {
                code += `
                    <div class="col-lg-3 col-6" data-type="workspace" workspace-id="${v.Id}" style="cursor:pointer">
                        <div class="small-box small-box2" style="background:${v.Background}">
                            <div class="inner">
                                <h5 class="w-name text-bold text-white" workspace-name>${v.Name}</h5>
                            </div>
                        </div>
                    </div>
                `;
            });
            $(`[workspace-new]`).before(code);
		},

		Error: function (x, e) {
			alert("Some error");
			//loading(false);
		}
	});
}

$(document).on('click', '[workspace-id]', (e) => {
    let id = $(e.target).closest("[workspace-id]").attr("workspace-id");

    window.location = Origin + `Workspace/${id}`;
});


$(document).on('mousedown', '[workspace-id]', (e) => {
    setTimeout(function () {
        let header = $(e.target).closest("[workspace-id]");
        let id = header.attr("workspace-id");
        let name = header.find("[workspace-name]").text();

        WorkspaceParameter(id, name);
        // You are now in a hold state, you can do whatever you like!
    }, 500);
});

function WorkspaceParameter(id, name) {
    $("#modal-workspace-parameter").modal("show");
    let Mid = $("#modal-workspace-parameter").find("[workspace-modal-id]");
    console.log(Mid);
    let Mname = $("#modal-workspace-parameter").find("[workspace-modal-name]");
    console.log(Mname);
    Mid.attr("workspace-modal-id", id);
    Mname.text(name);
}

$(document).on('mousedown', '[workspace-delete]', (e) => {

    let id = $("#modal-workspace-parameter").find("[workspace-modal-id]").attr("workspace-modal-id");
    let name = $("#modal-workspace-parameter").find("[workspace-modal-name]").text();

    let formData = new FormData();

    formData.append("me.Mail", User.Username);
    formData.append("me.Password", User.Password);
    formData.append("workspaceId", id);

    $.ajax({
        type: "POST",
        url: Origin + "Workspace/Delete",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        async: true,

        success: function (result) {
            Datas = JSON.parse(result);
            if (result == "login") {
                ToLogin();
            }
            if (result == "error") {
                Toast.fire({
                    icon: 'error',
                    title: Datas.msg
                });
                return;
            }

            $(`[workspace-id="${id}"]`).remove();
            Toast.fire({
                icon: 'success',
                title: `L'espace de travail "${name}" a été supprimé avec succès`
            });
        },

        Error: function (x, e) {
            alert("Some error");
            //loading(false);
        }
    });
});
