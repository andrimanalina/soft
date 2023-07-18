let WorkspaceId = "";

$(document).ready(() => {
    let WorkspaceUrl = window.location.href;
    WorkspaceId = WorkspaceUrl.split("/").pop();

    GetWorkspace();

    $('.board-cpicker').colorpicker();
    let col1 = $("#b-color1").val();
    let col2 = $("#b-color2").val();
    $(`[data-colorpicker-id="3"] .fa-square`).css('color', col1);
    $(`[data-colorpicker-id="4"] .fa-square`).css('color', col2);

    $("#b-color").css('background', `linear-gradient(-45deg, ${col1}, ${col2})`);
    $("#b-color").attr("data-color", `linear-gradient(-45deg, ${col1}, ${col2})`);
});

$(document).on('colorpickerChange', '.board-cpicker', (e) => {
    let header = $(e.target).closest(`div`);
    header.find(".fa-square").css('color', e.color.toString());
    let col1 = $("#b-color1").val();
    let col2 = $("#b-color2").val();
    $("#b-color").css('background', `linear-gradient(-45deg, ${col1}, ${col2})`);
    $("#b-color").attr("data-color", `linear-gradient(-45deg, ${col1}, ${col2})`);
});

$("#b-search").on("keyup", function () {
    var value = $(this).val().toLowerCase();
    $(`[data-type="board"] .b-name`).filter(function () {
        var parent = $(this).closest(`[data-type="board"]`);
        parent.toggle(parent.text().toLowerCase().indexOf(value) > -1);
    });
});

function GetWorkspace() {
    let formData = new FormData();

    formData.append("me.Mail", User.Username);
    formData.append("me.Password", User.Password);
    formData.append("workspaceId", WorkspaceId);

    $.ajax({
        type: "POST",
        url: Origin + "Workspace/GetWorkspace",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        async: true,

        success: function (result) {
            Datas = JSON.parse(result);
            console.log(Datas)
            if (Datas.type == "login") {
                ToLogin();
            }
            if (Datas.type == "error") {
                Toast.fire({
                    icon: 'error',
                    title: Datas.msg
                });
                window.location = Origin + `/Workspace`;
            }
            let Workspace = Datas.data;
            let abbrev = Workspace.Abrev != "" ? `[${Workspace.Abrev}]` : "";
            $(`[workspace-sigle]`).text(Workspace.Name.substring(0,1).toUpperCase());
            $(`[workspace-sigle]`).css("background", Workspace.Background);
            $(`[workspace-title]`).text(Workspace.Name);
            $(`[workspace-abrev]`).text(`${abbrev}`);
            $(`[workspace-website]`).text(`${Workspace.WebSite}`);
            $(`[workspace-description]`).text(`${Workspace.Description}`);

            GetBoard();
        },

        Error: function (x, e) {
            alert("Some error");
            //loading(false);
        }
    });
}

function GetBoard() {
    let formData = new FormData();

    formData.append("me.Mail", User.Username);
    formData.append("me.Password", User.Password);
    formData.append("workspaceId", WorkspaceId);

    $.ajax({
        type: "POST",
        url: Origin + "Board/GetMyBoard",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        async: true,

        success: function (result) {
            Datas = JSON.parse(result);

            if (Datas.type == "login") {
                ToLogin();
            }
            if (Datas.type == "error") {
                Toast.fire({
                    icon: 'error',
                    title: Datas.msg
                });
                window.location = Origin + `Workspace`;
            }

            let code = ``;
            console.log(Datas);
            $.each(Datas.data, function (k, v) {
                code += `
                    <div class="col-lg-3 col-6" data-type="board" board-id="${v.Id}" style="cursor:pointer">
                        <div class="small-box small-box2" style="background:${v.Background}">
                            <div class="inner">
                                <h5 class="b-name fw-bold text-white">${v.Name}</h5>
                            </div>
                        </div>
                    </div>
                `;
            });

            $(`[board-new]`).before(code);
        },

        Error: function (x, e) {
            alert("Some error");
            //loading(false);
        }
    });
}

$(document).on('click', '[board-id]', (e) => {
    let header = $(e.target).closest(`[board-id]`);
    let id = header.attr("board-id");

    window.location = Origin + `Board/${id}`;
});

function CreateBoard() {
    let formData = new FormData();

    formData.append("me.Mail", User.Username);
    formData.append("me.Password", User.Password);
    formData.append("workspace.Id", WorkspaceId);
    formData.append("board.Name", $("#board-name").val());
    formData.append("board.Background", $("#b-color").attr('data-color'));

    $.ajax({
        type: "POST",
        url: "../Board/Create",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        async: true,

        success: function (result) {
            let Datas = JSON.parse(result);
            console.log(Datas);
            if (Datas.type == "login") {
                ToLogin();
            }
            if (Datas.type == "error") {
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