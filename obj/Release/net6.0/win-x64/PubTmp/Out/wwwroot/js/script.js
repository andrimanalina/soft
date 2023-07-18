$(document).ready(() => {
    $(".my-colorpicker").colorpicker();
    $('.my-colorpicker').on('colorpickerChange', function (event) {
        $('.my-colorpicker .fa-square').css('color', event.color.toString());
    });

    $(".my-colorpicker2").colorpicker();
    $('.my-colorpicker2').on('colorpickerChange', function (event) {
        $('.my-colorpicker2 .fa-square').css('color', event.color.toString());
    });
});



$("#w-search").on("keyup", function () {
    var value = $(this).val().toLowerCase();
    $(`[data-type="workspace"] .w-name`).filter(function () {
        var parent = $(this).closest(`[data-type="workspace"]`);
        parent.toggle(parent.text().toLowerCase().indexOf(value) > -1);
    });
});

function GetWorkspace(id) {
    let formData = new FormData();

    formData.append("me.Mail", "test");
    formData.append("me.Password", "123");
    formData.append("workspaceId", id);

    var user = {
        Mail: "test",
        Password: "123"
    }

    $.ajax({
        type: "POST",
        url: "../Workspace/GetWorkspace",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        async: true,

        success: function (result) {
            if (result == "error") {
                window.location = "../";
            }
            Workspace = JSON.parse(result).data;
            console.log(Workspace);
            let code = ``;
            $(`#w-detail`).text("");
            code += `
                <div class="row ml-5">
                    <div class="info-box2" data-detail-id="${Workspace.Id}">
                        <span class="info-box-icon bg-info">${Workspace.Name.substring(0, 1).toUpperCase()}</span>

                        <div class="info-box-content">
                            <h3 class="info-box-text">${Workspace.Name}</h3>
                            <span class="info-box-text small">${Workspace.WebSite}</span>
                        </div>
                    </div>
                    <span class="small small-description">${Workspace.Description}</span>
                </div>
            `;
            $(`#w-detail`).append(code);

            code = ``;
            $(`#b-list`).text("");

            $.each(Workspace.Boards, function (k, v) {
                code += CreateBBox(v.Id, v.Name, v.Background);
            });
            code += CreateNewBBox();
            $(`#b-list`).append(code);


            $(`#workspace-list`).hide();
            $(`#workspace-detail`).show();
        },

        Error: function (x, e) {
            alert("Some error");
            //loading(false);
        }
    });
}

function CreateWorkspace() {
    let formData = new FormData();

    formData.append("me.Mail", "test");
    formData.append("me.Password", "123");
    formData.append("workspace.Name", $("#workspace-name").val());
    formData.append("workspace.Background", $("#workspace-color").val());


    var user = {
        Mail: "test",
        Password: "123"
    }

    $.ajax({
        type: "POST",
        url: "../Workspace/CreateWorkspace",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        async: true,

        success: function (result) {
            if (result == "error") {
                window.location = "../";
            }
            Datas = JSON.parse(result);
            console.log(Datas);
            let code = ``;
            GetWorkspace($("[data-detail-id]").attr("data-detail-id"));
            $("#dismiss-modal-workflow").click();
        },

        Error: function (x, e) {
            alert("Some error");
            //loading(false);
        }
    });
}

function CreateBoard() {
    let formData = new FormData();

    formData.append("me.Mail", "test");
    formData.append("me.Password", "123");
    formData.append("workspace.Id", $("[data-detail-id]").attr("data-detail-id"));
    formData.append("board.Name", $("#board-name").val());
    formData.append("board.Background", $("#board-color").val());


    var user = {
        Mail: "test",
        Password: "123"
    }

    $.ajax({
        type: "POST",
        url: "../Board/CreateBoard",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        async: true,

        success: function (result) {
            if (result == "error") {
                window.location = "../";
            }
            Datas = JSON.parse(result);
            console.log(Datas);
            let code = ``;
            GetWorkspace($("[data-detail-id]").attr("data-detail-id"));
            $("#dismiss-modal-workflow").click();
        },

        Error: function (x, e) {
            alert("Some error");
            //loading(false);
        }
    });
}