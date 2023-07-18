let User;
let Origin;
const wcon = new signalR.HubConnectionBuilder()
    .withUrl("/signalrserver")
    .withAutomaticReconnect()
    .build();

async function wstart() {
    try {
        await wcon.start();
        console.assert(wcon.state === signalR.HubConnectionState.Connected);
        console.log("Client Connected.");
    } catch (err) {
        console.assert(wcon.state === signalR.HubConnectionState.Disconnected);
        console.log(err);
        setTimeout(() => start(), 5000);
    }
};

User = JSON.parse(sessionStorage.getItem("userTrello"));
if (User == null || User === "undefined") window.location = "../";

Origin = User.Origin;

function ToLogin() {
    sessionStorage.setItem("user", null);
    window.location = Origin;
}

//WebSocket
$(document).ready(() => {
    wstart();

    $('.my-colorpicker').colorpicker();
    let col1 = $("#w-color1").val();
    let col2 = $("#w-color2").val();
    $(`[data-colorpicker-id="1"] .fa-square`).css('color', col1);
    $(`[data-colorpicker-id="2"] .fa-square`).css('color', col2);
    
    $("#w-color").css('background', `linear-gradient(-45deg, ${col1}, ${col2})`);
    $("#w-color").attr("data-color", `linear-gradient(-45deg, ${col1}, ${col2})`);

    wcon.on("CreateWorkspace", function (code) {
        $(`[workspace-new]`).before(code);

        Toast.fire({
            icon: 'info',
            title: `L'éspace de travail : "${name}" à été ajouter`
        });
    });

    wcon.onreconnecting(error => {
        console.assert(wcon.state === signalR.HubConnectionState.Reconnecting);

        document.getElementById("messageInput").disabled = true;

        const li = document.createElement("li");
        li.textContent = `Connection lost due to error "${error}". Reconnecting.`;
        document.getElementById("messageList").appendChild(li);
    });

    wcon.onreconnected(connectionId => {
        console.assert(wcon.state === signalR.HubConnectionState.Connected);

        document.getElementById("messageInput").disabled = false;

        const li = document.createElement("li");
        li.textContent = `Connection reestablished. Connected with connectionId "${connectionId}".`;
        document.getElementById("messageList").appendChild(li);
    });
});

//Web
$(document).ready(() => {
    GetFavoris();
});


$(document).on('colorpickerChange', '.my-colorpicker', (e) => {
    let header = $(e.target).closest(`div`);
    header.find(".fa-square").css('color', e.color.toString());
    let col1 = $("#w-color1").val();
    let col2 = $("#w-color2").val();
    $("#w-color").css('background', `linear-gradient(-45deg, ${col1}, ${col2})`);
    $("#w-color").attr("data-color", `linear-gradient(-45deg, ${col1}, ${col2})`);
});


$(document).on('click', '[workspace-create]', (e) => {
    let wname = $("#workspace-name").val();
    let wabbr = $("#workspace-abbr").val();
    let wcolor = $("#w-color").attr('data-color');
    let wdesc = $("#workspace-description").val();
    alert(wcolor);

    if (wname == "") {
        Toast.fire({
            icon: 'error',
            title: "Le nom est obligatoire."
        });
        return;
    }

    let inWorkspace = false;

    if (window.location.href == Origin + "Workspace") {
        inWorkspace = true;
    }

    //Goto Back
    let formData = new FormData();

    formData.append("me.Mail", User.Username);
    formData.append("me.Password", User.Password);
    formData.append("workspace.Name", wname);
    formData.append("workspace.Description", wdesc);
    formData.append("workspace.Abrev", wabbr);
    formData.append("workspace.Background", wcolor);

    $.ajax({
        type: "POST",
        url: Origin + "Workspace/Create",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        async: true,

        success: function (result) {
            Datas = JSON.parse(result);
            if (Datas.type == "login") {
                ToLogin()
            }
            if (Datas.type == "error") {
                Toast.fire({
                    icon: 'error',
                    title: Datas.msg
                });
                return;
            }

            Toast.fire({
                icon: 'success',
                title: `Création de l'éspace de travail :"${wname}" Réussi`
            });


            if (inWorkspace) {
                $(`[workspace-new]`).before(CreateWBox(Datas.data, wname, wcolor));
            }

            wcon.invoke("CreateWorkspace", Datas.data, wname, wcolor);
        },

        Error: function (x, e) {
            Toast.fire({
                icon: 'error',
                title: e
            });
        }
    });
});



//#region Favoris
function GetFavoris() {
    let formData = new FormData();

    formData.append("me.Mail", User.Username);
    formData.append("me.Password", User.Password);

    $.ajax({
        type: "POST",
        url: Origin + "Board/GetFavoris",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        async: true,

        success: function (result) {
            let Datas = JSON.parse(result);
            if (Datas.type == "login") {
                ToLogin();
            }
            if (Datas.type == "error") {
                Toast.fire({
                    icon: 'error',
                    title: Datas.msg
                });
                return;
            }
            Datas = JSON.parse(result);
            console.log(Datas);

            let code = ``;
            $.each(Datas.data, function (k, v) {
                code += `
                    <li class="nav-item" board-menu-id="${v.Id}">
                        <div class="nav-link">
                            <i class="nav-icon minibox" style="background:${v.Background}">${v.Letter}</i>
                            <p>
                                ${v.Name}
                            </p>
                        </div>
                    </li>
                `;
            });

            $('[board-menu-list]').after(code);
        },

        Error: function (x, e) {
            Toast.fire({
                icon: 'error',
                title: e
            });
        }
    });
}

$(document).on('click', '[board-menu-id]', (e) => {
    let header = $(e.target).closest(`[board-menu-id]`);
    let id = header.attr("board-menu-id");

    window.location = Origin + `Board/${id}`;
});

//#endregion